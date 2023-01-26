# syntax=docker/dockerfile:1
FROM --platform=linux/amd64 node:18
WORKDIR /
COPY . .
RUN apt update
RUN apt-get -y install default-jdk
RUN yarn install
CMD ["yarn", "start"]
