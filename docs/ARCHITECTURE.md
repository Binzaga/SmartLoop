# Architecture

本文档解释 SmartLoop 的系统架构和**关键技术决策**。
代码本身只展示「现在是什么样」,这份文档展示「为什么是这个样」。

---

## 1. 高层架构

```
┌─────────────────────────────────────────────────────────────┐
│                被监控的 AI 产品                              │
│   CRM Claw │ AI 机器人 │ AI 翻译 │ 未来 Voice │ 其他       │
└──────────┬──────────────────────────────────────────────────┘
           │ HTTPS POST (X-SmartLoop-Key)
           │ via @smartloop/sdk
           ▼
┌─────────────────────────────────────────────────────────────┐
│              nginx :80 (TLS termination 待加)                │
│   /healthz, /readyz, /v1/*, /admin/*  → API                 │
│   其他所有路径(/, /_next/*, /products/*) → Web               │
└─────┬───────────────────────────────────────┬───────────────┘
      │                                       │
      ▼                                       ▼
┌────────────────────┐                  ┌──────────────────┐
│  API (Fastify)     │                  │  Web (Next.js 16) │
│  :8088             │                  │  :3001            │
│  ─────────────     │                  │  ──────────────   │
│  - SDK 上报        │                  │  - Server         │
│  - Admin 后台      │                  │    Components     │
│  - Dashboard 数据  │                  │  - SSR 拉取 API   │
│  - Judge worker    │                  │  - 渲染 dashboard │
└────────┬───────────┘                  └────────┬──────────┘
         │                                        │
         │ 内部 HTTP(localhost:8088)              │
         └────────────────────────────────────────┘
                          │
                          ▼
         ┌──────────────────────────────────┐
         │  Postgres 16(:5433)              │  ← Drizzle ORM
         │  Redis 7(:6380)(暂未深度用)     │
         └──────────────────────────────────┘
                          │
                          │ (judge worker 调用)
                          ▼
         ┌──────────────────────────────────┐
         │  DashScope(OpenAI 兼容模式)     │
         │  qwen3-max(judge)               │
         │  qwen3.5-plus(primary)          │
         └──────────────────────────────────┘
```

---

## 2. 组件职责

### apps/api(Fastify 后端)

| 模块 | 文件 | 职责 |
|---|---|---|
| 入口 | `src/server.ts` | 启动 Fastify、注册路由、启动 judge worker |
| 配置 | `src/config.ts` | 用 Zod 加载 + 校验 env 变量 |
| 数据库 | `src/db/{client,schema,migrate}.ts` | Drizzle 连接 + schema + 迁移 |
| API Key | `src/lib/api-key.ts` | SDK 用 key 的生成与 hash 存储 |
| LLM client | `src/lib/llm.ts` | DashScope 调用 + 强制 JSON 输出 |
| SDK 鉴权 | `src/middleware/auth.ts` | 校验 `X-SmartLoop-Key`,解析出 productId |
| 管理鉴权 | `src/middleware/admin-auth.ts` | 校验 `X-Admin-Token`,常数时间比对 |
| 健康检查 | `src/routes/health.ts` | `/`, `/healthz`, `/readyz` |
| 事件上报 | `src/routes/events.ts` | `/v1/events*` SDK 用 |
| 管理后台 | `src/routes/admin.ts` | `/admin/orgs`, `/admin/products` 等 |
| Judge 触发 | `src/routes/judge.ts` | `/admin/judge/run` 手动触发 |
| Dashboard 数据 | `src/routes/dashboard.ts` | `/admin/dashboard/overview` 聚合查询 |
| Judge 服务 | `src/services/judge.ts` | LLM-as-Judge 的 prompt + 结果校验 |
| Judge worker | `src/workers/judge-worker.ts` | 每 5s 拉取未评分事件批量评 |

### apps/web(Next.js Dashboard)

- 用 Server Components 直接调 API,**管理员 token 绝不送到浏览器**
- 当前只有一个首页;后续 `/products/[id]`, `/events/[id]` 等
- `lib/api.ts` 用 `fetch` + `next.revalidate=0` 强制每次刷新
- 组件三件套:`BrandMark`(品牌)、`HealthRing`(健康分)、`Sparkline`(趋势)

### packages/sdk-node(Node.js SDK)

- `SmartLoop` 类:`log()` 简单模式 + `startSession()` 会话模式
- 异步批量上报,5s 或 50 条 flush 一次
- 失败静默(通过 `onError` 回调暴露给宿主)
- 零外部依赖(只用全局 `fetch`)

---

## 3. 数据模型

10 张表,关键的:

| 表 | 用途 | 关键索引 |
|---|---|---|
| `orgs` | 多租户隔离 | id (PK) |
| `products` | 被监控的 AI 产品 | `api_key_hash`(查鉴权) |
| `events` | 核心:每条 AI 交互 | `(product_id, created_at)`、`(cluster_id)`、`(product_id, status, created_at)` |
| `feedback` | 用户反馈(👍/👎) | `(event_id)`、`(product_id, rating, created_at)` |
| `clusters` | 自动归类的 bad case | `(product_id, status)`、`(product_id, category)` |
| `prompt_versions` | Prompt 版本历史 | `(product_id, version)` |
| `golden_cases` | 回归测试黄金集 | `(product_id, enabled)` |
| `regression_runs` | 回归测试运行记录 | `(product_id, created_at)` |
| `alert_rules` | 告警规则 | `(product_id, enabled)` |
| `alerts` | 告警历史 | `(product_id, status, triggered_at)` |

### 为什么是 Postgres,不是 ClickHouse?

- **MVP 阶段**事件量低(估 < 100w),Postgres 完全 hold 得住
- ClickHouse 学习成本 + 运维成本不值
- 后期 event 量到亿级,**单独**把 `events` 迁到 ClickHouse,其他表留 Postgres
- 表结构 + index 设计已经考虑了未来迁移(避免依赖 PG 特有特性)

### 为什么不分表?

- `events` 是按 `created_at` 自然时序的,后期可以按月分表 / 用 `pg_partman`
- MVP 不分,简单

---

## 4. 关键技术决策

### 4.1 Fastify vs Hyperf vs Express?

- **选 Fastify**:
  - Schema-first(配 Zod 体验非常好)
  - 性能比 Express 高 2-3x
  - 跟 Drizzle / Bun 生态契合
- **没选 Hyperf**(SS 主栈):
  - SmartLoop 是新仓库,不想绑死 PHP 生态
  - 团队后续可能要做 AI 工程类工作,JS 生态更顺
- **没选 Express**:
  - 太老,不如 Fastify

### 4.2 Drizzle vs Prisma vs raw SQL?

- **选 Drizzle**:
  - 类型安全 100%,无 codegen 包袱(Prisma 要跑 codegen)
  - SQL-first 哲学(可读,可优化)
  - Migration 文件就是普通 SQL
- **没选 Prisma**:
  - 体积大,启动慢,运行时膨胀
- **没选 raw SQL**:
  - 失去类型安全,后期维护痛苦

### 4.3 DashScope OpenAI 兼容模式 vs SDK?

- **选兼容模式**:
  - 可以直接用 `openai` npm 包,生态成熟
  - 切换到 OpenAI / Anthropic 时只改 baseURL
- **没选 DashScope 原生 SDK**:
  - 文档/类型差,锁死阿里云生态

### 4.4 Judge 用 qwen3-max,主模型用 qwen3.5-plus?

- **不能 self-judge**:用同一个模型给同一个模型的输出打分,会有正向 bias
- qwen3-max > qwen3.5-plus(参数更大、能力更强)→ 当 judge 合适
- **未来**:校准集人工标注 50 条,定期跑 judge,对比相关系数,确保 judge 没漂

### 4.5 SDK 异步批量,不是同步阻塞?

- 主业务的 AI 调用本身就是用户 critical path
- SmartLoop 上报失败**绝不能**影响主业务返回
- 异步批量也省 HTTP 开销(5s 内 50 条事件一次发出去)
- 失败时静默(可选 onError 回调),不抛异常给宿主

### 4.6 Admin 鉴权用 token 不是 OAuth?

- MVP 不做用户系统,**全公司一个 token 共用**
- 后续接入 SaleSmartly 内部 SSO(后端复用现有 OAuth2 流程)
- Token 用 `crypto.timingSafeEqual` 常数时间比对,防 timing attack

### 4.7 Web 用 Next.js Server Components,不是纯 SPA?

- Server Components 直接调 API,**管理员 token 永不进浏览器** ← 关键
- SEO / 加载速度更好
- 数据从 API → 服务端渲染 → HTML,前端零状态

---

## 5. 评测流水线

每条事件上报后:

```
Event 入库(scores=null)
       │
       ▼
Judge worker 每 5s 拉一批 → SELECT FOR UPDATE SKIP LOCKED(防并发抢)
       │
       ▼
对每条 event 调 LLM-as-Judge(qwen3-max,JSON 强制输出)
  ├ 评 4 个维度: accuracy / helpfulness / safety / style
  ├ 给 overall 总分 0-5
  └ 打 tags: ['good' | 'hallucination' | 'too_short' | ...]
       │
       ▼
回写到 events.scores + events.judge_reasoning
```

未来扩展:
1. 幻觉检测层(正则抽 ID + 数据库回查)
2. Cluster 聚类(embedding + DBSCAN)
3. 根因推断(关联 prompt 版本变化)

---

## 6. 安全模型

| 边界 | 鉴权方式 |
|---|---|
| SDK → API | `X-SmartLoop-Key`(per-product,hash 存库,创建时返回一次) |
| 管理后台 / Dashboard 拉取 → API | `X-Admin-Token`(全局,Zod 强制 ≥16 字符) |
| Web Dashboard → 浏览器 | 仅 SSR 后的 HTML,无 token 暴露 |
| 数据库 | 仅本机 loopback(`127.0.0.1:5433`) |
| LLM 调用 | 服务端持有 DashScope key,不传任何客户标识 |

详见 [SECRETS.md](./SECRETS.md)。

---

## 7. 已知技术债

- ⚠️ MVP 阶段所有 `/admin/*` 共用一个 token,**没有用户级权限**
- ⚠️ Web 端只有首页,产品详情/事件详情/Golden case 管理还没做
- ⚠️ 没有 cluster 聚类逻辑(目前 cluster 表只是 schema,没自动产出)
- ⚠️ 没有告警 webhook 触发(alert_rules 表只是 schema)
- ⚠️ 没有 HTTPS(部署在 http://47.82.1.197 裸跑)
- ⚠️ 没有 CI/CD(暂时人肉部署)
- ⚠️ 4 个 secret 在 hackathon 期间通过 Telegram leak,**生产前必须全部轮换**

详见 [ROADMAP.md](./ROADMAP.md)。

---

## 8. 性能预算

| 指标 | 目标 | 现状 |
|---|---|---|
| 事件上报延迟(p99) | < 50ms | 实测 ~10-30ms |
| Judge 延迟(单条) | < 5s | 实测 ~2-4s |
| Judge 并发批量 | 10 条/批 | 配置可调 |
| Dashboard 首屏 | < 1s | 实测 ~500ms |
| Postgres 单表行数上限(MVP) | 1M | 当前 < 1000 |

---

## 9. 长期演进

详见 [ROADMAP.md](./ROADMAP.md),核心方向:

- **M1-3**:SS 内部全 AI 产品接入
- **M4-6**:SS Enterprise 套餐差异化功能(对外客户也能用)
- **M7-12**:独立品牌 / spin out,对标 LangSmith 中文跨境版
