# Fibermax — Fibermaxxing Calculator MVP

哥飞模式 · 场景一：垂直健康计算器。避开已被抢注的 `fibermaxxingcalculator.com`，用 **NL 输入 + 进度可视化 + 社交战报 + Affiliate** 做体验碾压。

## Quick start

```bash
npm install
npm run meal-log:dev   # terminal 1 — local I/O log API (JSONL under data/meal-logs/)
npm run dev            # terminal 2 — Vite (proxies /api → :8788)
```

Open the local URL Vite prints (usually `http://localhost:5173`).

With `VITE_MEAL_LOG_ENABLED=true` (set in `.env.development`), each Calculate posts **input text + structured result** to `/api/meal-logs`. Production builds leave this off until the flag is set at build time and R2 is bound in `wrangler.toml`. Smoke: `npm run test:meal-log`.

**操作手册（本地验收 / 上线准备 / 生产回测）：** [docs/meal-io-logging.md](./docs/meal-io-logging.md)

## What’s in the MVP

- Natural-language meal input (`I ate 2 eggs, oatmeal, an apple`)
- Client-side food parser over a USDA SR Legacy English index (~4k foods)
- Fiber goal (RDA vs Fibermaxxing mode) + progress ring
- Gut Score / GLP-1 proxy
- Copy-to-clipboard social report + share card
- Affiliate CTA slots after a fiber gap is shown

Full product plan: [PRODUCT.md](./PRODUCT.md)

## Food data (L1)

English food index is built from **USDA SR Legacy** (`src/data/usda-foods.json`) plus curated staples (psyllium, oatmeal, sourdough, …).

```bash
# downloads USDA CSV into scripts/tmp/ (gitignored), then regenerates usda-foods.json
npm run data:usda
```

Other languages will use a separate translation/alias map later. Unknown phrases fall back to category estimates in `src/lib/estimateFiber.ts`.

## Deploy

Live: [https://www.getfibermaxxing.com](https://www.getfibermaxxing.com)

```bash
npm run build
```

Cloudflare **Workers** (static assets) auto-deploys from `main` using `wrangler.toml`.
`assets.not_found_handling = "404-page"` so unknown paths return `404.html` with status 404
(not SPA `index.html` + 200).
