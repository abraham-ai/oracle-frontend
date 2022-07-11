FROM node:alpine

WORKDIR /usr/src/app

COPY . .

RUN gdown --folder 1RmPGBn5qF5tveLlzGBtvXl-2x97Bilou -O public/files

RUN yarn install --frozen-lockfile

EXPOSE 80

ENTRYPOINT ["node", "server.js"]