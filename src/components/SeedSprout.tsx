/**
 * The logo's seed with a sprout above it (logo A). The sprout group carries
 * `.seed-sprout-leaves`, which CSS or a frame loop scales from 0 to 1 when a
 * target is hit.
 */
export function SeedSprout({ size = 40, onDark = false }: { size?: number; onDark?: boolean }) {
  const seed = onDark ? '#5bd08a' : '#2e9e5b'
  const leafA = onDark ? '#5bd08a' : '#2e9e5b'
  const leafB = onDark ? '#a7e9bf' : '#1f6b45'
  return (
    <svg className="seed-sprout" width={size} height={size} viewBox="0 0 44 44" aria-hidden="true">
      <g className="seed-sprout-leaves">
        <path d="M22 15V7" stroke={leafA} strokeWidth="2" strokeLinecap="round" />
        <path d="M22 10c-3-4-8-4-10-2 2 4 7 4 10 2z" fill={leafA} />
        <path d="M22 8c3-4 8-4 10-2-2 4-7 4-10 2z" fill={leafB} />
      </g>
      <path d="M22 15c-4 3-5 9-1 14 4-3 5-9 1-14z" fill={seed} />
    </svg>
  )
}
