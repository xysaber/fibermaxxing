/**
 * Home "Your first week" preview (design board 29/32). Short versions of the
 * seven starter-plan emails in worker/emails.ts — keep the two in sync.
 */
export type WeekDay = {
  day: string
  subject: string
  adds: string
  heading: string
  move: string
  why: string
  tip: string
}

export const HOME_WEEK: WeekDay[] = [
  {
    day: 'Day 1',
    subject: 'What’s your fiber number?',
    adds: '',
    heading: 'Find your starting number',
    move: 'Tonight, type everything you ate today into the calculator and write down the total.',
    why: 'You can’t close a gap you haven’t measured, so today is only about the number. Over the next six days you’ll add one food at a time.',
    tip: 'Write it the way you’d say it: “oatmeal, apple, turkey sandwich”. You can edit any portion after.',
  },
  {
    day: 'Day 2',
    subject: '8 g before 9 a.m.',
    adds: '+8 g',
    heading: 'Upgrade breakfast',
    move: 'Have a cup of cooked oatmeal with 1 tablespoon of chia seeds.',
    why: 'Breakfast is the easiest place to start because it repeats. Fix it once and it keeps paying off.',
    tip: 'Measure oats after cooking. A cup of dry oats is a very different number.',
  },
  {
    day: 'Day 3',
    subject: 'The biggest lever is a can of beans',
    adds: '+7–8 g',
    heading: 'Add a legume at lunch',
    move: 'Add half a cup of beans or lentils to lunch: in a salad, soup, wrap or bowl.',
    why: 'A full cup of cooked lentils is about 15.6 g. You don’t need a full cup. Half is plenty for now.',
    tip: 'Canned beans count. Rinse them to cut the sodium.',
  },
  {
    day: 'Day 4',
    subject: 'Swap one snack',
    adds: '+4–8 g',
    heading: 'Swap one snack for fruit',
    move: 'Replace one packaged snack with a pear, an apple or a cup of raspberries.',
    why: 'A medium pear is about 5.5 g, and a cup of raspberries about 8 g. Keep the skin on.',
    tip: 'Put the fruit where you’ll see it at 3 p.m.',
  },
  {
    day: 'Day 5',
    subject: 'Half the plate',
    adds: '+5–8 g',
    heading: 'Fix dinner with one rule',
    move: 'Fill half your dinner plate with vegetables, and swap one refined grain for a whole one.',
    why: 'A cup of cooked broccoli is about 5.1 g. Then switch one grain: brown rice instead of white.',
    tip: 'Frozen vegetables count just as much and take two minutes.',
  },
  {
    day: 'Day 6',
    subject: 'Go slow and drink water',
    adds: '',
    heading: 'Comfort check',
    move: 'Spread today’s fiber across meals, and drink water through the day.',
    why: 'Some gas is common when you add fiber quickly. If something feels off, stay at today’s level for a few days.',
    tip: 'One huge high-fiber bowl is harder on your gut than the same fiber over three meals.',
  },
  {
    day: 'Day 7',
    subject: 'Compare with Day 1',
    adds: '',
    heading: 'Check your progress',
    move: 'Log today in the calculator and compare the total with your Day 1 number.',
    why: 'Breakfast, half a cup of beans, one fruit snack and a vegetable-heavy dinner can add roughly 20 g to a typical day.',
    tip: 'Keep the two or three changes that felt easiest. Those are your new defaults.',
  },
]

/**
 * "Same day, two ways" (board 28). Each gram value is parseMeal(text).totalFiberG
 * for that exact phrase (½ written as 1/2). Re-run parseMeal if you change one.
 */
export const SAME_DAY = [
  {
    slot: 'Breakfast',
    typical: '2 slices white toast, 1 tbsp peanut butter',
    typicalG: 2.4,
    high: '1 cup cooked oatmeal, 1 tbsp chia seeds',
    highG: 8.1,
  },
  {
    slot: 'Lunch',
    typical: '2 slices white bread, 3 oz turkey',
    typicalG: 1.5,
    high: '2 slices whole-wheat bread, 3 oz turkey, ½ cup black beans',
    highG: 11.3,
  },
  { slot: 'Snack', typical: '1 oz potato chips', typicalG: 1.7, high: '1 medium pear', highG: 5.5 },
  {
    slot: 'Dinner',
    typical: '1 cup white rice, 4 oz chicken, ½ cup broccoli',
    typicalG: 3.2,
    high: '1 cup brown rice, 4 oz chicken, 1 cup broccoli',
    highG: 8.3,
  },
] as const
