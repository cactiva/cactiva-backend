/**
 * Examples for the Overnight web-framework.
 *
 * created by Sean Maxwell Aug 26, 2018
 */

import * as bodyParser from "body-parser";
import * as cookieParser from "cookie-parser";
import * as cors from "cors";
import * as controllers from "../controllers";
import * as proxy from "http-proxy-middleware";
import { Server } from "@overnightjs/core";
import config from "./config";
import { jwtMgr } from './controllers';

const auth = require("basic-auth");
const adminAuthIP = [] as any;
class MainServer extends Server {
  constructor() {
    super(true);
    this.app.use(cors());
    this.app.use(cookieParser());
    this.app.use(
      "/hasura",
      proxy({
        target: "http://127.0.0.1:" + config.hasura.port,
        changeOrigin: true,
        pathRewrite: (path, req) => {
          return path.substr("/hasura".length);
        },
        onProxyReq: (proxyReq: any, req: any, res: any) => {
          if (config.backend.mode === "dev") {
            proxyReq.setHeader("x-hasura-admin-secret", config.hasura.secret);
          }
          //   const secret = req.headers["x-hasura-admin-secret"];
          //   if (secret) {
          //     proxyReq.setHeader("x-hasura-admin-secret", secret);
          //   } else {
          //     jwtMgr.middleware(req, res, () => {
          //       if (!req.payload) {
          //         const ip =
          //           req.headers["x-forwarded-for"] ||
          //           req.connection.remoteAddress;
          //         if (adminAuthIP.indexOf(ip) < 0) {
          //           let user = auth(req);
          //           if (
          //             user === undefined ||
          //             user["name"] !== "admin" ||
          //             user["pass"] !== config.hasura.secret
          //           ) {
          //             res.statusCode = 401;
          //             res.setHeader(
          //               "WWW-Authenticate",
          //               `Basic realm="${config.name}"`
          //             );
          //             res.end("Unauthorized");
          //             return;
          //           }
          //           adminAuthIP.push(ip);
          //         }
          //       }
          //     });
          //   }
        }
      })
    );
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: true }));
    this.setupControllers();
  }

  private setupControllers(): void {
    const controllerInstances = [];
    for (const name of Object.keys(controllers)) {
      const controller = (controllers as any)[name];
      if (typeof controller === "function") {
        controllerInstances.push(new controller());
      }
    }

    super.addControllers(controllerInstances);
  }

  public start(port?: number): void {
    port = port || 3000;
    this.app.listen(port, () => {
      console.log(`Backend started on port: ${port}`);
    });
  }
}

export default MainServer;
