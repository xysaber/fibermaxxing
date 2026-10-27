import { GuideCards } from './GuideCards'

export const HOME_GUIDES = [
  {
    to: '/how-much-fiber-per-day',
    title: 'How much fiber per day?',
    blurb: 'Adequate Intake targets by sex and age, then estimate today’s intake.',
  },
  {
    to: '/oatmeal',
    title: 'Oatmeal fiber',
    blurb: '~4g per cooked cup — plus a calculator for your full bowl.',
  },
  {
    to: '/chia-seeds',
    title: 'Chia seeds fiber',
    blurb: '~4.1g per tablespoon (≈12 g), scaled from USDA chia density.',
  },
  {
    to: '/high-fiber-breakfast',
    title: 'High-fiber breakfast',
    blurb: 'Pasteable morning combos with portions you can edit.',
  },
] as const

export function GuidesStrip() {
  return (
    <GuideCards
      id="guides"
      title="Fiber guides"
      subtitle="Short answers first — then the same calculator with a relevant example meal."
      items={[...HOME_GUIDES]}
    />
  )
}
