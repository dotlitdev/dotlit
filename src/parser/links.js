import {join, resolve, relative, dirname} from "path";
import visit from "unist-util-visit";
import { getConsoleForNamespace } from "../utils/console";

const console = getConsoleForNamespace("links");

export const resolveLinks =
  (options = { litroot: "", filepath: "" }) =>
  (...args) =>
  (tree, file) => {
    console.log("[Links] Init", file.path, options);
    options.filepath = options.filepath || file?.data?.canonical || file.path
    return visit(tree, isLink, transform(options));
  };

export const slug = (str) =>
  str
    .replace(/[^\w\s/-]+/g, "")
    .trim()
    .replace(/\s+/g, "_")
    .toLowerCase();

export const resolver = (str) => {
  // console.log("Input: ", str);
  if (!str) {
    throw Error("No string to resolve")
    process.exit(1)
  }
  let main, title, doc, hash, base, query, file, ext, _
  try {
    [main, title] = str.split("|");
    [doc, hash] = main.split("#");
    [base, query] = doc.split("?");
    [_, file, ext = ''] = base.match(/([^\.]+)(\.[a-zA-Z0-9]+)?$/) || []
  } catch(err) {
    console.log({str, main, title, doc, hash, base, query, file, ext, _})
    console.log('<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<', err)
    process.exit(1)
  }
  
 
  const root = file && file[0] && ['/', '.'].indexOf(file[0]) >= 0 ? '' : '/'
  const path = file && (root + slug(file))
  const section = hash && slug(hash);

  const href = path + (query ? "?" + query : "") + (hash ? "#" + section : "");
  // console.log('Href: ', href)
  return { title, path, ext, hash, query, section, href };
};


const isLink = (node) => ["link", "wikiLink"].indexOf(node.type) >= 0;

const transform = (options) => (node, index, parent) => {
  return decorateLinkNode(node, options.litroot, options.filepath);
};

export const wikiLinkOptions = (files = []) => {
  return {
    pageResolver: (name) => {
      const {path, ext} = resolver(name)
      const exts = ['.lit', '/index.lit', '.md', ext]
      const opts = exts.map( ext => {
        return `${path}${ext}`
      })
      return opts.filter(file => files.indexOf(file) >= 0)[0] || opts
    }
  }
};
// ({
//     permalinks: files,
//     pageResolver: nameToPermalinks,
//     hrefTemplate: (permalink) => `${permalink}?file=${permalink}`
// })

const linkToUrl = (link, root) => {
  if (link.type === "wikiLink") {
    // console.log(link)
    return link.data.permalink
  } else {
    return link.url;
  }
};

export const decorateLinkNode = (link, root = "", filepath = "") => {
  // console.log(link)
  const wikilink = link.type === "wikiLink";
  const url = linkToUrl(link, root);

  
  const isExternal = /^(https?\:)?\/\//.test(url);
  const isAbsolute = !isExternal && /^\//.test(url);
  const isFragment = /^(\?|#)/.test(url);
  const isRelative = url && !isAbsolute && !isFragment && !isExternal;
  
  const srcToGH = (src, prefix) => join(prefix, src);
  const relToCanonical = (src, link) => resolve(dirname(src), link);
  const canonicalToRel = (src1, src2) => relative(dirname(src1), src2)

  let canonical = url;
  let href = url;
  let [base, frag] = url.split(/(\?|#)/);

  if (isRelative) {
    canonical = relToCanonical(filepath, base)
    href = url.replace(/\.(md|lit)/i, ".html") ;
  } else if (isAbsolute) {
    const rel = canonicalToRel(filepath, url);
    href = rel.replace(/\.(md|lit)/i, ".html");
  }

  link.type = "link";
  link.url = href;
  link.title = link.title || link.value;
  link.data = {
    isExternal,
    isAbsolute,
    isFragment,
    isRelative,
    canonical,
    wikilink,
  };

  if (wikilink) {
    // [base, frag] = link.url.split("#");
    // link.url = base + "?file=" + canonical + (frag ? `#${frag}` : "");
    link.children = [
      { position: link.position, type: "text", value: link.value },
    ];
  }

  link.data.hProperties = {
    wikilink,
    filepath,
    root,
    data: {
      base,
      frag,
      isExternal,
      isAbsolute,
      isFragment,
      isRelative,
      canonical,
      wikilink,
    },
  };

  delete link.value;
  // console.log(`[Links] resolving (${link.type}) [${url}] '${root}', "${filepath}"`, link.url)

  return link;
};


export default {
  resolveLinks,
  wikiLinkOptions,
  resolver,
  linkToUrl,
  decorateLinkNode,
}
