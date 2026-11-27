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

const HERO_WIDTHS = [400, 640, 900, 1240]
/** Aspect of the guide hero photo on desktop (width / height); phones crop it to 2.2 in CSS. */
export const HERO_RATIO = 3.2

/** Wide photo at the top of the Quick answer card, with the Unsplash credit on it. */
export function FoodHeroPhoto({ photo }: { photo: FoodPhoto }) {
  const h = (w: number) => Math.round(w / HERO_RATIO)
  return (
    <figure className="qa-photo">
      <img
        src={unsplashUrl(photo, 640, h(640))}
        srcSet={HERO_WIDTHS.map((w) => `${unsplashUrl(photo, w, h(w), w > 640 ? 55 : 65)} ${w}w`).join(', ')}
        sizes="(max-width: 960px) calc(100vw - 32px), 620px"
        width={1240}
        height={h(1240)}
        alt={photo.alt}
        fetchPriority="high"
        decoding="async"
      />
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
