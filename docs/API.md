# API Reference

所有端点 host 在 API 上。

- 本地: `http://localhost:8088`
- 公网(开发): `http://47.82.1.197`

---

## 认证

两种 header,分别对应两个权限层:

| Header | 用途 | 谁用 |
|---|---|---|
| `X-Admin-Token: <token>` | 管理后台 + Dashboard 读取 | Web 后端、运维、管理员脚本 |
| `X-SmartLoop-Key: sl_xxxx` | SDK 上报事件 | 各 AI 产品的后端 |

也支持 `Authorization: Bearer <token>` 格式。

---

## 1. Health / Meta

### `GET /`
返回服务自描述(不需要任何认证)。

```json
{
  "service": "smartloop-api",
  "version": "0.1.0",
  "status": "running",
  "endpoints": {...}
}
```

### `GET /healthz`
存活检查。不查 DB。
```json
{"ok":true,"ts":"2026-05-13T09:00:00.000Z"}
```

### `GET /readyz`
就绪检查。查 DB。
```json
{"ok":true,"db":true}
```

---

## 2. Admin: Orgs / Products / Keys

⚠️ 全部需要 `X-Admin-Token`。

### `GET /admin/orgs`
列出所有 org。

### `POST /admin/orgs`
创建 org。
```json
{ "id": "acme", "name": "Acme" }
```

### `GET /admin/products`
列出所有产品。

### `POST /admin/products`
创建产品,**返回一次性 API key**(后续无法再查,只能轮换)。

Request:
```json
{
  "id": "my-agent",
  "orgId": "acme",
  "name": "My Agent",
  "description": "AI Copilot",
  "ownerTeam": "Platform Team"
}
```

ID 必须是小写字母 + 数字 + 连字符。

Response:
```json
{
  "ok": true,
  "product": {"id":"my-agent","orgId":"acme","name":"My Agent"},
  "apiKey": "sl_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "warning": "Save this key now — it will not be shown again."
}
```

### `POST /admin/products/:id/rotate-key`
作废旧 API key,生成新 key。
```json
{
  "ok": true,
  "apiKey": "sl_newxxxx",
  "warning": "Old key is now invalid."
}
```

---

## 3. Admin: Judge

### `POST /admin/judge/run`
手动触发 judge worker 跑一批(测试 / 排查用)。

Body(可选):
```json
{ "limit": 10 }
```

Response:
```json
{
  "ok": true,
  "picked": 5,
  "judged": 5,
  "failed": 0,
  "durationMs": 4200
}
```

---

## 4. Admin: Dashboard 聚合

### `GET /admin/dashboard/overview`
跨产品健康 + 最近事件 + 总计。

```json
{
  "products": [
    {
      "productId": "my-agent",
      "name": "My Agent",
      "ownerTeam": "Platform Team",
      "eventCount24h": 12,
      "eventCount7d": 88,
      "avgOverall": 3.67,
      "thumbsDownRate24h": 0.05,
      "hallucinationCount24h": 2,
      "judgedRatio": 1.0,
      "healthScore": 78
    }
  ],
  "recentEvents": [
    {
      "id": "uuid",
      "productId": "my-agent",
      "inputMessage": "...",
      "outputMessage": "...",
      "model": "qwen3.5-plus",
      "overallScore": 4,
      "tags": ["good"],
      "rating": null,
      "createdAt": "2026-05-13T..."
    }
  ],
  "totals": {
    "events24h": 12,
    "events7d": 88,
    "productsCount": 1,
    "alertsFiring": 0
  }
}
```

---

## 5. SDK: 事件上报

⚠️ 全部需要 `X-SmartLoop-Key`(产品级 key)。

### `POST /v1/events`
单条事件上报。

```json
{
  "conversationId": "conv_abc",
  "userIdHash": "user_xxx_hashed",
  "parentEventId": null,

  "input": "用户原话",
  "output": "AI 回答",

  "model": "qwen3.5-plus",
  "promptVersion": "v3.2",

  "tokens": {
    "input": 2100,
    "output": 350,
    "cacheHit": 0
  },
  "costUsd": 0.012,
  "latencyMs": 1840,

  "toolsCalled": [
    {
      "name": "query_sessions",
      "input": {"reply_status": 1},
      "output": {"count": 12},
      "latencyMs": 240,
      "success": true
    }
  ],

  "status": "success",
  "errorMessage": null,
  "language": "zh-CN",
  "metadata": {"any": "custom"}
}
```

字段全部可选,但 `input` + `output` 强烈建议提供(否则 judge 无法评分)。

Response:
```json
{"ok":true,"eventId":"uuid"}
```

### `POST /v1/events/batch`
批量上报,**强烈推荐**:SDK 默认走这个。

```json
{
  "events": [ {...EventInput}, {...EventInput} ]
}
```

最大 100 条/批。

### `POST /v1/events/:id/feedback`
给某条事件附加用户反馈(👍/👎)。

```json
{
  "rating": "down",
  "reasons": ["hallucination"],
  "comment": "AI 说有 12 条但其实是 8 条",
  "userIdHash": "user_xxx_hashed"
}
```

`rating` 必填: `"up" | "down" | "neutral"`。

Response:
```json
{"ok":true,"feedbackId":"uuid"}
```

---

## 6. 错误响应格式

所有错误都是 JSON:

```json
{
  "error": "human readable message",
  "issues": [...]   // optional, Zod 校验失败时
}
```

常见状态码:

| 码 | 含义 |
|---|---|
| 400 | 请求格式错误,看 `issues` |
| 401 | 缺少或错误的认证 header |
| 403 | 产品被禁用 / IP 不在白名单 |
| 404 | 资源不存在 |
| 500 | 服务端错误 |
| 503 | 数据库不可达(`/readyz`) |

---

## 7. Rate Limit

⚠️ MVP 阶段**没有**限流。生产前必须加:
- `/v1/events` per `productId`,例如 1000 req/min
- `/v1/events/batch` 同上(批可以放大,如 500 batch/min)
- `/admin/*` per IP

参考:[ROADMAP.md](./ROADMAP.md) "工程化补强" 章节。

---

## 8. 调试技巧

### 看实时 access log
```bash
tail -f /var/log/nginx/smartloop_access.log
```

### 看 API 业务日志
```bash
tail -f /tmp/smartloop-api.log
```

### 看 judge worker 运行情况
搜 log 里的 `[judge] batch`:
```
[09:01:51] INFO: [judge] batch
    picked: 5
    judged: 5
    failed: 0
    durationMs: 4439
```

### 直接看 DB
```bash
docker exec -it smartloop-postgres psql -U smartloop -d smartloop

# 最近 20 条事件
SELECT id, product_id, left(input_message, 40), (scores->>'overall')::int as score, scores->'tags' as tags
FROM events ORDER BY created_at DESC LIMIT 20;

# 健康度统计
SELECT product_id, count(*),
       avg((scores->>'overall')::int) as avg_score
FROM events
WHERE created_at > now() - interval '24 hours'
GROUP BY product_id;
```
