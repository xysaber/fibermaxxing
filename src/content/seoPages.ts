import type { AgeGroup, GoalMode, Sex } from '../lib/parseMeal'
import rawPages from './seo-pages.json'

export type SeoFaq = { q: string; a: string }

export type SeoFact = {
  label: string
  value: string
  note?: string
}

export type SeoPage = {
  slug: string
  title: string
  description: string
  h1: string
  intro: string[]
  /** Direct-answer facts shown above the calculator */
  facts?: SeoFact[]
  defaultSex: Sex
  defaultAge: AgeGroup
  defaultMode: GoalMode
  defaultMeal: string
  faqs: SeoFaq[]
  related: string[]
  /** Only published pages are routed + sitemap’d */
  publish: boolean
}

export const SEO_PAGES = rawPages as SeoPage[]

export const PUBLISHED_PAGES = SEO_PAGES.filter((p) => p.publish)
export const PUBLISHED_SLUGS = PUBLISHED_PAGES.map((p) => p.slug)

export const SEO_PAGE_MAP = Object.fromEntries(SEO_PAGES.map((p) => [p.slug, p])) as Record<
  string,
  SeoPage
>

export function getSeoPage(slug: string): SeoPage | undefined {
  const page = SEO_PAGE_MAP[slug]
  if (!page || !page.publish) return undefined
  return page
}
