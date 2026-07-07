# MsFitZ Society — production image.
# This repo's root also contains the unrelated CasaOS Go codebase; a Dockerfile
# makes the deploy deterministic (Railway prefers it over builder auto-detection,
# which would otherwise try to compile the Go project).

FROM node:22-slim

WORKDIR /app

# Install dependencies first so image layers cache well.
COPY astrocodice-replica/package.json astrocodice-replica/package-lock.json ./astrocodice-replica/
COPY astrocodice-replica/server/package.json astrocodice-replica/server/package-lock.json ./astrocodice-replica/server/
RUN cd astrocodice-replica && npm ci && cd server && npm ci

# Copy the app source and build the frontend.
COPY astrocodice-replica ./astrocodice-replica
RUN cd astrocodice-replica && npm run build

ENV NODE_ENV=production
EXPOSE 8787

# The server reads PORT from the environment (Railway injects it) and serves
# both the API and the built frontend from astrocodice-replica/dist.
CMD ["npm", "start", "--prefix", "astrocodice-replica/server"]
