import type { FastifyRequest, FastifyReply } from "fastify"
import { eq } from "drizzle-orm"
import { db, schema } from "../db/client"
import { hashApiKey, isValidApiKeyFormat } from "../lib/api-key"

export interface ProductContext {
  productId: string
  orgId: string
  productName: string
}

declare module "fastify" {
  interface FastifyRequest {
    product?: ProductContext
  }
}

/** Authenticate inbound SDK requests using `X-SmartLoop-Key` header. */
export async function authProductFromApiKey(req: FastifyRequest, reply: FastifyReply) {
  const apiKey =
    (req.headers["x-smartloop-key"] as string | undefined) ??
    extractBearer(req.headers.authorization)

  if (!apiKey) {
    reply.code(401).send({ error: "missing api key" })
    return reply
  }
  if (!isValidApiKeyFormat(apiKey)) {
    reply.code(401).send({ error: "invalid api key format" })
    return reply
  }

  const hash = hashApiKey(apiKey)
  const product = await db
    .select({
      id: schema.products.id,
      orgId: schema.products.orgId,
      name: schema.products.name,
      enabled: schema.products.enabled,
    })
    .from(schema.products)
    .where(eq(schema.products.apiKeyHash, hash))
    .limit(1)

  if (product.length === 0) {
    reply.code(401).send({ error: "unknown api key" })
    return reply
  }
  if (!product[0].enabled) {
    reply.code(403).send({ error: "product disabled" })
    return reply
  }

  req.product = {
    productId: product[0].id,
    orgId: product[0].orgId,
    productName: product[0].name,
  }
}

function extractBearer(header?: string): string | undefined {
  if (!header) return undefined
  const [scheme, value] = header.split(" ")
  if (scheme?.toLowerCase() === "bearer" && value) return value
  return undefined
}
