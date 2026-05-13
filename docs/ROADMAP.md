# Roadmap

✅ 已完成 / 🚧 进行中 / 📋 待办 / 💭 探索

---

## ✅ 已完成(Day 1 - 2026-05-13)

### 后端 API
- ✅ Fastify + Drizzle + Postgres + Redis 脚手架
- ✅ 10 张表的 schema + 迁移
- ✅ `X-Admin-Token` 全局管理鉴权(常数时间比对防 timing attack)
- ✅ `X-SmartLoop-Key` per-product API key(生成 + SHA-256 hash 存库)
- ✅ `POST /v1/events` 单条上报
- ✅ `POST /v1/events/batch` 批量上报
- ✅ `POST /v1/events/:id/feedback` 用户反馈
- ✅ `/admin/orgs` 增删改查
- ✅ `/admin/products` 增删改 + key 轮换
- ✅ `/admin/judge/run` 手动触发评分
- ✅ `/admin/dashboard/overview` 仪表盘聚合
- ✅ LLM-as-Judge worker(每 5s 拉批,调 qwen3-max,4 维评分 + 标签)
- ✅ 健康分 / 差评率 / 幻觉率自动计算

### Node SDK
- ✅ `SmartLoop` 客户端类
- ✅ `log()` 简单模式
- ✅ `startSession()` 会话模式(工具调用、自动延迟计算)
- ✅ `feedback()` 用户反馈
- ✅ 异步批量上报(5s / 50 条)
- ✅ 非阻塞 + 静默失败

### Web Dashboard
- ✅ Next.js 16 + Turbopack + Tailwind 4 + React 19
- ✅ Server Components 直连 API(token 不出服务端)
- ✅ 首页:跨产品健康总览 + KPI 卡 + 实时事件流
- ✅ 自研组件:`BrandMark`、`HealthRing`、`Sparkline`
- ✅ AI 产品视觉系统(深色 + 渐变 + 实时脉冲)

### 部署
- ✅ Docker Compose(Postgres 16 + Redis 7)
- ✅ nginx 反代(:80 → API :8088 + Web :3001)
- ✅ 公网访问 http://47.82.1.197
- ✅ Admin token + per-product key 鉴权

### 文档
- ✅ README、ARCHITECTURE、DEVELOPMENT、DEPLOYMENT、API、SDK、SECRETS、ROADMAP

---

## 🚧 进行中(Day 2-5)

- 🚧 产品详情页 `/products/[id]`
  - cluster 概览
  - prompt 历史时间线
  - 24h/7d/30d 趋势图
- 🚧 事件详情页 `/events/[id]`
  - 完整输入/输出/工具调用
  - judge 4 维评分 + reasoning
- 🚧 cluster 自动聚类逻辑(MVP:固定 5 类 LLM 归类)
- 🚧 钉钉告警 webhook(异常 cluster 飙升触发)

---

## 📋 待办 (路演前必做,Day 6 - 2026-06-07)

### 数据
- 📋 灌入真实 CRM Claw 历史数据(至少 200 条事件 + 30 条反馈,脱敏)
- 📋 创建第 2、3 个产品(AI 机器人、AI 翻译)+ 对应模拟数据

### 演示流畅度
- 📋 准备 5 分钟 demo 脚本(对应文档 6 幕)
- 📋 预生成"完美"的 bad case cluster 数据
- 📋 演示一次 prompt 变更 → 回归测试 → 通过率提升的全链路

### 工程化
- 📋 系统级 systemd 化(API + Web 不再手起)
- 📋 把 `/tmp/smartloop-*.log` 改成 `/var/log/smartloop/`
- 📋 nginx 加 rate limit `limit_req_zone`(MVP 也要防爬)

---

## 📋 待办(路演后立项,M1-M3)

### 多语言 SDK
- 📋 Python SDK(算法团队接入用)
- 📋 PHP SDK(SS 主站 Hyperf 用)

### 评测能力升级
- 📋 Judge 校准集(50 条人工标注样本,周度校准)
- 📋 多模型 judge 投票(qwen3-max + GPT-4o 选一致)
- 📋 幻觉检测:正则抽 ID + 数据库回查
- 📋 LLM Judge prompt 优化(当前给纯问候打 too_short 偏严)

### Cluster 真聚类
- 📋 用 bge-m3 embedding 入 Milvus
- 📋 DBSCAN 自动聚类(不再依赖 LLM 固定分类)
- 📋 cluster name + description 自动生成
- 📋 cluster 趋势 + 回弹监控

### Prompt 工具
- 📋 Prompt 版本管理 UI
- 📋 Prompt diff 可视化(突出关键改动行)
- 📋 一键 A/B 测试(新旧 prompt 各跑 N 条 golden case)
- 📋 自动建议修复 prompt(LLM 基于 bad case 推断改进)

### 回归测试
- 📋 Golden case 管理 UI
- 📋 一键回归 + 进度条
- 📋 回归报告 PDF / Markdown 导出
- 📋 自动从 production bad case 生成 golden case

### 告警
- 📋 钉钉 / 飞书 / 企微多通道
- 📋 告警规则 DSL(`metric > threshold for window`)
- 📋 告警值班轮换
- 📋 告警抑制 / 静默

### 多产品扩展
- 📋 接入 AI 机器人
- 📋 接入 AI 翻译
- 📋 接入 Quality Loop(SS 现有的客户反馈系统)
- 📋 跨产品共享 dashboard

---

## 📋 待办(M4-M6,SS Enterprise 化)

- 📋 用户级权限(替代全局 token)
- 📋 接入 SaleSmartly SSO
- 📋 多租户硬隔离(分库 / 分 schema)
- 📋 套餐计费:按 event 上报量分级
- 📋 客户自助:商户可以看到自己 AI 客服的健康分
- 📋 SLA 保障(uptime、judge 延迟)

---

## 💭 长期探索(Y2+)

### 独立 SaaS 化
- 💭 spin out 成独立品牌(类 LangSmith 中文跨境版)
- 💭 接入 LangChain / LlamaIndex / Anthropic SDK 的 trace
- 💭 OpenAI SDK 自动 instrumentation
- 💭 自托管开源版本(吸引 dev 用户)

### 通用质量观测
- 💭 不只 AI 产品,SaleSmartly 整体业务的质量监控(API 5xx、转化率异常、客户卡顿率)

### 智能 Agent 工程平台
- 💭 「为 Agent 工程量身打造的 Sentry」
- 💭 包含 RAG 质量监控、Tool calling 失败分析、Memory 一致性检查

---

## 安全

- 📋 接入 HashiCorp Vault / 阿里云 KMS,运行时拉 secret
- 📋 SSO 替代 ADMIN_TOKEN
- 📋 审计日志(谁在什么时候操作了什么)
- 📋 GitHub Action 自动扫秘密泄露
- 📋 PR 自动跑 OWASP / npm audit

---

## 工程化补强

- 📋 GitHub Actions CI
- 📋 GitHub Actions 自动部署(merge to main → SSH 部署)
- 📋 单元测试(judge service + api-key + auth)
- 📋 E2E 测试(SDK → API → DB 全链路)
- 📋 监控告警(API 5xx > N、judge 落后、磁盘满)
- 📋 日志聚合(Loki / SLS)
- 📋 性能压测(k6 模拟 1000 events/sec)

---

## 已知 bug

- ⚠️ Judge 给纯问候("早上好"、"Hi")打 `too_short` 偏严,需要调 prompt
- ⚠️ Prompt 版本(`prompt_versions` 表)还没和 events 关联,目前只有 `prompt_version_label` 字符串
- ⚠️ Drizzle `inArray` 在某些场景下不如 raw SQL 高效,后续观察

---

## 接手维护者的优先级建议

如果你刚接手这个项目:

1. **先做完产品详情页 + 事件详情页**(让 demo 更完整)
2. **systemd 化**(避免重启服务器后 API 没起来)
3. **接入第 2 个真实产品**(证明平台化叙事)
4. **HTTPS + 子域名**(展示给外部时不会被浏览器警告"不安全")
5. **告警链路打通**(让平台"活起来",有事件触发推送)

详细顺序建议看 [DEVELOPMENT.md](./DEVELOPMENT.md) 的「项目惯例」,优先级别错。
