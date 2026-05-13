import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  jsonb,
  boolean,
  index,
  doublePrecision,
  pgEnum,
} from "drizzle-orm/pg-core"

// ===== Enums =====

export const ratingEnum = pgEnum("rating", ["up", "down", "neutral"])
export const alertStatusEnum = pgEnum("alert_status", ["firing", "resolved"])
export const regressionStatusEnum = pgEnum("regression_status", [
  "queued",
  "running",
  "completed",
  "failed",
])
export const clusterStatusEnum = pgEnum("cluster_status", [
  "active",
  "resolved",
  "monitoring",
])

// ===== Orgs =====

export const orgs = pgTable("orgs", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
})

// ===== Products (monitored AI products) =====

export const products = pgTable(
  "products",
  {
    id: text("id").primaryKey(), // e.g. 'my-agent', 'support-bot', 'translator'
    orgId: text("org_id")
      .notNull()
      .references(() => orgs.id),
    name: text("name").notNull(),
    description: text("description"),
    ownerTeam: text("owner_team"),
    apiKeyHash: text("api_key_hash").notNull(), // hashed; raw key shown once on create
    enabled: boolean("enabled").default(true).notNull(),
    settings: jsonb("settings").default({}).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    orgIdx: index("products_org_idx").on(t.orgId),
    apiKeyIdx: index("products_api_key_idx").on(t.apiKeyHash),
  }),
)

// ===== Prompt versions =====

export const promptVersions = pgTable(
  "prompt_versions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    version: text("version").notNull(), // 'v3.2' or 'commit-abc'
    content: text("content").notNull(),
    diffFromParent: text("diff_from_parent"),
    isCurrent: boolean("is_current").default(false).notNull(),
    metrics: jsonb("metrics").default({}).notNull(),
    deployedAt: timestamp("deployed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    productVersionIdx: index("prompt_versions_product_idx").on(t.productId, t.version),
  }),
)

// ===== Events (core: AI interaction records) =====

export const events = pgTable(
  "events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: text("product_id")
      .notNull()
      .references(() => products.id),
    orgId: text("org_id").notNull(),

    // Conversation context
    conversationId: text("conversation_id"),
    userIdHash: text("user_id_hash"),
    parentEventId: uuid("parent_event_id"),

    // Input / output
    inputMessage: text("input_message"),
    outputMessage: text("output_message"),

    // Model + prompt
    model: text("model"),
    promptVersionId: uuid("prompt_version_id").references(() => promptVersions.id),
    promptVersionLabel: text("prompt_version_label"), // denormalized for queries

    // Performance
    tokensInput: integer("tokens_input").default(0),
    tokensOutput: integer("tokens_output").default(0),
    tokensCacheHit: integer("tokens_cache_hit").default(0),
    costUsd: doublePrecision("cost_usd").default(0),
    latencyMs: integer("latency_ms").default(0),

    // Tool calls
    toolsCalled: jsonb("tools_called").default([]).notNull(),

    // Eval scores (async populated)
    scores: jsonb("scores"),
    judgeReasoning: text("judge_reasoning"),

    // Cluster assignment (async populated)
    clusterId: uuid("cluster_id"),

    // Status / errors
    status: text("status").default("success").notNull(), // 'success' | 'error' | 'timeout'
    errorMessage: text("error_message"),

    // Language / metadata
    language: text("language"),
    metadata: jsonb("metadata").default({}).notNull(),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    productCreatedIdx: index("events_product_created_idx").on(t.productId, t.createdAt),
    conversationIdx: index("events_conversation_idx").on(t.conversationId),
    clusterIdx: index("events_cluster_idx").on(t.clusterId),
    statusIdx: index("events_status_idx").on(t.productId, t.status, t.createdAt),
  }),
)

// ===== Feedback (user signals) =====

export const feedback = pgTable(
  "feedback",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    eventId: uuid("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    productId: text("product_id").notNull(),
    rating: ratingEnum("rating").notNull(),
    reasons: text("reasons").array().default([]).notNull(),
    comment: text("comment"),
    userIdHash: text("user_id_hash"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    eventIdx: index("feedback_event_idx").on(t.eventId),
    productRatingIdx: index("feedback_product_rating_idx").on(t.productId, t.rating, t.createdAt),
  }),
)

// ===== Clusters (auto-grouped bad cases) =====

export const clusters = pgTable(
  "clusters",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    category: text("category"), // 'hallucination' | 'latency' | 'format' | etc.
    representativeEventIds: uuid("representative_event_ids").array().default([]).notNull(),
    eventCountTotal: integer("event_count_total").default(0).notNull(),
    eventCount24h: integer("event_count_24h").default(0).notNull(),
    eventCount7d: integer("event_count_7d").default(0).notNull(),
    trend: jsonb("trend").default([]).notNull(),
    status: clusterStatusEnum("status").default("active").notNull(),
    rootCauseAnalysis: text("root_cause_analysis"),
    suggestedFix: text("suggested_fix"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    productStatusIdx: index("clusters_product_status_idx").on(t.productId, t.status),
    productCategoryIdx: index("clusters_product_category_idx").on(t.productId, t.category),
  }),
)

// ===== Golden cases (regression test set) =====

export const goldenCases = pgTable(
  "golden_cases",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    input: text("input").notNull(),
    expectedCriteria: text("expected_criteria").notNull(),
    category: text("category"),
    difficulty: text("difficulty").default("medium").notNull(), // 'easy' | 'medium' | 'hard'
    weight: integer("weight").default(1).notNull(),
    enabled: boolean("enabled").default(true).notNull(),
    metadata: jsonb("metadata").default({}).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    productIdx: index("golden_cases_product_idx").on(t.productId, t.enabled),
  }),
)

// ===== Regression runs =====

export const regressionRuns = pgTable(
  "regression_runs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    promptVersionId: uuid("prompt_version_id").references(() => promptVersions.id),
    totalCases: integer("total_cases").default(0).notNull(),
    passedCases: integer("passed_cases").default(0).notNull(),
    failedCases: integer("failed_cases").default(0).notNull(),
    results: jsonb("results").default([]).notNull(),
    triggeredBy: text("triggered_by"), // 'manual' | 'auto-on-prompt-change'
    triggeredByUser: text("triggered_by_user"),
    status: regressionStatusEnum("status").default("queued").notNull(),
    error: text("error"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
  },
  (t) => ({
    productIdx: index("regression_runs_product_idx").on(t.productId, t.createdAt),
  }),
)

// ===== Alert rules + history =====

export const alertRules = pgTable(
  "alert_rules",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    condition: jsonb("condition").notNull(),
    channels: jsonb("channels").default([]).notNull(),
    enabled: boolean("enabled").default(true).notNull(),
    lastTriggeredAt: timestamp("last_triggered_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    productEnabledIdx: index("alert_rules_product_enabled_idx").on(t.productId, t.enabled),
  }),
)

export const alerts = pgTable(
  "alerts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ruleId: uuid("rule_id")
      .notNull()
      .references(() => alertRules.id, { onDelete: "cascade" }),
    productId: text("product_id").notNull(),
    title: text("title").notNull(),
    severity: text("severity").default("warning").notNull(), // 'info' | 'warning' | 'critical'
    context: jsonb("context").default({}).notNull(),
    status: alertStatusEnum("status").default("firing").notNull(),
    triggeredAt: timestamp("triggered_at", { withTimezone: true }).defaultNow().notNull(),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
  },
  (t) => ({
    productStatusIdx: index("alerts_product_status_idx").on(t.productId, t.status, t.triggeredAt),
  }),
)
