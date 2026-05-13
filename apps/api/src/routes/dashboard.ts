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
}
