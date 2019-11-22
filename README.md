# reveal-md

Reveal.js x Markdown (Showdown.js) editor and CLI.

- Customizable by editing [/src/reveal.ts](/src/reveal.ts), and add your Showdown / HyperPug plugins here. You might use <https://github.com/patarapolw/indented-filter> to create plugins.
- Global scripting `<script></script>` and styling `<style></style>` is also supported in slides marked with

```markdown
// global
content (Pug or HTML or extended Markdown)
```

- The slides marked with `// global` or `// hidden` will be hidden.

For more information, please see <https://patarapolw.github.io/reveal-md>
