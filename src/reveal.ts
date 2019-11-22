import RevealMd from "./reveal-md";
const r = new RevealMd();

const q = new URL(location.href).searchParams.get("q");

if (q) {
  fetch(q).then((res) => res.text()).then((res) => {
    r.update(res);
  })
} else {
  r.update(process.env.VUE_APP_PLACEHOLDER || "")
}