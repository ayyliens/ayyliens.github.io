import * as a from '@mitranim/js/all.mjs'
import * as p from '@mitranim/js/prax.mjs'
import * as dr from '@mitranim/js/dom_reg.mjs'
import * as ds from '@mitranim/js/dom_shim.mjs'
import * as dg from '@mitranim/js/dom_glob'
import {paths as pt} from '@mitranim/js/io_deno.mjs'
import * as c from './conf.mjs'

dr.Reg.main.setDefiner(dg.customElements)

/*
Short for "renderer". Provides various shortcuts for creating and mutating DOM
elements. In browsers, uses the native DOM API. In non-browsers, uses a DOM
shim. The shim supports serialization via `.outerHTML`, which is used for
server-side rendering.
*/
export const ren = p.Ren.from(dg.glob)
export const E = ren.E
export const S = ren.S

class PropBui extends p.PropBui {
  // Must be called AFTER `.href` or `.link`.
  cur(page) {return this.current(a.isSubpath(this.get(`href`), page.urlPath()))}
  current(ok) {return ok ? this.set(`aria-current`, `page`) : this}
}

/*
Shortcuts for props/attributes. Calling any method creates a new mutable
instance. See examples in `site.mjs`.
*/
export const A = new PropBui().frozen()

export class SiteBase extends a.MixMain(a.Emp) {
  all() {return []}

  pageByPath(path) {
    for (const val of this.all()) if (val.urlPath() === path) return val
    return undefined
  }
}

export class PageBase extends a.MixChildCon(a.Emp) {
  setParent(val) {return super.setParent(a.reqInst(val, SiteBase))}

  // For most pages, this uses `.urlPath`. Some pages require an override.
  fsPathRel() {
    const path = a.laxStr(this.urlPath())
    return path && a.stripPre(path, `/`) + `.html`
  }

  fsPathTarget() {
    const path = a.laxStr(this.fsPathRel())
    return path && pt.join(c.DIR_TARGET, path)
  }

  res(val) {return a.resBui(val).html(this.resBody()).res()}
  resBody() {return p.renderDocument(this.html())}

  async write() {
    const path = this.fsPathTarget()
    if (!path) return

    const body = this.resBody()
    if (!body) return

    await Deno.mkdir(pt.dir(path), {recursive: true})
    await Deno.writeTextFile(path, body)

    if (c.VERBOSE) console.log(`[html] wrote`, path)
  }

  html() {return E.html.chi(this.htmlHead(), this.htmlBody())}

  // Override in subclass.
  urlPath() {}
  title() {}
  htmlHead() {return E.head}
  htmlBody() {return E.body.chi(this.htmlContent())}
  htmlContent() {}
}

export function toUrl(val) {return a.toInst(val, Url)}
export function url(val, ...vals) {return new Url(val).addPath(...vals)}

export class Url extends a.Url {
  /*
  TODO:

    * Validate that the image exists.

    * If the image hasn't already been processed, process it.

  Image processing:

    * Raster: enforce maximum width/height; downscale to specified width/height;
      if possible to upscale with high quality, upscale to specified
      width/height.

    * Vector: consider https://github.com/RazrFalcon/svgcleaner.
  */
  img(...path) {return this.setPath(c.DIR_IMG, ...path)}
}

export function imgUrl(...path) {return url().img(...path)}

// Converts line breaks to spaces. Similar to how HTML treats text.
export function collapse(val) {return a.laxStr(val).replace(/\s+/g, ` `).trim()}

// Supports only `**` for bold and `_` for italic.`
export function mdToHtml(val) {
  val = a.trim(val)
  val = val.replaceAll(/[*][*]([^*]*)[*][*]/g, wrapBold)
  val = val.replaceAll(/_([^_]*)_/g, wrapItalic)
  return new p.Raw(val)
}

function wrapBold(_, val) {return `<b>${ds.escapeText(val)}</b>`}
function wrapItalic(_, val) {return `<em>${ds.escapeText(val)}</em>`}
