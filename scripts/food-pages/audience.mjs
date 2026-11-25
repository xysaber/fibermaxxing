/**
 * Audience pages (GLP-1, weight loss, IBS, pregnancy). Hand-written; medical
 * wording is deliberately conservative. Tokens: {{slug}} → "about X g per <portion>",
 * {{link:slug}} → markdown link to that food page with its number.
 */
const UPDATED = '2026-11-25'

const MAYO = {
  label: 'Mayo Clinic, Dietary fiber: Essential for a healthy diet',
  url: 'https://www.mayoclinic.org/healthy-lifestyle/nutrition-and-healthy-eating/in-depth/fiber/art-20043983',
  note: 'increase fiber gradually and drink enough water',
}
const DGA = {
  label: 'Dietary Guidelines for Americans, 2020–2025 (USDA/HHS)',
  url: 'https://www.dietaryguidelines.gov/sites/default/files/2020-12/Dietary_Guidelines_for_Americans_2020-2025.pdf',
  note: 'fiber targets by age, sex, pregnancy and lactation (Appendix 1)',
}
const FDC = {
  label: 'USDA FoodData Central (SR Legacy)',
  url: 'https://fdc.nal.usda.gov/',
  note: 'fiber per 100 g behind every food figure on this page',
}

export const AUDIENCE = [
  {
    slug: 'fiber-on-glp-1',
    title: 'Fiber on GLP-1 Medications: How Much and Which Foods',
    description:
      'Keeping fiber up on semaglutide or tirzepatide when appetite drops: daily targets, fiber-dense foods for small meals, and constipation tips.',
    h1: 'Fiber on GLP-1 medications: how much, and which foods',
    answer: {
      value: '25–38',
      unit: 'g',
      detail: 'per day is the usual adult target. GLP-1 medicines do not change it, but they make it harder to reach.',
    },
    intro: [
      'When a GLP-1 medicine cuts your appetite, fiber is often one of the first things to fall, and constipation is one of the side effects people report most. The goal is to fit more fiber into smaller meals, slowly, with enough fluid.',
    ],
    callout: {
      title: 'Talk to your prescriber first',
      text: 'This page is general education, not medical advice. GLP-1 medicines such as semaglutide and tirzepatide are prescribed and monitored by a clinician. Ask your prescriber, pharmacist, or a registered dietitian before major diet changes or starting a fiber supplement, and seek care promptly for severe or persistent abdominal pain, repeated vomiting, or several days without a bowel movement.',
    },
    facts: [
      { label: 'Women 19–50', value: '25 g/day', note: 'U.S. Adequate Intake' },
      { label: 'Men 19–50', value: '38 g/day', note: 'U.S. Adequate Intake' },
      { label: 'By calories', value: '14 g', note: 'per 1,000 kcal eaten' },
      { label: 'Increase by', value: 'a few g', note: 'every few days, with fluids' },
    ],
    sections: [
      {
        heading: 'Why fiber drops on a GLP-1 medicine',
        paragraphs: [
          'GLP-1 receptor agonists slow stomach emptying and reduce appetite. Smaller meals are the point, but they also mean fewer servings of beans, whole grains, vegetables, and fruit. A day that used to include 20 g of fiber can quietly fall to 10 g.',
          'Constipation is listed among the common side effects of semaglutide on MedlinePlus, alongside nausea, vomiting, and diarrhea. Low fiber and low fluid intake can make constipation more likely, which is one reason clinicians often ask about both.',
        ],
      },
      {
        heading: 'How much fiber to aim for',
        paragraphs: [
          'The U.S. Adequate Intake is 25 g a day for women and 38 g for men aged 19–50, a little lower after 50. It is also expressed as 14 g per 1,000 calories. If you are eating around 1,400 calories a day, the calorie-based figure is about 20 g, which is a more realistic first goal for many people on a GLP-1.',
          'The calculator on this page has a “by calories” option under More options. Enter what you ate yesterday to see where you are now, then build up by a few grams every few days rather than all at once.',
        ],
      },
      {
        heading: 'Fiber-dense foods for small appetites',
        paragraphs: [
          'When every bite counts, choose foods with a lot of fiber for their size and calories. Berries are a good start: {{link:raspberries}} and {{link:blackberries}}. Cooked vegetables pack more fiber per cup than raw salads: {{link:broccoli}}, {{link:spinach}}.',
          'Seeds add fiber in a spoonful: {{link:chia-seeds}} or ground {{link:flaxseed}} stirred into yogurt. Legumes are the strongest single foods, so even a quarter or half cup helps: {{link:lentils}}, {{link:black-beans}}.',
          'Some people find liquids or soft foods easier when full quickly. A small smoothie with berries, Greek yogurt, and a tablespoon of chia, or a cup of lentil soup, can be easier than a large salad.',
        ],
      },
      {
        heading: 'Constipation, bloating, and nausea',
        paragraphs: [
          'Adding fiber without enough fluid can make constipation worse, not better. Raise fiber gradually and drink water through the day. Soluble fibers such as oats, chia, and psyllium form a gel and are often gentler than large amounts of wheat bran.',
          'If you are bloated or nauseated, a big bean salad is probably not the right moment. Smaller, more frequent portions, and lower-fat meals, are often easier. A supplement like psyllium is commonly used, but check with your prescriber or pharmacist first: fiber supplements can change how quickly some medicines are absorbed.',
          'Call your clinician if constipation lasts more than a few days, or if you have severe abdominal pain, vomiting, or blood in your stool.',
        ],
      },
      {
        heading: 'Pair fiber with protein',
        paragraphs: [
          'Clinicians usually emphasize protein on GLP-1 medicines to help preserve muscle while losing weight. Several foods cover both: {{link:edamame}}, {{link:lentils}}, and {{link:chickpeas}}. Greek yogurt with raspberries and chia, or a bean-and-vegetable soup, are simple combinations.',
        ],
      },
    ],
    defaultSex: 'female',
    defaultAge: '19-50',
    defaultMode: 'calories',
    defaultMeal: '170g greek yogurt, 1/2 cup raspberries, 1 tbsp chia seeds',
    examples: [
      '170g greek yogurt, 1/2 cup raspberries, 1 tbsp chia seeds',
      '1 cup lentil soup, 1 slice whole wheat bread',
      '1/2 cup edamame, 1 cup broccoli, 1/2 cup brown rice',
    ],
    faqs: [
      {
        q: 'Does fiber act like a natural GLP-1?',
        a: 'Not in any way comparable to the medicines. In research, gut bacteria ferment some fibers into short-chain fatty acids that can prompt the gut to release small amounts of its own GLP-1. That is a real but modest effect, and it is not a substitute for prescribed treatment.',
      },
      {
        q: 'Should I take a fiber supplement on Ozempic, Wegovy, Mounjaro, or Zepbound?',
        a: 'Ask your prescriber or pharmacist. Psyllium is commonly used for constipation, but start low, drink water, and check timing with your other medicines.',
      },
      {
        q: 'How can I eat more fiber when I am not hungry?',
        a: 'Choose fiber-dense foods in small amounts: berries, cooked greens, a spoon of chia, a quarter cup of beans. Spread them across the day instead of trying to eat one large high-fiber meal.',
      },
      {
        q: 'Can more fiber make GLP-1 nausea worse?',
        a: 'Large, bulky, high-fiber meals can feel heavy when your stomach empties slowly. Increase gradually and use smaller portions. If nausea is persistent, tell your clinician.',
      },
    ],
    related: ['fiber-for-weight-loss', 'fiber-for-ibs', 'how-much-fiber-per-day'],
    sources: [
      {
        label: 'MedlinePlus (NIH), Semaglutide Injection',
        url: 'https://medlineplus.gov/druginfo/meds/a618008.html',
        note: 'constipation, nausea, vomiting, and diarrhea listed among side effects',
      },
      {
        label: 'NIDDK, Eating, Diet, & Nutrition for Constipation',
        url: 'https://www.niddk.nih.gov/health-information/digestive-diseases/constipation/eating-diet-nutrition',
        note: 'fiber, fluids, and adding fiber gradually',
      },
      DGA,
      MAYO,
      FDC,
    ],
  },
  {
    slug: 'fiber-for-weight-loss',
    title: 'Fiber for Weight Loss: What the Evidence Shows',
    description:
      'How fiber helps with fat loss, what a year-long 30 g/day trial found, and the highest-fiber foods per calorie from USDA data.',
    h1: 'Fiber for weight loss: what it can and cannot do',
    answer: {
      value: '30',
      unit: 'g',
      detail: 'a day was the single goal in a year-long trial where people lost about as much weight as on a more complex diet.',
    },
    intro: [
      'Fiber is not a fat burner. It helps with weight loss mostly by making meals more filling for fewer calories, and by crowding out lower-fiber foods. That makes it one of the simplest habits to build a calorie deficit around.',
    ],
    callout: {
      title: 'General information',
      text: 'This page is for education and self-tracking, not medical advice. If you have diabetes, a digestive condition, an eating disorder history, or take prescription medicines, talk with your clinician or a registered dietitian about how to lose weight safely.',
    },
    facts: [
      { label: 'Trial goal', value: '30 g/day', note: 'Ann Intern Med, 2015' },
      { label: 'Women 19–50', value: '25 g/day', note: 'U.S. Adequate Intake' },
      { label: 'Men 19–50', value: '38 g/day', note: 'U.S. Adequate Intake' },
      { label: 'By calories', value: '14 g', note: 'per 1,000 kcal' },
    ],
    sections: [
      {
        heading: 'How fiber helps with fat loss',
        paragraphs: [
          'High-fiber foods tend to be bulky and slow to eat. Beans, vegetables, whole fruit, and whole grains fill your stomach and take more chewing than refined foods with the same calories. Soluble fiber also slows digestion, which can help you stay full longer after a meal.',
          'The bigger effect is often indirect: a plate built around beans and vegetables has less room for calorie-dense foods. That is why fiber is a useful anchor for a diet, not a magic ingredient.',
        ],
      },
      {
        heading: 'What the research shows',
        paragraphs: [
          'In a 2015 randomized trial published in the Annals of Internal Medicine, adults with metabolic syndrome were told either to follow the multi-part American Heart Association diet or simply to eat at least 30 g of fiber a day. After a year, both groups had lost a modest amount of weight, around 2 to 3 kg on average, and the difference between them was not statistically significant.',
          'The takeaway is not that fiber alone causes large weight loss. It is that one simple, positive goal (“eat more fiber”) can work about as well as a longer list of rules, and it is easier to stick with.',
        ],
      },
      {
        heading: 'Highest-fiber foods per calorie',
        paragraphs: [
          'For a calorie deficit, fiber per 100 calories is a useful lens. Among the 50 foods on this site, the top ten by that measure are: {{top-density}}.',
          'Calorie-dense high-fiber foods still have a place. Nuts, seeds, avocado, and dried fruit have real fiber, but portions matter: {{link:almonds}} comes with about 160 calories per ounce.',
        ],
      },
      {
        heading: 'Building a high-fiber, lower-calorie day',
        paragraphs: [
          'Breakfast: oatmeal with berries and a spoon of chia or ground flax. Lunch: a big bowl of vegetables with half a cup of beans or lentils. Dinner: a palm of protein, two cups of cooked vegetables, and a modest serving of a whole grain. Snacks: fruit, raw vegetables with hummus, or air-popped popcorn.',
          'Increase fiber gradually over two or three weeks and drink water with it. Jumping from 12 g to 40 g in a day is a reliable way to end up bloated.',
        ],
      },
    ],
    defaultSex: 'female',
    defaultAge: '19-50',
    defaultMode: 'standard',
    defaultMeal: '1 cup lentil soup, 2 cups broccoli, 1 apple',
    examples: [
      '1 cup lentil soup, 2 cups broccoli, 1 apple',
      '1 cup oatmeal, 1 cup raspberries, 1 tbsp chia seeds',
      '3 cups popcorn, 1 pear',
    ],
    faqs: [
      {
        q: 'Does fiber burn fat?',
        a: 'No. Fiber helps you feel full on fewer calories. Weight loss still comes from eating less energy than you use over time.',
      },
      {
        q: 'How much fiber should I eat to lose weight?',
        a: 'The year-long trial above used 30 g a day as the goal. Many people start far below that, so build up gradually toward the U.S. Adequate Intake for your age and sex.',
      },
      {
        q: 'Do fiber supplements help with weight loss?',
        a: 'Evidence for supplements alone is mixed and the effects are small. Whole foods bring bulk, water, and nutrients that a powder does not.',
      },
      {
        q: 'Is a high-fiber diet safe for everyone?',
        a: 'For most people, yes, if increased gradually with fluids. People with certain digestive conditions, recent bowel surgery, or on some medicines should follow their clinician’s advice.',
      },
    ],
    related: ['fiber-on-glp-1', 'fiber-in-foods', 'what-is-fibermaxxing'],
    sources: [
      {
        label: 'Ma Y, et al. Single-component versus multicomponent dietary goals for the metabolic syndrome. Ann Intern Med. 2015',
        url: 'https://pubmed.ncbi.nlm.nih.gov/25686165/',
        note: '30 g/day fiber goal vs AHA diet, 12-month randomized trial',
      },
      {
        label: 'Harvard T.H. Chan School of Public Health, The Nutrition Source: Fiber',
        url: 'https://nutritionsource.hsph.harvard.edu/carbohydrates/fiber/',
        note: 'fiber, fullness, and food sources',
      },
      DGA,
      MAYO,
      FDC,
    ],
  },
  {
    slug: 'fiber-for-ibs',
    title: 'Fiber for IBS: Soluble vs Insoluble and Low-FODMAP Choices',
    description:
      'Which fiber helps IBS and which can make it worse: soluble vs insoluble, what the ACG guideline recommends, and lower-FODMAP fiber foods.',
    h1: 'Fiber for IBS: which kinds help, and which can hurt',
    answer: {
      value: 'Soluble',
      detail: 'fiber, such as psyllium, is the type the American College of Gastroenterology recommends for IBS symptoms. Insoluble fiber like wheat bran is not recommended.',
    },
    intro: [
      'With irritable bowel syndrome, the type of fiber matters as much as the amount. Some fibers ease symptoms; others ferment quickly and cause gas and pain. Go slowly and change one thing at a time.',
    ],
    callout: {
      title: 'Check with your clinician',
      text: 'This page is general education, not medical advice. IBS should be diagnosed by a clinician, because other conditions can cause similar symptoms. Seek care for warning signs such as rectal bleeding, unintended weight loss, anemia, fever, symptoms that wake you at night, or a new change in bowel habits after age 45.',
    },
    facts: [
      { label: 'Recommended', value: 'Soluble', note: 'e.g. psyllium (ACG 2021)' },
      { label: 'Not recommended', value: 'Insoluble', note: 'e.g. wheat bran' },
      { label: 'Increase by', value: '2–3 g', note: 'per day at a time (NIDDK)' },
      { label: 'Low-FODMAP', value: 'Trial', note: 'short-term, with guidance' },
    ],
    sections: [
      {
        heading: 'Soluble vs insoluble fiber in IBS',
        paragraphs: [
          'Soluble fiber dissolves in water and forms a gel. Psyllium is the best-studied example. The American College of Gastroenterology’s 2021 IBS guideline recommends soluble fiber for overall IBS symptoms, and recommends against insoluble fiber, because insoluble fiber such as wheat bran can worsen bloating and pain.',
          'Soluble does not automatically mean gentle. Some soluble fibers, such as inulin, ferment quickly and are high-FODMAP. Psyllium ferments slowly, which is part of why it tends to be better tolerated.',
        ],
      },
      {
        heading: 'Where FODMAPs come in',
        paragraphs: [
          'FODMAPs are short-chain carbohydrates that are poorly absorbed and fermented by gut bacteria. Researchers at Monash University developed the low-FODMAP diet, and the ACG guideline suggests a limited trial of it for IBS, ideally with a dietitian. It is a short elimination followed by reintroduction, not a permanent diet.',
          'Many high-fiber foods are also high-FODMAP: most beans in large servings, apples, pears, mango, artichokes, onions, and garlic. That is why a sudden switch to a “healthy high-fiber diet” can make IBS worse.',
        ],
      },
      {
        heading: 'Higher-fiber foods that are often better tolerated',
        paragraphs: [
          'Monash lists several fiber sources as low-FODMAP at standard servings, including oats, quinoa, brown rice, chia seeds, green kiwifruit, oranges, strawberries, blueberries, carrots, and spinach. On this site: {{link:quinoa}}, {{link:kiwi}}, {{link:carrots}}, {{link:spinach}}.',
          'Canned, rinsed lentils and chickpeas are lower in FODMAPs than beans cooked from dry, because some of the fermentable carbohydrates move into the canning liquid. Small servings are often tolerated. Serving size matters: check the Monash app for current thresholds, since they are updated as foods are retested.',
        ],
      },
      {
        heading: 'How to add fiber without a flare',
        paragraphs: [
          'NIDDK suggests adding fiber slowly, by 2 to 3 g a day, to reduce gas and bloating. Spread fiber across meals instead of one large high-fiber dinner, and drink water through the day.',
          'Keep a simple log of what you ate and how you felt. The calculator on this page can total fiber per meal; a symptom note beside it makes patterns easier to spot over a couple of weeks.',
        ],
      },
    ],
    defaultSex: 'female',
    defaultAge: '19-50',
    defaultMode: 'standard',
    defaultMeal: '1 cup oatmeal, 2 kiwifruit, 1 tbsp chia seeds',
    examples: [
      '1 cup oatmeal, 2 kiwifruit, 1 tbsp chia seeds',
      '1 cup quinoa, 1 cup carrots, 1 cup cooked spinach',
      '1 cup brown rice, 1 cup strawberries',
    ],
    faqs: [
      {
        q: 'Is psyllium good for IBS?',
        a: 'Psyllium is the soluble fiber with the most evidence in IBS, and the ACG guideline recommends soluble fiber. Start with a small dose, increase slowly, and check with your clinician, especially if you take other medicines.',
      },
      {
        q: 'Should I avoid fiber if I have IBS?',
        a: 'Usually not. Most people with IBS benefit from adequate fiber, but the type and pace matter. Soluble, slowly fermented fibers tend to be better tolerated than wheat bran or high-FODMAP foods.',
      },
      {
        q: 'Is the low-FODMAP diet high in fiber?',
        a: 'It can be low in fiber if you simply remove foods. Including low-FODMAP fiber sources such as oats, quinoa, chia, kiwifruit, and carrots helps. A dietitian can help you plan it.',
      },
      {
        q: 'Does fiber help IBS with constipation and IBS with diarrhea?',
        a: 'Soluble fiber can help both by normalizing stool form, but responses vary. Track your symptoms and talk with your clinician about which approach fits your subtype.',
      },
    ],
    related: ['fiber-on-glp-1', 'how-much-fiber-per-day', 'fiber-in-foods'],
    sources: [
      {
        label: 'Lacy BE, et al. ACG Clinical Guideline: Management of Irritable Bowel Syndrome. Am J Gastroenterol. 2021',
        url: 'https://pubmed.ncbi.nlm.nih.gov/33315591/',
        note: 'soluble (not insoluble) fiber recommended; limited trial of low-FODMAP diet suggested',
      },
      {
        label: 'Monash University, About FODMAPs and IBS',
        url: 'https://www.monashfodmap.com/about-fodmap-and-ibs/',
        note: 'what FODMAPs are and how the diet is structured',
      },
      {
        label: 'NIDDK, Eating, Diet, & Nutrition for Irritable Bowel Syndrome',
        url: 'https://www.niddk.nih.gov/health-information/digestive-diseases/irritable-bowel-syndrome/eating-diet-nutrition',
        note: 'add fiber slowly to reduce gas and bloating',
      },
      FDC,
    ],
  },
  {
    slug: 'fiber-during-pregnancy',
    title: 'Fiber During Pregnancy: 28 g a Day and Constipation Tips',
    description:
      'The fiber target in pregnancy (28 g/day) and breastfeeding (29 g/day), why constipation is common, and easy high-fiber foods to try.',
    h1: 'Fiber during pregnancy: how much you need',
    answer: {
      value: '28',
      unit: 'g',
      detail: 'of fiber a day is the U.S. Adequate Intake during pregnancy (29 g while breastfeeding).',
    },
    intro: [
      'Constipation is one of the most common complaints in pregnancy. Fiber, fluids, and gentle activity are the usual first steps. Here is the target, why it can be harder to reach, and foods that make it easier.',
    ],
    callout: {
      title: 'Your prenatal care team comes first',
      text: 'This page is general education, not medical advice. Talk to your obstetrician, midwife, or a registered dietitian about your diet in pregnancy, and ask before starting any fiber supplement or laxative. Contact your care team for severe abdominal pain, bleeding, or constipation that does not improve.',
    },
    facts: [
      { label: 'Pregnancy', value: '28 g/day', note: 'U.S. Adequate Intake' },
      { label: 'Breastfeeding', value: '29 g/day', note: 'U.S. Adequate Intake' },
      { label: 'Not pregnant, 19–50', value: '25 g/day', note: 'for comparison' },
      { label: 'Typical intake', value: 'below target', note: 'most U.S. adults' },
    ],
    sections: [
      {
        heading: 'Why the target is higher',
        paragraphs: [
          'U.S. fiber targets are based on 14 g per 1,000 calories. Energy needs rise in pregnancy, especially in the second and third trimesters, so the Adequate Intake rises to 28 g a day, and 29 g while breastfeeding. The Dietary Guidelines for Americans list these values for ages 14 to 50.',
          'The calculator on this page includes pregnancy and breastfeeding targets under More options.',
        ],
      },
      {
        heading: 'Why constipation is common in pregnancy',
        paragraphs: [
          'Pregnancy hormones slow the movement of the gut, and later the growing uterus presses on the bowel. Iron in prenatal vitamins can also contribute. More fiber, more fluids, and regular physical activity are the usual first steps, and your care team can suggest more if those are not enough.',
          'If you are constipated, increase fiber gradually and drink water with it. Do not start a laxative or fiber supplement without checking with your care team.',
        ],
      },
      {
        heading: 'Easy high-fiber foods in pregnancy',
        paragraphs: [
          'Fruit you can eat without much prep helps on low-energy days: {{link:pear}}, {{link:raspberries}}, and {{link:kiwi}}. Two kiwifruit a day and a few {{link:prunes}} are traditional options; studies in non-pregnant adults found both helped constipation.',
          'For meals: {{link:lentils}} in soup, {{link:black-beans}} in a bowl, {{link:sweet-potato}} or {{link:potato}} with the skin, and whole grains like {{link:barley}} or whole wheat bread.',
          'During nausea in early pregnancy, plain whole-grain crackers, toast, or oatmeal may be easier than beans or raw vegetables. Do what you can and build up as appetite returns.',
        ],
      },
      {
        heading: 'Food safety still applies',
        paragraphs: [
          'Follow your care team’s food-safety advice alongside fiber goals. For example, U.S. guidance advises avoiding raw sprouts and unpasteurized juice during pregnancy, and washing produce well.',
        ],
      },
    ],
    defaultSex: 'female',
    defaultAge: '19-50',
    defaultMode: 'standard',
    defaultMeal: '1 cup oatmeal, 1 pear, 2 tbsp ground flaxseed',
    examples: [
      '1 cup oatmeal, 1 pear, 2 tbsp ground flaxseed',
      '1 cup lentil soup, 1 slice whole wheat bread, 2 kiwifruit',
      '1 baked potato, 1/2 cup black beans, 1 cup broccoli',
    ],
    faqs: [
      {
        q: 'How much fiber should I eat while pregnant?',
        a: 'About 28 g a day is the U.S. Adequate Intake during pregnancy, and 29 g while breastfeeding.',
      },
      {
        q: 'Is it safe to take a fiber supplement while pregnant?',
        a: 'Ask your obstetrician or midwife first. Food is the usual starting point; your care team can advise on supplements if needed.',
      },
      {
        q: 'What helps with constipation in pregnancy?',
        a: 'More fiber, more fluids, and regular activity are the usual first steps. Prunes and kiwifruit help some people. Tell your care team if it does not improve.',
      },
      {
        q: 'Can too much fiber cause problems in pregnancy?',
        a: 'Increasing very quickly can cause gas and bloating. Add fiber over a couple of weeks and drink enough water.',
      },
    ],
    related: ['how-much-fiber-per-day', 'fiber-in-prunes', 'fiber-in-kiwi'],
    sources: [
      {
        label: 'ACOG, Nutrition During Pregnancy (FAQ)',
        url: 'https://www.acog.org/womens-health/faqs/nutrition-during-pregnancy',
        note: 'healthy eating and food safety in pregnancy',
      },
      DGA,
      {
        label: 'NIDDK, Eating, Diet, & Nutrition for Constipation',
        url: 'https://www.niddk.nih.gov/health-information/digestive-diseases/constipation/eating-diet-nutrition',
        note: 'fiber and fluids for constipation',
      },
      MAYO,
      FDC,
    ],
  },
].map((p) => ({ ...p, updated: UPDATED, kind: 'audience' }))
