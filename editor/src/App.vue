<template lang="pug">
.h-100.w-100
  .navbar
    span.mr-3 Press F to enter fullscreen
    .ml-auto
      b-button.mr-3(:disabled="!dirTree" variant="light" @click="isChooseFile = true") Choose file
      b-button.mr-3(variant="light" @click="showPreview = !showPreview") {{showPreview ? "Hide Preview" : "Show Preview"}}
      b-button.mr-3(variant="light" :disabled="!canSave" @click="saveMarkdown") Save
      b-link(href="https://github.com/patarapolw/reveal-md")
        img(src="./assets/github.svg")
  .editor(:class="showPreview ? 'w-50' : 'w-100'")
    codemirror.codemirror(ref="cm" v-model="raw" :options="cmOptions" @input="onCmCodeChange")
  iframe(ref="iframe" :src="iframeUrl" frameborder="0"
  :class="showPreview ? 'w-50' : 'hidden'")
  b-modal(v-if="dirTree" v-model="isChooseFile" :title="dirTree.path" scrollable static)
    treeview(:items="dirTree.children" @filename="filename = $event")
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import matter from "gray-matter";
import Treeview from "@/components/Treeview.vue";

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
  raw = "";
  markdown = "";
  line: number = 0;
  offset: number = 0;
  showPreview = true;
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
    return this.iframe.contentWindow as any;
  }

  get iframeUrl() {
    const defaultUrl = `${process.env.BASE_URL}/reveal/`;

    if (this.filename) {
      const url = new URL(defaultUrl, location.origin);
      url.searchParams.set("filename", this.filename);
      return url.href;
    }
    
    return defaultUrl;
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

  async created() {
    const q = new URL(location.href).searchParams.get("q");
    if (q) {
      this.raw = await fetch(q).then((r) => r.text());
    } else {
      try {
        const r = await fetch("/api/").then((r) => r.json());
        if (r.filename) {
          this.openFile(r.filename);
        } else if (r.dirTree) {
          this.dirTree = r.dirTree;
          this.isChooseFile = true;
        } else {
          this.raw = process.env.VUE_APP_PLACEHOLDER || "";
        }
      } catch(e) {
        this.raw = process.env.VUE_APP_PLACEHOLDER || "";
      }
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
    let isHidden = false;
    let xOffset = 0;
    this.markdown.split(/\n===\n/g).map((s_el, x) => {
      const ss_md = s_el.split(/\n--\n/g);
      const ss_md_hidden = ss_md.map((ss_el) => ss_el.startsWith("// hidden\n") || ss_el.startsWith("// global\n"));
      if (ss_md_hidden.every((el) => el)) {
        xOffset++;
      }

      if (i <= this.line) {
        slideNumber = x - xOffset;
        isHidden = ss_md_hidden.every((el) => el)
      }

      let yOffset = 0;
      ss_md.map((ss_el, y) => {
        if (ss_md_hidden[y]) {
          yOffset++;
        }

        if (i <= this.line) {
          stepNumber = y - yOffset;
          isHidden = ss_md_hidden[y]
        }

        i += ss_el.split("\n").length + 1;
      });
    });
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
        } else {
          this.$bvModal.msgBoxOk(`Cannot save: ${r.statusText}`);
        }
      })
    }
  }
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