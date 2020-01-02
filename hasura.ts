import * as execa from "execa";
import * as jetpack from "fs-jetpack";
const config = require("./config").default;

export default () => {
  const db = config.db;
  const params = [
    "--host",
    db.host,
    "--port",
    db.port,
    "--user",
    db.user,
    "--password",
    db.password,
    "--dbname",
    db.database,
    "serve",
    "--server-host",
    "localhost",
    "--enable-console",
    "--disable-cors",
    "--admin-secret",
    config.hasura.secret,
    "--server-port",
    config.hasura.port
  ];
  console.log(`./hasura ${params.join(" ")}`);
  const cli = execa("./hasura", params, {
    all: true,
    cwd: jetpack.exists("./hasura") ? "./" : "../"
  } as any);
  if (cli && cli.all) cli.all.pipe(process.stdout);
};
