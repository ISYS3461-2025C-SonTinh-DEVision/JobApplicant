FROM node:20-alpine AS build
WORKDIR /app

ENV PATH="/app/node_modules/.bin:${PATH}"

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:1.27-alpine
WORKDIR /usr/share/nginx/html

COPY --from=build /app/build .

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
