type Faq = { q: string; a: string }

type Props = {
  title?: string
  faqs: Faq[]
  id?: string
}

export function FaqBlock({ title = 'FAQ', faqs, id = 'faq' }: Props) {
  if (faqs.length === 0) return null
  return (
    <section className="seo-strip" id={id}>
      <h2>{title}</h2>
      <div className="faq">
        {faqs.map((f, i) => (
          <details key={f.q} open={i === 0}>
            <summary>{f.q}</summary>
            <p>{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
