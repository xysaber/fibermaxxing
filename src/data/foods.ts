export type FoodItem = {
  id: string
  name: string
  aliases: string[]
  fiberG: number
  serving: string
  calories: number
  /** Rough GLP-1 / satiety proxy 1–10 based on soluble fiber + volume */
  glpScore: number
}

/** Curated high-signal fiber foods for MVP NL matching (USDA-approximate). */
export const FOODS: FoodItem[] = [
  { id: 'chia', name: 'Chia seeds', aliases: ['chia', 'chia seed', 'chia seeds'], fiberG: 10, serving: '2 tbsp (28g)', calories: 138, glpScore: 9 },
  { id: 'psyllium', name: 'Psyllium husk', aliases: ['psyllium', 'psyllium husk', 'metamucil'], fiberG: 7, serving: '1 tbsp (9g)', calories: 30, glpScore: 10 },
  { id: 'flax', name: 'Flaxseed', aliases: ['flax', 'flaxseed', 'flax seed', 'ground flax'], fiberG: 8, serving: '2 tbsp (20g)', calories: 110, glpScore: 8 },
  { id: 'oatmeal', name: 'Oatmeal', aliases: ['oatmeal', 'oats', 'oat', 'porridge', 'bowl of oatmeal'], fiberG: 4, serving: '1 cup cooked', calories: 158, glpScore: 7 },
  { id: 'apple', name: 'Apple', aliases: ['apple', 'an apple', 'apples'], fiberG: 4.4, serving: '1 medium', calories: 95, glpScore: 6 },
  { id: 'banana', name: 'Banana', aliases: ['banana', 'a banana', 'bananas'], fiberG: 3.1, serving: '1 medium', calories: 105, glpScore: 4 },
  { id: 'avocado', name: 'Avocado', aliases: ['avocado', 'an avocado', 'avos'], fiberG: 10, serving: '1 medium', calories: 240, glpScore: 8 },
  { id: 'broccoli', name: 'Broccoli', aliases: ['broccoli'], fiberG: 5.1, serving: '1 cup cooked', calories: 55, glpScore: 6 },
  { id: 'lentils', name: 'Lentils', aliases: ['lentil', 'lentils', 'dal'], fiberG: 15.6, serving: '1 cup cooked', calories: 230, glpScore: 9 },
  { id: 'black-beans', name: 'Black beans', aliases: ['black beans', 'black bean'], fiberG: 15, serving: '1 cup cooked', calories: 227, glpScore: 9 },
  { id: 'chickpeas', name: 'Chickpeas', aliases: ['chickpea', 'chickpeas', 'garbanzo'], fiberG: 12.5, serving: '1 cup cooked', calories: 269, glpScore: 8 },
  { id: 'quinoa', name: 'Quinoa', aliases: ['quinoa'], fiberG: 5.2, serving: '1 cup cooked', calories: 222, glpScore: 5 },
  { id: 'brown-rice', name: 'Brown rice', aliases: ['brown rice'], fiberG: 3.5, serving: '1 cup cooked', calories: 218, glpScore: 3 },
  { id: 'whole-wheat-bread', name: 'Whole wheat bread', aliases: ['whole wheat bread', 'wholewheat bread', 'wheat bread', 'toast'], fiberG: 2, serving: '1 slice', calories: 80, glpScore: 3 },
  { id: 'pear', name: 'Pear', aliases: ['pear', 'a pear', 'pears'], fiberG: 5.5, serving: '1 medium', calories: 101, glpScore: 6 },
  { id: 'raspberries', name: 'Raspberries', aliases: ['raspberry', 'raspberries'], fiberG: 8, serving: '1 cup', calories: 64, glpScore: 7 },
  { id: 'blackberries', name: 'Blackberries', aliases: ['blackberry', 'blackberries'], fiberG: 7.6, serving: '1 cup', calories: 62, glpScore: 7 },
  { id: 'blueberries', name: 'Blueberries', aliases: ['blueberry', 'blueberries'], fiberG: 3.6, serving: '1 cup', calories: 84, glpScore: 4 },
  { id: 'spinach', name: 'Spinach', aliases: ['spinach'], fiberG: 4.3, serving: '1 cup cooked', calories: 41, glpScore: 4 },
  { id: 'sweet-potato', name: 'Sweet potato', aliases: ['sweet potato', 'sweet potatoes', 'yam'], fiberG: 3.8, serving: '1 medium', calories: 103, glpScore: 5 },
  { id: 'almonds', name: 'Almonds', aliases: ['almond', 'almonds'], fiberG: 3.5, serving: '1 oz (23 nuts)', calories: 164, glpScore: 5 },
  { id: 'peanut-butter', name: 'Peanut butter', aliases: ['peanut butter', 'pb'], fiberG: 1.6, serving: '2 tbsp', calories: 188, glpScore: 2 },
  { id: 'egg', name: 'Egg', aliases: ['egg', 'eggs'], fiberG: 0, serving: '1 large', calories: 72, glpScore: 1 },
  { id: 'greek-yogurt', name: 'Greek yogurt', aliases: ['greek yogurt', 'yogurt'], fiberG: 0, serving: '1 cup', calories: 130, glpScore: 1 },
  { id: 'chicken', name: 'Chicken breast', aliases: ['chicken', 'chicken breast'], fiberG: 0, serving: '4 oz', calories: 187, glpScore: 1 },
  { id: 'salmon', name: 'Salmon', aliases: ['salmon'], fiberG: 0, serving: '4 oz', calories: 233, glpScore: 1 },
  { id: 'rice', name: 'White rice', aliases: ['rice', 'white rice'], fiberG: 0.6, serving: '1 cup cooked', calories: 205, glpScore: 1 },
  { id: 'pasta', name: 'Pasta', aliases: ['pasta', 'spaghetti', 'noodles'], fiberG: 2.5, serving: '1 cup cooked', calories: 220, glpScore: 2 },
  { id: 'banana-bread', name: 'Banana bread', aliases: ['banana bread'], fiberG: 1.5, serving: '1 slice', calories: 196, glpScore: 2 },
  { id: 'protein-bar', name: 'Protein bar', aliases: ['protein bar', 'bar'], fiberG: 3, serving: '1 bar', calories: 200, glpScore: 3 },
  { id: 'smoothie', name: 'Green smoothie', aliases: ['smoothie', 'green smoothie'], fiberG: 5, serving: '16 oz', calories: 180, glpScore: 6 },
  { id: 'salad', name: 'Mixed salad', aliases: ['salad', 'garden salad', 'side salad'], fiberG: 4, serving: '2 cups', calories: 80, glpScore: 5 },
  { id: 'brussels', name: 'Brussels sprouts', aliases: ['brussels', 'brussels sprouts', 'brussel sprouts'], fiberG: 4, serving: '1 cup cooked', calories: 56, glpScore: 6 },
  { id: 'carrots', name: 'Carrots', aliases: ['carrot', 'carrots'], fiberG: 3.6, serving: '1 cup', calories: 52, glpScore: 4 },
  { id: 'edamame', name: 'Edamame', aliases: ['edamame'], fiberG: 8, serving: '1 cup', calories: 188, glpScore: 7 },
  { id: 'hummus', name: 'Hummus', aliases: ['hummus'], fiberG: 6, serving: '1/2 cup', calories: 200, glpScore: 6 },
  { id: 'popcorn', name: 'Air-popped popcorn', aliases: ['popcorn'], fiberG: 3.6, serving: '3 cups', calories: 93, glpScore: 4 },
  { id: 'dark-chocolate', name: 'Dark chocolate', aliases: ['dark chocolate', 'chocolate'], fiberG: 3.1, serving: '1 oz (70%)', calories: 170, glpScore: 3 },
  { id: 'inulin', name: 'Inulin powder', aliases: ['inulin', 'inulin powder'], fiberG: 9, serving: '2 tsp', calories: 20, glpScore: 9 },
  { id: 'barley', name: 'Barley', aliases: ['barley'], fiberG: 6, serving: '1 cup cooked', calories: 193, glpScore: 7 },
]

export const FOOD_COUNT = FOODS.length
