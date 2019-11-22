---
# Yaml front matter is allowed.
title: reveal-md
theme: solarized  # try solarized, serif or white
---
// global
```pug
style.
  h1, h2, h3, h4, h5, h6 {
    text-transform: uppercase !important;
  }
  
  p, li {
    font-size: 2rem;
  }
```
===

# Reveal-MD

Reveal.js x Markdown (Showdown.js) editor and CLI.

--

- Customizable by editing [/src/reveal.ts](/src/reveal.ts), and add your Showdown / HyperPug plugins here. You might use <https://github.com/patarapolw/indented-filter> to create plugins.

--

- Global scripting `<script></script>` and styling `<style></style>` is also supported in slides marked with

```markdown
// global
content (Pug or HTML or extended Markdown)
```

- The slides marked with `// global` or `// hidden` will be hidden.

--

HTML is also supported

--
```html
<small>Next slide</small>
```

===

## Installation

```
git init
git submodule add https://github.com/patarapolw/reveal-md.git
npm i ./reveal-md
```

--

Or simply (but you won't be able to edit it.)

```
npm i https://github.com/patarapolw/reveal-md.git
```

===

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

===

## Save as HTML (and associated assets folder)

This is best done by [downloading complete web page, in associated web browser](https://www.makeuseof.com/tag/save-complete-webpage-offline-reading/).

Using web crawlers, like <https://github.com/website-scraper/node-website-scraper> won't work, because some JavaScript in Reveal.js is dynamically injected.

===

## Need a package for your own?

I have released the package for some time at `npm i @patarapolw/reveal-md`.

===

## Online viewer

You can do it at <https://patarapolw.github.io/reveal-md/reveal.html?q=\<YOUR_URL_HERE>>

===

## Duplicated projects

- Sorry, I have created duplicates at 
  - <https://github.com/patarapolw/reveal-editor>
  - <https://github.com/patarapolw/reveal-md-server>

===

## Contributions

- Please send suggestions at <https://github.com/patarapolw/reveal-md/issues>
