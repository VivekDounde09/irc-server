FROM node:18-alpine

WORKDIR /irc

ARG PORT

RUN npm install pm2 --location=global

COPY package.json .
COPY package-lock.json .

RUN npm install

EXPOSE ${PORT}

COPY . .

CMD ["pm2-runtime", "server.js", "--name",  "irc",   "--wait-ready", "--listen-timeout 60000", "--kill-timeout", "60000"]
