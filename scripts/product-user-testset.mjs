/**
 * Product-facing user test set for Fibermaxxing meal parse.
 * Cases mirror how real users type meals — not architecture challenge cases.
 *
 * Run: node --import tsx scripts/product-user-testset.mjs
 * Optional: FIBER_USER_TEST_OUTPUT=path.json
 */
import fs from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import path from 'node:path'

const root = fileURLToPath(new URL('../', import.meta.url))
const { parseMeal } = await import(pathToFileURL(path.join(root, 'src/lib/parseMeal.ts')).href)
const { resolveMeal } = await import(pathToFileURL(path.join(root, 'src/lib/resolveMeal.ts')).href)

/** @typedef {{ id: string, persona: string, situation: string, input: string }} Case */

/** @type {Case[]} */
const CASES = [
  // —— Core: everyday logging ——
  {
    id: 'C01',
    persona: '日常打卡',
    situation: '单份水果，默认份量',
    input: '1 apple',
  },
  {
    id: 'C02',
    persona: '日常打卡',
    situation: '显式克数（最可信）',
    input: '100g apple',
  },
  {
    id: 'C03',
    persona: '早餐纤维',
    situation: '燕麦碗 + 籽 + 浆果',
    input: '1 cup cooked oatmeal, 1 tbsp chia seeds, 1/2 cup blueberries',
  },
  {
    id: 'C04',
    persona: '家常一餐',
    situation: '豆类 + 蔬菜 + 主食',
    input: '1 cup cooked lentils, broccoli, brown rice',
  },
  {
    id: 'C05',
    persona: '口语句',
    situation: '带 I ate / and 的自然句',
    input: 'I ate 2 eggs, 1 bowl of oatmeal, and an apple',
  },
  {
    id: 'C06',
    persona: '乳制品',
    situation: '裸词 milk → 全脂默认',
    input: 'milk',
  },
  {
    id: 'C07',
    persona: '乳制品',
    situation: '杯量牛奶',
    input: '1 cup milk',
  },
  {
    id: 'C08',
    persona: '蛋白',
    situation: '裸词 chicken（勿肉糜/炸鸡）',
    input: 'chicken',
  },
  {
    id: 'C09',
    persona: '补剂',
    situation: '汤匙奇亚籽',
    input: '2 tbsp chia seeds',
  },
  {
    id: 'C10',
    persona: '多提同一食物',
    situation: '同食物两次应累加',
    input: '100g apple, 200g apple',
  },

  // —— Core: estimate / recipe path ——
  {
    id: 'C11',
    persona: '外卖饮品',
    situation: '奶茶走估算，非纯牛奶',
    input: '1 milk tea',
  },
  {
    id: 'C12',
    persona: '外卖',
    situation: '披萨克数估算守恒',
    input: '200g pizza',
  },
  {
    id: 'C13',
    persona: '饮品',
    situation: '茶咖啡水可识别为零纤维',
    input: 'tea and coffee',
  },

  // —— Edge: portion correctness (product trust) ——
  {
    id: 'E01',
    persona: '份量信任',
    situation: '克数 + 尺寸词：克数优先',
    input: '100g small apple',
  },
  {
    id: 'E02',
    persona: '份量信任',
    situation: '勺量 vs 杯量（hummus）',
    input: '2 tbsp hummus',
  },
  {
    id: 'E03',
    persona: '份量信任',
    situation: '粒数 ≠ 杯数（杏仁）',
    input: '10 almonds',
  },
  {
    id: 'E04',
    persona: '份量信任',
    situation: '零份量 → 零营养',
    input: '0 tbsp apple',
  },
  {
    id: 'E05',
    persona: '拼写容错',
    situation: 'typo + 克数仍保留',
    input: '100g applo',
  },
  {
    id: 'E06',
    persona: '配方累加',
    situation: '重复奶茶应翻倍',
    input: 'milk tea, milk tea',
  },

  // —— Edge: identity / language ——
  {
    id: 'E07',
    persona: '身份',
    situation: '生西兰花 ≠ 熟行',
    input: '100g raw broccoli',
  },
  {
    id: 'E08',
    persona: '身份',
    situation: '鸡胸 ≠ 鸡肉卷',
    input: '100g grilled chicken breast',
  },
  {
    id: 'E09',
    persona: '复合词',
    situation: '植物油 ≠ 蔬菜份',
    input: '1 vegetable oil',
  },
  {
    id: 'E10',
    persona: '复合词',
    situation: '三明治不拆出一大杯花生酱',
    input: 'peanut butter and jelly sandwich',
  },
  {
    id: 'E11',
    persona: '否定',
    situation: '没吃的不计',
    input: 'I did not eat an apple',
  },
  {
    id: 'E12',
    persona: '否定范围',
    situation: 'without skin 不影响后面的苹果',
    input: 'chicken without skin and 1 apple',
  },
  {
    id: 'E13',
    persona: '列表分隔',
    situation: '加号列表',
    input: '1 apple + 2 bananas',
  },
  {
    id: 'E14',
    persona: '非食物',
    situation: '问候语不应估成植物',
    input: '你好',
  },
  {
    id: 'E15',
    persona: '词形数量',
    situation: '英文数量词',
    input: 'six bananas',
  },
  {
    id: 'E16',
    persona: '冷冻形态',
    situation: '冷冻蓝莓 + 克数',
    input: '100g frozen blueberries',
  },
]

function middle(input) {
  const { resolved, issues } = resolveMeal(input)
  const resolvedBits = resolved.map((r) => {
    const bits = [`${r.food.name.split(',')[0]}`]
    bits.push(`${r.amount}${r.unit === 'serving' ? '×srv' : r.unit}`)
    if (r.assumed) bits.push('assumed')
    if (r.needsConfirm) bits.push('confirm')
    return bits.join(' · ')
  })
  const issueBits = issues.map((iss) => {
    const q = iss.qty ? ` qty=${iss.qty.amount}${iss.qty.unit || ''}` : ''
    return `${iss.kind || 'issue'}:${iss.text.slice(0, 40)}${q}`
  })
  return {
    resolvedCount: resolved.length,
    issueCount: issues.length,
    summary: [...resolvedBits, ...issueBits].join(' | ') || '(empty)',
  }
}

function matchSummary(r) {
  if (!r.matches.length) {
    return `empty(${r.emptyKind || 'none'})`
  }
  return r.matches
    .map((m) => {
      const tag = m.tag || m.source
      return `${m.food.name.split(',')[0]} ${m.grams}g fiber=${m.fiberG} [${tag}/${m.confidence}]`
    })
    .join(' · ')
}

function finalSummary(r) {
  return {
    fiberG: r.totalFiberG,
    kcal: r.totalCalories,
    foods: r.matches.length,
    reliability: r.reliability,
    warnings: r.warnings.length,
  }
}

const rows = CASES.map((c) => {
  const mid = middle(c.input)
  const result = parseMeal(c.input)
  const fin = finalSummary(result)
  return {
    id: c.id,
    persona: c.persona,
    situation: c.situation,
    input: c.input,
    middle: mid.summary,
    middleMeta: { resolved: mid.resolvedCount, issues: mid.issueCount },
    match: matchSummary(result),
    final: `${fin.fiberG}g fiber · ${fin.kcal} kcal · ${fin.foods} food(s) · ${fin.reliability}`,
    finalMeta: fin,
    matches: result.matches.map((m) => ({
      name: m.food.name,
      id: m.food.id,
      grams: m.grams,
      fiberG: m.fiberG,
      calories: m.calories,
      source: m.source,
      tag: m.tag,
      confidence: m.confidence,
      assumed: m.assumed,
      needsConfirm: m.needsConfirm,
    })),
    emptyKind: result.emptyKind,
    unmatchedHints: result.unmatchedHints,
    reliability: result.reliability,
  }
})

const report = {
  generatedAt: new Date().toISOString(),
  product: 'Fibermaxxing meal parse — user perspective',
  note: 'Core = everyday logging paths. Edge = trust/identity boundaries that previously caused wrong numbers or false foods.',
  total: rows.length,
  core: rows.filter((r) => r.id.startsWith('C')).length,
  edge: rows.filter((r) => r.id.startsWith('E')).length,
  byReliability: rows.reduce((acc, r) => {
    acc[r.reliability] = (acc[r.reliability] || 0) + 1
    return acc
  }, {}),
  rows,
}

const out =
  process.env.FIBER_USER_TEST_OUTPUT ||
  path.join(root, 'reports/2026-10-26/product-user-testset.json')
fs.mkdirSync(path.dirname(out), { recursive: true })
fs.writeFileSync(out, JSON.stringify(report, null, 2))

console.log(`Wrote ${out}`)
console.log(JSON.stringify({ total: report.total, core: report.core, edge: report.edge, byReliability: report.byReliability }))
for (const r of rows) {
  console.log('---')
  console.log(`${r.id} [${r.persona}] ${r.situation}`)
  console.log(`IN   ${r.input}`)
  console.log(`MID  ${r.middle}`)
  console.log(`MATCH ${r.match}`)
  console.log(`OUT  ${r.final}`)
}
