const fs = require("fs");
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

const exampleFile = path.join(__dirname, "readme-slides.md");

let config = null;

if (process.env.CONFIG) {
  config = JSON.parse(process.env.CONFIG);
}

if (config) {
  const ROOT = path.dirname(config.filename);
  if (config.media === undefined) {
    config.media = path.join(ROOT, "media");
  }

  if (config.plugin === undefined) {
    config.plugin = path.join(ROOT, "plugin");
  }

  if (config.plugin) {
    process.env.VUE_APP_PLUGIN = config.plugin;
  }

  process.env.VUE_APP_PLACEHOLDER = fs.readFileSync(config.filename, "utf-8");
  process.env.VUE_APP_TITLE = config.filename;
  process.env.VUE_APP_READ_FILE = "1";
} else {
  process.env.VUE_APP_PLACEHOLDER = fs.readFileSync(exampleFile, "utf-8");
  process.env.VUE_APP_TITLE = exampleFile;
}

const baseUrl = config ? "/" : "/reveal-md/"; 

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
  devServer: {
    open: true,
    openPage: config 
      ? config.edit ? "" : "reveal.html"
      : "",
    before(app) {
      if (config) {
        if (config.media) {
          app.use("/media", express.static(config.media));
        }

        app.get("/data", (req, res) => {
          return res.send(fs.readFileSync(config.filename, "utf8"))
        });

        app.put("/data", bodyParser.json(), (req, res) => {
          if (req.body.content) {
            fs.writeFileSync(config.filename, req.body.content);
            return res.sendStatus(201);
          } else {
            return res.sendStatus(203);
          }
        })
      }
    }
  }
};