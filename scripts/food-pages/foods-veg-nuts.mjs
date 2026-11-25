/** Hand-written copy for per-food fiber pages (vegetables, nuts, seeds). See foods-legumes-grains.mjs. */
export const VEG_NUTS = [
  {
    slug: 'broccoli',
    name: 'broccoli',
    title: 'Broccoli',
    cat: 'vegetables',
    row: '169967',
    portions: [
      ['1 cup chopped, cooked', 156],
      ['1/2 cup chopped, cooked', 78],
      ['1 cup chopped, raw', 91, '170379'],
    ],
    why: 'Broccoli is the vegetable most people think of for fiber. A cup of cooked broccoli gives a solid few grams, and because it is so low in calories, it ranks high on fiber per calorie.',
    prep: {
      heading: 'Raw vs cooked broccoli',
      paragraphs: [
        'Cooking does not create fiber, but it shrinks broccoli, so a cooked cup holds more broccoli than a raw cup. That is why the cooked cup in the table has about twice the fiber of the raw cup.',
        'An older version of USDA’s data paired “1 cup” with a half-cup weight, which made cooked broccoli look lower than it is. This site uses the corrected 156 g cup.',
      ],
    },
    tips: 'Roast a sheet pan of broccoli for the week, or add a cup of florets to pasta, stir-fries, and grain bowls.',
    meal: '1 cup broccoli, 1 cup brown rice, 1/2 cup edamame',
    faqs: [
      {
        q: 'Does steaming broccoli destroy fiber?',
        a: 'No. Steaming, boiling, and roasting do not destroy fiber. They change texture and volume.',
      },
      {
        q: 'Do broccoli stems have fiber?',
        a: 'Yes. Peeled and sliced, stems are tender and just as useful as florets.',
      },
    ],
  },
  {
    slug: 'brussels-sprouts',
    name: 'Brussels sprouts',
    title: 'Brussels Sprouts',
    cat: 'vegetables',
    row: '169971',
    portions: [
      ['1 cup, cooked', 156],
      ['1/2 cup, cooked', 78],
      ['1 cup, raw', 88, '170383'],
    ],
    why: 'Brussels sprouts are dense little cabbages, so a cup holds more fiber than a cup of leafy greens. Roasting has made them one of the more popular high-fiber side dishes.',
    prep: {
      heading: 'Roasted, shaved, or boiled',
      paragraphs: [
        'Roasting and boiling do not change the fiber much; shredding them raw into a salad gives a lighter, lower-fiber cup because it is less tightly packed.',
        'Like other cruciferous vegetables, Brussels sprouts can cause gas for some people. Smaller portions more often tend to work better than one large serving.',
      ],
    },
    tips: 'Roast halved sprouts with olive oil until browned, then toss with a little balsamic or mustard. A cup alongside beans or whole grains makes a high-fiber dinner.',
    meal: '1 cup brussels sprouts, 1 cup quinoa, 1/2 cup chickpeas',
    faqs: [
      {
        q: 'Are Brussels sprouts higher in fiber than broccoli?',
        a: 'Close. Cooked Brussels sprouts are {{brussels-sprouts}}; cooked broccoli is {{broccoli}}.',
      },
      {
        q: 'Why do Brussels sprouts cause gas?',
        a: 'They contain fermentable carbohydrates and sulfur compounds. Building up gradually usually helps.',
      },
    ],
  },
  {
    slug: 'carrots',
    name: 'carrots',
    title: 'Carrots',
    cat: 'vegetables',
    row: '170393',
    portions: [
      ['1 medium carrot, raw', 61],
      ['1 cup chopped, raw', 128],
      ['1 cup slices, cooked', 156, '170394'],
    ],
    why: 'Carrots are an everyday vegetable with a modest amount of fiber per carrot. Their strength is convenience: they are cheap, keep for weeks, and work as a raw snack.',
    prep: {
      heading: 'Raw sticks vs cooked carrots',
      paragraphs: [
        'Cooked carrots soften and pack more tightly into a cup, so a cooked cup holds more carrot and more fiber than a raw cup of sticks.',
        'Baby carrots are regular carrots cut and peeled; their fiber per gram is similar. Carrot juice keeps little fiber.',
      ],
    },
    tips: 'A cup of raw carrots with a quarter cup of hummus is an easy 6–7 g snack. Cooked carrots add fiber to soups, stews, and lentil dishes.',
    meal: '1 cup carrots, 1/4 cup hummus',
    faqs: [
      {
        q: 'How much fiber is in baby carrots?',
        a: 'About 2.8 g per 100 g raw, the same as whole carrots. Ten baby carrots weigh roughly 100 g.',
      },
      {
        q: 'Are carrots low-FODMAP?',
        a: 'Monash University lists carrots as low-FODMAP at typical servings, so they are often a comfortable choice for people with IBS.',
      },
    ],
  },
  {
    slug: 'sweet-potato',
    name: 'sweet potato',
    title: 'Sweet Potato',
    cat: 'vegetables',
    row: '168483',
    portions: [
      ['1 medium, baked (flesh)', 114],
      ['1 cup, baked (flesh)', 200],
    ],
    why: 'A baked sweet potato gives a few grams of fiber along with plenty of vitamin A. Larger sweet potatoes, which are common in U.S. stores, can easily be twice the USDA medium.',
    prep: {
      heading: 'Skin on and portion size',
      paragraphs: [
        'USDA’s baked sweet potato entry is for the flesh only. The skin is edible and adds some fiber, so eating it gives a bit more than the table shows.',
        'Sweet potato fries and casseroles change the picture: frying adds fat, and casseroles add sugar and butter. The fiber per cup of sweet potato is similar, but the portion of actual potato is often smaller.',
      ],
    },
    tips: 'Top a baked sweet potato with black beans and serve with cooked greens for a meal in the 15 g range.',
    meal: '1 sweet potato, 1/2 cup black beans, 1 cup cooked spinach',
    faqs: [
      {
        q: 'Sweet potato vs white potato for fiber?',
        a: 'Similar per medium potato. A baked white potato with skin is {{potato}}; a medium baked sweet potato is {{sweet-potato}}.',
      },
      {
        q: 'Should I eat sweet potato skin?',
        a: 'If you enjoy it, yes. Wash it well before baking. The skin adds fiber.',
      },
    ],
  },
  {
    slug: 'potato',
    name: 'a baked potato',
    title: 'a Baked Potato',
    cat: 'vegetables',
    row: '170093',
    portions: [
      ['1 medium, baked, flesh and skin', 173],
      ['1 potato skin (only)', 58, '170034'],
      ['1 cup baked flesh, no skin', 61, '170033'],
    ],
    why: 'White potatoes are not usually thought of as a fiber food, but a medium baked potato with the skin gives about as much fiber as a medium apple. The skin is where it is most concentrated.',
    prep: {
      heading: 'Why the skin matters',
      paragraphs: [
        'USDA’s potato skin entry is about five times higher in fiber per 100 g than the flesh alone. Mashed potatoes made from peeled potatoes lose much of that.',
        'Cooled potatoes, as in potato salad, form some resistant starch, which acts somewhat like fiber in the gut. Standard fiber figures do not count it fully.',
      ],
    },
    tips: 'Keep the skin on for baked, roasted, and smashed potatoes. Top with beans, broccoli, or chili rather than only cheese and sour cream.',
    meal: '1 baked potato, 1 cup broccoli, 1/2 cup black beans',
    faqs: [
      {
        q: 'How much fiber is in potato skin?',
        a: 'USDA lists a baked skin from one potato (about 58 g) at roughly 4.6 g of fiber, more than the rest of the potato combined.',
      },
      {
        q: 'Are French fries a source of fiber?',
        a: 'A little, depending on portion and whether the skin is left on. Their fat and salt usually outweigh the fiber benefit.',
      },
    ],
  },
  {
    slug: 'spinach',
    name: 'spinach',
    title: 'Spinach',
    cat: 'vegetables',
    row: '168463',
    portions: [
      ['1 cup, cooked', 180],
      ['1 cup, raw', 30, '168462'],
      ['3 cups, raw', 90, '168462'],
    ],
    why: 'Spinach shows how much cooking changes a portion. A cup of raw leaves weighs only 30 g, while a cup of cooked spinach is about six times that, so the cooked cup has many times the fiber.',
    prep: {
      heading: 'Raw salad vs cooked spinach',
      paragraphs: [
        'A big raw spinach salad looks like a lot of food but adds only a gram or two of fiber. Wilting the same spinach into a pasta or curry concentrates it.',
        'Frozen chopped spinach is already cooked down, so a cup of thawed frozen spinach is closer to the cooked row.',
      ],
    },
    tips: 'Wilt a few handfuls of spinach into eggs, soups, lentils, or pasta sauce. A cup of cooked spinach adds about 4 g.',
    meal: '1 cup cooked spinach, 1 cup lentils, 1/2 cup brown rice',
    faqs: [
      {
        q: 'Is spinach high in fiber?',
        a: 'Cooked, it is a good source. Raw, a single cup is small. It depends on whether you count raw volume or cooked.',
      },
      {
        q: 'Spinach vs kale?',
        a: 'Cooked, they are close. Cooked spinach is {{spinach}} and cooked kale about 4.7 g per cup.',
      },
    ],
  },
  {
    slug: 'kale',
    name: 'kale',
    title: 'Kale',
    cat: 'vegetables',
    row: '169238',
    portions: [
      ['1 cup, cooked', 118],
      ['1 cup, raw (loosely packed)', 21, '168421'],
      ['2 cups, raw', 42, '168421'],
    ],
    why: 'Kale is a popular salad green, but like spinach, its fiber depends on whether it is raw or cooked. Cooked kale is a good source; a raw cup is light and adds less than a gram.',
    prep: {
      heading: 'Massaged raw kale vs cooked',
      paragraphs: [
        'Massaging raw kale with a little oil and salt softens it and shrinks the volume, which lets you eat more kale in one bowl. Weigh it if you want a precise number, because cups of raw kale vary a lot with packing.',
        'Kale chips concentrate the leaves. A bag can hold several cups of raw kale; check the label.',
      ],
    },
    tips: 'Sauté a bunch of kale with garlic as a side, or stir it into bean soups. Two cups of raw kale become about half a cup cooked.',
    meal: '1 cup cooked kale, 1/2 cup chickpeas, 1 cup quinoa',
    faqs: [
      {
        q: 'Does cooking kale reduce fiber?',
        a: 'No. Cooking shrinks the leaves, so a cooked cup holds more kale and more fiber than a raw cup.',
      },
      {
        q: 'Is kale higher in fiber than lettuce?',
        a: 'Yes. Per 100 g, raw kale has roughly twice the fiber of romaine lettuce.',
      },
    ],
  },
  {
    slug: 'artichoke',
    name: 'an artichoke',
    title: 'an Artichoke',
    cat: 'vegetables',
    row: '169205',
    portions: [
      ['1 medium globe artichoke, raw (edible part)', 128],
      ['1 medium artichoke, cooked', 120, '168386'],
      ['1 cup artichoke hearts, cooked', 168, '168386'],
    ],
    why: 'A whole globe artichoke is one of the highest-fiber vegetables per serving. Part of its fiber is inulin, a soluble fiber that feeds gut bacteria.',
    prep: {
      heading: 'Whole artichokes vs canned hearts',
      paragraphs: [
        'Eating a whole steamed artichoke leaf by leaf takes time, and you only eat the tender base of each leaf plus the heart. USDA’s figures are for the edible portion.',
        'Canned or jarred hearts in oil or brine are convenient for salads and pasta. Marinated hearts carry added oil; the fiber per heart is similar.',
      ],
    },
    tips: 'Add a cup of drained artichoke hearts to pasta, pizza, or a white bean salad.',
    meal: '1 artichoke, 1/2 cup navy beans, 1 slice whole wheat bread',
    faqs: [
      {
        q: 'Do artichokes cause gas?',
        a: 'They can. Inulin is fermented by gut bacteria, and artichokes are high-FODMAP. People with IBS often tolerate only small amounts.',
      },
      {
        q: 'Are Jerusalem artichokes the same?',
        a: 'No. Jerusalem artichokes (sunchokes) are tubers from a different plant, also rich in inulin.',
      },
    ],
  },
  {
    slug: 'green-beans',
    name: 'green beans',
    title: 'Green Beans',
    cat: 'vegetables',
    row: '169141',
    portions: [
      ['1 cup, cooked', 125],
      ['1/2 cup, cooked', 62.5],
      ['1 cup, raw', 100, '169961'],
    ],
    why: 'Green beans are immature bean pods, so they are much lower in fiber than dried beans, but they are a solid everyday vegetable side with about 4 g per cooked cup.',
    prep: {
      heading: 'Fresh, frozen, or canned',
      paragraphs: [
        'Frozen green beans are close to fresh for fiber. Canned green beans are softer and salted; rinse them and the fiber per cup is in a similar range.',
        'Green bean casserole is mostly soup and fried onions, so the green beans themselves are a smaller share of each scoop.',
      ],
    },
    tips: 'Steam or roast a cup as a side, or toss into a stir-fry with brown rice.',
    meal: '1 cup green beans, 1 baked potato, 1 cup broccoli',
    faqs: [
      {
        q: 'Are green beans a legume?',
        a: 'Botanically yes, but nutritionally they are treated as a vegetable because you eat the immature pod.',
      },
      {
        q: 'Green beans vs kidney beans?',
        a: 'Kidney beans are dried mature seeds and far higher: {{kidney-beans}}.',
      },
    ],
  },
  {
    slug: 'butternut-squash',
    name: 'butternut squash',
    title: 'Butternut Squash',
    cat: 'vegetables',
    row: '169296',
    portions: [
      ['1 cup cubes, baked', 205],
      ['1/2 cup cubes, baked', 102.5],
      ['1 cup cubes, raw', 140, '169295'],
    ],
    why: 'Baked butternut squash is one of the better fiber sources among sweet, starchy vegetables, with more fiber per cooked cup than sweet potato flesh. It is a fall and winter staple for soups and roasting.',
    prep: {
      heading: 'Roasted cubes vs squash soup',
      paragraphs: [
        'Roasting concentrates squash, so a cup of roasted cubes is denser than a cup of raw cubes.',
        'Butternut soup is often thinned with stock and cream. A cup of soup can have well under half the squash of a cup of roasted cubes.',
      ],
    },
    tips: 'Roast cubes and add to grain bowls with chickpeas, or blend into a thick soup with white beans to raise the fiber.',
    meal: '1 cup butternut squash, 1/2 cup chickpeas, 1 cup quinoa',
    faqs: [
      {
        q: 'Is butternut squash high in fiber?',
        a: 'Baked, a cup is about a quarter of the Daily Value, which is high for a vegetable.',
      },
      {
        q: 'What about canned pumpkin?',
        a: 'Plain canned pumpkin is also a good source, about 7 g per cup in USDA data. Pumpkin pie filling has added sugar.',
      },
    ],
  },

  // ——— Nuts, seeds and more ———
  {
    slug: 'almonds',
    name: 'almonds',
    title: 'Almonds',
    cat: 'nuts',
    row: '170567',
    portions: [
      ['1 oz (about 23 almonds)', 28.35],
      ['1/4 cup', 35.75],
    ],
    why: 'Almonds have more fiber per ounce than most common nuts. A standard one-ounce handful gives about 3.5 g, though it also carries around 160 calories.',
    prep: {
      heading: 'Whole almonds, almond butter, almond milk',
      paragraphs: [
        'Almond butter keeps the fiber of the almonds it is made from, so 2 tablespoons is in a similar range to a one-ounce handful. Check the label.',
        'Almond milk is mostly water and has almost no fiber. Almond flour keeps fiber but is used in small amounts per serving of baked goods.',
      ],
    },
    tips: 'Pre-portion one-ounce snack bags, or add a tablespoon of sliced almonds to oatmeal or salads.',
    meal: '1 oz almonds, 1 apple',
    faqs: [
      {
        q: 'Which nut has the most fiber?',
        a: 'Among common nuts on this site, almonds lead per ounce at {{almonds}}. Pistachios are close at {{pistachios}}.',
      },
      {
        q: 'Does almond milk have fiber?',
        a: 'Very little. Most of the almond solids are strained out.',
      },
    ],
  },
  {
    slug: 'flaxseed',
    name: 'flaxseed',
    title: 'Flaxseed',
    cat: 'nuts',
    row: '169414',
    portions: [
      ['1 tbsp, whole', 10.3],
      ['1 tbsp, ground', 7],
      ['2 tbsp, ground', 14],
    ],
    why: 'Flaxseed is one of the most fiber-dense foods by weight, with both soluble mucilage and insoluble fiber. Ground flax is also a common source of the plant omega-3 fat ALA.',
    prep: {
      heading: 'Whole vs ground flax',
      paragraphs: [
        'Whole flaxseeds often pass through the gut intact, so grinding is recommended to absorb the fats. For fiber, both forms count. A tablespoon of ground flax weighs less than a tablespoon of whole seeds, so it has less fiber per spoon.',
        'Ground flax goes rancid faster. Store it in the fridge or freezer, or grind small batches.',
      ],
    },
    tips: 'Stir 1–2 tablespoons of ground flax into oatmeal, yogurt, smoothies, or pancake batter. Increase gradually and drink water.',
    meal: '2 tbsp ground flaxseed, 1 cup oatmeal, 1/2 cup raspberries',
    faqs: [
      {
        q: 'Flax vs chia for fiber?',
        a: 'Per tablespoon, chia is a little higher. Chia is about 4.1 g per tablespoon on the [chia seeds](/chia-seeds) guide; whole flax is {{flaxseed}}.',
      },
      {
        q: 'How much flaxseed a day?',
        a: 'Many people use 1–2 tablespoons of ground flax a day. If you take medications, ask your pharmacist, since large amounts of fiber can affect absorption timing.',
      },
    ],
  },
  {
    slug: 'pumpkin-seeds',
    name: 'pumpkin seeds',
    title: 'Pumpkin Seeds',
    cat: 'nuts',
    row: '170556',
    portions: [
      ['1 oz hulled kernels (pepitas)', 28.35],
      ['1 oz whole seeds in shell, roasted', 28.35, '170188'],
    ],
    why: 'Pumpkin seeds are a good example of how much the shell matters. Hulled green pepitas are modest in fiber, while whole roasted seeds with the white shell have roughly three times as much per ounce.',
    prep: {
      heading: 'Pepitas vs whole roasted seeds',
      paragraphs: [
        'Store-bought pepitas are usually hulled and sold for salads and trail mix. Seeds you scoop from a carving pumpkin and roast at home keep the fibrous shell.',
        'Both forms are calorie-dense, roughly 125–165 calories per ounce.',
      ],
    },
    tips: 'Roast seeds from a fall pumpkin with a little salt, or sprinkle pepitas over soups and salads for crunch.',
    meal: '1 oz pumpkin seeds, 1 cup butternut squash',
    faqs: [
      {
        q: 'Are pumpkin seeds high in fiber?',
        a: 'Whole roasted seeds with the shell are. Hulled pepitas are a moderate source.',
      },
      {
        q: 'Can you eat pumpkin seed shells?',
        a: 'Yes, roasted shells are edible and are where most of the fiber is. Chew them well.',
      },
    ],
  },
  {
    slug: 'pistachios',
    name: 'pistachios',
    title: 'Pistachios',
    cat: 'nuts',
    row: '170185',
    portions: [
      ['1 oz (about 49 kernels)', 28.35],
      ['1/4 cup kernels', 30.75],
    ],
    why: 'Pistachios are one of the higher-fiber nuts per ounce, second only to almonds among the nuts on this site. You get about 49 kernels in an ounce, more than most nuts, which makes the portion feel bigger.',
    prep: {
      heading: 'In-shell pistachios',
      paragraphs: [
        'Weights here are for shelled kernels. In-shell pistachios weigh roughly twice as much per ounce of kernels, so weigh after shelling or count kernels.',
        'Shelling them one by one slows you down, which some people find helps with portion control.',
      ],
    },
    tips: 'Pair an ounce of pistachios with a piece of fruit, or chop them over yogurt or a grain salad.',
    meal: '1 oz pistachios, 1 orange',
    faqs: [
      {
        q: 'Pistachios vs almonds?',
        a: 'Almonds are slightly higher per ounce: {{almonds}} versus {{pistachios}}.',
      },
      {
        q: 'How many pistachios are in a serving?',
        a: 'About 49 kernels make up 1 oz.',
      },
    ],
  },
  {
    slug: 'walnuts',
    name: 'walnuts',
    title: 'Walnuts',
    cat: 'nuts',
    row: '170187',
    portions: [
      ['1 oz (about 14 halves)', 28.35],
      ['1/4 cup chopped', 29.25],
    ],
    why: 'Walnuts are better known for their omega-3 fat (ALA) than their fiber. Per ounce, they have about half the fiber of almonds, but they are a useful add-on to oatmeal, salads, and baked goods.',
    prep: {
      heading: 'Walnuts in context',
      paragraphs: [
        'At roughly 185 calories per ounce, walnuts are one of the more calorie-dense nuts, so their fiber per calorie is lower than almonds or pistachios.',
        'Toasting briefly brings out flavor without changing fiber.',
      ],
    },
    tips: 'Two tablespoons of chopped walnuts on oatmeal with berries adds crunch, ALA, and a little fiber.',
    meal: '1 oz walnuts, 1 cup oatmeal, 1/2 cup blueberries',
    faqs: [
      {
        q: 'Are walnuts high in fiber?',
        a: 'Moderately. About 2 g per ounce.',
      },
      {
        q: 'Walnuts vs almonds for fiber?',
        a: 'Almonds have about twice as much per ounce: {{almonds}}.',
      },
    ],
  },
  {
    slug: 'peanut-butter',
    name: 'peanut butter',
    title: 'Peanut Butter',
    cat: 'nuts',
    row: '172470',
    portions: [
      ['2 tbsp', 32],
      ['1 tbsp', 16],
      ['1 oz peanuts, raw', 28.35, '172430'],
    ],
    why: 'Peanut butter gives a modest amount of fiber per spoonful, and peanuts themselves are legumes. The fiber matters less than what you put it on: whole-grain bread, apples, and oats.',
    prep: {
      heading: 'Natural vs regular peanut butter',
      paragraphs: [
        'Natural peanut butter (just peanuts and salt) and regular peanut butter with added oil and sugar have similar fiber per tablespoon, because the peanuts are most of both.',
        'Powdered peanut butter removes much of the fat. Check the label: fiber per serving is usually similar or slightly lower because the serving is smaller.',
      ],
    },
    tips: 'Spread on whole-grain toast with banana slices, or dip apple slices in it.',
    meal: '2 tbsp peanut butter, 2 slices whole wheat bread, 1 banana',
    faqs: [
      {
        q: 'Does peanut butter have fiber?',
        a: 'A little: about 1.6 g per 2 tablespoons in USDA data.',
      },
      {
        q: 'Peanut butter vs almond butter?',
        a: 'Almond butter is usually somewhat higher in fiber per tablespoon. Compare labels.',
      },
    ],
  },
  {
    slug: 'dark-chocolate',
    name: 'dark chocolate',
    title: 'Dark Chocolate',
    cat: 'nuts',
    row: '170273',
    portions: [
      ['1 oz (70–85% cacao)', 28.35],
      ['1 square (about 10 g)', 10],
    ],
    why: 'High-cacao dark chocolate carries real fiber from the cocoa solids, about 3 g per ounce. It is still a calorie-dense treat, but it is one of the few sweets that contributes to a fiber total.',
    prep: {
      heading: 'Cacao percentage matters',
      paragraphs: [
        'The figures here are for 70–85% cacao. Milk chocolate and lower-percentage bars have less cocoa solid and more sugar, so their fiber is much lower.',
        'Unsweetened cocoa powder is even more concentrated: USDA lists about 2 g of fiber per tablespoon.',
      ],
    },
    tips: 'A square or two of dark chocolate with berries or almonds makes a fiber-friendly dessert.',
    meal: '1 oz dark chocolate, 1/2 cup raspberries',
    faqs: [
      {
        q: 'Is dark chocolate a good source of fiber?',
        a: 'An ounce of 70–85% dark chocolate has about 3 g, roughly 11% of the Daily Value, with around 170 calories.',
      },
      {
        q: 'Does milk chocolate have fiber?',
        a: 'Much less. Most milk chocolate has a gram or less per ounce.',
      },
    ],
  },
]
