<template>
    <v-main class='pa-0'>
        <v-row>
            <v-col class="text-left">
                <v-alert v-if='name !== undefined' type="info" icon="fa-info-circle">
                    {{ name }}您好！請設定您的密碼！（您的基本資料請在登入後到「使用者設定」中修改）
                </v-alert>
                <v-alert v-if='name === undefined' type="info" icon="fa-exclamation-triangle">
                    請輸入您的邀請碼
                </v-alert>
                <v-text-field prepend-icon='fab fa-keybase' label='邀請碼' v-model='invitationCode'></v-text-field><v-btn @click='queryInvitation'>送出邀請碼</v-btn>
            </v-col>
        </v-row>
        <v-row v-if='name !== undefined'>
            <v-col>
                <v-avatar size="62">
                    <img :src='"https://avatars.dicebear.com/api/" + type + "/" + encodeURIComponent(name + "@" + unit) + ".svg"' />
                </v-avatar>
                <div class="text-body-2 font-weight-bold">帳號創建於： {{ dateConvert(createDate) }} </div>
                <v-text-field prepend-icon='fa-key' type='password' label='用戶密碼' v-model='password'></v-text-field>
                <password v-model="password" :strength-meter-only="true"/>
                <v-btn @click='queryInvitation'>送出修改</v-btn>
            </v-col>
        </v-row>
    </v-main>
</template>

<script>
// @ is an alias to /src
import Vue from 'vue';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faUserCog } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import Password from 'vue-password-strength-meter';
import moment from 'moment';

import '@fortawesome/fontawesome-free/css/all.css';

library.add(faUserCog);
Vue.component('font-awesome-icon', FontAwesomeIcon);
Vue.config.productionTip = false;

export default {
  name: 'resetUser',
  created () {
    this.$emit('viewIn', {
      text: '重設密碼',
      icon: faUserCog
    });
  },
  components: {
      Password
  },
  computed: {
  },
  methods: {
    queryInvitation: function () {},
    passwordUpdate: function (value) {
        this.password = value;
    },
    dateConvert: function (time) {
        return moment.unix(time).format('YYYY/MM/DD HH:mm:ss');
    }
  },
  props: {
  },
  data () {
      return {
        name: '測試帳號',
        type: 'male',
        unit: '測試國中',
        createDate: 1600474170,
        password: 'abc123'
      };
  }
};
</script>
