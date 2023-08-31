<template>
  <v-main class='pa-1'>
    <v-alert outlined v-model='loginFail' type="error" icon="fa-skull" class='text-left'>登入失敗</v-alert>
    <v-alert outlined v-model='loginSuccess' type="success" icon="fa-grin-wink" class='text-left'>登入成功！三秒之後跳轉首頁</v-alert>
    <v-alert outlined v-if='currentUser._id === ""' type='info' icon='fa-info-circle' class='text-left'>請注意帳號密碼大小寫</v-alert>
    <v-row v-if='currentUser._id === ""'>
      <v-col class='d-flex flex-column pa-2 ma-0'>
        <v-text-field outlined clearable dense label='帳號（你的Email）' v-model='name' required></v-text-field>
        <v-text-field outlined clearable dense label='密碼' type='password' v-model='pass' @keypress="keySubmit" required></v-text-field>
      </v-col>
    </v-row>
    <v-row v-if='currentUser._id === ""'>
      <v-col class='d-flex flex-column pa-2 ma-0'>
        <v-btn color='light-blue darken-4' @click="submit" class='ma-1 white--text'>登入</v-btn>
        <v-btn color='red darken-4' class='ma-1 white--text' @click='passwordReset'>忘記密碼，重新設定</v-btn>
      </v-col>
    </v-row>
    <v-row v-if='currentUser._id !== ""'>
      <v-col class='d-flex flex-column justify-center align-center'>
        <div class='ma-3'>
          <v-avatar size="60">
            <Avatar :user='currentUser' :size='60' />
          </v-avatar>
          <p class='text-h6'>{{ currentUser.name }}</p>
          <p class='text-body-2'>已登入</p>
        </div>
        <v-btn color='primary' class='ma-3' href='/#/userDashBoard'>
          如果你沒有被自動導入DashBoard，請點此
        </v-btn>
        <v-btn color='primary' class='ma-3' href='/#/Logout'>
          <v-icon>fa-sign-out-alt</v-icon>
          點此登出
        </v-btn>
      </v-col>
    </v-row>
  </v-main>
</template>

<script>
// @ is an alias to /src
import dayjs from 'dayjs';
import axios from 'axios';

export default {
  name: 'login',
  computed: {
    currentUser: function () {
      return this.$store.state.currentUser;
    }
  },
  components: { 
    Avatar: () => import(/* webpackChunkName: 'Avatar', webpackPrefetch: true */ './modules/Avatar'),
  },
  data: function () {
    return {
      loginMsg: '',
      loginFail: false,
      loginSuccess: false,
      pass: '',
      name: '',
      icon: '',
      msg: '',
      resetMsg: ''
    };
  },
  methods: {
    keySubmit: async function (key) {
      if(key.keyCode === 13) {
        await this.submit();
      }
    },
    socketpasswordClientReset: function (data) {
      this.$emit('toastPop', data.name === undefined ? '您輸入的帳號有誤，無法重設' : data.name + '密碼已重設，請檢查Email');
    },
    passwordReset: function () {
      this.$emit('toastPop', '發送密碼重置請求，請稍後，伺服器操作完成會另有訊息通知');
      this.$socket.client.emit('passwordClientReset', this.name);
    },
    dateConvert: function (time) {
        return dayjs.unix(time).format('YYYY/MM/DD HH:mm:ss');
    },
    submit: async function () {
        let result = await axios.post('https://' + window.location.host + '/backend/login', {
          user: this.name.trim(),
          pass: this.pass
        }, {
          withCredentials: true
        });
        if (result.data.loginStatus === 1) {
          this.$emit('toastPop', '登入成功，網頁將重新載入後，您即可開始使用');
          this.$emit('preventReloadDetect', true);
          window.location.reload();
        } else if (result.data.loginStatus === 2) {
          this.$emit('toastPop', '您已經登入過了');
        } else {
          this.$emit('toastPop', '帳號密碼錯誤');
        }
    }
  },
  beforeDestroy () {
    this.$socket.client.off('passwordClientReset', this.socketpasswordClientReset);
  },
  created () {
    this.$emit('viewIn', {
      text: '使用者登入',
      icon: 'fa-sign-in-alt',
      module: '登入模組',
      location: '/Login'
    });
    this.$socket.client.on('passwordClientReset', this.socketpasswordClientReset);
  }
};
</script>
