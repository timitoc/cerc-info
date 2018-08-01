FROM node:8


WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run apidoc

COPY wait-for-it.sh .
RUN chmod +x wait-for-it.sh

EXPOSE 3000

ENV DOCKER true

CMD ./wait-for-it.sh mysql:3306 -- npm start
