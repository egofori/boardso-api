FROM node:18-alpine as base

EXPOSE 3333

WORKDIR /usr/src/app

COPY package*.json ./
COPY prisma ./prisma/

RUN --mount=type=cache,target=/root/.npm

RUN npm install

COPY . .

RUN npm run build


# development
FROM base as dev

ENV NODE_ENV development

CMD ["npm", "run", "start:migrate:dev"]

# development
FROM base as staging

ENV NODE_ENV development

CMD ["npm", "run", "start:migrate:staging"]

# production
FROM base as prod

ENV NODE_ENV production

CMD ["npm", "run", "start:migrate:prod"]
