<template>
  <section>
      <v-alert outlined v-model='logoutFail' type='error' icon="fa-skull" class='text-left'><v-icon>fa-skull</v-icon>登入失敗</v-alert>
      <v-alert outlined v-model='logoutSuccess' type='success' icon="fa-grin-wink" class='text-left'><v-icon>fa-grin-wink</v-icon>登入成功！三秒之後跳轉首頁</v-alert>
      <h1 class='loginIcon'><v-icon>fa-sign-out-alt</v-icon>登出頁面</h1>
      {{ logoutText }}
  </section>
</template>

<style>

</style>

<script>
// @ is an alias to /src
import axios from 'axios';

export default {
  name: 'logout',
  props: ['propass', 'proname', 'proicon', 'promsg'],
    data: function () {
        return {
            logoutText: '登出進行中...',
            logoutFail: false,
            logoutSuccess: false,
            pass: this.propass,
            name: this.propname,
            icon: this.proicon,
            msg: this.promsg,
            timer: null
        };
    },
  methods: {
    async logout () {
      let oriobj = this;
      let result = await axios.post('https://' + window.location.host + '/backend/logout', {
        withCredentials: true
      });
      if (result.data.loginStatus === 1) {
        this.logoutText = '登出進行中... 完成！';
        this.$socket.client.emit('clearCurrentUser');
        window.clearTimeout(this.timer);
        this.timer = setTimeout(() => {
          window.clearTimeout(oriobj.timer);
          this.$socket.client.emit('getCurrentUser');
        }, this.siteSettings.connectionTimeout * 1000);
      }
    }
  },
  computed: {
    siteSettings: function () {
      return this.$store.state.siteSettings;
    }
  },
  beforeDestroy () {
    window.clearTimeout(this.timer);
    this.timer = null;
  },
  created () {
    this.logout();
    this.$emit('viewIn', {
      text: '使用者登出',
      icon: 'fa-sign-out-alt',
      module: '登入模組',
      location: '/Logout'
    });
  }
};
</script>
