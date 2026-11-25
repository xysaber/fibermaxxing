/** Hand-written copy for per-food fiber pages (fruit). See foods-legumes-grains.mjs. */
export const FRUIT = [
  {
    slug: 'raspberries',
    name: 'raspberries',
    title: 'Raspberries',
    cat: 'fruit',
    row: '167755',
    portions: [
      ['1 cup', 123],
      ['1/2 cup', 61.5],
      ['10 berries', 19],
    ],
    why: 'Raspberries are the highest-fiber common fruit per cup in USDA data, ahead of blackberries and far ahead of strawberries or blueberries. The many tiny seeds in each berry are part of the reason.',
    prep: {
      heading: 'Fresh vs frozen raspberries',
      paragraphs: [
        'Frozen unsweetened raspberries are typically close to fresh for fiber and cost less outside summer. They collapse when thawed, which makes them better for smoothies, oatmeal, and chia pudding than for eating out of hand.',
        'Raspberries in syrup or jam are a different story: added sugar dilutes the fruit, so per spoonful the fiber is much lower. Use the label for those.',
      ],
    },
    tips: 'Half a cup on yogurt or oatmeal adds about 4 g. Raspberries and [chia seeds](/chia-seeds) together make one of the highest-fiber breakfasts on this site.',
    meal: '1 cup raspberries, 170g greek yogurt, 1 tbsp chia seeds',
    faqs: [
      {
        q: 'Which berry has the most fiber?',
        a: 'Raspberries, at {{raspberries}}. Blackberries are close at {{blackberries}}; blueberries are {{blueberries}} and strawberries {{strawberries}}.',
      },
      {
        q: 'Do frozen raspberries have less fiber?',
        a: 'Not meaningfully. Freezing does not remove fiber. Check that the bag is plain fruit without added sugar.',
      },
    ],
  },
  {
    slug: 'blackberries',
    name: 'blackberries',
    title: 'Blackberries',
    cat: 'fruit',
    row: '173946',
    portions: [
      ['1 cup', 144],
      ['1/2 cup', 72],
    ],
    why: 'Blackberries are a close second to raspberries for fiber per cup among common berries. They are larger and juicier, so a cup holds fewer berries but weighs more.',
    prep: {
      heading: 'Getting the most from blackberries',
      paragraphs: [
        'Like raspberries, blackberries are fragile and expensive out of season. Frozen blackberries are a good substitute for cooking and blending, and the fiber holds up.',
        'Blackberry seeds are noticeable. If the texture bothers you in a smoothie, blend longer or mix with softer fruit like banana.',
      ],
    },
    tips: 'Mix blackberries with raspberries for a high-fiber berry bowl, or bake them into a crumble topped with oats.',
    meal: '1 cup blackberries, 1 cup oatmeal, 1 tbsp ground flaxseed',
    faqs: [
      {
        q: 'Are blackberries high in fiber?',
        a: 'Yes. One cup gives a little over a quarter of the 28 g Daily Value, which is unusually high for fruit.',
      },
      {
        q: 'Blackberries vs raspberries?',
        a: 'Raspberries edge ahead per cup: {{raspberries}} versus {{blackberries}}. Either is a strong choice.',
      },
    ],
  },
  {
    slug: 'strawberries',
    name: 'strawberries',
    title: 'Strawberries',
    cat: 'fruit',
    row: '167762',
    portions: [
      ['1 cup, whole', 144],
      ['1 cup, sliced', 166],
      ['1 medium strawberry', 12],
    ],
    why: 'Strawberries are the most widely eaten berry in the U.S. but one of the lower-fiber ones per cup. That does not make them a bad choice; it just means they work best as part of a meal with another fiber source.',
    prep: {
      heading: 'Whole vs sliced cups',
      paragraphs: [
        'Sliced strawberries pack more tightly into a measuring cup than whole berries, so a sliced cup weighs more and carries a bit more fiber. The table shows both.',
        'Strawberry yogurt, jam, or a strawberry smoothie from a shop usually contains far less fruit than a cup of fresh berries. Check the label or ask what is in it.',
      ],
    },
    tips: 'Pair strawberries with something denser in fiber: a slice of whole-grain toast, oatmeal, or a spoon of chia. A strawberry-banana smoothie with oats is an easy combination.',
    meal: '1 cup strawberries, 1 cup oatmeal, 1 tbsp chia seeds',
    faqs: [
      {
        q: 'Are strawberries a good source of fiber?',
        a: 'A cup gives roughly 10% of the Daily Value, which counts as a good source in label terms but is modest next to raspberries or blackberries.',
      },
      {
        q: 'How much fiber is in one strawberry?',
        a: 'A medium berry (about 12 g) has around a quarter of a gram. It takes a full cup to reach about 3 g.',
      },
    ],
  },
  {
    slug: 'blueberries',
    name: 'blueberries',
    title: 'Blueberries',
    cat: 'fruit',
    row: '171711',
    portions: [
      ['1 cup', 148],
      ['1/2 cup', 74],
    ],
    why: 'Blueberries are popular for their color and convenience, but on fiber they sit in the middle of the berry range: more than strawberries, well below raspberries and blackberries.',
    prep: {
      heading: 'Wild vs cultivated blueberries',
      paragraphs: [
        'Wild (lowbush) blueberries are smaller and are mostly sold frozen. Because more berries fit in a cup, labels for wild blueberries often list somewhat more fiber per cup than USDA’s cultivated blueberry entry. Use the label if you buy wild.',
        'Dried blueberries and blueberry muffins are much less helpful: dried berries are usually sweetened, and muffins contain only a handful of berries.',
      ],
    },
    tips: 'Mix blueberries with a higher-fiber berry or add them to a base that already has fiber, such as oatmeal or a bran cereal.',
    meal: '1 cup blueberries, 1 cup oatmeal, 2 tbsp walnuts',
    faqs: [
      {
        q: 'Are blueberries high in fiber?',
        a: 'Moderately. One cup is {{blueberries}}, about 13% of the Daily Value.',
      },
      {
        q: 'Blueberries vs raspberries for fiber?',
        a: 'Raspberries have a little over twice as much per cup: {{raspberries}}.',
      },
    ],
  },
  {
    slug: 'apple',
    calcIds: ['curated:apple'],
    name: 'an apple',
    title: 'an Apple',
    cat: 'fruit',
    row: '171688',
    portions: [
      ['1 medium (3" diameter), with skin', 182],
      ['1 small, with skin', 149],
      ['1 cup slices, with skin', 109],
      ['1 cup slices, peeled', 110, '171689'],
    ],
    why: 'A medium apple with the skin on is one of the easiest portable fiber sources. Much of that fiber is in or just under the peel, which is why the peeled row in the table is so much lower.',
    prep: {
      heading: 'Skin on vs peeled, whole vs juice',
      paragraphs: [
        'USDA’s peeled apple entry has about half the fiber per 100 g of an apple with skin. Washing and eating the peel is the simplest way to keep it.',
        'Apple juice has almost no fiber, and even unsweetened applesauce has less fiber per serving than the whole fruit with skin. Whole fruit is the version that counts.',
      ],
    },
    tips: 'Slice an apple with 2 tablespoons of peanut butter for a snack, or chop one into oatmeal with cinnamon. Apple size varies a lot: a large apple can weigh 220 g or more.',
    meal: '1 apple, 2 tbsp peanut butter',
    faqs: [
      {
        q: 'Does peeling an apple remove the fiber?',
        a: 'It removes a large share. Per 100 g, USDA lists 2.4 g with skin versus 1.3 g peeled.',
      },
      {
        q: 'Is applesauce as good as an apple for fiber?',
        a: 'No. Applesauce is usually made from peeled apples and is a softer, smaller serving. A whole apple with skin gives more.',
      },
    ],
  },
  {
    slug: 'pear',
    name: 'a pear',
    title: 'a Pear',
    cat: 'fruit',
    row: '169118',
    portions: [
      ['1 medium', 178],
      ['1 cup slices', 140],
    ],
    why: 'Pears are one of the highest-fiber everyday fruits per piece, ahead of an apple of similar size. Like apples, much of their fiber is in the skin, and their gritty “stone cells” are part of the fiber too.',
    prep: {
      heading: 'Pears and sensitive stomachs',
      paragraphs: [
        'Pears are high in fructose and sorbitol, which is one reason they are effective for some people with constipation. The same sugars are high-FODMAP and can trigger bloating in people with IBS. See the [IBS page](/fiber-for-ibs) if that applies to you.',
        'Canned pears in juice or syrup are peeled and softer. Their fiber is lower per piece than a fresh pear with skin.',
      ],
    },
    tips: 'Eat pears with the skin, sliced into salads, baked with oats, or paired with a handful of almonds.',
    meal: '1 pear, 1 oz almonds',
    extraSources: [
      { label: 'Monash University, About FODMAPs and IBS', url: 'https://www.monashfodmap.com/about-fodmap-and-ibs/', note: 'fructose and sorbitol as FODMAPs' },
    ],
    faqs: [
      {
        q: 'Pear vs apple: which has more fiber?',
        a: 'A medium pear is {{pear}}; a medium apple is {{apple}}.',
      },
      {
        q: 'Do pears help with constipation?',
        a: 'For some people. Their fiber plus naturally occurring sorbitol and fructose draws water into the bowel. If constipation is persistent or new, talk with a clinician.',
      },
    ],
  },
  {
    slug: 'banana',
    name: 'a banana',
    title: 'a Banana',
    cat: 'fruit',
    row: '173944',
    portions: [
      ['1 medium (7–8")', 118],
      ['1 large (8–9")', 136],
      ['1 cup, sliced', 150],
    ],
    why: 'A banana is a moderate fiber source, similar to an orange, and it is the fruit most people already have at home. Its real value for fiber tracking is as a base: it blends into smoothies and oatmeal that carry other high-fiber ingredients.',
    prep: {
      heading: 'Green vs ripe bananas',
      paragraphs: [
        'Less ripe, greener bananas contain more resistant starch, which behaves somewhat like fiber in the gut. As bananas ripen, that starch turns to sugar. Standard fiber figures, including USDA’s, do not fully capture this difference, so treat the table as a ripe-banana estimate.',
        'Banana chips are fried and sweetened; a handful is mostly fat and sugar with little fiber.',
      ],
    },
    tips: 'Pair a banana with peanut butter on whole wheat toast, or blend it with frozen berries and oats.',
    meal: '1 banana, 1 cup oatmeal, 1 tbsp chia seeds',
    faqs: [
      {
        q: 'Are bananas high in fiber?',
        a: 'Moderately. A medium banana is about 11% of the Daily Value.',
      },
      {
        q: 'Do bananas cause constipation?',
        a: 'Not for most people. Some people notice firmer stools with very unripe bananas, but the evidence is mixed. Bananas also contain fiber that supports regularity.',
      },
    ],
  },
  {
    slug: 'orange',
    name: 'an orange',
    title: 'an Orange',
    cat: 'fruit',
    row: '169097',
    portions: [
      ['1 medium', 131],
      ['1 cup sections', 180],
      ['1 cup orange juice', 248, '169098'],
    ],
    why: 'A whole orange gives a few grams of fiber, mostly from the membranes and pith. Juicing leaves almost all of that behind, which is why the juice row in the table is close to zero.',
    prep: {
      heading: 'Whole orange vs orange juice',
      paragraphs: [
        'A cup of orange juice takes two to three oranges to make but keeps very little of their fiber. Even “pulp” juice adds only a small amount. Eating the orange is the version that counts for fiber.',
        'Mandarins and clementines are smaller, so expect less fiber per piece than a navel orange.',
      ],
    },
    tips: 'Keep whole oranges or clementines as a grab-and-go snack, or add segments to a salad with beans and greens.',
    meal: '1 orange, 1 oz almonds',
    faqs: [
      {
        q: 'Does orange juice have fiber?',
        a: 'Very little. USDA lists about 0.5 g in a cup of fresh juice, compared with about 3 g in one medium orange.',
      },
      {
        q: 'Should I eat the white pith?',
        a: 'If you like it, yes. The pith and membranes are where much of an orange’s fiber sits.',
      },
    ],
  },
  {
    slug: 'avocado',
    calcIds: ['curated:avocado'],
    name: 'an avocado',
    title: 'an Avocado',
    cat: 'fruit',
    row: '171705',
    portions: [
      ['1 medium avocado (flesh)', 150],
      ['1/2 medium avocado', 75],
      ['1/3 medium avocado (label serving)', 50],
      ['1 large avocado (flesh)', 201],
    ],
    why: 'A whole avocado carries more fiber than almost any other fruit, but it is also calorie-dense, so most people eat a third to a half at a time. Avocado fat and fiber together are part of why it is filling.',
    prep: {
      heading: 'Portion sizes and guacamole',
      paragraphs: [
        'U.S. Nutrition Facts labels use one-third of a medium avocado (50 g) as the serving. In practice, half an avocado on toast or in a bowl is more common.',
        'Guacamole is mostly avocado plus onion, tomato, lime, and salt. A 2-tablespoon scoop is small; the calculator has a guacamole entry if you log it that way.',
      ],
    },
    tips: 'Half an avocado on two slices of whole-grain toast is a breakfast in the 10 g range. Avocado also pairs naturally with beans in a burrito bowl.',
    meal: '1/2 avocado, 2 slices whole wheat bread, 1 egg',
    faqs: [
      {
        q: 'How much fiber is in half an avocado?',
        a: 'About 5 g for half of a medium avocado (about 75 g of flesh), using USDA’s average for all commercial varieties. Large Florida avocados are much bigger, so weigh them if you can.',
      },
      {
        q: 'Is avocado a fruit?',
        a: 'Yes, botanically it is a single-seeded berry. Nutritionally it behaves more like a fat source with unusually high fiber.',
      },
    ],
  },
  {
    slug: 'kiwi',
    name: 'kiwi',
    title: 'Kiwi',
    cat: 'fruit',
    row: '168153',
    portions: [
      ['1 kiwifruit', 69],
      ['2 kiwifruit', 138],
      ['1 cup, sliced', 180],
    ],
    why: 'Kiwifruit is small, so one fruit gives a couple of grams of fiber. It has drawn research interest because, in clinical trials, eating two green kiwifruit a day improved bowel movement frequency in people with chronic constipation.',
    prep: {
      heading: 'Kiwi skin and the “two a day” habit',
      paragraphs: [
        'The fuzzy skin of green kiwi is edible and adds fiber, although USDA’s entry is for peeled fruit. If the texture is fine for you, washing and eating the skin gives a bit more.',
        'Studies on kiwifruit and constipation typically used two green kiwifruit per day for several weeks. If you try it, give it time and keep fluids up; for ongoing constipation, a clinician can check for other causes.',
      ],
    },
    tips: 'Two kiwis with breakfast is a simple routine. They also work sliced into yogurt or blended into a green smoothie.',
    meal: '2 kiwifruit, 170g greek yogurt, 2 tbsp wheat bran',
    extraSources: [
      { label: 'American College of Gastroenterology, Evidence-Based GI: Kiwifruit to improve stool frequency in mild constipation (2023)', url: 'https://gi.org/journals-publications/ebgi/schoenfeld_aug2023/', note: 'summary of the two-kiwifruit-a-day trial' },
    ],
    faqs: [
      {
        q: 'Can you eat kiwi skin?',
        a: 'Yes, the skin of green and gold kiwi is edible. Wash it well. It adds some fiber and texture.',
      },
      {
        q: 'Is kiwi good for constipation?',
        a: 'Several clinical trials found two green kiwifruit a day improved stool frequency in adults with constipation. It is a reasonable food-first option, not a replacement for medical advice.',
      },
    ],
  },
  {
    slug: 'mango',
    name: 'mango',
    title: 'Mango',
    cat: 'fruit',
    row: '169910',
    portions: [
      ['1 cup pieces', 165],
      ['1 whole mango (flesh)', 336],
    ],
    why: 'Mango is a lower-fiber fruit per cup, but a whole mango is a big serving, so eating one gets you into the same range as an apple or pear. It is mostly a flavor and vitamin food rather than a fiber powerhouse.',
    prep: {
      heading: 'Fresh, frozen, and dried mango',
      paragraphs: [
        'Frozen mango chunks are a convenient smoothie base with fiber similar to fresh.',
        'Dried mango is concentrated: a small handful can carry as much sugar as a whole fresh mango. Sweetened dried mango has added sugar on top. Use the label.',
      ],
    },
    tips: 'Combine mango with higher-fiber partners: chia pudding, a bean salad with lime, or a smoothie with oats.',
    meal: '1 cup mango, 1 tbsp chia seeds, 170g greek yogurt',
    faqs: [
      {
        q: 'Is mango high in fiber?',
        a: 'Not especially. A cup is about 9% of the Daily Value. A whole mango roughly doubles that.',
      },
      {
        q: 'Which tropical fruit has more fiber?',
        a: 'Guava and passion fruit are much higher per cup. Guava is {{guava}}.',
      },
    ],
  },
  {
    slug: 'prunes',
    name: 'prunes',
    title: 'Prunes',
    cat: 'fruit',
    row: '168162',
    portions: [
      ['5 prunes', 47.5],
      ['1 prune', 9.5],
      ['1/4 cup, pitted', 43.5],
    ],
    why: 'Prunes (dried plums) are the classic food remedy for constipation, and the evidence supports it: in a randomized trial, 50 g of prunes twice a day worked at least as well as psyllium for mild to moderate constipation. They combine fiber with sorbitol, a sugar alcohol that draws water into the bowel.',
    prep: {
      heading: 'Prunes vs prune juice',
      paragraphs: [
        'Prune juice keeps the sorbitol but loses most of the fiber, so it can still have a laxative effect with little fiber. Whole prunes give both.',
        'Because of the sorbitol, a large serving of prunes can cause gas or loose stools. Start with three to five and see how you respond.',
      ],
    },
    tips: 'Chop prunes into oatmeal, eat a few with a handful of walnuts, or simmer them into a stew with lentils.',
    meal: '5 prunes, 1 oz walnuts',
    extraSources: [
      { label: 'Attaluri A, et al. Randomised clinical trial: dried plums (prunes) vs. psyllium for constipation. Aliment Pharmacol Ther. 2011', url: 'https://pubmed.ncbi.nlm.nih.gov/21488922/', note: '50 g prunes twice daily vs psyllium' },
    ],
    faqs: [
      {
        q: 'How many prunes a day for constipation?',
        a: 'One well-known trial used 50 g twice a day, roughly five or six prunes each time. Many people do well with less. Start lower, drink water, and talk to a clinician if constipation persists.',
      },
      {
        q: 'Are prunes high in sugar?',
        a: 'Yes, like all dried fruit they are concentrated. Five prunes have roughly 115 calories. They are a useful food, but portions matter.',
      },
    ],
  },
  {
    slug: 'dates',
    name: 'dates',
    title: 'Dates',
    cat: 'fruit',
    row: '168191',
    portions: [
      ['1 Medjool date', 24],
      ['3 Medjool dates', 72],
      ['5 Deglet Noor dates', 35.5, '171726'],
    ],
    why: 'Dates are naturally sweet and often used in place of sugar in bars and smoothies. They do carry fiber, about 1.6 g per Medjool date, but also concentrated sugar, so they are best treated as a fiber-containing sweetener rather than a main fiber source.',
    prep: {
      heading: 'Medjool vs Deglet Noor',
      paragraphs: [
        'Medjool dates are large and soft; Deglet Noor dates are smaller and firmer. Per 100 g, USDA lists Deglet Noor slightly higher in fiber, but because each date is smaller, you need several to match one Medjool.',
        'Date-sweetened bars and energy balls vary widely. Use the label, since nuts, oats, and seeds in the recipe also change the total.',
      ],
    },
    tips: 'Stuff a Medjool date with almond or peanut butter, or blend one into a smoothie in place of honey.',
    meal: '2 dates, 1 oz almonds',
    faqs: [
      {
        q: 'Are dates good for fiber?',
        a: 'They contribute, but calories add up quickly. Three Medjool dates give about 5 g of fiber and roughly 200 calories.',
      },
      {
        q: 'Dates vs prunes?',
        a: 'By weight they are similar in fiber. Prunes also contain sorbitol, which is why they have the stronger reputation for constipation.',
      },
    ],
  },
  {
    slug: 'dried-figs',
    name: 'dried figs',
    title: 'Dried Figs',
    cat: 'fruit',
    row: '174665',
    portions: [
      ['1/4 cup', 37],
      ['1 dried fig', 8.4],
      ['1 medium fresh fig', 50, '173021'],
    ],
    why: 'Dried figs are one of the most fiber-dense dried fruits by weight, thanks in part to their many tiny seeds. Like other dried fruit, they also concentrate sugar, so a small handful goes a long way.',
    prep: {
      heading: 'Dried vs fresh figs',
      paragraphs: [
        'Fresh figs are mostly water and in season only briefly. Drying removes water, so the fiber per gram rises sharply. One fresh fig and one dried fig are not the same portion.',
        'Fig bars and fig cookies are mostly flour and sugar, with a thin fig filling.',
      ],
    },
    tips: 'Chop a few dried figs into oatmeal or a grain salad, or pair two with a piece of cheese and walnuts.',
    meal: '1/4 cup dried figs, 1 oz walnuts',
    faqs: [
      {
        q: 'How much fiber is in one dried fig?',
        a: 'Most dried figs weigh about 8 g and carry close to 1 g of fiber each.',
      },
      {
        q: 'Do figs help with constipation?',
        a: 'Their fiber may help some people. The evidence is stronger for prunes and kiwifruit.',
      },
    ],
  },
  {
    slug: 'guava',
    name: 'guava',
    title: 'Guava',
    cat: 'fruit',
    row: '173044',
    portions: [
      ['1 fruit', 55],
      ['1 cup', 165],
    ],
    why: 'Guava is one of the highest-fiber fruits per cup, rivaling raspberries. Its edible seeds and skin both contribute. It is common in Latin American, South Asian, and Southeast Asian markets and increasingly in U.S. grocery stores.',
    prep: {
      heading: 'Eating guava whole',
      paragraphs: [
        'You can eat the skin and seeds of common guava. Scooping out the seeds removes some fiber and leaves you with the softer flesh.',
        'Guava juice and nectar have most of the fiber strained out and often added sugar.',
      ],
    },
    tips: 'Slice guava into a fruit salad, eat it with a pinch of chili and salt, or blend it into a smoothie with yogurt.',
    meal: '1 cup guava, 170g greek yogurt',
    faqs: [
      {
        q: 'Is guava higher in fiber than an apple?',
        a: 'Per cup, yes. A cup of guava is {{guava}}, while a cup of apple slices with skin is about 2.6 g.',
      },
      {
        q: 'Can you eat guava seeds?',
        a: 'Yes. They are hard but edible and contribute to the fiber.',
      },
    ],
  },
]
