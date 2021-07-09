FROM node:15.6

WORKDIR /usr/src/bot
COPY package*.json ./
COPY yarn.lock ./
RUN yarn

COPY . .
CMD ["yarn", "dev"]