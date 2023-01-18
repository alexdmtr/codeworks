# syntax=docker/dockerfile:1
FROM node:18
WORKDIR /
COPY . .
RUN apt update
RUN apt-get -y install default-jdk
RUN yarn install
CMD ["yarn", "start"]
EXPOSE 8080
