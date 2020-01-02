import { Controller, Get, Middleware, Post } from "@overnightjs/core";
import { ISecureRequest } from "@overnightjs/jwt";
import { Request, Response } from "express";
import * as fs from "fs";
import { FORBIDDEN, OK } from "http-status-codes";
import * as multer from "multer";
import * as path from "path";
import { jwtMgr } from './JwtController';
import jetpack = require("fs-jetpack");
import repo from '../repo';
const repoFolder = repo.folder;

const uploadPath = path.resolve(
  path.dirname(process.execPath) + repo.root
);

@Controller("api/repo")
export class RepoController {
  @Post("upload/")
  protected async upload(req: Request, res: Response) {
    const fileFilter = (req: any, file: any, cb: any) => {
      const { path } = req.body;
      const { mimetype, originalname } = file;
      const extFile = mimetype.split("/");
      jwtMgr.middleware(req, res, () => {
        const { role } = req.payload;
        if (!path || Object.keys(repoFolder).indexOf(path) === -1) {
          cb(new Error(`Upload '${originalname}' in folder '${path}/' is denied!`), false)
        } else if (!role || repoFolder[path].role.indexOf(role) === -1) {
          cb(new Error(`User role not allowed to upload file!`), false)
        } else if (repoFolder[path].fileType.indexOf(extFile[1]) === -1) {
          cb(new Error(`Upload '${originalname}' not allowed file type!`), false)
        }
      });
    }
    const storage = multer.diskStorage({
      destination: (req: any, file, cb) => {
        const { path } = req.body;
        cb(null, uploadPath + "/" + path);
      },
      filename: (req: any, file: any, cb: any) => {
        cb(null, file.originalname);
      }
    });
    const upload = multer({
      storage, fileFilter, limits: {
        // fileSize: !!path ? repoFolder[path].maxSize : 0
      }
    });
    const uploadHandler = upload.single("file");
    uploadHandler(req, res, e => {
      const file = req.file;
      if (!file) {
        res.status(FORBIDDEN).json("File not found!");
      }
      res.status(OK).json(file);
    });
  }

  // @Post("upload-old/")
  // private uploadOld(req: Request, res: Response) {
  //   const images = multer.diskStorage({
  //     destination: uploadPath + "/profile",
  //     filename: (req: any, file: any, callback: any) => {
  //       callback(null, file.originalname);
  //     }
  //   });
  //   const uploadMul = multer({ storage: images });
  //   const reqHandler = uploadMul.single("file");
  //   reqHandler(req, res, e => {
  //     const file = req.file;
  //     res.setHeader("Content-Type", "application/json");
  //     res.statusCode = 200;
  //     if (!file) {
  //       res.status(FORBIDDEN).json("File not found!");
  //     }
  //     res.status(OK).json(file);
  //   });
  // }

  // @Get("list")
  // private list(req: Request, res: Response) {
  //   const tree = jetpack.inspectTree(uploadPath, {
  //     relativePath: true
  //   });

  //   res.status(200).json(tree);
  // }

  // @Get("barcode/:fileName")
  // private readFileBarcode(req: Request, res: Response) {
  //   const filepath = uploadPath + "/barcode/" + req.params.fileName;
  //   if (fs.existsSync(filepath)) {
  //     fs.createReadStream(filepath).pipe(res);
  //   } else {
  //     res.status(404).send();
  //   }
  // }

  // @Get("profile/:fileName")
  // private readFileProfile(req: Request, res: Response) {
  //   const filepath = uploadPath + "/profile/" + req.params.fileName;
  //   if (fs.existsSync(filepath)) {
  //     fs.createReadStream(filepath).pipe(res);
  //   } else {
  //     res.status(404).send();
  //   }
  // }
}
