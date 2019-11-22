import RevealMd from "./reveal-md";
const r = new RevealMd();

r.update(process.env.VUE_APP_PLACEHOLDER || "");