# 1) build stage
FROM alpine:3.20 AS build
WORKDIR /app
COPY . .

RUN apk add --no-cache bash
RUN bash ./scripts/build.sh

# 2) runtime stage
FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]