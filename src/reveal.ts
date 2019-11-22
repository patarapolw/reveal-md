import RevealMd from "@patarapolw/reveal-md-core";
const r = new RevealMd({
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