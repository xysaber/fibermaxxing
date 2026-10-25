export type InfoTile = {
  label: string
  value: string
  note?: string
}

type Props = {
  id?: string
  ariaLabel?: string
  notes?: string[]
  tiles: InfoTile[]
}

export function InfoBand({ id, ariaLabel, notes = [], tiles }: Props) {
  if (notes.length === 0 && tiles.length === 0) return null

  const n = Math.min(4, Math.max(1, tiles.length || 1))

  return (
    <section className="info-band" id={id} aria-label={ariaLabel}>
      {notes.map((note) => (
        <p key={note.slice(0, 48)} className="info-band-note">
          {note}
        </p>
      ))}
      {tiles.length > 0 ? (
        <ul className="info-tiles" data-count={n}>
          {tiles.map((t) => (
            <li key={t.label} className="info-tile">
              <strong>{t.label}</strong>
              <span>{t.value}</span>
              {t.note ? <em>{t.note}</em> : null}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}
