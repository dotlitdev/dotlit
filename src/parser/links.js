import {join, resolve, relative, dirname} from "path";
import visit from "unist-util-visit";
import { getConsoleForNamespace } from "../utils/console";

const console = getConsoleForNamespace("links");

export const resolveLinks =
  (options = { litroot: "", filepath: "" }) =>
  (...args) =>
  (tree, file) => {
    console.log("[Links] Init", file.path, options);
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
      const exts = ['.lit', '.md', ext]
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

  let canonical = url;
  let href = url;
  let [base, frag] = url.split(/(\?|#)/);

  if (isRelative) {
    const abs = resolve(root, dirname(filepath), url);
    canonical = join('/', relative(resolve(root), abs))
    // canonical = resolve(root, filepath, url)
    href = url.replace(/\.(md|lit)/i, ".html");
    // console.log({ root, filepath, url, canonical, href})
  } else if (isAbsolute) {
    href = url.replace(/\.(md|lit)/i, ".html");
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
