import vfile from 'to-vfile'
import watch from 'glob-watcher'
import glob from 'glob'
import mkdirp from 'mkdirp'
import path from 'path'
import {promises as fsPromises} from 'fs'
import {selectAll} from 'unist-util-select'


import {NoOp} from '../utils/functions'

import { extendFs } from '../utils/fs-promises-utils'

import {parse, stringify} from '../parser/index'
import {renderedVFileToDoc, processor as renderProcessor} from '../renderer/index'
import { diffieHellman } from 'crypto'
import { decorateLinkNode } from '../parser/links'

import { getConsoleForNamespace } from '../utils/console'
import { Identity } from '../utils/functions'
import { copyRecursive } from '../utils/fs-copy'

const console = getConsoleForNamespace('generate')

global.fetch = require("node-fetch")
const {CompactPrefixTree} = require('compact-prefix-tree/cjs')

const copyFiles = async (fs, filepaths, input, output) => await Promise.all( filepaths.map( async filepath => {
                    const src = path.join(input, filepath)
                    if (src.startsWith('.git/')) return;
                    if (src.indexOf('git') >= 0) console.log("git file detected:",src)
                    const dest = path.join(output, filepath)
                    await mkdirp(path.dirname(dest))
                    const stat = await fs.stat(src);
                    if (stat.isDirectory()) return;
                    await fs.copyFile(src, dest);
                    await fs.utimes(dest, stat.atime, stat.mtime)
                }))


function getLinks(file, root) {
    const links = []
    if (file && file.data && file.data.ast) {
        selectAll('link, wikiLink', file.data.ast).forEach( link => {
            links.push(link)
        })
    }
    if (file && file.data && file.data.files) {
        file.data.files.forEach( codeblock => {
           if (codeblock
                && codeblock.data 
                && codeblock.data.meta) {
            const meta = codeblock.data.meta
            let type, url;
            if (meta.filename){
               type = 'source'
               url = meta.filename
            }
            if (meta.source 
                && meta.source.filename){
               type = 'transclude'
               url = path.join(path.dirname(file.path), meta.source.filename)
            }

            if (type) links.push({
                    type,
                    exists: true,
                    url,
                    data: {
                        isCode: true,
                        canonical: url
                    }
                })
          }
        })
    }
    
    return links
}

function generateBacklinks(files, root) {

    const console = getConsoleForNamespace('Backlinks')
    let manifest = {}
    let meta = {}
    console.log(`For (${files.length}) files, in ${root}`)
    meta.totalSourceFiles = files.length
    files = files.filter(Identity)
    const file_paths = files.map( f=>'/' + f.path)

    meta.totalUsableSourceFiles = files.length
    console.log(`Only (${files.length}) files, actually usable`)
    meta.failures = {}
    
    files.forEach( file => {
        const canonical = path.join('/', file.path)
        if (!file) { console.error('Cannot get links for file.'); return;}
        try {
            const fileLink = decorateLinkNode({ url: canonical }, '/', '', file_paths)
            const title = file?.data?.frontmatter?.title || `Title TBD (${fileLink.data.canonical})`
            console.log(`[${title}] Adding "${file.path}" as "${fileLink.data.canonical} to manifest."`)
            const links = getLinks(file, root)
            manifest[fileLink.data.canonical] = manifest[fileLink.data.canonical] || {
                backlinks: [],
                url: fileLink.url,
                exists: true,
                title: title,
                links: links.length,
                size: file.contents.toString().length,
            }
        } catch(err) {
            meta.failures[file.path] = meta.failures[file.path] || []
            meta.failures[file.path].push("genBackLinks1: " + err.message)
        }
    })
    files.forEach( file => {
        if (!file) return
        try {
            const canonical = path.join('/', file.path)
            const fileLink = decorateLinkNode({ url: canonical }, '/', '', file_paths)
            const title = file?.data?.frontmatter?.title || path.basename(file.path, path.extname(file.path))
            console.log(`About to get links for file: ${title} (${file.path})`)
            
            const links = getLinks(file, root)
            // console.log('fileLink', fileLink)
            console.log(`[${title}] ${fileLink.data.canonical} links: (${links.length})`)
            links.forEach( (link, i) => {
                // console.log(link)
                // console.log(`[Backlinks] ${link.type} >> ${link.url} >> ${link.data.canonical} relative: ${link.data.relative}`)
                const linkNode = {
                    id: fileLink.data.canonical,
                    url: fileLink.url,
                    title: title,
                }
                if (link.data.relative || link.data.absolute || link.data.isCode) {
                    if (manifest[link.data.canonical] && manifest[link.data.canonical].backlinks) {
                        console.log(`[${title}][${i}] Adding link ${fileLink.data.canonical} to existing "${link.data.canonical}"`)
                        manifest[link.data.canonical].backlinks.push(linkNode)
                    } else {
                        console.log(`[${title}][${i}] Adding link ${fileLink.data.canonical} to "${link.data.canonical}"`)
                        manifest[link.data.canonical] = {
                            backlinks: [linkNode], 
                            url: link.url,
                            exists: link.exists || false,
                            type: link.type
                        }
                    }
                } else {
                    console.log(`[${title}][${i}] Other:`, link.data.canonical)
                }
            })
        } catch(err) {
            meta.failures[file.path] = meta.failures[file.path] || []
            meta.failures[file.path].push("genBackLinks2: " + err.message)
        }
    })

    return [files.map( (file, index) => {
            file.data = file.data || {}
            console.log(file.path, index, file.data.canonical, manifest[file.data.canonical])
            file.data.backlinks = manifest[file.data.canonical].backlinks
            return file
        }), manifest, meta]
}

export function generate(cmd, cb = NoOp) {
    const globAll = `**/*`
    const ignore = cmd.ignore || '+(**/node_modules/*|**/.git/*)'
    const matchRegex = /\.(lit|md)(\.(md|lit))?$/

    const SOURCE = path.resolve(cmd.cwd, cmd.path);
    const OUTPUT = path.resolve(cmd.cwd, cmd.output);

    console.log(`Generating from source path: ${cmd.path} (${globAll}) resolved: ${SOURCE}`)
    console.log(`Output path: ${cmd.output} cwd: ${cmd.cwd} resolved: ${OUTPUT}`)
    const fs = extendFs(fsPromises, OUTPUT + '/', null, true)

    
    
    function processFilesystem(done) {
        console.time('generate')

        glob(globAll, {cwd: SOURCE, ignore, dot: true}, async (err, matches) => {
            if (err) error(err)
            else {
                const litFiles = matches.filter( (f) => f.match(matchRegex))
                const nonLitFiles = matches.filter( (f) => !f.match(matchRegex))

                const prefixTrie = new CompactPrefixTree(matches)
                fs.writeFile('compactManifest.json', JSON.stringify(prefixTrie.T))

                try {

                    const copied = await copyFiles(fs, nonLitFiles, SOURCE, OUTPUT)
                    console.log(`Copied ${copied.length} file(s) from source.`)

            
                    console.log(`Detected ${litFiles.length} .lit file(s) ${matches.length} total.`)
                    const failures = {}

                    const src_files = await Promise.all(litFiles.map( async filepath => {
                        console.log(filepath, SOURCE)
                        try {
                            const source = await vfile.read({
                                path: filepath,
                                cwd: SOURCE
                            })
                            source.data = {canonical: path.join('/', source.path)}
                            console.log(source)
                            return source
                        } catch(err) {
                            failures[filepath] = failures[filepath] || []
                            failures[filepath].push("Failed read source due to: " + err.message)
                        }
                    }))

                    let ast_files_prelinks = await Promise.all(src_files.map( async file => {
                        let wroteSource;
                        try {
                            console.log(file)
                            await fs.writeFile(file.path, file.contents)
                            wroteSource = true
                            return await renderProcessor({fs, cwd: SOURCE, files: matches.map(x=>'/'+x)}).process(file)
                        
                        } catch (err) {
                            console.error(err)
                            failures[file.path] = failures[file.path] || []
                            if (wroteSource) failures[file.path].push("Failed to Process to AST (prelinks) due to: " + err.toString())
                            else failures[file.path].push("Failed to write source file due to: " + err.toString())
                            console.error(`Failed to process ${file.path}`, err)
                        }
                    }))

                    const [ast_files, manifest, meta] = generateBacklinks(ast_files_prelinks, cmd.output)

                    const html_files = await Promise.all(ast_files.map( async file => {
                        try {
                            if(file?.data?.frontmatter?.private) {
                                file.contents = `# 🔐 Private File

    <!-- data
    private: true
    -->

    The contents of this file are private. Only visible by the author.

    `
                                file = await renderProcessor({fs, cwd: SOURCE, files: matches.map(x=>'/'+x)}).process(file)
                            }
                            // await mkdirp(path.join(cmd.output,path.dirname(file.path)))
                            // await fs.writeFile(file.path, file.contents)
                            // await fs.writeFile(file.path + '.json', JSON.stringify(file.data.ast, null, 4))
                            const html_file = await renderedVFileToDoc(await file, cmd)
                            await fs.writeFile(file.path, file.contents)
                            console.log(`Wrote ${file.path} to "${path.join(cmd.output, file.path)}" to disk`)

                            for (const codefile of html_file.data.files) {
                                const filename = codefile?.data?.meta?.filename
                                try {
                                    const hasValue = !!codefile.value
                                    if (filename && hasValue) {
                                        const filepath = path.join(path.dirname(file.path), filename)
                                        console.log("Writing codefile to path: ", filepath, hasValue)
                                        await fs.writeFile(filepath, codefile.value)
                                        console.log(`Wrote codefile ${filename} to "${filepath}" on disk`)
                                    }
                                } catch(err) {
                                    failures[file.path] = failures[file.path] || []
                                    failures[file.path].push(`Failed to extract codefile ${filename} due to: ` + err.message)
                                }
                            }
                            return html_file;
                        } catch (err) {
                            failures[file.path] = failures[file.path] || []
                            failures[file.path].push("Failed to Render to file due to: " + err.message)

                            console.error(`Failed to process ${file.path}`, err) 
                            file.contents = `# ⚠️ Failed to process file
    File: ${file.path}
        ${err.toString()}
    `
                            file = await renderProcessor({fs, cwd: SOURCE}).process(file)
                            // await mkdirp(path.join(cmd.output,path.dirname(file.path)))
                            // await fs.writeFile(file.path, file.contents)
                            // await fs.writeFile(file.path + '.json', JSON.stringify(file.data.ast, null, 4))
                            const html_file = await renderedVFileToDoc(await file, cmd)
                            await fs.writeFile(file.path, file.contents)
                            console.log(`Wrote  ${file.path} to "${path.join(cmd.output, file.path)}" to disk`)
                            return false
                        }
                    }))

                    const graph = {meta, nodes: [], links: []}
                    Object.keys(manifest).forEach( key => {
                        const node = manifest[key]
                        graph.nodes.push({ id: key, ...node})
                        node.backlinks.forEach( link => {
                        graph.links.push({source: link.id, target: key})
                        })
                    })
                    
                    await fs.writeFile('manifest.json', JSON.stringify(graph, null, 4))
                    meta.failures2 = failures 
                    meta.litFiles = litFiles.length
                    meta.nonLitFiles = nonLitFiles.length
                    meta.wroteHtml = html_files.filter(Identity).length
                    await fs.writeFile('meta.json', JSON.stringify(meta, null, 4))
                    console.log(`Wrote ${html_files.filter(Identity).length}/${html_files.length} .lit file(s) to disk`)

                    if (global.litenv) {
                        await fs.copyFile( path.join(__dirname,'./web.bundle.js'), path.join(cmd.output, 'web.bundle.js'))
                        await fs.copyFile( path.join(__dirname,'./style.css'), path.join(cmd.output, 'style.css'))
                        await copyRecursive(path.join(__dirname,'./assets'), path.join(cmd.output, 'assets'))
                    } else {
                        await fs.copyFile( path.join(__dirname,'../../dist/web.bundle.js'), path.join(cmd.output, 'web.bundle.js'))
                        await fs.copyFile( path.join(__dirname,'../../dist/web.bundle.js.map'), path.join(cmd.output, 'web.bundle.js.map'))
                        await fs.copyFile( path.join(__dirname,'../../dist/style.css'), path.join(cmd.output, 'style.css'))
                        await copyRecursive(path.join(__dirname,'../../assets'), path.join(cmd.output, 'assets'))
                    }
                    console.timeEnd('generate')
                    if (done) done()

               } catch(err) {
                  console.error(err)
                  done(err)
                //   process.exit(1)
               }
            }
        })
    }

    

    if (cmd.watch) {
        console.log(`Watching "${cmd.path}" for changes...`)
        processFilesystem(NoOp)
        watch([`${cmd.path}/${globAll}`], function(done){
            console.log(`Change detected in "${cmd.path}".`)
            processFilesystem(done)
        })
        
    } else {
        processFilesystem(cb)
    }
}
