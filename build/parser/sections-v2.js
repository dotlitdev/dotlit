import visit from 'unist-util-visit'


export default function (...args) {

    const visitorTest = (node, index, parent) => parent && parent.type === 'root'

    return (tree, file) => {
        console.log("SECTIONS V2")
        visit(tree, visitorTest, transform)
    }

    function transform(node, index, parent) {
        console.log("SECTIONS V2 TRANSFORM", index)
        console.log(parent && parent.type, index, node.type, node.children && node.children.length)
        node.children = []
    }
}