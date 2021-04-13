<template>
    <v-main class='pa-0'>
      <v-dialog v-model='editMsgW' fullscreen hide-overlay transition='dialog-bottom-transition'>
        <v-card>
            <v-toolbar dark color='primary'>
              <v-btn icon dark @click='editMsgW = false'>
                <v-icon>fa-times</v-icon>
              </v-btn>
              <v-toolbar-title>編輯公告</v-toolbar-title>
              <v-spacer></v-spacer>
              <v-toolbar-items>
                <v-btn
                  dark
                  text
                  @click='saveMsg'
                >
                  <v-icon>{{ msgsaveIcon }}</v-icon>
                  {{ msgsaveBtn }}
                </v-btn>
              </v-toolbar-items>
            </v-toolbar>
            <v-card-text class='ma-0 pa-0'>
              <v-alert type="info" icon="fa-exclamation-circle">
                請注意，首頁只會顯示各類型公告各一則
              </v-alert>
              <v-container>
                <v-row>
                  <v-col class='d-flex flex-column'>
                    <v-switch
                      v-model="message.status"
                      :label="msgstatusConverter(message.status)"
                    ></v-switch>
                    <v-select
                      :items="messageType"
                      solo
                      label="請選擇訊息類型"
                      item-text='text'
                      item-value="value"
                      v-model='message.type'
                    ></v-select>
                    <v-text-field label='公告標題' v-model='message.title'></v-text-field>
                    <tiptap-vuetify
                      class='text-left'
                      v-model="message.body"
                      :extensions="extensions"
                      min-height="10vh"
                      max-height="20vh"
                      placeholder='請不要留白'
                    />
                    <v-file-input prepend-icon="fa-paperclip" v-model="msgFile" label='輔助說明文件／圖片上傳' :loading="uploadprogress !== 0">
                      <template v-slot:progress>
                        <v-progress-circular :value="uploadprogress"></v-progress-circular>速度：{{ uploadstatus }}
                      </template>
                    </v-file-input>
                    <div v-if="message.attachments.length > 0" class='d-flex flex-row flex-wrap'>
                      <v-chip
                        v-for='file in message.attachments'
                        :key="file._id"
                        class="ma-2"
                        close
                        close-icon="fa-times"
                        @click:close="deleteMsgFile(file)"
                        @click="downloadFile(file)"
                      >
                        {{ file.name }} ({{ byteConvert(file.size) }})
                      </v-chip>
                    </div>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>
        </v-card>
      </v-dialog>
      <v-dialog v-model='lineW' fullscreen hide-overlay transition='dialog-bottom-transition'>
        <v-card>
            <v-toolbar dark color='primary'>
              <v-btn icon dark @click='lineW = false'>
                <v-icon>fa-times</v-icon>
              </v-btn>
              <v-toolbar-title>LINE訊息紀錄</v-toolbar-title>
            </v-toolbar>
            <v-card-text class='pa-0 ma-0'>
              <v-alert type="info" icon="fa-exclamation-circle">
                這裡只是保存歷史訊息供你回味，你無法刪除，也無法修改，發生過了就是發生過了
              </v-alert>
              <v-skeleton-loader
                class="mx-auto"
                type="card"
                width="100%"
                v-if='!LINEListPopulated'
              ></v-skeleton-loader>
              <v-sheet v-show='LINEListPopulated' class='pa-0'>
                <v-expansion-panels focusable accordion v-model='LINEExpanded' class='pa-0'>
                  <v-expansion-panel v-for='item in lineLog' :key='"line" + item._id'>
                    <v-expansion-panel-header expand-icon="fa-chevron-down">
                      <div>
                        [ {{ dateConvert(item.tick) }}] {{ item.body }}
                      </div>
                    </v-expansion-panel-header>
                    <v-expansion-panel-content>
                      <v-simple-table>
                        <template v-slot:default>
                          <thead>
                            <tr>
                              <th class="text-left">
                                發送狀態
                              </th>
                              <th class="text-left">
                                發送日期
                              </th>
                              <th class="text-left">
                                收件者
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr
                              v-for="message in item.log"
                              :key="message._id"
                            >
                              <td>
                                <v-icon v-if='message.status === 1'>fa-check</v-icon>
                                <v-icon v-if='message.status !== 1'>fa-times</v-icon>
                              </td>
                              <td>{{ dateConvert(message.tick) }}</td>
                              <td>{{ message.uid.name }}</td>
                            </tr>
                          </tbody>
                        </template>
                      </v-simple-table>
                    </v-expansion-panel-content>
                  </v-expansion-panel>
                </v-expansion-panels>
              </v-sheet>
            </v-card-text>
        </v-card>
      </v-dialog>
      <v-dialog v-model='broadcastW' fullscreen hide-overlay transition='dialog-bottom-transition'>
        <v-card>
            <v-toolbar dark color='primary'>
              <v-btn icon dark @click='broadcastW = false'>
                <v-icon>fa-times</v-icon>
              </v-btn>
              <v-toolbar-title>全域廣播紀錄</v-toolbar-title>
            </v-toolbar>
            <v-card-text class='pa-0 ma-0'>
              <v-alert type="info" icon="fa-exclamation-circle">
                這裡只是保存歷史訊息供你回味，你無法刪除，也無法修改，發生過了就是發生過了
              </v-alert>
              <v-skeleton-loader
                class="mx-auto"
                type="card"
                width="100%"
                v-if='!broadcastListPopulated'
              ></v-skeleton-loader>
              <v-sheet v-show='broadcastListPopulated' class='pa-0'>
                <v-expansion-panels focusable accordion v-model='broadcastExpanded' class='pa-0'>
                  <v-expansion-panel v-for='item in broadcastLog' :key='item._id'>
                    <v-expansion-panel-header expand-icon="fa-chevron-down">
                      <div>
                        [ {{ item.sender.name }} @ {{ dateConvert(item.tick) }}] {{ item.title }}
                      </div>
                    </v-expansion-panel-header>
                    <v-expansion-panel-content>
                      {{ item.body }}
                    </v-expansion-panel-content>
                  </v-expansion-panel>
                </v-expansion-panels>
              </v-sheet>
            </v-card-text>
        </v-card>
      </v-dialog>
      <v-row>
          <v-col class='d-flex flex-column'>
            <div class='text-h5 text-center pt-5 font-weight-black'>全域廣播</div>
            <v-divider inset></v-divider>
            <div class='red--text text-caption'>提示：全域廣播只有目前正在使用的人會看到</div>
            <v-text-field label='公告標題' v-model='broadcastTitle'></v-text-field>
            <tiptap-vuetify
              class='text-left'
              v-model="broadcastBody"
              :extensions="extensions"
              min-height="10vh"
              max-height="20vh"
              placeholder='請不要留白'
            />
            <v-btn @click='sendBroadcast' class='ma-3'>
                發出全域廣播
            </v-btn>
            <v-btn @click='openbroadcastHistory' class='ma-3'>
              全域廣播發送紀錄
            </v-btn>
          </v-col>
      </v-row>
      <v-row>
          <v-col class='d-flex flex-column'>
            <div class='text-h5 text-center pt-5 font-weight-black'>LINE Notify</div>
            <v-divider inset></v-divider>
            <v-textarea
              solo
              v-model="LINEbody"
              class='text-left'
              placeholder='請不要留白'
            ></v-textarea>
            <v-btn @click='sendLINEnotify' class='ma-3'>
              發出LINE通知
            </v-btn>
            <v-btn @click='openLINEHistory' class='ma-3'>
              LINE notify發送紀錄
            </v-btn>
          </v-col>
      </v-row>
      <v-row>
          <v-col class='d-flex flex-column'>
            <div class='text-h5 pl-10 font-weight-black'>登入頁消息公告</div>
            <v-divider inset></v-divider>
            <v-btn @click="newMessage" class='ma-3'>
              新增訊息
            </v-btn>
            <v-skeleton-loader
              class="mx-auto"
              type="card"
              width="100%"
              v-if='!histroyListPopulated'
            ></v-skeleton-loader>
            <div v-if='histroyListPopulated'>
              <span v-if='messageList.length === 0' class='text-body-1 text-center'>
                沒有舊的公告
              </span>
              <v-simple-table v-show="messageList.length > 0">
                <template v-slot:default>
                  <thead>
                    <tr>
                      <th class="text-left">
                        公告種類
                      </th>
                      <th class="text-left">
                        發送日期
                      </th>
                      <th class="text-left">
                        公告標題
                      </th>
                      <th class="text-left">
                        &nbsp;
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="message in messageList"
                      :key="message._id"
                    >
                      <td class="text-left">
                        <span v-if='message.type === 0'>普通</span>
                        <span v-if='message.type === 1'>設備</span>
                        <span v-if='message.type === 2'>緊急</span>
                        (
                        <span v-if='message.status'>顯示</span>
                        <span v-if='!message.status'>隱藏</span>
                        )
                      </td>
                      <td class="text-left">{{ dateConvert(message.tick) }}</td>
                      <td class="text-left">{{ message.title }}</td>
                      <td>
                        <v-btn outlined icon @click='editMsg(message._id)'>
                          <v-icon>fa-pencil-alt</v-icon>
                        </v-btn>
                        <v-btn outlined icon @click='removeMsg(message._id)'>
                          <v-icon>fa-trash-alt</v-icon>
                        </v-btn>
                      </td>
                    </tr>
                  </tbody>
                </template>
              </v-simple-table>
            </div>
          </v-col>
      </v-row>
    </v-main>
</template>

<style scoped>
.tiptap-vuetify-editor .ProseMirror {
  min-height: 100px;
  max-height: 200px;
}
</style>

<script>
// @ is an alias to /src
import Vue from 'vue';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faCog, faBomb, faRobot, faCommentDots } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';
import prettyBytes from 'pretty-bytes';
import TurndownService from 'turndown';
import marked from 'marked';
import { TiptapVuetify, Heading, Bold, Italic, Strike, Underline, Code, Paragraph, BulletList, OrderedList, ListItem, Link, Blockquote, HardBreak, HorizontalRule, History } from 'tiptap-vuetify';
import 'tiptap-vuetify/dist/main.css';

import '@fortawesome/fontawesome-free/css/all.css';
library.add(faCog, faBomb, faRobot, faCommentDots);
Vue.component('font-awesome-icon', FontAwesomeIcon);
let files = [];

const turndownService = new TurndownService();

export default {
  name: 'messageMgnt',
  components: { TiptapVuetify },
  beforeDestroy () {
    this.$socket.client.off('getMessages', this.socketgetMessages);
    this.$socket.client.off('msgFileUploadDone', this.soketmsgFileUploadDone);
    this.$socket.client.off('getmsgAttachment', this.socketgetmsgAttachment);
    this.$socket.client.off('getMessage', this.socketgetMessage);
    this.$socket.client.off('removeMessage', this.socketremoveMessage);
    this.$socket.client.off('msgFileUploadError', this.socketmsgFileUploadError);
    this.$socket.client.off('msgFileDeleteError', this.socketFileDeleteError);
    this.$socket.client.off('requestMsgSlice', this.socketrequestMsgSlice);
    this.$socket.client.off('getLINElog', this.socketgetLINElog);
    this.$socket.client.off('getbroadcastLog', this.socketgetbroadcastLog);
    this.$socket.client.off('sendLINEnotify', this.socketLINEnotify);
    this.$socket.client.off('removeMessageError', this.socketremoveMessageError);
    this.$socket.client.off('addMsg', this.socketaddMsg);
    this.$socket.client.off('saveMessage', this.socketsaveMessage);
  },
  created () {
    this.$emit('viewIn', {
      text: '系統訊息管理',
      icon: 'fa-comment-dots',
      module: '訊息模組',
      location: '/messageMgnt'
    });
    this.$socket.client.emit('getMessages');
    this.$socket.client.on('getMessages', this.socketgetMessages);
    this.$socket.client.on('msgFileUploadDone', this.soketmsgFileUploadDone);
    this.$socket.client.on('getmsgAttachment', this.socketgetmsgAttachment);
    this.$socket.client.on('getMessage', this.socketgetMessage);
    this.$socket.client.on('removeMessage', this.socketremoveMessage);
    this.$socket.client.on('msgFileUploadError', this.socketmsgFileUploadError);
    this.$socket.client.on('msgFileDeleteError', this.socketFileDeleteError);
    this.$socket.client.on('requestMsgSlice', this.socketrequestMsgSlice);
    this.$socket.client.on('getLINElog', this.socketgetLINElog);
    this.$socket.client.on('getbroadcastLog', this.socketgetbroadcastLog);
    this.$socket.client.on('sendLINEnotify', this.socketLINEnotify);
    this.$socket.client.on('removeMessageError', this.socketremoveMessageError);
    this.$socket.client.on('addMsg', this.socketaddMsg);
    this.$socket.client.on('saveMessage', this.socketsaveMessage);
  },
  methods: {
    downloadFile: function (file) {
      this.$emit('downloadFile', file);
    },
    socketsaveMessage: function (data) {
      if (data) {
        this.message.title = '';
        this.message._id = undefined;
        this.message.body = '';
        this.message.type = 0;
        this.message.status = true;
        this.message.attachments = [];
        this.$emit('toastPop', '公告編輯完成！');
        this.editMsgW = false;
        this.msgsaveBtn = '儲存公告';
        this.msgsaveIcon = 'fa-cloud-upload-alt';
      }
    },
    socketaddMsg: function (data) {
      this.message._id = data;
      this.editMsgW = true;
    },
    socketremoveMessageError: function (data) {
      this.$emit('toastPop', '無法刪除' + data + '個附件檔案，請聯絡管理員');
    },
    socketLINEnotify: function (data) {
      this.$emit('toastPop', '發送了' + (parseInt(data.success, 10) + parseInt(data.failed, 10)) + '則LINE notify訊息，' + parseInt(data.success, 10) + '則成功，' + parseInt(data.failed, 10) + '則失敗');
    },
    socketgetbroadcastLog: function (data) {
      this.broadcastLog = data;
      this.broadcastListPopulated = true;
    },
    socketgetLINElog: function (data) {
      this.lineLog = data;
      this.LINEListPopulated = true;
    },
    socketrequestMsgSlice: function (data) {
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
        oriobj.$socket.client.emit('sendMsgFile', {
          uid: files[data.uuid]._id,
          uuid: data.uuid,
          name: files[data.uuid].file.name,
          type: files[data.uuid].file.type,
          size: files[data.uuid].file.size,
          data: arrayBuffer
        });
      };
    },
    socketFileDeleteError: function (data) {
      this.$emit('toastPop', '刪除檔案失敗（原因：' + data + '），請聯絡管理員');
      this.uploadprogress = 0;
      this.uploadstatus = '';
    },
    socketmsgFileUploadError: function (data) {
      this.$emit('toastPop', '上傳失敗（原因：' + data + '），請聯絡管理員');
      this.uploadprogress = 0;
      this.uploadstatus = '';
    },
    socketremoveMessage: function () {
      this.$emit('toastPop', '公告刪除完成！');
    },
    socketgetMessage: function (data) {
      this.message._id = data._id;
      this.message.title = data.title;
      this.message.body = this.HTMLConverter(data.body);
      this.message.type = data.type;
      this.message.status = data.status;
      this.message.attachments = data.attachments;
      this.editMsgW = true;
    },
    socketgetmsgAttachment: function (data) {
      this.message.attachments = data;
    },
    soketmsgFileUploadDone: function (data) {
      let oriobj = this;
      if (data === this.message._id) {
        this.$socket.client.emit('getmsgAttachment', data);
        this.msgFile = undefined;
        this.uploadprogress = 100;
        this.uploadstatus = '完成！';
        Vue.nextTick(() => {
          oriobj.uploadprogress = 0;
          oriobj.uploadstatus = '';
        });
      }
    },
    socketgetMessages: function (data) {
      this.histroyListPopulated = true;
      this.messageList = data;
    },
    HTMLConverter: function (msg) {
      msg = msg === null || msg == undefined ? '**test**' : msg;
      return marked(msg);
    },
    msgstatusConverter: function (status) {
      return status ? '顯示訊息' : '隱藏訊息';
    },
    newMessage: function () {
      this.$socket.client.emit('addMsg');
    },
    deleteMsgFile: function (file) {
      this.$socket.client.emit('deleteMsgFile', {
        fileID: file._id,
        msgID: this.message._id
      });
    },
    removeMsg: function (id) {
      this.$socket.client.emit('removeMessage', id);
    },
    saveMsg: function () {
      this.msgsaveIcon = 'fa-spinner';
      this.msgsaveBtn = '儲存中';
      this.$socket.client.emit('saveMessage', this.message);
    },
    byteConvert: function (size) {
      return prettyBytes(size);
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
    sendLINEnotify: function () {
      this.$socket.client.emit('sendLINEnotify', {
        body: turndownService.turndown(this.LINEbody),
        type: 0
      });
    },
    sendBroadcast: function () {
      this.$socket.client.emit('sendBroadcast', {
        title: this.broadcastTitle,
        body: turndownService.turndown(this.broadcastBody)
      });
    },
    dateConvert: function (time) {
        return moment.unix(time).format('YYYY/MM/DD HH:mm:ss');
    },
    editMsg: function (id) {
      this.$socket.client.emit('getMessage', id);
    },
    openLINEHistory: function () {
      this.LINEListPopulated = false;
      this.lineW = true;
      this.$socket.client.emit('getLINElog');
    },
    openbroadcastHistory: function () {
      this.broadcastListPopulated = false;
      this.broadcastW = true;
      this.$socket.client.emit('getbroadcastLog');
    }
  },
  props: {
  },
  watch: {
    msgFile: {
      immediate: true,
      handler () {
        if (this.msgFile !== undefined) {
          let oriobj = this;
          let fileReader = new FileReader();
          let slice = this.msgFile.slice(0, 100000);
          let uuid = uuidv4();
          files[uuid] = {
            _id: this.message._id,
            file: this.msgFile,
            starttick: moment().valueOf()
          };
          fileReader.readAsArrayBuffer(slice);
          fileReader.onload = () => {
              var arrayBuffer = fileReader.result;
              oriobj.$socket.client.emit('sendMsgFile', {
                uid: oriobj.message._id,
                uuid: uuid,
                name: oriobj.msgFile.name,
                type: oriobj.msgFile.type,
                size: oriobj.msgFile.size,
                data: arrayBuffer
              });
          };
        }
      }
    }
  },
  data () {
      return {
        extensions: [
          History,
          Blockquote,
          Link,
          Underline,
          Strike,
          Italic,
          ListItem,
          BulletList,
          OrderedList,
          [Heading, {
            options: {
              levels: [1, 2, 3]
            }
          }],
          Bold,
          Code,
          HorizontalRule,
          Paragraph,
          HardBreak
        ],
        broadcastTitle: '',
        broadcastBody: '',
        broadcastListPopulated: false,
        broadcastW: false,
        broadcastExpanded: null,
        broadcastLog: [],
        uploadprogress: 0,
        uploadstatus: 0,
        messageType: [
          {
            text: '普通公告',
            value: 0
          },
          {
            text: '設備公告',
            value: 1
          },
          {
            text: '緊急公告',
            value: 2
          }
        ],
        msgFile: undefined,
        msgsaveIcon: 'fa-cloud-upload-alt',
        msgsaveBtn: '儲存公告',
        icontype: 'cloud-upload-alt',
        LINEbody: '',
        lineW: false,
        dialogHeight: 0,
        histroyListPopulated: false,
        LINEListPopulated: false,
        editMsgW: false,
        announcesExpanded: null,
        historyExpanded: null,
        LINEExpanded: null,
        lineLog: [],
        message: {
          type: 0,
          title: '',
          body: '',
          status: true,
          attachments: [],
          _id: undefined
        },
        messageList: []
      };
  }
};
</script>
