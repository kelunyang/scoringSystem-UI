<template>
  <v-main class='issueItem mt-1 mb-0 ml-0 mr-0 pa-1'>
    <v-row class='ma-0 pt-1 pb-1 pl-0 pr-0'>
      <v-col class='ma-0 pa-0 d-flex flex-row justify-end'>
        <v-chip
          v-if='compareUser.tick > 0'
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
        <v-chip
          v-if='compareCommit.tick > 0'
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
        <v-chip
          v-if='!currentIssue.readed'
          color='red darken-4'
          class="text-caption pa-1 mr-1"
          label
          outlined
          text-color="red darken-4"
        >
          <v-icon left>
            fas fa-envelope-open-text
          </v-icon>
          未讀
        </v-chip>
        <v-chip
          v-if='currentIssue.star'
          color='red accent-4'
          class="text-caption pa-1 mr-1"
          label
          outlined
          text-color="red accent-4"
        >
          <v-icon left>
            fas fa-star
          </v-icon>
          重點標記
        </v-chip>
        <v-chip
          v-if='currentIssue.status'
          color='indigo darken-4'
          class="text-caption pa-1 mr-1"
          label
          outlined
          text-color="indigo darken-4"
        >
          <v-icon left>
            fas fa-comment-slash
          </v-icon>
          已關閉
        </v-chip>
        <v-chip
          v-if='!currentIssue.status'
          color='light-blue darken-4'
          class="text-caption pa-1 mr-1"
          label
          outlined
          text-color="light-blue darken-4"
        >
          <v-icon left>
            fas fa-comment
          </v-icon>
          討論中
        </v-chip>
      </v-col>
    </v-row>
    <v-row class='d-flex ma-0 pa-0'>
      <v-col class='pa-0 ma-0 d-flex flex-column justify-center align-self-center align-center flex-shrink-1 flex-grow-0' style='min-width: 100px'>
        <v-avatar>
          <img :src='"https://avatars.dicebear.com/api/" + currentIssue.user.types + "/" + encodeURIComponent(currentIssue.user.name + "@" + currentIssue.user.unit) + ".svg"' />
        </v-avatar>
        <div class='text-caption'>{{ currentIssue.user.name }}</div>
        <div class='text-caption'>{{ currentIssue.user.unit }}</div>
      </v-col>
      <v-col class='d-flex flex-column ma-0 pa-0 flex-grow-1 flex-shrink-0 text-left'>
        <div class='text-h6'>{{ currentIssue.title }}</div>
        <div class='text-caption d-flex flex-row'>
          <v-tooltip top>
            <template v-slot:activator="{ on, attrs }">
              <div v-bind="attrs" v-on="on" class="versionSign">{{ versionConvert(currentIssue.version) }}</div>
            </template>
            <span v-if='currentIssue.version === undefined || !("tick" in currentIssue.version)'>無對應版本</span>
            <span v-else>{{ versionnameConvert(currentIssue.version.name) }}版</span>
          </v-tooltip>
          <div>{{ timeConvert(currentIssue) }}</div>
        </div>
        <div class='text-caption'>{{ dateConvert(currentIssue.tick) }} </div>
      </v-col>
      <v-col class='d-flex flex-row ma-0 pa-0 flex-shrink-1 flex-grow-0 justify-end align-center'>     
        <v-btn
          @click='getIssue'
          class='black--text'
          color='grey lighten-1'
        >
          檢視Issue
        </v-btn>
      </v-col>
    </v-row>
  </v-main>
</template>

<style scoped>
.issueSign {
  border-width: 1px;
  border-style: solid;
  padding: 2px;
  width: fit-content;
}
.versionSign {
  background-color: black;
  color: white;
  padding: 2px;
}
.issueItem {
  background-color: #FFF;
  border: 1px solid #666;
}
</style>

<script>
import moment from 'moment';
import mime from 'mime-types';
import momentDurationFormatSetup from 'moment-duration-format';

momentDurationFormatSetup(moment);

export default {
  name: 'IssueList',
  props: {
    issue: Object,
    compareCommit: Object,
    compareUser: Object,
    currentVersion: Object,
  },
  mounted () {
    this.currentIssue = this.issue;   
  },
  data() {
    return {
      currentIssue: {
        readed: false,
        KB: '',
        version: undefined,
        objective: '',
        tick: 0,
        title: '',
        position: 0,
        body: '',
        user: {
          _id: ''
        },
        attachments: [],
        status: false,
        star: false,
        sealed: false,
        parent: undefined
      }
    }
  },
  methods: {
    versionnameConvert: function (filename) {
      return filename.replace(/\.[^/.]+$/, "");
    },
    versionConvert: function (version) {
      if(this.currentVersion._id !== '') {
        if(version === undefined || !('_id' in version)) {
          return '無對應版本';
        } else {
          return version._id === this.currentVersion._id ? '當前版本' : this.versionnameConvert(this.currentVersion.name) + '版';
        }
      } else {
        return '當前無任何已上傳版本'
      }
    },
    timeConvert: function (issue) {
      if('version' in issue && issue.version !== undefined) {
        let type = mime.lookup(issue.version.name);
        if(type.indexOf('video') > -1) {
          return "@" + moment.duration(issue.position, 'second').format('mm分ss秒SS');
        } else if(type.indexOf('pdf') > -1) {
          return "@" + issue.position + '頁';
        }
      }
      return '';
    },
    getIssue: function () {
      return this.$emit('view', this.currentIssue);
    },
    dateConvert: function (time) {
      return time === 0 ? '尚未設定' : moment.unix(time).format('YYYY/MM/DD HH:mm:ss');
    }
  }
}
</script>