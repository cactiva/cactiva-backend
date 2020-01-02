const initOptions = {};
const pgp = require("pg-promise")(initOptions);
const config = require("./config").default;
const db = pgp(config.db);

export default db;
