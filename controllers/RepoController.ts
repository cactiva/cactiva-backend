import { Controller, Post, Get } from "@overnightjs/core";
import { Request, Response } from "express";
import * as fs from "fs";
import { FORBIDDEN, OK } from "http-status-codes";
import * as multer from "multer";
import * as path from "path";
import { execPath } from "../config";
import repo from "../repo";
import { jwtMgr } from "./JwtController";
import jetpack = require("fs-jetpack");
const repoFolder = repo.folder;

const uploadPath = path.resolve(execPath + repo.root);

@Controller("api/repo")
export class RepoController {
  @Post("upload/")
  protected upload(req: Request, res: Response) {
    try {
      const fileFilter = (req: any, file: any, cb: any) => {
        const { path } = req.body;
        const { mimetype, originalname } = file;
        const extFile = mimetype.split("/");
        jwtMgr.middleware(req, res, () => {
          const { role } = req.payload;
          if (!path || Object.keys(repoFolder).indexOf(path) === -1) {
            cb(
              `Upload '${originalname}' in folder '${path}/' is denied!`,
              false
            );
          } else if (!role || repoFolder[path].role.indexOf(role) === -1) {
            cb(`User role not allowed to upload file!`, false);
          } else if (repoFolder[path].fileType.indexOf(extFile[1]) === -1) {
            cb(`Upload '${originalname}' not allowed file type!`, false);
          } else {
            cb(null, true);
          }
        });
      };
      const storage = multer.diskStorage({
        destination: (req: any, file, cb) => {
          const { path } = req.body;
          const dir = uploadPath + "/" + path;
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }
          cb(null, dir);
        },
        filename: (req: any, file: any, cb: any) => {
          cb(null, file.originalname);
        }
      });
      const upload = multer({
        storage,
        fileFilter
      });
      const uploadHandler = upload.single("file");
      uploadHandler(req, res, e => {
        if (e) {
          return res.status(FORBIDDEN).json({ error: e });
        } else {
          const path = req.body.path;
          const file = req.file;
          const maxSize = repoFolder[path].maxSize;
          if (file.size > maxSize) {
            res.status(FORBIDDEN).json({
              error: `Upload failed, max file size is ${maxSize / 1048576}Mb`
            });
            return fs.unlinkSync(file.path);
          }
          return res.status(OK).json(file);
        }
      });
    } catch (e) {
      return res.status(FORBIDDEN).json({ error: e });
    }
  }

  @Post("delete/")
  protected delete(req: Request, res: Response) {
    const { folder, filename } = req.body;
    if (!folder || !filename)
      return res.status(FORBIDDEN).json({ error: "Not found!" });
    try {
      jwtMgr.middleware(req, res, () => {
        const payload = (req as any).payload;
        const dir = uploadPath + "/" + path;

        if (
          Object.keys(repoFolder).indexOf(folder) === -1 ||
          !fs.existsSync(dir)
        ) {
          return res.status(FORBIDDEN).json({ error: "Not found!" });
        } else if (
          !payload ||
          repoFolder[folder].role.indexOf(payload.role) === -1
        ) {
          return res.status(FORBIDDEN).json({ error: "Unauthorize!" });
        }
        fs.unlinkSync(dir);
        return res.status(OK).json(`Delete ${folder}/${filename} success!`);
      });
    } catch (e) {
      return res.status(FORBIDDEN).json({ error: e });
    }
  }

  @Get("tree/:folder")
  protected tree(req: Request, res: Response) {
    const { folder } = req.params;
    if (!folder) return res.status(FORBIDDEN).json({ error: "Not found!" });
    jwtMgr.middleware(req, res, () => {
      const payload = (req as any).payload;

      if (Object.keys(repoFolder).indexOf(folder) === -1) {
        return res.status(FORBIDDEN).json({ error: "Not found!" });
      } else if (
        !payload ||
        repoFolder[folder].role.indexOf(payload.role) === -1
      ) {
        return res.status(FORBIDDEN).json({ error: "Unauthorize!" });
      }
      const tree = jetpack.inspectTree(`${uploadPath}/${folder}`, {
        relativePath: true
      });
      return res.status(200).json(tree);
    });
  }

  @Get("view/:folder/:filename")
  protected get(req: Request, res: Response) {
    const { folder, filename } = req.params;
    if (!folder || !filename)
      return res.status(FORBIDDEN).json({ error: "Not found!" });
    jwtMgr.middleware(req, res, () => {
      const payload = (req as any).payload;

      if (Object.keys(repoFolder).indexOf(folder) === -1) {
        return res.status(FORBIDDEN).json({ error: "Not found!" });
      } else if (
        repoFolder[folder].permission === "private" &&
        repoFolder[folder].role.length > 0
      ) {
        if (!payload || repoFolder[folder].role.indexOf(payload.role) === -1) {
          return res.status(FORBIDDEN).json({ error: "Unauthorize!" });
        }
      }
      const filepath = `${uploadPath}/${folder}/${filename}`;
      if (fs.existsSync(filepath)) {
        return fs.createReadStream(filepath).pipe(res);
      }
      return res.status(FORBIDDEN).json({ error: "Not found!" });
    });
  }
}
