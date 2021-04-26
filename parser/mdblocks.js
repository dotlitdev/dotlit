
import visit from 'unist-util-visit'
import {getConsoleForNamespace} from '../utils/console'

const console = getConsoleForNamespace('mdblocks')

export const mdblocks = function ({baseProcessor}) {
    return async (tree, file) => {
        file.data = file.data || {}
        file.data.__mdcodeblocks = 0
        const promises = [];
        visit(tree, 'code', (node,index,parent) => {
            if (!node.data || !node.data.meta || node.data.meta.lang !== 'md') return;

            const idx = file.data.__mdcodeblocks++
            // instead of await
            const p = new Promise(async resolve => {
                 console.log(idx + "Node: ", node)
                 const p = baseProcessor()
                 const parsed = await p.parse( node.value )
                 const ast = await p.run(parsed)
                 console.log(idx + " AST: ", ast)
                 node.children = ast.children
                 resolve()
            });
           
            promises.push(p)
        });
        await Promise.all(promises);
        return null
    }
}