import { useEffect, useRef, useState } from 'react'

/**
 * Tiny motion helpers for the home page (design page "首页大胆动效", boards M1–M6).
 * No animation library: requestAnimationFrame + transform/opacity only.
 */

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x))
export const easeOut = (x: number) => 1 - Math.pow(1 - x, 3)
/** Ease-out with a small overshoot, like a scale needle settling. */
export const easeBack = (x: number, s = 1.2) => {
  if (x <= 0) return 0
  if (x >= 1) return 1
  return 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2)
}

export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}

/** Run `frame(elapsedMs)` every animation frame until it returns false. Returns a cancel function. */
export function runFrames(frame: (elapsed: number) => boolean): () => void {
  let raf = 0
  const start = performance.now()
  const tick = (now: number) => {
    if (frame(now - start)) raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)
  return () => cancelAnimationFrame(raf)
}

/**
 * Tween a number toward `value` (ease-out). The first value, any value set while
 * `instant`, and every value under reduced motion show at once.
 */
export function useTween(value: number, duration = 480, instant = false): number {
  const [shown, setShown] = useState(value)
  const fromRef = useRef(value)
  useEffect(() => {
    const from = fromRef.current
    if (instant || from === value || prefersReducedMotion()) {
      fromRef.current = value
      setShown(value)
      return
    }
    return runFrames((t) => {
      const x = clamp01(t / duration)
      const v = from + (value - from) * easeOut(x)
      fromRef.current = v
      setShown(v)
      return x < 1
    })
  }, [value, duration, instant])
  return shown
}

/**
 * Width that holds a counting number's final text, so the unit after it never
 * moves while it counts (no layout shift). Digits are tabular; the dot is narrow.
 */
export function numWidth(final: string): string {
  const digits = final.replace(/[^0-9]/g, '').length
  return `${(digits * 0.95 + (final.includes('.') ? 0.35 : 0)).toFixed(2)}ch`
}
