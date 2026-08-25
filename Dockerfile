# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le code source
COPY . .

# Build-time arg (disponible pour la commande de build mais non exporté)
ARG VITE_GOOGLE_GENAI_KEY

# Utiliser l'ARG uniquement pour la commande de build (évite d'écrire l'ENV dans l'image)
RUN VITE_GOOGLE_GENAI_KEY="$VITE_GOOGLE_GENAI_KEY" npm run build

# Stage 2: Runtime
FROM node:22-alpine

WORKDIR /app

# Copier les dépendances (production seulement)
COPY package*.json ./
RUN npm install --production

# Copier la build depuis le stage 1
COPY --from=builder /app/dist ./dist

# Exposer le port
EXPOSE 3000

# Commande de démarrage
CMD ["npm", "run", "preview"]
