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
            "x-hasura-allowed-roles": [u.role],
            "x-hasura-default-role": u.role,
            "x-hasura-user-id": u.id.toString()
          }
        });
        return res.status(OK).send(jwtStr);
      }
    }

    return res.status(FORBIDDEN).json({
      reason: "Username and/or password does not found"
    });
  }

  @Post("verify")
  @Middleware(jwtMgr.middleware)
  private verify(req: ISecureRequest, res: Response) {
    console.log(req.payload)
    return res.status(OK).json(req.payload);
  }
}
