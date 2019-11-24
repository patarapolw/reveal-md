const fs = require("fs");
const path = require("path");
const express = require("express");
const { Router } = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const open = require("open");
const qs = require("querystring");

function initServer(config) {
  function resolveFilename(s) {
    s = s.replace(/^@\//, config.root);
    return path.resolve(config.filename ? path.relative(config.filename, s) : s);
  }

  const router = Router();
  router.use(cors());

  router.get("/", (req, res) => {
    return res.json(config);
  });

  router.get("/data", (req, res) => {
    const { filename } = req.query;
    return res.send(fs.readFileSync(resolveFilename(filename), "utf8"))
  });

  router.put("/data", bodyParser.json(), (req, res) => {
    const { filename, content } = req.body;

    fs.writeFileSync(resolveFilename(filename), content);
    return res.sendStatus(201);
  });

  const app = express();

  app.use("/api", router);

  if (config.media) {
    app.use("/media", express.static(config.media));
  }

  app.use(express.static(path.join(__dirname, "../web/dist")));

  const port = process.env.PORT || 24000;
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);

    if (!config.filename || config.edit) {
      open(`http://localhost:${port}`);
    } else {
      open(`http://localhost:${port}/reveal.html?${qs.stringify({
        filename: this.filename
      })}`);
    }
  });
}

module.exports = {
  initServer
};
