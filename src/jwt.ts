import { OK } from "http-status-codes";
import { JwtManager, ISecureRequest } from "@overnightjs/jwt";
import { Controller, Middleware, Get, Post } from "@overnightjs/core";
import { Request, Response } from "express";

const jwtMgr = new JwtManager("secret", "10h");

@Controller("api/jwt")
export class JwtPracticeController {
  @Get("getJwtAlt/:fullname")
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
