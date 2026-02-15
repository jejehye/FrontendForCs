# 1) build stage (npm)
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
COPY .npmrc* ./

ARG NPM_CONFIG__AUTH
ENV NPM_CONFIG__AUTH=${NPM_CONFIG__AUTH}

RUN npm ci

COPY . .

RUN rm -rf dist \
  && mkdir -p dist \
  && npm run build \
  && cp ./*.html dist/ \
  && cp -R css javascript design dist/ \
  && if [ -d js ]; then cp -R js dist/; fi

# 2) runtime stage
FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
