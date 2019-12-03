const { spawnSync } = require("child_process");

spawnSync("yarn", ["install"], {
  stdio: "inherit",
  cwd: "editor"
})

spawnSync("yarn", ["build"], {
  stdio: "inherit",
  cwd: "editor"
})

spawnSync("yarn", ["install"], {
  stdio: "inherit",
  cwd: "reveal"
})

spawnSync("yarn", ["clean"], {
  stdio: "inherit",
  cwd: "reveal"
})

spawnSync("yarn", ["build"], {
  stdio: "inherit",
  cwd: "reveal"
})