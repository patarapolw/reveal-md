const fs = require("fs");
const path = require("path");

let baseUrl = "/"; 

if (process.env.GITHUB) {
  const exampleFile = path.join(__dirname, "readme-slides.md");
  process.env.VUE_APP_PLACEHOLDER = fs.readFileSync(exampleFile, "utf-8");
  process.env.VUE_APP_TITLE = exampleFile;

  baseUrl = "/reveal-md/";
}

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
    proxy: {
      "api/": {
        target: "http://localhost:24000"
      }
    }
  }
};