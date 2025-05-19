FROM node:22.14-alpine AS base

WORKDIR /app
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn .yarn
RUN apk add --no-cache git \
    && corepack enable \
    && yarn --frozen-lockfile \
    && yarn cache clean

FROM node:22.14-alpine AS build

WORKDIR /app
COPY --from=base /app/node_modules ./node_modules
COPY . .
RUN apk add --no-cache curl git \
    && corepack enable \
    && yarn build \
    && cd .next/standalone \
    && yarn cache clean

FROM node:22.14-alpine AS production

WORKDIR /app

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=build /app/public ./public
COPY --from=build /app/next.config.ts ./

COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static

RUN chown -R appuser:appgroup /app

USER appuser

EXPOSE 3000

CMD ["node", "server.js"]