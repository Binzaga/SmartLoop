---
marp: true
paginate: true
theme: default
class: invert
size: 16:9
header: 'SmartLoop'
footer: '© 2026 · MIT · github.com/Binzaga/SmartLoop'
style: |
  :root {
    --bg: #07070a;
    --bg-elev: #14141a;
    --border: #2a2a36;
    --text: #f4f4f6;
    --text-2: #a8a8b3;
    --text-3: #6b6b78;
    --accent-from: #a78bfa;
    --accent-mid: #818cf8;
    --accent-to: #34d399;
    --good: #34d399;
    --warn: #fbbf24;
    --crit: #f87171;
  }
  section {
    background:
      radial-gradient(at 12% -10%, rgba(167,139,250,0.15), transparent 50%),
      radial-gradient(at 88% 110%, rgba(52,211,153,0.10), transparent 50%),
      var(--bg);
    color: var(--text);
    font-family: -apple-system, "Inter", "Helvetica Neue", "PingFang SC", "Microsoft YaHei", sans-serif;
    padding: 60px 80px;
  }
  h1 {
    color: var(--text);
    font-weight: 600;
    letter-spacing: -0.02em;
  }
  h2 {
    color: var(--text);
    font-weight: 600;
    letter-spacing: -0.01em;
    border-bottom: 1px solid var(--border);
    padding-bottom: 12px;
    margin-bottom: 24px;
  }
  h3 {
    color: var(--text);
    font-weight: 500;
  }
  strong { color: var(--text); }
  em { color: var(--accent-from); font-style: normal; }
  code {
    background: var(--bg-elev);
    color: var(--accent-to);
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.85em;
  }
  pre {
    background: var(--bg-elev);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 16px 20px;
    font-size: 0.82em;
    line-height: 1.5;
  }
  pre code { background: none; color: var(--text-2); padding: 0; }
  blockquote {
    border-left: 3px solid var(--accent-from);
    padding-left: 16px;
    color: var(--text-2);
    font-style: italic;
    font-size: 0.95em;
  }
  table {
    border-collapse: collapse;
    margin: 16px 0;
    font-size: 0.78em;
  }
  th, td {
    border: 1px solid var(--border);
    padding: 8px 12px;
    text-align: left;
  }
  th {
    background: var(--bg-elev);
    color: var(--text);
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    font-size: 0.88em;
  }
  ul, ol { line-height: 1.8; }
  a { color: var(--accent-to); text-decoration: none; }
  header {
    color: var(--text-3);
    font-size: 0.7em;
    letter-spacing: 0.15em;
    text-transform: uppercase;
  }
  footer {
    color: var(--text-3);
    font-size: 0.65em;
  }
  section.lead {
    text-align: center;
    justify-content: center;
  }
  section.lead h1 {
    font-size: 3.2em;
    margin: 0;
    line-height: 1.05;
  }
  section.lead .tagline {
    color: var(--text-2);
    font-size: 1.4em;
    margin-top: 24px;
  }
  .gradient {
    background: linear-gradient(110deg, var(--accent-from) 0%, var(--accent-mid) 40%, var(--accent-to) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .eyebrow {
    color: var(--accent-from);
    font-size: 0.7em;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    margin-bottom: 12px;
  }
  .big-stat {
    font-size: 4em;
    font-weight: 600;
    line-height: 1;
    color: var(--text);
  }
  .stat-row {
    display: flex;
    gap: 48px;
    margin-top: 40px;
  }
  .stat-row > div {
    flex: 1;
  }
  .stat-label {
    color: var(--text-3);
    font-size: 0.7em;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    margin-bottom: 8px;
  }
  .center { text-align: center; }
  .red { color: var(--crit); }
  .green { color: var(--good); }
  .amber { color: var(--warn); }
  .muted { color: var(--text-3); }
---

<!-- ============================================================ -->
<!-- Slide 1: Title -->
<!-- ============================================================ -->

<!-- _class: lead -->
<!-- _paginate: false -->

# SmartLoop

<div class="tagline">
让每一个 AI 产品 <span class="gradient">自己说出</span> 它哪里错了
</div>

<br>

<div class="muted">
Sentry for AI agents · MIT-licensed · 自托管
</div>

---

<!-- ============================================================ -->
<!-- Slide 2: The pain -->
<!-- ============================================================ -->

## 任何做 AI 产品的团队,都在重复同 5 件事

| 痛点 | 现状 |
|---|---|
| <span class="red">不知道哪个 prompt 在作妖</span> | 质量退化静悄悄,用户投诉才发现 |
| <span class="red">差评堆在 spreadsheet</span> | 没人归类、跟踪,反复出现 |
| <span class="red">Prompt 改动靠"感觉"上线</span> | 没回归测试,改一动一炸 |
| <span class="amber">多语言质量不可见</span> | 英文 RAG OK,阿拉伯/西语 RAG 烂 |
| <span class="amber">已有 dashboard 只给开发者看</span> | PM / 运营看不懂 trace |

<br>

> 我们做了一个**面向产品 owner、不只是开发者**的 AI 质量平台,把这 5 件事合到一处。

---

<!-- ============================================================ -->
<!-- Slide 3: What it is -->
<!-- ============================================================ -->

<div class="eyebrow">What is SmartLoop</div>

# AI 产品的 <span class="gradient">统一质量平台</span>

<br>

**SDK 一行接入** → 自动评分 · 差评归类 · Prompt 回归 · 实时告警

<br>

```ts
const sl = new SmartLoop({ apiKey, product: "my-agent", endpoint })

sl.log({ input: userMsg, output: aiReply, model: "gpt-4o", ... })
```

<br>

<div class="stat-row">
  <div>
    <div class="stat-label">License</div>
    <div class="big-stat gradient">MIT</div>
  </div>
  <div>
    <div class="stat-label">Self-host time</div>
    <div class="big-stat gradient">5 min</div>
  </div>
  <div>
    <div class="stat-label">Stack</div>
    <div class="big-stat gradient">Bun · TS</div>
  </div>
</div>

---

<!-- ============================================================ -->
<!-- Slide 4: Live -->
<!-- ============================================================ -->

<!-- _class: lead -->

<div class="eyebrow">Live now</div>

# <span class="gradient">http://47.82.1.197</span>

<br>

<div class="muted">
营销页 · 完整 Dashboard · Replay 沙箱 · 6 个 worker 实时跑
</div>

<br>

```
founder@smartloop.dev / hackathon2026   ← admin
```

---

<!-- ============================================================ -->
<!-- Slide 5: Feature 1 - Judge -->
<!-- ============================================================ -->

## 1️⃣ LLM-as-Judge — <span class="gradient">每条 AI 回答自动评分</span>

<br>

4 维度评分 + 标签分类 + 可解释 reasoning:

| 维度 | 评分 |
|---|---|
| Accuracy 准确性 | 0-5 |
| Helpfulness 有用性 | 0-5 |
| Safety 安全 | 0-5 |
| Style 风格 | 0-5 |

<br>

**自动标签**:`hallucination` · `too_short` · `format_violation` · `safety_violation` · `multilingual_drift` · `wrong_lookup` · `off_topic` · `good`

<br>

**Judge 模型可换**:Qwen3-Max · GPT-4o · Claude Sonnet · 你自己的

---

<!-- ============================================================ -->
<!-- Slide 6: Feature 2 - Cluster -->
<!-- ============================================================ -->

## 2️⃣ Bad-Case 自动聚类 — <span class="gradient">差评不再石沉大海</span>

<br>

每分钟 worker tick,把低分 + 👎 事件归到 8 类:

<br>

<div style="display: flex; gap: 24px; flex-wrap: wrap;">

🔴 **Hallucination** — AI 编造客户名 / 订单号
🟡 **Too long / short** — 啰嗦或过短
🟠 **Format violation** — 没按 JSON / 字段约束
🔴 **Safety violation** — 越权 / 泄露
🟣 **Multilingual drift** — 应该回阿语却回中文
🟣 **Wrong lookup** — 工具调用结果用错了
🟡 **Off topic** — 跑题
🟢 **Good** — 综合 4 分以上

</div>

<br>

每个 cluster 有 24h / 7d 趋势 + 典型案例链接 + **修复入口**。

---

<!-- ============================================================ -->
<!-- Slide 7: Feature 3 - Replay Sandbox (THE KILLER) -->
<!-- ============================================================ -->

<div class="eyebrow">Flagship feature</div>

# 3️⃣ Replay Sandbox

<br>

> 拿历史差评,用 <em>新 prompt</em> 重新跑一遍,告诉你修没修好。

<br>

**别的平台做不到 / 做得很烂**,我们做扎实了:

✅ 选一个 cluster → 点 "Test new prompt"
✅ 贴新 prompt → 一键 replay 整个 cluster
✅ 老 vs 新 side-by-side 对比
✅ 通过率 67% → 92%(自动算)
✅ Tags 变化:`hallucination` → `too_short`(暴露 trade-off)
✅ Iterate 按钮 → 下一轮

---

<!-- ============================================================ -->
<!-- Slide 8: Replay real demo -->
<!-- ============================================================ -->

## Replay 真实 demo(刚才跑的)

<br>

**原始 prompt** → AI 编造:
> "昨天有 7 位客户给了 5 星:王五、李四、Tom Smith、Maria Garcia..."

<br>

**新 prompt**(明确禁止编造)→ AI:
> "我需要更多信息才能回答"

<br>

**Replay 结果**:
- 幻觉治住了 ✅
- 但 tags 从 `hallucination` 变成 `too_short` ⚠️
- → PM 立刻知道下一步要写 v3.4 prompt 让 AI 主动说"我需要 X 和 Y"

<br>

> 这种 **trade-off 可见性,是 LangSmith / Braintrust 都没做好的**。

---

<!-- ============================================================ -->
<!-- Slide 9: Feature 4 - Alerts -->
<!-- ============================================================ -->

## 4️⃣ Cross-Channel 告警 — <span class="gradient">异常瞬间到对的人</span>

<br>

**默认规则**:任一 cluster 24h 数 ≥ 1.5× 7d baseline → 触发

**多通道**:钉钉 ✅ · Slack(待)· Telegram(待)· 飞书(待)· 自定义 webhook(待)

<br>

钉钉告警卡示例:

```
🚨 Cluster spike — Hallucination
Product: crm-claw
24h: 5 events vs baseline 3/day
Spike: 1.67×
Suspected: prompt v3.2 removed "only cite context"
→ [Inspect in SmartLoop]
```

---

<!-- ============================================================ -->
<!-- Slide 10: Architecture -->
<!-- ============================================================ -->

## 技术架构

```
        AI 产品 (CRM Claw / Bot / Agent / ...)
                       │
                  @smartloop/sdk
                       ▼
         SmartLoop API (Fastify + Bun)
                       │
       ┌───────────────┼─────────────────┐
       ▼               ▼                 ▼
   Postgres       4 Workers           LLM API
   + Drizzle    (5s ~ 5min tick)    DashScope / OpenAI
                       │
                       ▼
        Next.js Dashboard (公网 + 登录)
```

<br>

**4 个 worker 持续运行**:
- Judge(每 5s)· Cluster(每 60s)· Alert(每 5min)· **Replay(每 10s)**

<br>

**栈**:Bun + TypeScript + Fastify + Drizzle ORM + Postgres + Next.js 16 + Tailwind 4 + React 19

---

<!-- ============================================================ -->
<!-- Slide 11: Competition -->
<!-- ============================================================ -->

## 我们和谁不一样

| | LangSmith | Braintrust | Helicone | **SmartLoop** |
|---|---|---|---|---|
| 主用户 | dev | algo | backend | <span class="gradient">**PM + ops**</span> |
| Bad-case 管理 | ❌ | 部分 | ❌ | ✅ |
| Replay 沙箱 | 弱 | 中 | ❌ | ✅ |
| 自托管 | ❌ | ❌ | ✅ | ✅ |
| 多语言 UI | EN | EN | EN | EN + 中文 |
| 跨渠道告警 | Slack | Slack | Slack | <span class="gradient">5 渠道</span> |
| 价格 | $200+/月 | $100+/月 | $40+/月 | <span class="gradient">**永久免费**</span> |

<br>

> 不取代他们,补位他们没做好的——**bad case + replay + 中文跨境**。

---

<!-- ============================================================ -->
<!-- Slide 12: Why open source -->
<!-- ============================================================ -->

## 为什么 MIT 开源

<br>

| 因素 | 解读 |
|---|---|
| 🔒 **客户数据敏感** | 公司不愿把 LLM I/O 发到第三方 SaaS — 自托管是入场券 |
| 🤝 **AI dev 信任开源** | dev tool 闭源没人用(看看 LangSmith 的 issue 数 vs Helicone)|
| 🌍 **获客成本低** | GitHub stars + HN + Reddit + 知乎,零销售启动 |
| 📚 **资产可持续** | 即使商业化失败,代码仍在 |
| ✅ **同行验证过** | PostHog / Sentry / Helicone / LangFuse 都走的同一条路 |

<br>

**长期变现**:OSS Core (M0-12) → Cloud (M12-24) → Enterprise (M24+)

---

<!-- ============================================================ -->
<!-- Slide 13: GTM plan -->
<!-- ============================================================ -->

## 6 个月推广计划

| 阶段 | 时间 | 关键动作 | KPI |
|---|---|---|---|
| M1 基建 | 6 月 | hero gif · Issue 模板 · CI · 一键部署 | 仓库 launch-ready |
| **M2 启动周** | **7 月** | HN + PH + Reddit + 知乎 + 掘金 同周齐发 | **500+ stars** |
| M3 社区 | 8 月 | Discord · 第一批外部 PR · 用户案例 | 1K stars · 5 contributors |
| M4 集成 | 9 月 | Python SDK · LangChain adapter | 1.5K stars |
| M5 Cloud beta | 10 月 | smartloop.cloud · 50K events/月免费 | 500+ waitlist |
| M6 决策 | 11 月 | 演讲投稿 · enterprise outreach | 3K stars · 第一份 LOI |

---

<!-- ============================================================ -->
<!-- Slide 14: What we need from the team -->
<!-- ============================================================ -->

## 我们需要团队做什么

<br>

🧠 **PM / 产品**
- 帮挖真实 AI 产品场景,SmartLoop UI 要覆盖你的痛点
- 加入第一批 dogfood 用户名单

⚙️ **研发**
- 用 SDK 接入你正在做的 AI 服务(3 行代码,见 `docs/SDK.md`)
- 提 issue / PR(`good first issue` 标签下有 10 个入门任务)

📣 **运营 / 市场**
- 校对中文官网(http://47.82.1.197/?lang=zh)
- 帮转启动周内容
- 联系跨境 / AI 圈 KOL 提前预热

🌟 **所有人**
- Star `github.com/Binzaga/SmartLoop`
- 关注 Twitter / 知乎,有内容时帮转

---

<!-- ============================================================ -->
<!-- Slide 15: Current status -->
<!-- ============================================================ -->

## 当前进度

<div class="stat-row">
  <div>
    <div class="stat-label">已上线</div>
    <div class="big-stat green">8</div>
    <div class="muted">核心能力</div>
  </div>
  <div>
    <div class="stat-label">代码量</div>
    <div class="big-stat gradient">~6K</div>
    <div class="muted">行 TypeScript</div>
  </div>
  <div>
    <div class="stat-label">文档</div>
    <div class="big-stat gradient">10</div>
    <div class="muted">份完整文档</div>
  </div>
</div>

<br>

**已完成**:API · 4 worker · Dashboard · 官网 · 登录 · Replay 沙箱 · 完整文档

**进行中**:Python SDK · LangChain integration · systemd 化

**短期**:Hero gif · CI/CD · Discord · 启动周准备

---

<!-- ============================================================ -->
<!-- Slide 16: Risks -->
<!-- ============================================================ -->

## 风险 + 应对

| 风险 | 应对 |
|---|---|
| LangSmith / Braintrust 跟进开源 | 差异化是 bad case + replay,他们短期不会做 |
| 国内 ARPU 低难变现 | 目标国际市场,英文官网 + GitHub 国际化优先 |
| 个人时间紧 | 抓核心(后端 + 工程),社区运营找联合维护者 |
| 公司利益冲突 | 项目独立持有,与公司业务不重叠 |
| 个人精力不可持续 | 设硬性边界 — 每周不超 20h · 设 issue SLA 24h |

---

<!-- ============================================================ -->
<!-- Slide 17: One-liner -->
<!-- ============================================================ -->

<!-- _class: lead -->

# <span class="gradient">SmartLoop</span><br>是 AI 产品的 Sentry

<br>

<div class="tagline">
产品越多,越离不开它。
</div>

<br>

<div class="muted">
开源 · 自托管 · MIT · 世界上每个 AI 团队都该有一个
</div>

---

<!-- ============================================================ -->
<!-- Slide 18: Q&A / links -->
<!-- ============================================================ -->

<!-- _class: lead -->

# Q & A · 资源

<br>

- 🌐 **demo**: http://47.82.1.197
- 💻 **GitHub**: github.com/Binzaga/SmartLoop
- 📚 **docs**: docs/ 目录(README · ARCHITECTURE · API · SDK · ROADMAP · OPEN_SOURCE_ROADMAP · SHARE)
- 💬 **问题 / 想法**: 钉钉 / GitHub Issues

<br>

<div class="muted center">
谢谢 — 准备好接受质疑了 😎
</div>
