const serveStatic = require("serve-static");
const fs = require("fs");

process.env.VUE_APP_PLACEHOLDER = fs.readFileSync("../readme-editor.md", "utf8");

module.exports = {
  devServer: {
    proxy: {
      "/api": {
        target: "http://localhost:3000"
      }
    },
    before(app) {
      app.use("/reveal-md/reveal", serveStatic("../dist/reveal"));
    }
  },
  publicPath: "/reveal-md",
  outputDir: "../dist"
};