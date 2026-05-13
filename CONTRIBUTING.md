# Contributing

接手 / 协作前请先读 [README.md](./README.md) 和 [docs/DEVELOPMENT.md](./docs/DEVELOPMENT.md)。

---

## 工作流

1. **从最新 `main` 起一个 feature 分支**
   ```bash
   git checkout main && git pull
   git checkout -b feat/your-feature
   ```

2. **小步提交**,每次 commit 是「能编译能跑」的状态
   ```bash
   git commit -m "feat(api): add cluster aggregation route"
   ```

3. **测试**(目前只有手动 + SDK 冒烟):
   ```bash
   # SDK 端到端
   SMARTLOOP_API_KEY=sl_xxx bun run packages/sdk-node/test-sdk.ts

   # API 启动
   cd apps/api && bun run dev

   # Dashboard 启动
   cd apps/web && bun run dev
   ```

4. **推到 GitHub**
   ```bash
   git push -u origin feat/your-feature
   ```

5. **开 PR** 到 `main`,描述清楚:
   - 改了什么
   - 为什么(链接 ROADMAP 或 issue)
   - 测试步骤(怎么验证)
   - 截图(如果是 UI 改动)

---

## 提交信息规范

[Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

`type` 用:
- `feat` 新功能
- `fix` bug 修复
- `chore` 配置 / 维护
- `docs` 仅文档
- `refactor` 不改行为的重构
- `perf` 性能优化
- `test` 测试

`scope` 用:
- `api` apps/api 后端
- `web` apps/web 前端
- `sdk` packages/sdk-node
- `db` 数据库 schema / migration
- `deploy` 部署相关

例子:
```
feat(api): add cluster auto-grouping cron

每小时跑一次 LLM 分类,把 24h 内 thumbsdown 或 overall<3
的事件归到 5 个固定 cluster。

Closes #12
```

---

## 代码风格

### TypeScript
- `strict: true` 全开
- 不用 `any`,改用 `unknown` + narrow
- API 入参用 `zod` 校验,出参靠 TypeScript 类型保证

### Drizzle
- 优先用类型安全 API(`eq`, `inArray`, `and` 等)
- 复杂聚合用 `sql\`...\`` 但写注释
- Migration 文件**绝不修改**(只追加)

### Fastify
- Route handler 全用 async
- 用 `app.addHook("preHandler", auth)` 而不是逐个 handler 加

### React (Next.js)
- 默认 Server Components
- 只在需要交互时加 `"use client"`
- 数据 fetch 在 Server Components 里直接 `await`

### CSS
- Tailwind 4 utility-first
- 自定义颜色 / 阴影用 CSS variables(`globals.css` 里定义)
- 一致用 `tabular-nums` 显示数字

---

## 改 schema 的流程

```bash
# 1. 编辑 apps/api/src/db/schema.ts
# 2. 生成迁移
cd apps/api
bun run db:generate

# 3. 看一眼新生成的 SQL,确认没问题
ls src/db/migrations/

# 4. 应用
bun run db:migrate

# 5. 改用了 schema 的代码 + 测试
# 6. commit: schema + migration + 代码 一起
git add src/db/schema.ts src/db/migrations/ src/routes/...
git commit -m "feat(db): add cluster_assignment table"
```

⚠️ **绝不修改**已 applied 的 migration 文件,只能写新的来覆盖。

---

## PR Review Checklist

提 PR 前自查:

- [ ] 改 schema 了?有对应 migration 吗?
- [ ] 加新 env 了?`.env.example` 更新了吗?`docs/DEVELOPMENT.md` 提到了吗?
- [ ] 加新端点了?`docs/API.md` 更新了吗?
- [ ] 加新组件了?有简单的 props 文档吗?
- [ ] 把 secret 写进 git 了?(`git diff main` 自己扫一眼)
- [ ] 测过端到端吗?(SDK → API → DB → Dashboard)
- [ ] Dashboard 改了?浏览器实际打开看过吗?
- [ ] 提交信息是 Conventional 格式吗?

---

## 哪些是高价值贡献

按优先级:

1. **接入第 2 个真实产品**(AI 机器人 / AI 翻译)→ 证明平台化叙事
2. **加 systemd 化部署**→ 让服务器重启后自动恢复
3. **实现 cluster 真聚类**(embedding + DBSCAN)→ Dashboard 才有"自动智能"感
4. **加告警 webhook 链路**→ 平台"活起来"
5. **加 HTTPS + 子域名**→ 给外部演示时不会"不安全"警告
6. **加单元测试 + GitHub Actions CI**→ 防止后续改动炸掉
7. **写 Python SDK**→ 让算法团队能接入

详见 [docs/ROADMAP.md](./docs/ROADMAP.md)。

---

## 不要做的事

- ❌ 把 `.env` 提交到 git
- ❌ 把 admin token / DashScope key / GitHub PAT 直接写在代码里
- ❌ 改老 migration 文件(只追加新的)
- ❌ 在客户端组件里使用 admin token
- ❌ 直接给 LLM 发用户的真实身份信息(姓名、邮箱、手机号)而不脱敏
- ❌ 在 API 里抛异常没 catch(用 Fastify error handler)
- ❌ 默默 commit 大文件(images、视频、dump 文件)
- ❌ 不写为什么(commit message + PR description 必须解释 why)
