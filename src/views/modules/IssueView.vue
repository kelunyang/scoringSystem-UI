<template>
  <v-lazy
    :options="{
      threshold: 0.5
    }"
    min-height="100"
    transition="fade-transition"
  >
    <v-main class='pa-1 ma-1 black--text' style='border: 1px solid black'>
      <v-row class='d-flex flex-row pa-0 ma-0'>
        <div v-if='cCommit.tick > 0'>
          <v-tooltip top v-if='cCommit.tick < issue.tick'>
            <template v-slot:activator="{ on, attrs }">
              <v-icon
                dense
                color="red accent-4"
                v-bind="attrs" v-on="on"
              >fa-history</v-icon>
            </template>
            <span>本Issue晚於您指定的版本發布</span>
          </v-tooltip>
        </div>
        <div v-if='cUser.tick > 0'>
          <v-tooltip top v-if='cUser.tick < issue.tick'>
            <template v-slot:activator="{ on, attrs }">
              <v-icon
                dense
                color="red accent-4"
                v-bind="attrs" v-on="on"
              >fa-user-clock</v-icon>
            </template>
            <span>本Issue晚於您登入之後發布</span>
          </v-tooltip>
        </div>
        <v-spacer></v-spacer>
        <v-btn
          v-if='cStage.isPM || issue.user === currentUser._id'
          @click='removeIssue(issue)'
          color='grey lighten-1'
          class='black--text'
        >
          刪除
        </v-btn>
        <v-btn
          v-if='eDiff'
          @click='sendDiff'
          color='grey lighten-1'
          class='black--text'
        >
          啟動對比
        </v-btn>
      </v-row>
      <v-row class='pa-0 ma-0'>
        <v-col cols='2' class='pa-0 ma-0'>
          <v-avatar>
            <img :src='"https://avatars.dicebear.com/api/" + issue.user.types + "/" + encodeURIComponent(issue.user.name + "@" + issue.user.unit) + ".svg"' />
          </v-avatar>
        </v-col>
        <v-col cols="10" class='text-left ma-0 pa-1'>
          <div class='text-caption'>{{ dateConvert(issue.tick) }}</div>
          <div class='text-body-2' v-html="HTMLConverter(issue.body)"></div>
        </v-col>
      </v-row>
      <v-row class='d-flex flex-row flex-wrap pa-2'>
        <v-chip
          v-for='file in issue.attachments'
          :key="file._id"
          class="ma-2"
          @click="downloadFile(file)"
        >{{ filenameConvert(file) }}</v-chip>
      </v-row>
    </v-main>
  </v-lazy>
</template>

<script>
import marked from 'marked';
import moment from 'moment';
import prettyBytes from 'pretty-bytes';

const renderer = new marked.Renderer();
const linkRenderer = renderer.link;
renderer.link = (href, title, text) => {
    const html = linkRenderer.call(renderer, href, title, text);
    return html.replace(/^<a /, '<a target="_blank" rel="nofollow" ');
};

export default {
  name: 'IssueView',
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
      str += file.status !== 1 ? '(暫不可用)' : '';
      str += prettyBytes(file.size);
      return str;
    },
    HTMLConverter: function (msg) {
      msg = msg === null || msg == undefined ? '**test**' : msg;
      return marked(msg, { renderer });
    },
    editIssue: function (issue) {
      return this.$emit('edit', issue);
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
      return time === 0 ? '尚未設定' : moment.unix(time).format('YYYY/MM/DD HH:mm:ss');
    }
  }
}
</script>