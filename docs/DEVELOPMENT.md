# Development Guide

5 分钟跑起来,然后做你想做的事。

---

## 1. 前置条件

```bash
bun --version       # >= 1.3
docker --version    # >= 24
node --version      # >= 20 (Next.js 16 要求)
```

如果没装 Bun:
```bash
curl -fsSL https://bun.sh/install | bash
```

---

## 2. 克隆 + 装依赖

```bash
git clone https://github.com/Binzaga/SmartLoop.git
cd SmartLoop
bun install     # 装所有 workspace 的 deps
```

---

## 3. 起本地数据库

```bash
docker compose up -d
```

会启动:
- `smartloop-postgres`(localhost:**5433**,不是 5432,避免和本机已有 PG 冲突)
- `smartloop-redis`(localhost:**6380**)

```bash
docker ps | grep smartloop   # 应该看到两个 healthy 容器
```

---

## 4. 配置 API 环境变量

复制模板:
```bash
cp .env.example apps/api/.env
```

打开 `apps/api/.env` 至少填:

```dotenv
DATABASE_URL=postgres://smartloop:smartloop_dev_pass@localhost:5433/smartloop
REDIS_URL=redis://localhost:6380
API_PORT=8088
API_HOST=127.0.0.1
LOG_LEVEL=info
ADMIN_TOKEN=<生成一个 32 字符随机串>
DASHSCOPE_API_KEY=<向 leader 索取或自己申请>
JUDGE_MODEL=qwen3-max
PRIMARY_MODEL=qwen3.5-plus
```

生成 ADMIN_TOKEN:
```bash
openssl rand -base64 24 | tr -d '/+=' | head -c 32
```

DashScope key 申请:
1. 登录 https://dashscope.aliyuncs.com/
2. 创建 API Key,勾上「OpenAI 兼容模式」
3. 复制 `sk-xxxx`

---

## 5. 跑迁移

```bash
cd apps/api
bun run db:migrate
```

应该看到:
```
[migrate] applying migrations from src/db/migrations ...
[migrate] done.
```

如果你**修改了 schema.ts**,先 generate 再 migrate:
```bash
bun run db:generate     # 比对 schema 生成新的 SQL 迁移
bun run db:migrate      # 应用
```

---

## 6. 起 API

```bash
cd apps/api
bun run dev     # http://localhost:8088
```

健康检查:
```bash
curl http://localhost:8088/healthz
# → {"ok":true,"ts":"..."}
```

---

## 7. 配置 Web 环境变量

```bash
cd apps/web
cat > .env.local <<EOF
SMARTLOOP_API_URL=http://127.0.0.1:8088
SMARTLOOP_ADMIN_TOKEN=<跟 API 一致的 ADMIN_TOKEN>
EOF
```

---

## 8. 起 Web Dashboard

```bash
cd apps/web
bun run dev     # http://localhost:3001
```

浏览器打开 http://localhost:3001。

---

## 9. 创建第一个 product + API key

```bash
ADMIN=<你的 ADMIN_TOKEN>

# 1. 创建 org
curl -X POST http://localhost:8088/admin/orgs \
  -H "x-admin-token: $ADMIN" \
  -H 'content-type: application/json' \
  -d '{"id":"salesmartly","name":"SaleSmartly"}'

# 2. 创建 product(把返回的 apiKey 记下来,只显示一次!)
curl -X POST http://localhost:8088/admin/products \
  -H "x-admin-token: $ADMIN" \
  -H 'content-type: application/json' \
  -d '{
    "id":"crm-claw",
    "orgId":"salesmartly",
    "name":"CRM Claw",
    "ownerTeam":"CRM Claw 团队"
  }'
# 返回 {"ok":true,"product":{...},"apiKey":"sl_xxxxx","warning":"..."}
```

---

## 10. 上报一条事件

```bash
SDK_KEY=<上一步返回的 apiKey>

curl -X POST http://localhost:8088/v1/events \
  -H 'content-type: application/json' \
  -H "x-smartloop-key: $SDK_KEY" \
  -d '{
    "input":"昨天哪些会话没回复?",
    "output":"昨天有 12 条会话未回复",
    "model":"qwen3.5-plus",
    "promptVersion":"v1.0",
    "tokens":{"input":100,"output":50},
    "latencyMs":1200,
    "language":"zh-CN"
  }'
```

10 秒内 judge worker 自动评分。刷新 Dashboard 能看到事件 + 评分。

---

## 11. 用 SDK(在你自己的代码里)

```ts
import { SmartLoop } from "@smartloop/sdk"

const sl = new SmartLoop({
  apiKey: process.env.SMARTLOOP_API_KEY!,
  product: "crm-claw",
  endpoint: process.env.SMARTLOOP_ENDPOINT ?? "http://localhost:8088",
})

sl.log({
  input: "用户问的问题",
  output: "AI 的回答",
  model: "qwen3.5-plus",
  tokens: { input: 100, output: 50 },
  latencyMs: 1200,
})

// 进程退出前
await sl.shutdown()
```

详见 [SDK.md](./SDK.md)。

---

## 12. 常用脚本(Workspace Root)

```bash
# 在仓库根目录跑
bun run db:up           # 起 Postgres + Redis
bun run db:down         # 停
bun run db:migrate      # 应用迁移
```

或者在 `apps/api/`:

```bash
bun run dev             # 启动 API(hot reload)
bun run start           # 启动 API(无 hot reload)
bun run db:generate     # 改了 schema 后生成迁移
bun run db:migrate      # 应用迁移
bun run db:studio       # 打开 Drizzle Studio 看数据
```

---

## 13. 常见问题

### 端口冲突
- 5432 已被本机 Postgres 占了 → 我们改用了 **5433**
- 6379 已被本机 Redis 占了 → 我们改用了 **6380**
- 8080 已被其他服务占了 → 我们改用了 **8088**

如果还冲突,改 `docker-compose.yml` 和 `apps/api/.env` 里的端口。

### LLM Judge 报 403 / Model access denied
- 你的 DashScope key 没开放对应模型权限
- **解法**:登录 DashScope 控制台,确认你的 key 能调 `qwen3-max` 和 `qwen3.5-plus`
- 或换一个能调的模型,改 `JUDGE_MODEL` / `PRIMARY_MODEL`

### `bun install` 失败
- 网络问题。在国内试试 `bun install --registry https://registry.npmmirror.com`

### Dashboard 显示 "API 不可达"
- API 没起 → `cd apps/api && bun run dev`
- API 起了但 ADMIN_TOKEN 不对 → 检查 `apps/web/.env.local` 和 `apps/api/.env` 是否一致

### Next.js 16 报奇怪错误
- Next.js 16 有一些 breaking changes。看 `apps/web/AGENTS.md` 提示
- 优先看 `node_modules/next/dist/docs/` 里的官方文档

---

## 14. 项目惯例

### 代码风格
- TypeScript strict 模式开
- Drizzle 写 query 优先用类型安全 API,只在聚合查询时用 `sql\`...\``
- Fastify route handler 全用 async/await
- Server Components(Next.js)默认,client component 只在交互层
- 用 `tabular-nums` class 显示数字(等宽,不跳)

### 提交信息
[Conventional Commits](https://www.conventionalcommits.org/):
- `feat: ...` 新功能
- `fix: ...` 修 bug
- `chore: ...` 配置 / 维护
- `docs: ...` 仅文档
- `refactor: ...` 重构
- `perf: ...` 性能

### Schema 变更流程
1. 改 `apps/api/src/db/schema.ts`
2. `bun run db:generate` 生成新的 migration SQL
3. **看一眼** `apps/api/src/db/migrations/XXXX_*.sql` 确认 SQL 没意外
4. `bun run db:migrate` 应用
5. 改用了 schema 的 service / route 代码
6. commit migration + schema + 代码一起

### 切勿:
- ❌ 改老的 migration 文件(它们已 applied,改了无效且会让别人混乱)
- ❌ 把 `.env` 提交到 git
- ❌ 把 admin token / DashScope key 写死在代码里
- ❌ 把 admin token 暴露给浏览器 / 客户端
