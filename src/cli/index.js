import program from 'commander'
import util from 'util'
import vfile from 'to-vfile'
import pkg from '../../package.json'

import {NoOp, Identity, AsInt} from '../utils/functions'
import {getConsoleForNamespace} from '../utils/console'

import {parse} from '../parser'
import {generate} from './generate'

const console = getConsoleForNamespace('cli')

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
        examples: ["dotlit generate ./my-notes -o ./output"]
    }))
    .option('-d, --debug Mask', 'Output debugging information', Identity, "")
    .helpOption('-h, --help', 'Output usage information')

program
    .command('generate <path>')
    .description('Generate output for all .lit files in a folder')
    .usage(betterDescription({
        usage: "[options] <path>",
        examples: ["dotlit generate ./my-notes/ "]
    }))
    .option('-o, --output <path>', 'Output location')
    .option('-b, --base <path>', 'Base path (output prefix)')
    .option('-w, --watch', 'Watch for changes and regenerate')
    .option('-c, --config <path>', 'Default config to include for all files')
    // .option('-s, --serve', 'Start and http server for output at port', Identity, 8080)
    .action((path, cmd)=>{
        cmd.cwd = process.cwd()
        cmd.path = path
        cmd.debug = program.debug || process.env.DEBUG || "All,-sections,-codeblocks,-Link,-Viewers"
        console.log("cmd: generate", path, cmd.base, cmd.cwd, cmd.debug, cmd.output)
        process.env.DEBUG = cmd.debug
        generate(cmd)
    })

program
    .command('parse <path>')
    .description('Parse a .lit file')
    .usage(betterDescription({
        usage: "[options] <path>",
        examples: ["lit parse ./my-notes/example.lit "]
    }))
    .option('-o, --output <path>', 'Output location')
    .option('-f, --format <ext>', 'Output format')
    .action(async (path, cmd)=>{
        console.time('parse')
        cmd.cwd = process.cwd()
        cmd.path = path
        cmd.debug = program.debug
        const file = await vfile.read(cmd.path)
        console.log("Contents:", file.contents)
        console.log("[cli] cmd: parse", path, cmd.base, cmd.cwd, cmd.debug, cmd.output, cmd.format)
        process.env.DEBUG = 'All,-sections,-codeblocks,-Link,-Viewers'
        const resp = await parse(file, cmd)
        console.log("DONE: ", util.inspect(resp, false, 3, true))
        console.timeEnd('parse')

    })

program.parse(process.argv)    
