#!/usr/bin/env node
/**
 * Build a slim English food index from USDA SR Legacy CSV.
 *
 * Usage:
 *   node scripts/build-usda-foods.mjs
 *
 * Expects CSV extract at:
 *   scripts/tmp/FoodData_Central_sr_legacy_food_csv_2018-04/
 *
 * Or set USDA_CSV_DIR. Downloads zip automatically if missing.
 */
import { createReadStream, existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { createInterface } from 'node:readline'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const TMP = join(__dirname, 'tmp')
const DEFAULT_DIR = join(TMP, 'FoodData_Central_sr_legacy_food_csv_2018-04')
const ZIP_URL =
  'https://fdc.nal.usda.gov/fdc-datasets/FoodData_Central_sr_legacy_food_csv_2018-04.zip'
const OUT = join(ROOT, 'src/data/usda-foods.json')

const FIBER_ID = '1079'
const ENERGY_ID = '1008'

/** Skip noisy USDA categories for NL matching (English L1). */
const SKIP_CATEGORIES = new Set(['3', '4', '14', '21', '25', '28']) // baby, oils, beverages, fast food, restaurant, alcohol

/** Supplements / staples missing or weak in SR Legacy (English only). */
const CURATED = [
  {
    id: 'curated:psyllium',
    name: 'Psyllium husk',
    aliases: ['psyllium husk', 'psyllium', 'metamucil'],
    fiber100g: 78,
    kcal100g: 200,
    serving: { label: '1 tbsp (9g)', g: 9 },
  },
  {
    id: 'curated:inulin',
    name: 'Inulin powder',
    aliases: ['inulin powder', 'inulin'],
    fiber100g: 90,
    kcal100g: 200,
    serving: { label: '2 tsp (10g)', g: 10 },
  },
  {
    id: 'curated:oatmeal',
    name: 'Oatmeal, cooked',
    aliases: ['bowl of oatmeal', 'oatmeal', 'oat porridge', 'porridge'],
    fiber100g: 1.7,
    kcal100g: 71,
    serving: { label: '1 cup cooked', g: 234 },
  },
  {
    id: 'curated:oats',
    name: 'Oats, dry',
    aliases: ['rolled oats', 'oats', 'oat'],
    fiber100g: 10.6,
    kcal100g: 389,
    serving: { label: '1/2 cup dry', g: 40 },
  },
  {
    id: 'curated:sourdough',
    name: 'Sourdough bread',
    aliases: ['sourdough bread', 'sourdough toast', 'sourdough', 'slice of sourdough'],
    fiber100g: 2.4,
    kcal100g: 272,
    serving: { label: '1 slice (50g)', g: 50 },
  },
  {
    id: 'curated:apple',
    name: 'Apple, raw',
    aliases: ['an apple', 'apples', 'apple'],
    fiber100g: 2.4,
    kcal100g: 52,
    serving: { label: '1 medium (182g)', g: 182 },
  },
  {
    id: 'curated:avocado',
    name: 'Avocado, raw',
    aliases: ['an avocado', 'avocados', 'avocado', 'avos'],
    fiber100g: 6.7,
    kcal100g: 160,
    serving: { label: '1 medium (150g)', g: 150 },
  },
  {
    id: 'curated:egg',
    name: 'Egg, whole, cooked',
    aliases: ['eggs', 'egg'],
    fiber100g: 0,
    kcal100g: 155,
    serving: { label: '1 large', g: 50 },
  },
]

const CATEGORY_HEADS = new Set([
  'beans',
  'seeds',
  'nuts',
  'lentils',
  'peas',
  'chickpeas',
  'cereals',
  'bread',
  'snacks',
  'soup',
  'soups',
  'vegetables',
  'fruit',
  'fruits',
  'dairy',
  'cheese',
  'oil',
  'oils',
  'spices',
  'babyfood',
  'restaurant',
  'fast foods',
  'fast food',
  'candies',
  'sweets',
  'beverages',
  'alcohol',
  'fish',
  'poultry',
  'lamb',
  'beef',
  'pork',
  'game',
  'sausages',
  'lunchmeat',
])

function parseCsvLine(line) {
  const out = []
  let cur = ''
  let inQ = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (inQ) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"'
          i++
        } else inQ = false
      } else cur += ch
    } else if (ch === '"') inQ = true
    else if (ch === ',') {
      out.push(cur)
      cur = ''
    } else cur += ch
  }
  out.push(cur)
  return out
}

async function readCsv(path) {
  const rows = []
  const rl = createInterface({ input: createReadStream(path, { encoding: 'utf8' }), crlfDelay: Infinity })
  let headers = null
  for await (const line of rl) {
    if (!line.trim()) continue
    const cols = parseCsvLine(line)
    if (!headers) {
      headers = cols.map((h) => h.replace(/^"|"$/g, ''))
      continue
    }
    const obj = {}
    headers.forEach((h, i) => {
      obj[h] = cols[i] ?? ''
    })
    rows.push(obj)
  }
  return rows
}

async function ensureCsvDir() {
  const dir = process.env.USDA_CSV_DIR || DEFAULT_DIR
  if (existsSync(join(dir, 'food.csv'))) return dir

  mkdirSync(TMP, { recursive: true })
  const zipPath = join(TMP, 'sr_legacy_csv.zip')
  if (!existsSync(zipPath)) {
    console.log('Downloading USDA SR Legacy CSV…')
    execSync(`curl -L --fail -o "${zipPath}" "${ZIP_URL}"`, { stdio: 'inherit' })
  }
  console.log('Unzipping…')
  execSync(`unzip -qo "${zipPath}" -d "${TMP}"`, { stdio: 'inherit' })
  if (!existsSync(join(dir, 'food.csv'))) {
    throw new Error(`Expected food.csv under ${dir}`)
  }
  return dir
}

function singularize(word) {
  if (word.endsWith('ies')) return `${word.slice(0, -3)}y`
  if (word.endsWith('ses')) return word.slice(0, -2)
  if (word.endsWith('s') && !word.endsWith('ss')) return word.slice(0, -1)
  return word
}

/** Build English search aliases from USDA description style. */
function aliasesFromDescription(description) {
  const raw = description.toLowerCase().replace(/\s+/g, ' ').trim()
  const aliases = new Set()

  const includes = [...raw.matchAll(/includes?\s+([^)]+?)(?:\)|$)/g)].flatMap((m) =>
    m[1].split(/,| or |\/|;/).map((s) => s.trim()).filter((s) => s.length >= 3),
  )
  for (const inc of includes) aliases.add(inc)

  const noParen = raw.replace(/\([^)]*\)/g, ' ').replace(/\s+/g, ' ').trim()
  aliases.add(noParen)

  const parts = noParen
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean)

  if (parts.length === 0) return [...aliases]

  const head = parts[0]
  aliases.add(head)

  const BLOCKED = new Set([
    'raw', 'cooked', 'boiled', 'dried', 'frozen', 'canned', 'salt', 'unsalted',
    'sweetened', 'unsweetened', 'dehydrated', 'sulfured', 'mature', 'seeds', 'seed',
    'with skin', 'without skin', 'with salt', 'without salt', 'drained', 'heated',
    'unheated', 'microwave', 'prepared', 'recipe', 'flesh', 'skin', 'hearts',
  ])

  if (parts.length >= 2) {
    const second = parts[1]
    if (!BLOCKED.has(second)) {
      aliases.add(second)
      aliases.add(`${second} ${head}`)
      aliases.add(`${second} ${singularize(head)}`)
    }

    // "Beans, black, mature seeds…" → black beans
    if (CATEGORY_HEADS.has(head) || head.endsWith('s')) {
      aliases.add(`${second} ${head}`)
      aliases.add(`${second} ${singularize(head)}`)
    }

    // "Seeds, chia seeds, dried" → chia seeds already in second
    if (second.includes(singularize(head)) || second.includes(head)) {
      aliases.add(second)
    }
  }

  if (parts.length >= 3) {
    const third = parts[2]
    if (third.length >= 4 && !BLOCKED.has(third) && !/^(raw|cooked|boiled|dried|frozen|canned|salt|without|with)$/.test(third)) {
      aliases.add(third)
      aliases.add(`${third} ${singularize(head)}`)
    }
  }

  // Prefer shorter usable forms: drop ultra-long full strings from matching set later
  return [...aliases]
    .map((a) => a.replace(/[^a-z0-9%\s./-]/g, ' ').replace(/\s+/g, ' ').trim())
    .filter((a) => a.length >= 3 && a.length <= 48 && !BLOCKED.has(a))
}

function pickPortion(portions) {
  if (!portions.length) return { label: '100g', g: 100 }

  const scored = portions
    .map((p) => {
      const g = parseFloat(p.gram_weight)
      if (!Number.isFinite(g) || g <= 0 || g > 1000) return null
      const mod = `${p.modifier || ''} ${p.portion_description || ''}`.toLowerCase().trim()
      let score = 0
      if (/\bcup\b/.test(mod)) score += 50
      if (/\btbsp\b|tablespoon/.test(mod)) score += 40
      if (/\bslice\b/.test(mod)) score += 45
      if (/\bmedium\b/.test(mod)) score += 42
      if (/\blarge\b/.test(mod)) score += 30
      if (/\boz\b|ounce/.test(mod)) score += 35
      if (/\bserving\b/.test(mod)) score += 20
      if (/\bNLEA\b/i.test(mod)) score += 25
      if (g >= 20 && g <= 250) score += 10
      // Prefer amounts of 1
      if (parseFloat(p.amount) === 1) score += 5
      return { label: mod ? `1 ${mod}`.replace(/\s+/g, ' ').trim() : `${g}g`, g, score }
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score || Math.abs(a.g - 100) - Math.abs(b.g - 100))

  return scored[0] ? { label: scored[0].label, g: Math.round(scored[0].g * 100) / 100 } : { label: '100g', g: 100 }
}

function preferScore(description, categoryId) {
  const d = description.toLowerCase()
  let s = 0
  if (/without salt/.test(d)) s += 6
  if (/cooked, boiled/.test(d)) s += 10
  if (/all commercial varieties/.test(d)) s += 8
  if (/\bplain\b/.test(d)) s += 3
  if (/includes sourdough/.test(d) && /bread, french|bread, vienna/.test(d)) s += 20
  if (categoryId === '20' || categoryId === '16' || categoryId === '12' || categoryId === '9') s += 4
  if (categoryId === '8' && /oats, regular|oats, instant, fortified, plain/.test(d)) s += 12
  if (/, raw$|, raw,/.test(d)) s -= 1
  if (/restaurant|fast foods|canned, condensed|drink mix|gatorade/.test(d)) s -= 20
  if (/oil,|infant|babyfood|candies|alcoholic/.test(d)) s -= 15
  if (/quaker|post,|kellogg|general mills|malt-o-meal/.test(d)) s -= 4
  return s
}

async function main() {
  const dir = await ensureCsvDir()
  console.log('Reading CSVs from', dir)

  const foods = await readCsv(join(dir, 'food.csv'))
  const nutrients = await readCsv(join(dir, 'food_nutrient.csv'))
  const portions = await readCsv(join(dir, 'food_portion.csv'))

  const fiberByFdc = new Map()
  const kcalByFdc = new Map()
  for (const row of nutrients) {
    if (row.nutrient_id === FIBER_ID) fiberByFdc.set(row.fdc_id, parseFloat(row.amount))
    if (row.nutrient_id === ENERGY_ID) kcalByFdc.set(row.fdc_id, parseFloat(row.amount))
  }

  const portionsByFdc = new Map()
  for (const row of portions) {
    if (!portionsByFdc.has(row.fdc_id)) portionsByFdc.set(row.fdc_id, [])
    portionsByFdc.get(row.fdc_id).push(row)
  }

  /** @type {Map<string, object>} */
  const byId = new Map()

  for (const food of foods) {
    if (SKIP_CATEGORIES.has(String(food.food_category_id))) continue
    const fiber100g = fiberByFdc.get(food.fdc_id)
    if (fiber100g === undefined || Number.isNaN(fiber100g)) continue
    const kcal100g = kcalByFdc.get(food.fdc_id)
    if (kcal100g === undefined || Number.isNaN(kcal100g)) continue

    const serving = pickPortion(portionsByFdc.get(food.fdc_id) || [])
    let aliases = aliasesFromDescription(food.description)
    const prefer = preferScore(food.description, String(food.food_category_id))
    // Short aliases are collision-prone — only keep when the row is a strong default
    aliases = aliases.filter((a) => a.length >= 5 || prefer >= 8)
    if (aliases.length === 0) continue

    byId.set(food.fdc_id, {
      id: food.fdc_id,
      name: food.description,
      aliases,
      fiber100g: Math.round(fiber100g * 100) / 100,
      kcal100g: Math.round(kcal100g * 10) / 10,
      serving,
      _prefer: prefer,
    })
  }

  // Alias collision: keep higher-prefer / higher-fiber food for identical alias
  const aliasOwner = new Map()
  for (const food of byId.values()) {
    for (const alias of food.aliases) {
      const prevId = aliasOwner.get(alias)
      if (!prevId) {
        aliasOwner.set(alias, food.id)
        continue
      }
      const prev = byId.get(prevId)
      const score = (f) => (f._prefer || 0) * 1000 + f.fiber100g
      if (score(food) > score(prev)) aliasOwner.set(alias, food.id)
    }
  }

  const slim = []
  for (const food of byId.values()) {
    const aliases = food.aliases.filter((a) => aliasOwner.get(a) === food.id)
    // Always keep at least the cleaned full name if present
    if (aliases.length === 0) continue
    slim.push({
      id: food.id,
      name: food.name,
      aliases: [...new Set(aliases)].sort((a, b) => b.length - a.length),
      fiber100g: food.fiber100g,
      kcal100g: food.kcal100g,
      serving: food.serving,
    })
  }

  // Curated overlays win every colliding alias
  const curatedAlias = new Set(CURATED.flatMap((c) => c.aliases))
  for (const food of slim) {
    food.aliases = food.aliases.filter((a) => !curatedAlias.has(a))
  }
  for (const c of CURATED) slim.push(c)
  // Drop foods that lost all aliases to curated
  const filtered = slim.filter((f) => f.aliases.length > 0)
  slim.length = 0
  slim.push(...filtered)

  slim.sort((a, b) => a.name.localeCompare(b.name))

  const payload = {
    version: 1,
    source: 'USDA FoodData Central SR Legacy 2018-04 (+ curated supplements)',
    generatedAt: new Date().toISOString(),
    count: slim.length,
    foods: slim,
  }

  mkdirSync(dirname(OUT), { recursive: true })
  writeFileSync(OUT, JSON.stringify(payload))
  const bytes = Buffer.byteLength(JSON.stringify(payload))
  console.log(`Wrote ${OUT}`)
  console.log(`Foods: ${slim.length}`)
  console.log(`Raw JSON: ${(bytes / 1024).toFixed(1)} KB`)

  // Spot-check aliases
  const checks = ['chia seeds', 'psyllium', 'black beans', 'sourdough', 'avocado', 'lentils', 'oats']
  for (const q of checks) {
    const hit = slim.find((f) => f.aliases.some((a) => a === q || a.includes(q)))
    console.log(`  check "${q}":`, hit ? `${hit.name} (${hit.fiber100g}g/100g)` : 'MISS')
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
