FROM node:7
WORKDIR /app
COPY package.json /app
RUN npm install
COPY . /app
CMD node gameserver.js
EXPOSE 8081
ARG walletPrivate
ENV walletPrivate = $private
ARG walletPublic
ENV walletPublic = $public
