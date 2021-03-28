<template>
  <v-sheet class='d-flex flex-column'>
    <v-dialog
      v-model="downloadW"
      persistent
      max-width="50vw"
    >
      <v-card>
        <v-card-title class="headline">
          <v-icon>fa-satellite-dish</v-icon>
          下載 {{ selectedpmKBs.length }} 個知識點的最新commit
        </v-card-title>
        <v-card-text class='d-flex flex-column'>
          <v-alert type='info'>請注意，為節省系統資源，系統不會幫你把這些檔案壓縮，而會同時發送這些檔案給你，你應該會在瀏覽器正下方（或是正上方）看到「是否允許下載多個檔案」的提示，請務必按「同意」</v-alert>
          <div class='red--text text-caption'>你要下載最新的幾個commit呢？（{{ latestCount }}）</div>
          <v-slider
            label='最新commit數量'
            min='1'
            max='10'
            v-model="latestCount"
            thumb-label
          ></v-slider>
          <v-btn @click='getlatestVersions'>點此開始下載</v-btn>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            @click="downloadW = false"
          >
            關閉對話框
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model='versionW'
      fullscreen
      hide-overlay
      transition="dialog-bottom-transition"
    >
      <v-card>
        <v-toolbar dark color='primary'>
          <v-btn
            icon
            dark
            @click="closeVersionW"
          >
            <v-icon>fa-times</v-icon>
          </v-btn>
          <v-toolbar-title>管理知識點commit</v-toolbar-title>
        </v-toolbar>
        <v-card-text class='d-flex flex-column'>
          <div class='text-subtitle-2 font-weight-blod'>Commit Release Note（必填但不得超過30個字）</div>
          <v-text-field solo hint='請輸入這個新Commit的註解，不得超過30個字' v-model='versionComment' />
          <div class='text-subtitle-2 font-weight-blod'>Commit檔案</div>
          <v-file-input
            v-if="versionComment !== ''"
            prepend-icon="fa-paperclip" 
            v-model="versionFile" 
            label='上傳知識點commit' 
            accept="application/zip, video/mp4, video/webm"
            :loading="uploadprogress !== 0">
            <template v-slot:progress>
              <v-progress-circular :value="uploadprogress"></v-progress-circular>速度：{{ uploadstatus }}
            </template>
          </v-file-input>
          <div v-if='versionPopulated'>
            <span v-if='currentVersions.length === 0' class='text-body-1 text-center'>
              目前沒有commit
            </span>
            <v-simple-table v-show="currentVersions.length > 0">
              <template v-slot:default>
                <thead>
                  <tr>
                    <th class="text-left" style="width:200px">
                      commit release date
                    </th>
                    <th class="text-left" style="width:200px">
                      原始檔名
                    </th>
                    <th class="text-left" style="width:250px">
                      狀態
                    </th>
                    <th class="text-left">
                      release note
                    </th>
                    <th class="text-left" style="width:25px">
                      &nbsp;
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="version in currentVersions"
                    :key="version._id"
                  >
                    <td class="text-left">
                      {{ dateConvert(version.tick) }}
                    </td>
                    <td class="text-left">
                      {{ version.name }}
                    </td>
                    <td class="text-left">
                      <span v-if='version.status === 1'>尚未格式檢查</span>
                      <span v-if='version.status === 0'>格式檢查失敗</span>
                      <span v-if='version.status === 2'>格式檢查完成</span>
                      <span v-if='version.status === 3'>影片格式已轉換為VP9</span>
                    </td>
                    <td class="text-left">
                      {{ version.comment }}
                    </td>
                    <td class='d-flex flex-row'>
                      <v-btn
                        outlined
                        icon
                        @click='deleteKBVersion(version._id)'
                      >
                        <v-icon>fa-trash</v-icon>
                      </v-btn>
                      <v-btn
                        :href='siteSettings.siteLocation + "/storages/" + version._id'
                        :download="currentKB.title + '|' + version.name"
                        outlined
                        icon>
                        <v-icon>fa-file-download</v-icon>
                      </v-btn>
                    </td>
                  </tr>
                </tbody>
              </template>
            </v-simple-table>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model='participantW'
      fullscreen
      hide-overlay
      transition="dialog-bottom-transition"
    >
      <v-card>
        <v-toolbar dark color='primary'>
          <v-btn
            icon
            dark
            @click="participantW = false"
          >
            <v-icon>fa-times</v-icon>
          </v-btn>
          <v-toolbar-title>{{ participantsDB.proceedKBs.length }}個知識點的參與者們（{{ participantsDB.proceedUsers.length }}）</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn
            icon
            dark
            @click="exportParticipant"
          >
            <v-icon>fa-download</v-icon>
          </v-btn>
        </v-toolbar>
        <v-card-text class='pa-0 ma-0 d-flex flex-column'>
          <v-alert type="info">你如果發現你勾選的知識點少於系統回傳的知識點，那很明顯是因為你不具有該知識點的行政管理權，請洽管理員</v-alert>
          <div v-if='participantsDB.statistics.length === 0'>
            你不具備你勾選的知識點的行政管理權，回傳結果為0
          </div>
          <div v-if='participantsDB.statistics.length > 0'>
            <div class='text-left' v-for='participant in participantsDB.statistics' :key='participant._id'>
              <div class='text-h6 indigo darken-4 font-weight-black white--text'>{{participant.name}} @ {{participant.unit}}</div>
              <v-divider></v-divider>
              <div class='text-subtitle-1 indigo--text darken-4 font-weight-medium'>參與PM工作（{{ participant.pmStages.length }}次）</div>
              <v-divider></v-divider>
              <div class='d-flex flex-row flex-wrap'>
                <v-chip
                  class="ma-2 white--text"
                  :color="tagColor(0)"
                  label
                  v-for='stage in participant.pmStages'
                  :key='stage._id'
                >
                  {{ stage.KBtitle }} | {{ stage.name }}
                </v-chip>
              </div>
              <div class='text-subtitle-1 indigo--text darken-4 font-weight-medium'>參與審查者工作（{{ participant.reviewerStages.length }}次）</div>
              <v-divider></v-divider>
              <div class='d-flex flex-row flex-wrap'>
                <v-chip
                  class="ma-2 white--text"
                  :color="tagColor(1)"
                  label
                  v-for='stage in participant.reviewerStages'
                  :key='stage._id'
                >
                  {{ stage.KBtitle }} | {{ stage.name }}
                </v-chip>
              </div>
              <div class='text-subtitle-1 indigo--text darken-4 font-weight-medium'>參與廠商工作（{{ participant.vendorStages.length }}次）</div>
              <v-divider></v-divider>
              <div class='d-flex flex-row flex-wrap'>
                <v-chip
                  class="ma-2 white--text"
                  :color="tagColor(2)"
                  label
                  v-for='stage in participant.vendorStages'
                  :key='stage._id'
                >
                  {{ stage.KBtitle }} | {{ stage.name }}
                </v-chip>
              </div>
              <div class='text-subtitle-1 indigo--text darken-4 font-weight-medium'>參與寫手工作（{{ participant.writerStages.length }}次）</div>
              <v-divider></v-divider>
              <div class='d-flex flex-row flex-wrap'>
                <v-chip
                  class="ma-2 white--text"
                  :color="tagColor(3)"
                  label
                  v-for='stage in participant.writerStages'
                  :key='stage._id'
                >
                  {{ stage.KBtitle }} | {{ stage.name }}
                </v-chip>
              </div>
              <div class='text-subtitle-1 indigo--text darken-4 font-weight-medium'>參與行政工作（{{ participant.finalStages.length }}次）</div>
              <v-divider></v-divider>
              <div class='d-flex flex-row flex-wrap'>
                <v-chip
                  class="ma-2 white--text"
                  :color="tagColor(4)"
                  label
                  v-for='stage in participant.finalStages'
                  :key='stage._id'
                >
                  {{ stage.KBtitle }} | {{ stage.name }}
                </v-chip>
              </div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-dialog v-model="tagFilterW" persistent>
      <v-card>
        <v-card-title class="headline">設定標籤過濾</v-card-title>
        <v-card-text>
          <tag-filter :mustSelected='false' :single='false' :selectedItem='selectedFilterTags' @valueUpdated='updateFilterTag' :candidatedItem='savedTags' :createable='false' label='請輸入過濾用的標籤' />
        </v-card-text>
        <v-card-actions>
        <v-spacer></v-spacer>
          <v-btn color="green darken-1" text @click="tagFilterW = false">回到檢視畫面</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="termFilterW" persistent>
      <v-card>
        <v-card-title class="headline">搜尋關鍵字</v-card-title>
        <v-card-text>
          <v-text-field label='搜尋關鍵字' prepend-icon="fa-search" v-model="queryTerm" full-width></v-text-field>
        </v-card-text>
        <v-card-actions>
        <v-spacer></v-spacer>
            <v-btn color="green darken-1" text @click="termFilterW = false">回到檢視畫面</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-fab-transition>
      <v-tooltip bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            v-bind="attrs" v-on="on"
            color="pink"
            fixed
            fab
            dark
            bottom
            right
            style='margin-bottom: 160px'
            @click.stop='showStatstics = !showStatstics'
          >
            <v-icon>fa-chart-line</v-icon>
          </v-btn>
        </template>
        <span v-if='!showStatstics'>顯示完成度統計</span>
        <span v-if='showStatstics'>隱藏完成度統計</span>
      </v-tooltip>
    </v-fab-transition>
    <v-speed-dial style='margin-bottom: 80px' v-model="pmtoolsBtns" fixed bottom right direction="left" :open-on-hover="true" transition="slide-y-reverse-transition">
      <template v-slot:activator>
        <v-btn
          v-model="pmtoolsBtns"
          color="brown darken-4"
          dark
          fab
        >
          <v-icon v-if="configBtn">fa-chevron-up</v-icon>
          <v-icon v-else>fa-toolbox</v-icon>
        </v-btn>
      </template>
      <v-badge
        color="red"
        overlap
        :content='selectedpmKBs.length'
        :value='selectedpmKBs.length'
      >
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              v-bind="attrs" v-on="on"
              fab
              dark
              small
              color="deep-orange darken-4"
              @click.stop='youtubeW = true'
            >
              <v-icon>fab fa-youtube</v-icon>
            </v-btn>
          </template>
          <span>上傳到Youtube（尚未開發）</span>
        </v-tooltip>
      </v-badge>
      <v-badge
        color="red"
        overlap
        :content='selectedpmKBs.length'
        :value='selectedpmKBs.length'
      >
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              v-bind="attrs" v-on="on"
              fab
              dark
              small
              color="deep-orange darken-4"
              @click.stop='downloadW = true'
            >
              <v-icon>fa-file-download</v-icon>
            </v-btn>
          </template>
          <span>下載最新commit</span>
        </v-tooltip>
      </v-badge>
      <v-badge
        color="red"
        overlap
        :content='selectedpmKBs.length'
        :value='selectedpmKBs.length'
      >
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              v-bind="attrs" v-on="on"
              fab
              dark
              small
              color="deep-orange darken-4"
              @click.stop='participantStatstics'
            >
              <v-icon>fa-users</v-icon>
            </v-btn>
          </template>
          <span>參與者名單</span>
        </v-tooltip>
      </v-badge>
    </v-speed-dial>
    <v-speed-dial v-model="filterBtn" fixed bottom right direction="left" :open-on-hover="true" transition="slide-y-reverse-transition">
      <template v-slot:activator>
        <v-btn
          v-model="filterBtn"
          :color="filterColor"
          dark
          fab
        >
          <v-icon v-if="filterBtn">fa-chevron-left</v-icon>
          <v-icon v-else>fa-filter</v-icon>
        </v-btn>
      </template>
      <v-tooltip top>
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            fab
            dark
            small
            color="teal darken-4"
            @click.stop='tagFilterW = true'
            v-bind="attrs" v-on="on"
          >
            <v-icon>fab fa-slack-hash</v-icon>
          </v-btn>
        </template>
        <span>過濾關鍵字</span>
      </v-tooltip>
      <v-tooltip top>
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            fab
            dark
            small
            color="indigo"
            @click.stop='termFilterW = true'
            v-bind="attrs" v-on="on"
          >
            <v-icon>fa-search</v-icon>
          </v-btn>
        </template>
        <span>搜尋關鍵字</span>
      </v-tooltip>
      <v-tooltip top>
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            fab
            dark
            small
            color="blue-grey darken-4"
            @click.stop='queryHistory = !queryHistory'
            v-bind="attrs" v-on="on"
          >
            <v-icon>fa-history</v-icon>
          </v-btn>
        </template>
        <span v-if='queryHistory'>查看目前屬於你的知識點</span>
        <span v-if='!queryHistory'>查看所有和你有關的知識點</span>
      </v-tooltip>
    </v-speed-dial>
    <div v-show='showStatstics'>
      <apexchart width="100%" type="bar" :options="chartData.chartOptions" :series="chartData.series"></apexchart>
      <v-simple-table>
        <template v-slot:default>
          <thead>
            <tr>
              <th class="text-center">
                完成度大約一半
              </th>
              <th class="text-center">
                完成度大約一半
              </th>
              <th class="text-center">
                接近完成的專案
              </th>
              <th class="text-center">
                總計
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{{ chartData.aboveHalfway }}</td>
              <td>{{ chartData.aboutHalfyway }}</td>
              <td>{{ chartData.almostDone }}</td>
              <td>{{ chartData.almostDone + chartData.aboutHalfyway + chartData.aboveHalfway}}</td>
            </tr>
          </tbody>
        </template>
      </v-simple-table>
    </div>
    <v-sheet class='pa-0 ma-0 d-flex flex-column'>
      <progress-tile @requestUpload='openUploadW' @KBselected='KBupdated' v-for="item in convertedList" :key="item._id" :progressItem='item' />
    </v-sheet>
  </v-sheet>
</template>

<script>
import Vue from 'vue';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faSnapchatGhost } from '@fortawesome/free-brands-svg-icons';
import { faPhotoVideo, faClipboard, faTachometerAlt, faVideo, faSearch, faSkullCrossbones, faExclamationTriangle, faPencilAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import moment from 'moment';
import { randomColor } from 'randomcolor';
//import BarChart from './modules/BarChart';
import ProgressTile from './modules/ProgressTile';
import TagFilter from './modules/TagFilter';
import _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import VueApexCharts from 'vue-apexcharts';
import prettyBytes from 'pretty-bytes';

import '@fortawesome/fontawesome-free/css/all.css';

library.add(faTachometerAlt, faSnapchatGhost, faPhotoVideo, faClipboard, faVideo, faSearch, faSkullCrossbones, faExclamationTriangle, faPencilAlt);
Vue.use(VueApexCharts);
Vue.component('apexchart', VueApexCharts);
Vue.component('font-awesome-icon', FontAwesomeIcon);
let files = [];

export default {
  name: 'userDashBoard',
  components: {
    /* BarChart, */
    ProgressTile,
    TagFilter
  },
  methods: {
    participantStatstics: function () {
      this.$socket.client.emit('participantStatstics', this.selectedpmKBs);
    },
    KBupdated:  function (data) {
      let found = _.find(this.selectedpmKBs, (KB) => {
        return KB === data._id;
      });
      if(found !== undefined) {
        let newpmKB = _.filter(this.selectedpmKBs, (item) => {
          return item !== data._id;
        });
        this.selectedpmKBs = newpmKB;
      } else {
        this.selectedpmKBs.push(data._id);
      }
    },
    openUploadW: function (data) {
      this.currentKB = data;
      this.$socket.client.emit('getKBVersions', data._id);
    },
    socketlistDashBoard: function (data) {
      let oriobj = this;
      this.$emit('timerOn', false);
      this.$emit('toastPop', 'DashBoard更新完成');
      this.lastCheckTime = moment().unix();
      this.progressList = data;
      clearTimeout(this.queryTimer);
      this.queryTimer = setTimeout(() => {
        oriobj.$emit('timerOn', true);
        oriobj.$emit('toastPop', 'DashBoard更新中');
        oriobj.$socket.client.emit('listDashBoard');
      }, this.siteSettings.userCheckTime * 60 * 1000);
    },
    updateFilterTag: function (value) {
      this.selectedFilterTags = value;
    },
    dateConvert: function (time) {
      return time === null || time === undefined ? moment().format('YYYY/MM/DD HH:mm:ss') : moment.unix(time).format('YYYY/MM/DD HH:mm:ss');
    },
    sockparticipantStatstics: function (data) {
      this.participantsDB = data;
      this.participantW = true;
    },
    tagColor: function(n) {
      return this.randomColors[n];
    },
    exportParticipant: function () {
      let exportCSV = '\ufeff';
      exportCSV += '你所勾選的知識點數量：' + this.participantsDB.proceedKBs.length + '\n';
      exportCSV += '參與這些知識點的使用者：' + this.participantsDB.proceedUsers.length + '\n';
      exportCSV += '各知識點的參與狀況：\n';
      for (let i = 0; i < this.participantsDB.statistics.length; i++) {
        let user = this.participantsDB.statistics[i];
        exportCSV += user.name + '@' + user.unit + '\n';
        exportCSV += '參與PM工作：\n';
        for (let k = 0; k < user.pmStages.length; k++) {
          let stageParticipants = _.map(user.pmStages[k], (item) => {
            return item.KBtitle + '|' + item.name
          });
          exportCSV += _.toString(stageParticipants) + '\n';
        }
        exportCSV += '參與審查者工作：\n';
        for (let k = 0; k < user.reviewerStages.length; k++) {
          let stageParticipants = _.map(user.reviewerStages[k], (item) => {
            return item.KBtitle + '|' + item.name
          });
          exportCSV += _.toString(stageParticipants) + '\n';
        }
        exportCSV += '參與寫手工作：\n';
        for (let k = 0; k < user.writerStages.length; k++) {
          let stageParticipants = _.map(user.writerStages[k], (item) => {
            return item.KBtitle + '|' + item.name
          });
          exportCSV += _.toString(stageParticipants) + '\n';
        }
        exportCSV += '參與行政組工作：\n';
        for (let k = 0; k < user.finalStages.length; k++) {
          let stageParticipants = _.map(user.finalStages[k], (item) => {
            return item.KBtitle + '|' + item.name
          });
          exportCSV += _.toString(stageParticipants) + '\n';
        }
        exportCSV += '參與廠商工作：\n';
        for (let k = 0; k < user.vendorStages.length; k++) {
          let stageParticipants = _.map(user.vendorStages[k], (item) => {
            return item.KBtitle + '|' + item.name
          });
          exportCSV += _.toString(stageParticipants) + '\n';
        }
      }
      exportCSV += '\n';
      let element = document.createElement('a');
      element.setAttribute('href', 'data:text/csv;base64,' + window.btoa(exportCSV));
      element.setAttribute('download', '參與者統計匯出.csv');
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    },
    sockgetKBVersions: function (data) {
      this.versionPopulated = true;
      this.currentVersions = data;
      this.versionComment = '';
      this.versionW = true;
    },
    getlatestVersions: function () {
      this.$socket.client.emit('getlatestVersions', {
        limit: this.latestCount,
        KBs: this.selectedpmKBs
      });
    },
    closeVersionW: function () {
      this.versionW = false;
      this.versionPopulated = false;
    },
    deleteKBVersion: function (data) {
      this.$socket.client.emit('deleteKBVersion', {
        fileID: data,
        KBID: this.currentKB._id
      });
    },
    socketrequestKBVersionSlice: function (data) {
      let oriobj = this;
      let place = data.currentSlice * 100000;
      let slice = files[data.uuid].file.slice(place, place + Math.min(100000, files[data.uuid].file.size - place));
      this.uploadprogress = Math.ceil((place / files[data.uuid].file.size) * 100);
      let nowdiff = moment().valueOf() - files[data.uuid].starttick;
      this.uploadstatus = nowdiff === 0 ? '' : prettyBytes(place / (nowdiff/1000)) + '/s';
      let fileReader = new FileReader();
      fileReader.readAsArrayBuffer(slice);
      fileReader.onload = () => {
        var arrayBuffer = fileReader.result;
        oriobj.$socket.client.emit('sendKBVersion', {
          uid: files[data.uuid]._id,
          uuid: data.uuid,
          name: files[data.uuid].file.name,
          type: files[data.uuid].file.type,
          size: files[data.uuid].file.size,
          comment: oriobj.versionComment,
          data: arrayBuffer
        });
      };
    },
    socketKBVersionDeleteError: function (data) {
      this.$emit('toastPop', '刪除檔案失敗（原因：' + data + '），請聯絡管理員');
      this.uploadprogress = 0;
      this.uploadstatus = '';
    },
    socketKBVersionUploadError: function (data) {
      this.$emit('toastPop', '上傳失敗（原因：' + data + '），請聯絡管理員');
      this.uploadprogress = 0;
      this.uploadstatus = '';
    },
    soketKBVersionUploadDone: function (data) {
      let oriobj = this;
      if (data === this.currentKB._id) {
        this.$socket.client.emit('getKBVersions', data);
        this.versionFile = undefined;
        this.uploadprogress = 100;
        this.uploadstatus = '完成！';
        this.importW = false;
        this.statusMsg = '';
        Vue.nextTick(() => {
          oriobj.uploadprogress = 0;
          oriobj.uploadstatus = '';
        });
      }
    },
    soketgetlatestVersions: function (data) {
      for (let i = 0; i < data.length; i++) {
        let file = data[i];
        let element = document.createElement('a');
        element.setAttribute('href', this.siteSettings.siteLocation + '/storages/' + file._id);
        element.setAttribute('download', '['+ file.title + '(' + file._id + ')]' + file.name);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
      }
    }
  },
  watch: {
    versionFile: {
      immediate: true,
      handler () {
        if (this.versionFile !== undefined) {
          let oriobj = this;
          let fileReader = new FileReader();
          let slice = this.versionFile.slice(0, 100000);
          let uuid = uuidv4();
          files[uuid] = {
            _id: this.currentKB._id,
            file: this.versionFile,
            starttick: moment().valueOf()
          };
          fileReader.readAsArrayBuffer(slice);
          fileReader.onload = () => {
              var arrayBuffer = fileReader.result;
              oriobj.$socket.client.emit('sendKBVersion', {
                uid: oriobj.versionFile._id,
                uuid: uuid,
                name: oriobj.versionFile.name,
                type: oriobj.versionFile.type,
                size: oriobj.versionFile.size,
                comment: oriobj.versionComment.substring(0, 30),
                data: arrayBuffer
              });
          };
        }
      }
    }
  },
  computed: {
    currentUser: function () {
      return this.$store.state.currentUser;
    },
    savedTags: function () {
      return this.$store.state.savedTags;
    },
    siteSettings: function () {
      return this.$store.state.siteSettings;
    },
    convertedList: function () {
      let list = [];
      let oriobj = this;
      if(oriobj.selectedFilterTags.length > 0) {
        let oriobj = this;
        for (let i = 0; i < oriobj.selectedFilterTags.length; i++) {
          let tag = oriobj.selectedFilterTags[i];
          list.push(_.filter(this.progressList, (item) => {
            return _.includes(item.tag, tag);
          }));
        }
        list = _.flatten(list);
      } else {
        list = this.progressList;
      }
      if(this.queryTerm !== '') {
        list = _.filter(list, (item) => {
          return (new RegExp(oriobj.queryTerm)).test(item.title + item.desc);
        });
      }
      for (let i = 0; i< list.length; i++) {
        let KB = list[i];
        KB.attention = 0;
        KB.selected = false;
        KB.currentStep = (_.countBy(KB.stages, {
          current: false
        })) === KB.stages.length ? 0 : (_.findIndex(KB.stages, {
          current: true
        })) + 1 ;
        for (let k = 0; k < KB.stages.length; k++) {
          let stage = KB.stages[k];
          stage.special = false;
          if(stage.current) {
            if(stage.dueTick < moment().unix()) {
              stage.special = true;
            }
            KB.attention = moment().unix() - stage.dueTick;
          }
        }
        for (let k = 0; k < this.currentUser.tags.length; k++) {
          let userTag = this.currentUser.tags[k]._id;
          KB.isPM = false;
          KB.isWriter = false;
          KB.isVendor = false;
          KB.isFinal = false;
          KB.isReviewer = false;
          if (KB.currentStep > 0) {
            if (!KB.isPM) {
              KB.isPM = _.includes(KB.stages[KB.currentStep - 1].pmTags, userTag);
            }
            if (!KB.isWriter) {
              KB.isWriter = _.includes(KB.stages[KB.currentStep - 1].writerTags, userTag);
            }
            if (!KB.isVendor) {
              KB.isVendor = _.includes(KB.stages[KB.currentStep - 1].vendorTags, userTag);
            }
            if (!KB.isFinal) {
              KB.isFinal = _.includes(KB.stages[KB.currentStep - 1].finalTags, userTag);
            }
            if (!KB.isReviewer) {
              KB.isReviewer = _.includes(KB.stages[KB.currentStep - 1].reviewerTags, userTag);
            }
          }
        }
        let found = _.find(this.selectedpmKBs, (item) => {
          return KB._id === item;
        });
        if (found !== undefined) {
          KB.selected = true;
        }
      }
      if(list.length > 0) {
        if(!this.queryHistory) {
          let result = [];
          for (let i = 0; i < this.currentUser.tags.length; i++) {
            let tag = this.currentUser.tags[i];
            result.push(_.filter(list, (item) => {
              if(item.currentStep === 0) {
                return false;
              } else {
                return _.includes(_.flatten([
                        item.stages[item.currentStep - 1].pmTags,
                        item.stages[item.currentStep - 1].reviewerTags,
                        item.stages[item.currentStep - 1].vendorTags,
                        item.stages[item.currentStep - 1].writerTags,
                        item.stages[item.currentStep - 1].finalTags
                      ]), tag._id);
              }
            }));
          }
          list = _.flatten(result);
        }
        list.sort((a, b) => {
          let aTime = a.attention > 0 ? aTime * 100000 : Math.abs(aTime);
          let bTime = b.attention > 0 ? bTime * 100000 : Math.abs(bTime);
          return aTime - bTime;
        });
      }
      return list;
    },
    randomColors: function () {
      let color = randomColor({
          luminosity: 'dark',
          count: 5,
          format: 'rgb'
      });
      return color;
    },
    chartData: function () {
      let aboveHalfway = new Set();
      let aboutHalfyway = new Set();
      let almostDone = new Set();
      for (let i = 0; i < this.convertedList.length; i++) {
        let KB = this.convertedList[i];
        if(_.inRange(KB.currentStep, 0, Math.floor(KB.stages.length / 2)+0.1)) { aboveHalfway.add(KB._id); continue; }
        if(_.inRange(KB.currentStep, Math.floor(KB.stages.length / 2), Math.ceil(KB.stages.length / 2)+0.1)) { aboutHalfyway.add(KB._id); continue; }
        if(_.inRange(KB.currentStep, Math.ceil(KB.stages.length / 2), KB.stages.length+0.1)) { almostDone.add(KB._id); continue; }
      }
      return {
        aboveHalfway: aboveHalfway.size,
        aboutHalfyway: aboutHalfyway.size,
        almostDone: almostDone.size,
        series: [
          {
            name: '完成度不到一半',
            data: [aboveHalfway.size]
          }, {
            name: '完成度大約一半',
            data: [aboutHalfyway.size]
          }, {
            name: '接近完成的專案',
            data: [almostDone.size]
          }
        ],
        chartOptions: {
          chart: {
            type: 'bar',
            height: 200,
            stacked: true,
            stackType: '100%'
          },
          plotOptions: {
            bar: {
              horizontal: true,
            },
          },
          stroke: {
            width: 1,
            colors: ['#fff']
          },
          colors: randomColor({
            luminosity: 'dark',
            count: 3,
            format: 'rgb'
          }),
          title: {
            text: '目前顯示的所有專案的完成度'
          },
          xaxis: {
            categories: ['專案完成度'],
          },
          tooltip: {
            y: {
              formatter: function (val) {
                return val + "個知識點"
              }
            }
          },
          fill: {
            opacity: 1
          
          },
          legend: {
            position: 'top',
            horizontalAlign: 'left',
            offsetX: 40
          }
        }
      }
    },
    filterColor: function () {
      return this.selectedFilterTags.length > 0 || this.queryTerm !== '' || this.queryHistory === true ? '#B71C1C' : '#00B0FF';
    }
  },
  props: {
  },
  data () {
    return {
      showStatstics: false,
      latestCount: 1,
      currentKB: {
        _id: '',
        title: ''
      },
      versionComment: '',
      uploadprogress: 0,
      uploadstatus: '',
      versionW: false,
      versionPopulated: false,
      currentVersions: [],
      participantsDB: {
        proceedUsers: [],
        proceedKBs: [],
        statistics: []
      },
      youtubeW: false,
      participantW: false,
      versionFile: undefined,
      selectedpmKBs: [],
      pmtoolsBtns: false,
      queryTimer: null,
      queryHistory: false,
      tagFilterW: false,
      termFilterW: false,
      filterBtn: false,
      filterTags: [],
      queryTerm: '',
      selectedFilterTags: [],
      progressList: []
    };
  },
  beforeDestroy () {
    this.$socket.client.off('listDashBoard', this.socketlistDashBoard);
    this.$socket.client.off('participantStatstics', this.sockparticipantStatstics);
    this.$socket.client.off('getKBVersions', this.sockgetKBVersions);
    this.$socket.client.off('KBVersionUploadError', this.socketKBVersionUploadError);
    this.$socket.client.off('KBVersionDeleteError', this.socketKBVersionDeleteError);
    this.$socket.client.off('requestKBVersionSlice', this.socketrequestKBVersionSlice);
    this.$socket.client.off('KBVersionUploadDone', this.soketKBVersionUploadDone);
    this.$socket.client.off('getlatestVersions', this.soketgetlatestVersions);
    window.clearTimeout(this.queryTimer);
    this.queryTimer = null;
  },
  created () {
    this.$emit('viewIn', {
      text: 'DashBoard',
      icon: 'fa-tachometer-alt',
      module: '審查模組',
      location: '/userDashBoard'
    });
    this.$emit('timerOn', true);
    this.$emit('toastPop', 'DashBoard更新中');
    this.$socket.client.emit('listDashBoard');
    this.$socket.client.on('listDashBoard', this.socketlistDashBoard);
    this.$socket.client.on('participantStatstics', this.sockparticipantStatstics);
    this.$socket.client.on('getKBVersions', this.sockgetKBVersions);
    this.$socket.client.on('KBVersionUploadError', this.socketKBVersionUploadError);
    this.$socket.client.on('KBVersionDeleteError', this.socketKBVersionDeleteError);
    this.$socket.client.on('requestKBVersionSlice', this.socketrequestKBVersionSlice);
    this.$socket.client.on('KBVersionUploadDone', this.soketKBVersionUploadDone);
    this.$socket.client.on('getlatestVersions', this.soketgetlatestVersions);
  }
};
</script>
