<template>
  <v-main class='pa-0'>
    <v-dialog
      v-model="firstRunW"
      transition="dialog-bottom-transition"
      width="50vw"
    >
      <v-card>
        <v-toolbar
          dark
          color="primary"
        >
          <v-toolbar-title>第一次登入嗎？請看這裡</v-toolbar-title>
        </v-toolbar>
        <v-card-text class='pa-5 text-left text-body-1'>
          <div>請注意以下事項：</div>
          <ol>
            <li>你必須變更密碼，沒有密碼規則，隨便設定，但是只要你不改，你每次都會看到這個視窗</li>
            <li>建議綁定LINE，這樣你可以收到專案進度機器人的即時通知（請不要跟機器人講話，因為根本收不到）</li>
            <li>存檔按鈕在右下方，長這樣！<br/>
              <v-icon x-large>fa-cloud-upload-alt</v-icon>
            </li>
          </ol>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click='firstRunW = false'>我看懂了，請關閉視窗</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-alert
      type="info"
      v-show='modify !== false'
    >
      當前使用者資訊已在 {{ dateConvert(modify) }} 修改完成！
    </v-alert>
    <v-fab-transition>
      <v-btn
        color="pink"
        fixed
        fab
        large
        dark
        bottom
        right
        @click='saveUser'
      >
        <v-icon>fa-cloud-upload-alt</v-icon>
      </v-btn>
    </v-fab-transition>
    <v-row>
      <v-col class="text-left">
          <v-alert
            type="error"
            v-show='currentUser.firstRun === true'
          >
            第一次登入嗎？請記得填入你的密碼（已閃紅），並且務必綁定LINE notify喔！
          </v-alert>
          <v-avatar size="62">
            <img :src='"https://avatars.dicebear.com/api/" + currentUser.types + "/" + encodeURIComponent(currentUser.name + "@" + currentUser.unit) + ".svg"' />
          </v-avatar>
          <div class="text-h6 font-weight-bold">Email： {{ currentUser.email }}</div>
          <div class="text-caption">如要更改Email請洽管理員</div>
          <div class="text-body-2 font-weight-bold">帳號創建於： {{ dateConvert(currentUser.createDate) }} </div>
          <div class="text-body-2 font-weight-bold">帳號修改於： {{ dateConvert(currentUser.modDate) }} </div>
          <v-text-field prepend-icon='fa-key' type='password' label='用戶密碼' hint="請輸入您的新密碼" v-model='password' :class='firstRun'></v-text-field>
          <password v-model="password" :strength-meter-only="true"/>
          <v-text-field prepend-icon='fa-user-alt' label='用戶名稱' v-model='currentUser.name'></v-text-field>
          <v-select
              prepend-icon='fa-transgender-alt'
              v-model='currentUser.types'
              :items='types'
              item-text='title'
              item-value='value'
              label='性別'
          ></v-select>
          <v-text-field prepend-icon='fa-building' label='用戶單位' v-model='currentUser.unit'></v-text-field>
          <v-icon>fa-link</v-icon>
          <span class="text-subtitle-2 font-weight-bold">社交媒體帳號綁定</span><br />
          <span class="text-body-1 font-weight-bold" v-if='currentUser.lineDate === 0 || currentUser.lineDate === undefined'>
            請授權我們的機器人能用LINE Notify通知您專案進度
          </span>
          <span class="text-body-1 font-weight-bold" v-else>
            您已經於 {{ dateConvert(currentUser.lineDate) }} 綁定過了
          </span><br/>
          <v-btn :href='lineAPI' target='_blank' :class='firstRun'>
            <v-icon>fab fa-line</v-icon>
            綁定LINE Notify（會開新視窗）
          </v-btn><br />
          <v-icon>fab fa-slack-hash</v-icon>
          <span class="text-subtitle-2 font-weight-bold">您所隸屬的使用者標籤：</span><br/>
          <div class='d-flex flex-row flex-wrap'>
            <v-chip v-for='(item, k) in currentUser.tags' :key='k' class='ma-2' :color='tagColor(k)' label text-color='white'>{{ item.name }}</v-chip>
          </div>
      </v-col>
    </v-row>
  </v-main>
</template>

<style scoped>
  .firstRun {
    animation:blinkBorder 1.2s infinite;
  }

  @keyframes blinkBorder{
    0%{     border: 2px solid rgb(83, 0, 0);    }
    50%{    border: 2px solid red; }
    100%{   border: 2px solid white;    }
  }
</style>

<script>
// @ is an alias to /src
import Vue from 'vue';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faUserCog, faLink } from '@fortawesome/free-solid-svg-icons';
import { faSlackHash, faGoogle, faLine } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { randomColor } from 'randomcolor';
import moment from 'moment';
import Password from 'vue-password-strength-meter';
import random from 'random';

import '@fortawesome/fontawesome-free/css/all.css';

library.add(faUserCog, faSlackHash, faGoogle, faLine, faLink);
Vue.component('font-awesome-icon', FontAwesomeIcon);

export default {
  name: 'userSetting',
  beforeDestroy () {
    this.$socket.client.off('getRobotSetting', this.socketgetRobotSetting);
    this.$socket.client.off('setCurrentUser', this.socketsetCurrentUser);
  },
  created () {
    this.$emit('viewIn', {
      text: '使用者設定',
      icon: 'fa-user-edit',
      module: '帳號模組',
      location: '/user'
    });
    this.$socket.client.on('getRobotSetting', this.socketgetRobotSetting);
    this.$socket.client.on('setCurrentUser', this.socketsetCurrentUser);
    this.$socket.client.emit('getRobotSetting');
  },
  components: {
      Password
  },
  computed: {
    currentUser: function () {
      return this.$store.state.currentUser;
    },
    siteSettings: function () {
      return this.$store.state.siteSettings;
    },
    firstRun: function () {
      if (this.currentUser.firstRun) {
        return 'firstRun';
      }
      return '';
    },
    randomColors: function () {
        let color = randomColor({
            luminosity: 'dark',
            count: this.currentUser.tags.length,
            format: 'rgb'
        });
        return color;
    },
    lineAPI: function () {
      let randomNum = random.int(10000, 99999);
      return 'https://notify-bot.line.me/oauth/authorize?response_type=code&scope=notify&client_id=' + this.lineKey + '&redirect_uri=' + this.siteSettings.siteLocation + '/backend/lineNotify&state=' + randomNum;
    }
  },
  methods: {
    socketsetCurrentUser: function (data) {
      this.$emit('toastPop', "用戶資訊已於" + this.dateConvert(data.modify) + "修改完成！請稍待系統更新您的資訊");
      this.$socket.client.emit('getsiteSetting');
    },
    socketgetRobotSetting: function (data) {
      this.lineKey = data.LINENotifyKey;
    },
    dateConvert: function (time) {
      return moment.unix(time).format('YYYY/MM/DD HH:mm:ss');
    },
    tagColor: function (k) {
      return this.randomColors[k];
    },
    saveUser: function () {
      this.$emit('toastPop', "儲存您修改的用戶資訊中...");
      this.$socket.client.emit('setCurrentUser', {
        password: this.password,
        name: this.currentUser.name,
        types: this.currentUser.types,
        unit: this.currentUser.unit
      });
    }
  },
  watch: {
    firstRun: function () {
      if(this.firstRunW) {
        this.firstRunW = this.firstRun;
      }
    }
  },
  data () {
      return {
        firstRunW: true,
        lineKey: '',
        modify: false,
        password: '',
        types: [
            {
                title: '男',
                value: 'male'
            },
            {
                title: '女',
                value: 'female'
            },
            {
                title: '不想說',
                value: 'human'
            }
        ]
      };
  }
};
</script>
