<template lang="pug">
ul.treeview
  li(v-for="it, i in items" :key="i")
    span.treeview-header
      span(v-if="it.children" @click="openItem(i)")
        fontawesome(icon="caret-right" v-if="!isOpen[i.toString()]")
        fontawesome(icon="caret-down" v-else)
    span.treeview-body(@click="onItemClicked(it, i)" :class="'ext-' + it.extension") {{it.name}}
    treeview(v-if="it.children && isOpen[i.toString()]" :items="it.children" @filename="filename = $event")
</template>

<script lang="ts">
import { Component, Vue, Watch, Prop, Emit } from 'vue-property-decorator';
export interface ITreeview {
  name: string;
  children?: ITreeview[];
}
@Component({
  name: "treeview"
})
export default class Treeview extends Vue {
  @Prop() items!: ITreeview[];
  isOpen: Record<string, boolean> = {};
  filename = "";
  openItem(i: number) {
    this.$set(this.isOpen, i.toString(), !this.isOpen[i.toString()])
  }
  onItemClicked(it: any, i: number) {
    if (it.type === "directory") {
      this.openItem(i);
    } else if (it.extension === "md") {
      this.filename = it.relativePath;
    }
  }
  @Watch("filename")
  @Emit("filename")
  emitFilename() {
    return this.filename;
  }
}
</script>

<style lang="scss">
.treeview {
  li {
    list-style-type: none;
  }
  .treeview-header {
    display: inline-block;
    width: 1em;
  }
  .treeview-body:hover {
    cursor: pointer;
  }
  .treeview-body.ext-md:hover {
    color: blue;
  }
}
</style>