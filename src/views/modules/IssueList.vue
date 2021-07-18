<template>
  <div class='d-flex issueItem flex-column mt-1 pa-1'>
    <div class='d-flex flex-row justify-space-between'>
      <div class='pa-0 ma-0 d-flex flex-row justify-start flex-shrink-1 flex-grow-0' style='min-width: 100px'>
        <v-avatar size="36">
          <Avatar :user='currentIssue.user' :size='36'/>
        </v-avatar>
        <div class='d-flex flex-column align-start'>
          <div class='text-caption'>{{ currentIssue.user.name }}</div>
          <div class='text-caption'>{{ currentIssue.user.unit }}</div>
        </div>
      </div>
      <div class='d-flex d-flex flex-row justify-end flex-grow-1'>
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
      </div>
    </div>
    <div class='d-flex flex-column flex-grow-1 flex-shrink-0 text-left pt-1 pb-1'>
      <div class='text-h6 font-weight-black'>{{ currentIssue.title }}</div>
      <div class='text-body-2' v-html="sliceBody(currentIssue.body)" v-if='!openList'></div>
    </div>
    <div class='d-flex justify-space-between'>
      <div class='d-flex flex-column justify-start align-start'>
        <div class='text-caption d-flex flex-row flex-shrink-1 flex-grow-0'>
          <v-tooltip top>
            <template v-slot:activator="{ on, attrs }">
              <div v-bind="attrs" v-on="on" class="versionSign">{{ versionConvert(currentIssue.version) }}</div>
            </template>
            <span v-if='currentIssue.version === undefined || currentIssue.version === null || !("tick" in currentIssue.version)'>無對應版本</span>
            <span v-else>{{ versionnameConvert(currentIssue.version.name) }}版</span>
          </v-tooltip>
          <div>{{ timeConvert(currentIssue) }}</div>
        </div>
        <div class='text-caption'>{{ dateConvert(currentIssue.tick) }} </div>
      </div>
      <div class='d-flex flex-row flex-shrink-0 flex-grow-1 justify-end align-center'>     
        <v-btn
          v-if='!openList'
          @click='getIssue'
          class='black--text'
          color='grey lighten-1'
        >
          檢視討論
        </v-btn>
        <div v-if='openList' class='d-flex flex-row'>
          <v-menu
            offset-y
            attach
            transition="slide-y-transition"
            v-if='!currentStage.isFinal'
            v-show='!currentIssue.status'
          >
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                class='white--text ma-1'
                color='red darken-4'
                v-bind="attrs" v-on="on"
              >
                回復Issue
              </v-btn>
            </template>
            <v-sheet class='d-flex flex-column pa-1'>
              <div class='text-h6'>確認回復Issue？</div>
              <v-btn
                class='white--text ma-1'
                color='red darken-4'
                @click='addIssue'
              >
                是，我要回復Issue！
              </v-btn>
              <div class='text-caption'>如果你只是誤觸，請隨意點擊其他地方即會關閉本對話框</div>
            </v-sheet>
          </v-menu>
          <v-btn
            class='white--text ma-1'
            color='light-blue darken-4'
            v-if='currentStage.isReviewer || currentStage.isPM'
            @click='setStatus'
          >
            {{ statusConvert() }}
          </v-btn>
          <v-btn
            class='black--text ma-1'
            color='grey lighten-1'
            v-if='currentStage.isReviewer || currentStage.isPM'
            @click='setStar'
          >
            將Issue置頂
          </v-btn>
          <v-btn
            class='black--text ma-1'
            color='grey lighten-1'
            @click='backtoIssueList'
          >
            收起討論列表
          </v-btn>
        </div>
      </div>
    </div>
    <v-expand-transition>
      <div class='d-flex flex-column' v-if='openList'>
        <v-alert outlined type="info" icon='fa-info-circle' class='text-left' v-if="readedCount > 0">
          本串中未讀的 {{ readedCount }} 則訊息都已標為已讀，您收起討論列表時，會重新按照讀取狀態排序
        </v-alert>
        <issue-view
          :issue='currentIssue'
          :compareCommit='compareCommit'
          :compareUser='compareUser'
          :currentStage="currentStage"
          :enableDiff='diffDetect'
          @sendDiff='addDiff'
          @download='downloadFile'
          @remove='removeIssue'
        />
        <div class='d-flex flex-column' v-if='issuesInView.length > 0'>
          <v-lazy
            :options="{
              threshold: 0.5
            }"
            min-height="100"
            transition="fade-transition"
            v-for="issue in issuesInView"
            :key="issue._id"
          >
            <issue-view
              :issue='issue'
              :enableDiff='diffDetect'
              :compareCommit='compareCommit'
              :compareUser='compareUser'
              :currentStage="currentStage"
              @sendDiff='addDiff'
              @download='downloadFile'
              @remove='removeIssue'
            />
          </v-lazy>
        </div>
        <div v-else>
          目前沒有回覆
        </div>
      </div>
    </v-expand-transition>
  </div>
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
import dayjs from 'dayjs';
import mime from 'mime-types';
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration);

export default {
  name: 'IssueList',
  props: {
    issue: Object,
    compareCommit: Object,
    compareUser: Object,
    currentVersion: Object,
    issues: Array,
    cStage: Object,
    dDetect: Boolean,
    rStatus: Object
  },
  components: { 
    IssueView: () => import(/* webpackChunkName: 'IssueView', webpackPrefetch: true */ './IssueView'),
    Avatar: () => import(/* webpackChunkName: 'Avatar', webpackPrefetch: true */ './Avatar')
  },
  computed: {
    issuesInView: function() {
      if(this.issues.id === this.currentIssue._id) {
        return this.issues.issues;
      }
      return [];
    },
    readedCount: function() {
      if(this.issues.id === this.currentIssue._id) {
        if(this.rStatus.id !== undefined) {
          if(this.rStatus.id === this.currentIssue._id) {
            return this.rStatus.numberOfIssues;
          }
        }
      }
      return 0;
    }
  },
  watch: {
    issues: {
      deep: true,
      handler () {
        if(this.issues.id !== this.currentIssue._id) {
          this.openList = false;
        }
      }
    }
  },
  mounted () {
    this.currentIssue = this.issue;
    this.currentStage = this.cStage;
    this.diffDetect = this.dDetect;
  },
  data() {
    return {
      openList: false,
      diffDetect: false,
      currentStage: {},
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
        parent: undefined,
        _id: ''
      }
    }
  },
  methods: {
    sliceBody: function (msg) {
      msg = msg === null || msg == undefined ? '**用戶未輸入任何內容**' : msg;
      msg = msg.length <= 30 ? msg : (msg.slice(0, 30))+'……(此為30字預覽，點擊右下角「檢視討論」按鈕看完整內容)';
      return msg;
    },
    addIssue: function () {
      this.$emit('add', this.currentIssue);
    },
    setStar: function () {
      this.$emit('star', this.currentIssue);
    },
    setStatus: function () {
      this.$emit('status', this.currentIssue);
    },
    statusConvert: function () {
      return this.currentIssue.status ? '重新開放此Issue' : '關閉此Issue';
    },
    versionnameConvert: function (filename) {
      return filename.replace(/\.[^/.]+$/, "");
    },
    versionConvert: function (version) {
      if(this.currentIssue._id !== '') {
        if(this.currentVersion._id !== '') {
          if(version === undefined || version === null || !('_id' in version)) {
            return '無對應版本';
          } else {
            return version._id === this.currentVersion._id ? '當前版本' : this.versionnameConvert(version.name) + '版';
          }
        } else {
          return '當前無任何已上傳版本'
        }
      }
    },
    timeConvert: function (issue) {
      if(issue.version !== null) {
        if(issue.version !== undefined) {
          if('version' in issue) {
            let type = mime.lookup(issue.version.name);
            if(/video/g.test(type)) {
              return "@" + dayjs.duration(issue.position, 'second').format('mm分ss秒');
            } else if(/pdf/g.test(type)) {
              return "@" + issue.position + '頁';
            }
          }
        }
      }
      return '';
    },
    getIssue: function () {
      this.$emit('view', this.currentIssue);
      this.openList = true;
    },
    addDiff: function (issue) {
      this.$emit('sendDiff', issue);
    },
    downloadFile: function (file) {
      this.$emit('download', file);
    },
    removeIssue: function (issue) {
      this.$emit('remove', issue);
    },
    backtoIssueList: function () {
      this.openList = false;
      this.$emit('back');
    },
    dateConvert: function (time) {
      return time === 0 ? '尚未設定' : dayjs.unix(time).format('YYYY/MM/DD HH:mm:ss');
    }
  }
}
</script>