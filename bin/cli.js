#!/usr/bin/env node

const yargs = require("yargs");
const path = require("path");
const fs = require("fs");
const dree = require("dree");
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
  .option("global", {
    alias: "g",
    type: "string",
    describe: "Path to global folder"
  })
  .option("no-global", {
    type: "boolean",
    describe: "No global should be loaded"
  })
  .coerce(["media", "plugin", "filename"], path.resolve)
  .help();

let { edit, filename, media, global } = argv;
let dirTree;
let root = filename;

if (fs.statSync(filename).isDirectory()) {
  dirTree = dree.scan(filename, {
    extensions: ["md"],
    exclude: [/\.git/, /node_modules/]
  });
  filename = undefined; 
} else {
  root = path.dirname(filename);
}

initServer({
  edit,
  filename,
  dirTree,
  media: argv["no-media"] ? null : media || path.join(root, "media"),
  global: argv["no-global"] ? null : global || path.join(root, "global"),
  root
});