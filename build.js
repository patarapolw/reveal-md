const { spawnSync } = require("child_process");
const path = require("path");

const editorPath = path.join(__dirname, "editor");

spawnSync("yarn", ["install"], {
  stdio: "inherit",
  cwd: editorPath
});

spawnSync("yarn", ["build"], {
  stdio: "inherit",
  cwd: editorPath
});

const revealPath = path.join(__dirname, "reveal");

spawnSync("yarn", ["install"], {
  stdio: "inherit",
  cwd: revealPath
});

// spawnSync("yarn", ["clean"], {
//   stdio: "inherit",
//   cwd: revealPath
// });

spawnSync("yarn", ["build"], {
  stdio: "inherit",
  cwd: revealPath
});