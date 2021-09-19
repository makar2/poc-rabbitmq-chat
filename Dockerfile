FROM node:14-alpine
WORKDIR /app
COPY package*.json ./
RUN npm i -g npm &&\
    npm ci
COPY . .
CMD npm start
