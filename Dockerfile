FROM node:current-alpine
   
# Create Directory for the Container
WORKDIR /usr/src/app

# Install all Packages
RUN npm i -g yarn 
ADD . /usr/src/app

RUN yarn

CMD [ "yarn", "dev" ]
EXPOSE 10000