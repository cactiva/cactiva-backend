import * as jetpack from "fs-jetpack";

let settings = "{}" as any;

if (jetpack.exists("../settings.json")) {
  settings = jetpack.read("../settings.json");
} else {
  settings = jetpack.read("settings.json");
}
const config = JSON.parse(settings);

export default config;
