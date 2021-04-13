<template>
  <v-sheet class='d-flex flex-column'>
    <v-alert type="info">歡迎進入影片審查系統，在此提醒您，請務必使用Google Chrome／Firefox／Microsoft Edge等瀏覽器審查，千萬不要用Internet Explorer，可以的話，也請盡量不要以手機操作（雖然可以相容，但本站並非為手機設計）</v-alert>
    <div class='d-flex flex-column flex-grow-1' v-if='currentUser._id === ""'>
      <v-btn class='flex-grow-1 indigo darken-4 white--text ma-3 text-subtitle-2 font-weight-bold' link href="#/Login" >按此登入系統</v-btn>
    </div>
    <div v-if='currentUser._id !== ""' class='flex-grow-1 d-flex flex-column'>
      <div>{{ currentUser.name }} 已登入 </div>
      <v-btn class='flex-grow-1 indigo darken-4 white--text ma-3 text-subtitle-2 font-weight-bold' link href="#/userDashBoard" >進入DashBoard</v-btn>
    </div>
    <v-expansion-panels focusable accordion v-model='messageExpanded'>
      <v-expansion-panel v-for='item in announcements' :key='item.id' :class='criticalConvert(item.type)'>
        <v-expansion-panel-header expand-icon="fa-chevron-down">
          <div>
            [
            <v-icon>{{ typeConvert(item.type).icon }}</v-icon>
            {{ typeConvert(item.type).text }}
            @ {{ dateConvert(item.tick) }}] {{ item.title }}
          </div>
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          <div class='d-flex flex-column text-left'>
            <div class='text-subtitle-2 font-weight-bold'>{{ item.title }}</div>
            <div class='text-body-2' v-html="HTMLConverter(item.body)"></div>
            <div class='d-flex flex-row flex-wrap'>
              <v-chip
                v-for='file in item.attachments'
                :key="file._id"
                class="ma-2"
                @click="downloadFile(file)"
              >{{ filenameConvert(file) }}</v-chip>
            </div>
          </div>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
  </v-sheet>
</template>

<script>
import Vue from 'vue';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faSnapchatGhost } from '@fortawesome/free-brands-svg-icons';
import { faPhotoVideo, faBomb, faRobot, faCommentDots, faClipboard, faVideo, faSearch, faSkullCrossbones, faExclamationTriangle, faPencilAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import moment from 'moment';
import prettyBytes from 'pretty-bytes';
import marked from 'marked';

library.add(faSnapchatGhost, faBomb, faRobot, faCommentDots, faPhotoVideo, faClipboard, faVideo, faSearch, faSkullCrossbones, faExclamationTriangle, faPencilAlt);
Vue.component('font-awesome-icon', FontAwesomeIcon);

export default {
  methods: {
    socketgetIndexMessages: function (data) {
      this.announcements = data;
    },
    HTMLConverter: function (msg) {
      msg = msg === null || msg == undefined ? '**test**' : msg;
      return marked(msg);
    },
    filenameConvert: function (file) {
      let str = file.name;
      str += file.status !== 1 ? '(暫不可用)' : '';
      str += prettyBytes(file.size);
      return str;
    },
    downloadFile: function (file) {
      this.$emit('downloadFile', file);
    },
    criticalConvert: function (type) {
      return type === 2 ? 'white--text red darken-4' : '';
    },
    typeConvert: function (type) {
      return type === 0
      ? {
        icon: 'fa-comment-dots',
        text: '普通公告'
      }
      : type === 1
      ? {
        icon: 'fa-robot',
        text: '設備公告'
      }
      : {
        icon: 'fa-bomb',
        text: '緊急公告'
      };
    },
    dateConvert: function (time) {
      return moment.unix(time).format('YYYY/MM/DD HH:mm:ss');
    }
  },
  computed: {
    currentUser: function () {
      return this.$store.state.currentUser;
    },
    siteSettings: function () {
      return this.$store.state.siteSettings;
    }
  },
  watch: {
    announcements: function () {
      this.messageExpanded = this.announcements.findIndex((item) => {
        return item.type === 2;
      });
    }
  },
  data () {
    return {
      messageExpanded: null,
      announcements: [],
    };
  },
  beforeDestroy () {
    this.$socket.client.off('getIndexMessages', this.socketgetIndexMessages);
  },
  created () {
    this.$emit('viewIn', {
      text: '首頁',
      icon: 'fa-home',
      module: '首頁模組',
      location: '/Home'
    });
    this.$socket.client.on('getIndexMessages', this.socketgetIndexMessages);
    this.$socket.client.emit('getIndexMessages');
  }
};
</script>
