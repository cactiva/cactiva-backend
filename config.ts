import * as jetpack from "fs-jetpack";
import * as path from "path";

let settings = "{}" as any;

if (jetpack.exists("../settings.json")) {
  settings = jetpack.read("../settings.json");
} else {
  settings = jetpack.read("settings.json");
}
const config = JSON.parse(settings);

export default config;

const isLocal = config.backend.host === "localhost";
export const execPath = isLocal
  ? path.resolve(path.dirname(__dirname) + "/")
  : path.dirname(process.execPath);