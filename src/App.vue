<template>
  <v-app>
    <v-dialog
      v-model='imgPreviewW'
      fullscreen
      hide-overlay
      transition="dialog-bottom-transition"
    >
      <v-card>
        <v-toolbar dark color='primary'>
          <v-btn
            icon
            dark
            @click="imgPreviewW = false"
          >
            <v-icon>fa-times</v-icon>
          </v-btn>
          <v-toolbar-title>預覽附件圖檔： {{ imgCache.name }}</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn
            dark
            link
            icon
            @click='forceDownload(imgCache)'
          >
            <v-icon>fa-download</v-icon>
          </v-btn>
        </v-toolbar>
        <v-card-text class='pa-3 text-left black--text text-body-1'>
          <v-img
            :src="'/storages/' + imgCache._id"
          ></v-img>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-snackbar v-model="toastOn" :timeout="toastTime">
      {{ toastMsg }}
      <template v-slot:action="{ attrs }">
        <v-btn
          color="red accent-4"
          icon
          v-bind="attrs"
          @click="toastOn = false"
        >
          <v-icon color="white">fa-times-circle</v-icon>
        </v-btn>
      </template>
    </v-snackbar>
    <v-dialog
      v-model="fatalErrorW"
      persistent
      max-width="50vw"
    >
      <v-card>
        <v-toolbar dark color='primary'>
          <v-toolbar-title>發生嚴重錯誤</v-toolbar-title>
        </v-toolbar>
        <v-card-text class='text-left black--text text-body-1'>
          <div>系統發生嚴重錯誤，請複製以下訊息並聯絡管理者：</div>
          <code>{{ JSON.stringify(fatalMsg) }}！</code>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            @click="fatalErrorW = false"
          >
            關閉對話框
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="authW"
      fullscreen
    >
      <v-toolbar
        dark
        color="primary"
      >
        <v-toolbar-title>載入權限...</v-toolbar-title>
      </v-toolbar>
      <v-list dense>
        <v-list-item
          v-for="item in items"
          :key='"item" + item.title'
          :class='authClass(item)'
        >
          <v-list-item-icon class='pa-2'>
            <v-icon x-large>{{ item.icon }}</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title class='text-left'>{{ item.title }}</v-list-item-title>
            <v-list-item-subtitle class='text-left'>{{ item.vis ? "已取得權限" : "無使用權限" }}</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-dialog>
    <v-dialog
      v-model="messageW"
      persistent
      max-width="50vw"
    >
      <v-card>
        <v-toolbar dark color='primary'>
          <v-toolbar-title>和 {{ messageDialog.dialogUser.name }} （{{ messageDialog.dialogUser.email }}）的通訊紀錄</v-toolbar-title>
        </v-toolbar>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="red darken-4"
            class='white--text'
            @click="incommingChat"
          >
            發送訊息
          </v-btn>
          <v-btn
            color="primary"
            @click="messageW = false"
          >
            關閉對話框
          </v-btn>
        </v-card-actions>
        <v-card-text>
          <v-alert outlined type="info" icon='fa-info-circle' class='text-left'>
            請注意，在這台電腦的聊天紀錄只會保存在這台電腦上，而且不保證對方會收到
          </v-alert>
          <Tip-Tap
            v-model="messageBody"
            maxHeight="10vh"
            minHeight="5vh"
            hint='請不要留白'
          />
          <v-timeline
            :dense="true"
            v-if='messageDialog.messages.length > 0'
          >
            <v-timeline-item v-for='message in messageDialog.messages' :key='message.uuid' class='ma-0 pa-0'>
              <template v-slot:icon>
                <v-avatar>
                  <Avatar :user='message.user'/>
                </v-avatar>
              </template>
              <v-row class='d-flex flex-column ma-0 pa-0'>
                <v-row class='d-flex flex-row ma-0 pa-0'>
                  <v-col class='text-left'>
                    {{ dateConvert(message.tick) }}
                  </v-col>
                </v-row>
                <v-row class='ma-0 pa-0'>
                  <div v-html="HTMLConverter(message.body)"></div>
                </v-row>
              </v-row>
            </v-timeline-item>
          </v-timeline>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="viewUserW"
      persistent
      max-width="50vw"
    >
      <v-card>
        <v-toolbar dark color='primary'>
          <v-toolbar-title>檢視使用者</v-toolbar-title>
        </v-toolbar>
        <v-card-text class='text-left black--text text-body-1'>
          <v-avatar>
            <Avatar :user='viewUser'/>
          </v-avatar>
          <div>姓名： {{ viewUser.name }} </div>
          <div>服務單位： {{ viewUser.unit }} </div>
          <div>Email： {{ viewUser.email }} </div>
          <div>帳號創建時間： {{ dateConvert(viewUser.createDate) }} </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            @click="viewUserW = false"
          >
            關閉檢視
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="diedW"
      persistent
      max-width="50vw"
    >
      <v-card>
        <v-toolbar dark color='primary'>
          <v-toolbar-title>登出警告！</v-toolbar-title>
        </v-toolbar>
        <v-card-text class='text-left black--text text-body-1'>
          {{ diedMsg }}
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            @click="broadcastW = false"
          >
            關閉通知
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="broadcastW"
      persistent
      max-width="50vw"
    >
      <v-card>
        <v-toolbar dark color='primary'>
          <v-toolbar-title>全域廣播：{{ broadcastMsg.title }}</v-toolbar-title>
        </v-toolbar>
        <v-card-text class='text-left black--text text-body-1' v-html="broadcastMsg.body"></v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            @click="broadcastW = false"
          >
            關閉通知
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="errormW"
      persistent
      max-width="50vw"
    >
      <v-card>
        <v-toolbar dark color='primary'>
          <v-toolbar-title>服務發生錯誤：{{ errorm.title }}</v-toolbar-title>
        </v-toolbar>
        <v-card-text class='text-left black--text text-body-1'>
          {{ errorm.text }}
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            @click="errormW = false"
          >
            聯絡管理員
          </v-btn>
          <v-btn
            color="primary"
            @click="errormW = false"
          >
            關閉通知
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="violationW"
      persistent
      max-width="50vw"
    >
      <v-card>
        <v-toolbar dark color='primary'>
          <v-toolbar-title>您沒有 {{ violation.where }} 的存取權</v-toolbar-title>
        </v-toolbar>
        <v-card-text class='text-left black--text text-body-1'>
          您於 {{ dateConvert(violation.tick) }} 時嘗試執行 {{ violation.action }} ，但該動作需要 {{ privilegeConvert(violation.loginRequire) }} 才能執行，該動作已被系統駁回！
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            @click="violationW = false"
          >
            關閉通知
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-navigation-drawer
      transition="slide-x-transition"
      drawer
      fixed
      bottom
      temporary
      v-model='miniVariant'
      enable-resize-watcher
      app
    >
      <v-list nav dense class='py-0'>
        <div v-for='item in items' :key='item.title'>
        <v-list-item v-if='item.vis' :to='item.path == "#" ? "" : item.path' link>
            <v-list-item-icon>
              <v-icon>{{ item.icon }}</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>{{ item.title }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </div>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar elevate-on-scroll fixed app :color='siteColor' dark>
      <v-app-bar-nav-icon @click='miniVariant = !miniVariant'>
        <v-icon>fa-bars</v-icon>
      </v-app-bar-nav-icon>
      <v-tooltip bottom v-if='currentPage.show'>
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            v-bind="attrs" v-on="on"
            icon
            @click="gotoPreviousPage"
            :disabled='previousConvert'>
            <v-icon>fa-arrow-alt-circle-left</v-icon>
          </v-btn>
        </template>
        <span>回到 {{ previousPage.text }}</span>
      </v-tooltip>
      <v-spacer></v-spacer>
      <v-toolbar-title>
        {{ siteSettings.systemName }}<span v-if='currentPage.show'>： {{ currentPage.text }}</span>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-menu open-on-hover offset-y v-if='currentUser._id !== ""'>
        <template v-slot:activator='{ on, attrs }'>
          <v-btn icon v-bind='attrs' v-on='on'>
            <v-avatar size="30">
              <Avatar :user='currentUser' :size='30' />
            </v-avatar>
          </v-btn>
        </template>
        <v-card>
          <v-card-subtitle>{{ currentUser.name }}的資料</v-card-subtitle>
          <v-card-text>
            <v-list-item v-for='item in userControls' :key='item.title' style='background-color:white' :to='item.path == "#" ? "" : item.path' link>
              <v-list-item-icon>
                <v-icon>{{item.icon}}</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>{{ item.title }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-card-text>
        </v-card>
      </v-menu>
      <v-menu open-on-hover offset-y style='max-height: 80vh; overflow-y:scroll' v-if='currentUser._id !== ""'>
        <template v-slot:activator='{ on, attrs }'>
          <v-badge
            color="red"
            :content="socketUsersList.messageCount"
            :value="socketUsersList.messageCount"
            overlap
            bottom
          >
            <v-btn icon v-bind='attrs' v-on='on'>
              <v-icon v-if='socketUsersList.messageCount === 0'>far fa-comments</v-icon>
              <v-icon v-if='socketUsersList.messageCount > 0'>fas fa-comments</v-icon>
            </v-btn>
          </v-badge>
        </template>
        <v-card>
          <v-card-text>
            <div v-if='socketUsersList.users.length === 0'>除了你沒別人啦</div>
            <div v-if='socketUsersList.users.length > 0'>
              <v-list-item v-for='user in socketUsersList.users' :key='user._id' style='background-color:white'>
                <v-list-item-avatar>
                  <Avatar :user='user' :style='messageConverter(user)'/>
                </v-list-item-avatar>
                <v-list-item-content>
                  <v-list-item-title class='text-left'>{{ user.name }}</v-list-item-title>
                  <v-list-item-subtitle class='text-left' v-if='user.where.length > 0'>{{ user.where[0] }}</v-list-item-subtitle>
                </v-list-item-content>
                <v-list-item-action class='d-flex flex-row'>
                  <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn icon @click='userInfo(user)' v-bind="attrs" v-on="on">
                        <v-icon>fa-info-circle</v-icon>
                      </v-btn>
                    </template>
                    <span>查看用戶檔案</span>
                  </v-tooltip>
                  <!-- <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn icon @click='startDialog(user)' v-bind="attrs" v-on="on">
                        <v-icon>fa-comments</v-icon>
                      </v-btn>
                    </template>
                    <span>發送訊息</span>
                  </v-tooltip> -->
                </v-list-item-action>
              </v-list-item>
            </div>
          </v-card-text>
        </v-card>
      </v-menu>
      <v-btn icon link href='#/'>
        <v-icon>fa-home</v-icon>
      </v-btn>
      <v-menu open-on-hover offset-y style='max-height: 80vh; overflow-y:scroll'>
        <template v-slot:activator='{ on, attrs }'>
          <v-btn icon v-bind='attrs' v-on='on'>
            <v-progress-circular :value="(nextCheckTime / (siteSettings.userCheckTime * 60)) * 100" :indeterminate='indeterminate'></v-progress-circular>
          </v-btn>
        </template>
        <v-card>
          <v-card-subtitle>服務狀態</v-card-subtitle>
          <v-card-text>
            <v-list-item style='background-color:white'>
              <v-list-item-icon>
                <v-icon>fa-code-branch</v-icon>
              </v-list-item-icon>
              <v-list-item-content class='text-left'>
                <v-list-item-title>版本： {{ siteSettings.version.frontend.substring(0, 7) }} / {{ siteSettings.version.backend.substring(0, 7) }} / {{ siteSettings.version.bot.substring(0, 7) }} <br/><a href="/#/Info"><span class='text-cpation cyan--text darken-4'>版本紀錄</span></a></v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item style='background-color:white'>
              <v-list-item-icon :class='serviceConverter(mongoStatus).color'>
                <v-icon>fa-database</v-icon>
              </v-list-item-icon>
              <v-list-item-content class='text-left'>
                <v-list-item-title>資料庫 {{ serviceConverter(mongoStatus).text }} </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item style='background-color:white'>
              <v-list-item-icon :class='serviceConverter(socketioStatus).color'>
                <v-icon>fa-plug</v-icon>
              </v-list-item-icon>
              <v-list-item-content class='text-left'>
                <v-list-item-title>同步連線 {{ serviceConverter(socketioStatus).text }} </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-card-text>
        </v-card>
      </v-menu>
    </v-app-bar>
    <v-alert type="error" v-if='syncW' outlined icon='fas fa-plug' class='text-left'>同步連線中斷！可能是網頁剛剛開啟，連與伺服器間的同步連線尚未啟動，但如果您是使用到一半看到本訊息，請嘗試重新整理網頁（可能需要重新登入），如重複發生請聯絡管理員</v-alert>
    <v-alert type="error" outlined icon='fab fa-internet-explorer' class='text-left' v-if='isIE'>請勿使用Internet Explorer！</v-alert>
    <v-alert type="error" outlined icon='fab fa-safari' class='text-left' v-if='isSafari'>Safari瀏覽器可能會導致同步連線異常，如果遇到奇特現象請回報！</v-alert>
    <div class='pa-5 ma-0' style='width: 100vw'>
      <router-view @updateTags='updateTags' @addTag='addTag' @viewIn='changePage' @toastPop='sendToast' @timerOn='timerOn' @preventReloadDetect='preventReloadDetect' @downloadFile='downloadFile'></router-view>
    </div>
  </v-app>
</template>

<style>
@import url('https://fonts.googleapis.com/css?family=Noto+Sans+TC:100,300,400,500,700,900&display=swap');
body { 
  position: relative !important;  /* paintable 會改寫body的position，導致卷軸失效，必須有important */
}
html {
  scroll-behavior: smooth;
}
#app {
  font-family: 'Noto Sans TC', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
h1 {
  font-family: 'Noto Sans TC', sans-serif;
  font-weight: 900;
}
.notAuth {
  opacity: 0.3;
}
</style>

<script>
import Vue from 'vue';
import io from 'socket.io-client';
import VueSocketIOExt from 'vue-socket.io-extended';
import dayjs from 'dayjs';
import { marked } from 'marked';
import duration from 'dayjs/plugin/duration';
import TurndownService from 'turndown';
import { v4 as uuidv4 } from 'uuid';
import _intersectionWith from 'lodash/intersectionWith';
import _dropRight from 'lodash/dropRight';
import _filter from 'lodash/filter';
import '@fortawesome/fontawesome-free/css/all.css';
let leaveTick = 0;

const angleDetect = matchMedia("screen and (orientation:portrait)");
const renderer = new marked.Renderer();
const linkRenderer = renderer.link;
renderer.link = (href, title, text) => {
  if(href !== undefined) { href = (decodeURIComponent(href)).replace(/\\/g, ''); }
  if(title !== undefined) { title = (decodeURIComponent(title)).replace(/\\/g, ''); }
  if(text !== undefined) { text = (decodeURIComponent(text)).replace(/\\/g, ''); }
  const html = linkRenderer.call(renderer, href, title, text);
  return html.replace(/^<a /, '<a target="_blank" rel="nofollow" ');
};

const socketInstance = io('https://' + window.location.host + '/');
Vue.use(VueSocketIOExt, socketInstance);
dayjs.extend(duration);

const turndownService = new TurndownService();

export default {
  name: 'App',
  components: { 
    TipTap: () => import(/* webpackChunkName: 'TipTap', webpackPrefetch: true */ './views/modules/TipTap'),
    Avatar: () => import(/* webpackChunkName: 'Avatar', webpackPrefetch: true */ './views/modules/Avatar'),
  },
  methods: {
    addTag: function (val) {
      this.$socket.client.emit('addTag', val);
    },
    updateTags: function () {
      this.$socket.client.emit('getTags');
    },
    downloadFile: function (file) {
      if (!/image/g.test(file.type)) {
        this.forceDownload(file);
      } else {
        this.imgCache = file;
        this.imgPreviewW = true;
      }
    },
    forceDownload: function (file) {
      let element = document.createElement('a');
      element.setAttribute('href', '/storages/' + file._id);
      element.setAttribute('download', file.name);
      element.style.display = 'none';
      element.click();      
    },
    gotoPreviousPage: function () {
      window.location.replace('https://' + window.location.host + '/#' + this.previousPage.location);
      this.history = _dropRight(this.history, 2);
    },
    timerOn: function (status) {
      this.indeterminate = status;
    },
    sendToast: function (data) {
      this.toastTime = (typeof(data) === 'object') ? data.time : 2000;
      this.toastOn = true;
      this.toastMsg = (typeof(data) === 'object') ? data.message : data;
    },
    userInfo: function (user) {
      this.viewUser = user;
      this.viewUserW = true;
    },
    messageConverter: function (user) {
      return user.newMessage === 0 ? 'border: 1px solid white' : 'border: 1px solid red';
    },
    incommingChat: function () {
      this.$socket.client.emit('incommingChat', {
        receiver: this.receiver._id,
        body: turndownService.turndown(this.messageBody)
      });
      this.messageBody = '';
    },
    startDialog: function (user) {
      this.messageW = true;
      if(!(user._id in this.chatDB)) {
        this.chatDB[user._id] = {
          newCount: 0,
          data: []
        }
        localStorage.setItem('chatDB', JSON.stringify(this.chatDB));
      } else {
        this.chatDB[user._id].newCount = 0;
      }
      this.receiver = user;
    },
    HTMLConverter: function (msg) {
      msg = msg === null || msg == undefined ? '**test**' : msg;
      return marked(msg, { renderer });
    },
    authClass: function (obj) {
      if (!obj.vis) {
        return 'notAuth';
      }
    },
    changePage: function (val) {
      this.history.push(val);
    },
    serviceConverter: function (status) {
      return status ? {
        color: 'green--text text--darken-4',
        text: '服務正常'
      } : {
        color: 'red--text text--accent-4',
        text: '連接異常'
      };
    },
    dateConvert: function (time) {
      return time === null || time === undefined ? dayjs().format('YYYY/MM/DD HH:mm:ss') : dayjs.unix(time).format('YYYY/MM/DD HH:mm:ss');
    },
    privilegeConvert: function (loginRequire) {
      return loginRequire ? '登入' : '特殊權限標籤';
    },
    preventReloadDetect: function (data) {
      window.sessionStorage.setItem('preventR', data);
    }
  },
  computed: {
    currentPage: function () {
      if(this.history.length > 0) {
        let currentPage = this.history[this.history.length - 1];
        currentPage.show = true;
        if(currentPage.location === '/Login' || currentPage.location == '/Logout') {
          currentPage.show = false;
        }
        return currentPage;
      }
      return {
        location: '',
        text: '',
        show: false
      };
    },
    previousPage: function () {
      if(this.history.length > 1) {
        let previousPage = this.history[this.history.length - 2];
        if(previousPage.location === '/' || previousPage.location === '/Login' || previousPage.location === '/Logout' || previousPage.location === '/Home') { return false; }
        return previousPage;
      }
      return false;
    },
    previousConvert: function () {
      return this.previousPage !== false ? false : true;
    },
    currentUser: function () {
      return this.$store.state.currentUser;
    },
    isPortrait: function () {
      return this.$store.state.isPortrait;
    },
    siteColor: function () {
      return this.$store.state.siteColor;
    },
    siteSettings: function () {
      return this.$store.state.siteSettings;
    },
    savedTags: function () {
      return this.$store.state.savedTags;
    },
    isIE: function () {
      return this.$store.state.isIE;
    },
    isSafari: function () {
      return this.$store.state.isSafari;
    },
    isiOS: function () {
      return this.$store.state.isiOS;
    },
    messageDialog: function () {
      if(this.receiver !== null) {
        let returned = [];
        if(this.receiver._id in this.chatDB) {
          let sorted = [...this.chatDB[this.receiver._id].data].sort((a, b) => {
            return b.tick - a.tick;
          });
          returned = sorted.slice(0, 5);
          for(let i = 0; i < returned.length; i++) {
            returned[i].uuid = uuidv4(); 
          }
        }
        return {
          dialogUser: this.receiver,
          messages: returned,
          incommingNotify: this.chatUpdate
        }
      } else {
        return {
          dialogUser: {
            _id: 'test',
            name: 'test',
            unit: 'test',
            types: 'test'
          },
          messages: [],
          incommingNotify: false
        }
      }
    },
    socketUsersList: function () {
      let oriobj = this;
      let count = 0;
      let filtered = _filter(this.socketUsers, (user) => {
        return user._id !== oriobj.currentUser._id;
      });
      for(let i = 0; i < filtered.length; i++) {
        let user = filtered[i];
        user.newMessage = (user._id in this.chatDB) ? this.chatDB[user._id].newCount : 0;
        count += user.newMessage;
      }
      return {
        users: filtered,
        messageCount: count
      }
    },
    serviceOverall: function () {
      return (this.mongoStatus && this.socketioStatus);
    },
    userControls: function () {
      return [
        {
          icon: 'fa-user-cog',
          ava: true,
          title: '進入個人設定',
          path: '/user'
        },
        {
          icon: 'fa-sign-out-alt',
          title: '登出系統',
          path: '/logout'
        }
      ];
    }
  },
  watch: {
    'socket.connected': {
      deep: true,
      handler () {
        this.socketioStatus = 'connected' in this.socket ? this.socket.connected : false;
        if (!this.socketioStatus) {
          this.mongoStatus = false;
          this.syncW = true;
        } else {
          this.syncW = false;
        }
      }
    },
    chatUpdate: function () {
      this.chatUpdate = false;
    },
    mongoStatus: function () {
      if (!this.mongoStatus) {
        this.$socket.client.emit('dbStatus');
      }
    },
    currentUser: function () {
      let oriobj = this;
      if(this.currentPage.location === '/Login' || this.currentPage.location === '/Dashboard') {
        if(this.currentUser._id !== '') {
          this.$socket.client.emit("userInbound");
          if ('firstRun' in this.currentUser) {
            if (this.currentUser.firstRun) {
              window.location.replace('https://' + window.location.host + '/#/user');
            } else {
              window.location.replace('https://' + window.location.host + '/#/userDashBoard');
            }
          } else {
            window.location.replace('https://' + window.location.host + '/#/userDashBoard');
          }
          this.reloadTimer = setTimeout(() => {
            oriobj.sendToast({
              message:"登入成功！",
              time:1000
            });
            window.clearTimeout(this.reloadTimer);
          }, 1000);
        }
      } else {
        if(this.currentPage.location === '/Login' || this.currentPage.location === '/Home' || this.currentPage.location === '/') {
          oriobj.sendToast({
            message:"您目前處於未登入狀態",
            time:1000
          });
        } else {
          if(this.currentUser._id === '') {
            window.location.replace('https://' + window.location.host + '/#/Login');
            this.reloadTimer = setTimeout(() => {
              oriobj.sendToast({
                message: "同步連線中斷（多半是您手動重新整理網頁），您將被導入登入頁面",
                time:1000
              });
              window.clearTimeout(this.reloadTimer);
            }, 1000);
          }
        }
      }
    }
  },
  created () {
    let oriobj = this;
    this.$store.commit('updateisIE', /MSIE|Trident/g.test(navigator.userAgent));
    this.$store.commit('updateisiOS', /iPad|iPhone|iPod/g.test(navigator.platform) || (navigator.userAgent.includes("Mac") && "ontouchend" in document));
    document.addEventListener("visibilitychange", function() {
      if (document.visibilityState === 'visible') {
        oriobj.sendToast({
          message: "你離開了" + dayjs.duration((dayjs().unix() - leaveTick), 'second').format('mm分ss秒') + "！正在確認您的登入是否還有效中...（無效的話您會被自動登出）",
          time:3000
        });
        oriobj.$socket.client.emit('getCurrentUser');
      } else {
        leaveTick = dayjs().unix();
      }
    });
    angleDetect.onchange = () => {
      this.$store.commit('updateisPortrait', angleDetect.matches);
    }
    this.$store.commit('updateisPortrait', window.screen.width < window.screen.height);
    if(!this.preventR) {
      let nav = performance.getEntriesByType("navigation");
      if(nav === undefined || nav == null || nav.length === 0) {
        this.$store.commit('updateisSafari', true);
      } else {
        if (nav[0].type === 'reload' || nav[0].type === 1) {
          this.sendToast({
            message: "偵測到網頁重新整理！重建同步連線中...",
            time:5000
          });
          this.$socket.client.emit('userAlived');
        }
      }
    }
    window.sessionStorage.setItem('preventR', false);
    this.preventR = false;
    if(localStorage.getItem('chatDB')) {
      this.chatDB = JSON.parse(localStorage.getItem('chatDB'));
    } else {
      this.chatDB = {};
      localStorage.setItem('chatDB', JSON.stringify(this.chatDB));
    }
    this.$socket.client.on('addTag', (data) => {
      if(!data) {
        oriobj.sendToast({
          message: '您要新增的標籤已經重複了，無法新增！',
          time: 1000
        });
      } else {
        oriobj.sendToast({
          message: '標籤新增完成！請按右側放大鏡按鈕回到查詢模式',
          time: 1000
        });
      }
    });
    this.$socket.client.on('getCurrentUser', (data) => {
      oriobj.currentUser = oriobj.$store.commit('updateUser', data);
      oriobj.timerOn(true);
      oriobj.$socket.client.emit('getTags');
      oriobj.$socket.client.emit('getAuthLevel');
      oriobj.$socket.client.emit('getConcurrentUsers');
    });

    this.$socket.client.on('userInbound', () => {
      oriobj.timerOn(true);
      oriobj.$socket.client.emit('getConcurrentUsers');
    });

    this.$socket.client.on('userLeave', () => {
      oriobj.timerOn(true);
      Vue.nextTick(() => {
        oriobj.$socket.client.emit('getConcurrentUsers');
      });
    });

    this.$socket.client.on('userDied', () => {
      oriobj.diedW = true;
      oriobj.diedMsg = '你的瀏覽器已經超過' + oriobj.siteSettings.connectionTimeout + '秒沒和主機連線，你被強制登出了';
    });

    this.$socket.client.on('dbStatus', (data) => {
      oriobj.mongoStatus = data;
      if (!data) {
        window.clearTimeout(oriobj.dbTimer);
        oriobj.dbTimer = setTimeout(() => {
          oriobj.$socket.client.emit('dbStatus');
          window.clearTimeout(oriobj.dbTimer);
        }, oriobj.siteSettings.connectionTimeout * 60 * 1000);
      }
    });

    this.$socket.client.on('clearCurrentUser', () => {
      oriobj.timerOn(false);
      oriobj.sendToast({
        message: '登出完成！確認用戶狀態中...',
        time: 5000
      });
      oriobj.$socket.client.emit('getCurrentUser');
    });

    this.$socket.client.on('getTags', (data) => {
      oriobj.timerOn(false);
      data = _filter(data, (item) => {
        return item.visibility;
      })
      oriobj.$store.commit('updateSavedTags', data);
    });

    this.$socket.client.on('ccChat', (data) => {
      if(!(data.to._id in oriobj.chatDB)) {
        oriobj.chatDB[data.to._id] = {
          newCount: 0,
          data: []
        }
      }
      oriobj.chatDB[data.to._id].data.push({
        user: data.from,
        tick: data.tick,
        body: data.body
      });
      localStorage.setItem('chatDB', JSON.stringify(oriobj.chatDB));
    });

    this.$socket.client.on('incommingChat', (data) => {
      if(!(data.from._id in oriobj.chatDB)) {
        oriobj.chatDB[data.from._id] = {
          newCount: 0,
          data: []
        }
      }
      if(oriobj.receiver !== null) {
        if(oriobj.receiver._id === data.from._id) {
          oriobj.chatUpdate = true;
        }
      }
      oriobj.chatDB[data.from._id].newCount = oriobj.receiver === null ? oriobj.chatDB[data.from._id].newCount + 1 : oriobj.receiver._id === data.from._id ? 0 : oriobj.chatDB[data.from._id].newCount + 1;
      oriobj.chatDB[data.from._id].data.push({
        user: data.from,
        tick: data.tick,
        body: data.body
      });
      localStorage.setItem('chatDB', JSON.stringify(oriobj.chatDB));
      let tempTitle = document.title;
      document.title = '💬 ' + data.from.name + ' 私訊你！';
      oriobj.sendToast('💬 ' + data.from.name + ' 私訊你！');
      Vue.nextTick(() => {
        document.title = tempTitle;
      });
    });

    this.$socket.client.on('messageBroadcast', (data) => {
      oriobj.broadcastW = true;
      data.body = marked(data.body, { renderer });
      oriobj.broadcastMsg = data;
    });

    this.$socket.client.on('fatalError', (data) => {
      oriobj.fatalErrorW = true;
      oriobj.fatalMsg = data;
    });

    this.$socket.client.on('errorMessage', (data) => {
      oriobj.errormW = true;
      oriobj.errorm = data;
    });

    this.$socket.client.on('accessViolation', (data) => {
      oriobj.violationW = true;
      oriobj.violation = data;
    });

    this.$socket.client.on('getConcurrentUsers', (data) => {
      oriobj.timerOn(false);
      oriobj.socketUsers = data;
    });

    this.$socket.client.on('getsiteSetting', (data) => {
      oriobj.timerOn(false);
      oriobj.sendToast('更新全站設定完成');
      oriobj.$store.commit('updateGlobalSetting', data);
      oriobj.$socket.client.emit('getCurrentUser');
      window.clearTimeout(oriobj.timer);
      oriobj.timer = setTimeout(() => {
        oriobj.timerOn(true);
        oriobj.sendToast('全站設定更新中...');
        oriobj.$socket.client.emit('getsiteSetting');
        window.clearTimeout(oriobj.timer);
      }, oriobj.siteSettings.userCheckTime * 60 * 1000);
      window.clearInterval(oriobj.intervalTimer);
      oriobj.intervalTimer = null;
      oriobj.intervalTimer = setInterval(() => {
        oriobj.nextCheckTime = (oriobj.siteSettings.userCheckTime * 60 - (dayjs().unix() - oriobj.siteSettings.lastCheckTime));
      }, 1000);
    });

    this.$socket.client.on('getAuthLevel', (data) => {
      oriobj.timerOn(false);
      for (let i = 0; i < oriobj.items.length; i++) {
        let item = oriobj.items[i];
        let login = oriobj.currentUser._id === '' ? false : 'tags' in oriobj.currentUser;
        if(!login) {
          item.vis = false;
        } else {
          let authRange = data[item.path];
          if(authRange.length === 0) {
            item.vis = true;
          } else {
            item.vis = (_intersectionWith(authRange, oriobj.currentUser.tags, (aTag, cTag) => {
                            return aTag === cTag._id;
                        })).length > 0
          }
        }
      }
      Vue.nextTick(() => {
        oriobj.authW = false;
      });
    });

    this.$socket.client.on('userAlived', () => {
      oriobj.$socket.client.emit('userAlived');
    });

    this.$socket.client.emit('dbStatus');
    this.$socket.client.emit('getsiteSetting');
    this.indeterminate = true;
  },
  data () {
    return {
      imgCache: {
        name: '',
        _id: ''
      },
      imgPreviewW: false,
      history: [],
      indeterminate: false,
      intervalTimer: null,
      reloadTimer: null,
      toastMsg: '',
      toastOn: false,
      dbTimer: null,
      viewUser: {
        name: 'test',
        unit: 'test',
        types: 'test',
        email: 'test',
        createDate: 0
      },
      toastTime: 2000,
      fatalMsg: '',
      fatalErrorW: false,
      viewUserW: false,
      receiver: null,
      chatDB: null,
      messageBody: '',
      messageW: false,
      diedW: false,
      diedMsg: '',
      timer: null,
      nextCheckTime : 0,
      authW: true,
      violationW: false,
      violation: {
        where: '',
        action: '',
        tick: '',
        loginRequire: false
      },
      syncW: true,
      errormW: false,
      errorm: {
        text: '',
        title: ''
      },
      broadcastMsg: {
        body: '',
        title: ''
      },
      preventR: window.sessionStorage.getItem('preventR') === null ? false : window.sessionStorage.getItem('preventR') === 'true',
      broadcastW: false,
      socketioStatus: false,
      mongoStatus: false,
      socket: this.$socket,
      miniVariant: false,
      user: {
        id: 0,
        name: 'testaccount',
        type: 'bottts',
        unit: 'testunit',
        isAdmin: false,
        realname: '',
        email: '',
        adminWeight: 2
      },
      loginStatus: {
        icon: 'fa-sign-in-alt',
        text: '未登入',
        subtext: '點此登入',
        to: '/logout'
      },
      socketUsers: [],
      items: [
        {
          icon: 'fa-tachometer-alt',
          title: 'DashBoard',
          path: '/userDashBoard',
          items: [],
          vis: false
        },
        {
          icon: 'fa-tags',
          title: '標籤管理',
          path: '/tagMgnt',
          items: [],
          vis: false
        },
        {
          icon: 'fa-calendar-alt',
          title: '活動管理',
          path: '/schMgnt',
          items: [],
          vis: false
        },
        {
          icon: 'fa-cogs',
          title: '系統設定',
          path: '/setting',
          items: [],
          vis: false
        },
        {
          icon: 'fa-comment-alt',
          title: '系統訊息管理',
          path: '/messageMgnt',
          items: [],
          vis: false
        },
        {
          icon: 'fa-users-cog',
          title: '使用者管理',
          path: '/userMgnt',
          items: [],
          vis: false
        },
        {
          icon: 'fa-info-circle',
          title: '關於本系統&許願池',
          path: '/Info',
          items: [],
          vis: false
        }
      ]
    };
  }
};
</script>