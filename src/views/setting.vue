<template>
  <v-sheet class='pa-0 d-flex flex-column'>
    <v-fab-transition>
      <v-btn
        color="pink"
        fixed
        fab
        large
        dark
        bottom
        right
        @click='saveSetting'
      >
        <v-icon>{{ icontype }}</v-icon>
      </v-btn>
    </v-fab-transition>
    <div class='text-h5 text-center pt-5 font-weight-black'>全域設定設定</div>
    <v-divider inset></v-divider>
    <v-text-field label='網站網址' v-model='siteLocation'></v-text-field>
    <v-select
      :items='frontendCommits'
      label='系統前端版本'
      v-model='versionFrontend'
      item-text="commitDate"
      item-value="id"
    >
      <template slot="selection" slot-scope="data">
        <span>{{ githubConvert(data.item) }}</span>
      </template>
      <template slot="item" slot-scope="data">
        <span>{{ githubConvert(data.item) }}</span>
      </template>
    </v-select>
    <v-select
      :items='backendCommits'
      label='系統後端版本'
      v-model='versionBackend'
      item-text="commitDate"
      item-value="id"
    >
      <template slot="selection" slot-scope="data">
        <span>{{ githubConvert(data.item) }}</span>
      </template>
      <template slot="item" slot-scope="data">
        <span>{{ githubConvert(data.item) }}</span>
      </template>
    </v-select>
    <v-text-field label='檔案儲存位置' v-model='storageLocation' hint='請注意，這裡是檔案儲存位置指的是NFS主機上的位置，不知道別亂調，最後不用加上/'></v-text-field>
    <v-text-field label='Github Personal Token' v-model='githubKey' hint='請注意，這是GitHub產生的Personal Token'></v-text-field>
    <v-text-field label='前端Github Repo Address' v-model='frontendRepo' hint='請注意，這是前端專案在GitHub的位置'></v-text-field>
    <v-text-field label='後端Github Repo Address' v-model='backendRepo' hint='請注意，這是後端專案在GitHub的位置'></v-text-field>
    <div class='text-h5 text-center pt-5 font-weight-black'>權限設定</div>
    <v-divider inset></v-divider>
    <div class='text-subtitle-2 font-weight-blod'>用戶連線中定時更新時間</div>
    <div class='red--text text-caption'>這裡指的是用戶端多久跟伺服器更新同時線上用戶、用戶權限的等待時間</div>
    <v-slider
      label='用戶連線中定時更新時間（分鐘）'
      min='5'
      max='120'
      v-model="userCheckTime"
      thumb-label
    ></v-slider>
    <div class='text-subtitle-2 font-weight-blod'>用戶連線逾時時間</div>
    <v-slider
      label='用戶連線逾時時間（秒）'
      min='1'
      max='10'
      v-model="connectionTimeout"
      thumb-label
    ></v-slider>
    <div class='text-subtitle-2 font-weight-blod'>授權系統設定功能的使用者標籤</div>
    <tag-filter :mustSelected='true' :single='false' @plusItem='plusTag' :selectedItem='selectedSysTags' @valueUpdated='updateSysTag' :candidatedItem='savedTags' :createable='true' label='請輸入授權系統設定功能的使用者標籤' />
    <div class='text-subtitle-2 font-weight-blod'>授權用戶管理功能的使用者標籤</div>
    <tag-filter :mustSelected='true' :single='false' @plusItem='plusTag' :selectedItem='selectedUsrTags' @valueUpdated='updateUsrTag' :candidatedItem='savedTags' :createable='true' label='請輸入授權用戶管理功能的使用者標籤' />
    <div class='text-subtitle-2 font-weight-blod'>授權知識點管理功能的使用者標籤</div>
    <tag-filter :mustSelected='true' :single='false' @plusItem='plusTag' :selectedItem='selectedflowTags' @valueUpdated='updateFlowTag' :candidatedItem='savedTags' :createable='true' label='請輸入授權知識點管理功能的使用者標籤' />
    <div class='text-subtitle-2 font-weight-blod'>授權統計功能的使用者標籤</div>
    <tag-filter :mustSelected='true' :single='false' @plusItem='plusTag' :selectedItem='selectedstatisticsTags' @valueUpdated='updateStatisticsTag' :candidatedItem='savedTags' :createable='true' label='請輸入授權使用統計功能的使用者標籤' />
    <div class='text-subtitle-2 font-weight-blod'>顯示在系統資訊頁的使用者標籤</div>
    <tag-filter :mustSelected='true' :single='false' @plusItem='plusTag' :selectedItem='selectedserviceTags' @valueUpdated='updateServiceTag' :candidatedItem='savedTags' :createable='true' label='請輸入顯示在系統資訊頁的使用者標籤' />
    <div class='text-subtitle-2 font-weight-blod'>機器人的使用者標籤</div>
    <tag-filter :mustSelected='true' :single='true' @plusItem='plusTag' :selectedItem='selectedrobotTag' @valueUpdated='updateRobotTag' :candidatedItem='savedTags' :createable='true' label='請輸入授權用戶管理功能的使用者標籤' />
    <div class='text-h5 text-center pt-5 font-weight-black'>機器人巡邏參數</div>
    <v-divider inset></v-divider>
    <div class='text-subtitle-2 font-weight-blod'>機器人代表帳號</div>
    <tag-filter :mustSelected='true' :single='true' :selectedItem='PatrolAccount' @valueUpdated='updateRobatAccount' :candidatedItem='savedUsers' :createable='false' label='請輸入巡邏機器人代表帳號' />
    <div class='text-subtitle-2 font-weight-blod'>無人操作代表帳號</div>
    <tag-filter :mustSelected='true' :single='true' :selectedItem='nobodyAccount' @valueUpdated='updateNobodyAccount' :candidatedItem='savedUsers' :createable='false' label='請輸入紀錄機器人代表帳號' />
    <v-text-field label='EMail帳號' v-model='mailAccount' hint='請注意，這是在Google/Outlook.com裡建立的應用程式帳號'></v-text-field>
    <v-text-field label='EMail密碼' v-model='mailPassword' hint='請注意，這是在Google/Outlook.com裡建立的應用程式密碼'></v-text-field>
    <v-text-field label='EMail主機' v-model='mailSMTP' hint='請貼上你的主機的SMTP位置'></v-text-field>
    <v-text-field label='EMail Port' v-model='mailPort' hint='請貼上你的主機的SMTP port'></v-text-field>
    <v-switch v-model="mailSSL" label="SMTP是否有SSL"></v-switch>
    <v-text-field label='LINE Notify client id' v-model='LINENotifyKey' hint='請注意，這是在LINE notify裡建立取得的client key'></v-text-field>
    <v-text-field label='LINE Notify secret key' v-model='LINESecretKey' hint='請注意，這是在LINE notify裡取得的secret'></v-text-field>
    <v-slider
      label='定期通報時間（小時）'
      min='0'
      max='23'
      v-model="patrolHour"
      thumb-label
    ></v-slider>
    <v-slider
      label='死線設定（小時）'
      min='24'
      max='168'
      v-model="robotDeadLine"
      thumb-label
    ></v-slider>
    <v-slider
      label='定期匯報（天）'
      min='1'
      max='21'
      v-model="reportDuration"
      thumb-label
    ></v-slider>
    <div>機器人最後一次掃描時間： {{ dateConvert(LastPatrol) }}</div>
    <v-text-field label='備份檔案位置' v-model='backupLocation' hint='請注意，這裡的位置是NFS主機上的位置，不知道別亂調，最後不用加上/，另外，檔案備份是直接複寫舊備份檔，沒有版本問題'></v-text-field>
    <v-slider
      label='檔案備份頻率（天）'
      min='1'
      max='10'
      v-model="backupDuration"
      thumb-label
    ></v-slider>
    <div>機器人最後一次備份時間： {{ dateConvert(LastBackup) }}</div>
    <v-text-field label='資料庫備份檔案位置' v-model='dbbackupLocation' hint='請注意，這裡的位置是NFS主機上的位置，不知道別亂調，最後不用加上/'></v-text-field>
    <v-slider
      label='資料庫檔案備份頻率（天）'
      min='1'
      max='10'
      v-model="dbbackupDuration"
      thumb-label
    ></v-slider>
    <v-slider
      label='資料庫檔案保留份數'
      min='1'
      max='5'
      v-model="dbbackupCopies"
      thumb-label
    ></v-slider>
    <v-btn>按此手動備份（還沒開發別按）</v-btn>
    <div>資料庫最後一次備份時間： {{ dateConvert(LastDBbackup) }}</div>
    <div class='text-h5 text-center pt-5 font-weight-black'>啟動／關閉v2ray</div>
    <v-switch
      :disabled='!v2RayChecked'
      v-model="v2Ray"
      label="啟動v2Ray穿牆"
    ></v-switch>
    <v-textarea
      label="回傳紀錄"
      v-model="shellReport"
    ></v-textarea>
    <div class='text-caption red--text' v-if='!v2RayChecked'>確認v2Ray狀態中</div>
    <div class='text-caption red--text' v-if='serverAddress !== ""'>主機IP位置： {{ serverAddress }} </div>
  </v-sheet>
</template>

<script>
// @ is an alias to /src
import Vue from 'vue';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faCog, faBomb, faRobot, faCommentDots } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import TagFilter from './modules/TagFilter';
import TurndownService from 'turndown';
import marked from 'marked';
import moment from 'moment';

import '@fortawesome/fontawesome-free/css/all.css';
library.add(faCog, faBomb, faRobot, faCommentDots);
Vue.component('font-awesome-icon', FontAwesomeIcon);

const turndownService = new TurndownService();

export default {
  name: 'settings',
  components: {
    TagFilter
  },
  computed: {
    savedTags: function () {
      return this.$store.state.savedTags;
    }
  },
  beforeDestroy () {
    this.$socket.client.off('setSetting', this.socketsetSetting);
    this.$socket.client.off('getRobotUsers', this.socketgetRobotUsers);
    this.$socket.client.off('getGlobalSettings', this.socketgetGlobalSettings);
    this.$socket.client.off('getRobotSetting', this.socketgetRobotSetting);
    this.$socket.client.off('getGithubBackendCommit', this.socketgetGithubBackendCommit);
    this.$socket.client.off('getGithubFrontendCommit', this.socketgetGithubFrontendCommit);
    this.$socket.client.off('v2rayReport', this.socketv2rayReport);
    this.$socket.client.off('checkV2ray', this.socketcheckV2ray);
    this.$socket.client.off('getserverADDR', this.socketgetserverADDR);
  },
  created () {
    this.$emit('viewIn', {
      text: '系統設定',
      icon: 'fa-cogs',
      module: '設定模組',
      location: '/setting'
    });
    this.$socket.client.emit('getRobotUsers');
    this.$socket.client.emit('getGlobalSettings');
    this.$socket.client.emit('getRobotSetting');
    this.$socket.client.emit('getGithubBackendCommit');
    this.$socket.client.emit('getGithubFrontendCommit');
    this.$socket.client.emit('checkV2ray');
    this.$socket.client.on('setSetting', this.socketsetSetting);
    this.$socket.client.on('getserverADDR', this.socketgetserverADDR);
    this.$socket.client.on('checkV2ray', this.socketcheckV2ray);
    this.$socket.client.on('getRobotUsers', this.socketgetRobotUsers);
    this.$socket.client.on('getGlobalSettings', this.socketgetGlobalSettings);
    this.$socket.client.on('getRobotSetting', this.socketgetRobotSetting);
    this.$socket.client.on('getGithubBackendCommit', this.socketgetGithubBackendCommit);
    this.$socket.client.on('getGithubFrontendCommit', this.socketgetGithubFrontendCommit);
    this.$socket.client.on('v2rayReport', this.socketv2rayReport);
  },
  methods: {
    dateConvert: function (time) {
      return time === 0 ? '尚未發生' : moment.unix(time).format('YYYY/MM/DD HH:mm:ss');
    },
    socketgetserverADDR: function (data) {
      this.serverAddress = data;
    },
    socketv2rayReport: function (data) {
      this.shellReport += data + '\n';
    },
    socketcheckV2ray: function (data) {
      let oriobj = this;
      this.v2Ray = data > -1;
      Vue.nextTick(() => {
        oriobj.v2RayChecked = true;
      });
    },
    githubConvert: function (commit) {
      return commit.id + '(發布於' + moment(commit.commitDate).format('YYYY/MM/DD HH:mm:ss') + ')';
    },
    socketgetGithubBackendCommit: function (data) {
      this.backendCommits = data;
    },
    socketgetGithubFrontendCommit: function (data) {
      this.frontendCommits = data;
    },
    socketgetRobotSetting: function (data) {
      this.mailAccount = data.mailAccount;
      this.mailPassword = data.mailPassword;
      this.robotDeadLine = data.robotDeadLine;
      this.patrolHour = data.patrolHour;
      this.reportDuration = data.reportDuration;
      this.LINENotifyKey = data.LINENotifyKey;
      this.LINESecretKey = data.LINESecretKey;
      this.nobodyAccount = data.nobodyAccount;
      this.PatrolAccount = data.PatrolAccount;
      this.LastPatrol = data.LastPatrol;
      this.mailSSL = data.mailSSL;
      this.mailSMTP = data.mailSMTP;
      this.mailPort = data.mailPort;
      this.backupLocation = data.backupLocation;
      this.dbbackupLocation = data.dbbackupLocation;
      this.backupDuration = data.backupDuration;
      this.dbbackupDuration = data.dbbackupDuration;
      this.dbbackupCopies = data.dbbackupCopies;
    },
    socketgetGlobalSettings: function (data) {
      this.selectedSysTags = data.settingTags;
      this.selectedUsrTags = data.userTags;
      this.selectedflowTags = data.projectTags;
      this.selectedstatisticsTags = data.statisticsTags;
      this.selectedrobotTag = data.robotTag;
      this.siteLocation = data.siteLocation;
      this.userCheckTime = data.userCheckTime;
      this.changeLog = this.HTMLConverter(data.changeLog);
      this.versionFrontend = data.versionFrontend;
      this.versionBackend = data.versionBackend;
      this.githubKey = data.githubKey;
      this.frontendRepo = data.frontendRepo;
      this.backendRepo = data.backendRepo;
      this.connectionTimeout = data.connectionTimeout;
      this.storageLocation = data.storageLocation;
      this.selectedserviceTags = data.serviceTags;
    },
    socketgetRobotUsers: function (data) {
      this.savedUsers = data;
    },
    socketsetSetting: function () {
      this.$emit('toastPop', "系統設定儲存完成...");
      this.icontype = 'fa-cloud-upload-alt';
    },
    HTMLConverter: function (msg) {
      msg = msg === null || msg == undefined ? '**test**' : msg;
      return marked(msg);
    },
    saveSetting: function () {
      this.$emit('toastPop', "儲存系統設定中...");
      this.icontype = 'fa-spinner';
      this.$socket.client.emit('setSetting', {
        storageLocation: this.storageLocation,
        backupDuration: this.backupDuration,
        backupLocation: this.backupLocation,
        dbbackupLocation: this.dbbackupLocation,
        dbbackupDuration: this.dbbackupDuration,
        dbbackupCopies: this.dbbackupCopies,
        selectedSysTags: this.selectedSysTags,
        selectedUsrTags: this.selectedUsrTags,
        selectedflowTags: this.selectedflowTags,
        selectedrobotTag: this.selectedrobotTag,
        selectedstatisticsTags: this.selectedstatisticsTags,
        reportDuration: this.reportDuration,
        robotDeadLine: this.robotDeadLine,
        mailAccount: this.mailAccount,
        mailPassword: this.mailPassword,
        patrolHour: this.patrolHour,
        nobodyAccount: this.nobodyAccount,
        LINENotifyKey: this.LINENotifyKey,
        LINESecretKey: this.LINESecretKey,
        PatrolAccount: this.PatrolAccount,
        serviceTags: this.selectedserviceTags,
        mailSMTP: this.mailSMTP,
        mailPort: this.mailPort,
        mailSSL: this.mailSSL,
        siteLocation: this.siteLocation,
        versionFrontend: this.versionFrontend,
        versionBackend: this.versionBackend,
        githubKey: this.githubKey,
        frontendRepo: this.frontendRepo,
        backendRepo: this.backendRepo,
        userCheckTime: this.userCheckTime,
        connectionTimeout: this.connectionTimeout,
        changeLog: turndownService.turndown(this.changeLog)
      });
    },
    plusTag: function (val) {
      this.$socket.client.emit('addTag', val);
    },
    updateSysTag: function (value) {
      this.selectedSysTags = value;
    },
    updateRobotTag: function (value) {
      this.selectedrobotTag = value;
    },
    updateUsrTag: function (value) {
      this.selectedUsrTags = value;
    },
    updateServiceTag: function (value) {
      this.selectedserviceTags = value;
    },
    updateFlowTag: function (value) {
      this.selectedflowTags = value;
    },
    updateStatisticsTag: function (value) {
      this.selectedstatisticsTags = value;
    },
    updateRobotAccount: function (value) {
      this.PatrolAccount = value;
    },
    updateNobodyAccount: function (value) {
      this.nobodyAccount = value;
    }
  },
  watch: {
    v2Ray: function () {
      if(this.v2RayChecked) {
        if(this.v2Ray) {
          this.$socket.client.emit('startV2ray');
        } else {
          this.$socket.client.emit('stopV2ray');
        }
      }
    }
  },
  data () {
    return {
      selectedserviceTags: [],
      LastPatrol: 0,
      LastDBbackup: 0,
      LastBackup: 0,
      storageLocation: '',
      backupLocation: '',
      dbbackupLocation: '',
      backupDuration: 1,
      dbbackupDuration: 1,
      dbbackupCopies: 1,
      serverAddress: '',
      v2RayChecked: false,
      v2Ray: false,
      shellReport: '',
      githubKey: '',
      frontendRepo: '',
      backendRepo: '',
      connectionTimeout: 2,
      userCheckTime: 10,
      changeLog: '',
      versionFrontend: '',
      versionBackend: '',
      frontendCommits: [],
      backendCommits: [],
      siteLocation: '',
      mailSSL: true,
      mailSMTP: '',
      mailPort: '',
      icontype: 'fa-cloud-upload-alt',
      savedUsers: [
        {
          name: '',
          _id: ''
        }
      ],
      selectedSysTags: [],
      selectedUsrTags: [],
      selectedflowTags: [],
      selectedstatisticsTags: [],
      selectedrobotTag: '',
      PatrolAccount: '',
      nobodyAccount: '',
      reportDuration: 7,
      robotDeadLine: 60,
      mailAccount: '',
      mailPassword: '',
      patrolHour: 7
    };
  }
};
</script>
