# Fibermaxxing Tool — 产品方案（哥飞模式 · 场景一）

> 决策依据：Gemini K-ROI 场景一优先；精确域名 `fibermaxxingcalculator.com` 已被抢注（2026-10-19），采用**品牌变体域名 + 体验碾压 + pSEO 长尾包抄**。

---

## 1. 一句话定位

**免注册、自然语言输入、秒出纤维达标与 GLP-1 激活评分的每日 Fibermaxxing 计算器**——用体验与长尾 SEO 截获健康微趋势流量，靠 Affiliate + Ads 变现。

---

## 2. 竞争判断

| 维度 | 对手 fibermaxxingcalculator.com | 我们 |
|------|--------------------------------|------|
| 域名 | EMD 精确词 | 品牌/功能变体（非死磕 EMD） |
| 体验 | 256 食物下拉查表 | NL 一句话输入 → 秒解析 |
| 结果 | 静态数字 | 进度环 + 激素评分 + 可分享战报图 |
| 权重 | 新站 0 DR、沙盒期 | 同起跑线，靠停留/分享信号反超 |
| 结构 | 单页粗糙 | 主工具 + pSEO 长尾矩阵 |

**K-ROI（含对手质量系数 ~0.2）仍约 400+，值得下场。**

---

## 3. 域名策略（预算 ≤ $10）

优先顺序（避开已被占的 EMD）：

1. `fibermaxxing.app` / `fibermaxxing.co`
2. `getfibermaxxing.com` / `dailyfibermaxxing.com`
3. `fibermaxxingtool.com` / `fibermax.tools`

品牌名对外统一：**Fibermax**（短、可念、可做成 Logo）。

---

## 4. MVP 范围（本仓库已实现）

### 必须有（P0）

1. **画像输入**：性别 / 年龄段 → 目标纤维（男 38g / 女 25g，可调「Fibermaxxing 模式」到 40–50g）
2. **自然语言饮食输入**：粘贴 `I ate 2 eggs, oatmeal, an apple` → 解析食物与纤维总量（客户端食物库，零 API 成本）
3. **结果面板**：达标进度环、缺口克数、GLP-1 / Gut Score、命中食物列表
4. **社交战报**：一键复制分享文案 + 生成可截图的战报卡（TikTok / X / IG）
5. **变现坐**：结果下方 Affiliate 推荐位（Psyllium / Chia / Inulin 占位）+ Ads 位预留

### 明确不做（MVP 外）

- 账号体系 / 历史同步
- 真实 LLM API（Phase 2 可插）
- 完整 USDA 全库（MVP 用精选高纤维库 + 模糊匹配）
- 付费 PDF 深度报告（Phase 2 微订阅）

---

## 5. 体验差异化（相对对手的降维打击）

```
对手：选食物 × N 次 → 加总
我们：一句话 → 解析 → 进度可视化 → 分享战报 → 补充剂 CTA
```

| 信号 | 对 Google / 增长的意义 |
|------|------------------------|
| 更低跳出、更长停留 | 交互工具 > 纯文 / 粗糙查表 |
| 社交分享回流 | Direct + 外链信号 |
| No signup / Instant | 创作者与生物黑客圈偏好 |

---

## 6. pSEO 关键词矩阵（侧翼包抄）

主站吃「体验词」；程序化页面吃长尾。模板：

| 类型 | 示例 URL / Title |
|------|------------------|
| 人群 | `/for-women` · Fibermaxxing Calculator for Women |
| 人群 | `/for-men` · Fibermaxxing Calculator for Men |
| 食物 | `/oatmeal` · Oatmeal Fibermaxxing Calculator |
| 对比 | `/chia-vs-psyllium` · Chia Seeds vs Psyllium Husk |
| 榜单 | `/high-fiber-foods` · High Fiber Foods Ranked |
| 场景 | `/glp1-fiber` · Fibermaxxing for GLP-1 Support |

**第一批 20 页（Week 1）→ 扩到 100+（Month 1）**，每页复用同一计算器组件 + 定制默认食物 / copy。

---

## 7. 变现路径

```
免费计算 → 结果报告
  ├─ Amazon Affiliate：高纤维补充剂 Top 3（客单高）
  ├─ AdSense / 展示位（结果区下方，勿挡首屏工具）
  └─ Phase 2：付费 PDF「7-Day Fibermaxxing Plan」微订阅 $4.99
```

Affiliate 埋点原则：只在**用户看到缺口之后**出现，文案绑定缺口（“还差 12g？一勺车前子壳 ≈ 5–7g”）。

---

## 8. 技术架构（哥飞极简）

| 层 | MVP | 后续 |
|----|-----|------|
| 前端 | Vite + React（本仓库） | 可迁 Next.js 做 pSEO SSR |
| 解析 | 本地食物库 + 规则 NLP | 可选 Claude/GPT 兜底 |
| 部署 | Vercel / Cloudflare Pages | 同 |
| 成本 | ≈ $0（无 API） | NL 增强时控 Token |

---

## 9. 未来 48 小时行动清单

- [x] 注册变体域名：`getfibermaxxing.com`（Cloudflare）
- [x] 部署到 Cloudflare Pages，绑 `www` + 裸域
- [ ] Google Search Console：提交 sitemap + 首页 URL（`https://www.getfibermaxxing.com/sitemap.xml`）
- [ ] X / Reddit `#fibermaxxing` `#biohacking` 发工具链接拿首批行为数据
- [ ] 挂 Amazon Associates 链接替换占位 CTA
- [ ] 起草 20 条 pSEO 长尾页大纲（Week 1 批量上）

---

## 10. 成功指标（前 30 天）

| 指标 | 目标 |
|------|------|
| 索引页数 | ≥ 20（含长尾） |
| 自然点击 | 有波动即可（验证收录） |
| 单次会话计算完成率 | ≥ 40% |
| 分享按钮点击率 | ≥ 8% |
| Affiliate 点击率（有结果用户） | ≥ 5% |

---

## 11. 风险与对策

| 风险 | 对策 |
|------|------|
| 微趋势退潮 | 扩展 Hormone / Cortisol / Gut Score 计算器共用域名 |
| 对手补体验 | 持续加分享战报、对比页、人群页；保持 No-signup |
| 医疗合规 | 页脚免责声明：非医疗建议；数据来源标注 USDA 近似 |

---

*本方案对应仓库 MVP：打开 `npm run dev` 即可体验自然语言计算器与社交战报原型。*
