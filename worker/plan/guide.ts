/** Week-by-week guidance for the paid plan. Served with the plan content, never in the public bundle. */
import type { Track } from './library'

export type WeekGuide = { title: string; focus: string; tips: string[] }

const COMMON: WeekGuide[] = [
  {
    title: 'Start where you are',
    focus: 'One high-fiber breakfast every day. Notice which foods sit well with you.',
    tips: [
      'Drink a glass of water with each high-fiber meal.',
      'Some extra gas this week is normal. It usually settles within 1–2 weeks.',
      'Prep two breakfasts the night before so busy mornings still count.',
    ],
  },
  {
    title: 'Fix lunch',
    focus: 'Make lunch the second high-fiber meal of the day: a whole grain, beans or lentils, or a big vegetable side.',
    tips: [
      'Cook one pot of grains or lentils on Sunday and use it for 3–4 lunches.',
      'Canned beans count. Rinse them to cut the salt and some of the gas.',
      'Feeling bloated? Stay at last week’s goal for 3 more days before moving up.',
    ],
  },
  {
    title: 'Close the gap',
    focus: 'Half the plate at dinner is vegetables, and one snack a day is fiber.',
    tips: [
      'Keep fruit you can grab without prep: pears, apples, kiwis, oranges.',
      'Frozen vegetables and berries are as high in fiber as fresh.',
      'Spread fiber across the day instead of one huge meal.',
    ],
  },
  {
    title: 'Make it automatic',
    focus: 'Hold your target. Pick the meals you liked most; they become your default week.',
    tips: [
      'Write down your 5 favorite meals from this plan. That list is your shopping list from now on.',
      'Eating out? Pick the dish with beans, lentils or vegetables as the base.',
      'Keep drinking water; your fiber is now much higher than when you started.',
    ],
  },
]

const TRACK_NOTES: Record<Track, { intro: string; step: number; weekFocus: Partial<Record<number, string>>; extraTips: string[] }> = {
  std: {
    intro: 'Steps up about 5 g a week until you reach your target.',
    step: 5,
    weekFocus: {},
    extraTips: [],
  },
  glp1: {
    intro: 'For smaller appetites. Steps up about 3 g a week, with smaller plates and fiber spread over 4–5 small meals.',
    step: 3,
    weekFocus: {
      1: 'Eat protein first, then the fiber part of the meal. Small portions, spread across the day.',
      2: 'Add a small fiber food to lunch. If you feel full fast, move it to a snack instead.',
    },
    extraTips: [
      'GLP-1 medicines slow digestion, so constipation is common. Fiber plus water helps; fiber without water can make it worse.',
      'If nausea is bad on a given day, skip the step-up and eat what sits well. Pick up the plan tomorrow.',
      'Ask your prescriber before adding fiber supplements such as psyllium.',
    ],
  },
  gentle: {
    intro: 'For sensitive stomachs. Steps up about 3 g a week, soluble fiber first (oats, chia, kiwi, cooked vegetables). Beans and lentils start in week 3, in small portions.',
    step: 3,
    weekFocus: {
      1: 'Soluble fiber first: oats, chia, kiwi, cooked carrots and potatoes with skin. No beans yet.',
      2: 'Add a whole grain at lunch. Still no beans; keep vegetables cooked if raw ones bother you.',
      3: 'Try a small portion of canned, rinsed chickpeas. If it goes well, keep it; if not, go back to week 2 foods.',
    },
    extraTips: [
      'Cooked vegetables are usually easier than raw. Peel and cook if something bothers you.',
      'Kiwis (2 a day) and oats are among the gentlest ways to add fiber.',
      'If you have IBS or another gut condition, your clinician or dietitian may suggest a specific approach such as low-FODMAP. Follow that first.',
    ],
  },
}

export function buildGuide() {
  return {
    weeks: COMMON,
    tracks: TRACK_NOTES,
    days2930: {
      title: 'Keep it going',
      focus: 'Days 29–30: repeat your two favorite days from week 4, then check one normal day in the free calculator.',
      tips: [
        'If you reached your target, keep it. Going higher is optional; more is not always better.',
        'If you did not reach it, stay at your current level for another week. Slow is fine.',
      ],
    },
    bloating: 'Feeling bloated? Stay on last week’s goal for 3 more days and drink an extra glass of water with each high-fiber meal. Most people adjust within 1–2 weeks. See a clinician if you have pain, blood in your stool, or symptoms that do not settle.',
    disclaimer: 'General guidance for healthy adults, not medical advice. If you have a digestive condition, are pregnant, or take GLP-1 medication, check with your clinician before changing your diet. Plan by Mira Xin, Founder & Editor, GetFibermaxxing. Gram counts from USDA FoodData Central (SR Legacy) and typical U.S. nutrition labels.',
  }
}
