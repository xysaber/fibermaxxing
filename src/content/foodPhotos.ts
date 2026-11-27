/**
 * Unsplash food photos for guide heroes, the home food list and the fiber-in-foods hub.
 * Hotlinked from images.unsplash.com as the Unsplash API guidelines require; credit the
 * photographer wherever a photo shows. Keys are food page slugs without `fiber-in-`.
 * Picked 2026-11-27 (full manifest: unsplash-food-photos.json in project files).
 * Row: [image path, ixid, photographer, Unsplash username, photo id, alt].
 */
export type FoodPhoto = { src: string; author: string; authorUrl: string; photoUrl: string; alt: string }

type Row = [string, string, string, string, string, string]

const ROWS: Record<string, Row> = {
  "almonds": ["photo-1583126379180-ec70bb3178b1", "M3wxMTQ2MjA2fDB8MXxzZWFyY2h8NXx8YWxtb25kc3xlbnwxfDB8fHwxNzk1NzUxODg1fDA", "Avinash Kumar", "ashishjha", "JaoHjL6t0RM", "Almonds"],
  "apple": ["photo-1439127989242-c3749a012eac", "M3wxMTQ2MjA2fDB8MXxzZWFyY2h8M3x8cmVkJTIwYXBwbGV8ZW58MXwwfHx8MTc5NTc1MTg4NXww", "Roksolana Zasiadko", "cieloadentro", "CR28Ot0ckaE", "Apple"],
  "artichoke": ["photo-1621740490874-0cac441aa6a4", "M3wxMTQ2MjA2fDB8MXxzZWFyY2h8Mnx8YXJ0aWNob2tlfGVufDF8MHx8fDE3OTU3NTE4ODV8MA", "mana5280", "mana5280", "HwghYewdEaQ", "Artichoke"],
  "avocado": ["photo-1704960961383-67dd63756199", "M3wxMTQ2MjA2fDB8MXxzZWFyY2h8NXx8YXZvY2FkbyUyMGhhbHZlc3xlbnwxfDB8fHwxNzk1NzUxODg1fDA", "John Vid", "vanvid", "xPpq_ylNNMs", "Avocado"],
  "banana": ["photo-1640958900081-7b069dd23e9c", "M3wxMTQ2MjA2fDB8MXxzZWFyY2h8MXx8YmFuYW5hc3xlbnwxfDB8fHwxNzk1NzUxODg1fDA", "Gabriel Mihalcea", "lovelyscape", "1jyRHJPkpz8", "Banana"],
  "barley": ["photo-1574323347407-f5e1ad6d020b", "M3wxMTQ2MjA2fDB8MXxzZWFyY2h8MXx8YmFybGV5JTIwZ3JhaW58ZW58MXwwfHx8MTc5NTc1MTg4NXww", "Avinash Kumar", "ashishjha", "OvUAL6Vx3uY", "Barley"],
  "black-beans": ["photo-1647545401750-6dd5539879ac", "M3wxMTQ2MjA2fDB8MXxzZWFyY2h8Mnx8YmxhY2slMjBiZWFuc3xlbnwxfDB8fHwxNzk1NzUxODg1fDA", "Mikey Frost", "frostyfilmsandphoto", "Rq9eUgGy_eA", "Black beans"],
  "blackberries": ["photo-1724190775198-401c4763abd8", "M3wxMTQ2MjA2fDB8MXxzZWFyY2h8N3x8YmxhY2tiZXJyaWVzfGVufDF8MHx8fDE3OTU3NTE4ODV8MA", "Nadine Eggenberger", "selvavaleska", "yB234eXMdfg", "Blackberries"],
  "blueberries": ["photo-1425934398893-310a009a77f9", "M3wxMTQ2MjA2fDB8MXxzZWFyY2h8NXx8Ymx1ZWJlcnJpZXN8ZW58MXwwfHx8MTc5NTc1MTg4NXww", "Jeremy Ricketts", "jeremydgreat", "h4zs8fbybq4", "Blueberries"],
  "broccoli": ["photo-1614336215203-05a588f74627", "M3wxMTQ2MjA2fDB8MXxzZWFyY2h8MXx8YnJvY2NvbGl8ZW58MXwwfHx8MTc5NTc1MTg4NXww", "Tyrrell Fitness And Nutrition", "tyrrell_fitness_and_nutrition", "jSQxj-Ug0H8", "Broccoli"],
  "brown-rice": ["photo-1561767782-d8e3aa77ef77", "M3wxMTQ2MjA2fDB8MXxzZWFyY2h8NHx8YnJvd24lMjByaWNlfGVufDF8MHx8fDE3OTU3NTIwOTN8MA", "Utsman Media", "utsmanmedia", "tyVcPQfncrg", "Brown rice"],
  "brussels-sprouts": ["photo-1438118907704-7718ee9a191a", "M3wxMTQ2MjA2fDB8MXxzZWFyY2h8NHx8YnJ1c3NlbHMlMjBzcHJvdXRzfGVufDF8MHx8fDE3OTU3NTIwMTF8MA", "Keenan Loo", "keenanloo", "dqlxphCcA2g", "Brussels sprouts"],
  "bulgur": ["photo-1776669236271-5cfe72d74755", "M3wxMTQ2MjA2fDB8MXxzZWFyY2h8MXx8YnVsZ3VyfGVufDF8MHx8fDE3OTU3NTIwMTF8MA", "Mustafa akın", "msaimakin", "pTrQDKQzJ7U", "Bulgur"],
  "butternut-squash": ["photo-1533924049770-7c32435557c5", "M3wxMTQ2MjA2fDB8MXxzZWFyY2h8Mnx8YnV0dGVybnV0JTIwc3F1YXNofGVufDF8MHx8fDE3OTU3NTIwMTJ8MA", "Nick Collins", "webdesignnewcastle", "RB88SaWi0qc", "Butternut squash"],
  "carrots": ["photo-1633380110125-f6e685676160", "M3wxMTQ2MjA2fDB8MXxzZWFyY2h8MXx8Y2Fycm90c3xlbnwxfDB8fHwxNzk1NzUyMDEyfDA", "Nick Fewings", "jannerboy62", "IZq1FV87qpM", "Carrots"],
  "chickpeas": ["photo-1644432757699-bb5a01e8fb0e", "M3wxMTQ2MjA2fDB8MXxzZWFyY2h8MXx8Y2hpY2twZWFzfGVufDF8MHx8fDE3OTU3NTIwMTJ8MA", "Karyna Panchenko", "karyna_panchenko", "5352eOUYay4", "Chickpeas"],
  "dark-chocolate": ["photo-1542843137-8791a6904d14", "M3wxMTQ2MjA2fDB8MXxzZWFyY2h8Nnx8ZGFyayUyMGNob2NvbGF0ZXxlbnwxfDB8fHwxNzk1NzUyMDEzfDA", "amirali mirhashemian", "amir_v_ali", "RCVIlSXhYI0", "Dark chocolate"],
  "dates": ["photo-1771231591559-d19c89ad118a", "M3wxMTQ2MjA2fDB8MXxzZWFyY2h8Mnx8bWVkam9vbCUyMGRhdGVzfGVufDF8MHx8fDE3OTU3NTIwMTN8MA", "Mustafa akın", "msaimakin", "gQ97CNgy-m0", "Medjool dates"],
  "dried-figs": ["photo-1524593313283-1e092f06b2f0", "M3wxMTQ2MjA2fDB8MXxzZWFyY2h8MXx8ZHJpZWQlMjBmaWdzfGVufDF8MHx8fDE3OTU3NTIwMTN8MA", "Tom Hermans", "tomhermans", "E1AAFoR0C80", "Dried figs"],
  "edamame": ["photo-1557621956-ce58555aa0ce", "M3wxMTQ2MjA2fDB8MXxzZWFyY2h8MXx8ZWRhbWFtZXxlbnwxfDB8fHwxNzk1NzUyMDE0fDA", "Daniel Brubaker", "dpmb87", "ukkQ2PYm0ew", "Edamame"],
  "flaxseed": ["photo-1642497393790-c5751b818e1b", "M3wxMTQ2MjA2fDB8MXxzZWFyY2h8Mnx8ZmxheHNlZWR8ZW58MXwwfHx8MTc5NTc1MjAxNHww", "Karyna Panchenko", "karyna_panchenko", "sJcZCXb1K_Q", "Flaxseed"],
  "green-beans": ["photo-1574963835594-61eede2070dc", "M3wxMTQ2MjA2fDB8MXxzZWFyY2h8MXx8Z3JlZW4lMjBiZWFuc3xlbnwxfDB8fHwxNzk1NzUyMDE0fDA", "Bob Bowie", "connave", "2JDWDtCGREA", "Green beans"],
  "green-peas": ["photo-1632640110804-58827a6b37fd", "M3wxMTQ2MjA2fDB8MXxzZWFyY2h8M3x8Z3JlZW4lMjBwZWFzfGVufDF8MHx8fDE3OTU3NTIwMTR8MA", "Catia Climovich", "catiaclimovich", "H12H35b7yWo", "Green peas"],
  "guava": ["photo-1629367308496-a2496ba22f88", "M3wxMTQ2MjA2fDB8MXxzZWFyY2h8M3x8Z3VhdmElMjBmcnVpdHxlbnwxfDB8fHwxNzk1NzUyMDE1fDA", "VD Photography", "vdphotography", "oPiT4nceNdw", "Guava"],
  "hummus": ["photo-1637949385162-e416fb15b2ce", "M3wxMTQ2MjA2fDB8MXxzZWFyY2h8MXx8aHVtbXVzfGVufDF8MHx8fDE3OTU3NTIwMTV8MA", "Ludovic Avice", "loudmotion", "yr-sW_x9aHk", "Hummus"],
  "kale": ["photo-1522193582792-c66cf1cddd16", "M3wxMTQ2MjA2fDB8MXxzZWFyY2h8MXx8a2FsZXxlbnwxfDB8fHwxNzk1NzUyMDE1fDA", "Char Beck", "charbeck", "5eM6sRTCCUc", "Kale"],
  "kidney-beans": ["photo-1763368397625-32c8f75fed44", "M3wxMTQ2MjA2fDB8MXxzZWFyY2h8Mnx8cmVkJTIwa2lkbmV5JTIwYmVhbnN8ZW58MXwwfHx8MTc5NTc1MjAxNnww", "Zoshua Colah", "zoshuacolah", "QTGbQFlTvb8", "Kidney beans"],
  "kiwi": ["photo-1610917040803-1fccf9623064", "M3wxMTQ2MjA2fDB8MXxzZWFyY2h8NHx8a2l3aSUyMGZydWl0fGVufDF8MHx8fDE3OTU3NTIwMTZ8MA", "Dan Bucko", "danbuckophotography", "HkshRttZKCM", "Kiwi"],
  "lentils": ["photo-1708436478056-1872a208c010", "M3wxMTQ2MjA2fDB8MXxzZWFyY2h8NHx8bGVudGlsc3xlbnwxfDB8fHwxNzk1NzUyMDE2fDA", "Monika Borys", "fotoinshadows", "Zare4GwlsoU", "Lentils"],
  "mango": ["photo-1635716279493-d1e30afc25a0", "M3wxMTQ2MjA2fDB8MXxzZWFyY2h8MXx8bWFuZ298ZW58MXwwfHx8MTc5NTc1MjAxNnww", "Desirae Hayes-Vitor", "desirae_hayesvitor", "vxtBBfMTMZ0", "Mango"],
  "navy-beans": ["photo-1635843095815-7c85a923e734", "M3wxMTQ2MjA2fDB8MXxzZWFyY2h8OHx8d2hpdGUlMjBiZWFuc3xlbnwxfDB8fHwxNzk1NzUyMDE3fDA", "engin akyurt", "enginakyurt", "fLUwM3AtILk", "White navy beans"],
  "orange": ["photo-1591206369811-4eeb2f03bc95", "M3wxMTQ2MjA2fDB8MXxzZWFyY2h8Mnx8b3Jhbmdlc3xlbnwxfDB8fHwxNzk1NzUyMDE3fDA", "Sheraz Shaikh", "sheraz154", "Zx3kcU2Kw9E", "Orange"],
  "peanut-butter": ["flagged/photo-1625402535207-953e03369f59", "M3wxMTQ2MjA2fDB8MXxzZWFyY2h8MXx8cGVhbnV0JTIwYnV0dGVyfGVufDF8MHx8fDE3OTU3NTIwMTd8MA", "Towfiqu barbhuiya", "towfiqu999999", "q-RyWM8uYwY", "Peanut butter"],
  "pear": ["photo-1453487021979-5b739b2849f4", "M3wxMTQ2MjA2fDB8MXxzZWFyY2h8NHx8cGVhcnN8ZW58MXwwfHx8MTc5NTc1MjAxOHww", "Shumilov Ludmila", "lsfineartphotography", "j7X_hySaUa4", "Pear"],
  "pinto-beans": ["photo-1513868853742-e7fb786265db", "M3wxMTQ2MjA2fDB8MXxzZWFyY2h8MXx8cGludG8lMjBiZWFuc3xlbnwxfDB8fHwxNzk1NzUyMDE4fDA", "Monkgogi Samson", "m_samson", "C0ba0-z1ZoI", "Pinto beans"],
  "pistachios": ["photo-1610137512859-aa919f651a05", "M3wxMTQ2MjA2fDB8MXxzZWFyY2h8Nnx8cGlzdGFjaGlvc3xlbnwxfDB8fHwxNzk1NzUyMDE4fDA", "Theo Crazzolara", "theocrazzolara", "Zo0TZax87Cc", "Pistachios"],
  "popcorn": ["photo-1707063017149-a3cd268776c4", "M3wxMTQ2MjA2fDB8MXxzZWFyY2h8Mnx8cG9wY29ybiUyMGJvd2x8ZW58MXwwfHx8MTc5NTc1MjAxOXww", "Yasaman Abedini", "yas_abedini", "r8JrnhACEdg", "Popcorn"],
  "potato": ["photo-1518977676601-b53f82aba655", "M3wxMTQ2MjA2fDB8MXxzZWFyY2h8MXx8YmFrZWQlMjBwb3RhdG98ZW58MXwwfHx8MTc5NTc1MjAxOXww", "Lars Blankers", "lmablankers", "B0s3Xndk6tw", "Potato"],
  "prunes": ["photo-1679949499517-1ce03d17f20b", "M3wxMTQ2MjA2fDB8MXxzZWFyY2h8OHx8cHJ1bmVzfGVufDF8MHx8fDE3OTU3NTIwMTl8MA", "Florentina Tilvic", "photonaturero", "Ey5nIlYiPYg", "Prunes"],
  "pumpkin-seeds": ["photo-1508061110522-9ee0a799e290", "M3wxMTQ2MjA2fDB8MXxzZWFyY2h8MXx8cHVtcGtpbiUyMHNlZWRzfGVufDF8MHx8fDE3OTU3NTIwMTl8MA", "CHUTTERSNAP", "chuttersnap", "J8_U_vokuKk", "Pumpkin seeds"],
  "quinoa": ["photo-1586201375799-47cd24c3f595", "M3wxMTQ2MjA2fDB8MXxzZWFyY2h8MXx8cXVpbm9hfGVufDF8MHx8fDE3OTU3NTIwMjB8MA", "Pierre Bamin", "bamin", "oZ4Krez3X5o", "Quinoa"],
  "raspberries": ["photo-1563559776084-759c4c52567f", "M3wxMTQ2MjA2fDB8MXxzZWFyY2h8MXx8cmFzcGJlcnJpZXN8ZW58MXwwfHx8MTc5NTc1MjAyMHww", "Viktor Talashuk", "viktortalashuk", "BTTO404UHzA", "Raspberries"],
  "spinach": ["photo-1580910365203-91ea9115a319", "M3wxMTQ2MjA2fDB8MXxzZWFyY2h8Mnx8c3BpbmFjaCUyMGxlYXZlc3xlbnwxfDB8fHwxNzk1NzUyMDIwfDA", "Louis Hansel", "louishansel", "4VMqrwYfmDw", "Spinach"],
  "split-peas": ["photo-1584046748598-19108644d7ca", "M3wxMTQ2MjA2fDB8MXxzZWFyY2h8NHx8c3BsaXQlMjBwZWElMjBzb3VwfGVufDF8MHx8fDE3OTU3NTIwOTN8MA", "Mick Haupt", "rocinante_11", "3hi4Ckm-0v0", "Split pea soup"],
  "strawberries": ["photo-1594282241894-4da286138f44", "M3wxMTQ2MjA2fDB8MXxzZWFyY2h8MXx8c3RyYXdiZXJyaWVzfGVufDF8MHx8fDE3OTU3NTIwMjF8MA", "Natasha Skov", "natskov", "VyRmCBnDj5g", "Strawberries"],
  "sweet-potato": ["photo-1744659749700-c4213f840355", "M3wxMTQ2MjA2fDB8MXxzZWFyY2h8Mnx8c3dlZXQlMjBwb3RhdG98ZW58MXwwfHx8MTc5NTc1MjAyMXww", "Yen Vu - 烟雨", "yenvu2410", "eB2X4DnIk4c", "Sweet potato"],
  "walnuts": ["photo-1635843108103-9af0ea224a19", "M3wxMTQ2MjA2fDB8MXxzZWFyY2h8M3x8d2FsbnV0c3xlbnwxfDB8fHwxNzk1NzUyMDIyfDA", "engin akyurt", "enginakyurt", "tDKsvBRFFKc", "Walnuts"],
  "whole-wheat-bread": ["photo-1549931319-a545dcf3bc73", "M3wxMTQ2MjA2fDB8MXxzZWFyY2h8Mnx8d2hvbGUlMjB3aGVhdCUyMGJyZWFkfGVufDF8MHx8fDE3OTU3NTIwMjJ8MA", "Jude Infantini", "judowoodo_", "rYOqbTcGp1c", "Whole wheat bread"],
  "whole-wheat-pasta": ["photo-1598866594230-a7c12756260f", "M3wxMTQ2MjA2fDB8MXxzZWFyY2h8MXx8d2hvbGUlMjB3aGVhdCUyMHNwYWdoZXR0aXxlbnwxfDB8fHwxNzk1NzUyMDIzfDA", "Danijela Prijovic", "dacakockica", "qits91IZv1o", "Whole wheat pasta"],
  "chia-seeds": ["photo-1642497393633-a19e9231fb92", "M3wxMTQ2MjA2fDB8MXxzZWFyY2h8Mnx8Y2hpYSUyMHNlZWRzfGVufDF8MHx8fDE3OTU3NTIwMjN8MA", "Karyna Panchenko", "karyna_panchenko", "jXEsLogwsIA", "Chia seeds"],
  "oatmeal": ["photo-1638813133218-4367bd8123f6", "M3wxMTQ2MjA2fDB8MXxzZWFyY2h8Nnx8cG9ycmlkZ2UlMjBvYXRzfGVufDF8MHx8fDE3OTU3NTIwOTR8MA", "Christian Wiediger", "christianw", "r1VY6AeI7bY", "Bowl of oatmeal with fruit"],
  "fibermaxxing-smoothie": ["photo-1622597468620-656aa1f981ea", "M3wxMTQ2MjA2fDB8MXxzZWFyY2h8OHx8YmVycnklMjBzbW9vdGhpZXxlbnwxfDB8fHwxNzk1NzUyMDI0fDA", "Jugoslocos", "jugoslocos", "zpv8D8DOShs", "Berry smoothies"],
  "high-fiber-breakfast": ["photo-1497888329096-51c27beff665", "M3wxMTQ2MjA2fDB8MXxzZWFyY2h8Mnx8aGVhbHRoeSUyMGJyZWFrZmFzdCUyMGJvd2x8ZW58MXwwfHx8MTc5NTc1MjAyNHww", "Brooke Lark", "brookelark", "W9OKrxBqiZA", "Breakfast bowl with fruit"],
}

const UTM = 'utm_source=getfibermaxxing&utm_medium=referral'

function toPhoto([path, ixid, author, user, id, alt]: Row): FoodPhoto {
  return {
    src: `https://images.unsplash.com/${path}?ixid=${ixid}&ixlib=rb-4.1.0`,
    author,
    authorUrl: `https://unsplash.com/@${user}?${UTM}`,
    photoUrl: `https://unsplash.com/photos/${id}?${UTM}`,
    alt,
  }
}

/** Photo for a page or link slug: `/fiber-in-avocado`, `fiber-in-avocado` or `chia-seeds`. */
export function foodPhotoFor(slug: string): FoodPhoto | undefined {
  const row = ROWS[slug.replace(/^\//, '').replace(/^fiber-in-/, '')]
  return row ? toPhoto(row) : undefined
}
