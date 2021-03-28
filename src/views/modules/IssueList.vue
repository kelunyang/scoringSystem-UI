<template>
  <v-main class='mt-1 mb-1 ml-0 mr-0 pa-1' style='width: 100%'>
    <v-row class='ma-0 pt-1 pb-1 pl-0 pr-0'>
      <v-col class='ma-0 pa-0 d-flex flex-row justify-end'>
        <div v-if='issue.star' class='red accent-4 text-caption white--text pa-1 mr-1'>
          <v-icon small dense color="white">fas fa-star</v-icon>
          重點標記Issue
        </div>
        <div v-if='issue.status' class='indigo darken-4 text-caption white--text pa-1 mr-1'>
          <v-icon small dense color="white">fas fa-comment</v-icon>
          已關閉的Issue
        </div>
        <div v-if='!issue.status' class='light-blue darken-4 text-caption white--text pa-1 mr-1'>
          <v-icon small dense color="white">far fa-comment</v-icon>
          未關閉的Issue
        </div>
      </v-col>
    </v-row>
    <v-row class='d-flex ma-0 pa-0'>
      <v-col class='d-flex flex-column ma-0 pa-0 flex-grow-0 flex-shrink-1 align-self-center' style='width: 60px'>
        <v-avatar>
          <img :src='"https://avatars.dicebear.com/api/" + issue.user.types + "/" + encodeURIComponent(issue.user.name + "@" + issue.user.unit) + ".svg"' />
        </v-avatar>
        <div class='d-flex flex-row'>
          <div v-if='compareCommit.tick > 0'>
            <v-tooltip top v-if='compareCommit.tick < issue.tick'>
              <template v-slot:activator="{ on, attrs }">
                  <v-icon
                  dense
                  color="red accent-4"
                  small
                  v-bind="attrs" v-on="on"
                  >fa-history</v-icon>
              </template>
              <span>本Issue晚於您指定的Commit後發布</span>
            </v-tooltip>
          </div>
          <div v-if='compareUser.tick > 0'>
            <v-tooltip top v-if='compareUser.tick < issue.tick'>
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
        <div class='text-h6'>{{ issue.title }}</div>
        <div class='text-caption d-flex flex-row'>
          <v-tooltip top>
            <template v-slot:activator="{ on, attrs }">
              <div v-bind="attrs" v-on="on" class="versionSign">{{ versionConvert(issue.version) }}</div>
            </template>
            <span v-if='("tick" in issue.version)'>COMMIT: {{ dateConvert(issue.version.tick) }}</span>
            <span v-else>無Commit</span>
          </v-tooltip>
          <div>@ {{ timeConvert(issue.position) }}</div>
        </div>
        <div class='text-caption'>{{ dateConvert(issue.tick) }} </div>
      </v-col>
      <v-col class='d-flex flex-row ma-0 pa-0 flex-shrink-1 flex-grow-0 justify-end align-center'>
        <v-tooltip right>
          <template v-slot:activator="{ on, attrs }">        
            <v-btn
            icon
            outlined
            v-bind="attrs" v-on="on"
            @click='getIssue'
            >
              <v-icon dense>fa-comments</v-icon>
            </v-btn>
          </template>
          <span>檢視Issue</span>
        </v-tooltip>
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
</style>

<script>
import moment from 'moment';

export default {
  name: 'IssueList',
  props: {
    issue: Object,
    compareCommit: Object,
    compareUser: Object,
    currentVersion: Object
  },
  methods: {
    versionConvert: function (version) {
      if(this.currentVersion._id !== '') {
        if('_id' in version) {
          return version._id === this.currentVersion._id ? '當前Commit' : '舊Commit';
        } else {
          return '無Commit';
        }
      } else {
        return '尚無當前Commit'
      }
    },
    timeConvert: function (time) {
      return moment.duration(time, 'second').format('mm分ss秒SS');
    },
    getIssue: function () {
      return this.$emit('view', this.issue);
    },
    dateConvert: function (time) {
      return time === 0 ? '尚未設定' : moment.unix(time).format('YYYY/MM/DD HH:mm:ss');
    }
  }
}
</script>