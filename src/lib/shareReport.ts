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
    lines.push('', 'Matched foods')
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

/** Design width; height is at least Stories baseline, then grows with content. */
const REPORT_W = 540
const REPORT_H_MIN = 960

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
 *
 * Height: measure laid-out scrollHeight so long matched-food lists are not clipped.
 */
export async function downloadReportPng(node: HTMLElement, filename = 'fibermax-daily-report.png') {
  if (document.fonts?.ready) {
    await document.fonts.ready
  }

  const portrait = node.querySelector('.report-card-portrait') as HTMLElement | null
  const target = portrait ?? node

  // Let CSS height:auto size to content, then measure for html-to-image.
  target.style.height = 'auto'
  void node.offsetHeight
  void target.offsetHeight
  await nextFrame()
  await nextFrame()

  const measured = Math.ceil(Math.max(target.scrollHeight, target.offsetHeight))
  const height = Math.max(REPORT_H_MIN, measured)

  const dataUrl = await toPng(target, {
    cacheBust: true,
    pixelRatio: 3,
    backgroundColor: '#f3f5f9',
    width: REPORT_W,
    height,
    style: {
      opacity: '1',
      visibility: 'visible',
      transform: 'none',
      position: 'relative',
      left: '0',
      top: '0',
      margin: '0',
      width: `${REPORT_W}px`,
      height: `${height}px`,
      overflow: 'visible',
    },
  })

  const link = document.createElement('a')
  link.download = filename
  link.href = dataUrl
  link.click()
}
