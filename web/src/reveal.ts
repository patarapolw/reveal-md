import RevealMd from "./lib/reveal-md";
import qs from "querystring";

(async () => {
  try {
    const globs = await fetch("/global/").then((r) => r.json());
    for (const css of globs.css) {
      document.head.appendChild(Object.assign(document.createElement("style"), {
        innerHTML: await fetch(`/global/${css}`).then((r) => r.text())
      }));
    }
    for (const js of globs.js) {
      eval(await fetch(`/global/${js}`).then((r) => r.text()));
    }
  } catch(e) {}

  const r = new RevealMd(process.env.VUE_APP_REVEAL_CDN!);
  const sp = new URL(location.href).searchParams;

  if (sp.get("q")) {
    fetch(sp.get("q")!).then((res) => res.text()).then((res) => {
      r.update(res);
    });
  } else if (sp.get("filename")) {
    const text = await fetch("/api/data?" + qs.stringify({
      filename: sp.get("filename")
    })).then((res) => res.text());

    r.update(text);
  } else {
    r.update(process.env.VUE_APP_PLACEHOLDER || "")
  }
})().catch((e) => console.error(e));