#Use the official Node.js image with Node v7 as the template for this Docker image 
FROM node:7

#Set the working directory of the docker image 
WORKDIR /app

#By coping package.json, we prevent the need to rebuild from scratch when changing some files
COPY package.json /app

#Install the necessary Node dependencies 
RUN npm install

#Copy the rest of the files, including gameserver.js
COPY . /app

#Run our server
CMD node gameserver.js

#8081 is our designated outward facing port of the Docker server
EXPOSE 8081

#We will take in as variables the game public and private key
ARG walletPrivate
ENV walletPrivate = $private
ARG walletPublic
ENV walletPublic = $public
