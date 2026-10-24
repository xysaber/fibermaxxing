# Fibermax — Fibermaxxing Calculator MVP

哥飞模式 · 场景一：垂直健康计算器。避开已被抢注的 `fibermaxxingcalculator.com`，用 **NL 输入 + 进度可视化 + 社交战报 + Affiliate** 做体验碾压。

## Quick start

```bash
npm install
npm run dev
```

Open the local URL Vite prints (usually `http://localhost:5173`).

## What’s in the MVP

- Natural-language meal input (`I ate 2 eggs, oatmeal, an apple`)
- Client-side food parser (zero API cost)
- Fiber goal (RDA vs Fibermaxxing mode) + progress ring
- Gut Score / GLP-1 proxy
- Copy-to-clipboard social report + share card
- Affiliate CTA slots after a fiber gap is shown

Full product plan: [PRODUCT.md](./PRODUCT.md)

## Deploy

```bash
npm run build
```

Deploy `dist/` to Vercel / Cloudflare Pages, then bind a variant domain (`fibermaxxing.app`, etc.).
