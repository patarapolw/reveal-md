const fs = require("fs");
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

const exampleFile = path.join(__dirname, "readme-slides.md");

let { FILENAME, EDIT, MEDIA, PLUGIN } = process.env;
let ROOT = null;

if (FILENAME) {
  ROOT = path.dirname(FILENAME);
  if (!MEDIA) {
    MEDIA = path.join(ROOT, "media");
  }

  if (!PLUGIN) {
    PLUGIN = path.join(ROOT, "plugin");
  }
  process.env.VUE_APP_PLUGIN = PLUGIN;

  process.env.VUE_APP_PLACEHOLDER = fs.readFileSync(FILENAME, "utf-8");
  process.env.VUE_APP_TITLE = FILENAME;
  process.env.VUE_APP_READ_FILE = "1";
} else {
  process.env.VUE_APP_PLACEHOLDER = fs.readFileSync(exampleFile, "utf-8");
  process.env.VUE_APP_TITLE = exampleFile;
}

const baseUrl = FILENAME ? "/" : "/reveal-md/"; 

process.env.VUE_APP_REVEAL_CDN = (
  fs.existsSync(path.join(__dirname, "public", "reveal.js")) && 
  fs.statSync(path.join(__dirname, "public", "reveal.js")).isDirectory()
) ? `${baseUrl}reveal.js/` 
  : "https://cdn.jsdelivr.net/npm/reveal.js@3.8.0/";

module.exports = {
  publicPath: baseUrl,
  pages: {
    index: "src/main.ts",
    reveal: "src/reveal.ts"
  },
  configureWebpack: {
    resolve: {
      modules: PLUGIN ? ["node_modules", PLUGIN] : ["node_modules"]
    },
    stats: "errors-only"
  },
  devServer: {
    open: true,
    openPage: EDIT ? "" : "reveal.html",
    before(app) {
      if (FILENAME) {
        app.use("/media", express.static(MEDIA));

        app.get("/data", (req, res) => {
          return res.send(fs.readFileSync(FILENAME, "utf8"))
        });

        app.put("/data", bodyParser.json(), (req, res) => {
          if (req.body.content) {
            fs.writeFileSync(FILENAME, req.body.content);
            return res.sendStatus(201);
          } else {
            return res.sendStatus(203);
          }
        })
      }
    }
  }
};