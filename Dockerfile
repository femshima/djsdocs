FROM node:alpine AS builder

WORKDIR /app
COPY package*.json ./

RUN npm i

COPY ./src ./src
RUN npm run build

FROM node:alpine AS runner

WORKDIR /app
ENV NODE_ENV production

COPY --from=builder app/dist ./dist
COPY package*.json ./
RUN sed '/prepare/d' -i package.json
RUN npm ci

CMD ["npm", "start"]
