import * as a from '@mitranim/js/all.mjs'
import * as s from './site.mjs'

async function main() {await Promise.all(a.map(s.Site.main.all(), pageWrite))}
async function pageWrite(page) {await page.write()}

if (import.meta.main) await main()
