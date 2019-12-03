const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

if (!fs.existsSync(path.join(__dirname, "reveal.js"))) {
  spawnSync("git", [
    "clone",
    "https://github.com/hakimel/reveal.js.git"
  ], {
    cwd: __dirname,
    stdio: "inherit"
  })
}