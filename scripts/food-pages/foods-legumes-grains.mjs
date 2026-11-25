/**
 * Hand-written copy for per-food fiber pages (legumes + grains).
 * Numbers are never typed here: every gram figure is computed by build.mjs from
 * the USDA FoodData Central rows named below. `{{slug}}` expands to
 * "about X g per <primary portion>" and `{{g:slug}}` to "X g" for another page.
 */
export const LEGUMES_GRAINS = [
  {
    slug: 'black-beans',
    name: 'black beans',
    title: 'Black Beans',
    cat: 'legumes',
    row: '173735',
    portions: [
      ['1 cup, cooked', 172],
      ['1/2 cup, cooked', 86],
      ['1/4 cup, cooked', 43],
    ],
    why: 'Black beans are one of the easiest ways to move a day’s fiber total: one cooked cup covers more than half of a 25 g target on its own. The same cup also brings roughly 15 g of protein, which is why beans anchor so many filling, high-fiber meals.',
    prep: {
      heading: 'Canned vs home-cooked black beans',
      paragraphs: [
        'Beans cooked from dry and drained canned beans land in a similar range per cup; the bigger variable is how much you actually eat. Canned labels usually list a 1/2 cup serving with its weight in grams, so compare the gram weight rather than the number on the front of the can.',
        'Rinsing canned beans lowers the sodium from the canning liquid. The fiber is in the bean itself, so rinsing does not wash it away.',
      ],
    },
    tips: 'Half a cup folded into a burrito bowl, a scoop on a salad, or a bean-and-corn salsa adds 7–8 g without much effort. If beans are new to you, start with a quarter cup and build up over a couple of weeks.',
    meal: '1 cup black beans, 1 cup brown rice, 1/2 avocado',
    faqs: [
      {
        q: 'Do black beans cause gas?',
        a: 'They can, especially if you rarely eat beans. Beans contain fermentable carbohydrates (galacto-oligosaccharides) that gut bacteria break down. Starting with 1/4 to 1/2 cup, rinsing canned beans, and increasing over a few weeks usually helps. Persistent symptoms are worth raising with a clinician.',
      },
      {
        q: 'Black beans or pinto beans: which has more fiber?',
        a: 'They are close. Cooked black beans are {{black-beans}} and cooked pinto beans are {{pinto-beans}}. Pick the one you will eat more often.',
      },
    ],
  },
  {
    slug: 'chickpeas',
    name: 'chickpeas',
    title: 'Chickpeas',
    cat: 'legumes',
    row: '173757',
    portions: [
      ['1 cup, cooked', 164],
      ['1/2 cup, cooked', 82],
      ['1 can (15.5 oz), drained', 253, '173800'],
    ],
    why: 'Chickpeas (garbanzo beans) are the base of hummus, falafel, chana masala, and roasted snack chickpeas, so they show up in more forms than most legumes. Cooked chickpeas are a little lower in fiber per cup than black or navy beans, but still one of the strongest single foods you can add to a meal.',
    prep: {
      heading: 'Whole chickpeas vs hummus vs roasted',
      paragraphs: [
        'Hummus is mostly chickpeas, but it also contains tahini, oil, and water, and the usual serving is only 2 tablespoons. That is why a scoop of hummus gives much less fiber than a scoop of whole chickpeas. See the [hummus](/fiber-in-hummus) page for dip-sized portions.',
        'Roasting removes water, so a cup of crunchy roasted chickpeas weighs less and is more concentrated than a cup of cooked ones. For packaged roasted chickpeas, use the label: it reflects the brand’s recipe and serving weight.',
      ],
    },
    tips: 'Toss half a cup into a grain bowl or green salad, or stir a drained can into a curry or soup that serves three or four people. A whole drained can is a lot of fiber for one sitting if you are not used to legumes.',
    meal: '1/2 cup chickpeas, 1 cup quinoa, 1 cup spinach',
    faqs: [
      {
        q: 'Are canned chickpeas as high in fiber as cooked dried chickpeas?',
        a: 'Per gram they are in the same range. USDA lists drained canned chickpeas slightly lower per 100 g than home-boiled, which mostly reflects differences in water content. Drain and rinse, then log by weight or cup.',
      },
      {
        q: 'How much fiber is in a can of chickpeas?',
        a: 'A standard 15.5 oz can that drains to about 253 g has roughly the fiber shown in the table above. Check your can’s drained weight, since it varies by brand.',
      },
    ],
  },
  {
    slug: 'lentils',
    name: 'lentils',
    title: 'Lentils',
    cat: 'legumes',
    row: '172421',
    portions: [
      ['1 cup, cooked', 198],
      ['1/2 cup, cooked', 99],
      ['1/4 cup, dry (uncooked)', 48, '172420'],
    ],
    why: 'Lentils cook in 20–30 minutes without soaking, which makes them the most practical legume for weeknight cooking. A cooked cup supplies fiber in the same league as black and pinto beans, with a softer texture that blends into soups, dals, and sauces.',
    prep: {
      heading: 'Dry vs cooked lentils: log the right one',
      paragraphs: [
        'Lentils roughly double to triple in volume as they cook, so a 1/4 cup of dry lentils becomes well over half a cup cooked. If you measure before cooking, log the dry amount; if you scoop from the pot, log cooked. Mixing the two is the most common logging mistake.',
        'Red lentils break down into a purée, while green and brown lentils hold their shape. USDA’s generic cooked-lentil row covers both for logging purposes; if you use a packaged product, its label is the better reference.',
      ],
    },
    tips: 'A cup of lentil soup made with plenty of lentils, or half a cup of dal with rice, is an easy weekday add. Lentils also stretch ground meat in tacos and bolognese without changing the dish much.',
    meal: '1 cup lentils, 1 cup brown rice, 1 cup spinach',
    faqs: [
      {
        q: 'Are red lentils lower in fiber than green lentils?',
        a: 'Red lentils are usually sold split and hulled, which removes some of the outer seed coat, so they can be somewhat lower in fiber than whole green or brown lentils. Check the package label for the variety you buy.',
      },
      {
        q: 'Is lentil soup a good source of fiber?',
        a: 'It depends on how many lentils are in the bowl. A typical canned or restaurant lentil soup is much thinner than plain cooked lentils, so expect a fraction of {{g:lentils}} per cup. Log homemade soup by the lentils you put in the pot divided by servings.',
      },
    ],
  },
  {
    slug: 'kidney-beans',
    name: 'kidney beans',
    title: 'Kidney Beans',
    cat: 'legumes',
    row: '173740',
    portions: [
      ['1 cup, cooked', 177],
      ['1/2 cup, cooked', 88.5],
      ['1 cup, canned with liquid', 256, '173741'],
    ],
    why: 'Kidney beans are the classic chili and red-beans-and-rice bean. They hold their shape through long simmering, so they work well in big-batch dishes that you portion out over several days.',
    prep: {
      heading: 'Cook dried kidney beans thoroughly',
      paragraphs: [
        'Raw or undercooked red kidney beans contain a natural lectin (phytohaemagglutinin) that can cause severe stomach upset. Soak dried beans, then boil them hard for at least 10 minutes before simmering until soft. Slow cookers on low may not get hot enough to do this on their own. Canned kidney beans are already cooked.',
        'USDA’s canned row includes the liquid, which is why it shows less fiber per 100 g than drained cooked beans. If you drain and rinse, the cooked-bean figures are the closer match.',
      ],
    },
    tips: 'One bowl of bean-heavy chili can supply a large share of a day’s fiber. If you make a pot, divide the beans by the number of servings to estimate your bowl.',
    meal: '1 cup kidney beans, 1 cup white rice, 1 cup green beans',
    extraSources: [
      { label: 'Health Canada, Lectins in dry legumes', url: 'https://www.canada.ca/en/health-canada/services/food-nutrition/food-safety/chemical-contaminants/natural-toxins/lectins-legumes.html', note: 'soak and boil dried kidney beans thoroughly' },
    ],
    faqs: [
      {
        q: 'How much fiber is in a bowl of chili?',
        a: 'It depends almost entirely on the beans. A bowl with half a cup of kidney beans gets roughly half of {{g:kidney-beans}} from them; tomatoes, onions, and peppers add a little more. Meat adds none.',
      },
      {
        q: 'Are kidney beans safe from the can?',
        a: 'Yes. Canned kidney beans are fully cooked. The cooking warning applies to dried beans you prepare yourself.',
      },
    ],
  },
  {
    slug: 'pinto-beans',
    name: 'pinto beans',
    title: 'Pinto Beans',
    cat: 'legumes',
    row: '175200',
    portions: [
      ['1 cup, cooked', 171],
      ['1/2 cup, cooked', 85.5],
      ['1/4 cup, cooked', 42.75],
    ],
    why: 'Pinto beans are the most commonly eaten dry bean in the United States, mostly in Mexican and Tex-Mex dishes. Whole cooked pintos are among the highest-fiber beans per cup in USDA data.',
    prep: {
      heading: 'Whole pinto beans vs refried beans',
      paragraphs: [
        'Refried beans are cooked pintos mashed with fat and often water. The fiber is still there, but a spoonful of refried beans is usually a smaller amount of actual beans than a spoonful of whole ones. For canned refried beans, use the label serving.',
        'Restaurant sides vary a lot in portion size. A small side of beans is often around half a cup, which gives roughly half of the one-cup figure.',
      ],
    },
    tips: 'Swap rice for beans in a burrito or bowl, or ask for extra beans instead of extra cheese. Half a cup of pintos with corn tortillas and avocado is an easy high-fiber lunch.',
    meal: '1 cup pinto beans, 2 corn tortillas, 1/2 avocado',
    faqs: [
      {
        q: 'Do refried beans have as much fiber as whole pinto beans?',
        a: 'Per gram of beans, yes, since mashing does not remove fiber. But refried beans include added fat and water, so the same volume usually holds fewer beans. Compare the label’s grams of fiber per serving.',
      },
      {
        q: 'Which bean has the most fiber?',
        a: 'Among the beans on this site, cooked navy beans lead at {{navy-beans}}. Pinto, black, and split peas are close behind.',
      },
    ],
  },
  {
    slug: 'navy-beans',
    name: 'navy beans',
    title: 'Navy Beans',
    cat: 'legumes',
    row: '173746',
    portions: [
      ['1 cup, cooked', 182],
      ['1/2 cup, cooked', 91],
      ['1/4 cup, cooked', 45.5],
    ],
    why: 'Navy beans are small white beans used in baked beans and white bean soups. Per cooked cup, they carry the most fiber of any bean on this site, more than black, pinto, or kidney beans.',
    prep: {
      heading: 'Navy beans vs canned baked beans',
      paragraphs: [
        'Baked beans are usually made from navy beans, but the canned product includes a sweet tomato sauce. The beans still bring fiber, yet a cup of baked beans contains fewer beans and more sugar than a cup of plain cooked navy beans. Use the can’s label for baked beans.',
        'Plain navy beans have a mild, creamy texture that disappears into soups and purées, which makes them an easy way to add fiber to a dish without changing its flavor much.',
      ],
    },
    tips: 'Blend half a cup into a pasta sauce or soup for creaminess, or toss with olive oil, lemon, and herbs as a side. Because the fiber is so concentrated, increase portions gradually.',
    meal: '1/2 cup navy beans, 2 slices whole wheat bread, 1 cup spinach',
    faqs: [
      {
        q: 'Are navy beans and cannellini beans the same?',
        a: 'No. Both are white beans, but cannellini beans are larger and kidney-shaped. Their fiber is in a similar range; navy bean figures on this page come from USDA’s navy bean entry.',
      },
      {
        q: 'Is one cup of navy beans too much fiber at once?',
        a: 'For someone used to beans, many people tolerate it fine. If your usual intake is low, start with a quarter or half cup and drink water with it, then build up over a few weeks.',
      },
    ],
  },
  {
    slug: 'split-peas',
    name: 'split peas',
    title: 'Split Peas',
    cat: 'legumes',
    row: '172429',
    portions: [
      ['1 cup, cooked', 196],
      ['1/2 cup, cooked', 98],
      ['1 cup split pea soup (typical)', 245, 'curated:split-pea-soup'],
    ],
    why: 'Split peas are dried peas with the skin removed and the seed split in half. They cook down into a thick purée in under an hour without soaking, and a cooked cup holds as much fiber as most beans.',
    prep: {
      heading: 'Split peas vs split pea soup',
      paragraphs: [
        'Most of the fiber in split pea soup comes from the peas, but soup is mostly liquid. A typical cup of soup (the third row in the table, a site estimate for common recipes) has far less fiber than a cup of plain cooked split peas.',
        'For homemade soup, add up the dry peas you used, then divide by servings. One cup of dry split peas yields roughly two and a half cups cooked.',
      ],
    },
    tips: 'Make a thick soup with more peas than broth, or use cooked split peas as a dal-style side. They also thicken stews without flour.',
    meal: '1 cup split peas, 1 slice whole wheat bread, 1 carrot',
    faqs: [
      {
        q: 'Are green and yellow split peas different in fiber?',
        a: 'Not meaningfully for tracking. USDA lists a single cooked split pea entry, and labels for both colors fall in a similar range.',
      },
      {
        q: 'Are split peas the same as green peas?',
        a: 'They come from the same plant, but split peas are dried mature seeds, while green peas are eaten fresh or frozen. Cooked split peas are {{split-peas}}; cooked green peas are {{green-peas}}.',
      },
    ],
  },
  {
    slug: 'green-peas',
    name: 'green peas',
    title: 'Green Peas',
    cat: 'legumes',
    row: '170420',
    portions: [
      ['1 cup, cooked', 160],
      ['1/2 cup, cooked', 80],
      ['1 cup, raw', 145, '170419'],
    ],
    why: 'Green peas are often filed with vegetables, but botanically they are a legume, and their fiber reflects it: a cup of cooked peas has more fiber than a cup of cooked broccoli. Frozen peas are a cheap, no-prep way to add fiber to almost any savory dish.',
    prep: {
      heading: 'Frozen, fresh, or canned peas',
      paragraphs: [
        'Frozen peas are blanched and frozen soon after picking, and their fiber is in the same range as fresh peas. Canned peas are softer and often salted; drain them and use the label if you rely on them often.',
        'Snow peas and sugar snap peas, where you eat the pod, are lower in fiber per cup than shelled green peas because the pod is mostly water.',
      ],
    },
    tips: 'Stir a half cup of frozen peas into pasta, fried rice, curry, or soup in the last few minutes of cooking. It adds about 4 g with almost no extra work.',
    meal: '1 cup green peas, 1 cup brown rice, 1 egg',
    faqs: [
      {
        q: 'Are peas a vegetable or a legume?',
        a: 'Both, depending on who is counting. The U.S. Dietary Guidelines count green peas in the starchy vegetable group, while botanically they are legumes. For fiber, they behave more like beans than like leafy greens.',
      },
      {
        q: 'Do frozen peas have less fiber than fresh?',
        a: 'No meaningful difference for tracking. Freezing does not remove fiber.',
      },
    ],
  },
  {
    slug: 'edamame',
    calcIds: ['curated:edamame'],
    name: 'edamame',
    title: 'Edamame',
    cat: 'legumes',
    row: '168411',
    portions: [
      ['1 cup, shelled, cooked', 155],
      ['1/2 cup, shelled, cooked', 77.5],
    ],
    why: 'Edamame are young green soybeans. They pair a solid amount of fiber with more protein per cup than most beans, which makes them a popular snack for people trying to feel full on fewer calories.',
    prep: {
      heading: 'In the pod vs shelled',
      paragraphs: [
        'The figures here are for shelled beans. Edamame served in the pod look like a bigger portion than they are, because you do not eat the pods. A cup of pods yields roughly half a cup of beans.',
        'Frozen shelled edamame (often sold as mukimame) is the easiest form for bowls and salads. Boil or microwave per the package and log the cooked shelled weight.',
      ],
    },
    tips: 'Add a half cup of shelled edamame to a rice bowl, stir-fry, or salad, or keep a bag of frozen pods for a quick salted snack.',
    meal: '1 cup edamame, 1 cup brown rice, 1 cup broccoli',
    faqs: [
      {
        q: 'Is edamame high in protein too?',
        a: 'Yes. USDA lists cooked shelled edamame at roughly 11–12 g of protein per 100 g, which is more than most cooked beans.',
      },
      {
        q: 'How much fiber is in a bowl of edamame pods?',
        a: 'Count the beans, not the pods. A restaurant appetizer bowl often holds about half a cup to one cup of beans once shelled. Use the shelled rows above.',
      },
    ],
  },
  {
    slug: 'hummus',
    name: 'hummus',
    title: 'Hummus',
    cat: 'legumes',
    row: '174289',
    portions: [
      ['2 tbsp', 30],
      ['1/4 cup', 62],
      ['1 cup', 246],
      ['2 tbsp, homemade', 30, '172454'],
    ],
    why: 'Hummus is a chickpea dip with tahini, lemon, and oil. It is a useful fiber add because you usually eat it with other high-fiber foods, like raw vegetables or whole wheat pita, but a standard 2-tablespoon serving on its own is modest.',
    prep: {
      heading: 'Why a spoonful of hummus is not a serving of beans',
      paragraphs: [
        'A 2-tablespoon serving weighs about 30 g, and only part of that is chickpeas. Compare that with a half cup of cooked [chickpeas](/fiber-in-chickpeas) at 82 g. Most people eat more than 2 tablespoons in practice, so it helps to measure once and see what your usual scoop looks like.',
        'Store-bought and homemade hummus vary with the ratio of chickpeas to tahini and oil. The commercial and homemade rows in the table come from two different USDA entries.',
      ],
    },
    tips: 'The bigger win is what you dip. Carrots, bell peppers, and whole wheat pita all add their own fiber. A quarter cup of hummus with a cup of raw carrots makes a solid afternoon snack.',
    meal: '1/4 cup hummus, 1 cup carrots, 1 whole wheat pita',
    faqs: [
      {
        q: 'Is hummus high in fiber?',
        a: 'Moderately. Two tablespoons give a gram or two, and a quarter cup gives a bit over 3 g. The fiber climbs quickly when you pair it with vegetables or whole-grain bread.',
      },
      {
        q: 'Does flavored hummus have different fiber?',
        a: 'Usually only slightly. Added roasted pepper, garlic, or herbs barely change the fiber. Check the label if you eat a lot of one brand.',
      },
    ],
  },

  // ——— Grains ———
  {
    slug: 'quinoa',
    name: 'quinoa',
    title: 'Quinoa',
    cat: 'grains',
    row: '168917',
    portions: [
      ['1 cup, cooked', 185],
      ['1/2 cup, cooked', 92.5],
      ['1/4 cup, dry (uncooked)', 42.5, '168874'],
    ],
    why: 'Quinoa is a seed cooked like a grain. It has more fiber per cooked cup than white or brown rice, and it cooks in about 15 minutes, which is why it often replaces rice in bowls and salads.',
    prep: {
      heading: 'Dry vs cooked quinoa',
      paragraphs: [
        'Quinoa roughly triples in volume as it cooks, so a quarter cup of dry quinoa makes about three-quarters of a cup cooked. Log the dry amount if you measure before cooking, or cooked if you scoop from the pot, but not both.',
        'Rinsing removes the bitter saponin coating. It does not affect fiber.',
      ],
    },
    tips: 'Swap rice for quinoa in a bowl and add beans or vegetables on top. Quinoa alone is a moderate fiber source; combined with half a cup of beans it becomes a high-fiber meal.',
    meal: '1 cup quinoa, 1/2 cup black beans, 1 cup broccoli',
    faqs: [
      {
        q: 'Quinoa vs brown rice: which has more fiber?',
        a: 'Quinoa. Cooked quinoa is {{quinoa}}; cooked brown rice is {{brown-rice}}.',
      },
      {
        q: 'Is quinoa gluten-free?',
        a: 'Quinoa itself does not contain gluten. If you need to avoid gluten strictly, look for products labeled gluten-free, since cross-contact can happen during processing.',
      },
    ],
  },
  {
    slug: 'brown-rice',
    name: 'brown rice',
    title: 'Brown Rice',
    cat: 'grains',
    row: '169704',
    portions: [
      ['1 cup, cooked', 202],
      ['1/2 cup, cooked', 101],
      ['1 cup white rice, cooked', 158, '168878'],
    ],
    why: 'Brown rice keeps the bran layer that milling removes from white rice. That bran is where most of the fiber is, so brown rice has several times the fiber of white rice per cup. Still, compared with beans, oats, or barley, brown rice is a modest fiber source.',
    prep: {
      heading: 'Brown rice vs white rice',
      paragraphs: [
        'The third row of the table shows plain white rice for comparison. Switching your usual cup of rice from white to brown adds a few grams of fiber, which helps, but it is not a large jump on its own.',
        'If rice is a daily staple, the bigger lever is what goes on it: half a cup of beans, a cup of vegetables, or a mix of rice with barley or lentils.',
      ],
    },
    tips: 'Try a half-and-half mix of brown rice with lentils or barley, or serve rice with a bean dish instead of a meat-only one.',
    meal: '1 cup brown rice, 1/2 cup black beans, 1 cup broccoli',
    faqs: [
      {
        q: 'Is brown rice high in fiber?',
        a: 'It is moderate. A cup covers a little over 10% of the 28 g Daily Value. It is a better choice than white rice for fiber, but beans, barley, and bulgur supply more per cup.',
      },
      {
        q: 'Does wild rice have more fiber than brown rice?',
        a: 'Slightly. USDA lists cooked wild rice at about 1.8 g per 100 g versus 1.6 g for long-grain brown rice. Both are in the same range.',
      },
    ],
  },
  {
    slug: 'barley',
    name: 'barley',
    title: 'Barley',
    cat: 'grains',
    row: '170285',
    portions: [
      ['1 cup, cooked (pearled)', 157],
      ['1/2 cup, cooked (pearled)', 78.5],
    ],
    why: 'Barley is one of the few grains, along with oats, that is naturally rich in beta-glucan, a soluble fiber. The FDA allows a heart-health claim for foods with enough beta-glucan from barley or oats, as part of a diet low in saturated fat and cholesterol. Even pearled barley, which has had some bran polished off, is one of the higher-fiber grains per cooked cup.',
    prep: {
      heading: 'Pearled vs hulled barley',
      paragraphs: [
        'Pearled barley, the kind most grocery stores sell, has the outer hull and some bran removed so it cooks faster. Hulled barley keeps more of the bran and is higher in fiber, but takes longer to cook. The figures on this page are for pearled barley.',
        'Barley absorbs a lot of water as it cooks, so use the cooked weight or cup when logging from the pot.',
      ],
    },
    tips: 'Use barley in soups, as a chewy base for salads, or cooked half-and-half with rice. It reheats well, so it is a good batch-cook grain.',
    meal: '1 cup barley, 1 cup carrots, 1/2 cup chickpeas',
    faqs: [
      {
        q: 'Barley vs oatmeal for fiber?',
        a: 'Cooked pearled barley is {{barley}}. A cup of cooked oatmeal is about 4 g on the [oatmeal](/oatmeal) guide. Both supply beta-glucan.',
      },
      {
        q: 'Does barley contain gluten?',
        a: 'Yes. Barley contains gluten and is not suitable for people with celiac disease.',
      },
    ],
  },
  {
    slug: 'whole-wheat-bread',
    calcIds: ['172689'],
    name: 'whole wheat bread',
    title: 'Whole Wheat Bread',
    cat: 'grains',
    row: '172688',
    portions: [
      ['1 slice', 32],
      ['2 slices', 64],
      ['1 slice white bread', 28, 'curated:white-bread'],
    ],
    why: 'Whole wheat bread is an easy daily swap because most people already eat bread. USDA’s generic whole wheat entry gives a couple of grams per slice, about twice white bread. Many packaged breads now go further with added seeds or fiber, and their labels can read 3–5 g per slice.',
    prep: {
      heading: 'Reading bread labels',
      paragraphs: [
        'Look for “100% whole wheat” or “whole grain” as the first ingredient. “Wheat bread” or “multigrain” alone does not mean whole grain, and those breads can be close to white bread in fiber.',
        'Slice weight varies widely, from under 30 g for sandwich bread to 45 g or more for dense seeded loaves. Compare grams of fiber per slice on the label rather than assuming every slice is equal.',
      ],
    },
    tips: 'Two slices of whole wheat toast with peanut butter and a sliced banana make a breakfast in the 8–9 g range. A sandwich on whole-grain bread with hummus and vegetables can pass 10 g.',
    meal: '2 slices whole wheat bread, 2 tbsp peanut butter, 1 banana',
    faqs: [
      {
        q: 'Which bread has the most fiber?',
        a: 'Breads with whole grains plus added seeds, bran, or fiber ingredients. Some popular seeded whole-grain loaves list about 5 g per slice. The calculator includes several packaged breads by name, or you can enter the label’s grams.',
      },
      {
        q: 'Is toasting bread a way to lose fiber?',
        a: 'No. Toasting drives off water, so a toasted slice weighs less but keeps essentially the same fiber.',
      },
    ],
  },
  {
    slug: 'popcorn',
    name: 'popcorn',
    title: 'Popcorn',
    cat: 'grains',
    row: '170246',
    portions: [
      ['3 cups, air-popped', 24],
      ['1 cup, air-popped', 8],
      ['1 oz, air-popped', 28.35],
    ],
    why: 'Popcorn is a whole grain, and because air-popped popcorn is mostly air, a big bowl is low in calories for the fiber it provides. Three cups is a common snack portion and lands in the same range as a slice or two of whole wheat bread.',
    prep: {
      heading: 'Air-popped vs microwave vs movie popcorn',
      paragraphs: [
        'The figures here are for plain air-popped popcorn. Oil and butter add calories but not fiber, so microwave and theater popcorn have similar fiber per cup with far more calories.',
        'Popcorn volume is hard to measure consistently. If you have a kitchen scale, weigh it: about 8 g per cup is USDA’s reference.',
      ],
    },
    tips: 'Pop a quarter cup of kernels (which makes several cups popped) and season with a little salt, chili, or nutritional yeast. Pair with a piece of fruit for a 6–8 g snack.',
    meal: '3 cups popcorn, 1 apple',
    faqs: [
      {
        q: 'Is popcorn a whole grain?',
        a: 'Yes. Popcorn is a whole-grain corn kernel. The Whole Grains Council and U.S. Dietary Guidelines both count it as a whole grain.',
      },
      {
        q: 'Is popcorn high in fiber per calorie?',
        a: 'Plain air-popped popcorn is one of the higher-fiber snacks per calorie, about 4 g per 100 kcal. Oil and butter lower that ratio quickly.',
      },
    ],
  },
  {
    slug: 'whole-wheat-pasta',
    name: 'whole wheat pasta',
    title: 'Whole Wheat Pasta',
    cat: 'grains',
    row: '168910',
    portions: [
      ['1 cup spaghetti, cooked', 140],
      ['2 oz dry (typical label serving)', 56.7, '169738'],
    ],
    why: 'Whole wheat pasta has roughly twice the fiber of regular pasta per cooked cup. Since pasta portions in real life are often two cups or more, the difference adds up quickly.',
    prep: {
      heading: 'Dry weight vs cooked cups',
      paragraphs: [
        'Pasta labels use a dry serving, typically 2 oz (56 g), which cooks to roughly one cup. The table shows both. Log one or the other, not both.',
        'Pasta made from lentils or chickpeas is a different product: labels often list more fiber than whole wheat pasta. Use the package label for those.',
      ],
    },
    tips: 'A cup of whole wheat pasta with a cup of broccoli and white beans in the sauce is a 12 g-plus dinner. If whole wheat pasta tastes too heavy, a half-and-half mix with regular pasta is a reasonable start.',
    meal: '1 cup whole wheat pasta, 1 cup broccoli, 1/2 cup navy beans',
    faqs: [
      {
        q: 'How much fiber is in regular pasta?',
        a: 'Regular enriched spaghetti is about 2.5 g per cooked cup on this site, roughly half of whole wheat.',
      },
      {
        q: 'Is chickpea or lentil pasta higher in fiber?',
        a: 'Often, yes. Many legume pastas list more fiber per serving than whole wheat pasta. Labels vary, so compare grams per 2 oz dry.',
      },
    ],
  },
  {
    slug: 'bulgur',
    name: 'bulgur',
    title: 'Bulgur',
    cat: 'grains',
    row: '170287',
    portions: [
      ['1 cup, cooked', 182],
      ['1/2 cup, cooked', 91],
      ['1/4 cup, dry', 35, '170688'],
    ],
    why: 'Bulgur is whole wheat that has been parboiled, dried, and cracked. It is the grain in tabbouleh and kibbeh, and it has more fiber per cooked cup than brown rice, quinoa, or pearled barley, while cooking in 10–15 minutes.',
    prep: {
      heading: 'Fine vs coarse bulgur',
      paragraphs: [
        'Fine bulgur only needs soaking in hot water, which is how tabbouleh is traditionally made. Coarse bulgur is simmered like rice for pilafs. Both are whole wheat, and USDA does not separate them for fiber.',
        'Tabbouleh is usually more parsley than bulgur, so a cup of tabbouleh has much less bulgur than a cup of plain cooked bulgur.',
      ],
    },
    tips: 'Use bulgur anywhere you would use rice or couscous. It is a good match for lentils, chickpeas, and roasted vegetables.',
    meal: '1 cup bulgur, 1/2 cup chickpeas, 1 cup spinach',
    faqs: [
      {
        q: 'Bulgur vs couscous: which has more fiber?',
        a: 'Bulgur, by a lot. Regular couscous is made from refined semolina and has far less fiber per cooked cup. Whole wheat couscous is closer to bulgur.',
      },
      {
        q: 'Is bulgur gluten-free?',
        a: 'No. Bulgur is wheat and contains gluten.',
      },
    ],
  },
  {
    slug: 'wheat-bran',
    name: 'wheat bran',
    title: 'Wheat Bran',
    cat: 'grains',
    row: '169722',
    portions: [
      ['2 tbsp', 7.25],
      ['1 tbsp', 3.6],
      ['1/4 cup', 14.5],
    ],
    why: 'Wheat bran is the outer layer of the wheat kernel, sold on its own as unprocessed bran or used in bran cereals and muffins. By weight it is one of the most concentrated food sources of fiber, and that fiber is mostly the insoluble kind that adds bulk to stool.',
    prep: {
      heading: 'How to use bran without overdoing it',
      paragraphs: [
        'Because bran is so concentrated, a small spoonful goes a long way. Start with a tablespoon stirred into oatmeal, yogurt, or batter and increase over a couple of weeks, with plenty of fluids.',
        'Some people with irritable bowel syndrome find that insoluble fiber such as wheat bran makes bloating or pain worse. Clinical guidelines for IBS favor soluble fiber instead; see the [IBS page](/fiber-for-ibs).',
      ],
    },
    tips: 'A tablespoon or two in a muffin batter or a bowl of cereal is enough for most people. Bran cereals are another route; the calculator includes several by name.',
    meal: '2 tbsp wheat bran, 1 cup oatmeal, 1/2 cup blueberries',
    faqs: [
      {
        q: 'Is wheat bran soluble or insoluble fiber?',
        a: 'Mostly insoluble. It adds bulk and speeds transit for many people, which is why it is a traditional remedy for constipation.',
      },
      {
        q: 'Is wheat bran the same as oat bran?',
        a: 'No. Oat bran is richer in soluble beta-glucan and has a softer texture. Wheat bran is coarser and mostly insoluble.',
      },
    ],
  },
]
