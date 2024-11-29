FROM node:18-alpine AS base

# Place Arguments that should be passed at build time here!
#  (WARNING: ENVs will be baked in, so use carefully)
ENV NEXT_TELEMETRY_DISABLED=1

# App
ARG APP_NAME
ARG APP_DESCRIPTION

# GitHub Note Repo Adapter
ARG GITHUB_REPO_OWNER
ARG GITHUB_REPO_NAME
ARG GITHUB_BRANCH
ARG GITHUB_FOLDER_PATH
ARG GITHUB_PRIVATE_ACCESS_TOKEN

ARG GITHUB_IMAGE_STORAGE_PATH
ENV GITHUB_IMAGE_STORAGE_PATH=$GITHUB_IMAGE_STORAGE_PATH
ARG GITHUB_SHA
ENV GITHUB_SHA=$GITHUB_SHA
ARG GITHUB_DATETIME
ENV GITHUB_DATETIME=$GITHUB_DATETIME

# Install dependencies only when needed
FROM base AS deps

# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache git libc6-compat

WORKDIR /app

# Enable Yarn 4.x
RUN corepack enable && corepack prepare yarn@4.5.1 --activate && yarn set version 4.5.1
RUN if [ -d ".yarn" ]; then cp -r .yarn /app/.yarn; fi

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* .yarnrc.yml ./
RUN \
  if [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi


# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

RUN apk add --no-cache git

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Create data directory for show-my-notes project
RUN mkdir -p /app/data && chown -R 1001:1001 /app/data

RUN yarn build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

RUN apk add --no-cache git

ENV NODE_ENV production

RUN mkdir -p /app/data && chown -R 1001:1001 /app/data

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

EXPOSE 3000

CMD ["node", "server.js"]