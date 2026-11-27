/**
 * Free 7-day starter plan: one shared source for the daily emails (worker/emails.ts)
 * and the public plan page (/7-day-plan).
 *
 * Tone: suggest, don't prescribe. Each day offers a few realistic options the
 * reader can pick from. Gram figures come from the calculator itself
 * (USDA FoodData Central SR Legacy × USDA household weights); `meal` is the
 * exact text that reproduces them in the calculator.
 */
export type StarterOption = {
  /** Short name, e.g. "Oatmeal bowl". */
  name: string
  /** What's in it, in plain words. */
  detail: string
  /** Approximate fiber in grams, from the calculator. */
  grams: number
  /** Calculator input that reproduces `grams`. */
  meal: string
  /** Photo key under /plan-photos/ (filled in once photos are chosen). */
  photo?: string
}

export type StarterDay = {
  day: number
  subject: string
  /** Inbox preview line shown after the subject. */
  preheader: string
  heading: string
  /** One friendly line that frames today's idea. */
  idea: string
  /** Typical range the options add, shown as a badge. */
  adds?: string
  options: StarterOption[]
  paragraphs: string[]
  tip: string
  /** One-line teaser for tomorrow (omit on the last day). */
  next?: string
  cta: string
}

export const STARTER_DAYS: StarterDay[] = [
  {
    day: 1,
    subject: 'Day 1: what’s your fiber number?',
    preheader: 'One 60-second check tonight. No changes yet.',
    heading: 'Find your starting number',
    idea: 'Tonight, if you have a minute, type what you ate today into the calculator and note the total. No changes yet.',
    options: [],
    paragraphs: [
      'Most U.S. adults eat about half the fiber they need. Knowing your own number makes the rest of the week easier to judge.',
      'Over the next six days we’ll suggest one small addition a day, about 3–8 g each. Going gradually gives your gut time to adjust, which is how most people avoid bloating.',
    ],
    tip: 'Write it the way you’d say it, like “oatmeal, apple, turkey sandwich, pasta with tomato sauce”. You can adjust any portion afterwards.',
    next: 'Tomorrow: a few breakfasts that get you about 8–10 g.',
    cta: 'Check today’s total',
  },
  {
    day: 2,
    subject: 'Day 2: a few breakfasts worth about 8–10 g',
    preheader: 'Pick whichever fits your morning.',
    heading: 'Breakfast ideas',
    idea: 'Breakfast is an easy place to start because most of us eat it on repeat. Here are a few options. Pick whichever sounds good, or mix and match.',
    adds: '+8–12 g',
    options: [
      { name: 'Oatmeal bowl', detail: '1 cup cooked oatmeal, 1 tbsp chia seeds, ½ cup blueberries', grams: 9.9, meal: '1 cup cooked oatmeal, 1 tbsp chia seeds, 1/2 cup blueberries', photo: 'oatmeal-bowl' },
      { name: 'Avocado toast', detail: '2 slices whole-wheat toast, ½ avocado', grams: 8.8, meal: '2 slices whole wheat bread, half avocado', photo: 'avocado-toast' },
      { name: 'Yogurt and berries', detail: '¾ cup Greek yogurt, 1 cup raspberries, 2 tbsp ground flaxseed', grams: 11.8, meal: '3/4 cup greek yogurt, 1 cup raspberries, 2 tbsp ground flaxseed', photo: 'yogurt-berries' },
      { name: 'Cereal and banana', detail: '1 cup bran flakes, milk, 1 banana', grams: 10.4, meal: '1 cup bran flakes, 1 cup milk, 1 banana', photo: 'cereal-banana' },
    ],
    paragraphs: [
      'Any one of these covers roughly a third of a typical daily target before lunch.',
    ],
    tip: 'If you go with oatmeal, measure it after cooking. A cup of dry oats is a very different number from a cup of cooked oatmeal.',
    next: 'Tomorrow: the single biggest fiber lever, and easy ways to use it.',
    cta: 'See all breakfast ideas',
  },
  {
    day: 3,
    subject: 'Day 3: the biggest lever is a can of beans',
    preheader: 'Half a cup adds about 6–8 g. Here are a few lunches that use it.',
    heading: 'Lunch ideas with beans or lentils',
    idea: 'Beans and lentils are among the highest-fiber foods you can buy. Adding some to lunch is one of the easiest wins. A few ideas:',
    adds: '+6–12 g',
    options: [
      { name: 'Black bean wrap', detail: '1 whole-wheat tortilla, ½ cup black beans, salsa', grams: 11.5, meal: '1 whole wheat tortilla, 1/2 cup black beans', photo: 'bean-wrap' },
      { name: 'Grain bowl', detail: '½ cup quinoa, ½ cup black beans, ½ cup corn', grams: 12.3, meal: '1/2 cup cooked quinoa, 1/2 cup black beans, 1/2 cup corn', photo: 'grain-bowl' },
      { name: 'Chickpea salad', detail: '2 cups greens, ½ cup chickpeas, cucumber', grams: 7.8, meal: '2 cups mixed greens, 1/2 cup chickpeas, 1/2 cup cucumber', photo: 'chickpea-salad' },
      { name: 'Lentil soup', detail: '1 cup lentil soup, store-bought or homemade', grams: 5.9, meal: '1 cup lentil soup', photo: 'lentil-soup' },
    ],
    paragraphs: [
      'If beans don’t usually agree with you, a few spoonfuls is a fine start. You can build up over the week.',
    ],
    tip: 'Canned beans count. Rinsing them cuts the sodium.',
    next: 'Tomorrow: snack swaps that add 4–8 g without much effort.',
    cta: 'See all lunch ideas',
  },
  {
    day: 4,
    subject: 'Day 4: snacks that pull their weight',
    preheader: 'A pear has about 5 g. A typical granola bar, 1–2 g.',
    heading: 'Snack ideas',
    idea: 'Swapping one packaged snack for one of these is an easy way to add a few grams. Pick one or two that you actually like:',
    adds: '+4–8 g',
    options: [
      { name: 'Raspberries', detail: '1 cup', grams: 8.0, meal: '1 cup raspberries', photo: 'raspberries' },
      { name: 'Edamame', detail: '1 cup shelled, cooked', grams: 8.1, meal: '1 cup edamame', photo: 'edamame' },
      { name: 'Hummus and carrots', detail: '¼ cup hummus, 1 cup baby carrots', grams: 7.0, meal: '1/4 cup hummus, 1 cup baby carrots', photo: 'hummus-carrots' },
      { name: 'A pear', detail: '1 medium, skin on', grams: 5.5, meal: '1 medium pear', photo: 'pear' },
      { name: 'Apple and peanut butter', detail: '1 medium apple, 1 tbsp peanut butter', grams: 5.2, meal: '1 medium apple, 1 tbsp peanut butter', photo: 'apple-pb' },
    ],
    paragraphs: [
      'Keeping the skin on apples and pears helps: that’s where much of the fiber is.',
    ],
    tip: 'Putting the fruit where you’ll see it mid-afternoon makes it the easy choice.',
    next: 'Tomorrow: a simple way to think about dinner.',
    cta: 'See all snack ideas',
  },
  {
    day: 5,
    subject: 'Day 5: a simple idea for dinner',
    preheader: 'More vegetables, one whole grain. Same meals you already make.',
    heading: 'Dinner ideas',
    idea: 'One idea that works with most dinners: aim for about half the plate as vegetables, and try a whole grain where you’d use a refined one. Some combinations to try:',
    adds: '+5–9 g',
    options: [
      { name: 'Stir-fry with brown rice', detail: '1 cup broccoli, 1 cup brown rice', grams: 8.3, meal: '1 cup cooked broccoli, 1 cup cooked brown rice', photo: 'broccoli-rice' },
      { name: 'Peas on the side', detail: '1 cup peas, from frozen', grams: 8.8, meal: '1 cup frozen peas', photo: 'peas' },
      { name: 'Potato and sprouts', detail: '1 baked potato with skin, 1 cup Brussels sprouts', grams: 7.9, meal: '1 medium baked potato, 1 cup roasted brussels sprouts', photo: 'potato-sprouts' },
      { name: 'Whole-wheat pasta', detail: '1 cup whole-wheat spaghetti with your usual sauce', grams: 5.5, meal: '1 cup cooked whole wheat spaghetti', photo: 'ww-pasta' },
    ],
    paragraphs: [
      'For comparison, a cup of white rice has about 0.6 g, and brown rice about 3.2 g. Small swaps like that add up.',
    ],
    tip: 'Frozen vegetables count just as much and take a couple of minutes.',
    next: 'Tomorrow: how to keep going comfortably.',
    cta: 'See all dinner ideas',
  },
  {
    day: 6,
    subject: 'Day 6: keeping it comfortable',
    preheader: 'A little gas is normal. A few things that help.',
    heading: 'Comfort check',
    idea: 'If you’ve been adding fiber this week, some gas or bloating is common. A few things that usually help:',
    options: [],
    paragraphs: [
      'Spreading fiber across meals tends to be easier on your gut than one big high-fiber bowl. Drinking water through the day helps too.',
      'If something feels off, it’s fine to stay at your current level for a few days before adding more. If you have a digestive condition, are pregnant, or take GLP-1 or other medication, your clinician’s advice comes first.',
    ],
    tip: 'Notice which of this week’s foods felt best. Those are good ones to keep.',
    next: 'Tomorrow: compare with Day 1.',
    cta: 'Review the week',
  },
  {
    day: 7,
    subject: 'Day 7: compare with Day 1',
    preheader: 'See how far a week of small changes got you.',
    heading: 'Check your progress',
    idea: 'If you have a minute today, log what you ate and compare the total with your Day 1 number.',
    options: [],
    paragraphs: [
      'One breakfast idea, a lunch with beans, a fruit snack and a vegetable-heavy dinner can add roughly 20 g to a typical day.',
      'Keep the two or three changes that felt easiest. Those can be your new defaults. Want more structure? The 30-day plan has daily menus and weekly shopping lists sized to your target: getfibermaxxing.com/30-day-plan',
    ],
    tip: 'Bookmarking the calculator makes checking a day take about ten seconds.',
    cta: 'See today’s total',
  },
]
