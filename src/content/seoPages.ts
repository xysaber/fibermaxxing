import type { AgeGroup, GoalMode, Sex } from '../lib/parseMeal'
import rawPages from './seo-pages.json'

export type SeoFaq = { q: string; a: string }

export type SeoFact = {
  label: string
  value: string
  note?: string
}

/** First-viewport direct answer (P0) — big number under the H1 */
export type SeoAnswer = {
  value: string
  unit?: string
  detail: string
  note?: string
}

export type SeoSection = {
  heading: string
  paragraphs: string[]
}

export type SeoPage = {
  slug: string
  title: string
  description: string
  h1: string
  intro: string[]
  /** Hero answer climax for question-led SEO pages */
  answer?: SeoAnswer
  /**
   * Hard metrics only (not tips/source prose).
   * - default layout: list in the left hero column
   * - bands layout: full-width metric strip under the hero
   */
  facts?: SeoFact[]
  /** Optional long-form sections under the facts band (H2 + paragraphs). */
  sections?: SeoSection[]
  /**
   * Hero composition. Default is `bands` (short left copy + calculator, facts below).
   * Set `default` only to keep the old left-column stack.
   */
  layout?: 'default' | 'bands'
  calculatorCta?: string
  articleCta?: string
  defaultSex: Sex
  defaultAge: AgeGroup
  defaultMode: GoalMode
  defaultMeal: string
  /** Theme-specific meal examples for the calculator (shown collapsed by default) */
  examples?: string[]
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
