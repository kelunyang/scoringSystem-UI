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
            <div class='text-h5 text-center pt-5 font-weight-black'>權限設定</div>
            <v-divider inset></v-divider>
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

<script>
// @ is an alias to /src
import Vue from 'vue';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faCog, faBomb, faRobot, faCommentDots } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import TagFilter from './modules/TagFilter';

import '@fortawesome/fontawesome-free/css/all.css';
library.add(faCog, faBomb, faRobot, faCommentDots);
Vue.component('font-awesome-icon', FontAwesomeIcon);
Vue.config.productionTip = false;

export default {
  name: 'settings',
  components: {
    TagFilter
  },
  created () {
    this.$emit('viewIn', {
      text: '系統設定',
      icon: faCog
    });
    let oriobj = this;
    this.$socket.client.emit('getTags');
    this.$socket.client.emit('getRobotUsers');
    this.$socket.client.emit('getGlobalSettings');
    this.$socket.client.emit('getRobotSetting');
    this.$socket.$subscribe('setSetting', (data) => {
      oriobj.icontype = 'cloud-upload-alt';
    });
    this.$socket.$subscribe('getTags', (data) => {
      oriobj.savedUserTags = data;
    });
    this.$socket.$subscribe('getRobotUsers', (data) => {
      oriobj.savedUsers = data;
    });
    this.$socket.$subscribe('getGlobalSettings', (data) => {
      oriobj.selectedSysTags = data.settingTags;
      oriobj.selectedUsrTags = data.userTags;
      oriobj.selectedflowTags = data.projectTags;
      oriobj.selectedrobotTag = data.robotTag;
      oriobj.siteLocation = data.siteLocation;
    });
    this.$socket.$subscribe('getRobotSetting', (data) => {
      oriobj.mailAccount = data.mailAccount;
      oriobj.mailPassword = data.mailPassword;
      oriobj.robotDeadLine = data.robotDeadLine;
      oriobj.patrolHour = data.patrolHour;
      oriobj.reportDuration = data.reportDuration;
      oriobj.LINENotifyKey = data.LINENotifyKey;
      oriobj.LINESecretKey = data.LINESecretKey;
      oriobj.nobodyAccount = data.nobodyAccount;
      oriobj.PatrolAccount = data.PatrolAccount;
      oriobj.LastPatrol = data.LastPatrol;
      oriobj.mailSSL = data.mailSSL;
      oriobj.mailSMTP = data.mailSMTP;
      oriobj.mailPort = data.mailPort;
    });
  },
  methods: {
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
        version: this.version
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
  mounted () {
  },
  data () {
      return {
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
