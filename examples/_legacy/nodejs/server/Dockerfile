# ─── Build stage ──────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.12.0 --activate

# Copy workspace manifests for dependency resolution
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/ ./packages/

# Install only production dependencies for the SDK packages
RUN pnpm install --frozen-lockfile --filter "@klever/connect..." --prod

# ─── Runtime stage ────────────────────────────────────────────────────────────
FROM node:22-alpine AS runtime

WORKDIR /app

# Copy built SDK packages
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages

# Copy server source
COPY examples/nodejs/server ./server
COPY examples/nodejs/package.json ./

# Create non-root user
RUN addgroup -S klever && adduser -S klever -G klever
USER klever

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD node -e "fetch('http://localhost:3000/health').then(r=>r.ok?process.exit(0):process.exit(1)).catch(()=>process.exit(1))"

CMD ["node", "server/src/server.js"]
