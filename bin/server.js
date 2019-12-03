const fs = require("fs");
const path = require("path");
const express = require("express");
const { Router } = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const open = require("open");
const qs = require("querystring");

function initServer(config) {
  const router = Router();
  router.use(cors());

  router.get("/", (req, res) => {
    return res.json(config);
  });

  router.get("/data", (req, res) => {
    const { filename } = req.query;
    try {
      return res.send(fs.readFileSync(path.resolve(config.root, filename), "utf8"));
    } catch(e) {
      console.error(e);
      return res.sendStatus(500);
    }
  });

  router.put("/data", bodyParser.json(), (req, res) => {
    const { filename, content } = req.body;

    fs.writeFileSync(path.resolve(config.root, filename), content);
    return res.sendStatus(201);
  });

  const app = express();

  app.use("/api", router);
  app.use(express.static(path.join(__dirname, "../dist")));
  app.use("/reveal.js", express.static(path.join(__dirname, "../reveal.js")))

  const port = process.env.PORT || 24000;
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);

    if (!process.env.NO_OPEN) {
      if (!config.filename || config.edit) {
        open(`http://localhost:${port}/`);
      } else {
        open(`http://localhost:${port}/reveal/?${qs.stringify({
          filename: config.filename
        })}`);
      }
    }
  });
}

module.exports = {
  initServer
};
