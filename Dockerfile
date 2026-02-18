# 1) build stage (npm)
FROM node:18-alpine AS build
WORKDIR /app

COPY package*.json ./
COPY .npmrc* ./

ARG NPM_CONFIG__AUTH
ENV NPM_CONFIG__AUTH=${NPM_CONFIG__AUTH}

RUN npm ci

COPY . .

RUN ./scripts/build.sh

# 2) runtime stage
FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
