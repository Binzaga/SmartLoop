# SmartLoop API — Bun runtime
FROM oven/bun:1.3-slim AS deps
WORKDIR /app
COPY package.json bun.lock ./
COPY apps/api/package.json ./apps/api/
COPY packages/sdk-node/package.json ./packages/sdk-node/
RUN bun install --frozen-lockfile

FROM oven/bun:1.3-slim AS runtime
WORKDIR /app
# Copy node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
# Copy source
COPY apps/api ./apps/api
COPY packages/sdk-node ./packages/sdk-node
COPY package.json ./

WORKDIR /app/apps/api

ENV NODE_ENV=production \
    API_HOST=0.0.0.0 \
    API_PORT=8088 \
    LOG_LEVEL=info

EXPOSE 8088

# Apply migrations on startup, then exec server
CMD ["sh", "-c", "bun run src/db/migrate.ts && exec bun run src/server.ts"]
