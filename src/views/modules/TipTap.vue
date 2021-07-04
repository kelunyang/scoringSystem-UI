<template>
  <div class='d-flex flex-column'>
    <div class='d-flex flex-column rounded-lg pa-1' style='border:1px solid #333'>
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
    </div>
    <div class='red--text text-caption text-left' v-show='showHint'>{{ hint }}（外層如出現黑框線屬於正常，儲存時不會有影響，只是提示您目前正在編輯該段落而已）</div>
  </div>
</template>

<script>
import { Editor, EditorContent } from '@tiptap/vue-2'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'

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
      showHint: false,
      placeholder: ''
    }
  },
  watch: {
    value(value) {
      // HTML
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
    this.editor = new Editor({
      extensions: [
        StarterKit,
        Placeholder,
      ],
      content: this.value,
      onUpdate: () => {
        // HTML
        this.$emit('input', this.editor.getHTML())
        // JSON
        // this.$emit('input', this.editor.getJSON())
      },
      onFocus() {
        oriobj.showHint = true;
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
<style lang="scss" scoped>
::v-deep {
  /* Basic editor styles */
  .ProseMirror {
    > * + * {
      margin-top: 0.75em;
    }
  }

  /* Placeholder (at the top) */
  .ProseMirror p.is-editor-empty:first-child::before {
    content: '請點擊此開始輸入內容';
    float: left;
    color: #ced4da;
    pointer-events: none;
    height: 0;
  }

  /* Placeholder (on every new line) */
  /*.ProseMirror p.is-empty::before {
    content: attr(data-placeholder);
    float: left;
    color: #ced4da;
    pointer-events: none;
    height: 0;
  }*/
}
</style>