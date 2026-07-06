FROM node:24-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci && npm cache clean --force
COPY . .

FROM node:24-alpine
WORKDIR /app
COPY --from=builder /app ./
COPY . .
EXPOSE 3000
CMD ["npm", "run", "start"]