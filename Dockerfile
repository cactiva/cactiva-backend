FROM node:stretch
   
# Create Directory for the Container
WORKDIR /usr/src/app

# Install all Packages
RUN apk add yarn libpq python gcc musl-dev postgresql-dev g++ make wget
ADD . /usr/src/app

RUN wget https://graphql-engine-cdn.hasura.io/server/latest/linux-amd64
RUN mv linux-amd64 hasura
RUN chmod +x /usr/src/app/hasura
RUN yarn

CMD [ "yarn", "dev" ]
EXPOSE 10000