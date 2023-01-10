FROM node:16-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm i

COPY . .

RUN npm run build

FROM node:16-alpine

WORKDIR /app

COPY --from=build app/package*.json ./

RUN npm ci --only=production

COPY --from=build app/dist ./

CMD ["node", "."]