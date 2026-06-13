FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/server/package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/server/dist ./dist
COPY --from=builder /app/server/node_modules ./node_modules
COPY --from=builder /app/server/index.js ./

ENV NODE_ENV=production
ENV DB_TYPE=sqljs
ENV SQLITE_PATH=/data/dingdang.db
ENV APP_PREFIX=/api

EXPOSE 3000
CMD ["node", "index.js"]