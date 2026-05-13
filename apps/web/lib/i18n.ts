/**
 * Tiny translations layer. Server-side only — pick a locale at the page boundary
 * and pass strings down.
 *
 * Note: we deliberately avoid next-intl / react-intl for now. The marketing
 * surface is small and a typed dictionary works better than a heavy library.
 */

export type Locale = "en" | "zh"

export interface Strings {
  // Nav
  navFeatures: string
  navHow: string
  navCompare: string
  navGitHub: string
  navStar: string
  navOpenDashboard: string

  // Hero
  heroBadge: string
  heroTitleA: string
  heroTitleAccent: string
  heroTitleB: string
  heroSubtitle: string
  heroSubtitleEmphasis: string
  heroSubtitleSecond: string
  heroCtaPrimary: string
  heroCtaSecondary: string
  heroFinePrint: string

  // Preview labels
  liveLabel: string
  livePreviewEvents: string

  // Social proof
  socialProofEyebrow: string
  socialProof1Title: string
  socialProof1Desc: string
  socialProof2Title: string
  socialProof2Desc: string
  socialProof3Title: string
  socialProof3Desc: string
  socialProof4Title: string
  socialProof4Desc: string

  // Why section
  whyEyebrow: string
  whyTitle: string
  whyTitleAccent: string

  // Feature block 1: Judge
  judgeEyebrow: string
  judgeTitle: string
  judgeBody: string
  judgeReasoning: string

  // Feature block 2: Cluster
  clusterEyebrow: string
  clusterTitle: string
  clusterBody: string

  // Feature block 3: Regression
  regressionEyebrow: string
  regressionTitle: string
  regressionBody: string
  regressionPassRate: string
  regressionTestedAgainst: string

  // Feature block 4: Alerts
  alertsEyebrow: string
  alertsTitle: string
  alertsBody: string
  alertsAlertTitle: string

  // Feature grid
  featuresEyebrow: string
  featuresTitle: string
  feature1Title: string
  feature1Desc: string
  feature2Title: string
  feature2Desc: string
  feature3Title: string
  feature3Desc: string
  feature4Title: string
  feature4Desc: string
  feature5Title: string
  feature5Desc: string
  feature6Title: string
  feature6Desc: string

  // How it works
  howEyebrow: string
  howTitle: string
  how1Title: string
  how1Body: string
  how2Title: string
  how2Body: string
  how3Title: string
  how3Body: string

  // Compare
  compareEyebrow: string
  compareTitle: string
  compareSubtitle: string
  compareColCapability: string

  // Open source
  osEyebrow: string
  osTitleA: string
  osTitleAccent: string
  osBody: string
  osLicenseLabel: string
  osLicenseSub: string
  osSelfHostLabel: string
  osSelfHostValue: string
  osSelfHostSub: string
  osStackLabel: string
  osStackValue: string
  osStackSub: string
  osCtaPrimary: string
  osCtaSecondary: string

  // CTA
  ctaTitleA: string
  ctaTitleAccent: string
  ctaSubtitle: string

  // Footer
  footerDesc: string
  footerProduct: string
  footerResources: string
  footerCommunity: string
  footerRights: string
  footerOperational: string

  // Footer links
  fProductDashboard: string
  fProductFeatures: string
  fProductHow: string
  fProductCompare: string
  fResourcesGitHub: string
  fResourcesDocs: string
  fResourcesSDK: string
  fResourcesRoadmap: string
  fCommContribute: string
  fCommIssues: string
  fCommDiscussions: string
  fCommLicense: string
}

export const dictionaries: Record<Locale, Strings> = {
  en: {
    navFeatures: "Features",
    navHow: "How it works",
    navCompare: "Compare",
    navGitHub: "GitHub",
    navStar: "Star",
    navOpenDashboard: "Open Dashboard",

    heroBadge: "Open-source · MIT · alpha",
    heroTitleA: "Let every AI product",
    heroTitleAccent: "tell you",
    heroTitleB: "where it went wrong",
    heroSubtitle:
      "SmartLoop is the unified quality platform for AI products — ",
    heroSubtitleEmphasis: "one SDK call",
    heroSubtitleSecond:
      ", auto-scoring, bad-case clustering, regression tests, live alerts. Sentry for AI agents. Self-hostable. MIT-licensed.",
    heroCtaPrimary: "Open Dashboard",
    heroCtaSecondary: "Star on GitHub",
    heroFinePrint: "self-host in 5 minutes · 3-line SDK · plug any LLM",

    liveLabel: "Live",
    livePreviewEvents: "smartloop.events",

    socialProofEyebrow: "Built for AI teams · Self-hostable · Pluggable LLM backend",
    socialProof1Title: "3-line integration",
    socialProof1Desc: "One import, one constructor, one log() call.",
    socialProof2Title: "Self-host or cloud",
    socialProof2Desc: "Run on your own infra with one docker compose up.",
    socialProof3Title: "Pluggable judge model",
    socialProof3Desc: "OpenAI, Anthropic, Qwen, your own — interchange.",
    socialProof4Title: "Alerts that actually fire",
    socialProof4Desc: "DingTalk · Slack · Telegram · Lark · webhook.",

    whyEyebrow: "Why SmartLoop",
    whyTitle: "AI product quality,",
    whyTitleAccent: "treated like a first-class concern.",

    judgeEyebrow: "LLM-as-Judge",
    judgeTitle: "Every reply, auto-scored.",
    judgeBody:
      "0–5 across four dimensions (accuracy / helpfulness / safety / style) plus tag classification, with reasoning. Swap the judge model anytime (qwen3-max / gpt-4o / claude-sonnet).",
    judgeReasoning: "Reasoning:",

    clusterEyebrow: "Bad case clustering",
    clusterTitle: "Failures don't disappear into spreadsheets.",
    clusterBody:
      "Low-score and thumbs-down events are auto-grouped into recurring patterns (hallucination, format, latency, multilingual, off-topic). Each cluster surfaces trends, examples, and a suggested fix.",

    regressionEyebrow: "Regression testing",
    regressionTitle: "Changing prompts? Run regression first.",
    regressionBody:
      "Each product maintains a golden case set. One click runs your new prompt against the suite — pass-rate diff makes regressions impossible to miss.",
    regressionPassRate: "pass rate",
    regressionTestedAgainst: "Tested against",

    alertsEyebrow: "Real-time alerts",
    alertsTitle: "The right person hears about issues — instantly.",
    alertsBody:
      "Hallucination cluster spikes 24h → DingTalk fires with auto root-cause hints. Rules are configurable, channels pluggable.",
    alertsAlertTitle: "Hallucination spike",

    featuresEyebrow: "Features",
    featuresTitle: "One platform, every quality concern.",
    feature1Title: "3-line SDK",
    feature1Desc: "Async batched. Zero blocking. Node today; Python / PHP / Go next.",
    feature2Title: "LLM-as-Judge",
    feature2Desc: "Auto-score every event on 4 dimensions, plus tag classification.",
    feature3Title: "Bad-case clusters",
    feature3Desc: "Embedding-based DBSCAN clusters surface recurring failure modes.",
    feature4Title: "Regression suite",
    feature4Desc: "Golden cases per product. One click runs new prompt, shows diff.",
    feature5Title: "Cross-channel alerts",
    feature5Desc: "DingTalk, Slack, Telegram, Lark, generic webhook — pick yours.",
    feature6Title: "Live dashboard",
    feature6Desc: "Cross-product health, recent events, spotlight bad cases.",

    howEyebrow: "How it works",
    howTitle: "From event to insight — automatic.",
    how1Title: "Your product emits events",
    how1Body: "One sl.log() call per LLM invocation. Async, batched, never blocks the host.",
    how2Title: "SmartLoop scores + clusters",
    how2Body: "LLM-as-Judge scores each event; embedding clusters group recurring failures.",
    how3Title: "Owners see the truth",
    how3Body: "Live dashboard, regression suite, alert when patterns degrade — all in one place.",

    compareEyebrow: "Compare",
    compareTitle: "How SmartLoop fits next to your other tools.",
    compareSubtitle:
      "We don't replace LangSmith — they trace, we evaluate. We don't replace Sentry — they catch crashes, we catch bad answers.",
    compareColCapability: "Capability",

    osEyebrow: "Open source",
    osTitleA: "MIT-licensed.",
    osTitleAccent: "Yours forever.",
    osBody:
      "One docker compose up and SmartLoop runs on your infra. No data leaves your network. No per-seat pricing. No vendor lock-in. Fork it, modify it, ship it.",
    osLicenseLabel: "License",
    osLicenseSub: "Free to use commercially",
    osSelfHostLabel: "Self-host",
    osSelfHostValue: "5 min",
    osSelfHostSub: "One docker compose up",
    osStackLabel: "Stack",
    osStackValue: "Bun · TS",
    osStackSub: "Hackable, no codegen",
    osCtaPrimary: "Self-host guide",
    osCtaSecondary: "github.com/Binzaga/SmartLoop",

    ctaTitleA: "Ship AI that",
    ctaTitleAccent: "tells the truth.",
    ctaSubtitle:
      "5 minutes from clone to first event. Bring your own LLM, your own infra, your own dashboard.",

    footerDesc: "Open-source quality observation platform for AI products.",
    footerProduct: "Product",
    footerResources: "Resources",
    footerCommunity: "Community",
    footerRights: "© 2026 SmartLoop contributors · MIT",
    footerOperational: "All systems operational",

    fProductDashboard: "Dashboard",
    fProductFeatures: "Features",
    fProductHow: "How it works",
    fProductCompare: "Compare",
    fResourcesGitHub: "GitHub",
    fResourcesDocs: "Docs",
    fResourcesSDK: "SDK",
    fResourcesRoadmap: "Roadmap",
    fCommContribute: "Contribute",
    fCommIssues: "Issues",
    fCommDiscussions: "Discussions",
    fCommLicense: "License (MIT)",
  },
  zh: {
    navFeatures: "功能",
    navHow: "工作原理",
    navCompare: "对比",
    navGitHub: "GitHub",
    navStar: "Star",
    navOpenDashboard: "打开控制台",

    heroBadge: "开源 · MIT · alpha",
    heroTitleA: "让每一个 AI 产品",
    heroTitleAccent: "自己说出",
    heroTitleB: "它哪里错了",
    heroSubtitle: "SmartLoop 是 AI 产品的统一质量平台——",
    heroSubtitleEmphasis: "SDK 一行接入",
    heroSubtitleSecond:
      "，自动评分、差评归类、回归测试、实时告警。Sentry for AI agents。可自托管。MIT 协议。",
    heroCtaPrimary: "打开控制台",
    heroCtaSecondary: "GitHub Star",
    heroFinePrint: "5 分钟自托管 · 3 行 SDK · 任意 LLM",

    liveLabel: "实时",
    livePreviewEvents: "smartloop.events",

    socialProofEyebrow: "为 AI 团队打造 · 可自托管 · LLM 可插拔",
    socialProof1Title: "3 行代码接入",
    socialProof1Desc: "一个 import、一个构造、一个 log() 调用。",
    socialProof2Title: "自托管或云端",
    socialProof2Desc: "一条 docker compose up 跑在你自己的服务器上。",
    socialProof3Title: "Judge 模型可换",
    socialProof3Desc: "OpenAI、Anthropic、Qwen、你自己的 — 随时切换。",
    socialProof4Title: "真能发出的告警",
    socialProof4Desc: "钉钉 · Slack · Telegram · 飞书 · webhook。",

    whyEyebrow: "为什么是 SmartLoop",
    whyTitle: "AI 产品的质量监控，",
    whyTitleAccent: "应该被认真对待。",

    judgeEyebrow: "LLM-as-Judge",
    judgeTitle: "每条 AI 回答，自动评分。",
    judgeBody:
      "四维度评分 0-5（accuracy / helpfulness / safety / style）+ 标签分类 + 可解释 reasoning。Judge 模型可换（qwen3-max / gpt-4o / claude-sonnet）。",
    judgeReasoning: "Reasoning:",

    clusterEyebrow: "差评自动归类",
    clusterTitle: "差评不再石沉大海。",
    clusterBody:
      "低分 + 👎 事件自动归到 5 类 cluster（hallucination / format / latency / multilingual / off-topic）。每个 cluster 都有 trend、典型案例、修复建议。",

    regressionEyebrow: "回归测试",
    regressionTitle: "Prompt 改动？先跑回归。",
    regressionBody:
      "每个产品维护 golden case 集。一键跑新 prompt，对比通过率，确保改动不引入回归。",
    regressionPassRate: "通过率",
    regressionTestedAgainst: "测试集",

    alertsEyebrow: "实时告警",
    alertsTitle: "异常瞬间到达对的人。",
    alertsBody:
      "hallucination 类 cluster 24h 飙升 → 钉钉群弹窗 + 自动根因建议。规则可配，通道可选。",
    alertsAlertTitle: "幻觉告警",

    featuresEyebrow: "功能",
    featuresTitle: "一个平台，覆盖所有质量关切。",
    feature1Title: "3 行 SDK",
    feature1Desc: "异步批量，不阻塞主业务。Node 今天可用，Python / PHP / Go 即将。",
    feature2Title: "LLM-as-Judge",
    feature2Desc: "每条事件 4 维自动评分 + 标签分类。",
    feature3Title: "Bad case 聚类",
    feature3Desc: "Embedding + DBSCAN 自动发现失败模式。",
    feature4Title: "回归测试套",
    feature4Desc: "每个产品自带 golden case，一键跑新 prompt 看 diff。",
    feature5Title: "全渠道告警",
    feature5Desc: "钉钉、Slack、Telegram、飞书、自定义 webhook — 任选。",
    feature6Title: "实时仪表盘",
    feature6Desc: "跨产品健康分、最近事件、bad case 聚光灯。",

    howEyebrow: "工作原理",
    howTitle: "从事件到洞察，全自动。",
    how1Title: "你的产品上报事件",
    how1Body: "每次 LLM 调用配一行 sl.log()。异步、批量、永不阻塞。",
    how2Title: "SmartLoop 评分 + 归类",
    how2Body: "LLM-as-Judge 评分；embedding 聚类发现重复故障模式。",
    how3Title: "Owner 看见真相",
    how3Body: "实时仪表盘、回归测试、模式退化告警——一处搞定。",

    compareEyebrow: "对比",
    compareTitle: "SmartLoop 和你已有工具的关系。",
    compareSubtitle:
      "我们不替代 LangSmith — 他们追踪，我们评测。我们不替代 Sentry — 他们抓崩溃，我们抓错答。",
    compareColCapability: "能力",

    osEyebrow: "开源",
    osTitleA: "MIT 协议。",
    osTitleAccent: "永远归你。",
    osBody:
      "一条 docker compose up，SmartLoop 跑在你自己的服务器上。数据不离开你的内网，没有按席位计费，没有厂商绑定。Fork 它、改它、上线它。",
    osLicenseLabel: "协议",
    osLicenseSub: "可自由商用",
    osSelfHostLabel: "自托管",
    osSelfHostValue: "5 分钟",
    osSelfHostSub: "一条 docker compose up",
    osStackLabel: "技术栈",
    osStackValue: "Bun · TS",
    osStackSub: "可改可 hack，无 codegen",
    osCtaPrimary: "自托管指南",
    osCtaSecondary: "github.com/Binzaga/SmartLoop",

    ctaTitleA: "让你的 AI",
    ctaTitleAccent: "说真话。",
    ctaSubtitle:
      "5 分钟从 clone 到第一条事件。自带 LLM，自带服务器，自带仪表盘。",

    footerDesc: "AI 产品的开源质量观测平台。",
    footerProduct: "产品",
    footerResources: "资源",
    footerCommunity: "社区",
    footerRights: "© 2026 SmartLoop 贡献者 · MIT",
    footerOperational: "服务正常运行",

    fProductDashboard: "Dashboard",
    fProductFeatures: "功能",
    fProductHow: "工作原理",
    fProductCompare: "对比",
    fResourcesGitHub: "GitHub",
    fResourcesDocs: "文档",
    fResourcesSDK: "SDK",
    fResourcesRoadmap: "路线图",
    fCommContribute: "贡献",
    fCommIssues: "Issues",
    fCommDiscussions: "Discussions",
    fCommLicense: "License (MIT)",
  },
}

export function getStrings(locale: Locale): Strings {
  return dictionaries[locale] ?? dictionaries.en
}
