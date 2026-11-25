/**
 * Where each rule in the plan comes from. Shown in the plan and on the sales page.
 * Links checked 2026-11-25 (search results / already cited on the site's guides).
 */
export const PLAN_SOURCES: { topic: string; items: { label: string; url: string }[] }[] = [
  {
    topic: 'Daily target (about 14 g per 1,000 kcal; 25 g women, 38 g men aged 19–50)',
    items: [
      { label: 'National Academies, Dietary Reference Intakes for Energy, Carbohydrate, Fiber (2005)', url: 'https://nap.nationalacademies.org/catalog/10490/dietary-reference-intakes-for-energy-carbohydrate-fiber-fat-fatty-acids-cholesterol-protein-and-amino-acids' },
      { label: 'Dietary Guidelines for Americans, 2020–2025 (USDA/HHS)', url: 'https://www.dietaryguidelines.gov/sites/default/files/2020-12/Dietary_Guidelines_for_Americans_2020-2025.pdf' },
    ],
  },
  {
    topic: 'Add fiber gradually over a few weeks and drink water with it (the +5 g / +3 g weekly steps are our editorial choice within this advice)',
    items: [
      { label: 'Mayo Clinic, Dietary fiber: Essential for a healthy diet', url: 'https://www.mayoclinic.org/healthy-lifestyle/nutrition-and-healthy-eating/in-depth/fiber/art-20043983' },
      { label: 'NIDDK, Eating, Diet, & Nutrition for Constipation', url: 'https://www.niddk.nih.gov/health-information/digestive-diseases/constipation/eating-diet-nutrition' },
    ],
  },
  {
    topic: 'GLP-1 version: smaller meals, fiber and fluids for constipation, protein with meals',
    items: [
      { label: 'Nutritional priorities to support GLP-1 therapy for obesity: joint Advisory from ACLM, ASN, OMA and The Obesity Society (2025)', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC12304835/' },
      { label: 'MedlinePlus (NIH), Semaglutide Injection: side effects', url: 'https://medlineplus.gov/druginfo/meds/a618008.html' },
    ],
  },
  {
    topic: 'Gentle-gut version: soluble fiber first, small legume portions, kiwifruit',
    items: [
      { label: 'Lacy BE, et al. ACG Clinical Guideline: Management of Irritable Bowel Syndrome. Am J Gastroenterol. 2021', url: 'https://pubmed.ncbi.nlm.nih.gov/33315591/' },
      { label: 'NIDDK, Eating, Diet, & Nutrition for Irritable Bowel Syndrome', url: 'https://www.niddk.nih.gov/health-information/digestive-diseases/irritable-bowel-syndrome/eating-diet-nutrition' },
      { label: 'Monash University, About FODMAPs and IBS', url: 'https://www.monashfodmap.com/about-fodmap-and-ibs/' },
      { label: 'Monash University, Research update: kiwifruit, psyllium and prunes for constipation (Chey et al., 2021)', url: 'https://monashfodmap.com/blog/research-update-kiwifruit-psyllium-and-prunes-which-one-better-constipation' },
    ],
  },
  {
    topic: 'Gram counts for every food',
    items: [{ label: 'USDA FoodData Central (SR Legacy)', url: 'https://fdc.nal.usda.gov/' }],
  },
]
