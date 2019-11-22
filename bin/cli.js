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
  .option("media", {
    alias: "m",
    type: "string",
    describe: "Path to media folder"
  })
  .option("plugin", {
    alias: "p",
    type: "string",
    describe: "Path to plugin folder"
  })
  .option("no-media", {
    type: "boolean",
    describe: "No media should be loaded"
  })
  .option("no-plugin", {
    type: "boolean",
    describe: "No plugin should be loaded"
  })
  .coerce(["media", "plugin", "filename"], path.resolve)
  .help();

const r = spawnSync(path.join(__dirname, "../node_modules/.bin/vue-cli-service"), ["serve"], {
  env: {
    ...process.env,
    EDIT: argv.edit ? "1" : undefined,
    FILENAME: argv.filename,
    MEDIA: argv["no-media"] ? undefined : argv.media,
    PLUGIN: argv["no-plugin"] ? undefined : argv.plugin
  },
  cwd: path.dirname(__dirname),
  stdio: "inherit"
});