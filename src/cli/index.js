import fs from 'fs'
import program from 'commander'
import vfile from 'to-vfile'
import pkg from '../../package.json'

import {NoOp, Identity, AsInt} from '../utils/functions'

import {parse, stringify} from '../parser/index'
import {renderToVfileDoc} from '../renderer/index'
import {log, time, timeEnd, info, warn, dir, level, error} from '../utils/console'

import {generate} from './generate'

function betterDescription({usage, description, examples}) {
    let prefix
    if (usage && description) prefix = `${usage}\n\n${description}`
  
    if (!examples) return prefix
    
    prefix = `${prefix}\n\nExample${examples.length > 1 ? 's' : ''}:\n`
  
    if (typeof examples === 'string') return `${prefix}${examples}`
    else if (examples.length && typeof examples[0] === 'string') return `${prefix}${examples.join('\n')}`
    else if (examples.length && typeof examples[0].length) return `${prefix}${examples.map( eg => `${eg[0]}\n${eg[1]}`).join('\n\n')}`
}

program
    .storeOptionsAsProperties(true)
    .passCommandToAction(true)
    .name(pkg.name)
    .version(pkg.version, '-V, --version', 'Output version information')
    .usage(betterDescription({
        usage: "[global options] command",
        description: "Literate programming ...",
        examples: ["lit notebook --open"]
    }))
    .option('-d, --debug <level>', 'Output debugging information', Identity, "")
    .helpOption('-h, --help', 'Output usage information')

program
    .command('generate <path>')
    .description('Generate output for all .lit files in a folder')
    .usage(betterDescription({
        usage: "[options] <path>",
        examples: ["lit generate ./my-notes/ "]
    }))
    .option('-i, --interactive', 'Interactive html')
    .option('-p, --prettify', 'Prettify the output')
    .option('-t, --tags <taglist>', 'Only include documents with tags')
    .option('-o, --output <path>', 'Output location')
    .option('-b, --base <path>', 'Base path (output prefix)')
    .option('-w, --watch', 'Watch for changes and regenerate')
    .option('-g, --github-token <token>', 'GitHub Token')
    .option('-u, --github-user <username>', 'GitHub Username')
    .option('-r, --github-repo <repository-name>', 'GitHub Repository name')
    .action((path, cmd)=>{
        cmd.cwd = process.cwd()
        cmd.path = path
        cmd.debug = program.debug
        console.log("[cli] cmd: generate", path, cmd.base, cmd.cwd, cmd.debug, cmd.output)
        process.env.DEBUG = cmd.debug
        generate(cmd)
    })

program.parse(process.argv)    
