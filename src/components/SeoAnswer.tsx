import type { SeoAnswer as SeoAnswerData } from '../content/seoPages'

type Props = {
  answer: SeoAnswerData
  /** Hero keeps notes out of the first viewport by default. */
  showNote?: boolean
}

/** Big mono climax is sized for ~4g / 25–38; phrase answers need a calmer one-line style. */
export function isPhraseAnswer(answer: SeoAnswerData): boolean {
  if (answer.unit) return false
  return /[a-zA-Z]{2,}/.test(answer.value) && !/^~?[\d.,–—−\-\s]+$/.test(answer.value.trim())
}

export function SeoAnswer({ answer, showNote = true }: Props) {
  const phrase = isPhraseAnswer(answer)
  return (
    <div className={phrase ? 'seo-answer seo-answer--phrase' : 'seo-answer'}>
      <p className={phrase ? 'seo-answer-value seo-answer-value--phrase' : 'seo-answer-value'}>
        {answer.value}
        {answer.unit ? <small>{answer.unit}</small> : null}
      </p>
      <p className="seo-answer-detail">{answer.detail}</p>
      {showNote && answer.note ? <p className="seo-answer-note">{answer.note}</p> : null}
    </div>
  )
}
