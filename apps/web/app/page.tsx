import Link from "next/link"
import { BrandMark } from "@/components/BrandMark"
import {
  IconActivity,
  IconAlert,
  IconArrowRight,
  IconBolt,
  IconBrain,
  IconCheck,
  IconChart,
  IconRobot,
  IconShield,
  IconSparkle,
} from "@/components/icons"
import { getStrings, type Locale, type Strings } from "@/lib/i18n"

export const dynamic = "force-dynamic"

// ============================================================================
// Marketing landing — supports ?lang=en | zh
// ============================================================================

export default async function Landing(props: {
  searchParams: Promise<{ lang?: string }>
}) {
  const sp = await props.searchParams
  const locale: Locale = sp.lang === "zh" ? "zh" : "en"
  const t = getStrings(locale)
  return (
    <>
      <MarketingNav t={t} locale={locale} />
      <main className="overflow-x-hidden">
        <Hero t={t} locale={locale} />
        <SocialProofStrip t={t} />
        <CodeIntegrationSection t={t} />
        <FeatureGrid t={t} />
        <HowItWorks t={t} />
        <ComparisonSection t={t} locale={locale} />
        <OpenSourceSection t={t} />
        <CTASection t={t} locale={locale} />
      </main>
      <MarketingFooter t={t} locale={locale} />
    </>
  )
}

// ============================================================================
// Top nav
// ============================================================================

function MarketingNav({ t, locale }: { t: Strings; locale: Locale }) {
  const otherLocale: Locale = locale === "en" ? "zh" : "en"
  const otherLabel = otherLocale === "zh" ? "中" : "EN"

  return (
    <header className="sl-glass sticky top-0 z-30 border-b border-border-soft">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
        <Link href={withLang("/", locale)} className="flex items-center gap-2.5">
          <BrandMark size={28} />
          <span className="text-[17px] font-semibold tracking-tight">SmartLoop</span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          <Link href="#features" className="text-sm text-text-secondary hover:text-text-primary">
            {t.navFeatures}
          </Link>
          <Link href="#how" className="text-sm text-text-secondary hover:text-text-primary">
            {t.navHow}
          </Link>
          <Link href="#compare" className="text-sm text-text-secondary hover:text-text-primary">
            {t.navCompare}
          </Link>
          <Link
            href="https://github.com/Binzaga/SmartLoop"
            target="_blank"
            className="text-sm text-text-secondary hover:text-text-primary"
          >
            {t.navGitHub}
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {/* Language toggle */}
          <Link
            href={withLang(otherLocale === "zh" ? "/?lang=zh" : "/", otherLocale)}
            className="inline-flex h-7 items-center justify-center rounded-md border border-border-soft bg-bg-elev-1 px-2.5 text-[11px] font-medium text-text-secondary hover:border-border hover:text-text-primary"
            aria-label="Switch language"
          >
            {otherLabel}
          </Link>
          <Link
            href="https://github.com/Binzaga/SmartLoop"
            target="_blank"
            className="hidden items-center gap-1.5 rounded-lg border border-border-soft bg-bg-elev-1 px-3 py-1.5 text-xs text-text-secondary hover:border-border md:inline-flex"
          >
            <IconGitHub />
            {t.navStar}
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-br from-accent-from to-accent-to px-3.5 py-1.5 text-xs font-medium text-bg-base"
          >
            {t.navOpenDashboard}
            <IconArrowRight size={11} />
          </Link>
        </div>
      </div>
    </header>
  )
}

function withLang(path: string, locale: Locale): string {
  if (locale === "en") return path.split("?")[0]
  if (path.includes("?")) return path
  return `${path}?lang=zh`
}

// ============================================================================
// Hero
// ============================================================================

function Hero({ t, locale }: { t: Strings; locale: Locale }) {
  return (
    <section className="relative">
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
              {t.heroBadge}
            </span>
          </div>

          <h1
            className="text-[44px] font-semibold leading-[1.05] tracking-tight sl-fade-in md:text-[64px]"
            style={{ animationDelay: "100ms" }}
          >
            {t.heroTitleA}
            <br />
            <span className="sl-gradient-text">{t.heroTitleAccent}</span>
            {locale === "zh" ? " " : " "}
            {t.heroTitleB}
          </h1>

          <p
            className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-text-secondary sl-fade-in md:text-lg"
            style={{ animationDelay: "200ms" }}
          >
            {t.heroSubtitle}
            <span className="text-text-primary">{t.heroSubtitleEmphasis}</span>
            {t.heroSubtitleSecond}
          </p>

          <div
            className="mt-9 flex flex-col items-center justify-center gap-3 sl-fade-in sm:flex-row"
            style={{ animationDelay: "300ms" }}
          >
            <Link
              href="/dashboard"
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-gradient-to-br from-accent-from to-accent-to px-6 text-sm font-medium text-bg-base shadow-lg shadow-accent-from/25 transition hover:shadow-accent-from/40"
            >
              {t.heroCtaPrimary}
              <IconArrowRight size={14} />
            </Link>
            <Link
              href="https://github.com/Binzaga/SmartLoop"
              target="_blank"
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-border-soft bg-bg-elev-1 px-5 text-sm text-text-secondary hover:border-border hover:text-text-primary"
            >
              <IconGitHub />
              {t.heroCtaSecondary}
            </Link>
          </div>

          <p
            className="mt-5 text-[11px] uppercase tracking-widest text-text-tertiary sl-fade-in"
            style={{ animationDelay: "400ms" }}
          >
            {t.heroFinePrint}
          </p>
        </div>

        <div className="mt-16 sl-fade-in" style={{ animationDelay: "500ms" }}>
          <HeroPreview t={t} locale={locale} />
        </div>
      </div>
    </section>
  )
}

function HeroPreview({ t, locale }: { t: Strings; locale: Locale }) {
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
        <div className="sl-card relative md:col-span-3">
          <div className="border-b border-border-soft px-5 py-2.5">
            <div className="flex items-center gap-2 text-[11px] text-text-tertiary">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500/60" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/60" />
              <code className="sl-mono ml-3">my-agent.ts</code>
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
              <span className="text-text-primary">: process.env.SMARTLOOP_API_KEY,</span>
              {"\n  "}
              <span className="text-sky-300">product</span>
              <span className="text-text-primary">: </span>
              <span className="text-amber-200">"my-agent"</span>
              <span className="text-text-primary">,</span>
              {"\n  "}
              <span className="text-sky-300">endpoint</span>
              <span className="text-text-primary">: </span>
              <span className="text-amber-200">"https://smartloop.your.co"</span>
              <span className="text-text-primary">,</span>
              {"\n"}
              <span className="text-text-primary">{"});\n\n"}</span>
              <span className="text-text-tertiary">
                {locale === "zh"
                  ? "// 你的 LLM 调用后"
                  : "// after your LLM call"}
              </span>
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

        <div className="sl-card md:col-span-2">
          <div className="border-b border-border-soft px-5 py-2.5">
            <div className="flex items-center justify-between text-[11px] text-text-tertiary">
              <span className="inline-flex items-center gap-1.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="sl-pulse absolute inline-flex h-full w-full rounded-full bg-emerald-400" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                </span>
                <span className="uppercase tracking-wider">{t.liveLabel}</span>
              </span>
              <code className="sl-mono">{t.livePreviewEvents}</code>
            </div>
          </div>
          <div className="space-y-3 px-5 py-5">
            <PreviewEvent
              tone="bad"
              tags={["hallucination"]}
              score={2}
              line={
                locale === "zh"
                  ? '"昨天有哪些未回复？" → AI 编造了客户名…'
                  : '"Which orders shipped late?" → AI invented order IDs…'
              }
            />
            <PreviewEvent
              tone="good"
              tags={["good"]}
              score={5}
              line={
                locale === "zh"
                  ? '"Kevin 今天处理了多少？" → 28（来自工具）'
                  : '"How many did Kevin handle?" → 28 (from tool call)'
              }
            />
            <PreviewEvent
              tone="warn"
              tags={["too_short"]}
              score={3}
              line={
                locale === "zh"
                  ? '"早上好" → "早上好！"'
                  : '"Hi" → "Hello!"'
              }
            />
            <PreviewEvent
              tone="bad"
              tags={["multilingual_drift"]}
              score={2}
              line={
                locale === "zh"
                  ? '"تتبع رقم #123" → 回复了中文（应阿语）'
                  : '"تتبع رقم #123" → replied in English (should be ar)'
              }
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

function SocialProofStrip({ t }: { t: Strings }) {
  return (
    <section className="border-y border-border-soft py-8">
      <div className="mx-auto max-w-6xl px-6">
        <p className="mb-5 text-center text-[10px] uppercase tracking-[0.2em] text-text-tertiary">
          {t.socialProofEyebrow}
        </p>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          <ProofTile icon={<IconBolt size={16} />} title={t.socialProof1Title} desc={t.socialProof1Desc} />
          <ProofTile icon={<IconShield size={16} />} title={t.socialProof2Title} desc={t.socialProof2Desc} />
          <ProofTile icon={<IconBrain size={16} />} title={t.socialProof3Title} desc={t.socialProof3Desc} />
          <ProofTile icon={<IconAlert size={16} />} title={t.socialProof4Title} desc={t.socialProof4Desc} />
        </div>
      </div>
    </section>
  )
}

function ProofTile({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
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
// Why SmartLoop section
// ============================================================================

function CodeIntegrationSection({ t }: { t: Strings }) {
  return (
    <section id="features" className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-12 text-center">
          <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-text-tertiary">
            {t.whyEyebrow}
          </p>
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
            {t.whyTitle}
            <br className="md:hidden" /> <span className="sl-gradient-text">{t.whyTitleAccent}</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
          <FeatureBlock
            eyebrow={t.judgeEyebrow}
            title={t.judgeTitle}
            body={t.judgeBody}
            visual={<JudgeVisual reasoningLabel={t.judgeReasoning} t={t} />}
          />
          <FeatureBlock
            eyebrow={t.clusterEyebrow}
            title={t.clusterTitle}
            body={t.clusterBody}
            visual={<ClusterVisual />}
          />
          <FeatureBlock
            eyebrow={t.regressionEyebrow}
            title={t.regressionTitle}
            body={t.regressionBody}
            visual={<RegressionVisual passRateLabel={t.regressionPassRate} testedLabel={t.regressionTestedAgainst} />}
          />
          <FeatureBlock
            eyebrow={t.alertsEyebrow}
            title={t.alertsTitle}
            body={t.alertsBody}
            visual={<AlertVisual title={t.alertsAlertTitle} />}
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

function JudgeVisual({ reasoningLabel, t }: { reasoningLabel: string; t: Strings }) {
  return (
    <div className="rounded-xl border border-border-soft bg-bg-elev-2/60 p-4">
      <div className="space-y-2 text-[12px]">
        <ScoreBar label="accuracy" score={4} />
        <ScoreBar label="helpfulness" score={5} />
        <ScoreBar label="safety" score={5} />
        <ScoreBar label="style" score={3} />
      </div>
      <p className="mt-3 text-[11px] text-text-tertiary">
        {reasoningLabel}{" "}
        <span className="text-text-secondary">
          {t.heroFinePrint.includes("分钟")
            ? "回答数据准确，语气稍冗长。"
            : "Accurate data, slightly verbose tone — could trim to <100 chars."}
        </span>
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

function RegressionVisual({ passRateLabel, testedLabel }: { passRateLabel: string; testedLabel: string }) {
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
          <p className="text-[10px] text-text-tertiary">{passRateLabel}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-text-tertiary">v3.2</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-emerald-400">92%</p>
          <p className="text-[10px] text-text-tertiary">{passRateLabel}</p>
        </div>
      </div>
      <p className="mt-3 text-[11px] text-text-tertiary">
        {testedLabel} <span className="text-text-secondary">50 golden cases</span> · 4.2s
      </p>
    </div>
  )
}

function AlertVisual({ title }: { title: string }) {
  return (
    <div className="rounded-xl border border-border-soft bg-bg-elev-2/60 p-4">
      <div className="flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-500/[0.06] p-3">
        <IconAlert size={14} className="mt-0.5 text-red-400 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-[12px] font-medium text-red-300">{title}</p>
          <p className="mt-0.5 text-[11px] text-text-secondary">
            my-agent · 24h: <span className="text-red-300">23</span> (yesterday: 5)
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

function FeatureGrid({ t }: { t: Strings }) {
  const features = [
    { icon: <IconBolt size={18} />, title: t.feature1Title, desc: t.feature1Desc },
    { icon: <IconBrain size={18} />, title: t.feature2Title, desc: t.feature2Desc },
    { icon: <IconChart size={18} />, title: t.feature3Title, desc: t.feature3Desc },
    { icon: <IconCheck size={18} />, title: t.feature4Title, desc: t.feature4Desc },
    { icon: <IconAlert size={18} />, title: t.feature5Title, desc: t.feature5Desc },
    { icon: <IconActivity size={18} />, title: t.feature6Title, desc: t.feature6Desc },
  ]
  return (
    <section className="border-t border-border-soft py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-12 text-center">
          <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-text-tertiary">{t.featuresEyebrow}</p>
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">{t.featuresTitle}</h2>
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

function HowItWorks({ t }: { t: Strings }) {
  return (
    <section id="how" className="border-t border-border-soft py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-14 text-center">
          <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-text-tertiary">{t.howEyebrow}</p>
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">{t.howTitle}</h2>
        </div>

        <div className="relative grid grid-cols-1 gap-8 md:grid-cols-3">
          <Step n={1} title={t.how1Title} body={t.how1Body} />
          <Step n={2} title={t.how2Title} body={t.how2Body} />
          <Step n={3} title={t.how3Title} body={t.how3Body} />
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
// Compare
// ============================================================================

function ComparisonSection({ t, locale }: { t: Strings; locale: Locale }) {
  const rows: Array<{
    feature: string
    a: boolean | "partial"
    b: boolean | "partial"
    c: boolean | "partial"
    sl: boolean | "partial"
    note: string
  }> = locale === "zh"
    ? [
        { feature: "Trace 树（父子层级）", a: true, b: true, c: true, sl: false, note: "orchestration 调试用" },
        { feature: "差评自动聚类", a: false, b: "partial", c: false, sl: true, note: "重复失败模式" },
        { feature: "回归测试（golden case）", a: "partial", b: true, c: false, sl: true, note: "prompt 改动 → 通过率 diff" },
        { feature: "全渠道告警", a: false, b: false, c: "partial", sl: true, note: "钉钉/Slack/Telegram/飞书" },
        { feature: "核心开源", a: false, b: false, c: true, sl: true, note: "MIT 协议，可自托管" },
        { feature: "面向产品 owner 而非开发者", a: false, b: false, c: false, sl: true, note: "UI 给 PM / 运营，不只是工程师" },
        { feature: "多语言质量标记", a: false, b: false, c: false, sl: true, note: "多语言漂移检测" },
        { feature: "自定义 Judge 模型", a: true, b: true, c: false, sl: true, note: "GPT / Claude / Qwen / 你自己的" },
      ]
    : [
        { feature: "Trace tree (parent / child)", a: true, b: true, c: true, sl: false, note: "Orchestration debug" },
        { feature: "Bad-case auto-clustering", a: false, b: "partial", c: false, sl: true, note: "Recurring failure patterns" },
        { feature: "Regression suite (golden cases)", a: "partial", b: true, c: false, sl: true, note: "Prompt change → pass rate diff" },
        { feature: "Cross-channel alerting", a: false, b: false, c: "partial", sl: true, note: "DingTalk / Slack / Telegram / Lark" },
        { feature: "Open-source core", a: false, b: false, c: true, sl: true, note: "MIT-licensed, self-hostable" },
        { feature: "Built for product owners, not devs", a: false, b: false, c: false, sl: true, note: "UI for PM / ops, not engineers" },
        { feature: "i18n quality flags", a: false, b: false, c: false, sl: true, note: "Multi-language drift detection" },
        { feature: "Custom judge model", a: true, b: true, c: false, sl: true, note: "GPT / Claude / Qwen / your own" },
      ]
  return (
    <section id="compare" className="border-t border-border-soft py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-12 text-center">
          <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-text-tertiary">{t.compareEyebrow}</p>
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">{t.compareTitle}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-text-secondary">{t.compareSubtitle}</p>
        </div>

        <div className="sl-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-border-soft bg-bg-elev-2/40 text-left text-[10px] uppercase tracking-[0.18em] text-text-tertiary">
              <tr>
                <th className="px-5 py-4 font-medium">{t.compareColCapability}</th>
                <th className="px-5 py-4 font-medium">LangSmith</th>
                <th className="px-5 py-4 font-medium">Braintrust</th>
                <th className="px-5 py-4 font-medium">Helicone</th>
                <th className="px-5 py-4 font-medium text-accent-from">SmartLoop</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <CompareRow key={r.feature} {...r} />
              ))}
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
// Open source
// ============================================================================

function OpenSourceSection({ t }: { t: Strings }) {
  return (
    <section className="border-t border-border-soft py-24">
      <div className="mx-auto max-w-5xl px-6 text-center">
        <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-text-tertiary">{t.osEyebrow}</p>
        <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
          {t.osTitleA} <span className="sl-gradient-text">{t.osTitleAccent}</span>
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-text-secondary">{t.osBody}</p>

        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
          <StatCard label={t.osLicenseLabel} value="MIT" sub={t.osLicenseSub} />
          <StatCard label={t.osSelfHostLabel} value={t.osSelfHostValue} sub={t.osSelfHostSub} />
          <StatCard label={t.osStackLabel} value={t.osStackValue} sub={t.osStackSub} />
        </div>

        <div className="mt-10 flex justify-center gap-3">
          <Link
            href="https://github.com/Binzaga/SmartLoop"
            target="_blank"
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-border-soft bg-bg-elev-1 px-5 text-sm hover:border-border"
          >
            <IconGitHub />
            {t.osCtaSecondary}
          </Link>
          <Link
            href="https://github.com/Binzaga/SmartLoop/blob/main/docs/DEVELOPMENT.md"
            target="_blank"
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-gradient-to-br from-accent-from to-accent-to px-5 text-sm font-medium text-bg-base"
          >
            {t.osCtaPrimary}
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

function CTASection({ t, locale }: { t: Strings; locale: Locale }) {
  return (
    <section className="border-t border-border-soft py-24">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <h2 className="text-3xl font-semibold tracking-tight md:text-5xl">
          {t.ctaTitleA} <span className="sl-gradient-text">{t.ctaTitleAccent}</span>
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-sm text-text-secondary">{t.ctaSubtitle}</p>
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/dashboard"
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-gradient-to-br from-accent-from to-accent-to px-6 text-sm font-medium text-bg-base shadow-lg shadow-accent-from/25"
          >
            {t.heroCtaPrimary}
            <IconArrowRight size={14} />
          </Link>
          <Link
            href="https://github.com/Binzaga/SmartLoop"
            target="_blank"
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-border-soft bg-bg-elev-1 px-5 text-sm text-text-secondary hover:border-border hover:text-text-primary"
          >
            <IconGitHub />
            {locale === "zh" ? "在 GitHub 查看" : "View on GitHub"}
          </Link>
        </div>
      </div>
    </section>
  )
}

// ============================================================================
// Footer
// ============================================================================

function MarketingFooter({ t, locale }: { t: Strings; locale: Locale }) {
  return (
    <footer className="border-t border-border-soft py-12">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-6 md:grid-cols-4">
        <div className="col-span-2 md:col-span-1">
          <Link href={withLang("/", locale)} className="flex items-center gap-2">
            <BrandMark size={20} />
            <span className="text-sm font-semibold">SmartLoop</span>
          </Link>
          <p className="mt-3 text-[12px] leading-relaxed text-text-tertiary">{t.footerDesc}</p>
        </div>

        <FooterCol
          title={t.footerProduct}
          links={[
            { label: t.fProductDashboard, href: "/dashboard" },
            { label: t.fProductFeatures, href: withLang("/#features", locale) },
            { label: t.fProductHow, href: withLang("/#how", locale) },
            { label: t.fProductCompare, href: withLang("/#compare", locale) },
          ]}
        />
        <FooterCol
          title={t.footerResources}
          links={[
            { label: t.fResourcesGitHub, href: "https://github.com/Binzaga/SmartLoop", external: true },
            { label: t.fResourcesDocs, href: "https://github.com/Binzaga/SmartLoop/tree/main/docs", external: true },
            { label: t.fResourcesSDK, href: "https://github.com/Binzaga/SmartLoop/blob/main/docs/SDK.md", external: true },
            { label: t.fResourcesRoadmap, href: "https://github.com/Binzaga/SmartLoop/blob/main/docs/ROADMAP.md", external: true },
          ]}
        />
        <FooterCol
          title={t.footerCommunity}
          links={[
            { label: t.fCommContribute, href: "https://github.com/Binzaga/SmartLoop/blob/main/CONTRIBUTING.md", external: true },
            { label: t.fCommIssues, href: "https://github.com/Binzaga/SmartLoop/issues", external: true },
            { label: t.fCommDiscussions, href: "https://github.com/Binzaga/SmartLoop/discussions", external: true },
            { label: t.fCommLicense, href: "https://github.com/Binzaga/SmartLoop/blob/main/LICENSE", external: true },
          ]}
        />
      </div>

      <div className="mx-auto mt-10 max-w-6xl border-t border-border-soft px-6 pt-6">
        <div className="flex flex-col items-start justify-between gap-3 text-[11px] text-text-tertiary md:flex-row md:items-center">
          <span>{t.footerRights}</span>
          <span className="inline-flex items-center gap-1.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="sl-pulse absolute inline-flex h-full w-full rounded-full bg-emerald-400" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </span>
            {t.footerOperational}
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

function IconGitHub({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2.2c-3.3.7-4-1.6-4-1.6-.5-1.4-1.3-1.8-1.3-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-6 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.7.2 2.9.1 3.2.7.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3" />
    </svg>
  )
}
