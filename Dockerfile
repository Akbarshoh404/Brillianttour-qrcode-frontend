FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

# Vite inlines VITE_* variables at build time, so the API URL must be
# supplied as a build argument (see docker-compose.yml).
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

RUN npm run build

FROM nginx:1.27-alpine AS runtime

# nginx's official entrypoint auto-renders *.template files in
# /etc/nginx/templates/ via envsubst, substituting ${PORT} below. This lets
# PaaS platforms (Render, Railway, Coolify, etc.) that inject a dynamic PORT
# work without any manual config — defaults to 80 otherwise.
ENV PORT=80
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -qO- http://localhost:${PORT}/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
