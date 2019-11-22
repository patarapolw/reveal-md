#!/usr/bin/env node

const yargs = require("yargs");
const path = require("path");
const { spawnSync } = require("child_process");

const { argv } = yargs
  .scriptName("reveal-md")
  .version(require(path.join(__dirname, "../package.json")).version)
  .command("$0 [options] <filename>", "Read file in reveal-md", (args) => {
    args.positional("filename", {
      describe: "Path to the file to read",
    })
  })
  .option("edit", {
    alias: "e",
    type: "boolean",
    describe: "Edit the file in editor"
  })
  .help();

const r = spawnSync(path.join(__dirname, "../node_modules/.bin/vue-cli-service"), ["serve"], {
  env: {
    ...process.env,
    EDIT: argv.edit ? "1" : undefined,
    FILENAME: argv.filename
  },
  cwd: path.dirname(__dirname),
  stdio: "inherit"
});