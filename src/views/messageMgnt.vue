<template>
    <v-main class='pa-0'>
      <v-dialog
        v-model="doneW"
        persistent
        max-width="50vw"
      >
        <v-card>
          <v-card-title class="headline">
            <font-awesome-icon icon='satellite-dish' />
            {{ doneType }}
          </v-card-title>
          <v-card-text>
            {{ doneMsg }}！
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="primary"
              @click="doneW = false"
            >
              關閉通知
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog v-model='editMsgW' fullscreen hide-overlay transition='dialog-bottom-transition'>
        <v-card>
            <v-toolbar dark color='primary'>
              <v-btn icon dark @click='editMsgW = false'>
                  <font-awesome-icon icon='times' />
              </v-btn>
              <v-toolbar-title>編輯公告</v-toolbar-title>
              <v-spacer></v-spacer>
              <v-toolbar-items>
                <v-btn
                  dark
                  text
                  @click='saveMsg'
                >
                  <font-awesome-icon :icon='msgsaveIcon' />
                  {{ msgsaveBtn }}
                </v-btn>
              </v-toolbar-items>
            </v-toolbar>
            <v-card-text class='ma-0 pa-0'>
              <v-alert type="info" icon="fa-exclamation-circle">
                請注意，首頁只會顯示各類型公告各一則
              </v-alert>
              <v-main>
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
                    <v-textarea
                      label='請輸入公告內容'
                      v-model='message.body'
                    ></v-textarea>
                    <v-file-input prepend-icon="fa-paperclip" v-model="msgFile" label='輔助說明文件／圖片上傳' :loading="uploadprogress !== 0">
                      <template v-slot:progress>
                        <v-progress-circular :value="uploadprogress"></v-progress-circular>進度：{{ uploadstatus }}
                      </template>
                    </v-file-input>
                    <div v-if="message.attachments.length > 0" class='d-flex flex-row'>
                      <v-chip
                        v-for='file in message.attachments'
                        :key="file._id"
                        class="ma-2"
                        close
                        close-icon="fa-times"
                        @click:close="deleteMsgFile(file)"
                      >
                        {{ file.name }} ({{ byteConvert(file.size) }})
                      </v-chip>
                    </div>
                  </v-col>
                </v-row>
              </v-main>
            </v-card-text>
        </v-card>
      </v-dialog>
      <v-dialog v-model='lineW' fullscreen hide-overlay transition='dialog-bottom-transition'>
        <v-card>
            <v-toolbar dark color='primary'>
              <v-btn icon dark @click='lineW = false'>
                  <font-awesome-icon icon='times' />
              </v-btn>
              <v-toolbar-title>LINE訊息紀錄</v-toolbar-title>
            </v-toolbar>
            <v-card-text class='pa-0 ma-0'>
              <v-alert type="info" icon="fa-exclamation-circle">
                這裡只是保存歷史訊息供你回味，你無法刪除，也無法修改，發生過了就是發生過了
              </v-alert>
              <span v-show='!LINEListPopulated' class='text-body-1 text-center'>
                <font-awesome-icon icon='spinner' spin />
                載入中，請稍後
              </span>
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
                                <font-awesome-icon icon='check' v-if='message.status === 1' />
                                <font-awesome-icon icon='times' v-if='message.status !== 1'/>
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
                  <font-awesome-icon icon='times' />
              </v-btn>
              <v-toolbar-title>全域廣播紀錄</v-toolbar-title>
            </v-toolbar>
            <v-card-text class='pa-0 ma-0'>
              <v-alert type="info" icon="fa-exclamation-circle">
                這裡只是保存歷史訊息供你回味，你無法刪除，也無法修改，發生過了就是發生過了
              </v-alert>
              <span v-show='!broadcastListPopulated' class='text-body-1 text-center'>
                <font-awesome-icon icon='spinner' spin />
                載入中，請稍後
              </span>
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
            <v-textarea
              solo
              label="輸入你想發送的LINE通知"
              rows="4"
              row-height="40"
              v-model="broadcastBody"
            ></v-textarea>
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
              label="輸入你想發送的LINE通知"
              rows="4"
              row-height="40"
              v-model="LINEbody"
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
            <span v-if='!histroyListPopulated' class='text-body-1 text-center'>
              <font-awesome-icon icon='spinner' spin />
              公告訊息列表載入中，請稍後
            </span>
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
                          <font-awesome-icon icon='pencil-alt' />
                        </v-btn>
                        <v-btn outlined icon @click='removeMsg(message._id)'>
                          <font-awesome-icon icon='trash-alt' />
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

<script>
// @ is an alias to /src
import Vue from 'vue';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faCog, faBomb, faRobot, faCommentDots } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';
import prettyBytes from 'pretty-bytes';

import '@fortawesome/fontawesome-free/css/all.css';
library.add(faCog, faBomb, faRobot, faCommentDots);
Vue.component('font-awesome-icon', FontAwesomeIcon);
Vue.config.productionTip = false;
let files = [];

export default {
  name: 'messageMgnt',
  created () {
    this.$emit('viewIn', {
      text: '系統訊息管理',
      icon: faCog
    });
    let oriobj = this;
    this.$socket.client.emit('getMessages');
    this.$socket.$subscribe('getMessages', (data) => {
      this.histroyListPopulated = true;
      this.messageList = data;
    });
    this.$socket.$subscribe('msgFileUploadDone', (data) => {
      if (data === oriobj.message._id) {
        oriobj.$socket.client.emit('getmsgAttachment', data);
        oriobj.msgFile = undefined;
        oriobj.uploadprogress = 100;
        oriobj.uploadstatus = '完成！';
        setTimeout(() => {
          oriobj.uploadprogress = 0;
          oriobj.uploadstatus = '';
        }, 1000);
      }
    });
    this.$socket.$subscribe('getmsgAttachment', (data) => {
      oriobj.message.attachments = data;
    });
    this.$socket.$subscribe('getMessage', (data) => {
      oriobj.message._id = data._id;
      oriobj.message.title = data.title;
      oriobj.message.body = data.body;
      oriobj.message.type = data.type;
      oriobj.message.status = data.status;
      oriobj.message.attachments = data.attachments;
      oriobj.editMsgW = true;
    });
    this.$socket.$subscribe('removeMessage', (data) => {
      oriobj.doneW = true;
      oriobj.doneType = '刪除公告';
      oriobj.doneMsg = '刪除完成！';
    });
    this.$socket.$subscribe('msgFileUploadError', (data) => {
      oriobj.doneW = true;
      oriobj.doneType = '新增檔案';
      oriobj.doneMsg = '上傳失敗（原因：' + data + '），請聯絡管理員';
      oriobj.uploadprogress = 0;
      oriobj.uploadstatus = '';
    });
    this.$socket.$subscribe('msgFileDeleteError', (data) => {
      oriobj.doneW = true;
      oriobj.doneType = '刪除檔案';
      oriobj.doneMsg = '刪除檔案失敗（原因：' + data + '），請聯絡管理員';
      oriobj.uploadprogress = 0;
      oriobj.uploadstatus = '';
    });
    this.$socket.$subscribe('requestMsgSlice', (data) => {
      let place = data.currentSlice * 100000;
      let slice = files[data.uuid].file.slice(place, place + Math.min(100000, files[data.uuid].file.size - place));
      this.uploadprogress = (Math.ceil(place / files[data.uuid].file.size) * 100);
      this.uploadstatus = (Math.ceil(place / files[data.uuid].file.size) * 100) + '%';
      let fileReader = new FileReader();
      fileReader.readAsArrayBuffer(slice);
      fileReader.onload = (evt) => {
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
    });
    this.$socket.$subscribe('getLINElog', (data) => {
      oriobj.lineLog = data;
      oriobj.LINEListPopulated = true;
    });
    this.$socket.$subscribe('getbroadcastLog', (data) => {
      oriobj.broadcastLog = data;
      oriobj.broadcastListPopulated = true;
    });
    this.$socket.$subscribe('sendLINEnotify', (data) => {
      oriobj.doneW = true;
      oriobj.doneType = 'LINE訊息';
      oriobj.doneMsg = '發送了' + (parseInt(data.success, 10) + parseInt(data.failed, 10)) + '則LINE notify訊息，' + parseInt(data.success, 10) + '則成功，' + parseInt(data.failed, 10) + '則失敗';
    });
    this.$socket.$subscribe('removeMessageError', (data) => {
      oriobj.doneW = true;
      oriobj.doneType = '刪除訊息失敗';
      oriobj.doneMsg = '無法刪除' + data + '個附件檔案，請聯絡管理員';
    });
    this.$socket.$subscribe('addMsg', (data) => {
      oriobj.message._id = data;
      oriobj.editMsgW = true;
    });
    this.$socket.$subscribe('saveMessage', (data) => {
      if (data) {
        oriobj.message.title = '';
        oriobj.message._id = undefined;
        oriobj.message.body = '';
        oriobj.message.type = 0;
        oriobj.message.status = true;
        oriobj.message.attachments = [];
        oriobj.doneW = true;
        oriobj.doneType = '編輯公告';
        oriobj.doneMsg = '編輯完成！';
        oriobj.editMsgW = false;
        oriobj.msgsaveBtn = '儲存公告';
        oriobj.msgsaveIcon = 'cloud-upload-alt';
      }
    });
  },
  methods: {
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
      this.msgsaveIcon = 'spinner';
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
        body: this.LINEbody,
        type: 0
      });
    },
    sendBroadcast: function () {
      this.$socket.client.emit('sendBroadcast', {
        title: this.broadcastTitle,
        body: this.broadcastBody
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
            file: this.msgFile
          };
          fileReader.readAsArrayBuffer(slice);
          fileReader.onload = (evt) => {
              var arrayBuffer = fileReader.result;
              oriobj.$socket.client.emit('sendMsgFile', {
                uid: this.message._id,
                uuid: uuid,
                name: this.msgFile.name,
                type: this.msgFile.type,
                size: this.msgFile.size,
                data: arrayBuffer
              });
          };
        }
      }
    }
  },
  mounted () {
  },
  data () {
      return {
        broadcastTitle: '',
        broadcastBody: '',
        broadcastListPopulated: false,
        broadcastW: false,
        broadcastExpanded: null,
        broadcastLog: [],
        uploadprogress: 0,
        uploadstatus: 0,
        doneW: false,
        doneType: '',
        doneMsg: '',
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
        uploadMsgFileIcon: 'fa-paperclip',
        msgsaveIcon: 'cloud-upload-alt',
        fileaveIcon: 'cloud-upload-alt',
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
