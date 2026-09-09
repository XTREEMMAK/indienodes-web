# syntax=docker/dockerfile:1

# Static output is portable; build on the builder's native CPU without QEMU.
FROM --platform=$BUILDPLATFORM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY .eleventy.js ./
COPY src ./src
RUN npm run build

FROM caddy:2-alpine AS runtime
ARG PUID=1000
ARG PGID=1000

# Numeric ownership also supports IDs already present in the base image.
RUN mkdir -p /config/caddy /data/caddy && \
    chown -R ${PUID}:${PGID} /config /data
COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=build --chown=${PUID}:${PGID} /app/_site /srv
USER ${PUID}:${PGID}
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -qO /dev/null http://127.0.0.1:8080/ || exit 1
CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]
