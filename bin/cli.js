#!/usr/bin/env node

const yargs = require("yargs");
const path = require("path");
const { initServer } = require("./server");

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
  .option("no-media", {
    type: "boolean",
    describe: "No media should be loaded"
  })
  .coerce(["media", "plugin", "filename"], path.resolve)
  .help();

const { edit, filename, media, plugin } = argv;

initServer({
  edit,
  filename,
  media: argv["no-media"] ? null : media || path.join(path.dirname(filename), "media")
});