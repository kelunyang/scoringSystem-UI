<template>
  <v-app>
    <v-dialog
      v-model="authW"
      persistent
      max-width="50vw"
    >
      <v-card>
        <v-card-title class="headline">
          載入權限...
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
        <v-card-text>
          {{ broadcastMsg.body }}
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
      <v-spacer>
      <div class='grey--text darken-2 text-caption'>version: {{ version }}</div>
    </v-navigation-drawer>
    <v-app-bar collapse-on-scroll fixed app color='deep-purple accent-4' dark>
      <v-app-bar-nav-icon @click='showBar'>
        <font-awesome-icon icon='bars' />
      </v-app-bar-nav-icon>
      <v-toolbar-title>
        <font-awesome-icon :icon='currentTitle.icon' />
        [新]臺北市新課綱影片審查系統： {{ currentTitle.text }}
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-menu open-on-hover offset-y v-if='currentUserObj.name !== "undefined"'>
        <template v-slot:activator='{ on, attrs }'>
          <v-btn icon v-bind='attrs' v-on='on'>
            <v-avatar size="30">
                <img :src='currentUserObj.icon' />
            </v-avatar>
          </v-btn>
        </template>
        <v-card>
          <v-card-subtitle>{{ currentUserObj.name }}的資料</v-card-subtitle>
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
      <v-menu open-on-hover offset-y style='max-height: 80vh; overflow-y:scroll'>
        <template v-slot:activator='{ on, attrs }'>
          <v-btn icon v-bind='attrs' v-on='on'>
            <font-awesome-icon icon='people-arrows' />
          </v-btn>
        </template>
        <v-card>
          <v-card-subtitle>同時線上用戶</v-card-subtitle>
          <v-card-text>
            <div v-if='socketUserList.length === 0'>無用戶</div>
            <div v-if='socketUserList.length > 0'>
              <v-list-item v-for='item in socketUserList' :key='item.id' style='background-color:white'>
                <v-list-item-content>
                  <v-list-item-title>{{ item.name }}</v-list-item-title>
                </v-list-item-content>
                <v-list-item-action>
                  <v-btn icon link :href='item.message'>
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
          <v-btn icon v-bind='attrs' v-on='on' :class='serviceConverter(serviceOverall).color'>
            <font-awesome-icon icon='cloud' />
          </v-btn>
        </template>
        <v-card>
          <v-card-subtitle>服務狀態</v-card-subtitle>
          <v-card-text>
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
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas, faUserCog, faCommentAlt, faCog, faVideo, faTachometerAlt, faSignInAlt, faUsersCog, faChartLine, faInfoCircle, faStamp, faSlidersH, faNetworkWired, faUserTag } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon, FontAwesomeLayers } from '@fortawesome/vue-fontawesome';
import { faSnapchatGhost } from '@fortawesome/free-brands-svg-icons';
library.add(faUserTag, faCog, faVideo, faUserCog, faCommentAlt, fas, faSnapchatGhost, faTachometerAlt, faSignInAlt, faUsersCog, faChartLine, faInfoCircle, faStamp, faSlidersH, faNetworkWired);
Vue.component('font-awesome-icon', FontAwesomeIcon);
Vue.component('font-awesome-layers', FontAwesomeLayers);
const socketInstance = io('https://' + window.location.host + '/');
Vue.use(VueSocketIOExt, socketInstance);

export default {
  name: 'App',
  methods: {
    authClass: function (obj) {
      if (!obj.vis) {
        return 'notAuth';
      }
    },
    showBar: function () {
      this.miniVariant = !this.miniVariant;
    },
    changePage: function (val) {
      this.currentTitle = val;
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
    }
  },
  computed: {
    serviceOverall: function () {
      return (this.mongoStatus && this.socketioStatus);
    },
    socketUserList: function () {
      return this.socketUsers.filter((item) => {
        return item.action === this.currentTitle.text;
      });
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
    },
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
  watch: {
    'socket.connected': {
      deep: true,
      handler () {
        this.socketioStatus = this.socket.hasOwnProperty('connected') ? this.socket.connected : false;
        if (!this.socketioStatus) {
          this.mongoStatus = false;
          this.syncW = true;
        } else {
          this.syncW = false;
        }
      }
    },
    mongoStatus: function () {
      if (!this.mongoStatus) {
        this.$socket.client.emit('dbStatus');
      }
    }
  },
  mounted () {
    let oriobj = this;
    this.$socket.$subscribe('getCurrentUser', (data) => {
      oriobj.currentUser = data;
    });
    this.$socket.$subscribe('dbStatus', (data) => {
      oriobj.mongoStatus = data;
      if (!data) {
        setTimeout(() => {
          oriobj.$socket.client.emit('dbStatus');
        }, 5000);
      }
    });
    this.$socket.$subscribe('messageBroadcast', (data) => {
      oriobj.broadcastW = true;
      oriobj.broadcastMsg = data;
    });
    this.$socket.$subscribe('errorMessage', (data) => {
      oriobj.errormW = true;
      oriobj.errorm = data;
    });
    this.$socket.$subscribe('accessViolation', (data) => {
      oriobj.violationW = true;
      oriobj.violation = data;
    });
    this.$socket.$subscribe('getsiteSetting', (data) => {
      oriobj.version = data.version;
    });
    this.$socket.$subscribe('disconnect', (reason) => {
      console.log(reason);
    });
    this.$socket.$subscribe('getAuthLevel', (data) => {
      for (let i = 0; i < this.items.length; i++) {
        let item = oriobj.items[i];
        let login = oriobj.currentUser === undefined || oriobj.currentUser === null ? false : !oriobj.currentUser.hasOwnProperty('tags');
        item.vis = !login ? false
                   : !data.hasOwnProperty(item.path) ? false
                   : typeof data[item.path] === 'boolean' ? data[item.path]
                   : data[item.path].some((titem) => {
          return oriobj.currentUser.tags.some((ctag) => {
            return ctag._id === titem;
          });
        });
      }
      setTimeout(() => {
        oriobj.authW = false;
      }, 500);
    });
    this.$socket.client.emit('getCurrentUser');
    this.$socket.client.emit('dbStatus');
    this.$socket.client.emit('getAuthLevel');
    this.$socket.client.emit('getsiteSetting');
  },
  data () {
    return {
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
      currentTitle: {
        text: '預設頁面',
        icon: faSnapchatGhost
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
      socketUsers: [
        {
          name: '用戶一',
          action: '編輯知識點',
          message: 'mailto: test@test.com'
        },
        {
          name: '用戶二',
          action: 'DashBoard',
          message: 'mailto: test1@test.com'
        }
      ],
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
