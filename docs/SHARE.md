# SmartLoop · 内部分享文档

> 「让每一个 AI 产品自己说出它哪里错了。」

**面向**:产品、研发、运营、市场团队
**目标**:用 15 分钟读完,清楚知道 SmartLoop 是什么、能做什么、下一步怎么推
**最后更新**:2026-05-18

---

## TL;DR

**SmartLoop 是 AI 产品的统一质量平台**——SDK 一行接入,所有 AI 交互自动评分、差评自动归类、prompt 改动跑回归、异常实时告警。**MIT 开源,可自托管,任何 LLM 都能接**。

类比:**Sentry for AI agents**——Sentry 抓代码崩溃,我们抓 AI 答错。

公网 demo:**http://47.82.1.197**
GitHub:**https://github.com/Binzaga/SmartLoop**

---

## 1. 我们解决什么问题

任何团队在做 AI 产品时,都会撞到这五件事:

| 痛点 | 现象 | 损失 |
|---|---|---|
| 不知道哪个 prompt 在作妖 | 质量退化是悄悄的,等用户投诉才发现 | 客户流失,信任打折 |
| 差评堆在 spreadsheet 里 | 没人系统归类、跟踪 | 修了又复发,没沉淀 |
| Prompt 改动靠"感觉"上线 | 没有回归测试,改一动一炸 | 周期性回炉,工程师疲于补救 |
| 多语言质量不可见 | 英文 RAG 良好,阿拉伯语 / 西语 RAG 烂 | 跨境业务隐形漏水 |
| 已有的 dashboard 是给开发者看的 | PM / 运营看不懂 trace / log | AI 质量没人在 owner |

**SmartLoop 把这五件事合到一个平台**——而且是面向产品 owner、不是单纯开发者工具。

---

## 2. SmartLoop 是什么

### 2.1 核心定位

> 任何 AI 产品都能接入,**统一观测质量、归类差评、回放新 prompt、告警异常**。

### 2.2 现在能做什么(2026-05 状态)

| 能力 | 状态 | 简介 |
|---|---|---|
| **SDK 一行接入** | ✅ 已上线 | Node.js,异步批量,非阻塞,3 行代码完成接入 |
| **LLM-as-Judge 自动评分** | ✅ 已上线 | 4 维度(准确性 / 有用性 / 安全 / 风格)+ 标签分类(hallucination / too-short / off-topic 等)|
| **Bad case 自动聚类** | ✅ 已上线 | 低分 + 👎 事件按 tag 归到 cluster,自动算 24h / 7d / 总趋势 |
| **告警链路(钉钉)** | ✅ 已上线 | Cluster 数量异常飙升 → 钉钉 markdown 告警卡(可扩到 Slack / Telegram / 飞书)|
| **🔥 Replay Sandbox(旗舰)** | ✅ 已上线 | **拿历史 bad case 喂给新 prompt 跑一遍,看 fix 还是 break,这是别人没有的差异化** |
| **登录 + 多用户** | ✅ 已上线 | 邮箱密码 + 会话 cookie,第一个注册的自动是 admin |
| **官网 + Dashboard** | ✅ 已上线 | 营销页(英 + 中)+ 完整仪表盘(健康总览、产品详情、事件详情、replay 详情)|
| **文档体系** | ✅ 已上线 | README / ARCHITECTURE / DEVELOPMENT / DEPLOYMENT / API / SDK / SECRETS / ROADMAP / OPEN_SOURCE_ROADMAP |
| **Python SDK** | 📋 待办 | 给算法团队接入 |
| **多语言告警通道** | 📋 待办 | Slack / Telegram / 飞书 |
| **Cluster embedding 真聚类** | 📋 待办 | 现在是 tag-based,后期 bge-m3 + DBSCAN |

---

## 3. 怎么用

### 3.1 一个 AI 产品如何接入(给开发者看)

```ts
import { SmartLoop } from "@smartloop/sdk"

const sl = new SmartLoop({
  apiKey: process.env.SMARTLOOP_API_KEY,
  product: "my-agent",
  endpoint: "https://smartloop.your.co",
})

// 每次 LLM 调用之后
sl.log({
  input: userMessage,
  output: aiReply,
  model: "gpt-4o",
  tokens: { input: 1000, output: 200 },
  latencyMs: 1500,
})
```

**3 行代码,完成接入**。SDK 异步批量、零阻塞、出错静默。

### 3.2 一个产品 owner / PM 怎么用

1. 登录 dashboard → 看自己产品的 health score
2. 看 bad-case clusters → 找到最严重的失败模式(比如「订单查询时编造单号」)
3. 点 "Test a new prompt on this cluster" → 改一段 prompt,**让 AI 用新 prompt 重答历史差评**
4. 看老 vs 新并排对比 → 通过率从 67% → 92%? Ship!
5. 没改好? Iterate 按钮 → 下一轮

**整个迭代闭环不超过 10 分钟**。

### 3.3 一个运维 / 安全负责人怎么用

- 系统所有数据在自己服务器
- 关键 secret 全部环境变量,无硬编码
- 用户级权限(admin / 普通)
- 审计接口可扩(目前 schema 预留)

---

## 4. 技术架构(给研发看)

```
        AI 产品 (CRM Claw / 客服 Bot / Agent / ...)
                       │
                       │ @smartloop/sdk (3 lines)
                       ▼
              SmartLoop API (Fastify + Bun)
                       │
       ┌───────────────┼─────────────────┐
       ▼               ▼                 ▼
   Postgres        4 个 Worker      LLM (DashScope)
   + Drizzle      (每 5-60s tick)    Qwen-Max / GPT
                       │
                       ▼
          Next.js Dashboard (公网 + 登录)
```

**4 个 Worker**:

1. **Judge Worker**(每 5s)— 给每条事件 4 维评分 + 打 tag
2. **Cluster Worker**(每 60s)— 把低分 + 👎 事件归到 cluster
3. **Alert Worker**(每 5min)— 检测 cluster spike,推钉钉
4. **Replay Worker**(每 10s)— 处理 replay 任务,用新 prompt 重跑历史事件

**技术栈**:Bun + TypeScript + Fastify + Drizzle + Postgres + Next.js 16 + Tailwind 4 + React 19

详细架构见 [`docs/ARCHITECTURE.md`](./ARCHITECTURE.md)。

---

## 5. 和 LangSmith / Braintrust / Helicone 的区别

| 维度 | LangSmith | Braintrust | Helicone | **SmartLoop** |
|---|---|---|---|---|
| 主用户 | 开发者(trace) | 算法工程师(eval) | 后端开发(成本 / 延迟)| **产品 owner + PM + 运营** |
| **Bad case 管理** | ❌ | 部分 | ❌ | ✅ **first-class** |
| **Replay 沙箱** | 弱 | 中等 | ❌ | ✅ **完整,可一键跑** |
| 自托管 | ❌(只云)| ❌(只云)| ✅ | ✅ **MIT 开源** |
| 多语言 UI | EN | EN | EN | **EN + 中文** |
| 跨渠道告警 | Slack | Slack | Slack only | **钉钉 + Slack + Telegram + 飞书 + 自定义 webhook** |
| 价格 | $200+/月 | $100+/月 | $40+/月 | **永远免费(自托管),Cloud 待开放** |

**不是取代他们,是补位他们没做好的部分**:bad case 管理 + 真正的 replay + 中文跨境场景。

---

## 6. 为什么选开源

| 因素 | 解读 |
|---|---|
| **AI dev 信任** | AI 工程师只信开源 dev tool(LangSmith / Braintrust 都做得不开心,因为闭源)|
| **客户数据敏感** | 公司不愿意把 LLM input/output 发到第三方 SaaS,自托管是入场券 |
| **国际化成本低** | GitHub stars + HN + Reddit + Product Hunt,纯靠内容获客,无需销售 |
| **可持续性** | OSS 项目即使商业化失败,代码仍在,作者仍有简历加分 |
| **类比** | PostHog / Sentry / Helicone / LangFuse 都走的同一条路,千万 ARR 验证可行 |

**长期变现路径**:
1. M0-12:开源核心(OSS Core)拿 stars / contributors / 自托管用户
2. M12-24:Cloud(托管 SaaS)免费 + 付费分层
3. M24+:Enterprise Edition(SSO / SAML / RBAC / 审计)

详见 [`docs/OPEN_SOURCE_ROADMAP.md`](./OPEN_SOURCE_ROADMAP.md)。

---

## 7. 推广计划(GTM)

### 7.1 时间表

| 阶段 | 时间 | KPI |
|---|---|---|
| **M1 基建** | 6 月 | README hero gif + Issue 模板 + CI + 一键部署按钮 |
| **M2 启动周** | 7 月 | HN / PH / Reddit / 知乎 / 掘金 同一周齐发,**目标 500+ stars** |
| **M3 社区** | 8 月 | 第一批外部 PR + Discord + 用户案例 |
| **M4 集成** | 9 月 | Python SDK + LangChain integration |
| **M5 Cloud 内测** | 10 月 | 注册量 500+ waitlist |
| **M6 决策** | 11 月 | 演讲投稿,决定是否离职做 |

### 7.2 内容矩阵

**每月 3-5 篇内容,英中双语**:
- 1 篇技术深度(如《我们如何用 LLM-as-Judge 评估自己》)
- 1 篇 SEO 长尾(如《Best LangSmith alternatives》)
- 1 篇用户案例
- 1 段视频(2-5 分钟 demo)

**渠道**:
- 英文:Dev.to + GitHub Discussions + Twitter + Hacker News + Reddit
- 中文:知乎 + 掘金 + 微信公众号 + B 站

### 7.3 第一波启动周(最关键)

周二早上 10:00 PT 同时齐发:
- **HN**:Show HN: SmartLoop - Open-source quality observation for AI products
- **PH**:Sentry for AI agents
- **Reddit**:3 个版本(r/LocalLLaMA, r/programming, r/MachineLearning)各一个角度
- **Dev.to**:How we built SmartLoop
- **Twitter** thread + Anthropic / OpenAI / LangChain Discord 同步推

详见 [`docs/OPEN_SOURCE_ROADMAP.md`](./OPEN_SOURCE_ROADMAP.md)。

---

## 8. 旗舰功能详解:Replay Sandbox

这是 **SmartLoop 的杀手锏**,也是路演 5 分钟里最 wow 的部分。

### 它做什么

拿历史 bad case,**用新 prompt 重新跑一遍**,告诉你修没修好。

### 完整闭环

```
1. AI 产品上线
   ↓
2. SDK 自动上报每条事件
   ↓
3. Judge 自动评分,标 hallucination / format / off-topic 等
   ↓
4. Cluster 自动归类同类问题
   ↓
5. PM 看到某 cluster 飙升 → 点 "Test a new prompt"
   ↓
6. 贴新 prompt → Replay Worker 用新 prompt 重跑 N 条事件
   ↓
7. 老 vs 新 side-by-side,通过率 67% → 92%
   ↓
8. Ship 新 prompt,问题闭环
```

### 真实 demo

我们用 5 条 "AI 编造客户名" 的 hallucination 事件测试新 prompt:

| 事件 | 老回答 | 新回答 | tags 变化 |
|---|---|---|---|
| #1 | "昨天有 7 位客户:王五、李四、Tom Smith..." | "我需要更多信息" | hallucination → too_short |
| #2 | 同样编造 | "我需要更多信息" | hallucination → too_short |
| #3 | 同样 | "我需要更多信息" | hallucination → too_short |

→ Replay 说:**幻觉治住了,但 trade-off 是变得太短**。PM 立刻知道下一步要写 v3.4 prompt 让 AI 主动说"我需要 X 和 Y 才能回答"。

这是别的平台做不到的洞察。

体验:http://47.82.1.197/dashboard/replays/67e50e33-a009-45ba-856a-56ea0123d6b7

---

## 9. 我们需要团队做什么

### 对产品 / PM
- 帮我们想 **真实的 AI 产品场景** —— 我们要在 cluster / replay UI 上覆盖你的痛点
- 加入第一批用户名单 —— 用 SmartLoop 监控你正在做的 AI 功能

### 对研发
- 用 SDK 接入你的 AI 服务 —— 3 行代码,文档在 `docs/SDK.md`
- 提 issue / PR —— 现在 `good first issue` 标签下有 8-10 个适合贡献的入门任务
- 反馈 dashboard 的使用体验 —— 哪里不直观?哪里数据不够用?

### 对运营 / 市场
- 帮翻译 / 校对中文官网内容(打开 http://47.82.1.197/?lang=zh 看)
- 帮转发启动周内容(M2 阶段集中)
- 联系跨境圈 / AI 圈 KOL 提前预热

### 对所有人
- ⭐ **Star 一下 https://github.com/Binzaga/SmartLoop**
- 关注 Twitter / 知乎,有内容时帮转一下

---

## 10. 路线图(未来 6 个月)

✅ 已完成:
- API + 4 个 Worker + Dashboard + 官网 + 登录
- Replay Sandbox 端到端
- 完整开源文档 + LICENSE(MIT)+ 6 个月开源运营路线图

🚧 进行中:
- Python SDK
- LangChain / LlamaIndex integration
- systemd 化部署(目前还是手动起进程)

📋 短期(1-3 个月):
- 真实 demo 数据接入(用 CRM Claw 等内部产品做 first user)
- Hero gif + README polish
- GitHub Actions CI/CD 启用
- Discord 服务器开起来
- 第一波 launch(HN + PH + Reddit + 知乎齐发)

📋 中期(3-6 个月):
- Cloud beta 上线
- 第一批 enterprise outreach
- 多语言告警通道(Slack / Telegram / 飞书)
- Cluster embedding 真聚类

详见 [`docs/ROADMAP.md`](./ROADMAP.md)。

---

## 11. 风险与不确定性

| 风险 | 应对 |
|---|---|
| **LangSmith / Braintrust 跟进开源** | 我们差异化是 bad case + replay,他们短期内不会做 |
| **国内 ARPU 低,开源很难变现** | 目标是国际市场,英文官网 + GitHub 国际化优先 |
| **个人时间紧** | 把核心抓好(后端 + 工程),社区运营找联合维护者 |
| **法律 / 公司利益冲突** | 项目以个人名义 / 独立公司形式持有,与公司业务不重叠 |

---

## 12. 一句话总结

> **SmartLoop 是 AI 产品的 Sentry——产品越多,越离不开它。开源、自托管、MIT,世界上每个 AI 团队都该有一个。**

---

## 附录:链接合集

- **官网**:http://47.82.1.197 (中文:`/?lang=zh`)
- **Dashboard**:http://47.82.1.197/dashboard
- **GitHub**:https://github.com/Binzaga/SmartLoop
- **快速接入**:[`docs/DEVELOPMENT.md`](./DEVELOPMENT.md)
- **API 参考**:[`docs/API.md`](./API.md)
- **SDK 文档**:[`docs/SDK.md`](./SDK.md)
- **产品路线图**:[`docs/ROADMAP.md`](./ROADMAP.md)
- **开源运营路线图**:[`docs/OPEN_SOURCE_ROADMAP.md`](./OPEN_SOURCE_ROADMAP.md)
- **架构详解**:[`docs/ARCHITECTURE.md`](./ARCHITECTURE.md)

---

**问题或想法?**
直接来 GitHub Issues / Discussions,或者钉钉 @ 我。

**这份文档欢迎转发、修改、贡献。** 它本身也是开源的(`docs/SHARE.md`),改完发 PR 就行。
