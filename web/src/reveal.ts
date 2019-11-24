import RevealMd from "./lib/reveal-md";
import qs from "querystring";

const r = new RevealMd(process.env.VUE_APP_REVEAL_CDN!);

const sp = new URL(location.href).searchParams;

if (sp.get("q")) {
  fetch(sp.get("q")!).then((res) => res.text()).then((res) => {
    r.update(res);
  });
} else if (sp.get("filename")) {
  fetch("/api/data?" + qs.stringify({
    filename: sp.get("filename")
  })).then((res) => res.text()).then((res) => {
    r.update(res);
  });
} else {
  r.update(process.env.VUE_APP_PLACEHOLDER || "")
}