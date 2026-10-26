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

function nextFrame() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => resolve())
  })
}

/**
 * Capture the off-screen portrait card.
 *
 * The live node stays at full opacity but `left: -10000px` (see CSS) so portion
 * edits always paint, without ever flashing into the viewport. Do not toggle
 * opacity/visibility on the live node during capture.
 */
export async function downloadReportPng(node: HTMLElement, filename = 'fibermax-daily-report.png') {
  if (document.fonts?.ready) {
    await document.fonts.ready
  }

  const portrait = node.querySelector('.report-card-portrait') as HTMLElement | null
  const target = portrait ?? node

  // Ensure latest DOM text is laid out before html-to-image clones the node.
  void node.offsetHeight
  await nextFrame()
  await nextFrame()

  const dataUrl = await toPng(target, {
    cacheBust: true,
    pixelRatio: 3,
    backgroundColor: '#f3f5f9',
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
