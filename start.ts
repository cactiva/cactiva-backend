import config from "./config";
import Server from "./server";
import hasura from './hasura';

hasura();
const server = new Server();
server.start(config.backend.port);
   