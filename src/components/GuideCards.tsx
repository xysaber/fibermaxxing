import { Link } from 'react-router-dom'

export type GuideCardItem = {
  to: string
  title: string
  blurb: string
}

type Props = {
  id?: string
  title: string
  subtitle?: string
  items: GuideCardItem[]
}

export function GuideCards({ id, title, subtitle, items }: Props) {
  if (items.length === 0) return null

  const headingId = id ? `${id}-heading` : undefined
  const n = Math.min(4, Math.max(1, items.length))

  return (
    <section className="guide-cards-strip" id={id} aria-labelledby={headingId}>
      <div className="guide-cards-head">
        <h2 id={headingId}>{title}</h2>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      <ul className="guide-cards" data-count={n}>
        {items.map((g) => (
          <li key={g.to}>
            <Link className="guide-card" to={g.to}>
              <strong>{g.title}</strong>
              <span>{g.blurb}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
