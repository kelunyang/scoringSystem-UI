<template>
  <v-sheet class='d-flex flex-column'>
    <v-alert type="info" icon="fa-info-circle">歡迎進入影片審查平台，在此提醒您，請務必使用Google Chrome／Firefox／Microsoft Edge等瀏覽器審查，千萬不要用Internet Explorer，可以的話，也請盡量不要以手機操作（雖然可以相容，但本站並非為手機設計）</v-alert>
    <v-btn v-if='currentUser === null' class='indigo darken-4 white--text ma-3 text-subtitle-2 font-weight-bold' link href="#/Login" >按此登入系統</v-btn>
    <div v-if='currentUser !== null'>{{ currentUser.name }} 已登入 </div>
    <v-expansion-panels focusable accordion v-model='messageExpanded'>
      <v-expansion-panel v-for='item in announcements' :key='item.id' :class='criticalConvert(item.type)'>
        <v-expansion-panel-header expand-icon="fa-chevron-down">
          <div>
            [
            <font-awesome-icon :icon='typeConvert(item.type).icon' />
            {{ typeConvert(item.type).text }}
            @ {{ dateConvert(item.tick) }}] {{ item.title }}
          </div>
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          <div class='d-flex flex-column text-left'>
            <div class='text-subtitle-2 font-weight-bold'>{{ item.title }}</div>
            <div class='text-body-2'>{{ item.body }}</div>
            <div class='d-flex flex-row'>
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

library.add(faSnapchatGhost, faBomb, faRobot, faCommentDots, faPhotoVideo, faClipboard, faVideo, faSearch, faSkullCrossbones, faExclamationTriangle, faPencilAlt);
Vue.component('font-awesome-icon', FontAwesomeIcon);

Vue.config.productionTip = false;

export default {
  methods: {
    filenameConvert: function (file) {
      let str = file.name;
      str += file.status !== 1 ? '(暫不可用)' : '';
      str += prettyBytes(file.size);
      return str;
    },
    downloadFile: function (file) {
      if (file.status === 1) {
        let element = document.createElement('a');
        element.setAttribute('href', this.siteSetting.siteLocation + '/' + file._id);
        element.setAttribute('download', file.name);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
      }
    },
    criticalConvert: function (type) {
      return type === 2 ? 'white--text red darken-4' : '';
    },
    typeConvert: function (type) {
      return type === 0
      ? {
        icon: faCommentDots,
        text: '普通公告'
      }
      : type === 1
      ? {
        icon: faRobot,
        text: '設備公告'
      }
      : {
        icon: faBomb,
        text: '緊急公告'
      };
    },
    dateConvert: function (time) {
      return moment.unix(time).format('YYYY/MM/DD HH:mm:ss');
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
      currentUser: null,
      siteSetting: null
    };
  },
  created () {
    this.$emit('viewIn', {
      text: '首頁',
      icon: faSnapchatGhost
    });
    let oriobj = this;
    this.$socket.$subscribe('getIndexMessages', (data) => {
      oriobj.announcements = data;
    });
    this.$socket.client.emit('getsiteSetting');
    this.$socket.client.emit('getIndexMessages');
    this.$socket.client.emit('getCurrentUser');
    this.$socket.$subscribe('getCurrentUser', (data) => {
      oriobj.currentUser = data;
    });
    this.$socket.$subscribe('getsiteSetting', (data) => {
      oriobj.siteSetting = data;
    });
  }
};
</script>
