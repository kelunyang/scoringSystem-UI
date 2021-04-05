<template>
  <v-main class='pa-1 ma-1' style='border: 1px solid black'>
    <v-row class='d-flex flex-row pa-0 ma-0'>
      <div v-if='compareCommit.tick > 0'>
        <v-tooltip top v-if='compareCommit.tick < issue.tick'>
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
      <div v-if='compareUser.tick > 0'>
        <v-tooltip top v-if='compareUser.tick < issue.tick'>
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
        icon
        v-if='currentStage.isPM || issue.user === currentUser._id'
        @click='removeIssue(issue)'
        color='grey lighten-1'
        class='black--text'
      >
        刪除
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
</template>

<script>
import marked from 'marked';
import moment from 'moment';
import prettyBytes from 'pretty-bytes';

export default {
  name: 'IssueView',
  props: {
    issue: Object,
    compareCommit: Object,
    compareUser: Object,
    currentStage: Object
  },
  computed: {
    currentUser: function () {
      return this.$store.state.currentUser;
    }
  },
  methods: {
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
      return marked(msg);
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
          found = this.currentStage.isPM;
        }
        if(tag === 'reviewer') {
          found = this.currentStage.isReviewer;
        }
        if(tag === 'vendor') {
          found = this.currentStage.isVendor;
        }
        if(tag === 'writer') {
          found = this.currentStage.isWriter;
        }
        if(tag === 'final') {
          found = this.currentStage.isFinal;
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