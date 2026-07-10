# ÆNIGMA beta — explicit Docker build so Railway ignores the legacy Go code
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY aenigma ./aenigma
EXPOSE 3000
CMD ["node", "aenigma/server.js"]
