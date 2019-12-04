const serveStatic = require("serve-static");
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