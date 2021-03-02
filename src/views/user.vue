<template>
  <v-main class='pa-0'>
    <v-dialog
      v-model="doneW"
      persistent
      max-width="50vw"
    >
      <v-card>
        <v-card-title class="headline">
          <font-awesome-icon icon='bell' />
          初次登入通知
        </v-card-title>
        <v-card-text>
          您可能是由於帳號密碼重置，或者是第一次登入，因此看到本訊息，提醒您，關閉本對話框後，請務必重新設定密碼，也請不要忘記完成LINE帳號綁定，這樣才能收到系統通知喔！
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            @click="doneW = false"
          >
            關閉通知
          </v-btn>
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
        <font-awesome-icon icon='cloud-upload-alt' />
      </v-btn>
    </v-fab-transition>
    <v-row>
      <v-col class="text-left">
          <v-avatar size="62">
              <img :src='"https://avatars.dicebear.com/api/" + currentUser.types + "/" + encodeURIComponent(currentUser.name + "@" + currentUser.unit) + ".svg"' />
          </v-avatar>
          <div class="text-h6 font-weight-bold">Email： {{ currentUser.email }}</div>
          <div class="text-caption">如要更改Email請洽管理員</div>
          <div class="text-body-2 font-weight-bold">帳號創建於： {{ dateConvert(currentUser.createDate) }} </div>
          <div class="text-body-2 font-weight-bold">帳號修改於： {{ dateConvert(currentUser.modDate) }} </div>
          <v-text-field prepend-icon='fa-key' type='password' label='用戶密碼' v-model='password' :class='firstRun'></v-text-field>
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
          <font-awesome-icon icon='link' />
          <span class="text-subtitle-2 font-weight-bold">社交媒體帳號綁定</span><br />
          <span class="text-body-1 font-weight-bold" v-if='currentUser.lineDate === 0'>
            請授權我們的機器人能用LINE Notify通知您專案進度
          </span>
          <span class="text-body-1 font-weight-bold" v-if='currentUser.lineDate !== 0'>
            您已經於 {{ dateConvert(currentUser.lineDate) }} 綁定過了
          </span><br/>
          <v-btn :href='lineAPI' target='_blank' :class='firstRun'>
              <font-awesome-icon :icon='["fab", "line"]' />
              綁定LINE Notify（會開新視窗）
          </v-btn><br />
          <font-awesome-icon :icon='["fab", "slack-hash"]' />
          <span class="text-subtitle-2 font-weight-bold">使用者標籤：</span><br/>
          <v-chip v-for='(item, k) in currentUser.tags' :key='k' class='ma-2' :color='tagColor(k)' label text-color='white'>{{ item.name }}</v-chip>
      </v-col>
    </v-row>
  </v-main>
</template>

<style scoped>
  .firstRun {
    animation:blinkBorder 1.2s infinite;
  }

  @keyframes blinkBorder{
    0%{     border: 2px solid maroon;    }
    49%{    border: none; }
    80%{    border: 1px solid maroon; }
    100%{   border: none;    }
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
Vue.config.productionTip = false;

export default {
  name: 'userSetting',
  created () {
    let oriobj = this;
    this.$emit('viewIn', {
      text: '使用者設定',
      icon: faUserCog
    });
    this.$socket.$subscribe('getCurrentUser', (data) => {
      oriobj.currentUser = data;
    });
    this.$socket.$subscribe('getRobotSetting', (data) => {
      oriobj.lineKey = data.LINENotifyKey;
    });
    this.$socket.$subscribe('setCurrentUser', (data) => {
      oriobj.modify = data.modify;
      setTimeout(() => {
        oriobj.modify = false;
      }, 5000);
    });
    this.$socket.client.emit('getCurrentUser');
    this.$socket.client.emit('getRobotSetting');
    this.$socket.client.emit('getsiteSetting');
    this.$socket.$subscribe('getsiteSetting', (data) => {
      oriobj.siteSetting = data;
    });
  },
  components: {
      Password
  },
  computed: {
    firstRun: function () {
      if (this.currentUser.firstRun) {
        return 'firstRun';
      }
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
      return 'https://notify-bot.line.me/oauth/authorize?response_type=code&scope=notify&client_id=' + this.lineKey + '&redirect_uri=' + this.siteSetting.siteLocation + '/backend/lineNotify&state=' + randomNum;
    }
  },
  methods: {
    dateConvert: function (time) {
        return moment.unix(time).format('YYYY/MM/DD HH:mm:ss');
    },
    tagColor: function (k) {
        return this.randomColors[k];
    },
    saveUser: function () {
      this.$socket.client.emit('setCurrentUser', {
        password: this.password,
        name: this.currentUser.name,
        types: this.currentUser.types,
        unit: this.currentUser.unit
      });
    }
  },
  props: {
  },
  data () {
      return {
        siteSetting: '',
        lineKey: '',
        modify: false,
        password: '',
        currentUser: {
            tags: [],
            types: 'bottts',
            name: 'undefined',
            unit: 'undefined',
            email: 'undefined@undefined.com',
            createDate: 0,
            modDate: 0,
            lineDate: 0
        },
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
