import RevealMd from "@patarapolw/reveal-md-core";

let pug: any = {};
let markdown: any[] = [];

if (process.env.VUE_APP_PLUGIN) {
  const req = require.context(process.env.VUE_APP_PLUGIN!, false, /.js$/);
  for (const k of req.keys()) {
    if (k === "./pug.js") {
      pug = req(k);
    } else if (k === "./markdown.js") {
      markdown = req(k);
    } else {
      req(k);
    }
  }
}

const r = new RevealMd({
  pug,
  markdown,
  cdn: process.env.VUE_APP_REVEAL_CDN
});

const q = new URL(location.href).searchParams.get("q");

if (q) {
  fetch(q).then((res) => res.text()).then((res) => {
    r.update(res);
  })
} else {
  r.update(process.env.VUE_APP_PLACEHOLDER || "")
}