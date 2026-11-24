/**
 * Reviewed additions and corrections on top of the USDA SR Legacy extract.
 *
 * 1. SERVING_FIXES — SR Legacy often stores a "0.5 cup" portion; the old build
 *    script labeled it "1 cup" with half-cup grams (e.g. cooked broccoli 78 g).
 *    These rows get the real 1-cup weight from USDA household measures.
 * 2. CURATED_EXTRA — common foods missing from SR Legacy, mostly packaged
 *    high-fiber products. Values are typical U.S. Nutrition Facts labels
 *    (checked 2026-11); brands reformulate, so the UI still lets users edit grams.
 */

export type CuratedRow = {
  id: string
  name: string
  aliases: string[]
  fiber100g: number
  kcal100g: number
  serving: { label: string; g: number }
}

/** USDA FDC id → corrected default serving. */
export const SERVING_FIXES: Record<string, { label: string; g: number }> = {
  // Cooked vegetables stored as half-cup portions
  '169967': { label: '1 cup, chopped', g: 156 }, // broccoli, cooked
  '168510': { label: '1 cup, chopped', g: 156 },
  '170380': { label: '1 cup', g: 184 }, // broccoli, frozen spears, cooked
  '169971': { label: '1 cup', g: 156 }, // brussels sprouts, cooked
  '168513': { label: '1 cup', g: 156 },
  '170394': { label: '1 cup slices', g: 156 }, // carrots, cooked
  '169339': { label: '1 cup slices', g: 156 },
  '169976': { label: '1 cup, shredded', g: 150 }, // cabbage, cooked
  '168514': { label: '1 cup, shredded', g: 150 },
  '169978': { label: '1 cup, shredded', g: 150 }, // red cabbage, cooked
  '168515': { label: '1 cup, shredded', g: 150 },
  '170397': { label: '1 cup (1" pieces)', g: 124 }, // cauliflower, cooked
  '168520': { label: '1 cup (1" pieces)', g: 124 },
  '168386': { label: '1 cup hearts', g: 168 }, // artichoke hearts, cooked
  '169311': { label: '1 cup hearts', g: 168 },
  '168390': { label: '1 cup', g: 180 }, // asparagus, cooked
  '169313': { label: '1 cup', g: 180 },
  '169146': { label: '1 cup slices', g: 170 }, // beets, cooked
  '168506': { label: '1 cup slices', g: 170 },
  '169261': { label: '1 cup slices', g: 160 }, // okra, cooked
  '170098': { label: '1 cup slices', g: 160 },
  '169263': { label: '1 cup slices', g: 184 }, // okra, frozen, cooked
  '170009': { label: '1 cup slices', g: 156 }, // parsnips, cooked
  '170018': { label: '1 cup', g: 160 }, // peas and carrots, frozen, cooked
  '170104': { label: '1 cup', g: 170 }, // peas, canned, no salt, drained
  '170033': { label: '1 cup', g: 122 }, // potato, baked, flesh
  '170112': { label: '1 cup', g: 122 },
  '170111': { label: '1 cup', g: 122 },
  '170440': { label: '1 cup', g: 156 }, // potato, boiled, flesh
  '169288': { label: '1 cup', g: 190 }, // spinach, frozen, cooked
  '170472': { label: '1 cup', g: 182 }, // mixed vegetables, frozen, cooked
  '168426': { label: '1 cup, chopped or diced', g: 104 }, // leeks, cooked
  '170067': { label: '1 cup slices', g: 140 }, // water chestnuts, canned
  '170459': { label: '1 cup', g: 262 }, // tomato paste
  '172880': { label: '1 cup', g: 252 }, // pizza sauce
  '167804': { label: '1 cup', g: 277 }, // cranberry sauce, jellied
  '167803': { label: '1 cup', g: 277 },
  // Raw rows stored as half-cup portions
  '169335': { label: '1 cup, shredded', g: 70 }, // cabbage, raw
  '169336': { label: '1 cup, shredded', g: 70 },
  '168409': { label: '1 cup slices', g: 104 }, // cucumber with peel
  // Cereals whose "1 cup" is really the label serving
  '171647': { label: '1 cup', g: 116 }, // Grape-Nuts (label: 1/2 cup = 58 g)
  '173888': { label: '1 cup', g: 40 }, // Post Bran Flakes (label: 3/4 cup = 30 g)
  '173910': { label: '2 biscuits', g: 47 }, // Shredded Wheat big biscuit
  // Hemp hearts: 30 g is 3 tbsp, not 1
  '170148': { label: '3 tbsp', g: 30 },
}

const label = (fiberPerServing: number, g: number) => Math.round((fiberPerServing / g) * 1000) / 10

/** Missing everyday foods and common packaged high-fiber products. */
export const CURATED_EXTRA: CuratedRow[] = [
  // — Everyday foods missing or mis-modeled in SR Legacy —
  { id: 'curated:edamame', name: 'Edamame, shelled, cooked', aliases: ['edamame'], fiber100g: 5.2, kcal100g: 121, serving: { label: '1 cup', g: 155 } },
  // USDA 174924 values, without the "includes soft bread crumbs" name that confuses matching.
  { id: 'curated:white-bread', name: 'Bread, white, commercially prepared', aliases: ['white bread'], fiber100g: 2.7, kcal100g: 266, serving: { label: '1 slice', g: 28 } },
  { id: 'curated:mixed-berries', name: 'Mixed berries (strawberry, blueberry, raspberry, blackberry)', aliases: ['mixed berries'], fiber100g: 4.2, kcal100g: 48, serving: { label: '1 cup', g: 145 } },
  { id: 'curated:granola', name: 'Granola, store-bought (typical)', aliases: ['granola'], fiber100g: 6, kcal100g: 450, serving: { label: '1/2 cup', g: 55 } },
  { id: 'curated:guacamole', name: 'Guacamole', aliases: ['guacamole', 'guac'], fiber100g: 5.5, kcal100g: 155, serving: { label: '2 tbsp', g: 30 } },
  { id: 'curated:lentil-soup', name: 'Lentil soup (typical, 1 cup)', aliases: ['lentil soup'], fiber100g: 2.4, kcal100g: 65, serving: { label: '1 cup', g: 245 } },
  { id: 'curated:split-pea-soup', name: 'Split pea soup (typical, 1 cup)', aliases: ['split pea soup'], fiber100g: 2.0, kcal100g: 70, serving: { label: '1 cup', g: 245 } },
  { id: 'curated:bean-burrito', name: 'Bean burrito (typical)', aliases: ['bean burrito'], fiber100g: 4.0, kcal100g: 200, serving: { label: '1 burrito', g: 200 } },
  { id: 'curated:protein-powder', name: 'Whey protein powder', aliases: ['protein powder', 'whey protein'], fiber100g: 0, kcal100g: 390, serving: { label: '1 scoop', g: 31 } },
  { id: 'curated:plant-protein', name: 'Plant protein powder (pea/brown rice, typical)', aliases: ['plant protein powder', 'pea protein'], fiber100g: label(2, 33), kcal100g: 380, serving: { label: '1 scoop', g: 33 } },
  { id: 'curated:protein-bar', name: 'Protein bar (typical)', aliases: ['protein bar'], fiber100g: label(4, 60), kcal100g: 350, serving: { label: '1 bar', g: 60 } },

  // — Fiber supplements (label serving) —
  { id: 'pkg:metamucil', name: 'Metamucil psyllium powder (1 dose)', aliases: ['metamucil'], fiber100g: label(3, 5.8), kcal100g: 260, serving: { label: '1 dose (1 rounded tsp, sugar-free)', g: 5.8 } },
  { id: 'pkg:metamucil-capsules', name: 'Metamucil capsules (5 capsules)', aliases: ['metamucil capsules'], fiber100g: label(2.6, 3.6), kcal100g: 280, serving: { label: '5 capsules', g: 3.6 } },
  { id: 'pkg:benefiber', name: 'Benefiber (wheat dextrin, 2 tsp)', aliases: ['benefiber'], fiber100g: label(3, 4), kcal100g: 375, serving: { label: '2 tsp', g: 4 } },
  { id: 'pkg:citrucel', name: 'Citrucel (methylcellulose, 1 dose)', aliases: ['citrucel'], fiber100g: label(2, 10.2), kcal100g: 235, serving: { label: '1 dose', g: 10.2 } },

  // — Cereals —
  { id: 'pkg:fiber-one-cereal', name: 'Fiber One Original cereal', aliases: ['fiber one cereal'], fiber100g: label(18, 40), kcal100g: 225, serving: { label: '2/3 cup', g: 40 } },
  { id: 'pkg:all-bran', name: "All-Bran Original cereal (Kellogg's)", aliases: ['all bran'], fiber100g: label(10, 31), kcal100g: 260, serving: { label: '1/2 cup', g: 31 } },
  { id: 'pkg:raisin-bran', name: "Raisin Bran cereal (Kellogg's)", aliases: ['raisin bran'], fiber100g: label(7, 59), kcal100g: 322, serving: { label: '1 cup', g: 59 } },
  { id: 'pkg:kashi-go', name: 'Kashi GO Original cereal', aliases: ['kashi go'], fiber100g: label(13, 52), kcal100g: 346, serving: { label: '1 1/4 cup', g: 52 } },
  { id: 'pkg:honey-nut-cheerios', name: 'Honey Nut Cheerios', aliases: ['honey nut cheerios'], fiber100g: label(3, 37), kcal100g: 378, serving: { label: '1 cup', g: 37 } },
  { id: 'pkg:special-k', name: "Special K Original cereal (Kellogg's)", aliases: ['special k'], fiber100g: label(1, 31), kcal100g: 390, serving: { label: '1 cup', g: 31 } },
  { id: 'pkg:corn-flakes', name: "Corn Flakes (Kellogg's)", aliases: ['corn flakes'], fiber100g: label(1, 28), kcal100g: 357, serving: { label: '1 cup', g: 28 } },

  // — Bars —
  { id: 'pkg:fiber-one-bar', name: 'Fiber One Chewy Bar, Oats & Chocolate', aliases: ['fiber one bar'], fiber100g: label(9, 40), kcal100g: 350, serving: { label: '1 bar', g: 40 } },
  { id: 'pkg:quest-bar', name: 'Quest protein bar', aliases: ['quest bar'], fiber100g: label(14, 60), kcal100g: 330, serving: { label: '1 bar', g: 60 } },
  { id: 'pkg:clif-bar', name: 'Clif Bar (chocolate chip)', aliases: ['clif bar'], fiber100g: label(4, 68), kcal100g: 368, serving: { label: '1 bar', g: 68 } },
  { id: 'pkg:kind-bar', name: 'KIND bar, dark chocolate nuts & sea salt', aliases: ['kind bar'], fiber100g: label(7, 40), kcal100g: 450, serving: { label: '1 bar', g: 40 } },
  { id: 'pkg:rxbar', name: 'RXBAR (chocolate sea salt)', aliases: ['rxbar'], fiber100g: label(5, 52), kcal100g: 404, serving: { label: '1 bar', g: 52 } },
  { id: 'pkg:larabar', name: 'Larabar (typical flavor)', aliases: ['larabar'], fiber100g: label(3, 45), kcal100g: 450, serving: { label: '1 bar', g: 45 } },
  { id: 'pkg:nature-valley', name: 'Nature Valley Crunchy granola bars (2-bar pouch)', aliases: ['nature valley bar'], fiber100g: label(2, 42), kcal100g: 452, serving: { label: '1 pouch (2 bars)', g: 42 } },

  // — Breads, wraps, crackers —
  { id: 'pkg:daves-21', name: "Dave's Killer Bread, 21 Whole Grains and Seeds", aliases: ['daves killer bread'], fiber100g: label(5, 45), kcal100g: 244, serving: { label: '1 slice', g: 45 } },
  { id: 'pkg:ezekiel', name: 'Ezekiel 4:9 sprouted whole grain bread', aliases: ['ezekiel bread'], fiber100g: label(3, 34), kcal100g: 235, serving: { label: '1 slice', g: 34 } },
  { id: 'pkg:ww-english-muffin', name: 'English muffin, whole wheat', aliases: ['whole wheat english muffin'], fiber100g: 6.7, kcal100g: 203, serving: { label: '1 muffin', g: 66 } },
  { id: 'pkg:triscuit', name: 'Triscuit Original crackers', aliases: ['triscuit'], fiber100g: label(3, 28), kcal100g: 429, serving: { label: '6 crackers', g: 28 } },
  { id: 'pkg:wasa-rye', name: 'Wasa Light Rye crispbread', aliases: ['wasa crispbread'], fiber100g: label(2, 10), kcal100g: 350, serving: { label: '1 slice', g: 10 } },
]
