FROM node:22.12.0-alpine AS dependencies

RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY . .
RUN npm install --global pnpm@9.12.3 && pnpm install --frozen-lockfile

FROM dependencies AS builder

RUN pnpm --filter @encreasl/cms build

FROM node:22.12.0-alpine AS runner

RUN apk add --no-cache libc6-compat
WORKDIR /app

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
	&& adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/apps/cms/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/cms/scripts/validate-runtime-env.mjs ./apps/cms/scripts/validate-runtime-env.mjs

USER nextjs

EXPOSE 8080

CMD ["sh", "-c", "node apps/cms/scripts/validate-runtime-env.mjs && exec node apps/cms/server.js"]
