/**
 * Client helpers for the paid 30-day plan: API calls, the access key, and the maths that
 * turns a buyer's target + starting point into weekly goals and menus.
 * Plan content itself is only served by the Worker to a valid access key.
 */

export type Track = 'std' | 'glp1' | 'gentle'
export const TRACKS: { id: Track; label: string }[] = [
  { id: 'std', label: 'Standard' },
  { id: 'glp1', label: 'GLP-1' },
  { id: 'gentle', label: 'Gentle gut' },
]

export type PlanItem = { t: string; g: number; shop: string; cat: string }
export type PlanMeal = {
  slot: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  name: string
  tracks: Track[]
  legume?: boolean
  items: PlanItem[]
  with?: string
  prep?: string
  g: number
}
export type PlanDay = { m: string[]; g: number }
export type WeekGuide = { title: string; focus: string; tips: string[] }
export type PlanContent = {
  tiers: Record<Track, number[]>
  meals: Record<string, PlanMeal>
  menus: Record<Track, Record<string, PlanDay[][]>>
  guide: {
    weeks: WeekGuide[]
    tracks: Record<Track, { intro: string; step: number; weekFocus: Record<string, string>; extraTips: string[] }>
    days2930: WeekGuide
    bloating: string
    sources: { topic: string; items: { label: string; url: string }[] }[]
    disclaimer: string
  }
}
export type PlanState = { target: number; start: number; track: Track; done: number[] }

export const DEFAULT_STATE: PlanState = { target: 25, start: 15, track: 'std', done: [] }
const STEP: Record<Track, number> = { std: 5, glp1: 3, gentle: 3 }

const KEY_STORE = 'fm_plan_key'
const TARGET_STORE = 'fm_last_target'

function safeGet(k: string): string | null {
  try {
    return localStorage.getItem(k)
  } catch {
    return null
  }
}
function safeSet(k: string, v: string) {
  try {
    localStorage.setItem(k, v)
  } catch {
    /* private mode */
  }
}

/** Called by the calculator so the plan can prefill the buyer's daily target. */
export function rememberTarget(target: number) {
  if (Number.isFinite(target) && target > 0) safeSet(TARGET_STORE, String(Math.round(target)))
}
export function lastTarget(): number | null {
  const n = Number(safeGet(TARGET_STORE))
  return Number.isFinite(n) && n >= 10 && n <= 70 ? n : null
}

export function saveKey(key: string) {
  safeSet(KEY_STORE, key)
}
/** Key from the link (#k=…) first, then the one this browser saw last. */
export function readKey(): string | null {
  const m = window.location.hash.match(/k=([a-f0-9]{48})/)
  if (m) {
    saveKey(m[1])
    return m[1]
  }
  const stored = safeGet(KEY_STORE)
  return stored && /^[a-f0-9]{48}$/.test(stored) ? stored : null
}

export function weeklyGoals(state: Pick<PlanState, 'target' | 'start' | 'track'>): number[] {
  const step = STEP[state.track]
  const start = Math.min(state.start, state.target)
  return [1, 2, 3, 4].map((w) => Math.min(state.target, start + step * w))
}

/** Highest menu tier that doesn't overshoot the goal by more than 1 g (menus land at tier to tier+2). */
export function nearestTier(tiers: number[], goal: number): number {
  const fit = tiers.filter((t) => t <= goal + 1)
  return fit.length ? fit[fit.length - 1] : tiers[0]
}

/** Snacks that can close a gap between the menu total and the week's goal. */
export function addOns(content: PlanContent, track: Track, week: number, gap: number): PlanMeal[] {
  if (gap < 1) return []
  const snacks = Object.values(content.meals)
    .filter((m) => m.slot === 'snack' && m.tracks.includes(track) && !(track === 'gentle' && m.legume && week < 3))
    .sort((a, b) => a.g - b.g)
  const one = snacks.find((s) => s.g >= gap - 0.5)
  if (one) return [one]
  const big = snacks.at(-1)
  return big ? [big] : []
}

export type ShopLine = { name: string; days: number }
export function shoppingList(content: PlanContent, days: PlanDay[]): { cat: string; lines: ShopLine[] }[] {
  const byName = new Map<string, { cat: string; days: Set<number> }>()
  days.forEach((d, i) =>
    d.m.forEach((id) =>
      content.meals[id]?.items.forEach((it) => {
        const row = byName.get(it.shop) || { cat: it.cat, days: new Set<number>() }
        row.days.add(i)
        byName.set(it.shop, row)
      }),
    ),
  )
  const order = ['Produce', 'Grains & bread', 'Beans & lentils', 'Nuts & seeds', 'Other']
  return order
    .map((cat) => ({
      cat,
      lines: [...byName.entries()]
        .filter(([, v]) => v.cat === cat)
        .map(([name, v]) => ({ name, days: v.days.size }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    }))
    .filter((g) => g.lines.length)
}

async function api<T>(path: string, init?: RequestInit): Promise<{ ok: boolean; status: number; data: T }> {
  const res = await fetch(path, { ...init, headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) } })
  const data = (await res.json().catch(() => ({}))) as T
  return { ok: res.ok, status: res.status, data }
}

export const planApi = {
  checkout: () => api<{ url?: string; error?: string }>('/api/plan/checkout', { method: 'POST', body: '{}' }),
  claim: (sessionId: string) =>
    api<{ key?: string; email?: string; error?: string }>(`/api/plan/claim?session_id=${encodeURIComponent(sessionId)}`),
  resend: (sessionId: string) => api<{ error?: string }>('/api/plan/resend', { method: 'POST', body: JSON.stringify({ session_id: sessionId }) }),
  recover: (email: string) => api<{ error?: string }>('/api/plan/recover', { method: 'POST', body: JSON.stringify({ email }) }),
  content: (key: string) => api<PlanContent & { error?: string }>(`/api/plan/content?k=${key}`),
  getState: (key: string) => api<{ state?: Partial<PlanState> }>(`/api/plan/state?k=${key}`),
  putState: (key: string, state: PlanState) =>
    api<{ error?: string }>(`/api/plan/state?k=${key}`, { method: 'PUT', body: JSON.stringify(state) }),
}
