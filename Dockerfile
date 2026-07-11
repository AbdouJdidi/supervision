# ---- Étape 1 : build (avec les outils de compilation) ----
FROM node:20-slim AS builder

RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY backend/package*.json ./backend/
RUN cd backend && npm install --omit=dev

# ---- Étape 2 : image finale (légère, sans outils de build) ----
FROM node:20-slim

WORKDIR /app

# On copie uniquement le résultat compilé depuis l'étape builder
COPY --from=builder /app/backend/node_modules ./backend/node_modules
COPY backend ./backend
COPY frontend ./frontend

WORKDIR /app/backend

EXPOSE 3000

CMD ["node", "server.js"]