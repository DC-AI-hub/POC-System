# 多阶段构建 Dockerfile for Next.js 15.2.4
FROM node:20-alpine AS base

# 安装依赖阶段
FROM base AS deps
RUN apk add --no-cache libc6-compat curl
WORKDIR /app

# 复制包管理文件
COPY package.json pnpm-lock.yaml* ./
# 启用 pnpm 并安装依赖
RUN corepack enable pnpm && pnpm i --frozen-lockfile
# 确保 node_modules/.bin 有执行权限
RUN chmod -R +x node_modules/.bin

# 构建阶段
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 设置环境变量
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

# 确保 node_modules/.bin 有执行权限
RUN chmod -R +x node_modules/.bin

# 构建应用
RUN corepack enable pnpm && pnpm run build

# 运行阶段
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# 安装 curl 用于健康检查
RUN apk add --no-cache curl

# 创建非root用户
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 复制构建产物
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# 创建必要的目录
RUN mkdir -p /app/logs && chown nextjs:nodejs /app/logs
RUN mkdir -p /app/uploads && chown nextjs:nodejs /app/uploads

USER nextjs

EXPOSE 5137

ENV PORT 5137
ENV HOSTNAME "0.0.0.0"

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5137/api/health || exit 1

CMD ["node", "server.js"] 