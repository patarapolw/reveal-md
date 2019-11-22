# reveal-md

Reveal.js x Markdown (Showdown.js) CLI script.

- Customizable by editing [/src/reveal.ts](/src/reveal.ts), and add your Showdown / HyperPug plugins here. You might use <https://github.com/patarapolw/indented-filter> to create plugins.
- Global scripting `<script></script>` and styling `<style></style>` is also supported in slides marked with

```markdown
// global
content (Pug or HTML or extended Markdown)
```

- The slides marked with `// global` or `// hidden` will be hidden.

## Installation

```
git init
git submodule add https://github.com/patarapolw/reveal-md.git
npm i ./reveal-md
```

Or simply (but you won't be able to edit it.)

```
npm i https://github.com/patarapolw/reveal-md.git
```

## Usage

```
reveal-md [options] <filename>

Read file in reveal-md

Positionals:
  filename  Path to file to read

Options:
  --version   Show version number                                      [boolean]
  --edit, -e  Edit the markdown file in editor                         [boolean]
  --help      Show help                                                [boolean]
```

## Need a package for your own?

I have released the package for some time at `npm i @patarapolw/reveal-md`.

## Online viewer

You can do it at <https://patarapolw.github.io/reveal-md/reveal.html?q=<YOUR_URL_HERE>>

## Duplicated projects

- Sorry, I have created duplicates at <https://github.com/patarapolw/reveal-editor> and <https://github.com/patarapolw/reveal-md-server>
