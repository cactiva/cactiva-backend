/**
 * Example Controller for the Overnight web-framework.
 *
 * created by Sean Maxwell Aug 26, 2018
 */
import { Controller, Get, Middleware, Post, Put } from "@overnightjs/core";
import { ISecureRequest, JwtManager } from "@overnightjs/jwt";
import { Request, Response } from "express";
import { FORBIDDEN, OK } from "http-status-codes";
import * as Password from "node-php-password";
const db = require("../db").default;

export const jwtMgr = new JwtManager("12345678901234567890123456789012", "24h");

@Controller("api/jwt")
export class JwtController {
  @Get("test")
  private async test(req: Request, res: Response) {
    res.send("ok");
  }

  @Post("login")
  private async login(req: Request, res: Response) {
    const users = await db.any(
      "SELECT * FROM public.p_user WHERE username like $1 ",
      [req.body.username]
    );
    if (users.length > 0) {
      if (Password.verify(req.body.password, users[0].password)) {
        const u = users[0];
        const jwtStr = jwtMgr.jwt({
          ...u,
          time: new Date().toString(),
          "https://hasura.io/jwt/claims": {
            "x-hasura-allowed-roles": [u.pihak],
            "x-hasura-default-role": u.pihak,
            "x-hasura-user-id": u.id.toString()
          }
        });
        return res.status(OK).send({jwt: jwtStr, user: u});
      }
    }

    return res.status(FORBIDDEN).json({
      reason: "Username and/or password does not found"
    });
  }

  @Post("callProtectedRoute")
  @Middleware(jwtMgr.middleware)
  private callProtectedRoute(req: ISecureRequest, res: Response) {
    return res.status(OK).json({
      email: req.payload.email
    });
  }

  @Put("getJwtAlt/:fullname")
  private getJwtFromHandler(req: Request, res: Response) {
    const jwtStr = jwtMgr.jwt({
      fullName: req.params.fullname
    });
    return res.status(OK).json({
      jwt: jwtStr
    });
  }

  @Post("callProtectedRouteAlt")
  @Middleware(jwtMgr.middleware)
  private callProtectedRouteFromHandler(req: ISecureRequest, res: Response) {
    return res.status(OK).json({
      fullname: req.payload.fullName
    });
  }
}
