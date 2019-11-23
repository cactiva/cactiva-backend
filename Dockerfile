FROM node:current-alpine
   
# Create Directory for the Container
WORKDIR /usr/src/app

# Install all Packages
RUN apk add yarn libpq python gcc musl-dev postgresql-dev
ADD . /usr/src/app

RUN yarn

CMD [ "yarn", "dev" ]
EXPOSE 10000