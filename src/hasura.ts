import * as execa from "execa";
const config = require("./config").default;

export default () => {
  const db = config.db;
  const cli = execa(
    "./hasura",
    [
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
    ],
    {
      all: true,
      cwd: "../"
    } as any
  );
  if (cli && cli.all) cli.all.pipe(process.stdout);
};