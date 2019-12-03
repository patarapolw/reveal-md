const matter = require("gray-matter");
const fs = require("fs");

const { content } = matter(fs.readFileSync("readme-reveal.md", "utf8"));

fs.writeFileSync("README.md", content
.replace(/\/\/ global\n[^]+?\n===/, "")
.replace(/\n(===|--)\n/g, "\n").trim());