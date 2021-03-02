<template>
  <section>
      <v-alert v-model='logoutFail' color='error'><font-awesome-icon icon='skull' />登入失敗</v-alert>
      <v-alert v-model='logoutSuccess' color='success'><font-awesome-icon icon='grin-wink' />登入成功！三秒之後跳轉首頁</v-alert>
      <h1 class='loginIcon'><font-awesome-icon icon='sign-out-alt' />登出頁面</h1>
      {{ logoutText }}
  </section>
</template>

<style>

</style>

<script>
// @ is an alias to /src
import Vue from 'vue';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { setTimeout } from 'timers';
import axios from 'axios';

library.add(faSignOutAlt);

Vue.component('font-awesome-icon', FontAwesomeIcon);

Vue.config.productionTip = false;

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
            msg: this.promsg
        };
    },
  methods: {
    async logout () {
        let result = await axios.post('https://' + window.location.host + '/backend/logout', {
          withCredentials: true
        });
        if (result.data.loginStatus === 1) {
          this.logoutText = '登出進行中... 完成！';
          setTimeout(() => {
            window.location.href = 'https://' + window.location.host + '/';
          }, 3000);
        }
    }
  },
  mounted () {
      this.logout();
  },
  created () {
      this.$emit('viewIn', {
        text: '使用者登出',
        icon: faSignOutAlt
      });
  }
};
</script>
