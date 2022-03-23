<template>
  <v-main class='pa-0'>
    <v-alert
      outlined
      type="error"
      icon="fa-skull" class='text-left'
      v-show='currentUser.firstRun === true'
    >
      第一次登入嗎？請記得填入你的密碼（已閃紅）喔！
    </v-alert>
    <v-dialog v-model="linetipW" fullscreen hide-overlay transition='dialog-bottom-transition'>
      <v-card>
        <v-toolbar dark color='primary'>
          <v-btn icon dark @click='linetipW = false'>
            <v-icon>fa-times</v-icon>
          </v-btn>
          <v-toolbar-title>
            說明：如何設定LINE一對一通知
          </v-toolbar-title>
        </v-toolbar>
        <v-card-text class='text-left black--text text-body-1 pa-2 d-flex flex-column'>
          <v-img width="100%" src="@/assets/lineSupport.png" />
        </v-card-text>
      </v-card>
    </v-dialog>
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
        <v-card-text class='pa-5 text-left text-body-1 text-left black--text text-body-1'>
          <div>請注意以下事項：</div>
          <ol>
            <li>你必須變更密碼，沒有密碼規則，隨便設定，但是只要你不改，你每次都會看到這個視窗</li>
            <li>受限制帳號的權限無法修改姓名，不要嘗試了（但你可以改性別和輸入一些亂數來產生新的頭像）</li>
          </ol>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click='firstRunW = false'>我看懂了，請關閉視窗</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-row no-gutters>
      <v-col class="text-left d-flex flex-column">
        <v-btn color="blue darken-4" v-if='modify === true' class='white--text' link href="#/userDashBoard">修改完成了嗎？請按此進入你的活動儀錶板（以後你也可以從右上角三條線點開進入）</v-btn>
        <v-container>
          <v-row no-gutters>
            <v-col class='flex-shrink-1'>
              <v-avatar size="62">
                <Avatar :user='currentUser'/>
              </v-avatar>
            </v-col>
            <v-col class='flex-grow-1'>
              <div class="text-h6 font-weight-bold">Email： {{ currentUser.email }}</div>
              <div class="text-caption">如要更改Email請洽管理員</div>
              <div class="text-body-2 font-weight-bold">帳號創建於： {{ dateConvert(currentUser.createDate) }} </div>
              <div class="text-body-2 font-weight-bold">帳號修改於： {{ dateConvert(currentUser.modDate) }} </div>
            </v-col>
          </v-row>
        </v-container>
        <v-btn color="red darken-4" class='white--text' @click="saveUser">儲存修改</v-btn>
        <div class='d-flex flex-row mt-3'>
          <v-text-field class='flex-grow-1' outlined clearable dense prepend-icon='fa-key' type='password' label='你的新密碼' hint="如果你要設定密碼的話，請輸入您的新密碼" v-model='password' :class='firstRun'></v-text-field>
          <div class='mr-1'>{{ passwordStrength }}</div>
        </div>
        <v-text-field outlined clearable dense prepend-icon='fa-user-alt' label='您的真實姓名' hint="請務必輸入中文完整姓名" v-model='currentUser.name' :class='firstRun' v-if='!restrictedUser'></v-text-field>
        <span v-else>姓名：{{ currentUser.name }}</span>
        <v-text-field outlined clearable dense prepend-icon='fa-building' label='單位' hint="請確實完整填寫，格示範例：臺北市立明德國中、新北市立海山高中" v-model='currentUser.unit' v-if='!restrictedUser'></v-text-field>
        <span v-else>單位：{{ currentUser.unit }}</span>
        <v-select
          prepend-icon='fa-transgender-alt'
          v-model='currentUser.types'
          :items='types'
          item-text='title'
          item-value='value'
          label='性別'
          outlined
        ></v-select>
        <v-text-field outlined clearable dense prepend-icon='fa-user-astronaut' label='代表圖亂數' hint="如果你想換掉代表圖，可以在這邊亂輸入一堆字，可以跑出新的圖" v-model='currentUser.seed'></v-text-field>
        <div class='d-flex flex-row'>
          <v-icon>fa-link</v-icon>
          <span class="text-subtitle-2 font-weight-bold">社交媒體帳號綁定</span><br />
        </div>
        <span class="text-body-1 font-weight-bold" v-if='currentUser.lineDate === 0 || currentUser.lineDate === undefined'>
          授權機器人能用LINE Notify通知
        </span>
        <span class="text-body-1 font-weight-bold" v-else>
          您已經於 {{ dateConvert(currentUser.lineDate) }} 綁定過了
        </span><br/>
        <v-btn :href='lineAPI' target='_blank' :class='firstRun'>
          按此綁定LINE Notify（會開新視窗）
        </v-btn><br />
        <v-btn @click="linetipW = true" class='ma-1'>
          按此查看如何設定LINE一對一通知
        </v-btn>
        <span class="text-subtitle-2 font-weight-bold">您所隸屬的使用者標籤：</span><br/>
        <div class='d-flex flex-row flex-wrap'>
          <v-chip v-for='(item, k) in currentUser.tags' :key='k' class='ma-2' :color='tagColor(k)' label text-color='white'>{{ item.name }}</v-chip>
        </div>
        <v-btn color="red darken-4" class='white--text' @click="saveUser">儲存修改</v-btn>
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
import { randomColor } from 'randomcolor';
import dayjs from 'dayjs';
import { passwordStrength } from 'check-password-strength'
import random from 'random';
import _intersectionWith from 'lodash/intersectionWith';

export default {
  name: 'userSetting',
  components: { 
    Avatar: () => import(/* webpackChunkName: 'Avatar', webpackPrefetch: true */ './modules/Avatar'),
  },
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
  computed: {
    restrictedUser: function() {
      return (_intersectionWith(this.currentUser.tags, this.siteSettings.restrictTags, (a, b) => {
        return a === b;
      })).length > 0;
    },
    passwordStrength: function () {
      if(this.password !== '') {
        let passwordeval = passwordStrength(this.password).value;
        if(passwordeval === 'Too weak') {
          return '密碼強度極低，建議更換'
        }
        if(passwordeval === 'Weak') {
          return '密碼強度低，建議更換'
        }
        if(passwordeval === 'Medium') {
          return '密碼強度尚可'
        }
        if(passwordeval === 'Strong') {
          return '密碼強度極高'
        }
      }
      return '';
    },
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
        format: 'rgb',
        hue: this.$store.state.siteColor
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
      this.modify = true;
    },
    socketgetRobotSetting: function (data) {
      this.lineKey = data.LINENotifyKey;
    },
    dateConvert: function (time) {
      return dayjs.unix(time).format('YYYY/MM/DD HH:mm:ss');
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
        unit: this.currentUser.unit,
        seed: this.currentUser.seed
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
      linetipW: false,
      modify: false,
      firstRunW: true,
      lineKey: '',
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
