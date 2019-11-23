FROM node:current-alpine

ENV TIME_ZONE=Asia/Jakarta
ENV ENV_NAME dev
ENV EGG_SERVER_ENV dev
ENV NODE_ENV dev
ENV NODE_CONFIG_ENV dev

# Set the timezone in docker
RUN apk --update add tzdata \\
   && cp /usr/share/zoneinfo/Asia/Jakarta /etc/localtime \\
   && echo "Asia/Jakarta" > /etc/timezone \\
   && apk del tzdata

   
# Create Directory for the Container
WORKDIR /usr/src/app

# Install all Packages
RUN npm i -g yarn 
ADD ../settings.json /usr/src/app
ADD . /usr/src/app

RUN yarn

CMD [ "yarn", "dev" ]
EXPOSE 10000