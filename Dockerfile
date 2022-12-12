FROM node:alpine

WORKDIR /usr/src/app

COPY . .

# Install python/pip
ENV PYTHONUNBUFFERED=1
RUN apk add --update --no-cache python3 && ln -sf python3 /usr/bin/python
RUN python3 -m ensurepip
RUN pip3 install --no-cache --upgrade pip setuptools

# Install gdown
RUN pip3 install gdown
RUN gdown --folder 1RmPGBn5qF5tveLlzGBtvXl-2x97Bilou -O public/files

RUN yarn install --frozen-lockfile

EXPOSE 80

ENTRYPOINT ["node", "server.js"]
