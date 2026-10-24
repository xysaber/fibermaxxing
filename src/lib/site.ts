export const SITE_URL = 'https://www.getfibermaxxing.com'
export const SITE_NAME = 'GetFibermaxxing'
export const DEFAULT_TITLE = 'Fibermaxxing Calculator & Daily Fiber Tracker | GetFibermaxxing'
export const DEFAULT_DESCRIPTION =
  'Free fibermaxxing calculator. Estimate daily fiber from your meals with USDA-based values and U.S. Adequate Intake targets. No signup.'

export function absoluteUrl(path = '/') {
  if (!path || path === '/') return `${SITE_URL}/`
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}
