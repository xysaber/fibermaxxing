/**
 * Submit sitemap URLs to IndexNow (Bing, Yandex, Seznam, Naver share submissions).
 * Key file: public/<key>.txt, served at https://www.getfibermaxxing.com/<key>.txt
 * Usage: node scripts/indexnow.mjs            (all sitemap URLs)
 *        node scripts/indexnow.mjs /a /b      (only these paths)
 */
import { readFileSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const host = 'www.getfibermaxxing.com'
const keyFile = readdirSync(join(root, 'public')).find((f) => /^[0-9a-f]{32}\.txt$/.test(f))
if (!keyFile) throw new Error('IndexNow key file missing in public/')
const key = keyFile.slice(0, -4)

const args = process.argv.slice(2)
const urlList = args.length
  ? args.map((p) => `https://${host}${p.startsWith('/') ? p : `/${p}`}`)
  : [...readFileSync(join(root, 'public/sitemap.xml'), 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])

const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host, key, keyLocation: `https://${host}/${keyFile}`, urlList }),
})
console.log(`IndexNow: ${res.status} ${res.statusText} (${urlList.length} URLs)`)
// 200 OK, 202 Accepted (key check pending). Anything else is a real failure.
if (res.status !== 200 && res.status !== 202) process.exit(1)
