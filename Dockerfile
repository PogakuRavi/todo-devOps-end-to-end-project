# ---------- Stage 1: Build ----------
FROM node:18-alpine AS builder

WORKDIR /app

# ✅ FIX: Copy backend package.json correctly
COPY backend/package*.json ./backend/

# Move into backend folder
WORKDIR /app/backend

# Install dependencies
RUN npm install

# Copy remaining backend code
COPY backend/ .

# ---------- Stage 2: Runtime ----------
FROM node:18-alpine

WORKDIR /app

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy built app
COPY --from=builder /app/backend /app/backend

RUN chown -R appuser:appgroup /app

USER appuser

EXPOSE 3000

CMD ["node", "backend/server.js"]
