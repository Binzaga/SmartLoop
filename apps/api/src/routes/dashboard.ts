import type { FastifyInstance } from "fastify"
import { and, desc, eq, gte, sql } from "drizzle-orm"
import { db, schema } from "../db/client"
import { adminAuth } from "../middleware/admin-auth"

/**
 * Read-only routes for the Dashboard. Aggregates events / feedback / scores
 * into per-product health summaries.
 */
export async function dashboardRoutes(app: FastifyInstance) {
  app.addHook("preHandler", adminAuth)

  app.get("/admin/dashboard/overview", async () => {
    const now = new Date()
    const dayAgo = new Date(now.getTime() - 24 * 3600 * 1000)
    const weekAgo = new Date(now.getTime() - 7 * 24 * 3600 * 1000)

    // Pull all products
    const products = await db
      .select({
        id: schema.products.id,
        name: schema.products.name,
        ownerTeam: schema.products.ownerTeam,
      })
      .from(schema.products)
      .where(eq(schema.products.enabled, true))

    // Per-product stats (24h window)
    const stats24h = await db.execute(sql`
      with e as (
        select product_id, scores, id
        from events
        where created_at >= ${dayAgo.toISOString()}
      ),
      fb as (
        select product_id,
          sum(case when rating = 'down' then 1 else 0 end)::int as downs,
          count(*)::int as total
        from feedback
        where created_at >= ${dayAgo.toISOString()}
        group by product_id
      )
      select
        e.product_id,
        count(*)::int as event_count,
        avg((scores->>'overall')::float) as avg_overall,
        sum(case when scores ? 'tags' and (scores->'tags')::jsonb ?| array['hallucination'] then 1 else 0 end)::int as hallucination_count,
        sum(case when scores is not null then 1 else 0 end)::int as judged_count,
        coalesce(max(fb.downs), 0)::int as downs,
        coalesce(max(fb.total), 0)::int as feedback_total
      from e
      left join fb on fb.product_id = e.product_id
      group by e.product_id
    `)
    const stats24hMap = new Map<string, any>()
    for (const r of stats24h as unknown as any[]) {
      stats24hMap.set(r.product_id, r)
    }

    // Per-product 7d event count
    const stats7d = await db.execute(sql`
      select product_id, count(*)::int as event_count
      from events
      where created_at >= ${weekAgo.toISOString()}
      group by product_id
    `)
    const stats7dMap = new Map<string, number>()
    for (const r of stats7d as unknown as any[]) {
      stats7dMap.set(r.product_id, r.event_count)
    }

    // Build health per product
    const productHealth = products.map((p) => {
      const s = stats24hMap.get(p.id)
      const eventCount24h = s?.event_count ?? 0
      const eventCount7d = stats7dMap.get(p.id) ?? 0
      const avgOverall =
        s && s.judged_count > 0 && s.avg_overall != null ? Number(s.avg_overall) : null
      const hallucinationCount24h = s?.hallucination_count ?? 0
      const downs = s?.downs ?? 0
      const fbTotal = s?.feedback_total ?? 0
      const thumbsDownRate24h = fbTotal > 0 ? downs / fbTotal : 0
      const judgedRatio = eventCount24h > 0 ? (s?.judged_count ?? 0) / eventCount24h : 0

      // health score: rough composite, 0-100
      // start from 100, subtract for issues
      let score = 100
      if (avgOverall !== null) {
        // each point below 4 costs 10
        score -= Math.max(0, (4 - avgOverall) * 10)
      } else if (eventCount24h > 0) {
        // we have events but none judged → ambiguous
        score -= 10
      }
      score -= thumbsDownRate24h * 100 * 0.4 // 40% weight on down-rate
      if (eventCount24h > 0) {
        score -= Math.min(40, (hallucinationCount24h / eventCount24h) * 100 * 0.5)
      }
      const healthScore = Math.max(0, Math.min(100, Math.round(score)))

      return {
        productId: p.id,
        name: p.name,
        ownerTeam: p.ownerTeam,
        eventCount24h,
        eventCount7d,
        avgOverall,
        thumbsDownRate24h,
        hallucinationCount24h,
        judgedRatio,
        healthScore,
      }
    })

    // Totals
    const totals = {
      events24h: productHealth.reduce((s, p) => s + p.eventCount24h, 0),
      events7d: productHealth.reduce((s, p) => s + p.eventCount7d, 0),
      productsCount: products.length,
      alertsFiring: 0, // wire this up in v0.2 when alerting is live
    }

    // Recent 20 events with feedback joined
    const recentEvents = await db.execute(sql`
      select
        e.id,
        e.product_id,
        e.input_message,
        e.output_message,
        e.model,
        (e.scores->>'overall')::int as overall_score,
        coalesce(e.scores->'tags', '[]'::jsonb) as tags,
        (
          select rating from feedback f
          where f.event_id = e.id
          order by f.created_at desc limit 1
        ) as rating,
        e.created_at
      from events e
      order by e.created_at desc
      limit 20
    `)

    const recentMapped = (recentEvents as unknown as any[]).map((r) => ({
      id: r.id,
      productId: r.product_id,
      inputMessage: r.input_message,
      outputMessage: r.output_message,
      model: r.model,
      overallScore: r.overall_score,
      tags: Array.isArray(r.tags) ? r.tags : [],
      rating: r.rating,
      createdAt: r.created_at,
    }))

    return {
      products: productHealth,
      recentEvents: recentMapped,
      totals,
    }
  })

  // ===== Product detail =====
  app.get<{ Params: { id: string } }>(
    "/admin/dashboard/products/:id",
    async (req, reply) => {
      const productId = req.params.id

      const product = await db
        .select({
          id: schema.products.id,
          orgId: schema.products.orgId,
          name: schema.products.name,
          description: schema.products.description,
          ownerTeam: schema.products.ownerTeam,
          enabled: schema.products.enabled,
          createdAt: schema.products.createdAt,
        })
        .from(schema.products)
        .where(eq(schema.products.id, productId))
        .limit(1)

      if (product.length === 0) {
        reply.code(404)
        return { error: "product not found" }
      }

      // 24h + 7d windowed metrics
      const now = new Date()
      const dayAgo = new Date(now.getTime() - 24 * 3600 * 1000)
      const weekAgo = new Date(now.getTime() - 7 * 24 * 3600 * 1000)

      const stats = await db.execute(sql`
        with e24 as (select * from events where product_id = ${productId} and created_at >= ${dayAgo.toISOString()}),
             e7  as (select * from events where product_id = ${productId} and created_at >= ${weekAgo.toISOString()}),
             fb24 as (
               select sum(case when rating='down' then 1 else 0 end)::int as downs,
                      sum(case when rating='up' then 1 else 0 end)::int as ups,
                      count(*)::int as total
               from feedback
               where product_id = ${productId} and created_at >= ${dayAgo.toISOString()}
             )
        select
          (select count(*) from e24)::int as event_count_24h,
          (select count(*) from e7)::int as event_count_7d,
          (select avg((scores->>'overall')::float) from e24 where scores is not null) as avg_overall_24h,
          (select avg((scores->>'overall')::float) from e7 where scores is not null) as avg_overall_7d,
          (select sum(case when scores ? 'tags' and (scores->'tags')::jsonb ?| array['hallucination'] then 1 else 0 end)::int from e24) as hallucination_24h,
          (select avg(latency_ms)::int from e24) as avg_latency_24h,
          (select sum(latency_ms * tokens_input)::bigint from e24) as approx_cost_units,
          (select count(*) from fb24)::int as feedback_count_24h,
          (select downs from fb24) as downs_24h,
          (select ups from fb24) as ups_24h
      `)
      const s = (stats as unknown as any[])[0] ?? {}

      // 7d daily activity bucket
      const trend = await db.execute(sql`
        select
          date_trunc('day', created_at) as day,
          count(*)::int as events,
          avg((scores->>'overall')::float) as avg_score,
          sum(case when scores ? 'tags' and (scores->'tags')::jsonb ?| array['hallucination'] then 1 else 0 end)::int as halls
        from events
        where product_id = ${productId} and created_at >= ${weekAgo.toISOString()}
        group by 1 order by 1 asc
      `)

      // Recent events for this product
      const recent = await db.execute(sql`
        select
          e.id, e.input_message, e.output_message, e.model,
          (e.scores->>'overall')::int as overall_score,
          coalesce(e.scores->'tags', '[]'::jsonb) as tags,
          e.created_at,
          (select rating from feedback f where f.event_id = e.id order by f.created_at desc limit 1) as rating
        from events e
        where e.product_id = ${productId}
        order by e.created_at desc
        limit 30
      `)

      // Real clusters from the cluster worker
      const clusterRows = await db
        .select({
          id: schema.clusters.id,
          name: schema.clusters.name,
          description: schema.clusters.description,
          category: schema.clusters.category,
          eventCount24h: schema.clusters.eventCount24h,
          eventCount7d: schema.clusters.eventCount7d,
          eventCountTotal: schema.clusters.eventCountTotal,
          representativeEventIds: schema.clusters.representativeEventIds,
          status: schema.clusters.status,
        })
        .from(schema.clusters)
        .where(eq(schema.clusters.productId, productId))
        .orderBy(desc(schema.clusters.eventCount24h))

      // Recent firing alerts for this product
      const alertRows = await db.execute(sql`
        select id, title, severity, context, status, triggered_at, resolved_at
        from alerts
        where product_id = ${productId}
        order by triggered_at desc
        limit 5
      `)

      // Fallback tag distribution (kept for chart compatibility)
      const tagDist = await db.execute(sql`
        with tag_events as (
          select tag, e.id
          from events e, jsonb_array_elements_text(coalesce(scores->'tags', '[]'::jsonb)) as tag
          where e.product_id = ${productId} and e.created_at >= ${dayAgo.toISOString()}
        )
        select tag, count(*)::int as count
        from tag_events
        where tag in ('hallucination','too_short','too_long','off_topic','format_violation','safety_violation','multilingual_drift','wrong_lookup')
        group by tag order by count desc
      `)

      return {
        product: product[0],
        stats: {
          event_count_24h: s.event_count_24h ?? 0,
          event_count_7d: s.event_count_7d ?? 0,
          avg_overall_24h: s.avg_overall_24h !== null ? Number(s.avg_overall_24h) : null,
          avg_overall_7d: s.avg_overall_7d !== null ? Number(s.avg_overall_7d) : null,
          hallucination_24h: s.hallucination_24h ?? 0,
          avg_latency_24h: s.avg_latency_24h ?? 0,
          feedback_count_24h: s.feedback_count_24h ?? 0,
          downs_24h: s.downs_24h ?? 0,
          ups_24h: s.ups_24h ?? 0,
        },
        trend: (trend as unknown as any[]).map((r) => ({
          day: r.day,
          events: r.events,
          avgScore: r.avg_score !== null ? Number(r.avg_score) : null,
          hallucinations: r.halls,
        })),
        recentEvents: (recent as unknown as any[]).map((r) => ({
          id: r.id,
          inputMessage: r.input_message,
          outputMessage: r.output_message,
          model: r.model,
          overallScore: r.overall_score,
          tags: Array.isArray(r.tags) ? r.tags : [],
          rating: r.rating,
          createdAt: r.created_at,
        })),
        tagDistribution: (tagDist as unknown as any[]).map((r) => ({
          tag: r.tag,
          count: r.count,
        })),
        clusters: clusterRows.map((c) => ({
          id: c.id,
          name: c.name,
          description: c.description,
          category: c.category,
          eventCount24h: c.eventCount24h,
          eventCount7d: c.eventCount7d,
          eventCountTotal: c.eventCountTotal,
          representativeEventIds: c.representativeEventIds,
          status: c.status,
        })),
        alerts: (alertRows as unknown as any[]).map((a) => ({
          id: a.id,
          title: a.title,
          severity: a.severity,
          context: a.context,
          status: a.status,
          triggeredAt: a.triggered_at,
          resolvedAt: a.resolved_at,
        })),
      }
    },
  )

  // ===== Manual trigger: cluster worker =====
  app.post("/admin/cluster/run", async () => {
    const { runClusterBatch } = await import("../workers/cluster-worker")
    const stats = await runClusterBatch()
    return { ok: true, ...stats }
  })

  // ===== Manual trigger: alert worker =====
  app.post("/admin/alert/run", async () => {
    const { runAlertBatch } = await import("../workers/alert-worker")
    const stats = await runAlertBatch()
    return { ok: true, ...stats }
  })

  // ===== List recent alerts (for the overview)
  app.get("/admin/dashboard/alerts", async () => {
    const rows = await db.execute(sql`
      select a.id, a.product_id, a.title, a.severity, a.status, a.context,
             a.triggered_at, a.resolved_at,
             p.name as product_name
      from alerts a
      join products p on p.id = a.product_id
      order by a.triggered_at desc
      limit 20
    `)
    return {
      alerts: (rows as unknown as any[]).map((r) => ({
        id: r.id,
        productId: r.product_id,
        productName: r.product_name,
        title: r.title,
        severity: r.severity,
        status: r.status,
        context: r.context,
        triggeredAt: r.triggered_at,
        resolvedAt: r.resolved_at,
      })),
    }
  })

  // ===== Single event detail =====
  app.get<{ Params: { id: string } }>("/admin/dashboard/events/:id", async (req, reply) => {
    const eventId = req.params.id

    const evRows = await db.execute(sql`
      select
        e.*,
        p.name as product_name,
        p.owner_team as product_owner_team
      from events e
      join products p on p.id = e.product_id
      where e.id = ${eventId}
    `)
    if ((evRows as unknown as any[]).length === 0) {
      reply.code(404)
      return { error: "event not found" }
    }
    const r = (evRows as unknown as any[])[0]

    const fbRows = await db.execute(sql`
      select id, rating, reasons, comment, created_at
      from feedback
      where event_id = ${eventId}
      order by created_at desc
    `)

    // Related events in same conversation
    let related: any[] = []
    if (r.conversation_id) {
      const rel = await db.execute(sql`
        select id, input_message, output_message, (scores->>'overall')::int as score, created_at
        from events
        where conversation_id = ${r.conversation_id} and id <> ${eventId}
        order by created_at asc limit 10
      `)
      related = (rel as unknown as any[]).map((x) => ({
        id: x.id,
        inputMessage: x.input_message,
        outputMessage: x.output_message,
        score: x.score,
        createdAt: x.created_at,
      }))
    }

    return {
      event: {
        id: r.id,
        productId: r.product_id,
        productName: r.product_name,
        productOwnerTeam: r.product_owner_team,
        conversationId: r.conversation_id,
        userIdHash: r.user_id_hash,
        inputMessage: r.input_message,
        outputMessage: r.output_message,
        model: r.model,
        promptVersionLabel: r.prompt_version_label,
        tokensInput: r.tokens_input,
        tokensOutput: r.tokens_output,
        costUsd: r.cost_usd !== null ? Number(r.cost_usd) : null,
        latencyMs: r.latency_ms,
        toolsCalled: r.tools_called ?? [],
        scores: r.scores,
        judgeReasoning: r.judge_reasoning,
        status: r.status,
        errorMessage: r.error_message,
        language: r.language,
        metadata: r.metadata,
        createdAt: r.created_at,
      },
      feedback: (fbRows as unknown as any[]).map((f) => ({
        id: f.id,
        rating: f.rating,
        reasons: f.reasons,
        comment: f.comment,
        createdAt: f.created_at,
      })),
      relatedEvents: related,
    }
  })
}
