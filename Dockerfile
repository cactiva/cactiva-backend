FROM node:current-alpine
   
# Create Directory for the Container
WORKDIR /usr/src/app

# Install all Packages
RUN apk add yarn libpq python
ADD . /usr/src/app

RUN yarn

CMD [ "yarn", "dev" ]
EXPOSE 10000