import type { FoodPhoto } from '../content/foodPhotos'

const UTM = 'utm_source=getfibermaxxing&utm_medium=referral'
export const UNSPLASH_HOME = `https://unsplash.com/?${UTM}`

/** Sized, cropped Unsplash URL (imgix params on the hotlinked raw URL). */
export function unsplashUrl(p: FoodPhoto, w: number, h: number, q = 65): string {
  return `${p.src}&w=${w}&h=${h}&fit=crop&crop=entropy&auto=format&q=${q}`
}

/**
 * Small square thumbnail (home food list, hub rows). Fixed width/height so it never
 * shifts layout; lazy by default because every use sits below the fold.
 */
export function FoodThumb({ photo, size, className }: { photo: FoodPhoto; size: number; className?: string }) {
  return (
    <img
      className={className}
      src={unsplashUrl(photo, size, size)}
      srcSet={`${unsplashUrl(photo, size, size)} 1x, ${unsplashUrl(photo, size * 2, size * 2, 55)} 2x`}
      width={size}
      height={size}
      alt=""
      loading="lazy"
      decoding="async"
    />
  )
}

/** Aspect of the guide hero photo on desktop (width / height); phones crop it to 2.4 in CSS. */
export const HERO_RATIO = 3.2
const PHONE_RATIO = 2.4
/** Phones top out at 800 px wide (≈2× a 390 px screen) so the LCP image stays small on 3× screens. */
const PHONE_WIDTHS = [400, 600, 800]
const DESKTOP_WIDTHS = [640, 900, 1240]

/** Wide photo at the top of the Quick answer card, with the Unsplash credit on it. */
export function FoodHeroPhoto({ photo }: { photo: FoodPhoto }) {
  const set = (widths: number[], ratio: number) =>
    widths.map((w) => `${unsplashUrl(photo, w, Math.round(w / ratio), w > 640 ? 55 : 65)} ${w}w`).join(', ')
  return (
    <figure className="qa-photo">
      <picture>
        <source media="(max-width: 960px)" srcSet={set(PHONE_WIDTHS, PHONE_RATIO)} sizes="calc(100vw - 32px)" />
        <img
          src={unsplashUrl(photo, 640, Math.round(640 / HERO_RATIO))}
          srcSet={set(DESKTOP_WIDTHS, HERO_RATIO)}
          sizes="620px"
          width={1240}
          height={Math.round(1240 / HERO_RATIO)}
          alt={photo.alt}
          fetchPriority="high"
          decoding="async"
        />
      </picture>
      <figcaption>
        Photo: <a href={photo.authorUrl} rel="noopener">{photo.author}</a> /{' '}
        <a href={photo.photoUrl} rel="noopener">Unsplash</a>
      </figcaption>
    </figure>
  )
}

/** One credit line for a block of thumbnails. */
export function PhotoCredits({ photos, className }: { photos: FoodPhoto[]; className?: string }) {
  const seen = new Set<string>()
  const people = photos.filter((p) => (seen.has(p.author) ? false : (seen.add(p.author), true)))
  if (people.length === 0) return null
  return (
    <p className={className ?? 'photo-credits'}>
      Photos:{' '}
      {people.map((p, i) => (
        <span key={p.author}>
          {i > 0 ? ', ' : null}
          <a href={p.authorUrl} rel="noopener">
            {p.author}
          </a>
        </span>
      ))}{' '}
      / <a href={UNSPLASH_HOME} rel="noopener">Unsplash</a>
    </p>
  )
}
