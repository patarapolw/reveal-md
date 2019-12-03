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
    s = s.replace(/^@\//, config.root + "/");
    return path.resolve(config.filename ? path.relative(config.filename, s) : s);
  }

  const router = Router();
  router.use(cors());

  router.get("/", (req, res) => {
    return res.json(config);
  });

  router.get("/data", (req, res) => {
    const { filename } = req.query;
    try {
      return res.send(fs.readFileSync(resolveFilename(filename), "utf8"));
    } catch(e) {
      return res.send("");
    }
  });

  router.put("/data", bodyParser.json(), (req, res) => {
    const { filename, content } = req.body;

    fs.writeFileSync(resolveFilename(filename), content);
    return res.sendStatus(201);
  });

  const app = express();

  app.use("/api", router);
  app.use("/reveal-md", express.static(path.join(__dirname, "../dist")));
  app.use("/reveal.js", express.static(path.join(__dirname, "../reveal.js")))

  const port = process.env.PORT || 24000;
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);

    if (!process.env.NO_OPEN) {
      if (!config.filename || config.edit) {
        open(`http://localhost:${port}/reveal-md/`);
      } else {
        open(`http://localhost:${port}/reveal-md/reveal/?${qs.stringify({
          filename: this.filename
        })}`);
      }
    }
  });
}

module.exports = {
  initServer
};
