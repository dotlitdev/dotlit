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
import {renderToVfile} from '../renderer/index'
import { diffieHellman } from 'crypto'
import { decorateLinkNode } from '../parser/links'

function getLinks(file, root) {
    return selectAll('link, wikiLink', file.data.ast)
}

function generateBacklinks(files, root) {
    let manifest = {}
    level(0, info)(`[Backlinks] for (${files.length}) files, in ${root}`)
    return [files.map( file => {
        const links = getLinks(file, root)
        const fileLink = decorateLinkNode({
                        url: file.path
                    })
        manifest[fileLink.data.canonical] = { backlinks: [] }
        level(1, info)(`[Backlinks] ${file.path} ${fileLink.data.canonical} ${fileLink.url} links: (${links.length})`)
        links.map( link => {
            level(2, info)(`[Backlinks] ${link.type} >> ${link.url} >> ${link.data.canonical} `)
            const linkNode = {
                url: fileLink.url,
                title: "tbd",
            }
            if (link.data.isRelative) {
                if (manifest[link.data.canonical] && manifest[link.data.canonical].backlinks) {
                    manifest[link.data.canonical].backlinks.push(linkNode)
                } else {
                    manifest[link.data.canonical] = { backlinks: [linkNode] }
                }
            }
        })
        files.forEach( (file, index) => {
            file.data.backlinks = manifest[file.path].backlinks
        })
        return file
    }),manifest]
}

export function generate(cmd) {
    const globAll = `**/*.*`
    const ignore = cmd.ignore || '+(**/node_modules/*|**/.git/*)'
    const matchRegex = /\.(lit|md)(\.(md|lit))?$/

    level(0, info)(`Generating from path: ${cmd.path} (${globAll})`)
    level(0, info)(`Output path: ${cmd.output} cwd: ${cmd.cwd}`)
    
    function process(done) {
        time('generate')

        glob(globAll, {cwd: `${cmd.path}/`, ignore}, async (err, matches) => {
            if (err) error(err)
            else {

                const copied = await Promise.all( matches.map( async filepath => {
                    const src = path.join(cmd.path, filepath)
                    const dest = path.join(cmd.output, filepath)
                    await mkdirp(path.dirname(dest))
                    const stat = await fs.stat(src);
                    await fs.copyFile(src, dest)
                    await fs.utimes(dest, stat.atime, stat.mtime)
                }))

                level(0, info)(`Copied ${copied.length} file(s) from source.`)

                const litFiles = matches.filter( (f) => f.match(matchRegex))
                level(0, info)(`Detected ${litFiles.length} .lit file(s) ${matches.length} total.`)

                const src_files = litFiles.map( async filepath => {
                    return vfile.read({
                        path: filepath,
                        cwd: cmd.path
                    })
                })

                let ast_files_prelinks = await Promise.all(src_files.map( async file => parse(await file, {
                    files: litFiles
                })))
                const [ast_files, manifest] = generateBacklinks(ast_files_prelinks, cmd.output)

                const html_files = await Promise.all(ast_files.map( async file => {
                    await fs.writeFile(path.join(cmd.output, file.path + '.json'), JSON.stringify(file.data.ast, null, 4))
                    const html_file = renderToVfile(await file, cmd, file.data.backlinks)
                    await fs.writeFile(path.join(cmd.output, file.path), file.contents)
                    level(0, info)(`Wrote  ${file.path} to "${path.join(cmd.output, file.path)}" to disk`)
                    return html_file;
                }))
                
                await fs.writeFile(path.join(cmd.output, 'manifest.json'), JSON.stringify(manifest, null, 4))
                level(0, info)(`Wrote ${html_files.length} file(s) to disk`)

                await fs.copyFile( path.join(__dirname,'../../dist/web.bundle.js'), path.join(cmd.output, 'web.bundle.js'))
                await fs.copyFile( path.join(__dirname,'../../dist/web.bundle.js.map'), path.join(cmd.output, 'web.bundle.js.map'))
                await fs.copyFile( path.join(__dirname,'../../dist/style.css'), path.join(cmd.output, 'style.css'))

                timeEnd('generate')
            }
        })
    }

    process(NoOp)

    if (cmd.watch) {
        level( 0, log)(`Watching "${cmd.path}" for changes...`)
        watch([`${cmd.path}/${globAll}`], function(done){
            level( 1, info)(`Change detected in "${cmd.path}".`)
            process(done)
        })
    }
}
