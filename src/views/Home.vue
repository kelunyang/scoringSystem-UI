<template>
  <v-sheet class='d-flex flex-column pa-0 justify-center align-center'>
    <v-expansion-panels focusable accordion v-model='messageExpanded' style='width: 95%'>
      <v-expansion-panel v-for='item in announcements' :key='item.id' :class='item.type === 2 ? "red--text darken-4" : ""'>
        <v-expansion-panel-header expand-icon="fa-chevron-down">
          <div>
            [
            <v-icon :color='item.type === 2 ? "red darken-4" : ""'>{{ typeConvert(item.type).icon }}</v-icon>
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
    <div class='d-flex flex-column flex-grow-1 justify-center align-center' style='width: 95%' v-if='currentUser._id === ""'>
      <v-btn
      elevation="3"
      x-large
      style='min-width: 90%'
      class='flex-grow-1 indigo darken-4 white--text ma-3 text-h6 font-weight-bold'
      link
      href="#/Login">
        按此登入系統
      </v-btn>
    </div>
    <div v-if='currentUser._id !== ""' class='d-flex flex-column flex-grow-1 justify-center align-center' style='width: 95%'>
      <div>{{ currentUser.name }} 已登入 </div>
      <v-btn 
        elevation="3"
        x-large
        style='min-width: 90%'
        class='flex-grow-1 indigo darken-4 white--text ma-3 text-h6 font-weight-bold'
        link
        href="#/userDashBoard"
      >
        進入DashBoard
      </v-btn>
    </div>
  </v-sheet>
</template>

<script>
import dayjs from 'dayjs';
import prettyBytes from 'pretty-bytes';
import { marked } from 'marked';
const renderer = new marked.Renderer();
const linkRenderer = renderer.link;
renderer.link = (href, title, text) => {
  if(href !== undefined) { href = (decodeURIComponent(href)).replace(/\\/g, ''); }
  if(title !== undefined) { title = (decodeURIComponent(title)).replace(/\\/g, ''); }
  if(text !== undefined) { text = (decodeURIComponent(text)).replace(/\\/g, ''); }
  const html = linkRenderer.call(renderer, href, title, text);
  return html.replace(/^<a /, '<a target="_blank" rel="nofollow" ');
};

export default {
  methods: {
    socketgetIndexMessages: function (data) {
      this.announcements = data;
    },
    HTMLConverter: function (msg) {
      msg = msg === null || msg == undefined ? '**test**' : msg;
      return marked(msg, { renderer });
    },
    filenameConvert: function (file) {
      let str = file.name;
      str += file.status === 0 ? '(暫不可用)' : '';
      str += prettyBytes(file.size);
      return str;
    },
    downloadFile: function (file) {
      this.$emit('downloadFile', file);
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
      return dayjs.unix(time).format('YYYY/MM/DD HH:mm:ss');
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
      isIE: false,
      isMobile: false
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
