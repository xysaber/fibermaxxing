import type { SeoAnswer as SeoAnswerData } from '../content/seoPages'

type Props = {
  answer: SeoAnswerData
}

export function SeoAnswer({ answer }: Props) {
  return (
    <div className="seo-answer">
      <p className="seo-answer-value">
        {answer.value}
        {answer.unit ? <small>{answer.unit}</small> : null}
      </p>
      <p className="seo-answer-detail">{answer.detail}</p>
      {answer.note ? <p className="seo-answer-note">{answer.note}</p> : null}
    </div>
  )
}
