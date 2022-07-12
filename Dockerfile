FROM node:12.18-alpine AS builder
WORKDIR /usr/src/app
COPY ["package.json", "yarn.lock*", "./"]
RUN yarn install
COPY tsconfig*.json ./
COPY . .
RUN npm run build

FROM node:12.18-alpine
ENV NODE_ENV=production
COPY server_config/start.sh /start.sh
RUN apk add --no-cache \
    curl \
    bash \
    ruby \
    && chmod +x /start.sh
WORKDIR /usr/src/app
COPY ["package.json", "yarn.lock*", "./"]
RUN yarn install --prod 
COPY --from=builder /usr/src/app/dist/ dist/
COPY . .
CMD ["/start.sh"]
