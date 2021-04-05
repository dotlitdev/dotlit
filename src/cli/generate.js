import vfile from 'to-vfile'
import watch from 'glob-watcher'
import glob from 'glob'
import mkdirp from 'mkdirp'
import path from 'path'
import {promises as fs} from 'fs'
import  {selectAll} from 'unist-util-select'

import {NoOp} from '../utils/functions'
import {log, time, timeEnd, info, warn, dir, level, error} from '../utils/console'

import {parse, stringify} from '../parser/index'
import {renderedVFileToDoc, processor as renderProcessor} from '../renderer/index'
import { diffieHellman } from 'crypto'
import { decorateLinkNode } from '../parser/links'

import { getConsoleForNamespace } from '../utils/console'
import { Identity } from '../utils/functions'

const console = getConsoleForNamespace('generate')

global.fetch = require("node-fetch")

function getLinks(file, root) {
    return selectAll('link, wikiLink', file.data.ast)
}

function generateBacklinks(files, root) {
    let manifest = {}
    console.log(`[Backlinks] for (${files.length}) files, in ${root}`)
    files.forEach( file => {
        const links = getLinks(file, root)
        const fileLink = decorateLinkNode({ url: file.path })

        console.log(`[Manifest] Adding "${file.path}" as "${fileLink.data.canonical}"`)
        manifest[fileLink.data.canonical] = manifest[fileLink.data.canonical] || { backlinks: [] }
        manifest[fileLink.data.canonical].exists = true
        // console.log('fileLink', fileLink)
        console.log(`[Backlinks] ${file.path} ${fileLink.data.canonical} ${fileLink.url} links: (${links.length})`)
        links.forEach( link => {
            // console.log(link)
            console.log(`[Backlinks] ${link.type} >> ${link.url} >> ${link.data.canonical} relative: ${link.data.isRelative}`)
            const linkNode = {
                url: fileLink.url,
                title: file.data.frontmatter.title || `Title TBD (${fileLink.data.canonical})`,
            }
            if (link.data.isRelative) {
                if (manifest[link.data.canonical] && manifest[link.data.canonical].backlinks) {
                    manifest[link.data.canonical].backlinks.push(linkNode)
                } else {
                    console.log(`[Manifest] Adding "${link.data.canonical}"`)
                    manifest[link.data.canonical] = { backlinks: [linkNode], exists: false }
                }
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

export function generate(cmd) {
    const globAll = `**/*.*`
    const ignore = cmd.ignore || '+(**/node_modules/*|**/.git/*)'
    const matchRegex = /\.(lit|md)(\.(md|lit))?$/

    console.log(`Generating from path: ${cmd.path} (${globAll})`)
    console.log(`Output path: ${cmd.output} cwd: ${cmd.cwd}`)
    
    function processFilesystem(done) {
        time('generate')

        glob(globAll, {cwd: `${cmd.path}/`, ignore}, async (err, matches) => {
            if (err) error(err)
            else {
                try {
                const copied = await Promise.all( matches.map( async filepath => {
                    const src = path.join(cmd.path, filepath)
                    const dest = path.join(cmd.output, filepath)
                    await mkdirp(path.dirname(dest))
                    const stat = await fs.stat(src);
                    await fs.copyFile(src, dest)
                    await fs.utimes(dest, stat.atime, stat.mtime)
                }))

                console.log(`Copied ${copied.length} file(s) from source.`)

                const litFiles = matches.filter( (f) => f.match(matchRegex))
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
                        const renderedFile = await renderProcessor(fs).process(fetchedFile)
                        return renderedFile
                    } catch (err) {
                        console.error(`Failed to process ${file.path}`, err)
                    }
                }))
                const [ast_files, manifest] = generateBacklinks(ast_files_prelinks, cmd.output)
                const html_files = await Promise.all(ast_files.map( async file => {
                    try {
                        await fs.writeFile(path.join(cmd.output, file.path + '.json'), JSON.stringify(file.data.ast, null, 4))
                        const html_file = await renderedVFileToDoc(await file, cmd)
                        await fs.writeFile(path.join(cmd.output, file.path), file.contents)
                        console.log(`Wrote  ${file.path} to "${path.join(cmd.output, file.path)}" to disk`)

                        for (const codefile of html_file.data.files) {
                            const filename = codefile.data && codefile.data.meta && codefile.data.meta.filename
                            if (filename) {
                                const filepath = path.join(cmd.output, path.dirname(file.path), filename)
                                await fs.writeFile(filepath, codefile.value)
                                console.log(`Wrote codefile ${filename} to "${filepath}" on disk`)
                            }
                        }
                        return html_file;
                    } catch (err) { console.error(`Failed to process ${file.path}`, err) }
                }))
                
                await fs.writeFile(path.join(cmd.output, 'manifest.json'), JSON.stringify(manifest, null, 4))
                console.log(`Wrote ${html_files.filter(Identity).length}/${html_files.length} .lit file(s) to disk`)

                await fs.copyFile( path.join(__dirname,'../../dist/web.bundle.js'), path.join(cmd.output, 'web.bundle.js'))
                await fs.copyFile( path.join(__dirname,'../../dist/web.bundle.js.map'), path.join(cmd.output, 'web.bundle.js.map'))
                await fs.copyFile( path.join(__dirname,'../../dist/style.css'), path.join(cmd.output, 'style.css'))

                timeEnd('generate')

               } catch(err) {
                  error(err)
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
