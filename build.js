const { spawnSync } = require("child_process");
const path = require("path");

if (!process.env.NO_EDITOR) {
  const editorPath = path.join(__dirname, "editor");

  spawnSync("yarn", ["install"], {
    stdio: "inherit",
    cwd: editorPath
  });
  
  spawnSync("yarn", ["build"], {
    stdio: "inherit",
    cwd: editorPath
  });
} else {
  const rimraf = require("rimraf");
  rimraf.sync(path.join(__dirname, "dist"));
}

const revealPath = path.join(__dirname, "reveal");

spawnSync("yarn", ["install"], {
  stdio: "inherit",
  cwd: revealPath
});

spawnSync("yarn", ["build"], {
  stdio: "inherit",
  cwd: revealPath
});