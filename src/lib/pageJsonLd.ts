import homeSchema from '../content/schema/home.json'
import oatmealSchema from '../content/schema/oatmeal.json'

/** Id shared by prerender and DocumentMeta so client navigation updates one script. */
export const PAGE_JSON_LD_ID = 'ld-page'

/** Approved entity JSON-LD for routes that have a block besides FAQPage. */
export function pageJsonLd(path: string) {
  if (path === '/') return homeSchema
  if (path === '/oatmeal') return oatmealSchema
  return null
}
