const fs = require("fs");
const { argv } = require("yargs");
const bodyParser = require("express");
const path = require("path");

const exampleFile = path.join(__dirname, "example.md");

if (argv.filename) {
  process.env.VUE_APP_PLACEHOLDER = fs.readFileSync(argv.filename, "utf-8");
  process.env.VUE_APP_TITLE = argv.filename;
  process.env.VUE_APP_READ_FILE = "1";
} else {
  process.env.VUE_APP_PLACEHOLDER = fs.readFileSync(exampleFile, "utf-8");
  process.env.VUE_APP_TITLE = exampleFile;
}

process.env.VUE_APP_REVEAL_CDN = (
  fs.existsSync(path.join(__dirname, "public", "reveal.js")) && 
  fs.statSync(path.join(__dirname, "public", "reveal.js")).isDirectory()
) ? "/reveal.js/" : "https://cdn.jsdelivr.net/npm/reveal.js@3.8.0/";

module.exports = {
  publicPath: "",
  pages: {
    index: "src/main.ts",
    reveal: "src/reveal.ts"
  },
  devServer: {
    before(app) {
      if (argv.filename) {
        app.use(bodyParser.json());

        app.get("/data", (req, res) => {
          return res.send(fs.readFileSync(argv.filename, "utf8"))
        });

        app.put("/data", (req, res) => {
          if (req.body.content) {
            fs.writeFileSync(argv.filename, req.body.content);
            return res.sendStatus(201);
          } else {
            return res.sendStatus(203);
          }
        })
      }
    }
  }
};