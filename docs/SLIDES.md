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
    padding: 40px 64px;
    font-size: 0.95em;
  }
  h1 {
    color: var(--text);
    font-weight: 600;
    letter-spacing: -0.02em;
    margin: 0 0 8px;
  }
  h2 {
    color: var(--text);
    font-weight: 600;
    letter-spacing: -0.01em;
    border-bottom: 1px solid var(--border);
    padding-bottom: 8px;
    margin: 0 0 16px;
    font-size: 1.4em;
  }
  h3 { color: var(--text); font-weight: 500; }
  p, li { margin: 0.45em 0; }
  strong { color: var(--text); font-weight: 600; }
  em { color: var(--accent-from); font-style: normal; }
  code {
    background: var(--bg-elev);
    color: var(--accent-to);
    padding: 1px 5px;
    border-radius: 4px;
    font-size: 0.82em;
  }
  pre {
    background: var(--bg-elev);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 12px 16px;
    font-size: 0.7em;
    line-height: 1.45;
    margin: 8px 0;
  }
  pre code { background: none; color: var(--text-2); padding: 0; font-size: 1em; }
  blockquote {
    border-left: 3px solid var(--accent-from);
    padding: 4px 12px;
    color: var(--text-2);
    font-style: italic;
    font-size: 0.88em;
    margin: 8px 0;
  }
  table {
    border-collapse: collapse;
    margin: 8px 0;
    font-size: 0.72em;
    width: 100%;
  }
  th, td {
    border: 1px solid var(--border);
    padding: 6px 10px;
    text-align: left;
  }
  th {
    background: var(--bg-elev);
    color: var(--text);
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    font-size: 0.92em;
  }
  ul, ol { line-height: 1.55; padding-left: 1.2em; }
  ul li { font-size: 0.92em; }
  a { color: var(--accent-to); text-decoration: none; }
  header {
    color: var(--text-3);
    font-size: 0.65em;
    letter-spacing: 0.15em;
    text-transform: uppercase;
  }
  footer {
    color: var(--text-3);
    font-size: 0.6em;
  }
  section.lead {
    text-align: center;
    justify-content: center;
    align-items: center;
  }
  section.lead h1 {
    font-size: 2.8em;
    margin: 0;
    line-height: 1.05;
  }
  section.lead .tagline {
    color: var(--text-2);
    font-size: 1.2em;
    margin-top: 16px;
  }
  .gradient {
    background: linear-gradient(110deg, var(--accent-from) 0%, var(--accent-mid) 40%, var(--accent-to) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .eyebrow {
    color: var(--accent-from);
    font-size: 0.65em;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    margin-bottom: 8px;
  }
  .big-stat {
    font-size: 2.6em;
    font-weight: 600;
    line-height: 1;
    color: var(--text);
  }
  .stat-row {
    display: flex;
    gap: 32px;
    margin-top: 24px;
  }
  .stat-row > div { flex: 1; }
  .stat-label {
    color: var(--text-3);
    font-size: 0.62em;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    margin-bottom: 6px;
  }
  .center { text-align: center; }
  .red { color: var(--crit); }
  .green { color: var(--good); }
  .amber { color: var(--warn); }
  .muted { color: var(--text-3); font-size: 0.85em; }
  .tag-list { line-height: 1.9; font-size: 0.95em; }
  .tag-list code { font-size: 0.85em; }
---

<!-- Slide 1: Title -->
<!-- _class: lead -->
<!-- _paginate: false -->

# SmartLoop

<div class="tagline">
让每一个 AI 产品 <span class="gradient">自己说出</span> 它哪里错了
</div>

<div class="muted">Sentry for AI agents · MIT · 自托管</div>

---

<!-- Slide 2: Pain -->

## 任何做 AI 产品的团队,都撞同 5 件事

| 痛点 | 现状 |
|---|---|
| <span class="red">不知道哪个 prompt 在作妖</span> | 质量退化静悄悄,用户投诉才发现 |
| <span class="red">差评堆在 spreadsheet</span> | 没人归类,反复出现 |
| <span class="red">Prompt 改动靠"感觉"上线</span> | 没回归测试,改一动一炸 |
| <span class="amber">多语言质量不可见</span> | 英文 OK,阿/西/泰文 RAG 烂 |
| <span class="amber">Dashboard 只给开发者看</span> | PM / 运营看不懂 trace |

> 我们做了一个**面向产品 owner、不只是开发者**的平台,把 5 件事合到一处。

---

<!-- Slide 3: What it is -->

<div class="eyebrow">What is SmartLoop</div>

# AI 产品的 <span class="gradient">统一质量平台</span>

**SDK 一行接入** → 自动评分 · 差评归类 · Prompt 回归 · 实时告警

```ts
const sl = new SmartLoop({ apiKey, product: "my-agent", endpoint })
sl.log({ input: userMsg, output: aiReply, model: "gpt-4o", ... })
```

<div class="stat-row">
  <div>
    <div class="stat-label">License</div>
    <div class="big-stat gradient">MIT</div>
  </div>
  <div>
    <div class="stat-label">Self-host</div>
    <div class="big-stat gradient">5 min</div>
  </div>
  <div>
    <div class="stat-label">Stack</div>
    <div class="big-stat gradient">Bun · TS</div>
  </div>
</div>

---

<!-- Slide 4: Live -->
<!-- _class: lead -->

<div class="eyebrow">Live now</div>

# <span class="gradient">47.82.1.197</span>

<div class="muted">营销页 · Dashboard · Replay 沙箱 · 6 个 worker 实时跑</div>

<br>

```
founder@smartloop.dev / hackathon2026   ← admin
```

---

<!-- Slide 5: Feature 1 - Judge -->

## 1️⃣ LLM-as-Judge · <span class="gradient">每条回答自动评分</span>

4 维度评分 + 标签分类 + 可解释 reasoning:

| 维度 | 范围 |
|---|---|
| Accuracy 准确性 | 0–5 |
| Helpfulness 有用性 | 0–5 |
| Safety 安全 | 0–5 |
| Style 风格 | 0–5 |

**Judge 模型可换**:Qwen3-Max · GPT-4o · Claude Sonnet · 你自己的

---

<!-- Slide 6a: Tags -->

## 自动标签 8 类

<div class="tag-list">

🔴 `hallucination` — AI 编造客户名 / 订单号 / 数字
🟡 `too_long` / `too_short` — 啰嗦或过短
🟠 `format_violation` — 没按 JSON / 字段约束
🔴 `safety_violation` — 越权 / 泄露
🟣 `multilingual_drift` — 应该回阿语却回中文
🟣 `wrong_lookup` — 工具结果用错了
🟡 `off_topic` — 跑题
🟢 `good` — 综合 4 分以上

</div>

---

<!-- Slide 6b: Cluster -->

## 2️⃣ Bad-Case 自动聚类 · <span class="gradient">差评不再石沉大海</span>

每分钟 worker tick,把低分 + 👎 事件归到 cluster:

- 24h / 7d / 总数 自动算
- 每 cluster 有趋势 + 典型案例链接
- **直接挂修复入口**:点 "Test a new prompt"

<br>

> 这就是 SmartLoop 的核心闭环——**bad case 不再只是 log,是 actionable signal**。

---

<!-- Slide 7: Replay Killer -->

<div class="eyebrow">Flagship feature</div>

# 3️⃣ Replay Sandbox

> 拿历史差评,用 <em>新 prompt</em> 重跑一遍,告诉你修没修好。

**别的平台做不到 / 做得很烂**,我们做扎实了:

- ✅ 选 cluster → 点 "Test new prompt"
- ✅ 一键 replay 整个 cluster
- ✅ 老 vs 新 side-by-side
- ✅ 通过率 67% → 92%(自动算)
- ✅ Tag 变化暴露 trade-off
- ✅ Iterate 按钮 → 下一轮

---

<!-- Slide 8: Replay demo -->

## Replay 真实 demo(刚跑的)

**原 prompt** → AI 编造:
> "昨天有 7 位客户:王五、李四、Tom Smith、Maria Garcia..."

**新 prompt**(明确禁止编造)→ AI:
> "我需要更多信息才能回答"

**Replay 自动洞察**:
- 幻觉治住 ✅
- Tags 从 `hallucination` 变 `too_short` ⚠️
- → PM 立刻知道写 v3.4 让 AI 主动说"我需要 X 和 Y"

> 这种 trade-off 可见性,LangSmith / Braintrust 都没做好。

---

<!-- Slide 9: Alerts -->

## 4️⃣ Cross-Channel 告警 · <span class="gradient">异常瞬间到对的人</span>

默认规则:任一 cluster 24h 数 ≥ 1.5× 7d baseline → 触发

**钉钉** ✅ · Slack 📋 · Telegram 📋 · 飞书 📋 · 自定义 webhook 📋

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

<!-- Slide 10: Architecture -->

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

**Workers**:Judge(5s)· Cluster(60s)· Alert(5min)· **Replay(10s)**

**Stack**:Bun + TS + Fastify + Drizzle + Postgres + Next.js 16

---

<!-- Slide 11: Competition -->

## 我们和谁不一样

| | LangSmith | Braintrust | Helicone | **SmartLoop** |
|---|---|---|---|---|
| 主用户 | dev | algo | backend | <span class="gradient">**PM + ops**</span> |
| Bad-case 管理 | ❌ | 部分 | ❌ | ✅ |
| Replay 沙箱 | 弱 | 中 | ❌ | ✅ |
| 自托管 | ❌ | ❌ | ✅ | ✅ |
| 中文 UI | ❌ | ❌ | ❌ | ✅ |
| 跨渠道告警 | Slack | Slack | Slack | <span class="gradient">5 渠道</span> |
| 价格 | $200+/月 | $100+/月 | $40+/月 | <span class="gradient">**免费**</span> |

> 不取代他们,补位他们没做好的部分。

---

<!-- Slide 12: Why OSS -->

## 为什么 MIT 开源

| 因素 | 解读 |
|---|---|
| 🔒 客户数据敏感 | 公司不愿把 LLM I/O 发到第三方 — 自托管是入场券 |
| 🤝 AI dev 信任开源 | dev tool 闭源没人用 |
| 🌍 获客成本低 | GitHub + HN + 知乎,零销售启动 |
| 📚 资产可持续 | 即使商业化失败,代码仍在 |
| ✅ 同行验证 | PostHog / Sentry / Helicone / LangFuse 走过同条路 |

**变现路径**:OSS Core (M0-12) → Cloud (M12-24) → Enterprise (M24+)

---

<!-- Slide 13: GTM -->

## 6 个月推广计划

| 阶段 | 时间 | 关键动作 | KPI |
|---|---|---|---|
| M1 基建 | 6 月 | hero gif · CI · Issue 模板 · 一键部署 | launch-ready |
| **M2 启动周** | **7 月** | HN + PH + Reddit + 知乎齐发 | **500+ stars** |
| M3 社区 | 8 月 | Discord · 外部 PR · 用户案例 | 1K stars |
| M4 集成 | 9 月 | Python SDK · LangChain adapter | 1.5K stars |
| M5 Cloud beta | 10 月 | smartloop.cloud · 免费层 | 500+ waitlist |
| M6 决策 | 11 月 | 演讲投稿 · enterprise outreach | 3K · 首份 LOI |

---

<!-- Slide 14: Asks -->

## 我们需要团队做什么

**🧠 PM / 产品**
- 帮挖真实 AI 场景,让 SmartLoop UI 覆盖你的痛点
- 加入第一批 dogfood 用户

**⚙️ 研发**
- 用 SDK 接入你的 AI 服务(3 行代码,见 `docs/SDK.md`)
- 提 issue / PR(已埋 10 个 `good first issue`)

**📣 运营 / 市场**
- 校对中文官网 · 转启动周内容 · 联系跨境圈 KOL 预热

**🌟 所有人**
- Star `github.com/Binzaga/SmartLoop` · 帮转 Twitter / 知乎

---

<!-- Slide 15: Status -->

## 当前进度

<div class="stat-row">
  <div>
    <div class="stat-label">已上线能力</div>
    <div class="big-stat green">8</div>
    <div class="muted">核心功能</div>
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

✅ **已完成**:API · 4 worker · Dashboard · 官网 · 登录 · Replay 沙箱 · 完整文档
🚧 **进行中**:Python SDK · LangChain · systemd 化
📋 **短期**:Hero gif · CI/CD · Discord · 启动周

---

<!-- Slide 16: Risks -->

## 风险 + 应对

| 风险 | 应对 |
|---|---|
| LangSmith / Braintrust 跟进开源 | 我们差异化是 bad case + replay,他们短期不会做 |
| 国内 ARPU 低难变现 | 目标国际市场,英文官网 + GitHub 国际化优先 |
| 个人时间紧 | 抓核心,社区运营找联合维护者 |
| 公司利益冲突 | 项目独立持有,与公司业务不重叠 |
| 精力不可持续 | 设硬性边界 · Issue SLA 24h · 每周 ≤ 20h |

---

<!-- Slide 17: Closing -->
<!-- _class: lead -->

# <span class="gradient">SmartLoop</span><br>是 AI 产品的 Sentry

<div class="tagline">产品越多,越离不开它。</div>

<div class="muted">开源 · 自托管 · MIT · 世界上每个 AI 团队都该有一个</div>

---

<!-- Slide 18: Resources -->
<!-- _class: lead -->

# Q & A · 资源

🌐 **demo**: 47.82.1.197
💻 **GitHub**: github.com/Binzaga/SmartLoop
📚 **docs**: docs/(README · API · SDK · ROADMAP · SHARE)
💬 **问题 / 想法**: 钉钉 / GitHub Issues

<br>

<div class="muted center">谢谢 — 准备好接受质疑了 😎</div>
