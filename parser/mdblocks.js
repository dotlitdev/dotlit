import visit from 'unist-util-visit'
import {getConsoleForNamespace} from '../utils/console'
import vfile from 'vfile'

const console = getConsoleForNamespace('mdblocks')

export const mdblocks = function ({baseProcessor, files, litroot}) {
    return async (tree, file) => {
        file.data = file.data || {}
        file.data.__mdcodeblocks = 0
        const promises = [];
        visit(tree, 'code', (node,index,parent) => {
            if (!node.data || !node.data.meta || node.data.meta.lang !== 'md') return;

            const idx = file.data.__mdcodeblocks++
            // instead of await (why?)
            const p = new Promise(async resolve => {
                // console.log(idx + "Node: ", node)
                const mdfile = vfile({path: file.data.canonical, value: node.value})
                const p = baseProcessor({files, litroot})
                const parsed = await p.parse( mdfile )
                const ast = await p.run(parsed, mdfile)
                console.log(idx + "MD AST: ", ast)
                node.children = ast.children
                resolve()
            });
           
            promises.push(p)
        });
        await Promise.all(promises);
        return null
    }
}
