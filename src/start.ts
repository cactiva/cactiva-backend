import * as path from "path";
import * as fs from "fs";
import Server from "./server";

const server = new Server();
server.start(3000);
