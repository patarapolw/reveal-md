import pug, { IHyperPugFilters } from "hyperpug";
import showdown from "showdown";
import h from "hyperscript"
import matter from "gray-matter";

declare global {
  interface Window {
    Reveal: RevealStatic;
    revealMd: RevealMd;
    hljs: any;
  }
}

export const options: IRevealOptions = {
  cdn: process.env.VUE_APP_REVEAL_CDN!,
  css: [
    "css/reveal.css"
  ],
  js: [
    "js/reveal.js",
    { async: true, src: "plugin/highlight/highlight.js" }
  ]
}

export interface ISlide {
  lang?: string;
  comment?: string;
  content: string;
  raw: string;
}

export interface IRevealOptions {
  cdn: string;
  css: string[];
  js: (string | { async: boolean, src: string })[];
}

export class RevealMd {
  raw: ISlide[][] = [[]];
  queue: {
    ready: Array<(reveal?: RevealStatic) => void>
  } = {
    ready: []
  };

  mdConverter: showdown.Converter;
  pugConverter: (s: string) => string;

  revealOptions: IRevealOptions;

  private _headers: any = {};

  constructor(public revealMdOptions: {
    markdown?: showdown.ShowdownExtension[];
    pug?: IHyperPugFilters;
  } = {}, revealOptions: Partial<IRevealOptions> = {}) {
    this.revealOptions = JSON.parse(JSON.stringify(options));

    this.revealOptions.cdn = revealOptions.cdn || this.revealOptions.cdn;
    if (revealOptions.css) {
      this.revealOptions.css.push(...revealOptions.css);
    }
    if (revealOptions.js) {
      this.revealOptions.js.push(...revealOptions.js);
    }

    this.mdConverter = new showdown.Converter();
    this.mdConverter.setFlavor("github");
    if (revealMdOptions.markdown) {
      revealMdOptions.markdown.forEach((x) => this.mdConverter.addExtension(x));
    }

    const pugFilters = {
      markdown: (text: string) => {
        return this.mdConverter.makeHtml(text);
      },
      ...(revealMdOptions.pug || {})
    };

    this.pugConverter = pug.compile({ filters: pugFilters });

    window.revealMd = this;

    for (const href of this.revealOptions.css) {
      document.body.appendChild(Object.assign(document.createElement("link"), {
        class: "reveal-css",
        href: this.revealOptions.cdn + href,
        rel: "stylesheet",
        type: "text/css"
      }));
    }

    document.body.appendChild(Object.assign(document.createElement("link"), {
      id: "reveal-theme",
      class: "reveal-css",
      href: this.revealOptions.cdn + "css/theme/white.css",
      rel: "stylesheet",
      type: "text/css"
    }));

    for (let js of this.revealOptions.js) {
      if (typeof js === "string") {
        document.body.appendChild(Object.assign(document.createElement("script"), {
          class: "reveal-js",
          type: "text/javascript",
          src: this.revealOptions.cdn + js
        }));
      } else {
        const { async, src } = js;
        document.body.appendChild(Object.assign(document.createElement("script"), {
          class: "reveal-js",
          async,
          type: "text/javascript",
          src: this.revealOptions.cdn + src
        }));
      }
    }

    window.addEventListener("load", () => {
      const reveal = window.Reveal;

      if (reveal) {
        reveal.initialize();

        this.onReady(() => {
          if (this.queue.ready.length > 0) {
            this.queue.ready.forEach((it) => it(reveal));
            reveal.slide(-1, -1, -1);
            reveal.sync();
          }
        });
      }
    });
  }

  get headers(): any {
    return this._headers;
  }

  set headers(h: any) {
    this.onReady((reveal) => {
      if (h.theme) {
        (document.getElementById("reveal-theme") as HTMLLinkElement).href = this.revealOptions.cdn + `css/theme/${h.theme}.css`;
      }

      Array.from(document.getElementsByClassName("reveal-css")).forEach((el) => {
        const link = el as HTMLLinkElement;
        if (!link.href.startsWith(this.revealOptions.cdn)) {
          link.href = this.revealOptions.cdn + link.href;
        }
      });

      Array.from(document.getElementsByClassName("reveal-js")).forEach((el) => {
        const script = el as HTMLScriptElement;
        if (!script.src.startsWith(this.revealOptions.cdn)) {
          script.src = this.revealOptions.cdn + script.src;
        }
      });

      if (reveal) {
        reveal.configure(h);
      }
    });

    this._headers = h;
  }

  update(markdown: string) {
    const { data, content } = matter(markdown);

    this.headers = data;

    const setBody = () => {
      let reverseOffset = 0;

      const newRaw = content.split(/\r?\n===\r?\n/g).map((el, x) => {
        const sectionRaw = this.parseSlide(el);
        if (sectionRaw.comment) {
          const lines = sectionRaw.comment.split("\n");
          const line = lines[0];
          if (["hidden", "global"].includes(line)) {
            if (line === "global") {
              const global = document.getElementById("global");
              if (global) {
                global.innerHTML = sectionRaw.content;
              }
            }

            reverseOffset++;
            return null;
          }
        }

        x -= reverseOffset;
        this.raw[x] = this.raw[x] || [];

        return el.split(/\r?\n--\r?\n/g).map((ss, y) => {
          const thisRaw = this.parseSlide(ss);

          if (!this.raw[x][y] || (this.raw[x][y] && this.raw[x][y].raw !== ss)) {
            const container = document.createElement("div");
            container.className = "container";
            container.innerHTML = thisRaw.content;

            let subSection = this.getSlide(x, y);
            let section = this.getSlide(x);

            if (section && subSection) {
              const oldContainers = subSection.getElementsByClassName("container");
              Array.from(oldContainers).forEach((el) => el.remove());
              subSection.appendChild(container);
            } else {
              const ss = document.createElement("section");
              ss.append(container);

              if (section) {
                section.appendChild(ss);
              } else {
                const s = document.createElement("section");
                s.append(ss);
                document.querySelector(".reveal .slides")!.appendChild(s);
              }
            }

            Array.from(container.querySelectorAll("pre code:not(.hljs)")).forEach((el) => {
              if (window.hljs) {
                window.hljs.highlightBlock(el);
              }
            });
          }

          return thisRaw;
        });
      }).filter((el) => el !== null) as ISlide[][];

      this.raw.map((el, x) => {
        el.map((ss, j) => {
          const y = el.length - j - 1;

          if (!newRaw[x] || !newRaw[x][y]) {
            const subSection = this.getSlide(x, y);
            if (subSection) {
              subSection.remove();
            }
          }
        });

        if (!newRaw[x]) {
          const section = this.getSlide(x);
          if (section) {
            section.remove();
          }
        }
      });

      this.raw = newRaw;
    };

    setBody();
  }

  onReady(fn: (reveal?: RevealStatic) => void) {
    const reveal = window.Reveal;
    if (reveal && reveal.isReady()) {
      fn(reveal);
      // reveal.slide(-1, -1, -1);
      // reveal.sync();
    } else {
      this.queue.ready.push((fn));
    }
  }

  once(type: string, listener: () => void) {
    const reveal = window.Reveal;
    if (reveal && reveal.isReady) {
      const removeOnDone = () => {
        listener();
        reveal.removeEventListener(type, removeOnDone);
      }

      reveal.addEventListener(type, removeOnDone);
    } else {
      this.queue.ready.push(listener);
    }
  }

  parseSlide(text: string): ISlide {
    const raw = text;
    let lang = "";

    const commentLines: string[] = [];
    const contentLines: string[] = [];
    let isContent = true;

    for (const line of text.split("\n")) {
      isContent = true;

      if (contentLines.length === 0 && line.startsWith("// ")) {
        commentLines.push(line.substr(3));
        isContent = false;
      }

      if (lang && line.startsWith("```")) {
        break;
      }

      if (contentLines.length === 0 && line.startsWith("```")) {
        lang = line.substr(3);
        isContent = false;
      }

      if (isContent) {
        contentLines.push(line);
      }
    }

    lang = lang || "markdown";

    const comment = commentLines.join("\n");
    let html = contentLines.join("\n") || text;

    switch (lang) {
      case "markdown": html = this.mdConverter.makeHtml(html); break;
      case "html": break;
      case "pug": html = this.pugConverter(html); break;
      default:
        const pre = h("pre");
        pre.innerText = html;
        html = pre.outerHTML;
    }

    return { lang, comment, content: html, raw };
  }

  buildSlide(slide: ISlide): string {
    const resultArray: string[] = [];

    if (slide.comment) {
      for (const line of slide.comment.split("\n")) {
        resultArray.push(`// ${line}`);
      }
    }

    const commentStr = "```";

    if (slide.lang !== "markdown") {
      resultArray.push(`${commentStr}${slide.lang || "html"}`);
    }

    for (const line of slide.content.split("\n")) {
      resultArray.push(line);
    }

    if (slide.lang !== "markdown") {
      resultArray.push(commentStr);
    }

    return resultArray.join("\n");
  }

  getSlide(x: number, y?: number) {
    const s = document.querySelectorAll(".slides > section");
    const hSlide = s[x];

    if (typeof y === "number") {
      if (hSlide) {
        return Array.from(hSlide.children).filter((el) => el.tagName.toLocaleUpperCase() === "SECTION")[y];
      }

      return undefined;
    }

    return hSlide;
  }
}

export default RevealMd;