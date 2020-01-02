import * as jetpack from "fs-jetpack";

let settings = "{}" as any;

if (jetpack.exists("../repo.json")) {
  settings = jetpack.read("../repo.json");
} else {
  settings = jetpack.read("repo.json");
}
const repo = JSON.parse(settings);

export default repo;
