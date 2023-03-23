// import * as a from '@mitranim/js/all.mjs'
import {marked} from 'marked'
import * as c from './conf.mjs'
import {A, E} from './util.mjs'
import * as u from './util.mjs'
import * as v from './view.mjs'
import * as t from './text.mjs'

export class Site extends u.SiteBase {
  constructor() {
    super()
    this.notFound = new Page404(this)
    this.other = [new PageIndex(this)]
  }

  all() {return [this.notFound, ...this.other]}
}

class Page extends u.PageBase {
  htmlHead() {
    const title = c.SITE_NAME

    return E.head.chi(
      E.meta.props(A.charset(`utf-8`)),
      E.meta.props(A.httpEquiv(`X-UA-Compatible`).content(`IE=edge,chrome=1`)),
      E.meta.props(A.name(`viewport`).content(`width=device-width, minimum-scale=1, maximum-scale=2, initial-scale=1, user-scalable=yes`)),
      E.link.props(A.rel(`icon`).href(`data:;base64,=`)),
      E.meta.props(A.name(`author`).content(c.BRAND_NAME)),
      E.meta.props(A.name(`description`).content(this.desc || title)),
      E.link.props(A.rel(`stylesheet`).type(`text/css`).href(`/css/main.css`)),
      E.title.chi(this.title() || title),
    )
  }

  htmlBody() {
    return E.body.chi(v.Header(this), this.htmlContent(), v.Footer(this))
  }
}

export class PageErr extends Page {
  constructor(site, err) {super(site).err = err}
  res() {return super.res({status: this.code()})}
  code() {return 500}
  title() {return `unexpected error`}

  htmlBody() {
    try {return super.htmlBody()}
    catch (err) {return this.htmlContent(err)}
  }

  htmlContent(err) {
    err = err || this.err || Error(this.title())
    return E.pre.chi(err.stack || err.message || err)
  }
}

export class Page404 extends PageErr {
  fsPathRel() {return `404.html`}
  code() {return 404}
  title() {return `Page Not Found`}
  htmlContent() {return `Sorry! Page not found`}
}

class PageIndex extends Page {
  fsPathRel() {return `index.html`}
  urlPath() {return `/`}
  htmlContent() {
    return E.div.props(A.cls(`col-sta-cen mar-v-2`)).chi(
      E.img.props(A.cls(`maw-col-1`).src(`/logo.png`)),
      E.div.props(A.cls(`maw-col-6 gap-v-mid`)).chi(
        E.div.props(A.cls(`text-justify responsive-typography --big font-fam-ssp`)).chi(
          new u.Raw(marked(t.intro)),
        )
      )
    )
  }
}
