const serveStatic = require("serve-static");
const fs = require("fs");

process.env.VUE_APP_PLACEHOLDER = fs.readFileSync("../readme-reveal.md", "utf8");

const baseUrl = process.env.BASE_URL || "";

module.exports = {
  devServer: {
    proxy: {
      "/api": {
        target: "http://localhost:3000"
      }
    },
    before(app) {
      app.use(`${baseUrl}/reveal`, serveStatic("../dist/reveal"));
    }
  },
  publicPath: baseUrl,
  outputDir: "../dist"
};