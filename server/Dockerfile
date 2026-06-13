# Stage 1: 构建
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && cp -R node_modules /prod_modules
RUN npm ci
COPY tsconfig.json nest-cli.json ./
COPY src ./src
RUN npm run build

# Stage 2: 运行
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /prod_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package.json ./
COPY .env.example ./.env

# 创建数据目录
RUN mkdir -p /app/data

EXPOSE 3000
CMD ["node", "dist/main"]
