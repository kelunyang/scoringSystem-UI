<template>
  <div class='d-flex issueItem flex-column mt-1 pa-1'>
    <div class='d-flex flex-row justify-space-between'>
      <div class='pa-0 ma-0 d-flex flex-row justify-start flex-shrink-1 flex-grow-0' style='min-width: 100px'>
        <v-avatar size="36">
          <Avatar :user='issue.user' :size='36'/>
        </v-avatar>
        <div class='d-flex flex-column align-start'>
          <div class='text-caption'>{{ issue.user.name }}</div>
          <div class='text-caption'>{{ issue.user.unit }}</div>
        </div>
      </div>
      <div class='d-flex d-flex flex-row justify-end flex-grow-1'>
        <div v-if='cUser.tick > 0'>
          <v-chip
            v-if='cUser.tick < issue.tick'
            color="red darken-4"
            class="text-caption pa-1 mr-1"
            label
            outlined
            text-color="red darken-4"
          >
            <v-icon left>
              fa-user-clock
            </v-icon>
            晚於上次登入
          </v-chip>
        </div>
        <div v-if='cCommit.tick > 0'>
          <v-chip
            v-if='cCommit.tick < issue.tick'
            color="red darken-4"
            class="text-caption pa-1 mr-1"
            label
            outlined
            text-color="red darken-4"
          >
            <v-icon left>
              fas fa-history
            </v-icon>
            晚於指定版本
          </v-chip>
        </div>
        <v-menu
          offset-y
          attach
          left
          bottom
          transition="slide-y-transition"
          v-if='cStage.isPM || issue.user._id === currentUser._id'
        >
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              color='grey lighten-1'
              class='black--text'
              v-bind="attrs" v-on="on"
            >
              刪除
            </v-btn>
          </template>
          <v-sheet class='d-flex flex-column pa-1'>
            <div class='text-h6'>確認刪除Issue？</div>
            <v-btn
              class='white--text ma-1'
              color='red darken-4'
              @click='removeIssue(issue)'
            >
              是，我要刪除Issue！
            </v-btn>
            <div class='text-caption'>如果你只是誤觸，請隨意點擊其他地方即會關閉本對話框</div>
          </v-sheet>
        </v-menu>
        <v-btn
          v-if='eDiff'
          @click='sendDiff'
          color='grey lighten-1'
          class='black--text'
          v-show='issue.body !== undefined'
        >
          啟動對比
        </v-btn>
      </div>
    </div>
    <div class='d-flex flex-column flex-grow-1 flex-shrink-0 text-left text-body-1 pt-1 pb-1' v-html="HTMLConverter(issue.body)"></div>
    <div class='d-flex justify-space-between'>
      <div class='d-flex flex-column justify-start'>
        <div class='text-caption'>{{ dateConvert(issue.tick) }}</div>
      </div>
      <div class='d-flex flex-row flex-shrink-0 flex-grow-1 justify-end align-center flex-wrap'>
        <v-chip
          v-for='file in issue.attachments'
          :key="file._id"
          class="ma-2"
          @click="downloadFile(file)"
        >{{ filenameConvert(file) }}</v-chip>
      </div>
    </div>
  </div>
</template>

<script>
import { marked } from 'marked';
import dayjs from 'dayjs';
import prettyBytes from 'pretty-bytes';

const renderer = new marked.Renderer();
const linkRenderer = renderer.link;
renderer.link = (href, title, text) => {
  if(href !== undefined) { href = (decodeURIComponent(href)).replace(/\\/g, ''); }
  if(title !== undefined) { title = (decodeURIComponent(title)).replace(/\\/g, ''); }
  if(text !== undefined) { text = (decodeURIComponent(text)).replace(/\\/g, ''); }
  const html = linkRenderer.call(renderer, href, title, text);
  return html.replace(/^<a /, '<a target="_blank" rel="nofollow" ');
};

export default {
  name: 'IssueView',
  components: { 
    Avatar: () => import(/* webpackChunkName: 'Avatar', webpackPrefetch: true */ './Avatar'),
  },
  props: {
    issue: Object,
    compareCommit: Object,
    compareUser: Object,
    currentStage: Object,
    enableDiff: Boolean
  },
  data() {
    return {
      eDiff: false,
      cCommit: { tick: 0 },
      cUser: { tick: 0 },
      cStage: {
        isPM: false,
        isReviewer: false,
        isVendor: false,
        isFinal: false,
        isWriter: false
      }
    }
  },
  watch: {
    enableDiff: function () {
      if(this.enableDiff !== undefined) {
        this.eDiff = this.enableDiff;
      }
    },
    currentStage: function () {
      this.cStage = this.currentStage === undefined ? {
        isPM: false,
        isReviewer: false,
        isVendor: false,
        isFinal: false,
        isWriter: false
      } : this.currentStage;
    }
  },
  created() {
    this.eDiff = this.enableDiff === undefined ? false : this.enableDiff;
    this.cCommit = this.compareCommit === undefined ? { tick: 0 } : this.compareCommit;
    this.cUser = this.compareUser === undefined ? { tick: 0 } : this.compareUser;
    this.cStage = this.currentStage === undefined ? {
      isPM: false,
      isReviewer: false,
      isVendor: false,
      isFinal: false,
      isWriter: false
    } : this.currentStage;
  },
  computed: {
    currentUser: function () {
      return this.$store.state.currentUser;
    }
  },
  methods: {
    sendDiff: function () {
      this.$emit('sendDiff', this.issue);
    },
    downloadFile: function (file) {
      this.$emit('download', file);
    },
    filenameConvert: function (file) {
      let str = file.name;
      str += file.status === 0 ? '(暫不可用)' : '';
      str += prettyBytes(file.size);
      return str;
    },
    HTMLConverter: function (msg) {
      msg = msg === null || msg == undefined ? '**用戶未輸入任何內容**' : msg;
      return marked(msg, { renderer });
    },
    removeIssue: function (issue) {
      return this.$emit('remove', issue);
    },
    taguserConvert: function (tags, issue) {
      let found = false;
      for(let i=0; i<tags.length; i++) {
        let tag = tags[i];
        if(tag === 'PM') {
          found = this.cStage.isPM;
        }
        if(tag === 'reviewer') {
          found = this.cStage.isReviewer;
        }
        if(tag === 'vendor') {
          found = this.cStage.isVendor;
        }
        if(tag === 'writer') {
          found = this.cStage.isWriter;
        }
        if(tag === 'final') {
          found = this.cStage.isFinal;
        }
        if(found) {
          break;
        }
      }
      if(issue) {
        if(!found) {
          found = issue.user === this.currentUser._id;
        }
      }
      return found;
    },
    dateConvert: function (time) {
      return time === 0 ? '尚未設定' : dayjs.unix(time).format('YYYY/MM/DD HH:mm:ss');
    }
  }
}
</script>