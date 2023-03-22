import {A, E} from './util.mjs'

export function Header() {
  return E.nav.props(A.cls(`header`)).chi(`<header here>`)
}

export function Footer() {
  return E.footer.props(A.cls(`footer`)).chi(`<footer here>`)
}
