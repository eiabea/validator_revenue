FROM node:lts-alpine

COPY . /src

WORKDIR /src

RUN npm install

CMD ["npm", "start"]