<template>
  <v-app>
    <v-dialog
      v-model="authW"
      persistent
      max-width="50vw"
    >
      <v-card>
        <v-card-title class="headline">
          載入權限..
        </v-card-title>
        <v-card-text class='d-flex flex-row justify-space-around'>
          <div v-for='item in items' :key='"item" + item.title' :class='authClass(item)'>
            <font-awesome-icon :icon='item.icon' class='fa-2x' /><br/>
            <span class='text-caption'>{{ item.title }}</span>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="messageW"
      persistent
      max-width="50vw"
    >
      <v-card>
        <v-card-title class='d-flex flex-row justify-start'>
          <v-avatar>
            <img :src='"https://avatars.dicebear.com/api/" + messageDialog.dialogUser.types + "/" + encodeURIComponent(messageDialog.dialogUser.name + "@" + messageDialog.dialogUser.unit) + ".svg"' />
          </v-avatar>
          <div>和 {{ messageDialog.dialogUser.name }} （{{ messageDialog.dialogUser.email }}）通訊</div>
        </v-card-title>
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
          <v-alert type="success">
            請注意，在這台電腦的聊天紀錄只會保存在這台電腦上，而且不保證對方會收到
          </v-alert>
          <tiptap-vuetify
            v-model="messageBody"
            :extensions="extensions"
            max-height="10vh"
            min-height="5vh"
            placeholder='請不要留白'
            class='text-left'
          />
          <v-timeline
            :dense="true"
            v-if='messageDialog.messages.length > 0'
          >
            <v-timeline-item v-for='message in messageDialog.messages' :key='message.uuid' class='ma-0 pa-0'>
              <template v-slot:icon>
                <v-avatar>
                  <img :src='"https://avatars.dicebear.com/api/" + message.user.types + "/" + encodeURIComponent(message.user.name + "@" + message.user.unit) + ".svg"' />
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
      v-model="diedW"
      persistent
      max-width="50vw"
    >
      <v-card>
        <v-card-title class="headline">
          <font-awesome-icon icon='skull' />
          登出警告！
        </v-card-title>
        <v-card-text>
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
        <v-card-title class="headline">
          <font-awesome-icon icon='satellite-dish' />
          全域廣播：
          {{ broadcastMsg.title }}
        </v-card-title>
        <v-card-text v-html="broadcastMsg.body"></v-card-text>
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
        <v-card-title class="headline">
          <font-awesome-icon icon='satellite-dish' />
          服務發生錯誤：
          {{ errorm.title }}
        </v-card-title>
        <v-card-text>
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
      v-model="syncW"
      persistent
      max-width="50vw"
    >
      <v-card>
        <v-card-title class="headline">
          <font-awesome-icon icon='plug' />
          同步連線建立中！
        </v-card-title>
        <v-card-text>
          可能是網頁剛剛開啟，連與伺服器間的同步連線尚未啟動，但如果您是使用到一半看到本訊息，請嘗試重新整理網頁（可能需要重新登入），如重複發生請聯絡管理員
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            @click="syncW = false"
          >
            聯絡管理員
          </v-btn>
          <v-btn
            color="primary"
            @click="syncW = false"
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
        <v-card-title class="headline">
          <font-awesome-icon icon='skull' />
          您沒有 {{ violation.where }} 的存取權
        </v-card-title>
        <v-card-text>
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
    <v-navigation-drawer transition="slide-x-transition" drawer permanent fixed v-if='miniVariant' enable-resize-watcher app>
      <v-list nav dense class='py-0'>
        <div v-for='item in items' :key='item.title'>
        <v-list-item v-if='item.vis' :to='item.path == "#" ? "" : item.path' link>
            <v-list-item-icon>
              <font-awesome-icon :icon='item.icon' />
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>{{ item.title }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </div>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar collapse-on-scroll fixed app color='deep-purple accent-4' dark>
      <v-app-bar-nav-icon @click='showBar'>
        <font-awesome-icon icon='bars' />
      </v-app-bar-nav-icon>
      <v-toolbar-title>
        <font-awesome-icon :icon='currentPage.icon' />
        [新]臺北市新課綱影片審查系統： {{ currentPage.text }}
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-menu open-on-hover offset-y v-if='currentUser !== null'>
        <template v-slot:activator='{ on, attrs }'>
          <v-btn icon v-bind='attrs' v-on='on'>
            <v-avatar size="30">
              <img :src='"https://avatars.dicebear.com/api/" + currentUser.types + "/" + encodeURIComponent(currentUser.name + "@" + currentUser.unit) + ".svg"' />
            </v-avatar>
          </v-btn>
        </template>
        <v-card>
          <v-card-subtitle>{{ currentUser.name }}的資料</v-card-subtitle>
          <v-card-text>
            <v-list-item v-for='item in userControls' :key='item.title' style='background-color:white' :to='item.path == "#" ? "" : item.path' link>
              <v-list-item-icon>
                <font-awesome-icon :icon='item.icon' />
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>{{ item.title }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-card-text>
        </v-card>
      </v-menu>
      <v-menu open-on-hover offset-y style='max-height: 80vh; overflow-y:scroll' v-if='currentUser !== null'>
        <template v-slot:activator='{ on, attrs }'>
          <v-badge
            color="red"
            :content="socketUsersList.messageCount"
            :value="socketUsersList.messageCount"
            overlap
          >
            <v-btn icon v-bind='attrs' v-on='on'>
              <font-awesome-icon icon='people-arrows' />
            </v-btn>
          </v-badge>
        </template>
        <v-card>
          <v-card-text>
            <div v-if='socketUsersList.users.length === 0'>無用戶</div>
            <div v-if='socketUsersList.users.length > 0'>
              <v-list-item v-for='user in socketUsersList.users' :key='user._id[0]._id' style='background-color:white'>
                <v-list-item-avatar>
                  <img :src='"https://avatars.dicebear.com/api/" + user._id[0].types + "/" + encodeURIComponent(user._id[0].name + "@" + user._id[0].unit) + ".svg"' :style='messageConverter(user)' />
                </v-list-item-avatar>
                <v-list-item-content>
                  <v-list-item-title class='text-left'>{{ user._id[0].name }}</v-list-item-title>
                  <v-list-item-subtitle class='text-left' v-if='user.where.length > 0'>{{ user.where[0] }}</v-list-item-subtitle>
                </v-list-item-content>
                <v-list-item-action>
                  <v-btn icon @click='startDialog(user._id[0])'>
                    <font-awesome-icon icon='comments' />
                  </v-btn>
                </v-list-item-action>
              </v-list-item>
            </div>
          </v-card-text>
        </v-card>
      </v-menu>
      <v-btn icon link href='#/'>
        <font-awesome-icon icon='home' />
      </v-btn>
      <v-menu open-on-hover offset-y style='max-height: 80vh; overflow-y:scroll'>
        <template v-slot:activator='{ on, attrs }'>
          <v-btn icon v-bind='attrs' v-on='on'>
            <font-awesome-icon icon='lightbulb' />
          </v-btn>
        </template>
        <v-card>
          <v-card-subtitle>服務狀態</v-card-subtitle>
          <v-card-text>
            <v-list-item style='background-color:white'>
              <v-list-item-icon>
                <font-awesome-icon icon='code-branch' />
              </v-list-item-icon>
              <v-list-item-content class='text-left'>
                <v-list-item-title>版本： {{ version }} <br/><a href="/#/Info"><span class='text-cpation cyan--text darken-4'>版本紀錄</span></a></v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item style='background-color:white'>
              <v-list-item-icon>
                <font-awesome-icon icon='hourglass-half' />
              </v-list-item-icon>
              <v-list-item-content class='text-left'>
                <v-list-item-title>檢查時間倒數： {{ timeConverter(nextCheckTime) }} </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item style='background-color:white'>
              <v-list-item-icon :class='serviceConverter(mongoStatus).color'>
                <font-awesome-icon icon='database' />
              </v-list-item-icon>
              <v-list-item-content class='text-left'>
                <v-list-item-title>資料庫 {{ serviceConverter(mongoStatus).text }} </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item style='background-color:white'>
              <v-list-item-icon :class='serviceConverter(socketioStatus).color'>
                <font-awesome-icon icon='plug' />
              </v-list-item-icon>
              <v-list-item-content class='text-left'>
                <v-list-item-title>同步連線 {{ serviceConverter(socketioStatus).text }} </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-card-text>
        </v-card>
      </v-menu>
    </v-app-bar>
    <v-main class='pa-5'>
      <router-view @viewIn='changePage'></router-view>
    </v-main>
  </v-app>
</template>

<script>
import Vue from 'vue';
import io from 'socket.io-client';
import VueSocketIOExt from 'vue-socket.io-extended';
import moment from 'moment';
import marked from 'marked';
import momentDurationFormatSetup from 'moment-duration-format';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas, faUserCog, faCommentAlt, faCog, faVideo, faTachometerAlt, faSignInAlt, faUsersCog, faChartLine, faInfoCircle, faStamp, faSlidersH, faNetworkWired, faUserTag } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon, FontAwesomeLayers } from '@fortawesome/vue-fontawesome';
import { faSnapchatGhost } from '@fortawesome/free-brands-svg-icons';
import { TiptapVuetify, Bold, Italic, Strike, Underline, Paragraph, OrderedList, ListItem, Link, HardBreak, History } from 'tiptap-vuetify';
import 'tiptap-vuetify/dist/main.css';
import TurndownService from 'turndown';
import { v4 as uuidv4 } from 'uuid';
import _ from 'lodash';

library.add(faUserTag, faCog, faVideo, faUserCog, faCommentAlt, fas, faSnapchatGhost, faTachometerAlt, faSignInAlt, faUsersCog, faChartLine, faInfoCircle, faStamp, faSlidersH, faNetworkWired);
Vue.component('font-awesome-icon', FontAwesomeIcon);
Vue.component('font-awesome-layers', FontAwesomeLayers);
const socketInstance = io('https://' + window.location.host + '/');
Vue.use(VueSocketIOExt, socketInstance);
momentDurationFormatSetup(moment);

const turndownService = new TurndownService();

export default {
  name: 'App',
  components: { TiptapVuetify },
  methods: {
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
      return marked(msg);
    },
    authClass: function (obj) {
      if (!obj.vis) {
        return 'notAuth';
      }
    },
    showBar: function () {
      this.miniVariant = !this.miniVariant;
    },
    changePage: function (val) {
      this.currentPage = val;
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
      return time === null || time === undefined ? moment().format('YYYY/MM/DD HH:mm:ss') : moment.unix(time).format('YYYY/MM/DD HH:mm:ss');
    },
    privilegeConvert: function (loginRequire) {
      return loginRequire ? '登入' : '特殊權限標籤';
    },
    timeConverter: function (time) {
      return moment.duration(time, 'second').format('mm分ss秒');
    }
  },
  computed: {
    messageDialog: function () {
      if(this.receiver !== null) {
        let sorted = [...this.chatDB[this.receiver._id].data].sort((a, b) => {
          return b.tick - a.tick;
        });
        let returned = sorted.slice(0, 5);
        for(let i = 0; i < returned.length; i++) {
          returned[i].uuid = uuidv4(); 
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
      let filtered = _.filter(this.socketUsers, (user) => {
        return user._id[0]._id !== oriobj.currentUser._id;
      });
      for(let i = 0; i < filtered.length; i++) {
        let user = filtered[i];
        user.newMessage = (user._id[0]._id in this.chatDB) ? this.chatDB[user._id[0]._id].newCount : 0;
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
          icon: 'user-cog',
          ava: true,
          title: '進入個人設定',
          path: '/user'
        },
        {
          icon: 'sign-out-alt',
          title: '登出審查平台',
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
    }
  },
  mounted () {
    if(localStorage.getItem('chatDB')) {
      this.chatDB = JSON.parse(localStorage.getItem('chatDB'));
    } else {
      this.chatDB = {};
      localStorage.setItem('chatDB', JSON.stringify(this.chatDB));
    }
    let oriobj = this;
    this.$socket.client.on('getCurrentUser', (data) => {
      oriobj.currentUser = data;
      oriobj.$socket.client.emit('getAuthLevel');
      oriobj.$socket.client.emit('getConcurrentUsers');
      oriobj.concurrentTimer = setInterval(() => {
        oriobj.$socket.client.emit('getConcurrentUsers');
      }, oriobj.connectionTimeout * 60 * 1000);
    });
    this.$socket.client.on('userDied', () => {
      oriobj.diedW = true;
      oriobj.diedMsg = '你的瀏覽器已經超過' + oriobj.connectionTimeout + '秒沒和主機連線，你被強制登出了';
    });
    this.$socket.client.on('dbStatus', (data) => {
      oriobj.mongoStatus = data;
      if (!data) {
        setTimeout(() => {
          oriobj.$socket.client.emit('dbStatus');
        }, 5000);
      }
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
      oriobj.chatTimer = window.setTimeout(() => {
        document.title = tempTitle;
        window.clearTimeout(oriobj.chatTimer);
      }, 10 * 1000);
    });
    this.$socket.client.on('messageBroadcast', (data) => {
      oriobj.broadcastW = true;
      oriobj.broadcastMsg = marked(data);
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
      oriobj.socketUsers = data;
    });
    this.$socket.client.on('getsiteSetting', (data) => {
      oriobj.version = data.version;
      oriobj.userCheckTime = data.userCheckTime;
      oriobj.lastCheckTime = moment().unix();
      oriobj.connectionTimeout = data.connectionTimeout;
      oriobj.$socket.client.emit('getCurrentUser');
      clearTimeout(oriobj.timer);
      oriobj.timer = setTimeout(() => {
        oriobj.$socket.client.emit('getsiteSetting');
        clearTimeout(oriobj.timer);
      }, oriobj.userCheckTime * 60 * 1000);
    });
    this.$socket.client.on('getAuthLevel', (data) => {
      for (let i = 0; i < oriobj.items.length; i++) {
        let item = oriobj.items[i];
        let login = oriobj.currentUser === undefined || oriobj.currentUser === null ? false : 'tags' in oriobj.currentUser;
        item.vis = !login ? false
                   : !(item.path in data) ? false
                   : typeof data[item.path] === 'boolean' ? data[item.path]
                   : data[item.path].some((titem) => {
          return oriobj.currentUser.tags.some((ctag) => {
            return ctag._id === titem;
          });
        });
      }
      clearTimeout(oriobj.authTimer);
      oriobj.authTimer = setTimeout(() => {
        oriobj.authW = false;
        clearTimeout(oriobj.authTimer);
      }, 500);
    });
    this.$socket.client.on('userAlived', () => {
      oriobj.$socket.client.emit('userAlived');
    });
    this.$socket.client.emit('dbStatus');
    this.$socket.client.emit('getsiteSetting');
    this.lastCheckTime = moment().unix();
    setInterval(() => {
      oriobj.nextCheckTime = (oriobj.userCheckTime * 60 - (moment().unix() - oriobj.lastCheckTime));
      if(((oriobj.nextCheckTime / 60) / oriobj.userCheckTime) < 0.05 ) {
        oriobj.timerIcon = 'hourglass';
      }
      if(((oriobj.nextCheckTime / 60) / oriobj.userCheckTime) >= 0.05 && ((oriobj.nextCheckTime / 60) / oriobj.userCheckTime) < 0.3 ) {
        oriobj.timerIcon = 'hourglass-start';
      }
      if(((oriobj.nextCheckTime / 60) / oriobj.userCheckTime) >= 0.3 && ((oriobj.nextCheckTime / 60) / oriobj.userCheckTime) <= 0.6 ) {
        oriobj.timerIcon = 'hourglass-half';
      }
      if(((oriobj.nextCheckTime / 60) / oriobj.userCheckTime) >= 0.6 && ((oriobj.nextCheckTime / 60) / oriobj.userCheckTime) <= 0.95 ) {
        oriobj.timerIcon = 'hourglass-end';
      }
      if(((oriobj.nextCheckTime / 60) / oriobj.userCheckTime) > 0.95 ) {
        oriobj.timerIcon = 'hourglass';
      }
    }, 1000);
  },
  data () {
    return {
      extensions: [
        History,
        Link,
        Underline,
        Strike,
        Italic,
        ListItem,
        OrderedList,
        Bold,
        Paragraph,
        HardBreak
      ],
      receiver: null,
      chatTimer: null,
      chatDB: null,
      authTimer: null,
      messageBody: '',
      messageW: false,
      userTimer: null,
      connectionTimeout: 2,
      diedW: false,
      diedMsg: '',
      timer: null,
      timerIcon: 'hourglass',
      nextCheckTime : 0,
      lastCheckTime : 0,
      userCheckTime: 10,
      authW: true,
      currentUser: null,
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
      broadcastW: false,
      socketioStatus: false,
      mongoStatus: false,
      socket: this.$socket,
      miniVariant: false,
      currentPage: {
        text: '預設頁面',
        icon: faSnapchatGhost,
        module: '預設模組'
      },
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
        icon: faSignInAlt,
        text: '未登入',
        subtext: '點此登入',
        to: '/logout'
      },
      socketUsers: [],
      items: [
        {
          icon: faTachometerAlt,
          title: 'DashBoard',
          path: '/userDashBoard',
          items: [],
          vis: false
        },
        {
          icon: faNetworkWired,
          title: '編輯知識點',
          path: '/createKB',
          items: [],
          vis: false
        },
        {
          icon: faCog,
          title: '系統設定',
          path: '/setting',
          items: [],
          vis: false
        },
        {
          icon: faCommentAlt,
          title: '系統訊息管理',
          path: '/messageMgnt',
          items: [],
          vis: false
        },
        {
          icon: faChartLine,
          title: '統計圖表',
          path: '/Chart',
          items: [],
          vis: false
        },
        {
          icon: faUsersCog,
          title: '使用者管理',
          path: '/userMgnt',
          items: [],
          vis: false
        },
        {
          icon: faInfoCircle,
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

<style>
@import url(//fonts.googleapis.com/css?family=Roboto:100,300,400,500,700,900);
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
