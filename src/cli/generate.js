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

// import { createServer } from 'http-server'

const console = getConsoleForNamespace('generate')
global.fetch = require("node-fetch")

const copyFiles = async (fs, filepaths, input, output) => await Promise.all( filepaths.map( async filepath => {
                    const src = path.join(input, filepath)
                    const dest = path.join(output, filepath)
                    await mkdirp(path.dirname(dest))
                    const stat = await fs.stat(src);
                    await fs.copyFile(src, dest)
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
    console.log(`For (${files.length}) files, in ${root}`)
    files.forEach( file => {
        const fileLink = decorateLinkNode({ url: file.path })
        const title = file.data.frontmatter.title || `Title TBD (${fileLink.data.canonical})`
        console.log(`[${title}] Adding "${file.path}" as "${fileLink.data.canonical} to manifest."`)
        manifest[fileLink.data.canonical] = manifest[fileLink.data.canonical] || {
            backlinks: [],
            exists: true,
            title: title
        }
    })
    files.forEach( file => {
        
        const fileLink = decorateLinkNode({ url: file.path })
        const title = file.data.frontmatter.title || path.basename(file.path, path.extname(file.path))
        console.log(`About to get links for file: ${title} (${file.path})`)
        
        const links = getLinks(file, root)
        // console.log('fileLink', fileLink)
        console.log(`[${title}] ${fileLink.data.canonical} links: (${links.length})`)
        links.forEach( (link, i) => {
            // console.log(link)
            // console.log(`[Backlinks] ${link.type} >> ${link.url} >> ${link.data.canonical} relative: ${link.data.isRelative}`)
            const linkNode = {
                id: fileLink.data.canonical,
                url: fileLink.url,
                title: title,
            }
            if (link.data.isRelative || link.data.isCode) {
                if (manifest[link.data.canonical] && manifest[link.data.canonical].backlinks) {
                    console.log(`[${title}][${i}] Adding link ${fileLink.data.canonical} to existing "${link.data.canonical}"`)
                    manifest[link.data.canonical].backlinks.push(linkNode)
                } else {
                    console.log(`[${title}][${i}] Adding link ${fileLink.data.canonical} to "${link.data.canonical}"`)
                    manifest[link.data.canonical] = {
                        backlinks: [linkNode], 
                        exists: link.exists || false,
                        type: link.type
                    }
                }
            } else {
                console.log(`[${title}][${i}] Other:`, link.data.canonical)
            }
        })
    })

    return [files.map( (file, index) => {
            file.data = file.data || {}
            // console.log(file.path, index, manifest[file.path])
            file.data.backlinks = manifest[file.path].backlinks
            return file
        }), manifest]
}

export function server(cmd) {
    // return createServer({
    //     root: cmd.output,
    //     showDotfiles: false,
    // })
}

export function generate(cmd) {
    const globAll = `**/*.*`
    const ignore = cmd.ignore || '+(**/node_modules/*|**/.git/*)'
    const matchRegex = /\.(lit|md)(\.(md|lit))?$/

    console.log(`Generating from path: ${cmd.path} (${globAll})`)
    console.log(`Output path: ${cmd.output} cwd: ${cmd.cwd}`)
    console.log(path.resolve(cmd.output))
    const fs = extendFs(fsPromises, path.resolve(cmd.output) + '/', null, true)
    
    function processFilesystem(done) {
        console.time('generate')

        glob(globAll, {cwd: `${cmd.path}/`, ignore}, async (err, matches) => {
            if (err) error(err)
            else {
                const litFiles = matches.filter( (f) => f.match(matchRegex))
                const nonLitFiles = matches.filter( (f) => !f.match(matchRegex))

                try {

                const copied = await copyFiles(fs, nonLitFiles, cmd.path, cmd.output)
                console.log(`Copied ${copied.length} file(s) from source.`)

          
                console.log(`Detected ${litFiles.length} .lit file(s) ${matches.length} total.`)

                const src_files = litFiles.map( async filepath => {
                    return vfile.read({
                        path: filepath,
                        cwd: cmd.path
                    })
                })

                let ast_files_prelinks = await Promise.all(src_files.map( async file => {
                    try {
                        const fetchedFile = await file
                       
                        const renderedFile = await renderProcessor({fs}).process(fetchedFile)
                       
                        return renderedFile
                    } catch (err) {
                        console.error(`Failed to process ${file.path}`, err)
                    }
                }))
                const [ast_files, manifest] = generateBacklinks(ast_files_prelinks, cmd.output)
                const html_files = await Promise.all(ast_files.map( async file => {
                    try {
                        if(file?.data?.frontmatter?.private) {
                            file.contents = `# 🔐 Private File

<!-- data
private: true
-->

The contents of this file are private. Only visible by the author.

`
                           file = await renderProcessor({fs}).process(file)

                        }
                        // await mkdirp(path.join(cmd.output,path.dirname(file.path)))
                        await fs.writeFile(file.path, file.contents)
                        await fs.writeFile(file.path + '.json', JSON.stringify(file.data.ast, null, 4))
                        const html_file = await renderedVFileToDoc(await file, cmd)
                        await fs.writeFile(file.path, file.contents)
                        console.log(`Wrote ${file.path} to "${path.join(cmd.output, file.path)}" to disk`)

                        for (const codefile of html_file.data.files) {
                            const filename = codefile?.data?.meta?.filename
                            const hasValue = !!codefile.value
                            if (filename && hasValue) {
                                const filepath = path.join(path.dirname(file.path), filename)
                                console.log("Writing codefile to path: ", filepath, hasValue)
                                await fs.writeFile(filepath, codefile.value)
                                console.log(`Wrote codefile ${filename} to "${filepath}" on disk`)
                            }
                        }
                        return html_file;
                    } catch (err) { 
                        console.error(`Failed to process ${file.path}`, err) 
                        file.contents = `# ⚠️ Failed to process file
File: ${file.path}
    ${err.toString()}
`
                        file = await renderProcessor({fs}).process(file)
                        // await mkdirp(path.join(cmd.output,path.dirname(file.path)))
                        await fs.writeFile(file.path, file.contents)
                        await fs.writeFile(file.path + '.json', JSON.stringify(file.data.ast, null, 4))
                        const html_file = await renderedVFileToDoc(await file, cmd)
                        await fs.writeFile(file.path, file.contents)
                        console.log(`Wrote  ${file.path} to "${path.join(cmd.output, file.path)}" to disk`)
                        return html_file
                    }
                }))

                const graph = {nodes: [], links: []}
                Object.keys(manifest).forEach( key => {
                    const node = manifest[key]
                    graph.nodes.push({ id: key, ...node})
                    node.backlinks.forEach( link => {
                       graph.links.push({source: link.id, target: key})
                    })
                })
                
                await fs.writeFile('manifest.json', JSON.stringify(graph, null, 4))
                console.log(`Wrote ${html_files.filter(Identity).length}/${html_files.length} .lit file(s) to disk`)

                if (global.litenv) {
                    await fs.copyFile( path.join(__dirname,'./web.bundle.js'), path.join(cmd.output, 'web.bundle.js'))
                    await fs.copyFile( path.join(__dirname,'./style.css'), path.join(cmd.output, 'style.css'))
                } else {
                    await fs.copyFile( path.join(__dirname,'../../dist/web.bundle.js'), path.join(cmd.output, 'web.bundle.js'))
                    await fs.copyFile( path.join(__dirname,'../../dist/web.bundle.js.map'), path.join(cmd.output, 'web.bundle.js.map'))
                    await fs.copyFile( path.join(__dirname,'../../dist/style.css'), path.join(cmd.output, 'style.css'))
                }
                console.timeEnd('generate')

               } catch(err) {
                  console.error(err)
                  process.exit(1)
               }
            }
        })
    }

    processFilesystem(NoOp)

    if (cmd.watch) {
        console.log(`Watching "${cmd.path}" for changes...`)
        watch([`${cmd.path}/${globAll}`], function(done){
            console.log(`Change detected in "${cmd.path}".`)
            processFilesystem(done)
        })
    }
}
