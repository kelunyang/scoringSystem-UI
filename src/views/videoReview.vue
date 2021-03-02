<template>
    <v-main class='pa-0'>
      <v-dialog v-model='editlogw' fullscreen hide-overlay transition='dialog-bottom-transition'>
        <v-card>
          <v-toolbar dark color='primary'>
            <v-btn icon dark @click='editlogw = false'>
              <font-awesome-icon icon='times' />
            </v-btn>
            <v-toolbar-title>知識點影片完整歷程</v-toolbar-title>
          </v-toolbar>
          <v-virtual-scroll
            :items='versionLog'
            :item-height='50'
            height='550'
          >
            <template v-slot='{ item }'>
              <v-list-item>
                <v-list-item-content style='text-align: left'>
                  <v-list-item-title>[ {{ versionConvert(item.date) }} ] {{ dateConvert(item.date) }}</v-list-item-title>
                </v-list-item-content>
                <v-list-item-action>
                  <v-btn :disabled='versionConvert(item.date) === "當前版本"' @click='loadVersion(item)'>載入本版本並啟動比對</v-btn>
                </v-list-item-action>
              </v-list-item>
            </template>
          </v-virtual-scroll>
        </v-card>
      </v-dialog>
      <v-row>
          <v-col :xl='videoWidth' :lg='videoWidth' md='12' sm='12' xs='12'>
            <v-card ref='previewWindow'>
              <v-card-text class='pa-0'>
                <div ref='currentPlayerArea' class="compareComp">
                  <div ref='currentControler' style='display: flex; justify-content: flex-start'>
                    <v-tooltip top>
                      <template v-slot:activator="{ on, attrs }">
                          <v-btn
                              v-bind="attrs" v-on="on"
                              icon
                              color="light-blue darken-4"
                              @click='playVideo(0)'
                          >
                              <font-awesome-icon icon='play' />
                          </v-btn>
                      </template>
                      <span>播放影片</span>
                    </v-tooltip>
                    <v-tooltip top>
                      <template v-slot:activator="{ on, attrs }">
                          <v-btn
                              v-bind="attrs" v-on="on"
                              icon
                              color="light-blue darken-4"
                              @click='pauseVideo(0)'
                          >
                              <font-awesome-icon icon='stop' />
                          </v-btn>
                      </template>
                      <span>停止影片</span>
                    </v-tooltip>
                    <v-tooltip top>
                      <template v-slot:activator="{ on, attrs }">
                          <v-btn
                              v-bind="attrs" v-on="on"
                              icon
                              color="light-blue darken-4"
                              @click='decreasePlaybackrate(0)'
                          >
                              <font-awesome-icon icon='backward' />
                          </v-btn>
                      </template>
                      <span>減速播放</span>
                    </v-tooltip>
                    <v-tooltip top>
                      <template v-slot:activator="{ on, attrs }">
                          <v-btn
                              v-bind="attrs" v-on="on"
                              icon
                              color="light-blue darken-4"
                              @click='increasePlaybackrate(0)'
                          >
                              <font-awesome-icon icon='forward' />
                          </v-btn>
                      </template>
                      <span>加速撥放</span>
                    </v-tooltip>
                    <v-tooltip top>
                      <template v-slot:activator="{ on, attrs }">
                          <v-btn
                              v-bind="attrs" v-on="on"
                              icon
                              color="light-blue darken-4"
                          >
                              <font-awesome-icon icon='camera' />
                          </v-btn>
                      </template>
                      <span>擷取當前撥放畫面</span>
                    </v-tooltip>
                    <v-tooltip top>
                      <template v-slot:activator="{ on, attrs }">
                          <v-btn
                              v-bind="attrs" v-on="on"
                              icon
                              color="light-blue darken-4"
                          >
                              <font-awesome-icon icon='download' />
                          </v-btn>
                      </template>
                      <span>下載原始檔</span>
                    </v-tooltip>
                  </div>
                  <div class='dragBanner' style='left: 2px'>[當前]{{ dateConvert(currentVersion.date) }}</div>
                  <video ref='currentPlayer' class='video-js'></video>
                </div>
                <div ref='previousPlayerArea' class="compareComp" style='clip-path: inset( 0 0 0 100% )'>
                  <div ref='previousControler' style='display: flex; justify-content: flex-end'>
                    <v-tooltip top>
                      <template v-slot:activator="{ on, attrs }">
                          <v-btn
                              v-bind="attrs" v-on="on"
                              icon
                              color="red darken-4"
                              @click='playVideo(1)'
                          >
                              <font-awesome-icon icon='play' />
                          </v-btn>
                      </template>
                      <span>播放影片</span>
                    </v-tooltip>
                    <v-tooltip top>
                      <template v-slot:activator="{ on, attrs }">
                          <v-btn
                              v-bind="attrs" v-on="on"
                              icon
                              color="red darken-4"
                              @click='pauseVideo(1)'
                          >
                              <font-awesome-icon icon='stop' />
                          </v-btn>
                      </template>
                      <span>停止影片</span>
                    </v-tooltip>
                    <v-tooltip top>
                      <template v-slot:activator="{ on, attrs }">
                          <v-btn
                              v-bind="attrs" v-on="on"
                              icon
                              color="red darken-4"
                              @click='decreasePlaybackrate(1)'
                          >
                              <font-awesome-icon icon='backward' />
                          </v-btn>
                      </template>
                      <span>減速播放</span>
                    </v-tooltip>
                    <v-tooltip top>
                      <template v-slot:activator="{ on, attrs }">
                          <v-btn
                              v-bind="attrs" v-on="on"
                              icon
                              color="red darken-4"
                              @click='increasePlaybackrate(1)'
                          >
                              <font-awesome-icon icon='forward' />
                          </v-btn>
                      </template>
                      <span>加速撥放</span>
                    </v-tooltip>
                    <v-tooltip top>
                      <template v-slot:activator="{ on, attrs }">
                          <v-btn
                              v-bind="attrs" v-on="on"
                              icon
                              color="red darken-4"
                          >
                              <font-awesome-icon icon='camera' />
                          </v-btn>
                      </template>
                      <span>擷取當前撥放畫面</span>
                    </v-tooltip>
                    <v-tooltip top>
                      <template v-slot:activator="{ on, attrs }">
                          <v-btn
                              v-bind="attrs" v-on="on"
                              icon
                              color="red darken-4"
                          >
                              <font-awesome-icon icon='download' />
                          </v-btn>
                      </template>
                      <span>下載原始檔</span>
                    </v-tooltip>
                  </div>
                  <div class='dragBanner' style='right: 2px'>[舊版]{{ dateConvert(previousVersion.date) }}</div>
                  <video ref='previousPlayer' class='video-js'></video>
                </div>
                <div ref='compareBar' class='compareBar'>
                  <div ref='compareBtnC'>
                    <v-btn icon ref='compareBtn' class='compareBtn' draggable="true" @touchmove.prevent='checkDrag' @touchend.prevent='checkDrag' @dragend.prevent='checkDrag' @drag.prevent="checkDrag">
                      <font-awesome-icon icon='arrows-alt-h' />
                    </v-btn>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col :xl='controlWidth' :lg='controlWidth' md='12' sm='12' xs='12'>
            <v-main class='pa-0'>
              <v-row>
                <v-col class='pa-0 d-flex flex-column'>
                  <div ref='btnPanel' class='d-flex flex-column'>
                    <v-btn
                      dark
                      @click='extendIssue'
                      color='primary'
                      class='mt-2 mb-2'
                    >
                      {{ extenWord }}
                    </v-btn>
                    <v-btn
                      dark
                      @click='editlogw = true'
                      color='primary'
                      class='mt-2 mb-2'
                    >
                      查看版本編輯紀錄
                    </v-btn>
                  </div>
                  <div ref='controlPanel' class='controlPanel' v-if='hideControl'>
                    <div class='infoItem'>
                      <div class='infoIcon'><font-awesome-icon size='1x' icon='calendar-alt' /></div>
                      <div class='infoText'>到期日期： 2020/10/19 14:20</div>
                    </div>
                    <div class='infoItem'>
                      <div class='infoIcon'><font-awesome-icon size='1x' icon='bug' /></div>
                      <div class='infoText'>
                        Issues:
                        <font-awesome-icon icon='check-circle' size='1x' />
                        {{ issuestatisticsConvert(issues).close.length }}
                        <font-awesome-icon icon='exclamation-circle' size='1x' />
                        {{ issuestatisticsConvert(issues).open.length }}
                      </div>
                    </div>
                    <v-autocomplete
                        v-model="selectedTags"
                        :items="editTags"
                        chips
                        clearable
                        label="請輸入標籤"
                        multiple
                        prepend-icon="fab fa-slack-hash"
                        solo
                        :search-input.sync="newEditTag"
                    >
                    <template v-slot:selection="data">
                        <v-chip
                            v-bind="data.attrs"
                            :input-value="data.selected"
                            close
                            close-icon="fa-times"
                            @click="data.select"
                            @click:close="removeTag(data.item)"
                        >
                            <strong>{{ data.item }}</strong>&nbsp;
                        </v-chip>
                    </template>
                    </v-autocomplete>
                  </div>
                  <v-menu offset-y :close-on-content-click="false" v-model='issuePop' :max-width="issueBtnWidth">
                    <template v-slot:activator='{ on, attrs }'>
                        <v-btn
                            color='red darken-4'
                            dark
                            v-bind='attrs'
                            v-on='on'
                            @click='addIssue'
                            ref='issueBtn'
                        >
                        我要提出issue！
                        </v-btn>
                    </template>
                    <v-card>
                        <v-card-title>提出新的Issue</v-card-title>
                        <v-card-text>
                          <span class='text-caption'>當前位置： {{ currentPosD }} （系統自動註記，無須輸入）</span>
                          <span class='text-caption red--text'>請注意，您只需要描述當前的issue，就算是同一個時間，也請一案歸一案，有利專案流程順暢</span>
                          <v-text-field label='請輸入Issue標題'></v-text-field>
                          <v-textarea label='請描述issue內容' hint='如對某個詞要加重描述，可以用 *加粗* ，如果要編號等特殊功能，請在這些詞組後面都補上一個空格，系統之後會自動轉換，例如1. 第一項'></v-textarea>
                          <v-file-input prepend-icon='fa-paperclip' multiple label='輔助說明文件／圖片上傳'></v-file-input>
                        </v-card-text>
                        <v-card-actions>
                          <v-btn @click='issuePop = false'>送出issue</v-btn>
                        </v-card-actions>
                    </v-card>
                  </v-menu>
                </v-col>
              </v-row>
              <v-row>
                <v-col class='pa-0 pt-5 ma-0'>
                  <v-sheet :height='displaypanelHeight' class='overflow-y-auto pa-0 ma-0'>
                    <v-expansion-panels multiple focusable accordion v-model='issuelistViewer'>
                      <v-expansion-panel v-for='item in issues' :key='item.id + item.tick'>
                        <v-expansion-panel-header @click='timeForward(item)'>
                          <template v-slot:actions>
                            <font-awesome-icon :icon='statusConvert(item.status)' class='fa-2x' />
                          </template>
                          <v-main no-gutters class='pa-0'>
                            <v-row no-gutters class='text-caption'>
                              <v-col>
                                <font-awesome-icon icon='user' size='1x' />
                                {{ editorConvert(item.dialogs) }}
                                <font-awesome-icon icon='hourglass' size='1x' />
                                {{ timeConvert(item.timestamp) }}
                                <font-awesome-icon icon='history' size='1x' />
                                <v-tooltip top>
                                  <template v-slot:activator="{ on, attrs }">
                                      <span v-bind="attrs" v-on="on">
                                        {{ versionConvert(item.version) }}
                                      </span>
                                  </template>
                                  <span>{{ dateConvert(item.version) }}</span>
                                </v-tooltip>
                              </v-col>
                            </v-row>
                            <v-row no-gutters>
                              <v-col class='text-body-1'>
                                <div>{{ item.title }}</div>
                              </v-col>
                            </v-row>
                          </v-main>
                        </v-expansion-panel-header>
                        <v-expansion-panel-content>
                          <v-timeline dense>
                            <v-timeline-item>
                              <template v-slot:icon>
                                <v-avatar>
                                  <img src='https://avatars.dicebear.com/api/male/mrx.svg'>
                                </v-avatar>
                              </template>
                              <v-textarea
                                label='請輸入您的意見'
                                hint='如果您只是想關閉這個issue，直接按下面的關閉issue按鈕即可'
                              ></v-textarea>
                              <v-btn>
                                送出回復
                              </v-btn>
                              <v-btn>
                                關閉issue
                              </v-btn>
                            </v-timeline-item>
                            <v-timeline-item v-for='dialog in item.dialogs' :key='dialog.id + dialog.tick'>
                              <template v-slot:icon>
                                <v-avatar>
                                  <img :src='dialog.ava'>
                                </v-avatar>
                              </template>
                              <v-row justify="space-between">
                                <v-col cols="7" class='text-left'>
                                  <div class='text-subtitle-2 font-weight-bold text-decoration-underline'> {{ dialog.name }} </div>
                                  <div class='text-body-2'> {{ dialog.body }} </div>
                                  <div class='text-caption'>附件下載（點此）</div>
                                </v-col>
                                <v-col class="text-right text-overline" cols="5">
                                  {{ dateConvert(dialog.tick) }}
                                </v-col>
                              </v-row>
                            </v-timeline-item>
                          </v-timeline>
                        </v-expansion-panel-content>
                      </v-expansion-panel>
                    </v-expansion-panels>
                  </v-sheet>
                </v-col>
              </v-row>
            </v-main>
          </v-col>
      </v-row>
    </v-main>
</template>

<style scoped>
  .infoItem {
    display: flex;
    flex-direction: row;
    font-size: 1.3em;
    margin: 3px;
  }
  .infoText {
    padding-left: 10px;
  }
  .compareBar {
    border-left: 2px solid #707070;
    position: absolute;
    top: 0px;
    left: 0px;
    display: flex;
    align-items: center;
  }
  .compareBtn {
    cursor: grab;
  }
  .dragBanner {
    position: absolute;
    border: 2px solid white;
    padding: 10px;
    bottom: 2%;
    background-color: rgba(0, 0, 0, 0.7);
    display: none;
    z-index: 1000;
    color: white;
    font-size: 2em;
  }
  .controlPanel {
    display: flex;
    flex-direction: column;
  }
</style>

<script>
// @ is an alias to /src
import Vue from 'vue';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas, faVideo } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import moment from 'moment';
import momentDurationFormatSetup from 'moment-duration-format';
import videojs from 'video.js';
import { randomColor } from 'randomcolor';
import 'video.js/dist/video-js.css';
import '@fortawesome/fontawesome-free/css/all.css';

momentDurationFormatSetup(moment);
library.add(fas, faVideo);
Vue.component('font-awesome-icon', FontAwesomeIcon);
Vue.config.productionTip = false;

export default {
  name: 'videoReview',
  components: {
  },
  methods: {
    closeLog: function () {
      let oriobj = this;
      this.previousPlayer = videojs(this.$refs.previousPlayer, this.videoOptions, function onPlayerReady () {
        this.on('loadedmetadata', function () {
          this.pause();
          oriobj.$refs.previousPlayerArea.style.clipPath = 'inset( 0 0 0 50% )';
          oriobj.$refs.currentPlayerArea.style.clipPath = 'inset( 0 50% 0 0 )';
          oriobj.$refs.compareBar.style.left = '50%';
          oriobj.editlogw = false;
        });
      });
    },
    loadVersion: function (item) {
      this.previousVersion = item;
      this.previousPlayer.src({
        type: 'video/mp4',
        src: 'https://vr.zlsh.tp.edu.tw/storages/' + item.filename
      });
      this.closeLog();
    },
    checkDrag: function (event) {
      let clientX = event.type.includes('touch') ? event.touches[0].clientX : event.clientX;
      let currentComparePos = ((clientX - this.$refs.currentPlayerArea.offsetLeft) / this.$refs.currentPlayerArea.clientWidth) * 100;
      currentComparePos = currentComparePos < 0 ? 0 : currentComparePos > 100 ? 100 : currentComparePos;
      let reverseComparePos = 100 - currentComparePos;
      this.$refs.previousPlayerArea.style.clipPath = 'inset( 0 0 0 ' + currentComparePos + '% )';
      this.$refs.currentPlayerArea.style.clipPath = 'inset( 0 ' + reverseComparePos + '% 0 0 )';
      this.$refs.compareBar.style.left = currentComparePos + '%';
      let banners = document.querySelectorAll('.dragBanner');
      if (event.type === 'drag' || event.type === 'touchmove') {
        banners.forEach((element) => {
          element.style.display = 'block';
        });
      } else {
        banners.forEach((element) => {
          element.style.display = 'none';
        });
      }
    },
    tagColor: function (k) {
        return this.randomColors[k];
    },
    removeTag: function (name) {
      this.selectedTags = this.selectedTags.filter((item) => {
        return item !== name;
      });
    },
    iconConverter: function (type) {
      return type === 0 ? 'robot' : 'user-edit';
    },
    addIssue: function () {
      if (!this.issuePop) {
        this.player.pause();
      }
      this.issuePop = true;
    },
    timeForward: function (item) {
      let oriobj = this;
      if (item.version === this.currentVersion.date) {
        this.player.currentTime(item.timestamp);
        this.player.pause();
      } else {
        this.previousVersion = this.versionLog.find((version) => {
          return version.date === item.version;
        });
        this.previousPlayer.src({
          type: 'video/mp4',
          src: 'https://vr.zlsh.tp.edu.tw/storages/' + oriobj.previousVersion.filename
        });
        this.previousPlayer = videojs(this.$refs.previousPlayer, this.videoOptions, function onPlayerReady () {
          this.on('loadedmetadata', function () {
            this.currentTime(item.timestamp);
            this.pause();
            oriobj.$refs.previousPlayerArea.style.clipPath = 'inset( 0 0 0 50% )';
            oriobj.$refs.currentPlayerArea.style.clipPath = 'inset( 0 50% 0 0 )';
            oriobj.$refs.compareBar.style.left = '50%';
          });
        });
      }
    },
    increasePlaybackrate: function (type) {
      let player = type === 0 ? this.player : this.previousPlayer;
      this.playbackrate = this.playbackrate < 1.5 ? this.playbackrate + 0.5 : 2;
      player.playbackRate(this.playbackrate);
    },
    decreasePlaybackrate: function (type) {
      let player = type === 0 ? this.player : this.previousPlayer;
      this.playbackrate = this.playbackrate > -1.5 ? this.playbackrate - 0.5 : -2;
      player.playbackRate(this.playbackrate);
    },
    playVideo: function (type) {
      let player = type === 0 ? this.player : this.previousPlayer;
      player.play();
    },
    pauseVideo: function (type) {
      let player = type === 0 ? this.player : this.previousPlayer;
      if (player.paused()) {
        player.currentTime(0);
      } else {
        player.pause();
      }
    },
    timeConvert: function (time) {
      return moment.duration(time, 'second').format('mm分ss秒SS');
    },
    dateConvert: function (time) {
      return moment.unix(time).format('YYYY/MM/DD HH:mm:ss');
    },
    statusConvert: function (status) {
      switch (status) {
        case 0:
          return 'exclamation-circle';
        case 1:
          return 'check-circle';
      }
    },
    versionConvert: function (version) {
      return version === this.currentVersion.date ? '當前版本' : '歷史版本';
    },
    editorConvert: function (dialog) {
      dialog = [...dialog].sort((a, b) => {
        return a.tick - b.tick;
      });
      return dialog[0].name;
    },
    issuestatisticsConvert: function (dialog) {
      let openissues = [...dialog].filter((item) => {
        return item.status === 0;
      });
      let closeissues = [...dialog].filter((item) => {
        return item.status === 1;
      });
      return {
        open: openissues,
        close: closeissues
      };
    },
    extendIssue: function () {
      if (this.videoWidth === 3) {
        this.videoWidth = 9;
        this.controlWidth = 3;
        this.extenWord = '放大Issue區';
        this.hideControl = true;
      } else {
        this.videoWidth = 3;
        this.controlWidth = 9;
        this.extenWord = '縮小Issue區';
        this.hideControl = false;
      }
    }
  },
  created () {
    this.$emit('viewIn', {
      text: '影片審查：太陽餅裡沒有太陽',
      icon: faVideo
    });
  },
  mounted () {
    let oriobj = this;
    this.previousVersion = this.currentVersion;
    this.player = videojs(this.$refs.currentPlayer, this.videoOptions, function onPlayerReady () {
      this.src({
        type: 'video/mp4',
        src: 'https://vr.zlsh.tp.edu.tw/storages/' + oriobj.currentVersion.filename
      });
      this.on('timeupdate', function () {
        oriobj.currentPos = this.currentTime();
      });
      this.on('playing', function () {
        oriobj.tipword = '提示：影片開始撥放時，右側issue區塊會同步展開當前時間對應的issue';
      });
    });
    this.previousPlayer = videojs(this.$refs.previousPlayer, this.videoOptions, function onPlayerReady () {
      this.src({
        type: 'video/mp4',
        src: 'https://vr.zlsh.tp.edu.tw/storages/' + oriobj.previousVersion.filename
      });
      this.on('loadedmetadata', function () {
        oriobj.displaypanelHeight = window.innerHeight - oriobj.$refs.controlPanel.clientHeight - oriobj.$refs.btnPanel.clientHeight - oriobj.$refs.issueBtn.$el.clientHeight;
        oriobj.issueBtnWidth = oriobj.$refs.issueBtn.$el.clientWidth;
        oriobj.$refs.previousPlayerArea.style.marginTop = ((this.currentHeight() + oriobj.$refs.previousControler.clientHeight) * (-1)) + 'px';
        oriobj.$refs.compareBar.style.height = (this.currentHeight() + oriobj.$refs.previousControler.clientHeight) + 'px';
        oriobj.$refs.compareBar.style.left = '100%';
        oriobj.$refs.compareBtnC.style.marginLeft = (oriobj.$refs.compareBtn.$el.clientWidth / 2 * -1) - 1 + 'px';
      });
      this.on('playerresize', function () {
        let controlHeight = oriobj.hideControl ? oriobj.$refs.controlPanel.clientHeight : 0;
        oriobj.displaypanelHeight = window.innerHeight - controlHeight - oriobj.$refs.btnPanel.clientHeight - oriobj.$refs.issueBtn.$el.clientHeight;
        oriobj.issueBtnWidth = oriobj.$refs.issueBtn.$el.clientWidth;
        oriobj.$refs.previousPlayerArea.style.marginTop = ((this.currentHeight() + oriobj.$refs.previousControler.clientHeight) * (-1)) + 'px';
        oriobj.$refs.compareBar.style.height = (this.currentHeight() + oriobj.$refs.previousControler.clientHeight) + 'px';
      });
    });
  },
  beforeDestroy () {
    if (this.player) {
        this.player.dispose();
    }
  },
  computed: {
    currentVersion: function () {
      return this.versionLog[0];
    },
    currentPosD: function () {
      return this.timeConvert(this.currentPos);
    },
    randomColors: function () {
      let color = randomColor({
          luminosity: 'dark',
          count: this.editTags.length,
          format: 'rgb'
      });
      return color;
    },
    editTags: function () {
      if (this.newEditTag === '' || this.newEditTag === undefined || this.newEditTag === null) {
        return [...new Set([...this.selectedTags, ...this.savedEditTags])];
      } else {
        return [...new Set([this.newEditTag, ...this.selectedTags, ...this.savedEditTags])];
      }
    }
  },
  watch: {
    currentPos: function () {
      let oriobj = this;
      let flag = false;
      let result = this.issues.filter((item, index, array) => {
        if (item.version === this.currentVersion.date) {
          if (Math.abs(Math.floor(item.timestamp) - Math.floor(oriobj.currentPos)) < 10) {
            flag = true;
            return true;
          } else {
            return false;
          }
        } else {
          return false;
        }
      }).map((item, index, array) => {
        return item.id;
      });
      this.issuelistViewer = flag ? result : [];
    },
    versionLog: function () {
      this.versionLog.sort((a, b) => {
        return b.date - a.date;
      });
      return this.versionLog;
    }
  },
  data () {
    return {
      hideControl: true,
      videoWidth: 9,
      controlWidth: 3,
      extenWord: '放大Issue區',
      previousVersion: {
        filename: 'testvideo.mp4',
        date: 1602779000
      },
      issueBtnWidth: 200,
      previousPlayer: undefined,
      issuePop: false,
      newEditTag: '',
      tipword: '',
      displaypanelHeight: 0,
      player: null,
      player1: null,
      playbackrate: 1,
      currentPos: 0,
      editlogw: false,
      issuelistViewer: [],
      robotTags: [ '死線快到啦！', '還有Issue未解' ],
      selectedTags: [ '廠商看這裡不要再踩雷了' ],
      savedEditTags: [ '廠商看這裡不要再踩雷了', '這是個測試標籤' ],
      versionLog: [
        {
          date: 1610696183,
          filename: 'testvideo.mp4'
        },
        {
          date: 1610686183,
          filename: 'testvideo1.mp4'
        },
        {
          date: 1610692183,
          filename: 'testvideo2.mp4'
        }
      ],
      issues: [
        {
          status: 0,
          id: 0,
          tick: 1610697283,
          timestamp: 130.491637,
          version: 1610696183,
          title: '我是Issue，點我，會快進到我對應的時間點',
          dialogs: [
            {
              tick: 1602778220,
              id: 1,
              name: 'X博士',
              body: '圖畫里，龍不吟虎不嘯，小小書童可笑可笑！',
              ava: 'https://avatars.dicebear.com/api/male/mrx.svg'
            },
            {
              tick: 1602779000,
              id: 2,
              name: 'A廠商',
              body: '棋盤裡，車無論馬無疆，道聲將軍提防提防！',
              ava: 'https://avatars.dicebear.com/api/female/mra.svg'
            },
            {
              tick: 1602782000,
              id: 3,
              name: '中心PM A',
              body: '十口心思，思君思國思社稷',
              ava: 'https://avatars.dicebear.com/api/male/pmb.svg'
            },
            {
              tick: 1603016056,
              id: 4,
              name: '均一PM A',
              body: '八目共賞，賞花賞月賞秋香',
              ava: 'https://avatars.dicebear.com/api/female/pma.svg'
            },
            {
              tick: 1603017050,
              id: 4,
              name: '機器人巡邏',
              body: '這個動作的截止時間還剩2天！',
              ava: 'https://avatars.dicebear.com/api/bottts/bot.svg'
            }
          ]
        },
        {
          status: 0,
          id: 1,
          tick: 1610687183,
          timestamp: 130.491637,
          version: 1610686183,
          title: '同時間的issue，在時間軸到的時候會同步展開',
          dialogs: [
            {
              tick: 1602778220,
              id: 1,
              name: 'X博士',
              body: '一鄉二里，共三夫子不識四書五經六義，竟敢教七八九子，十分大膽。',
              ava: 'https://avatars.dicebear.com/api/male/mrx.svg'
            },
            {
              tick: 1602779000,
              id: 2,
              name: 'A廠商',
              body: '十室九貧，湊得八兩七錢六分五毫四厘，尚且又三心二意，一等下流。',
              ava: 'https://avatars.dicebear.com/api/female/mra.svg'
            },
            {
              tick: 1602782000,
              id: 3,
              name: '中心PM A',
              body: '鶯鶯燕燕翠翠紅紅處處融融洽洽。',
              ava: 'https://avatars.dicebear.com/api/male/pmb.svg'
            },
            {
              tick: 1603016056,
              id: 4,
              name: '均一PM A',
              body: '雨雨風風花花葉葉年年暮暮朝朝。',
              ava: 'https://avatars.dicebear.com/api/female/pma.svg'
            },
            {
              tick: 1603017050,
              id: 4,
              name: '機器人巡邏',
              body: '這個動作的截止時間還剩1天！',
              ava: 'https://avatars.dicebear.com/api/bottts/bot.svg'
            }
          ]
        },
        {
          status: 0,
          id: 2,
          tick: 1611692183,
          timestamp: 28.491637,
          title: '再來一條',
          version: 1610692183,
          dialogs: [
            {
              tick: 1602778220,
              id: 1,
              name: 'X博士',
              body: '沒詪了，就這樣吧',
              ava: 'https://avatars.dicebear.com/api/male/mrx.svg'
            }
          ]
        },
        {
          status: 1,
          id: 3,
          tick: 1610686983,
          timestamp: 90.491637,
          title: '這是一個被關閉的issue',
          version: 1610686183,
          dialogs: [
            {
              tick: 1602778220,
              id: 1,
              name: 'X博士',
              body: '都被關了你還看！',
              ava: 'https://avatars.dicebear.com/api/male/mrx.svg'
            },
            {
              tick: 1602779000,
              id: 2,
              name: '均一PM A',
              body: '我關的',
              ava: 'https://avatars.dicebear.com/api/female/mra.svg'
            },
            {
              tick: 1602779000,
              id: 4,
              name: '機器人登記',
              body: '均一PM A關閉了這個issue',
              ava: 'https://avatars.dicebear.com/api/bottts/bot.svg'
            }
          ]
        }
      ],
      videoOptions: {
        autoplay: false,
        controls: true,
        fluid: true,
        sources: [
          {
            src:
              'https://vr.zlsh.tp.edu.tw/storages/testvideo.mp4',
              type: 'video/mp4'
          }
        ]
      }
    };
  }
};
</script>
