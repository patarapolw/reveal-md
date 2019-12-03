#!/usr/bin/env node

const yargs = require("yargs");
const path = require("path");
const fs = require("fs");
const dree = require("dree");
const { initServer } = require("./server");

const { argv } = yargs
  .scriptName("reveal-md")
  .version(require(path.join(__dirname, "../package.json")).version)
  .command("$0 [options] <fileOrDir>", "Read file or directory or in reveal-md", (args) => {
    args.positional("fileOrDir", {
      describe: "Path to the file or directory to read",
    })
  })
  .option("edit", {
    alias: "e",
    type: "boolean",
    describe: "Edit the file in editor"
  })
  .coerce(["fileOrDir"], path.resolve)
  .help();

let { edit, fileOrDir } = argv;
let dirTree;
let root = fileOrDir;

if (fs.statSync(fileOrDir).isDirectory()) {
  dirTree = dree.scan(fileOrDir, {
    extensions: ["md"],
    exclude: [/\.git/, /node_modules/]
  });
  fileOrDir = undefined; 
} else {
  root = path.dirname(fileOrDir);
}

initServer({
  edit,
  filename: fileOrDir,
  dirTree,
  root
});