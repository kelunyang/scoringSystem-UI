<template>
  <div class='d-flex flex-column'>
    <div v-if="editor" class='d-flex flex-row flex-wrap'>
      <v-btn
        @click="editor.chain().focus().undo().run()"
        icon
      >
        <v-icon>fas fa-undo</v-icon>
      </v-btn>
      <v-btn
        @click="editor.chain().focus().redo().run()"
        icon
      >
        <v-icon>fas fa-redo</v-icon>
      </v-btn>
      <v-btn
        @click="editor.chain().focus().toggleBold().run()"
        :class="{ 'black': editor.isActive('bold') }"
        icon
      >
        <v-icon :class="{ 'white--text': editor.isActive('bold') }">fas fa-bold</v-icon>
      </v-btn>
      <v-btn
        @click="editor.chain().focus().toggleItalic().run()"
        :class="{ 'black': editor.isActive('italic') }"
        icon
      >
        <v-icon :class="{ 'white--text': editor.isActive('italic') }">fas fa-italic</v-icon>
      </v-btn>
      <v-btn
        @click="editor.chain().focus().toggleStrike().run()"
        :class="{ 'black': editor.isActive('strike') }"
        icon
      >
        <v-icon :class="{ 'white--text': editor.isActive('strike') }">fas fa-strikethrough</v-icon>
      </v-btn>
      <v-btn
        @click="editor.chain().focus().toggleBulletList().run()"
        :class="{ 'black': editor.isActive('bulletList') }"
        icon
      >
        <v-icon :class="{ 'white--text': editor.isActive('bulletList') }">fas fa-list-ul</v-icon>
      </v-btn>
      <v-btn
        @click="editor.chain().focus().toggleOrderedList().run()"
        :class="{ 'black': editor.isActive('orderedList') }"
        icon
      >
        <v-icon :class="{ 'white--text': editor.isActive('orderedList') }">fas fa-list-ol</v-icon>
      </v-btn>
      <v-btn
        @click="editor.chain().focus().toggleBlockquote().run()"
        :class="{ 'black': editor.isActive('blockquote') }"
        icon
      >
        <v-icon :class="{ 'white--text': editor.isActive('blockquote') }">fas fa-quote-right</v-icon>
      </v-btn>
    </div>
    <editor-content class='text-left black--text text-body-1' style='overflow-y: scroll' :style='{ maxHeight: maxHeight, minHeight: minHeight }' :editor="editor" />
    <div class='red--text text-caption text-left' v-show='showHint'>{{ hint }}（外層如出現黑框線屬於正常，儲存時不會有影響，只是提示您目前正在編輯該段落而已）</div>
  </div>
</template>

<script>
import { Editor, EditorContent } from '@tiptap/vue-2'
import { defaultExtensions } from '@tiptap/starter-kit'
const EMPTYCONTENT = '請點擊此開始輸入內容';

export default {
  components: {
    EditorContent,
  },
  props: {
    value: {
      type: String,
      default: '',
    },
    maxHeight: String,
    minHeight: String,
    hint: String
  },
  data() {
    return {
      editor: null,
      showHint: false
    }
  },
  watch: {
    value(value) {
      // HTML
      value = value === '' || value === '<p></p>' ? EMPTYCONTENT : value;
      const isSame = this.editor.getHTML() === value
      // JSON
      // const isSame = this.editor.getJSON().toString() === value.toString()
      if (isSame) {
        return
      }
      this.editor.commands.setContent(value, false)
    },
  },
  mounted() {
    let oriobj = this;
    let value = this.value === '' ? EMPTYCONTENT : this.value;
    this.editor = new Editor({
      extensions: defaultExtensions(),
      content: value,
      onUpdate: () => {
        // HTML
        this.$emit('input', this.editor.getHTML())
        // JSON
        // this.$emit('input', this.editor.getJSON())
      },
      onFocus() {
        oriobj.showHint = true;
        if(oriobj.value === EMPTYCONTENT) {
          oriobj.value = '';
        }
      },
      onBlur() {
        oriobj.showHint = false;
      }
    })
  },
  beforeDestroy() {
    this.editor.destroy()
  },
}
</script>