# 膳食输入/输出上报：本地测试、上线准备与回测

**GA4 看漏斗；R2 / 本地 JSONL 存餐食原文 + 结构化结果。** 二者分离，GA 不含 `input_text`。  
客户端对「同 client + 同原文/来源」在 **30s** 内去重，避免指南页 prefill 连点刷多条。

隐私页 / Footer 入口：功能已先打通；**合规文案排期 2026-10-27（产品看板 D2）** 上线 Privacy + Terms。

| 环境 | 客户端开关 | 存储 |
|------|------------|------|
| 本地 | `.env.development` → `VITE_MEAL_LOG_ENABLED=true` | `data/meal-logs/YYYY-MM-DD.jsonl` |
| 生产 | 构建变量同名（**最后一步再开**） | R2：`meal-logs/{接收日UTC}/{event_id}.json` |

---

## 0. 自测标记 `is_test`（必读）

| 操作 | 效果 |
|------|------|
| 打开带 `?utm_source=self` 的页面 | 写入 `localStorage.fibermax_is_test=1`，之后本浏览器日志 `is_test: true` |
| 或 `?meal_log_test=1` | 同上 |
| `?clear_meal_log_test=1` | 清除标记；之后未再带 self 的访问视为 `is_test: false`（**不能**保证一定是真人） |

`source=own|example` 只表示输入方式，**不是**测试身份。分析时请过滤 `is_test === true`。

生产自测入口示例：

```text
https://www.getfibermaxxing.com/?utm_source=self&utm_medium=meal_log_qa
```

---

## 1. 本地怎么测、怎么验收

### 1.1 冒烟（必做）

```bash
cd /Users/yy/.cursor/Fibermaxxing
npm run test:meal-log
```

期望：`meal-log smoke OK`。

### 1.2 浏览器端到端

```bash
# 终端 A
cd /Users/yy/.cursor/Fibermaxxing && npm run meal-log:dev

# 终端 B
cd /Users/yy/.cursor/Fibermaxxing && npm run dev
```

| # | 操作 | 期望 |
|---|------|------|
| A | `1 apple` → Calculate | `POST /api/meal-logs` → 204；JSONL 有原文与 matches，`source=own`，`is_test` 视标记 |
| B | 点 example | `source=example` |
| C | `asdfqwer123` | `matches: []`，有 `empty_kind` / `reliability` |
| D | Network 看 POST Payload；对照 gtag | POST 有原文；GA **无** `input_text` |
| E | 停 meal-log:dev 再算 | 页面仍可用 |
| F | `.env.development` 设 `VITE_MEAL_LOG_ENABLED=false`，重启 Vite | 无 POST |
| G | 打开 `http://localhost:5173/?utm_source=self` 再算 | 新行 `is_test: true`；`?clear_meal_log_test=1` 后可清 |

读日志：

```bash
ls /Users/yy/.cursor/Fibermaxxing/data/meal-logs/
tail -n 2 /Users/yy/.cursor/Fibermaxxing/data/meal-logs/*.jsonl
```

---

## 2. 上线顺序（重要：先 API 落盘，后开前端）

**错误顺序：** 先开 `VITE_MEAL_LOG_ENABLED` 再确认 R2。  
**正确顺序：**

1. 代码已含 Worker + 校验 + `is_test`（本仓库）  
2. **你：** 创建私有 R2、解开绑定、部署 Worker（前端开关仍关）  
3. **你/协助：** 对线上 API **手动 POST** 并 **下载对象** 证明落盘  
4. （另项）隐私说明上线  
5. **你：** 构建打开 `VITE_MEAL_LOG_ENABLED` 再部署前端  
6. 带 `utm_source=self` 做浏览器回测  

### 2.1 health 含义

```bash
curl -sS https://www.getfibermaxxing.com/api/meal-logs/health
```

示例：`{"ok":true,"r2_bound":true,"ingest_enabled":true,"note":"..."}`  

- `r2_bound`：是否配置了 `MEAL_LOGS` 绑定  
- **不能**证明写入成功；必须以 R2 对象为准  
- `ingest_enabled: false`：Worker 停收（`MEAL_LOG_INGEST=off`）

### 2.2 需要你手动操作的详细指南

#### A. Cloudflare / Wrangler 登录

```bash
cd /Users/yy/.cursor/Fibermaxxing
npx wrangler login
npx wrangler whoami
```

浏览器完成授权后，确认账号无误。

#### B. 创建 R2 bucket（私有，默认即可）

```bash
npx wrangler r2 bucket create fibermaxxing-meal-logs
```

在 Cloudflare Dashboard → R2 确认 bucket 存在、非公开读。

#### C. 解开 Wrangler 绑定

编辑 [`wrangler.toml`](../wrangler.toml)，**取消注释**：

```toml
[[r2_buckets]]
binding = "MEAL_LOGS"
bucket_name = "fibermaxxing-meal-logs"
```

保存。确认 `[vars] MEAL_LOG_INGEST = "on"`（急停时改为 `"off"` 后重新 deploy，无需改前端）。

#### D. 部署 Worker（前端上报仍关闭）

确认构建时**没有** `VITE_MEAL_LOG_ENABLED=true`（或显式 `false`），这样线上旧/新前端都不会自动狂打（新包不会发；若曾开过开关需靠 `MEAL_LOG_INGEST`）。

```bash
cd /Users/yy/.cursor/Fibermaxxing
npm run build
npx wrangler deploy
curl -sS https://www.getfibermaxxing.com/api/meal-logs/health
```

期望 `r2_bound: true` 且 `ingest_enabled: true`。

#### E. 手动 POST 验收落盘（前端仍关）

用任意 `event_id`（8–80 位字母数字 `_` `-`）：

```bash
EVENT_ID="manual-$(date +%s)-test01"
DAY=$(date -u +%Y-%m-%d)

curl -sS -D - -o /dev/null -X POST https://www.getfibermaxxing.com/api/meal-logs \
  -H 'Content-Type: application/json' \
  -d "{
    \"schema_version\": 1,
    \"event_id\": \"$EVENT_ID\",
    \"client_id\": \"manual-client-01\",
    \"ts\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",
    \"page_path\": \"/\",
    \"source\": \"own\",
    \"input_origin\": \"typed\",
    \"input_text\": \"manual own probe 1 apple\",
    \"reliability\": \"reliable\",
    \"empty_kind\": null,
    \"total_fiber_g\": 4.4,
    \"total_calories\": 95,
    \"unmatched_hints\": [],
    \"matches\": [{
      \"food_id\": \"curated:apple\",
      \"name\": \"Apple, raw\",
      \"grams\": 182,
      \"fiber_g\": 4.4,
      \"calories\": 95,
      \"source\": \"database\",
      \"tag\": \"database\",
      \"confidence\": \"high\"
    }],
    \"is_test\": true
  }"
```

期望响应头 **204**；可选响应头 `X-Meal-Log-Key: meal-logs/...`。

再测 example / 空匹配：改 `source`、`matches: []`、`reliability`/`empty_kind` 各 POST 一次。  
非法 body（缺字段）应 **400**；可把 Dashboard 里 `MEAL_LOG_INGEST` 临时设 `off` 后 deploy，期望 **503**，再改回 `on`。

#### F. 从 R2 读回对象（证明落盘）

优先用响应里的 key，或：

```text
meal-logs/<UTC日期>/<event_id>.json
```

下载（注意 **一个路径参数** + `--remote`）：

```bash
npx wrangler r2 object get \
  fibermaxxing-meal-logs/meal-logs/YYYY-MM-DD/EVENT_ID.json \
  --remote \
  --file /tmp/meal-log-sample.json

python3 -m json.tool /tmp/meal-log-sample.json
```

也可在 Dashboard → R2 → bucket → 浏览对象。  
**不要**依赖未确认的 `r2 object list` 作为必做步骤。

核对：`input_text`、`is_test`、`received_at`、`matches`。

#### G. 打开前端上报（仅在 F 成功后）

1. 在 Cloudflare 构建环境或本机 deploy 前设置：`VITE_MEAL_LOG_ENABLED=true`  
2. `npm run build && npx wrangler deploy`（或走你的 CI）  
3. 浏览器：

```text
https://www.getfibermaxxing.com/?utm_source=self&utm_medium=meal_log_qa
```

Calculate → Network 见 `POST /api/meal-logs` 204 → 用 Payload 里的 `event_id` 按 §F 拉 R2 → 确认 `is_test: true`。  
另开无痕**不带** utm 算一餐，确认 `is_test: false`（或未设置 self 标记）。

清除本机测试标记：

```text
https://www.getfibermaxxing.com/?clear_meal_log_test=1
```

#### H. 急停

- Dashboard / `wrangler.toml` `[vars]`：`MEAL_LOG_INGEST=off` → `npx wrangler deploy`  
- 旧缓存页仍会 POST，但服务端 503，不再写入  

### 2.3 我方可代劳 vs 需你操作

| 我可做 | 需你做 |
|--------|--------|
| 改代码/文档、本地冒烟、协助写 curl | `wrangler login`、建 bucket |
| 协助改 `wrangler.toml` 解注释 | 在 CF 确认 R2 私有 |
| 指导 deploy / 核对 JSON | 最终 deploy 与生产浏览器验收 |
| — | 构建变量打开前端开关的决策与操作 |
| 隐私文案（后续） | 确认可开采集的合规口径 |

### 2.4 上线 Checklist

- [x] 本地 §1 通过  
- [x] R2 已建且私有  
- [x] `MEAL_LOGS` 已绑定并 deploy  
- [x] 手动 POST + `r2 object get --remote` 看到对象  
- [x] 非法请求 400（停收 503 可选）  
- [ ] Privacy + Terms + Footer（**D2 · 2026-10-27**）  
- [x] 再开 `VITE_MEAL_LOG_ENABLED` 并 deploy  
- [x] `utm_source=self` 浏览器回测 `is_test: true`  
- [ ] 无痕无 UTM：用 **`X-Meal-Log-Key`** 复核 `is_test: false`（**D2**）  


---

## 3. 上线后回测（摘要）

1. self UTM 入口计算 → 204 → 用 `event_id` get 对象 → `is_test: true`  
2. 无痕无 UTM → `is_test: false`  
3. GA4 DebugView（需单独开调试模式；**仅 self UTM 不会打开 DebugView**）确认无原文  
4. 失败对照：无 POST→构建开关；503→绑定/停收；204 无对象→日期/key/`--remote`  

---

## 附录：字段

`schema_version`, `event_id`, `client_id`, `ts`（客户端）, `received_at`（服务端）, `page_path`, `source`（`own`|`example`）, `input_origin`（`typed`|`example`|`prefill`|`starter`）, `input_text`, `reliability`, `empty_kind`, totals, `unmatched_hints`, `matches[]`, **`is_test`**, 可选 `utm_source` / `app_version`。分析时把 `starter` / `example` / `prefill` / `is_test` 与真实 typed own 分开。
