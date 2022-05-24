<template>
  <v-main class='pa-0'>
    <v-dialog v-model='bulkmessageW' fullscreen hide-overlay transition='dialog-bottom-transition'>
      <v-card>
        <v-toolbar dark color='primary'>
          <v-btn icon dark @click='closeBulkW'>
            <v-icon>fa-times</v-icon>
          </v-btn>
          <v-toolbar-title>大量發送訊息</v-toolbar-title>
        </v-toolbar>
        <v-card-text class='ma-0 pa-0'>
          <v-alert outlined type="info" icon='fa-info-circle' class='text-left'>
            請記得把範本csv壓縮為一個zip之後上傳，如果你的訊息有附件，系統只會用email通知，請注意各種訊息方式都有上限
          </v-alert>
          <v-alert outlined type="info" icon='fas fa-paper-plane' class='text-left' v-if='msgSent !== ""'>
            請稍後，正在處理...<span v-if='msgSent !== ""'>{{ msgSent }}</span>
          </v-alert>
          <v-container class='pa-5'>
            <v-row>
              <v-col class='d-flex flex-column'>
                <tag-filter
                  :mustSelected='false'
                  :single='false'
                  :selectedItem='bulkTags'
                  @valueUpdated='updatebulkTags'
                  :candidatedItem='savedTags'
                  :createable='false'
                  label='如果你想群發請在此查詢用戶歸屬標籤，否則直接下載即可'
                />
                <v-switch
                  v-model="LINEtype"
                  label="如果用戶有LINE，就用LINE通知（關閉的話就會改用Email）"
                ></v-switch>
                <v-btn v-if='bulkTags.length > 0' @click='generatebulkUsers' class="ma-1">按此下載範本CSV</v-btn>
                <v-btn @click='generateemptyUsers' class="ma-1">按此空白範本CSV</v-btn>
                <v-file-input
                  prepend-icon="fa-paperclip" 
                  v-model="bulkmsgFile" 
                  label='上傳訊息清單' 
                  accept="application/zip"
                  :loading="bulkuploadprogress !== 0">
                  <template v-slot:progress>
                    <v-progress-circular :value="bulkuploadprogress"></v-progress-circular>速度：{{ bulkuploadstatus }}
                  </template>
                </v-file-input>
              </v-col>
            </v-row>
            <v-row>
              <v-col class='d-flex flex-column'>
                <v-simple-table v-if='bulkLog.length > 0'>
                  <template v-slot:default>
                    <thead>
                      <tr>
                        <th
                          class="text-left"
                        >
                          Email
                        </th>
                        <th
                          class="text-left"
                        >
                          狀態
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="log in bulkLog"
                        :key="log.email"
                      >
                        <td class="text-left">{{ log.email }}</td>
                        <td class="text-left">{{ log.msg }}</td>
                      </tr>
                    </tbody>
                  </template>
                </v-simple-table>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
      </v-card>
    </v-dialog>
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
            <v-alert outlined type="info" icon='fa-info-circle' class='text-left'>
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
                    outlined
                    label="請選擇訊息類型"
                    item-text='text'
                    item-value="value"
                    v-model='message.type'
                  ></v-select>
                  <v-text-field outlined clearable dense label='公告標題' v-model='message.title'></v-text-field>
                  <Tip-Tap
                    v-model="message.body"
                    minHeight="10vh"
                    maxHeight="20vh"
                    hint='請不要留白'
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
            <v-toolbar-title>LINE&amp;Email訊息紀錄</v-toolbar-title>
          </v-toolbar>
          <v-card-text class='pa-0 ma-0 text-left black--text text-body-1'>
            <v-alert outlined type="info" icon='fa-info-circle' class='text-left'>
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
                              發送方式
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
                            <td>
                              <span v-if='message.type === 0'>LINE</span>
                              <span v-if='message.type === 1'>Email</span>
                              <span v-if='message.type === 2'>大量發送不紀錄</span>
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
          <v-card-text class='pa-0 ma-0 text-left black--text text-body-1'>
            <v-alert outlined type="info" icon='fa-info-circle' class='text-left'>
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
          <v-text-field outlined clearable dense label='公告標題' v-model='broadcastTitle'></v-text-field>
          <Tip-Tap
            v-model="broadcastBody"
            minHeight="10vh"
            maxHeight="20vh"
            hint='請不要留白'
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
          <div class='text-h5 text-center pt-5 font-weight-black'>LINE&amp;Email Notify</div>
          <v-divider inset></v-divider>
          <v-switch
            v-model="LINEtype"
            label="如果用戶有LINE，就用LINE通知（關閉的話就會改用Email）"
          ></v-switch>
          <v-textarea
            solo
            v-model="LINEbody"
            class='text-left'
            placeholder='請不要留白'
            outlined clearable counter dense
          ></v-textarea>
          <v-btn :disabled='LINEbody === ""' @click='sendLINEnotify' class='ma-3'>
            發出LINE&amp;Email通知
          </v-btn>
          <v-btn @click='openLINEHistory' class='ma-3'>
            LINE&amp;Email發送紀錄
          </v-btn>
          <v-btn @click='bulkmessageW = true' class='ma-3'>
            大量批次發送訊息
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

<script>
// @ is an alias to /src
import Vue from 'vue';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import prettyBytes from 'pretty-bytes';
import TurndownService from 'turndown';
import { marked } from 'marked';
import Papa from 'papaparse';
import _filter from 'lodash/filter';

const turndownService = new TurndownService();

export default {
  name: 'messageMgnt',
  components: { 
    TipTap: () => import(/* webpackChunkName: 'TipTap', webpackPrefetch: true */ './modules/TipTap'),
    TagFilter: () => import(/* webpackChunkName: 'TagFilter', webpackPrefetch: true */ './modules/TagFilter')
  },
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
    this.$socket.client.off('getTagUsers', this.socketgetTagUsers);
    this.$socket.client.off('bulkmsgsampleUploadDone', this.soketbulkmsgsampleUploadDone);
    this.$socket.client.off('bulkmsgsampleUploadError', this.socketbulkmsgsampleUploadError);
    this.$socket.client.off('requestbulkmsgsampleSlice', this.socketrequestbulkmsgsampleSlice);
    this.$socket.client.off('bulkmsgsampleReport', this.socketbulkmsgsampleReport);
    this.$socket.client.off('bulkmsgSent', this.socketbulkmsgSent);
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
    this.$socket.client.on('getTagUsers', this.socketgetTagUsers);
    this.$socket.client.on('bulkmsgsampleUploadDone', this.soketbulkmsgsampleUploadDone);
    this.$socket.client.on('bulkmsgsampleUploadError', this.socketbulkmsgsampleUploadError);
    this.$socket.client.on('requestbulkmsgsampleSlice', this.socketrequestbulkmsgsampleSlice);
    this.$socket.client.on('bulkmsgsampleReport', this.socketbulkmsgsampleReport);
    this.$socket.client.on('bulkmsgSent', this.socketbulkmsgSent);
  },
  methods: {
    closeBulkW: function() {
      this.bulkmessageW = false;
      this.bulkLog = [];
      this.bulkmsgFile = undefined;
      this.bulkuploadprogress = 0;
      this.bulkuploadstatus = "";
      this.msgSent = "";
    },
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
      let filtered = _filter(this.tempFiles, (file) => {
        return file.uuid === data.uuid;
      });
      if(filtered.length > 0) {
        let pendingFile = filtered[0];
        let oriobj = this;
        let place = data.currentSlice * 100000;
        let slice = pendingFile.file.slice(place, place + Math.min(100000, pendingFile.file.size - place));
        this.uploadprogress = Math.ceil((place / pendingFile.file.size) * 100);
        let nowdiff = dayjs().valueOf() - pendingFile.starttick;
        this.uploadstatus = nowdiff === 0 ? '' : prettyBytes(place / (nowdiff/1000)) + '/s';
        let fileReader = new FileReader();
        fileReader.readAsArrayBuffer(slice);
        fileReader.onload = () => {
          var arrayBuffer = fileReader.result;
          oriobj.$socket.client.emit('sendMsgFile', {
            uid: pendingFile._id,
            uuid: data.uuid,
            name: pendingFile.file.name,
            type: pendingFile.file.type,
            size: pendingFile.file.size,
            data: arrayBuffer
          });
        };
      } else {
        this.$emit('toastPop', '找不到檔案，請聯絡管理員');
      }
    },
    socketFileDeleteError: function (data) {
      this.$emit('toastPop', '刪除檔案失敗（原因：' + data + '），請聯絡管理員');
      this.uploadprogress = 0;
      this.uploadstatus = '';
      this.msgFile = undefined;
    },
    socketmsgFileUploadError: function (data) {
      this.$emit('toastPop', '上傳失敗（原因：' + data + '），請聯絡管理員');
      this.uploadprogress = 0;
      this.uploadstatus = '';
      this.msgFile = undefined;
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
    sendLINEnotify: function () {
      this.$socket.client.emit('sendLINEnotify', {
        body: turndownService.turndown(this.LINEbody),
        type: 0,
        useLINE: this.LINEtype
      });
    },
    sendBroadcast: function () {
      this.$socket.client.emit('sendBroadcast', {
        title: this.broadcastTitle,
        body: turndownService.turndown(this.broadcastBody)
      });
    },
    dateConvert: function (time) {
        return dayjs.unix(time).format('YYYY/MM/DD HH:mm:ss');
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
    },
    downloadCSV: function() {
      let output = "\ufeff"+ Papa.unparse(this.bulkSample);
      let element = document.createElement('a');
      let blob = new Blob([output], { type: 'text/csv' });
      let url = window.URL.createObjectURL(blob);
      element.setAttribute('href', url);
      element.setAttribute('download', "大量訊息範本.csv");
      element.click();
    },
    updatebulkTags: function(value) {
      this.bulkTags = value;
    },
    generatebulkUsers: function() {
      this.$socket.client.emit('getTagUsers', this.bulkTags);
    },
    socketgetTagUsers: function(data) {
      this.bulkSample = [];
      for(let i=0; i<data.result.length; i++) {
        this.bulkSample.push({
          姓名: data.result[i].name,
          Email: data.result[i].email,
          訊息內容: "範例內容",
          發送方式: this.LINEtype ? "L" : "E",
          附件: ""
        });
      }
      this.downloadCSV();
    },
    generateemptyUsers: function() {
      this.bulkSample = [{
        姓名: "aaa(本欄位沒有功能)",
        Email: "aaa@aaa.com",
        訊息內容: "範例內容",
        發送方式: this.LINEtype ? "L" : "E",
        附件: "aaa.jpg(檔名自己取放在zip裡只支援一個)"
      }];
      this.downloadCSV();
    },
    soketbulkmsgsampleUploadDone: function() {
      let oriobj = this;
      this.bulkmsgFile = undefined;
      this.bulkuploadprogress = 100;
      this.msgSent = '上傳完成！';
      this.bulkLog = [];
      Vue.nextTick(() => {
        oriobj.bulkuploadprogress = 0;
        oriobj.bulkuploadstatus = '';
      });
    },
    socketbulkmsgsampleUploadError: function(data) {
      this.$emit('toastPop', '上傳失敗（原因：' + data + '），請聯絡管理員');
      this.bulkmsgFile = undefined;
      this.bulkuploadprogress = 0;
      this.bulkuploadstatus = '';
      this.msgSent = '';
      this.bulkLog = [];
    },
    socketrequestbulkmsgsampleSlice: function(data) {
      let filtered = _filter(this.tempFiles, (file) => {
        return file.uuid === data.uuid;
      });
      if(filtered.length > 0) {
        let pendingFile = filtered[0];
        let oriobj = this;
        let place = data.currentSlice * 100000;
        let slice = pendingFile.file.slice(place, place + Math.min(100000, pendingFile.file.size - place));
        this.bulkuploadprogress = Math.ceil((place / pendingFile.file.size) * 100);
        let nowdiff = dayjs().valueOf() - pendingFile.starttick;
        this.bulkuploadstatus = nowdiff === 0 ? '' : prettyBytes(place / (nowdiff/1000)) + '/s';
        let fileReader = new FileReader();
        fileReader.readAsArrayBuffer(slice);
        fileReader.onload = () => {
          var arrayBuffer = fileReader.result;
          oriobj.$socket.client.emit('importbulkmsgFile', {
            uuid: data.uuid,
            name: pendingFile.file.name,
            type: pendingFile.file.type,
            size: pendingFile.file.size,
            data: arrayBuffer
          });
        };
      } else {
        this.$emit('toastPop', '找不到檔案，請聯絡管理員');
      }
    },
    socketbulkmsgsampleReport: function(data) {
      this.msgSent = data;
    },
    socketbulkmsgSent: function(data) {
      this.msgSent = "執行完畢！";
      this.bulkLog = data;
    }
  },
  computed: {
    savedTags: function () {
      return this.$store.state.savedTags;
    }
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
          this.tempFiles.push({
            _id: this.message._id,
            file: this.msgFile,
            starttick: dayjs().valueOf(),
            uuid: uuid
          });
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
    },
    bulkmsgFile: {
      immediate: true,
      handler () {
        if (this.bulkmsgFile !== undefined) {
          let oriobj = this;
          let fileReader = new FileReader();
          let slice = this.bulkmsgFile.slice(0, 100000);
          let uuid = uuidv4();
          this.tempFiles.push({
            uuid: uuid,
            file: this.bulkmsgFile,
            starttick: dayjs().valueOf(),
          });
          console.dir(this.tempFiles);
          fileReader.readAsArrayBuffer(slice);
          fileReader.onload = () => {
              var arrayBuffer = fileReader.result;
              oriobj.$socket.client.emit('importbulkmsgFile', {
                uuid: uuid,
                name: oriobj.bulkmsgFile.name,
                type: oriobj.bulkmsgFile.type,
                size: oriobj.bulkmsgFile.size,
                data: arrayBuffer
              });
          };
        }
      }
    },
  },
  data () {
      return {
        tempFiles: [],
        bulkTags: [],
        LINEtype: true,
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
        messageList: [],
        bulkmessageW: false,
        bulkSample: [],
        bulkmsgFile: undefined,
        bulkuploadprogress: 0,
        bulkuploadstatus: '',
        msgSent: '',
        bulkLog: []
      };
  }
};
</script>
