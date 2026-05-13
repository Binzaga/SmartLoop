import Link from "next/link"
import { BrandMark } from "@/components/BrandMark"
import {
  IconActivity,
  IconAlert,
  IconArrowRight,
  IconBolt,
  IconBrain,
  IconChart,
  IconCheck,
  IconClock,
  IconHeart,
  IconRobot,
  IconShield,
  IconSparkle,
  IconThumbsDown,
} from "@/components/icons"

// ============================================================================
// Marketing landing — patterns borrowed from LangSmith / Braintrust / Helicone
// ============================================================================

export default function Landing() {
  return (
    <>
      <MarketingNav />
      <main className="overflow-x-hidden">
        <Hero />
        <SocialProofStrip />
        <CodeIntegrationSection />
        <FeatureGrid />
        <HowItWorks />
        <ComparisonSection />
        <OpenSourceSection />
        <CTASection />
      </main>
      <MarketingFooter />
    </>
  )
}

// ============================================================================
// Top nav (marketing)
// ============================================================================

function MarketingNav() {
  return (
    <header className="sl-glass sticky top-0 z-30 border-b border-border-soft">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
        <Link href="/" className="flex items-center gap-2.5">
          <BrandMark size={28} />
          <span className="text-[17px] font-semibold tracking-tight">SmartLoop</span>
        </Link>
        <nav className="hidden items-center gap-7 md:flex">
          <Link href="#features" className="text-sm text-text-secondary hover:text-text-primary">
            Features
          </Link>
          <Link href="#how" className="text-sm text-text-secondary hover:text-text-primary">
            How it works
          </Link>
          <Link href="#compare" className="text-sm text-text-secondary hover:text-text-primary">
            Compare
          </Link>
          <Link
            href="https://github.com/Binzaga/SmartLoop"
            target="_blank"
            className="text-sm text-text-secondary hover:text-text-primary"
          >
            GitHub
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="https://github.com/Binzaga/SmartLoop"
            target="_blank"
            className="hidden items-center gap-1.5 rounded-lg border border-border-soft bg-bg-elev-1 px-3 py-1.5 text-xs text-text-secondary hover:border-border md:inline-flex"
          >
            <IconGitHub />
            Star
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-br from-accent-from to-accent-to px-3.5 py-1.5 text-xs font-medium text-bg-base"
          >
            Open Dashboard
            <IconArrowRight size={11} />
          </Link>
        </div>
      </div>
    </header>
  )
}

// ============================================================================
// Hero — big headline + code snippet preview
// ============================================================================

function Hero() {
  return (
    <section className="relative">
      {/* Background grid + glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--color-border-soft) 1px, transparent 1px), linear-gradient(to bottom, var(--color-border-soft) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          maskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, black 30%, transparent 80%)",
        }}
      />

      <div className="relative mx-auto max-w-6xl px-6 pb-20 pt-20 md:pb-28 md:pt-28">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border-soft bg-bg-elev-1 px-3.5 py-1.5 sl-fade-in">
            <span className="relative flex h-1.5 w-1.5">
              <span className="sl-pulse absolute inline-flex h-full w-full rounded-full bg-emerald-400" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </span>
            <span className="text-[11px] uppercase tracking-[0.18em] text-text-secondary">
              Open-source · MIT · alpha
            </span>
          </div>

          <h1
            className="text-[44px] font-semibold leading-[1.05] tracking-tight sl-fade-in md:text-[68px]"
            style={{ animationDelay: "100ms" }}
          >
            让每一个 AI 产品
            <br />
            <span className="sl-gradient-text">自己说出</span> 它哪里错了
          </h1>

          <p
            className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-text-secondary sl-fade-in md:text-lg"
            style={{ animationDelay: "200ms" }}
          >
            SmartLoop 是 AI 产品的统一质量平台——
            <span className="text-text-primary">SDK 一行接入</span>,
            自动评分、差评归类、回归测试、实时告警。
            <br className="hidden md:inline" />
            Sentry for AI agents. Self-hostable. MIT-licensed.
          </p>

          <div
            className="mt-9 flex flex-col items-center justify-center gap-3 sl-fade-in sm:flex-row"
            style={{ animationDelay: "300ms" }}
          >
            <Link
              href="/dashboard"
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-gradient-to-br from-accent-from to-accent-to px-6 text-sm font-medium text-bg-base shadow-lg shadow-accent-from/25 transition hover:shadow-accent-from/40"
            >
              Open Dashboard
              <IconArrowRight size={14} />
            </Link>
            <Link
              href="https://github.com/Binzaga/SmartLoop"
              target="_blank"
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-border-soft bg-bg-elev-1 px-5 text-sm text-text-secondary hover:border-border hover:text-text-primary"
            >
              <IconGitHub />
              Star on GitHub
            </Link>
          </div>

          <p
            className="mt-5 text-[11px] uppercase tracking-widest text-text-tertiary sl-fade-in"
            style={{ animationDelay: "400ms" }}
          >
            self-host in 5 minutes · 3-line SDK · plug any LLM
          </p>
        </div>

        {/* Hero visual: code snippet + score preview */}
        <div
          className="mt-16 sl-fade-in"
          style={{ animationDelay: "500ms" }}
        >
          <HeroPreview />
        </div>
      </div>
    </section>
  )
}

function HeroPreview() {
  return (
    <div className="relative mx-auto max-w-5xl">
      <div
        aria-hidden
        className="absolute -inset-x-10 -inset-y-20 blur-3xl opacity-40"
        style={{
          background:
            "conic-gradient(from 90deg at 50% 50%, #a78bfa20 0deg, #34d39920 120deg, #818cf820 240deg, #a78bfa20 360deg)",
        }}
      />
      <div className="relative grid grid-cols-1 gap-4 md:grid-cols-5">
        {/* Code snippet card */}
        <div className="sl-card relative md:col-span-3">
          <div className="border-b border-border-soft px-5 py-2.5">
            <div className="flex items-center gap-2 text-[11px] text-text-tertiary">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500/60" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/60" />
              <code className="sl-mono ml-3">crm-agent.ts</code>
            </div>
          </div>
          <pre className="sl-mono overflow-x-auto px-5 py-5 text-[13px] leading-[1.6]">
            <code>
              <span className="text-pink-300">import</span>
              <span className="text-text-primary"> {"{ "}</span>
              <span className="text-emerald-300">SmartLoop</span>
              <span className="text-text-primary"> {"}"} </span>
              <span className="text-pink-300">from</span>
              <span className="text-amber-200"> "@smartloop/sdk"</span>
              {"\n\n"}
              <span className="text-pink-300">const</span>
              <span className="text-text-primary"> sl </span>
              <span className="text-pink-300">=</span>
              <span className="text-text-primary"> </span>
              <span className="text-pink-300">new</span>
              <span className="text-emerald-300"> SmartLoop</span>
              <span className="text-text-primary">({"{"}</span>
              {"\n  "}
              <span className="text-sky-300">apiKey</span>
              <span className="text-text-primary">: process.env.</span>
              <span className="text-text-primary">SMARTLOOP_API_KEY,</span>
              {"\n  "}
              <span className="text-sky-300">product</span>
              <span className="text-text-primary">: </span>
              <span className="text-amber-200">"crm-agent"</span>
              <span className="text-text-primary">,</span>
              {"\n  "}
              <span className="text-sky-300">endpoint</span>
              <span className="text-text-primary">: </span>
              <span className="text-amber-200">"https://smartloop.your.co"</span>
              <span className="text-text-primary">,</span>
              {"\n"}
              <span className="text-text-primary">{"});\n\n"}</span>
              <span className="text-text-tertiary">{"// after your LLM call"}</span>
              {"\n"}
              <span className="text-text-primary">sl.</span>
              <span className="text-emerald-300">log</span>
              <span className="text-text-primary">({"{"}</span>
              {"\n  "}
              <span className="text-sky-300">input</span>
              <span className="text-text-primary">: userMessage,</span>
              {"\n  "}
              <span className="text-sky-300">output</span>
              <span className="text-text-primary">: aiReply,</span>
              {"\n  "}
              <span className="text-sky-300">model</span>
              <span className="text-text-primary">: </span>
              <span className="text-amber-200">"gpt-4o"</span>
              <span className="text-text-primary">,</span>
              {"\n  "}
              <span className="text-sky-300">tokens</span>
              <span className="text-text-primary">: {"{ input: 1000, output: 200 }"},</span>
              {"\n  "}
              <span className="text-sky-300">latencyMs</span>
              <span className="text-text-primary">: 1500,</span>
              {"\n"}
              <span className="text-text-primary">{"});"}</span>
            </code>
          </pre>
        </div>

        {/* Live event preview card */}
        <div className="sl-card md:col-span-2">
          <div className="border-b border-border-soft px-5 py-2.5">
            <div className="flex items-center justify-between text-[11px] text-text-tertiary">
              <span className="inline-flex items-center gap-1.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="sl-pulse absolute inline-flex h-full w-full rounded-full bg-emerald-400" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                </span>
                <span className="uppercase tracking-wider">Live</span>
              </span>
              <code className="sl-mono">smartloop.events</code>
            </div>
          </div>
          <div className="space-y-3 px-5 py-5">
            <PreviewEvent
              tone="bad"
              tags={["hallucination"]}
              score={2}
              line='"昨天哪些会话没回复？" → AI 编造了具体客户名…'
            />
            <PreviewEvent
              tone="good"
              tags={["good"]}
              score={5}
              line='"Kevin 处理了多少会话？" → 28（来自工具调用）'
            />
            <PreviewEvent
              tone="warn"
              tags={["too_short"]}
              score={3}
              line='"早上好" → "早上好！"'
            />
            <PreviewEvent
              tone="bad"
              tags={["multilingual_drift"]}
              score={2}
              line='"تتبع رقم #123" → 回复了中文（应阿拉伯）'
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function PreviewEvent({
  tone,
  tags,
  score,
  line,
}: {
  tone: "good" | "warn" | "bad"
  tags: string[]
  score: number
  line: string
}) {
  const scoreColor =
    tone === "good"
      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
      : tone === "warn"
        ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
        : "border-red-500/30 bg-red-500/10 text-red-300"
  const tagColor =
    tone === "good"
      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
      : tone === "warn"
        ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
        : "border-red-500/30 bg-red-500/10 text-red-300"
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border-soft bg-bg-elev-2/40 p-3">
      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold tabular-nums ${scoreColor}`}
      >
        {score}
      </span>
      <div className="min-w-0">
        <p className="truncate text-[12px] text-text-primary">{line}</p>
        <div className="mt-1.5 flex flex-wrap gap-1">
          {tags.map((t) => (
            <span
              key={t}
              className={`inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] font-medium ${tagColor}`}
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Social proof strip
// ============================================================================

function SocialProofStrip() {
  return (
    <section className="border-y border-border-soft py-8">
      <div className="mx-auto max-w-6xl px-6">
        <p className="mb-5 text-center text-[10px] uppercase tracking-[0.2em] text-text-tertiary">
          Built for AI teams · Self-hostable · Pluggable LLM backend
        </p>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          <ProofTile icon={<IconBolt size={16} />} title="3-line integration" desc="One import, one constructor, one log() call." />
          <ProofTile icon={<IconShield size={16} />} title="Self-host or cloud" desc="Run on your own infra with one docker compose up." />
          <ProofTile icon={<IconBrain size={16} />} title="Pluggable judge model" desc="OpenAI, Anthropic, Qwen, your own — interchange." />
          <ProofTile icon={<IconAlert size={16} />} title="Alerts that actually fire" desc="DingTalk · Slack · Telegram · 飞书 · webhook." />
        </div>
      </div>
    </section>
  )
}

function ProofTile({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode
  title: string
  desc: string
}) {
  return (
    <div>
      <div className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border-soft bg-bg-elev-1 text-accent-from">
        {icon}
      </div>
      <p className="text-sm font-medium">{title}</p>
      <p className="mt-1 text-[12px] leading-relaxed text-text-tertiary">{desc}</p>
    </div>
  )
}

// ============================================================================
// "Why SmartLoop" — code-snippet-driven feature section
// ============================================================================

function CodeIntegrationSection() {
  return (
    <section id="features" className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-12 text-center">
          <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-text-tertiary">
            Why SmartLoop
          </p>
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
            AI 产品的质量监控,
            <br className="md:hidden" /> <span className="sl-gradient-text">该被认真对待。</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
          <FeatureBlock
            eyebrow="LLM-as-Judge"
            title="每条 AI 回答,自动评分。"
            body="按 accuracy / helpfulness / safety / style 四维打 0-5 分,加可解释的 reasoning。Judge 模型可换(qwen3-max / gpt-4o / claude-sonnet)。"
            visual={<JudgeVisual />}
          />
          <FeatureBlock
            eyebrow="Bad case clustering"
            title="差评不再石沉大海。"
            body="低分 + 👎 事件自动归到 5 类 cluster(hallucination / format / latency / multilingual / off-topic)。每个 cluster 有 trend、典型案例、修复建议。"
            visual={<ClusterVisual />}
          />
          <FeatureBlock
            eyebrow="Regression testing"
            title="Prompt 改动?先跑回归。"
            body="每个产品维护 golden case 集。一键跑新 prompt,自动对比通过率,确保改动不引入回归。"
            visual={<RegressionVisual />}
          />
          <FeatureBlock
            eyebrow="Real-time alerts"
            title="异常瞬间到达对的人。"
            body="hallucination 类 cluster 24h 飙升 → 钉钉群弹窗 + 自动根因建议。规则可配,通道可选。"
            visual={<AlertVisual />}
          />
        </div>
      </div>
    </section>
  )
}

function FeatureBlock({
  eyebrow,
  title,
  body,
  visual,
}: {
  eyebrow: string
  title: string
  body: string
  visual: React.ReactNode
}) {
  return (
    <div className="sl-card sl-card-hover p-7">
      <p className="text-[10px] uppercase tracking-[0.2em] text-accent-from">{eyebrow}</p>
      <h3 className="mt-2 text-xl font-semibold tracking-tight">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-text-secondary">{body}</p>
      <div className="mt-5">{visual}</div>
    </div>
  )
}

function JudgeVisual() {
  return (
    <div className="rounded-xl border border-border-soft bg-bg-elev-2/60 p-4">
      <div className="space-y-2 text-[12px]">
        <ScoreBar label="accuracy" score={4} />
        <ScoreBar label="helpfulness" score={5} />
        <ScoreBar label="safety" score={5} />
        <ScoreBar label="style" score={3} />
      </div>
      <p className="mt-3 text-[11px] text-text-tertiary">
        Reasoning: <span className="text-text-secondary">回答数据准确,语气稍冗长,可压到 100 字内</span>
      </p>
    </div>
  )
}

function ScoreBar({ label, score }: { label: string; score: number }) {
  const pct = (score / 5) * 100
  const tone = score >= 4 ? "from-emerald-500 to-emerald-400" : score >= 3 ? "from-amber-500 to-amber-400" : "from-red-500 to-red-400"
  return (
    <div className="flex items-center gap-3">
      <span className="w-20 text-text-tertiary">{label}</span>
      <div className="relative flex-1 overflow-hidden rounded-full bg-bg-elev-3" style={{ height: 6 }}>
        <div className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${tone}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-3 text-right tabular-nums text-text-primary">{score}</span>
    </div>
  )
}

function ClusterVisual() {
  const clusters = [
    { name: "Hallucination", count: 23, tone: "bg-red-500" },
    { name: "Too long", count: 12, tone: "bg-amber-500" },
    { name: "Wrong language", count: 8, tone: "bg-indigo-500" },
    { name: "Format violation", count: 5, tone: "bg-amber-500" },
    { name: "Off topic", count: 3, tone: "bg-text-quaternary" },
  ]
  const total = clusters.reduce((s, c) => s + c.count, 0)
  return (
    <div className="rounded-xl border border-border-soft bg-bg-elev-2/60 p-4">
      <div className="flex h-2 overflow-hidden rounded-full bg-bg-elev-3">
        {clusters.map((c) => (
          <div key={c.name} className={c.tone} style={{ width: `${(c.count / total) * 100}%` }} />
        ))}
      </div>
      <div className="mt-3 space-y-1.5">
        {clusters.map((c) => (
          <div key={c.name} className="flex items-center justify-between text-[12px]">
            <span className="inline-flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${c.tone}`} />
              <span className="text-text-secondary">{c.name}</span>
            </span>
            <span className="tabular-nums text-text-tertiary">{c.count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function RegressionVisual() {
  return (
    <div className="rounded-xl border border-border-soft bg-bg-elev-2/60 p-4">
      <div className="mb-3 flex items-center justify-between text-[11px] text-text-tertiary">
        <span className="sl-mono">prompt v3.1 → v3.2</span>
        <span className="inline-flex items-center gap-1 text-emerald-400">
          <IconArrowRight size={11} />
          +25%
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-text-tertiary">v3.1</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-red-400">67%</p>
          <p className="text-[10px] text-text-tertiary">pass rate</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-text-tertiary">v3.2</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-emerald-400">92%</p>
          <p className="text-[10px] text-text-tertiary">pass rate</p>
        </div>
      </div>
      <p className="mt-3 text-[11px] text-text-tertiary">
        Tested against <span className="text-text-secondary">50 golden cases</span> · 4.2s
      </p>
    </div>
  )
}

function AlertVisual() {
  return (
    <div className="rounded-xl border border-border-soft bg-bg-elev-2/60 p-4">
      <div className="flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-500/[0.06] p-3">
        <IconAlert size={14} className="mt-0.5 text-red-400 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-[12px] font-medium text-red-300">Hallucination spike</p>
          <p className="mt-0.5 text-[11px] text-text-secondary">
            crm-agent · 24h: <span className="text-red-300">23</span> (yesterday: 5)
          </p>
          <p className="mt-2 text-[10px] text-text-tertiary">
            Suspected: prompt v3.2 removed "only cite context"
          </p>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Feature grid
// ============================================================================

function FeatureGrid() {
  const features = [
    {
      icon: <IconBolt size={18} />,
      title: "3-line SDK",
      desc: "Async batched. Zero blocking. Node today; Python / PHP / Go next.",
    },
    {
      icon: <IconBrain size={18} />,
      title: "LLM-as-Judge",
      desc: "Auto-score every event on 4 dimensions, plus tag classification.",
    },
    {
      icon: <IconChart size={18} />,
      title: "Bad-case clusters",
      desc: "Embedding-based DBSCAN clusters surface recurring failure modes.",
    },
    {
      icon: <IconCheck size={18} />,
      title: "Regression suite",
      desc: "Golden cases per product. One click runs new prompt, shows diff.",
    },
    {
      icon: <IconAlert size={18} />,
      title: "Cross-channel alerts",
      desc: "DingTalk, Slack, Telegram, 飞书, generic webhook — pick yours.",
    },
    {
      icon: <IconActivity size={18} />,
      title: "Live dashboard",
      desc: "Cross-product health, recent events, spotlight bad cases.",
    },
  ]
  return (
    <section className="border-t border-border-soft py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-12 text-center">
          <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-text-tertiary">Features</p>
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
            One platform, every quality concern.
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="sl-card sl-card-hover p-6">
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border-soft bg-bg-elev-2 text-accent-from">
                {f.icon}
              </div>
              <h3 className="text-base font-semibold tracking-tight">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ============================================================================
// How it works
// ============================================================================

function HowItWorks() {
  return (
    <section id="how" className="border-t border-border-soft py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-14 text-center">
          <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-text-tertiary">How it works</p>
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
            From event to insight — automatic.
          </h2>
        </div>

        <div className="relative grid grid-cols-1 gap-8 md:grid-cols-3">
          <Step
            n={1}
            title="Your product emits events"
            body="One sl.log() call per LLM invocation. Async, batched, never blocks the host."
          />
          <Step
            n={2}
            title="SmartLoop scores + clusters"
            body="LLM-as-Judge scores each event; embedding clusters group recurring failures."
          />
          <Step
            n={3}
            title="Owners see the truth"
            body="Live dashboard, regression suite, alert when patterns degrade — all in one place."
          />
        </div>
      </div>
    </section>
  )
}

function Step({ n, title, body }: { n: number; title: string; body: string }) {
  return (
    <div className="relative">
      <div className="mb-5 inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-bg-elev-1 text-base font-semibold tabular-nums sl-gradient-text">
        {String(n).padStart(2, "0")}
      </div>
      <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-text-secondary">{body}</p>
    </div>
  )
}

// ============================================================================
// Compare with LangSmith / Braintrust / Helicone
// ============================================================================

function ComparisonSection() {
  return (
    <section id="compare" className="border-t border-border-soft py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-12 text-center">
          <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-text-tertiary">Compare</p>
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
            How SmartLoop fits next to your other tools.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-text-secondary">
            We don't replace LangSmith — they trace, we evaluate. We don't replace Sentry — they catch crashes, we catch bad answers.
          </p>
        </div>

        <div className="sl-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-border-soft bg-bg-elev-2/40 text-left text-[10px] uppercase tracking-[0.18em] text-text-tertiary">
              <tr>
                <th className="px-5 py-4 font-medium">Capability</th>
                <th className="px-5 py-4 font-medium">LangSmith</th>
                <th className="px-5 py-4 font-medium">Braintrust</th>
                <th className="px-5 py-4 font-medium">Helicone</th>
                <th className="px-5 py-4 font-medium text-accent-from">SmartLoop</th>
              </tr>
            </thead>
            <tbody>
              <CompareRow
                feature="Trace tree (parent / child)"
                a={true} b={true} c={true} sl={false}
                note="Built for: orchestration debug"
              />
              <CompareRow
                feature="Bad-case auto-clustering"
                a={false} b="partial" c={false} sl={true}
                note="Recurring failure patterns"
              />
              <CompareRow
                feature="Regression suite (golden cases)"
                a="partial" b={true} c={false} sl={true}
                note="Prompt change → pass rate diff"
              />
              <CompareRow
                feature="Cross-channel alerting"
                a={false} b={false} c="partial" sl={true}
                note="DingTalk / Slack / Telegram / 飞书"
              />
              <CompareRow
                feature="Open-source core"
                a={false} b={false} c={true} sl={true}
                note="MIT-licensed, self-hostable"
              />
              <CompareRow
                feature="Built for product owners, not devs"
                a={false} b={false} c={false} sl={true}
                note="UI for PM / ops, not engineers"
              />
              <CompareRow
                feature="i18n quality flags"
                a={false} b={false} c={false} sl={true}
                note="Multi-language drift detection"
              />
              <CompareRow
                feature="Custom judge model"
                a={true} b={true} c={false} sl={true}
                note="GPT / Claude / Qwen / your own"
              />
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

function CompareRow({
  feature,
  a, b, c, sl,
  note,
}: {
  feature: string
  a: boolean | "partial"
  b: boolean | "partial"
  c: boolean | "partial"
  sl: boolean | "partial"
  note?: string
}) {
  return (
    <tr className="border-t border-border-soft">
      <td className="px-5 py-3.5 align-top">
        <p className="font-medium text-text-primary">{feature}</p>
        {note && <p className="mt-0.5 text-[11px] text-text-tertiary">{note}</p>}
      </td>
      <td className="px-5 py-3.5 align-top"><Mark v={a} /></td>
      <td className="px-5 py-3.5 align-top"><Mark v={b} /></td>
      <td className="px-5 py-3.5 align-top"><Mark v={c} /></td>
      <td className="px-5 py-3.5 align-top"><Mark v={sl} highlight /></td>
    </tr>
  )
}

function Mark({ v, highlight }: { v: boolean | "partial"; highlight?: boolean }) {
  if (v === true) {
    return (
      <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full ${highlight ? "bg-emerald-500/15 text-emerald-300" : "bg-bg-elev-2 text-emerald-400"}`}>
        <IconCheck size={12} />
      </span>
    )
  }
  if (v === "partial") {
    return (
      <span className="inline-flex h-6 items-center rounded-full bg-amber-500/10 px-2 text-[10px] font-medium uppercase tracking-wider text-amber-300">
        partial
      </span>
    )
  }
  return <span className="text-text-quaternary">—</span>
}

// ============================================================================
// Open source section
// ============================================================================

function OpenSourceSection() {
  return (
    <section className="border-t border-border-soft py-24">
      <div className="mx-auto max-w-5xl px-6 text-center">
        <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-text-tertiary">Open source</p>
        <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
          MIT-licensed. <span className="sl-gradient-text">Yours forever.</span>
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-text-secondary">
          One docker compose up and SmartLoop runs on your infra. No data leaves your network. No per-seat pricing. No vendor lock-in. Fork it, modify it, ship it.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
          <StatCard label="License" value="MIT" sub="Free to use commercially" />
          <StatCard label="Self-host" value="5 min" sub="One docker compose up" />
          <StatCard label="Stack" value="Bun · TS" sub="Hackable, no codegen" />
        </div>

        <div className="mt-10 flex justify-center gap-3">
          <Link
            href="https://github.com/Binzaga/SmartLoop"
            target="_blank"
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-border-soft bg-bg-elev-1 px-5 text-sm hover:border-border"
          >
            <IconGitHub />
            github.com/Binzaga/SmartLoop
          </Link>
          <Link
            href="https://github.com/Binzaga/SmartLoop/blob/main/docs/DEVELOPMENT.md"
            target="_blank"
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-gradient-to-br from-accent-from to-accent-to px-5 text-sm font-medium text-bg-base"
          >
            Self-host guide
            <IconArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  )
}

function StatCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="sl-card p-6 text-left">
      <p className="text-[10px] uppercase tracking-[0.2em] text-text-tertiary">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight sl-gradient-text">{value}</p>
      <p className="mt-1 text-[12px] text-text-tertiary">{sub}</p>
    </div>
  )
}

// ============================================================================
// CTA
// ============================================================================

function CTASection() {
  return (
    <section className="border-t border-border-soft py-24">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <h2 className="text-3xl font-semibold tracking-tight md:text-5xl">
          Ship AI that <span className="sl-gradient-text">tells the truth.</span>
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-sm text-text-secondary">
          5 minutes from clone to first event. Bring your own LLM, your own infra, your own dashboard.
        </p>
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/dashboard"
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-gradient-to-br from-accent-from to-accent-to px-6 text-sm font-medium text-bg-base shadow-lg shadow-accent-from/25"
          >
            Open Dashboard
            <IconArrowRight size={14} />
          </Link>
          <Link
            href="https://github.com/Binzaga/SmartLoop"
            target="_blank"
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-border-soft bg-bg-elev-1 px-5 text-sm text-text-secondary hover:border-border hover:text-text-primary"
          >
            <IconGitHub />
            View on GitHub
          </Link>
        </div>
      </div>
    </section>
  )
}

// ============================================================================
// Footer
// ============================================================================

function MarketingFooter() {
  return (
    <footer className="border-t border-border-soft py-12">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-6 md:grid-cols-4">
        <div className="col-span-2 md:col-span-1">
          <Link href="/" className="flex items-center gap-2">
            <BrandMark size={20} />
            <span className="text-sm font-semibold">SmartLoop</span>
          </Link>
          <p className="mt-3 text-[12px] leading-relaxed text-text-tertiary">
            Open-source quality observation platform for AI products.
          </p>
        </div>

        <FooterCol
          title="Product"
          links={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Features", href: "#features" },
            { label: "How it works", href: "#how" },
            { label: "Compare", href: "#compare" },
          ]}
        />
        <FooterCol
          title="Resources"
          links={[
            { label: "GitHub", href: "https://github.com/Binzaga/SmartLoop", external: true },
            { label: "Docs", href: "https://github.com/Binzaga/SmartLoop/tree/main/docs", external: true },
            { label: "SDK", href: "https://github.com/Binzaga/SmartLoop/blob/main/docs/SDK.md", external: true },
            { label: "Roadmap", href: "https://github.com/Binzaga/SmartLoop/blob/main/docs/ROADMAP.md", external: true },
          ]}
        />
        <FooterCol
          title="Community"
          links={[
            { label: "Contribute", href: "https://github.com/Binzaga/SmartLoop/blob/main/CONTRIBUTING.md", external: true },
            { label: "Issues", href: "https://github.com/Binzaga/SmartLoop/issues", external: true },
            { label: "Discussions", href: "https://github.com/Binzaga/SmartLoop/discussions", external: true },
            { label: "License (MIT)", href: "https://github.com/Binzaga/SmartLoop/blob/main/LICENSE", external: true },
          ]}
        />
      </div>

      <div className="mx-auto mt-10 max-w-6xl border-t border-border-soft px-6 pt-6">
        <div className="flex flex-col items-start justify-between gap-3 text-[11px] text-text-tertiary md:flex-row md:items-center">
          <span>© 2026 SmartLoop contributors · MIT</span>
          <span className="inline-flex items-center gap-1.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="sl-pulse absolute inline-flex h-full w-full rounded-full bg-emerald-400" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </span>
            All systems operational
          </span>
        </div>
      </div>
    </footer>
  )
}

function FooterCol({
  title,
  links,
}: {
  title: string
  links: { label: string; href: string; external?: boolean }[]
}) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.18em] text-text-tertiary">{title}</p>
      <ul className="mt-3 space-y-2">
        {links.map((l) => (
          <li key={l.label}>
            <Link
              href={l.href}
              target={l.external ? "_blank" : undefined}
              className="text-[13px] text-text-secondary hover:text-text-primary"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ============================================================================
// Inline GitHub icon (24px)
// ============================================================================

function IconGitHub({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2.2c-3.3.7-4-1.6-4-1.6-.5-1.4-1.3-1.8-1.3-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-6 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.7.2 2.9.1 3.2.7.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3" />
    </svg>
  )
}
