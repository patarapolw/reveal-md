const fs = require("fs");
const bodyParser = require("express");
const path = require("path");

const exampleFile = path.join(__dirname, "readme-slides.md");

const { FILENAME, EDIT } = process.env;

if (FILENAME) {
  process.env.VUE_APP_PLACEHOLDER = fs.readFileSync(FILENAME, "utf-8");
  process.env.VUE_APP_TITLE = FILENAME;
  process.env.VUE_APP_READ_FILE = "1";
} else {
  process.env.VUE_APP_PLACEHOLDER = fs.readFileSync(exampleFile, "utf-8");
  process.env.VUE_APP_TITLE = exampleFile;
}

process.env.VUE_APP_REVEAL_CDN = (
  fs.existsSync(path.join(__dirname, "public", "reveal.js")) && 
  fs.statSync(path.join(__dirname, "public", "reveal.js")).isDirectory()
) ? "/reveal-md/reveal.js/" : "https://cdn.jsdelivr.net/npm/reveal.js@3.8.0/";

module.exports = {
  publicPath: "/reveal-md",
  pages: {
    index: "src/main.ts",
    reveal: "src/reveal.ts"
  },
  devServer: {
    open: true,
    openPage: EDIT ? "" : "reveal.html",
    before(app) {
      if (FILENAME) {
        app.use(bodyParser.json());

        app.get("/data", (req, res) => {
          return res.send(fs.readFileSync(FILENAME, "utf8"))
        });

        app.put("/data", (req, res) => {
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