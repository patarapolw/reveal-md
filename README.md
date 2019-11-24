# reveal-md

Reveal.js x Markdown (Showdown.js) editor and CLI.

Please see <https://patarapolw.github.io/reveal-md/reveal.html>

## Usage

```
reveal-md [options] <filename>

Read file in reveal-md

Positionals:
  filename  Path to the file to read

Options:
  --version    Show version number                                     [boolean]
  --edit, -e   Edit the file in editor                                 [boolean]
  --media, -m  Path to media folder                                     [string]
  --no-media   No media should be loaded                               [boolean]
  --help       Show help                                               [boolean]
```

## Adding media to reveal-md

By default, media can be put in the folder `media/` alongside the `*.md` file. The media can be referenced using the URL `/media/<FILENAME>`. Can be disabled using `--no-media` flag.

## Adding plugins to reveal-md

Also `plugin/` folder alongside `*.md` file will be loaded. Can be disabled using `--no-plugin` flag. For example, see <https://github.com/patarapolw/flatsrs>

## Global and Hidden slides

- Global scripting `<script></script>` and styling `<style></style>` is supported in slides marked with

```markdown
// global
content (Pug or HTML or extended Markdown)
```

- The slides marked with `// global` or `// hidden` will be hidden.

## Examples

Please see <https://github.com/patarapolw/flatsrs>
