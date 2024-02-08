Error.stackTraceLimit = Infinity

import * as a from '@mitranim/js/all.mjs'

export const SRV_PORT = 32859
export const LIVE_PORT = SRV_PORT - 1
export const PROD = a.boolOpt(Deno.env.get(`PROD`))
export const VERBOSE = a.boolOpt(Deno.env.get(`VERBOSE`))
export const DIR_TARGET = `target`
export const DIR_STATIC = `static`
export const DIR_IMG = `img`
export const MAIN_ID = `main`
export const BRAND_NAME = `aliens.dev`
export const BRAND_DOMAIN = `aliens.dev`
export const SITE_NAME = `Make GPT do complex tasks | aliens.dev`
