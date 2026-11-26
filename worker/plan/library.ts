/**
 * Meal library for the paid 30-day plan.
 *
 * Each item's `t` is written the way a person would type it into the calculator, so the
 * build script (scripts/build-plan-content.mjs) can run it through parseMeal and store the
 * exact gram count the free calculator would show. `with` lists low-fiber parts of the meal
 * (protein, dairy, sauces) that are shown but not counted.
 *
 * Tracks: std = Standard, glp1 = GLP-1 (smaller plates), gentle = Gentle gut
 * (soluble fiber first; `legume: true` meals only from week 3, in small portions).
 */
export type Slot = 'breakfast' | 'lunch' | 'dinner' | 'snack'
export type Track = 'std' | 'glp1' | 'gentle'
export type ShopCat = 'Produce' | 'Grains & bread' | 'Beans & lentils' | 'Nuts & seeds' | 'Other'

export type LibItem = { t: string; shop: string; cat: ShopCat }
export type LibMeal = {
  id: string
  slot: Slot
  name: string
  tracks: Track[]
  items: LibItem[]
  with?: string
  legume?: boolean
  prep?: string
}

const P = (t: string, shop: string): LibItem => ({ t, shop, cat: 'Produce' })
const G = (t: string, shop: string): LibItem => ({ t, shop, cat: 'Grains & bread' })
const B = (t: string, shop: string): LibItem => ({ t, shop, cat: 'Beans & lentils' })
const N = (t: string, shop: string): LibItem => ({ t, shop, cat: 'Nuts & seeds' })
const O = (t: string, shop: string): LibItem => ({ t, shop, cat: 'Other' })

export const LIBRARY: LibMeal[] = [
  // ——— Breakfast ———
  { id: 'b-oats-rasp', slot: 'breakfast', name: 'Raspberry overnight oats', tracks: ['std'],
    items: [G('1/2 cup rolled oats', 'Rolled oats'), P('1/2 cup raspberries', 'Raspberries (frozen is fine)'), N('1 tbsp chia seeds', 'Chia seeds')],
    with: 'milk or yogurt', prep: 'Mix the night before and keep in the fridge.' },
  { id: 'b-oats-small', slot: 'breakfast', name: 'Small overnight oats', tracks: ['glp1', 'std'],
    items: [G('1/3 cup rolled oats', 'Rolled oats'), P('1/2 cup raspberries', 'Raspberries (frozen is fine)'), N('1 tsp chia seeds', 'Chia seeds')],
    with: 'Greek yogurt', prep: 'Mix the night before and keep in the fridge.' },
  { id: 'b-oatmeal-straw', slot: 'breakfast', name: 'Warm oatmeal with strawberries', tracks: ['gentle', 'glp1', 'std'],
    items: [G('1 cup cooked oatmeal', 'Rolled oats'), P('1/2 cup strawberries', 'Strawberries'), N('1 tsp chia seeds', 'Chia seeds')] },
  { id: 'b-oatmeal-kiwi', slot: 'breakfast', name: 'Oatmeal with kiwi and flax', tracks: ['gentle', 'std'],
    items: [G('1 cup cooked oatmeal', 'Rolled oats'), P('1 kiwi', 'Kiwis'), N('1 tbsp ground flaxseed', 'Ground flaxseed')] },
  { id: 'b-chia-kiwi', slot: 'breakfast', name: 'Kiwi chia pudding', tracks: ['gentle', 'std'],
    items: [N('2 tbsp chia seeds', 'Chia seeds'), P('1 kiwi', 'Kiwis')],
    with: 'milk or lactose-free milk', prep: 'Stir chia into milk the night before.' },
  { id: 'b-chia-small', slot: 'breakfast', name: 'Small chia pudding with blueberries', tracks: ['glp1', 'gentle'],
    items: [N('1 tbsp chia seeds', 'Chia seeds'), P('1/2 cup blueberries', 'Blueberries')],
    with: 'milk or lactose-free milk', prep: 'Stir chia into milk the night before.' },
  { id: 'b-bran-blue', slot: 'breakfast', name: 'Bran flakes with blueberries', tracks: ['std'],
    items: [G('1 cup bran flakes', 'Bran flakes cereal'), P('1/2 cup blueberries', 'Blueberries')], with: 'milk' },
  { id: 'b-pb-banana', slot: 'breakfast', name: 'Peanut butter banana toast', tracks: ['std'],
    items: [G('2 slices whole wheat bread', 'Whole wheat bread'), P('1 banana', 'Bananas'), N('1 tbsp peanut butter', 'Peanut butter')] },
  { id: 'b-pb-toast-small', slot: 'breakfast', name: 'Peanut butter toast with strawberries', tracks: ['glp1', 'gentle'],
    items: [G('1 slice whole wheat bread', 'Whole wheat bread'), N('1 tbsp peanut butter', 'Peanut butter'), P('1/2 cup strawberries', 'Strawberries')] },
  { id: 'b-avo-toast', slot: 'breakfast', name: 'Avocado toast with eggs', tracks: ['std'],
    items: [G('2 slices whole wheat bread', 'Whole wheat bread'), P('1/2 avocado', 'Avocados')], with: '2 eggs' },
  { id: 'b-yogurt-flax', slot: 'breakfast', name: 'Yogurt bowl with raspberries and flax', tracks: ['std', 'glp1'],
    items: [P('1/2 cup raspberries', 'Raspberries (frozen is fine)'), N('2 tbsp ground flaxseed', 'Ground flaxseed')], with: '1 cup Greek yogurt' },
  { id: 'b-muffin-egg', slot: 'breakfast', name: 'Egg muffin with an orange', tracks: ['std', 'glp1'],
    items: [G('1 whole wheat english muffin', 'Whole wheat English muffins'), P('1 orange', 'Oranges')], with: '1 egg' },
  { id: 'b-burrito', slot: 'breakfast', name: 'Black bean breakfast burrito', tracks: ['std'], legume: true,
    items: [G('1 whole wheat tortilla', 'Whole wheat tortillas'), B('1/2 cup black beans', 'Canned black beans')], with: 'eggs and salsa' },
  { id: 'b-smoothie', slot: 'breakfast', name: 'Raspberry banana smoothie', tracks: ['std'],
    items: [P('1 cup frozen raspberries', 'Raspberries (frozen is fine)'), P('1 banana', 'Bananas'), N('1 tbsp chia seeds', 'Chia seeds'), P('1 cup spinach', 'Baby spinach')], with: 'milk' },
  { id: 'b-oatbran', slot: 'breakfast', name: 'Oat bran porridge with banana', tracks: ['gentle', 'std'],
    items: [G('1 cup cooked oat bran', 'Oat bran'), P('1/2 banana', 'Bananas')] },

  // ——— Lunch ———
  { id: 'l-hummus-wrap', slot: 'lunch', name: 'Hummus chicken wrap', tracks: ['std'],
    items: [G('1 whole wheat tortilla', 'Whole wheat tortillas'), B('1/4 cup hummus', 'Hummus'), P('1 cup spinach', 'Baby spinach')], with: 'chicken' },
  { id: 'l-hummus-half', slot: 'lunch', name: 'Half hummus wrap', tracks: ['glp1'],
    items: [G('1/2 whole wheat tortilla', 'Whole wheat tortillas'), B('2 tbsp hummus', 'Hummus'), P('1 cup spinach', 'Baby spinach')], with: 'chicken' },
  { id: 'l-bean-bowl', slot: 'lunch', name: 'Black bean rice bowl', tracks: ['std'], legume: true,
    items: [B('1/2 cup black beans', 'Canned black beans'), G('1/2 cup brown rice', 'Brown rice'), P('1/2 cup corn', 'Frozen corn')], with: 'salsa' },
  { id: 'l-lentil-carrot', slot: 'lunch', name: 'Lentil and carrot soup', tracks: ['std', 'glp1'], legume: true,
    items: [B('1/2 cup cooked lentils', 'Lentils (dry or canned)'), P('1/2 cup cooked carrots', 'Carrots')], with: 'broth', prep: 'Make a pot on Sunday; it keeps 4 days.' },
  { id: 'l-chickpea-salad', slot: 'lunch', name: 'Chickpea cucumber salad', tracks: ['std'], legume: true,
    items: [B('1/2 cup chickpeas', 'Canned chickpeas'), P('1 cup cucumber', 'Cucumbers'), P('1 cup mixed salad greens', 'Salad greens')], with: 'feta and olive oil' },
  { id: 'l-turkey-apple', slot: 'lunch', name: 'Turkey sandwich and an apple', tracks: ['std'],
    items: [G('2 slices whole wheat bread', 'Whole wheat bread'), P('1 apple', 'Apples')], with: 'turkey' },
  { id: 'l-quinoa-carrot', slot: 'lunch', name: 'Quinoa carrot bowl', tracks: ['gentle', 'glp1', 'std'],
    items: [G('1/2 cup cooked quinoa', 'Quinoa'), P('1/2 cup cooked carrots', 'Carrots')], with: 'chicken' },
  { id: 'l-edamame-bowl', slot: 'lunch', name: 'Edamame rice bowl', tracks: ['std'],
    items: [P('1 cup edamame', 'Frozen shelled edamame'), G('1/2 cup brown rice', 'Brown rice'), P('1 cup bell pepper strips', 'Bell peppers')], with: 'soy sauce' },
  { id: 'l-potato', slot: 'lunch', name: 'Baked potato with broccoli', tracks: ['gentle', 'std', 'glp1'],
    items: [P('1 baked potato', 'Potatoes'), P('1/2 cup broccoli', 'Broccoli')], with: 'cottage cheese or tuna' },
  { id: 'l-quinoa-spinach', slot: 'lunch', name: 'Warm quinoa with spinach', tracks: ['gentle', 'glp1'],
    items: [G('1/2 cup cooked quinoa', 'Quinoa'), P('1/2 cup cooked spinach', 'Baby spinach'), P('1/2 cup cooked carrots', 'Carrots')], with: 'salmon or eggs' },
  { id: 'l-lentil-small', slot: 'lunch', name: 'Small lentil salad', tracks: ['gentle', 'glp1'], legume: true,
    items: [B('1/4 cup chickpeas', 'Canned chickpeas'), P('1 cup mixed salad greens', 'Salad greens'), P('1 cup cucumber', 'Cucumbers')], with: 'tuna and olive oil', prep: 'Rinse canned chickpeas well; it makes them easier to digest.' },
  { id: 'l-barley-veg', slot: 'lunch', name: 'Barley vegetable bowl', tracks: ['std', 'gentle'],
    items: [G('1/2 cup cooked barley', 'Pearl barley'), P('1/2 cup cooked carrots', 'Carrots'), P('1/2 cup green beans', 'Green beans')], with: 'chicken' },

  // ——— Dinner ———
  { id: 'd-salmon-quinoa', slot: 'dinner', name: 'Salmon, quinoa and broccoli', tracks: ['std', 'glp1'],
    items: [G('1/2 cup cooked quinoa', 'Quinoa'), P('1/2 cup broccoli', 'Broccoli')], with: 'salmon fillet' },
  { id: 'd-salmon-beans', slot: 'dinner', name: 'Salmon with green beans', tracks: ['gentle', 'glp1'],
    items: [P('1/2 cup green beans', 'Green beans'), G('1/2 cup cooked quinoa', 'Quinoa')], with: 'salmon fillet' },
  { id: 'd-chili', slot: 'dinner', name: 'Turkey bean chili', tracks: ['std'], legume: true,
    items: [B('1/2 cup kidney beans', 'Canned kidney beans'), B('1/2 cup black beans', 'Canned black beans'), P('1/2 cup corn', 'Frozen corn')], with: 'ground turkey and canned tomatoes', prep: 'Double it; leftovers freeze well.' },
  { id: 'd-pasta-peas', slot: 'dinner', name: 'Whole wheat pasta with peas', tracks: ['std'],
    items: [G('1 cup cooked whole wheat pasta', 'Whole wheat pasta'), P('1/2 cup frozen peas', 'Frozen peas'), P('1 cup spinach', 'Baby spinach')], with: 'parmesan and olive oil' },
  { id: 'd-sheetpan', slot: 'dinner', name: 'Sheet-pan chicken, sweet potato and Brussels sprouts', tracks: ['std'],
    items: [P('1 medium sweet potato', 'Sweet potatoes'), P('1 cup brussels sprouts', 'Brussels sprouts')], with: 'chicken thighs' },
  { id: 'd-lentil-pasta', slot: 'dinner', name: 'Lentil bolognese', tracks: ['std'], legume: true,
    items: [G('1 cup cooked whole wheat pasta', 'Whole wheat pasta'), B('1/2 cup cooked lentils', 'Lentils (dry or canned)')], with: 'tomato sauce' },
  { id: 'd-tacos', slot: 'dinner', name: 'Fish tacos with avocado', tracks: ['std'],
    items: [G('2 corn tortillas', 'Corn tortillas'), P('1/2 avocado', 'Avocados'), P('1/2 cup corn', 'Frozen corn')], with: 'white fish and lime' },
  { id: 'd-stirfry', slot: 'dinner', name: 'Chicken broccoli stir-fry', tracks: ['std', 'glp1'],
    items: [G('1/2 cup brown rice', 'Brown rice'), P('1 cup broccoli', 'Broccoli'), P('1/2 cup snow peas', 'Snow peas')], with: 'chicken and soy sauce' },
  { id: 'd-potato-carrot', slot: 'dinner', name: 'Roast chicken, potato and carrots', tracks: ['gentle', 'glp1', 'std'],
    items: [P('1 baked potato', 'Potatoes'), P('1/2 cup cooked carrots', 'Carrots')], with: 'roast chicken' },
  { id: 'd-shrimp-zucchini', slot: 'dinner', name: 'Shrimp, brown rice and zucchini', tracks: ['gentle', 'glp1'],
    items: [G('1/2 cup brown rice', 'Brown rice'), P('1 cup zucchini', 'Zucchini')], with: 'shrimp' },
  { id: 'd-burrito-bowl', slot: 'dinner', name: 'Black bean burrito bowl', tracks: ['std'], legume: true,
    items: [B('1/2 cup black beans', 'Canned black beans'), G('1/2 cup brown rice', 'Brown rice'), P('1/2 avocado', 'Avocados')], with: 'chicken and salsa' },
  { id: 'd-sweetpotato-small', slot: 'dinner', name: 'Turkey meatballs with sweet potato', tracks: ['glp1', 'std'],
    items: [P('1 medium sweet potato', 'Sweet potatoes'), P('1/2 cup green beans', 'Green beans')], with: 'turkey meatballs' },
  { id: 'd-eggplant', slot: 'dinner', name: 'Roast eggplant and quinoa', tracks: ['gentle', 'std'],
    items: [P('1 cup cooked eggplant', 'Eggplant'), G('1/2 cup cooked quinoa', 'Quinoa'), P('1/2 cup cooked spinach', 'Baby spinach')], with: 'chicken or tofu' },
  { id: 'd-chickpea-curry', slot: 'dinner', name: 'Small chickpea and spinach curry', tracks: ['gentle', 'glp1', 'std'], legume: true,
    items: [B('1/4 cup chickpeas', 'Canned chickpeas'), P('1/2 cup cooked spinach', 'Baby spinach'), G('1/2 cup brown rice', 'Brown rice')], with: 'chicken and coconut milk' },

  // ——— Snacks ———
  { id: 's-pear', slot: 'snack', name: 'A pear', tracks: ['std', 'glp1'], items: [P('1 pear', 'Pears')] },
  { id: 's-apple-pb', slot: 'snack', name: 'Apple with peanut butter', tracks: ['std'], items: [P('1 apple', 'Apples'), N('1 tbsp peanut butter', 'Peanut butter')] },
  { id: 's-popcorn', slot: 'snack', name: 'Popcorn', tracks: ['std', 'gentle'], items: [G('3 cups popcorn', 'Popcorn kernels')] },
  { id: 's-almonds', slot: 'snack', name: 'Almonds', tracks: ['std', 'glp1'], items: [N('1 oz almonds', 'Almonds')] },
  { id: 's-kiwi2', slot: 'snack', name: 'Two kiwis', tracks: ['gentle', 'std', 'glp1'], items: [P('2 kiwi', 'Kiwis')] },
  { id: 's-kiwi', slot: 'snack', name: 'A kiwi', tracks: ['glp1', 'gentle'], items: [P('1 kiwi', 'Kiwis')] },
  { id: 's-hummus-carrot', slot: 'snack', name: 'Carrots and hummus', tracks: ['std'], items: [P('1 cup carrots', 'Carrots'), B('1/4 cup hummus', 'Hummus')] },
  { id: 's-edamame', slot: 'snack', name: 'Edamame', tracks: ['std', 'glp1'], items: [P('1/2 cup edamame', 'Frozen shelled edamame')] },
  { id: 's-orange', slot: 'snack', name: 'An orange', tracks: ['std', 'gentle', 'glp1'], items: [P('1 orange', 'Oranges')] },
  { id: 's-rasp', slot: 'snack', name: 'A cup of raspberries', tracks: ['std'], items: [P('1 cup raspberries', 'Raspberries (frozen is fine)')] },
  { id: 's-straw', slot: 'snack', name: 'Strawberries', tracks: ['gentle', 'glp1'], items: [P('1 cup strawberries', 'Strawberries')] },
  { id: 's-walnuts', slot: 'snack', name: 'Walnuts and blueberries', tracks: ['gentle', 'std'], items: [N('1 oz walnuts', 'Walnuts'), P('1/2 cup blueberries', 'Blueberries')] },
  { id: 's-pumpkin', slot: 'snack', name: 'Pumpkin yogurt', tracks: ['gentle', 'glp1'], items: [P('1/2 cup canned pumpkin', 'Canned pumpkin')], with: 'Greek yogurt and cinnamon' },
]
