import { toPng } from 'html-to-image'

export function buildShareText(opts: {
  totalFiberG: number
  target: number
  pct: number
  gap: number
  hasEstimates: boolean
  dateLabel: string
  topFoods: { name: string; fiberG: number }[]
}): string {
  const status = opts.gap <= 0 ? 'Goal reached' : `${opts.gap}g still to go`
  const lines = [
    'Fibermax',
    opts.dateLabel,
    'Daily fiber report',
    '',
    `${opts.totalFiberG}g / ${opts.target}g target`,
    `${Math.round(opts.pct)}% of goal · ${status}`,
  ]

  if (opts.topFoods.length > 0) {
    lines.push('', 'Top foods today')
    for (const f of opts.topFoods) {
      lines.push(`· ${f.name} — ${f.fiberG}g`)
    }
  }

  if (opts.hasEstimates) {
    lines.push('', 'Includes estimated foods')
  }

  lines.push('', 'getfibermaxxing.com', 'Free fibermaxxing calculator')
  return lines.join('\n')
}

/** Design size; pixelRatio 3 → ~1620×2880 export for sharp Stories/IG posts */
const REPORT_W = 540
const REPORT_H = 960

/**
 * Capture the hidden portrait card without flashing a clone on screen.
 * html-to-image applies `style` to its internal render clone only — the live
 * node can stay opacity:0. Avoid left:-9999px (often yields a blank PNG).
 */
export async function downloadReportPng(node: HTMLElement, filename = 'fibermax-daily-report.png') {
  if (document.fonts?.ready) {
    await document.fonts.ready
  }

  const portrait = node.querySelector('.report-card-portrait') as HTMLElement | null
  const target = portrait ?? node

  const dataUrl = await toPng(target, {
    cacheBust: true,
    pixelRatio: 3,
    backgroundColor: '#eef0f5',
    width: REPORT_W,
    height: REPORT_H,
    style: {
      opacity: '1',
      visibility: 'visible',
      transform: 'none',
      position: 'relative',
      left: '0',
      top: '0',
      margin: '0',
      width: `${REPORT_W}px`,
      height: `${REPORT_H}px`,
    },
  })

  const link = document.createElement('a')
  link.download = filename
  link.href = dataUrl
  link.click()
}
