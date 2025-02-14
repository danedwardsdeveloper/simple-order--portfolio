# syntax = docker/dockerfile:1
ARG NODE_VERSION=22.2.0
FROM node:${NODE_VERSION}-slim AS base
LABEL fly_launch_runtime="Next.js"
WORKDIR /app

ENV NODE_ENV="production"
ENV DATABASE_URL="postgres://simple_order:8522UFgzYYnKKl4@simple-order-db.flycast:5432/simple_order?sslmode=disable"

ARG PNPM_VERSION=9.12.0
RUN npm install -g pnpm@$PNPM_VERSION
FROM base AS build
RUN apt-get update -y && \
    apt-get install -y openssl build-essential
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod=false
COPY . .
RUN pnpm run build
RUN pnpm prune --prod
FROM base
COPY --from=build /app/.next/standalone /app
COPY --from=build /app/.next/static /app/.next/static
COPY --from=build /app/public ./public
EXPOSE 3000
CMD [ "node", "server.js" ]
