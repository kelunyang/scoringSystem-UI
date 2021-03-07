<template>
    <v-main class='pa-0'>
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
          <font-awesome-icon :icon='icontype' />
        </v-btn>
      </v-fab-transition>
      <v-row>
          <v-col class='d-flex flex-column'>
            <div class='text-h5 text-center pt-5 font-weight-black'>全域設定設定</div>
            <v-divider inset></v-divider>
            <v-text-field label='網站網址' v-model='siteLocation'></v-text-field>
            <v-text-field label='系統版本' v-model='version'></v-text-field>
            <tiptap-vuetify v-model="changeLog" :extensions="extensions" min-height='10vh' max-height='20vh' class='text-left' placeholder='請不要留白'/>
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
            <tag-filter :single='false' @plusItem='plusTag' :selectedItem='selectedSysTags' @valueUpdated='updateSysTag' :candidatedItem='savedUserTags' :createable='true' label='請輸入授權系統設定功能的使用者標籤' />
            <div class='text-subtitle-2 font-weight-blod'>授權用戶管理功能的使用者標籤</div>
            <tag-filter :single='false' @plusItem='plusTag' :selectedItem='selectedUsrTags' @valueUpdated='updateUsrTag' :candidatedItem='savedUserTags' :createable='true' label='請輸入授權用戶管理功能的使用者標籤' />
            <div class='text-subtitle-2 font-weight-blod'>授權知識點編輯器的使用者標籤</div>
            <tag-filter :single='false' @plusItem='plusTag' :selectedItem='selectedflowTags' @valueUpdated='updateFlowTag' :candidatedItem='savedUserTags' :createable='true' label='請輸入授權用戶管理功能的使用者標籤' />
            <div class='text-subtitle-2 font-weight-blod'>機器人的使用者標籤</div>
            <tag-filter :single='true' @plusItem='plusTag' :selectedItem='selectedrobotTag' @valueUpdated='updateRobotTag' :candidatedItem='savedUserTags' :createable='true' label='請輸入授權用戶管理功能的使用者標籤' />
            <div class='text-h5 text-center pt-5 font-weight-black'>機器人巡邏參數</div>
            <v-divider inset></v-divider>
            <div class='text-subtitle-2 font-weight-blod'>機器人代表帳號</div>
            <tag-filter :single='true' :selectedItem='PatrolAccount' @valueUpdated='updateRobatAccount' :candidatedItem='savedUsers' :createable='false' label='請輸入巡邏機器人代表帳號' />
            <div class='text-subtitle-2 font-weight-blod'>無人操作代表帳號</div>
            <tag-filter :single='true' :selectedItem='nobodyAccount' @valueUpdated='updateNobodyAccount' :candidatedItem='savedUsers' :createable='false' label='請輸入紀錄機器人代表帳號' />
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
          </v-col>
      </v-row>
    </v-main>
</template>

<style scoped>
.tiptap-vuetify-editor .ProseMirror {
  min-height: 100px;
  max-height: 200px;
}
</style>

<script>
// @ is an alias to /src
import Vue from 'vue';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faCog, faBomb, faRobot, faCommentDots } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import TagFilter from './modules/TagFilter';
import TurndownService from 'turndown';
import marked from 'marked';
import { TiptapVuetify, Heading, Bold, Italic, Strike, Underline, Code, Paragraph, BulletList, OrderedList, ListItem, Link, Blockquote, HardBreak, HorizontalRule, History } from 'tiptap-vuetify';
import 'tiptap-vuetify/dist/main.css';

import '@fortawesome/fontawesome-free/css/all.css';
library.add(faCog, faBomb, faRobot, faCommentDots);
Vue.component('font-awesome-icon', FontAwesomeIcon);

const turndownService = new TurndownService();

export default {
  name: 'settings',
  components: {
    TagFilter,
    TiptapVuetify
  },
  beforeDestroy () {
    this.$socket.client.off('setSetting', this.socketsetSetting);
    this.$socket.client.off('getTags', this.socketgetTags);
    this.$socket.client.off('getRobotUsers', this.socketgetRobotUsers);
    this.$socket.client.off('getGlobalSettings', this.socketgetGlobalSettings);
    this.$socket.client.off('getRobotSetting', this.socketgetRobotSetting);
  },
  mounted () {
    this.$emit('viewIn', {
      text: '系統設定',
      icon: faCog,
      module: '設定模組'
    });
    this.$socket.client.emit('getTags');
    this.$socket.client.emit('getRobotUsers');
    this.$socket.client.emit('getGlobalSettings');
    this.$socket.client.emit('getRobotSetting');
    this.$socket.client.on('setSetting', this.socketsetSetting);
    this.$socket.client.on('getTags', this.socketgetTags);
    this.$socket.client.on('getRobotUsers', this.socketgetRobotUsers);
    this.$socket.client.on('getGlobalSettings', this.socketgetGlobalSettings);
    this.$socket.client.on('getRobotSetting', this.socketgetRobotSetting);
  },
  methods: {
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
    },
    socketgetGlobalSettings: function (data) {
      this.selectedSysTags = data.settingTags;
      this.selectedUsrTags = data.userTags;
      this.selectedflowTags = data.projectTags;
      this.selectedrobotTag = data.robotTag;
      this.siteLocation = data.siteLocation;
      this.userCheckTime = data.userCheckTime;
      this.changeLog = this.HTMLConverter(data.changeLog);
      this.version = data.version;
      this.connectionTimeout = data.connectionTimeout;
    },
    socketgetRobotUsers: function (data) {
      this.savedUsers = data;
    },
    socketgetTags: function (data) {
      this.savedUserTags = data;
    },
    socketsetSetting: function () {
      this.icontype = 'cloud-upload-alt';
    },
    HTMLConverter: function (msg) {
      msg = msg === null || msg == undefined ? '**test**' : msg;
      return marked(msg);
    },
    saveSetting: function () {
      this.icontype = 'spinner';
      this.$socket.client.emit('setSetting', {
        selectedSysTags: this.selectedSysTags,
        selectedUsrTags: this.selectedUsrTags,
        selectedflowTags: this.selectedflowTags,
        selectedrobotTag: this.selectedrobotTag,
        reportDuration: this.reportDuration,
        robotDeadLine: this.robotDeadLine,
        mailAccount: this.mailAccount,
        mailPassword: this.mailPassword,
        patrolHour: this.patrolHour,
        nobodyAccount: this.nobodyAccount,
        LINENotifyKey: this.LINENotifyKey,
        LINESecretKey: this.LINESecretKey,
        PatrolAccount: this.PatrolAccount,
        mailSMTP: this.mailSMTP,
        mailPort: this.mailPort,
        mailSSL: this.mailSSL,
        siteLocation: this.siteLocation,
        version: this.version,
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
    updateFlowTag: function (value) {
      this.selectedflowTags = value;
    },
    updateRobotAccount: function (value) {
      this.PatrolAccount = value;
    },
    updateNobodyAccount: function (value) {
      this.nobodyAccount = value;
    }
  },
  props: {
  },
  watch: {
  },
  data () {
      return {
        extensions: [
          History,
          Blockquote,
          Link,
          Underline,
          Strike,
          Italic,
          ListItem,
          BulletList,
          OrderedList,
          [Heading, {
            options: {
              levels: [1, 2, 3]
            }
          }],
          Bold,
          Code,
          HorizontalRule,
          Paragraph,
          HardBreak
        ],
        connectionTimeout: 2,
        userCheckTime: 10,
        changeLog: '',
        version: '',
        siteLocation: '',
        mailSSL: true,
        mailSMTP: '',
        mailPort: '',
        icontype: 'cloud-upload-alt',
        savedUserTags: [
          {
            name: '',
            _id: ''
          }
        ],
        savedUsers: [
          {
            name: '',
            _id: ''
          }
        ],
        selectedSysTags: [''],
        selectedUsrTags: [''],
        selectedflowTags: [''],
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
