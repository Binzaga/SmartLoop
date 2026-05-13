# SmartLoop

> SaleSmartly 内部 AI 产品的统一质量监控与迭代平台

让每一个 AI 产品（CRM Claw、AI 机器人、AI 翻译、未来的 Voice Bot…）共用一处「质检台」——
**SDK 一行接入 → 自动评分 → 差评归类 → 回归测试 → 实时告警**。

---

## TL;DR

```bash
# 1. 起 Postgres + Redis
docker compose up -d

# 2. 装依赖
bun install

# 3. 准备 API .env（参考 .env.example 自己填）
cp .env.example apps/api/.env
# 必填: DATABASE_URL, ADMIN_TOKEN, DASHSCOPE_API_KEY

# 4. 跑迁移
bun run db:migrate

# 5. 起后端
cd apps/api && bun run dev    # http://localhost:8088

# 6. 起 Dashboard
cd apps/web && bun run dev    # http://localhost:3001
```

打开 http://localhost:3001 看仪表盘。
看 [docs/DEVELOPMENT.md](./docs/DEVELOPMENT.md) 获取更详细的本地开发指南。

---

## 项目简介

**为什么做这个：**
SaleSmartly 在做的 AI 产品越来越多（CRM Claw、AI 机器人、AI 翻译、Quality Loop…），
每个产品都各自手工搞「差评收集 + 归类 + 告警 + 回归」基建。
SmartLoop 把这套机制**平台化**——一次接入,所有 AI 产品共用。

**核心能力：**

| 模块 | 做什么 |
|---|---|
| SDK | 各产品 3 行代码接入,异步上报 AI 交互事件(input、output、tokens、tool calls、用户反馈) |
| LLM-as-Judge | 每条事件自动调 Qwen3-Max 评分(4 维 + 标签),识别幻觉/越界/啰嗦等问题 |
| Cluster 归类 | 把 bad case 自动归到固定类别(幻觉/延迟/格式/多语言/越界),便于产品方排优先级 |
| Dashboard | 跨产品健康分总览、实时事件流、cluster 详情、prompt 历史 |
| Golden Case 回归 | 每个产品维护一组黄金测试集,prompt 改动一键跑回归 |
| 告警 | 异常 cluster 飙升、回归失败、特定指标越线 → 钉钉/飞书/企微 |

**为什么不用 LangSmith / Braintrust / Helicone：**
- 它们面向**开发者**做 trace,我们面向**产品 owner + 运营**做 bad case 管理
- 它们英文 first,我们中文跨境场景原生
- 我们集成钉钉/飞书/企微告警(他们只有 Slack)
- 价格按中国 ARPU 设计

---

## 仓库结构

```
smartloop/
├── apps/
│   ├── api/                 Fastify + Drizzle + Postgres 后端
│   │   ├── src/
│   │   │   ├── server.ts                主入口
│   │   │   ├── config.ts                env 加载 + Zod 校验
│   │   │   ├── db/
│   │   │   │   ├── schema.ts            10 张表的 Drizzle schema
│   │   │   │   ├── client.ts            数据库连接池
│   │   │   │   ├── migrate.ts           迁移 runner
│   │   │   │   └── migrations/          SQL 文件
│   │   │   ├── lib/
│   │   │   │   ├── api-key.ts           SDK 用 API key 生成 + hash
│   │   │   │   └── llm.ts               DashScope OpenAI 兼容 client
│   │   │   ├── middleware/
│   │   │   │   ├── auth.ts              SDK 上报鉴权(X-SmartLoop-Key)
│   │   │   │   └── admin-auth.ts        管理后台鉴权(X-Admin-Token)
│   │   │   ├── routes/
│   │   │   │   ├── health.ts            /healthz, /readyz
│   │   │   │   ├── events.ts            SDK 上报 + feedback
│   │   │   │   ├── admin.ts             org/product 管理 + key 轮换
│   │   │   │   ├── judge.ts             手动触发评分 worker
│   │   │   │   └── dashboard.ts         前端用的聚合查询
│   │   │   ├── services/
│   │   │   │   └── judge.ts             LLM-as-Judge prompt + 结果校验
│   │   │   └── workers/
│   │   │       └── judge-worker.ts      定时拉取未评分事件 → DashScope → 回写
│   │   ├── drizzle.config.ts            Drizzle Kit 配置
│   │   ├── .env                         本地配置(不提交)
│   │   └── package.json
│   │
│   └── web/                 Next.js 16 Dashboard
│       ├── app/
│       │   ├── layout.tsx               根布局 + fonts
│       │   ├── page.tsx                 首页(健康总览 + 事件流)
│       │   └── globals.css              Tailwind 4 + 设计 token
│       ├── components/
│       │   ├── BrandMark.tsx            渐变 logo
│       │   ├── HealthRing.tsx           圆形健康分环
│       │   └── Sparkline.tsx            内联 SVG 趋势线
│       ├── lib/
│       │   └── api.ts                   服务端 API client(带 admin token)
│       ├── .env.local                   本地配置(不提交)
│       └── package.json
│
├── packages/
│   └── sdk-node/            Node.js SDK
│       ├── src/index.ts                 SmartLoop 客户端
│       ├── test-sdk.ts                  冒烟测试脚本
│       └── package.json
│
├── docker-compose.yml       本地 Postgres 16 + Redis 7
├── .env.example             env 模板
├── package.json             bun workspaces 根
└── docs/
    ├── ARCHITECTURE.md      系统架构 + 设计决策
    ├── DEVELOPMENT.md       本地开发指南
    ├── DEPLOYMENT.md        生产部署 + nginx + systemd
    ├── API.md               HTTP API 完整参考
    ├── SDK.md               SDK 使用文档
    ├── SECRETS.md           密钥管理 + 轮换规程
    └── ROADMAP.md           已完成 + 待办 + 长期愿景
```

---

## 技术栈

| 层 | 技术 | 版本 |
|---|---|---|
| Runtime | Bun | ≥1.3 |
| 后端框架 | Fastify | 4.x |
| ORM | Drizzle | 0.33 |
| DB | Postgres | 16 |
| 缓存/队列 | Redis | 7 |
| LLM | Qwen3-Max + Qwen3.5-Plus | DashScope 兼容模式 |
| 前端 | Next.js + React + Tailwind | 16 + 19 + 4 |
| 部署 | nginx + Docker Compose / systemd | — |

---

## 关键文档

- **架构**: [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) — 系统架构、组件职责、关键决策
- **本地开发**: [docs/DEVELOPMENT.md](./docs/DEVELOPMENT.md) — 5 分钟跑起来
- **生产部署**: [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) — 当前部署状态 + 运维 runbook
- **API 参考**: [docs/API.md](./docs/API.md) — 所有 HTTP 端点 + 鉴权 + 响应
- **SDK 文档**: [docs/SDK.md](./docs/SDK.md) — Node.js 客户端使用
- **密钥管理**: [docs/SECRETS.md](./docs/SECRETS.md) — 哪些 secret、存哪里、怎么轮换
- **路线图**: [docs/ROADMAP.md](./docs/ROADMAP.md) — 已完成 + 待办 + 长期方向

---

## 当前部署

- **公网**: http://47.82.1.197 (阿里云 ECS)
- **Repo**: https://github.com/Binzaga/SmartLoop
- **API**: 反代到 127.0.0.1:8088
- **Web**: 反代到 127.0.0.1:3001
- **DB**: Docker Postgres 16 (localhost:5433)
- **Cache**: Docker Redis 7 (localhost:6380)

详见 [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)。

---

## 状态

🏗️ **Hackathon MVP** 阶段。还在写功能,API 形态可能微调。
预定 2026-06-08 路演,争取内部立项。

详见 [docs/ROADMAP.md](./docs/ROADMAP.md)。

---

## License

Internal SaleSmartly project. 不对外开源。
