import * as jetpack from "fs-jetpack";
const config = JSON.parse(jetpack.read("../settings.json") || "{}");

export default config;
