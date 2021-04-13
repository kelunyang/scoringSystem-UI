<template>
  <v-main class='issueItem mt-1 mb-1 ml-0 mr-0 pa-1' style='width: 100%'>
    <v-row class='ma-0 pt-1 pb-1 pl-0 pr-0'>
      <v-col class='ma-0 pa-0 d-flex flex-row justify-end'>
        <div v-if='currentIssue.star' class='red accent-4 text-caption white--text pa-1 mr-1'>
          <v-icon small dense color="white">fas fa-star</v-icon>
          重點標記Issue
        </div>
        <div v-if='currentIssue.status' class='indigo darken-4 text-caption white--text pa-1 mr-1'>
          <v-icon small dense color="white">fas fa-comment-slash</v-icon>
          Issue已關閉
        </div>
        <div v-if='!currentIssue.status' class='light-blue darken-4 text-caption white--text pa-1 mr-1'>
          <v-icon small dense color="white">far fa-comment</v-icon>
          Issue討論中
        </div>
      </v-col>
    </v-row>
    <v-row class='d-flex ma-0 pa-0'>
      <v-col class='d-flex flex-column ma-0 pa-0 flex-grow-0 flex-shrink-1 align-self-center' style='width: 60px'>
        <v-avatar>
          <img :src='"https://avatars.dicebear.com/api/" + currentIssue.user.types + "/" + encodeURIComponent(currentIssue.user.name + "@" + currentIssue.user.unit) + ".svg"' />
        </v-avatar>
        <div class='d-flex flex-row'>
          <div v-if='!currentIssue.readed'>
            <v-tooltip top>
              <template v-slot:activator="{ on, attrs }">
                  <v-icon
                  dense
                  color="red accent-4"
                  small
                  v-bind="attrs" v-on="on"
                  >fa-envelope-open-text</v-icon>
              </template>
              <span>尚未讀取的Issue</span>
            </v-tooltip>
          </div>
          <div v-if='compareCommit.tick > 0'>
            <v-tooltip top v-if='compareCommit.tick < currentIssue.tick'>
              <template v-slot:activator="{ on, attrs }">
                  <v-icon
                  dense
                  color="red accent-4"
                  small
                  v-bind="attrs" v-on="on"
                  >fa-history</v-icon>
              </template>
              <span>本Issue晚於您指定的版本後發布</span>
            </v-tooltip>
          </div>
          <div v-if='compareUser.tick > 0'>
            <v-tooltip top v-if='compareUser.tick < currentIssue.tick'>
              <template v-slot:activator="{ on, attrs }">
                  <v-icon
                  dense
                  small
                  color="red accent-4"
                  v-bind="attrs" v-on="on"
                  >fa-user-clock</v-icon>
              </template>
              <span>本Issue晚於您上次登入後發布</span>
            </v-tooltip>
          </div>
        </div>
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