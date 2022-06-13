import {join, resolve, relative as isRelative, dirname} from "path";
import visit from "unist-util-visit";
import { getConsoleForNamespace } from "../utils/console";

const console = getConsoleForNamespace("links");

export const resolveLinks =
  (options = { litroot: "", filepath: "", files: []}) =>
  (...args) =>
  (tree, file) => {
    // console.log("[Links] Init", file.path, options);
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
  return decorateLinkNode(node, options.litroot, options.filepath, options.files);
};

export const wikiLinkOptions = (files = []) => {
  return {
    permalinks: files,
    pageResolver: (name) => {
      // console.log('Resolving', name)
      const {path, ext} = resolver(name)
      const exts = ['.lit', '/index.lit', '.md', ext]
      const opts = exts.map( ext => {
        return `${path}${ext}`
      })
      // console.log(opts)
      return opts //.filter(file => files.indexOf(file) >= 0)[0] || opts
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

export const decorateLinkNode = (link, root = "", filepath = "", files = []) => {
  // console.log(link)
  const wikilink = link.type === "wikiLink";
  const url = linkToUrl(link, root);

  
  const external = /^(https?\:)?\/\//.test(url);
  const absolute = !external && /^\//.test(url);
  const fragment = /^(\?|#)/.test(url);
  const relative = url && !absolute && !fragment && !external;
  
  const srcToGH = (src, prefix) => join(prefix, src);
  const relToCanonical = (src, link) => resolve(dirname(src), link);
  const canonicalToRel = (src1, src2) => isRelative(dirname(src1), src2)

  let canonical = url;
  let href = url;
  let [base, frag] = url.split(/(\?|#)/);

  if (relative) {
    canonical = relToCanonical(filepath, base)
    href = url.replace(/\.(md|lit)/i, ".html") ;
  } else if (absolute) {
    const rel = canonicalToRel(filepath, url);
    href = rel.replace(/\.(md|lit)/i, ".html");
  }

  link.type = "link";
  link.url = href;
  
  const tempTitle = link.title || link.value;
  if (tempTitle) {
    const valueAndTitle = tempTitle.split("|")
    link.title = valueAndTitle[0]
    link.value = valueAndTitle[1] || valueAndTitle[0]
  }

  const exists = files.indexOf(canonical) >= 0

  const data = {
    external,
    absolute,
    fragment,
    relative,
    canonical,
    wikilink,
    exists,
  };
  link.data = Object.assign({},data,{})

  if (wikilink) {
    link.children = [
      { position: link.position, type: "text", value: link.value },
    ];
  }

  link.data.hProperties = {
    wikilink,
    filepath,
    root,
    data,
  };

  delete link.value;
  console.log(`[${filepath}] resolving (${link.type}) [${canonical}] exists: ${exists}`, link.url, link)

  return link;
};


export default {
  resolveLinks,
  wikiLinkOptions,
  resolver,
  linkToUrl,
  decorateLinkNode,
}
