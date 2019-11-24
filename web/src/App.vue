<template lang="pug">
.h-100.w-100
  .navbar
    span.mr-3 Press F to enter fullscreen
    .ml-auto
      b-button.mr-3(:disabled="!dirTree" variant="light" @click="isChooseFile = true") Choose file
      b-button.mr-3(variant="light" @click="showPreview = !showPreview") {{showPreview ? "Hide Preview" : "Show Preview"}}
      b-button.mr-3(variant="light" :disabled="!canSave" @click="saveMarkdown") Save
      //- b-button.mr-3(variant="light" :disabled="!raw" @click="saveHTML") Download HTML
      b-link(href="https://github.com/patarapolw/reveal-md")
        img(src="./assets/github.svg")
  .editor(:class="showPreview ? ($mq === 'mobile' ? 'hidden' : 'w-50') : 'w-100'")
    codemirror.codemirror(ref="cm" v-model="raw" :options="cmOptions" @input="onCmCodeChange")
  iframe(ref="iframe" :src="iframeUrl" frameborder="0"
  :class="showPreview ? ($mq === 'mobile' ? 'w-100' : 'w-50') : 'hidden'")
  b-modal(v-if="dirTree" v-model="isChooseFile" :title="dirTree.path" scrollable)
    treeview(:items="dirTree.children" @filename="filename = $event")
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import matter from "gray-matter";
import RevealMd from "./lib/reveal-md";
import sanitize from "sanitize-filename";
import Treeview from "@/components/Treeview.vue";

declare const process: any;

@Component({
  components: {
    Treeview
  }
})
export default class App extends Vue {
  cmOptions = {
    mode: {
      name: "yaml-frontmatter",
      base: "markdown"
    }
  }
  raw = process.env.VUE_APP_PLACEHOLDER || "";
  markdown = "";
  line: number = 0;
  offset: number = 0;
  showPreview = (this as any).$mq !== "mobile";
  headers: any = {};
  title = "";
  isChooseFile = false;
  filename = "";
  dirTree: any = null;

  canSave = false;

  get codemirror(): CodeMirror.Editor {
    return (this.$refs.cm as any).codemirror;
  }

  get iframe(): HTMLIFrameElement {
    return this.$refs.iframe as HTMLIFrameElement;
  }

  get iframeWindow() {
    return this.iframe.contentWindow as Window & {
      Reveal: RevealStatic,
      revealMd: RevealMd;
    }
  }

  get iframeUrl() {
    if (this.filename) {
      const url = new URL("/reveal.html", location.origin);
      url.searchParams.set("filename", this.filename);

      return url.href;
    }
    
    return "reveal.html";
  }

  onIFrameReady(fn: () => void) {
    const toLoad = () => {
      this.iframeWindow.revealMd.onReady(() => {
        fn();
      });
    };
    if (this.iframe && this.iframe.contentDocument) {
      if (this.iframeWindow.revealMd) {
        toLoad();
      } else {
        this.iframeWindow.onload = toLoad;
      }
    }
  }

  created() {
    const q = new URL(location.href).searchParams.get("q");

    if (q) {
      fetch(q).then((r) => r.text()).then((r) => {
        this.raw = r;
      })
    } else if (!process.env.VUE_APP_PLACEHOLDER) {
      fetch("/api/").then((r) => {
        return r.json();
      }).then((r) => {
        if (r.filename) {
          this.openFile(r.filename);
        } else {
          this.dirTree = r.dirTree;
          this.isChooseFile = true;
        }
      }).catch((e) => console.error(e));
    }
  }

  mounted() {
    this.codemirror.addKeyMap({
      "Cmd-P": () => {this.showPreview = !this.showPreview},
      "Ctrl-P": () => {this.showPreview = !this.showPreview},
      "Cmd-S": () => { this.saveMarkdown() },
      "Ctrl-S": () => { this.saveMarkdown() }
    });
    this.codemirror.on("cursorActivity", (instance) => {
      this.line = instance.getCursor().line - this.offset;
    });
    this.onCmCodeChange();
  }

  @Watch("filename")
  openFile(filename: string) {
    this.isChooseFile = false;

    this.filename = filename;
    document.getElementsByTagName("title")[0].innerText = filename.split("/").pop()!;

    const url = new URL("/api/data", location.origin);
    url.searchParams.set("filename", filename);
    fetch(url.href).then((r2) => r2.text()).then((r2) => {
      this.raw = r2;
    }).catch((e) => console.error(e));
  }

  onCmCodeChange() {
    try {
      const m = matter(this.raw);
      Vue.set(this, "headers", m.data);
      this.markdown = m.content;
      this.offset = this.raw.replace(m.content, "").split("\n").length - 1;
    } catch(e) {
      this.markdown = this.raw;
      this.offset = 0;
    }
    this.title = this.headers.title || "";
    const title = document.getElementsByTagName("title")[0];
    if (this.title && title) {
      title.innerText = `Editing: ${this.title}`;
    }

    if (this.filename && this.raw) {
      this.canSave = true;
    }

    this.onIFrameReady(() => {
      this.iframeWindow.revealMd.update(this.raw);
    });
  }

  @Watch("line")
  onCursorMove() {
    if (this.line < 0) {
      return;
    }

    let slideNumber = 0;
    let stepNumber = 0;
    let i = 0;
    let hiddenSlideCount = 0;
    let isHidden = false;

    this.markdown.split(/\r?\n===\r?\n/g).map((s_el, s_i) => {
      isHidden = false;

      if (i <= this.line) {
        slideNumber = s_i;
      }

      s_el.split(/\r?\n--\r?\n/).map((ss_el, ss_i) => {
        if (i <= this.line) {
          stepNumber = ss_i;
        }

        i += ss_el.split("\n").length + 1;
      });

      if (["// hidden", "// global"].includes(s_el.split("\n")[0])) {
        hiddenSlideCount++;
        isHidden = true;
      }
    });

    slideNumber -= hiddenSlideCount;

    if (!isHidden && slideNumber >= 0) {
      this.iframeWindow.Reveal.slide(slideNumber, stepNumber);
    }
  }

  saveMarkdown() {
    if (this.filename) {
      fetch("/api/data", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          filename: this.filename,
          content: this.raw
        })
      }).then((r) => {
        if (r.status === 201) {
          this.canSave = false;
          // this.$bvModal.msgBoxOk("Saved");
        } else {
          this.$bvModal.msgBoxOk(`Cannot save: ${r.statusText}`);
        }
      })
    }
  }

  // saveHTML() {
  //   const a = document.createElement("a");
  //   a.href = "/save";
  //   a.download = `${sanitize(this.title)}.zip`;
  //   a.style.display = "none";
  //   document.body.appendChild(a);
  //   a.click();
  //   a.remove();
  // }
}
</script>

<style lang="scss">
$navbar-height: 60px;

html, body, #app {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
}

.h-100 {
  height: 100%;
}

.w-100 {
  width: 100%;
}

.w-50 {
  width: 50%;
}

.hidden {
  display: none;
}

.navbar {
  display: flex;
  height: $navbar-height;
  width: 100%;
  background-color: orange;
  overflow: auto;
  white-space: nowrap;
}

iframe {
  position: fixed;
  height: calc(100vh - 60px);
  top: $navbar-height;

  &.w-50 {
    left: 50vw;
  }
}

.editor {
  height: calc(100vh - 60px) !important;

  .CodeMirror {
    height: calc(100vh - 60px) !important;
  }
}

.CodeMirror {
  height: auto !important;
  width: 100%;
}
</style>