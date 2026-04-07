# ---------- Stage 1: Build ----------
FROM node:18 AS builder

WORKDIR /app

# Copy backend dependencies
COPY backend/package*.json ./backend/

WORKDIR /app/backend
RUN npm install

# Copy full project
WORKDIR /app
COPY backend/ ./backend/
COPY frontend/ ./frontend/

# ---------- Stage 2: Runtime ----------
FROM node:18-slim

WORKDIR /app

# Create non-root user
RUN useradd -m appuser

# Copy from builder
COPY --from=builder /app /app

# Set permissions
RUN chown -R appuser:appuser /app

USER appuser

WORKDIR /app/backend

EXPOSE 3000

CMD ["node", "server.js"]
