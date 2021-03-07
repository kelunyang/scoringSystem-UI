<template>
    <v-form @submit.prevent='submit'>
    <v-dialog
      v-model="resetW"
      persistent
      max-width="50vw"
    >
      <v-card>
        <v-card-title class="headline">
          <font-awesome-icon icon='key' />
          密碼重設通知
        </v-card-title>
        <v-card-text>
          {{ resetMsg }}
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            @click="resetW = false"
          >
            關閉通知
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="loginW"
      persistent
      max-width="50vw"
    >
      <v-card>
        <v-card-title class="headline">
          <font-awesome-icon icon='key' />
          登入系統
        </v-card-title>
        <v-card-text>
          {{ loginMsg }}
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            @click="loginW = false"
          >
            關閉通知
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
        <v-alert v-model='loginFail' type="error" icon="fa-skull">登入失敗</v-alert>
        <v-alert v-model='loginSuccess' type="success" icon="fa-grin-wink">登入成功！三秒之後跳轉首頁</v-alert>
        <v-main>
            <v-row>
              <v-col v-if='currentUserObj.name === "undefined"'>
                  <v-text-field label='帳號（你的Email）' v-model='name' required></v-text-field>
                  <v-text-field label='密碼' type='password' v-model='pass' required></v-text-field>
                  <v-main>
                      <v-row>
                          <v-col>
                              <v-btn color='success' type='submit'>登入</v-btn>
                              <v-btn color='teal darken-4' class='white--text' @click='passwordReset'>重新設定密碼</v-btn>
                          </v-col>
                      </v-row>
                  </v-main>
              </v-col>
              <v-col v-if='currentUserObj.name !== "undefined"' class='d-flex flex-column justify-center align-center'>
                <v-avatar size="60">
                  <img :src='currentUserObj.icon' />
                </v-avatar>
                <p class='text-h6'>{{ currentUserObj.name }}</p>
                <p class='text-body-2'>已登入</p>
                <v-btn color='primary' href='/#/Logout'>
                  <v-icon>fa-sign-out-alt</v-icon>
                  點此登出
                </v-btn>
              </v-col>
            </v-row>
        </v-main>
    </v-form>
</template>

<script>
// @ is an alias to /src
import Vue from 'vue';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faSkull, faGrinWink, faSignInAlt, faBomb, faRobot, faCommentDots } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import moment from 'moment';
import axios from 'axios';
import _ from 'lodash';

library.add(faSkull, faGrinWink, faSignInAlt, faBomb, faRobot, faCommentDots);
Vue.component('font-awesome-icon', FontAwesomeIcon);

export default {
  name: 'login',
  computed: {
    currentUserObj: function () {
      let type = this.currentUser === null || this.currentUser === undefined ? 'bottts' : this.currentUser.types;
      let name = this.currentUser === null || this.currentUser === undefined ? 'undefined' : this.currentUser.name;
      let unit = this.currentUser === null || this.currentUser === undefined ? 'undefined' : this.currentUser.unit;
      return {
        name: name,
        icon: 'https://avatars.dicebear.com/api/' + type + '/' + encodeURIComponent(name + '@' + unit) + '.svg'
      };
    }
  },
  data: function () {
    return {
      timer: null,
      currentUser: null,
      loginW: false,
      loginMsg: '',
      loginFail: false,
      loginSuccess: false,
      pass: '',
      name: '',
      icon: '',
      msg: '',
      resetW: false,
      resetMsg: ''
    };
  },
  methods: {
    socketgetCurrentUser: function (data) {
      let oriobj = this;
      oriobj.currentUser = data;
      if(!_.isNil(data)) {
        window.clearTimeout(oriobj.timer);
        oriobj.timer = setTimeout(() => {
          window.clearTimeout(oriobj.timer);
          if (!_.isNil(oriobj.currentUser)) {
            if ('firstRun' in oriobj.currentUser) {
              if (oriobj.currentUser.firstRun) {
                window.location.replace('https://' + window.location.host + '/#/user');
              } else {
                window.location.replace('https://' + window.location.host + '/#/userDashBoard');
              }
            } else {
              window.location.replace('https://' + window.location.host + '/#/userDashBoard');
            }
          }
        }, 1000);
      }
    },
    socketpasswordClientReset: function (data) {
      this.resetW = true;
      this.resetMsg = data.name === undefined ? '您輸入的帳號有誤，無法重設' : data.name + '密碼已重設，請檢查Email';
    },
    passwordReset: function () {
      this.$socket.client.emit('passwordClientReset', this.name);
    },
    dateConvert: function (time) {
        return moment.unix(time).format('YYYY/MM/DD HH:mm:ss');
    },
    async submit () {
        let oriObj = this;
        let result = await axios.post('https://' + window.location.host + '/backend/login', {
          user: oriObj.name,
          pass: oriObj.pass
        }, {
          withCredentials: true
        });
        if (result.data.loginStatus === 1) {
          this.loginW = true;
          this.loginMsg = '登入成功，網頁將重新載入後，您即可開始使用';
          window.location.reload();
        } else if (result.data.loginStatus === 2) {
          this.loginW = true;
          this.loginMsg = '您已經登入過了';
        } else {
          this.loginW = true;
          this.loginMsg = '帳號密碼錯誤';
        }
    }
  },
  beforeDestroy () {
    this.$socket.client.off('passwordClientReset', this.socketpasswordClientReset);
    this.$socket.client.off('getCurrentUser', this.socketgetCurrentUser);
  },
  created () {
    this.$emit('viewIn', {
      text: '使用者登入',
      icon: faSignInAlt,
      module: '登入模組'
    });
    this.$socket.client.on('passwordClientReset', this.socketpasswordClientReset);
    this.$socket.client.on('getCurrentUser', this.socketgetCurrentUser);
    this.$socket.client.emit('getCurrentUser');
  }
};
</script>
