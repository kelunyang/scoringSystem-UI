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
      <v-dialog
        v-model="feedbackListW"
        persistent
        max-width="50vw"
      >
        <v-card>
          <v-card-title class="headline d-flex flex-row justify-space-between" style='border-bottom: 2px solid #333'>
            <v-row class='ma-0 pa-0'>
              <v-col class='ma-0 pa-0 text-left'>
                {{ feedbacksInView.main.title }}
              </v-col>
              <v-col class='d-flex flex-row justify-end ma-0 pa-0'>
                <v-btn icon @click='setRating(true)' :disabled='ratingConvert(true)'>
                  <v-icon>fa-thumbs-up</v-icon>
                </v-btn>
                <v-btn icon @click='setRating(false)' :disabled='ratingConvert(false)'>
                  <v-icon>fa-thumbs-down</v-icon>
                </v-btn>
                <v-btn icon @click='setAgree()' v-if='adminConvert()'>
                  <v-icon>{{ agreeConvert() }}</v-icon>
                </v-btn>
                <v-tooltip bottom v-if='ownerConvert(feedbacksInView.main)'>
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn icon v-bind="attrs" v-on="on" @click='setStatus()'>
                      <v-icon>fa-stamp</v-icon>
                    </v-btn>
                  </template>
                  <span>{{ statusConvert() }}</span>
                </v-tooltip>
                <v-btn icon @click='editFeedback(feedbacksInView.main)' v-if='editConvert(feedbacksInView.main)'>
                  <v-icon>fa-pencil-alt</v-icon>
                </v-btn>
                <v-btn icon @click='removeFeedback(feedbacksInView.main)' v-if='adminConvert()'>
                  <v-icon>fa-trash</v-icon>
                </v-btn>
              </v-col>
            </v-row>
            <v-row class='d-flex flex-row ma-0 pa-0'>
              <v-chip
                v-for='type in feedbacksInView.main.type'
                :key="type + feedbacksInView.main._id"
                class="ma-1 pa-1"
              >{{ type }}</v-chip>
            </v-row>
          </v-card-title>
          <v-card-text>
            <v-timeline
              :dense="true"
            >
              <v-timeline-item>
                <template v-slot:icon>
                  <v-avatar>
                    <v-icon color='white'>fa-plus</v-icon>
                  </v-avatar>
                </template>
                <v-row>
                  <v-btn @click='addFeedback(feedbacksInView.main._id)'>我也要留言！</v-btn>
                </v-row>
              </v-timeline-item>
              <v-timeline-item>
                <template v-slot:icon>
                  <v-avatar>
                    <img :src='"https://avatars.dicebear.com/api/" + feedbacksInView.main.users[0].types + "/" + encodeURIComponent(feedbacksInView.main.users[0].name + "@" + feedbacksInView.main.users[0].unit) + ".svg"' />
                  </v-avatar>
                </template>
                <v-row class='d-flex flex-column ma-0 pa-0'>
                  <v-row class='d-flex flex-row ma-0 pa-0'>
                    <v-col class='text-left ma-0 pa-0'>
                      {{ dateConvert(feedbacksInView.main.tick) }}
                    </v-col>
                  </v-row>
                  <v-row class='ma-0 pa-0'>
                    <div v-html="HTMLConverter(feedbacksInView.main.body)"></div>
                    <v-chip
                      v-for='file in feedbacksInView.main.attachments'
                      :key="file._id"
                      class="ma-2"
                      @click="downloadFile(file)"
                    >{{ filenameConvert(file) }}</v-chip>
                  </v-row>
                </v-row>
              </v-timeline-item>
              <div v-if='feedbacksInView.collections.length > 0'>
                <v-timeline-item v-for='singleFeedback in feedbacksInView.collections' :key='singleFeedback._id'>
                  <template v-slot:icon>
                    <v-avatar>
                      <img :src='"https://avatars.dicebear.com/api/" + singleFeedback.users[0].types + "/" + encodeURIComponent(singleFeedback.users[0].name + "@" + singleFeedback.users[0].unit) + ".svg"' />
                    </v-avatar>
                  </template>
                  <v-row class='d-flex flex-column ma-0 pa-0'>
                    <v-row class='d-flex flex-row ma-0 pa-0'>
                      <v-col class='text-left'>
                        {{ dateConvert(singleFeedback.tick) }}
                      </v-col>
                      <v-col>
                        <v-btn icon @click='editFeedback(singleFeedback)' v-if='editConvert(singleFeedback)'>
                          <font-awesome-icon icon='pencil-alt' />
                        </v-btn>
                      </v-col>
                    </v-row>
                    <v-row class='ma-0 pa-0'>
                      <div v-html="HTMLConverter(singleFeedback.body)"></div>
                    </v-row>
                    <v-row class='d-flex flex-row ma-0 pa-0'>
                      <v-chip
                        v-for='file in singleFeedback.attachments'
                        :key="file._id"
                        class="ma-2"
                        @click="downloadFile(file)"
                      >{{ filenameConvert(file) }}</v-chip>
                    </v-row>
                  </v-row>
                </v-timeline-item>
              </div>
            </v-timeline>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="primary"
              @click="feedbackListW = false"
            >
              關閉通知
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog
        v-model="feedbackW"
        persistent
        max-width="50vw"
      >
        <v-card>
          <v-card-title class="headline">
            編輯用戶回饋
          </v-card-title>
          <v-card-text class='text-left'>
            <v-select :items='wishFeatures' label='指定功能' multiple v-model='feedback.type' v-if='feedback.parent === undefined'></v-select>
            <v-text-field v-model='feedback.title' v-if='feedback.parent === undefined'/>
            <tiptap-vuetify
              v-model="feedback.body"
              :extensions="extensions"
              max-height="20vh"
              min-height="10vh"
              placeholder='請不要留白'
              class='text-left'
            />
            <v-file-input prepend-icon="fa-paperclip" v-model="feedbackFile" label='輔助說明文件／圖片上傳' :loading="uploadprogress !== 0">
              <template v-slot:progress>
                <v-progress-circular :value="uploadprogress"></v-progress-circular>進度：{{ uploadstatus }}
              </template>
            </v-file-input>
            <div v-if="feedback.attachments.length > 0" class='d-flex flex-row'>
              <v-chip
                v-for='file in feedback.attachments'
                :key="file._id"
                class="ma-2"
                close
                close-icon="fa-times"
                @click:close="deleteMsgFile(file)"
              >
                {{ file.name }} ({{ byteConvert(file.size) }})
              </v-chip>
            </div>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="red darken-4"
              class='white--text'
              @click="setFeedback"
            >
              儲存用戶回饋
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog
        v-model="lineW"
        persistent
        max-width="50vw"
      >
        <v-card>
          <v-card-title class="headline">
            <v-icon>fab fa-line</v-icon>
            發送LINE訊息給管理群
          </v-card-title>
          <v-card-text class='text-left'>
            <tiptap-vuetify
              v-model="LINEbody"
              :extensions="extensions"
              max-height="20vh"
              min-height="10vh"
              placeholder='請不要留白'
            />
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="red darken-4"
              class='white--text'
              @click="sendLINEnotify"
            >
              發出LINE通知
            </v-btn>
            <v-btn
              color="primary"
              @click="lineW = false"
            >
              關閉通知
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-row ref='aboutArea'>
        <v-col class='pa-2'>
          <div class='text-h5 font-weight-bold text-left'>關於本系統</div>
          <div class='text-body-2 text-left'>{{ version }}</div>
          <div class='text-caption text-left' v-html="HTMLConverter(changeLog)"></div>
        </v-col>
      </v-row>
      <v-row ref='teamArea'>
        <v-col class='pa-2'>
          <div class='text-h5 font-weight-bold text-left'>管理團隊</div>
          <v-sheet class='d-flex flex-column'>
            <v-btn @click='lineW = true'>
              <v-icon>fab fa-line</v-icon>
              給管理群發LINE訊息
            </v-btn>
            <v-list-item v-for='item in userList' :key='item._id'>
              <v-list-item-avatar>
                <v-avatar size='48'>
                  <img :src='"https://avatars.dicebear.com/api/" + item.types + "/" + encodeURIComponent(item.name + "@" + item.unit) + ".svg"' />
                </v-avatar>
              </v-list-item-avatar>
              <v-list-item-content class='text-left'>
                <v-list-item-title>{{ item.name }} @ {{ item.unit }}</v-list-item-title>
                <v-list-item-subtitle>
                  <font-awesome-icon icon='envelope-open' />
                  {{item.email }}
                </v-list-item-subtitle>
              </v-list-item-content>
              <v-list-item-action>
                <v-btn v-clipboard:copy='item.email'>
                    <font-awesome-icon icon='copy' />
                  複製Email
                </v-btn>
              </v-list-item-action>
            </v-list-item>
          </v-sheet>
        </v-col>
      </v-row>
      <v-row>
        <v-col class='pa-0 d-flex flex-column'>
          <div class='text-h5 font-weight-bold text-left'>許願池</div>
          <v-btn @click='addFeedback(undefined)'>
            <v-icon>fa-pray</v-icon>
            我需要新的功能&amp;反映現有功能的問題！
          </v-btn>
          <span v-if='!histroyListPopulated' class='text-body-1 text-center'>
            <font-awesome-icon icon='spinner' spin />
            使用者回饋載入中，請稍後
          </span>
          <div v-if='histroyListPopulated'>
            <span v-if='feedbackList.length === 0' class='text-body-1 text-center'>
              目前沒有使用者回饋
            </span>
            <v-simple-table v-show="feedbackList.length > 0">
              <template v-slot:default>
                <thead>
                  <tr>
                    <th class="text-left" style="width:25px">
                      <v-icon>fa-angle-double-right</v-icon>
                    </th>
                    <th class="text-left" style="width:80px">
                      <v-icon>fa-thumbs-up</v-icon>
                    </th>
                    <th class="text-left" style="width:25px">
                      <v-icon>fa-star-half-alt</v-icon>
                    </th>
                    <th class="text-left">
                      標題
                    </th>
                    <th class="text-left" style="width:25px">
                      &nbsp;
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="feedback in feedbackList"
                    :key="feedback._id"
                  >
                    <td class="text-left">
                      <v-icon v-if='feedback.status === 1'>fa-angle-double-right'</v-icon>
                      <v-icon v-if='feedback.status !== 1'>fa-check-square</v-icon>
                    </td>
                    <td class="text-left">
                      <v-icon v-if='feedback.rating.length >= 0'>fa-thumbs-up</v-icon>
                      <v-icon v-if='feedback.rating.length < 0'>fa-thumbs-down</v-icon>
                      <span>{{ feedback.rating.length }}</span>
                    </td>
                    <td class="text-left">
                      <v-icon v-if='feedback.users.length > 1'>fa-star</v-icon>
                      <v-icon v-if='feedback.users.length <= 1'>far fa-star</v-icon>
                    </td>
                    <td style='text-overflow: ellipsis'>
                      {{ feedback.title }}
                    </td>
                    <td>
                      <v-btn outlined icon @click='getFeedback(feedback._id)'>
                        <v-icon>fa-search</v-icon>
                      </v-btn>
                    </td>
                  </tr>
                </tbody>
              </template>
            </v-simple-table>
        </v-col>
      </v-row>
  </v-main>
</template>

<script>
import Vue from 'vue';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import VueClipboard from 'vue-clipboard2';
import moment from 'moment';
import TurndownService from 'turndown';
import marked from 'marked';
import { v4 as uuidv4 } from 'uuid';
import '@fortawesome/fontawesome-free/css/all.css';
import { TiptapVuetify, Heading, Bold, Italic, Strike, Underline, Code, Paragraph, BulletList, OrderedList, ListItem, Link, Blockquote, HardBreak, HorizontalRule, History } from 'tiptap-vuetify';
import 'tiptap-vuetify/dist/main.css';
import prettyBytes from 'pretty-bytes';

library.add(faInfoCircle);
Vue.component('font-awesome-icon', FontAwesomeIcon);

VueClipboard.config.autoSetContainer = true;
Vue.use(VueClipboard);

const turndownService = new TurndownService();
let files = [];

export default {
  name: 'Info',
  components: { TiptapVuetify },
  methods: {
    socketrequestfeedbackSlice: function (data) {
      let oriobj = this;
      let place = data.currentSlice * 100000;
      let slice = files[data.uuid].file.slice(place, place + Math.min(100000, files[data.uuid].file.size - place));
      this.uploadprogress = (Math.ceil(place / files[data.uuid].file.size) * 100);
      this.uploadstatus = (Math.ceil(place / files[data.uuid].file.size) * 100) + '%';
      let fileReader = new FileReader();
      fileReader.readAsArrayBuffer(slice);
      fileReader.onload = () => {
        var arrayBuffer = fileReader.result;
        oriobj.$socket.client.emit('sendfeedbackFile', {
          uid: files[data.uuid]._id,
          uuid: data.uuid,
          name: files[data.uuid].file.name,
          type: files[data.uuid].file.type,
          size: files[data.uuid].file.size,
          data: arrayBuffer
        });
      };
    },
    socketfeedbackfileDeleteError: function (data) {
      this.doneW = true;
      this.doneType = '刪除檔案';
      this.doneMsg = '刪除檔案失敗（原因：' + data + '），請聯絡管理員';
      this.uploadprogress = 0;
      this.uploadstatus = '';
    },
    socketfeedbackFileUploadError: function (data) {
      this.doneW = true;
      this.doneType = '新增檔案';
      this.doneMsg = '上傳失敗（原因：' + data + '），請聯絡管理員';
      this.uploadprogress = 0;
      this.uploadstatus = '';
    },
    socketremoveFeedback: function () {
      this.doneW = true;
      this.doneType = '刪除用戶回饋';
      this.doneMsg = '刪除完成！';
      this.feedbackListW = false;
      this.feedbackW = false;
    },
    socketgetFeedback: function (data) {
      this.feedbacksInView = data;
      this.feedbackListW = true;
    },
    socketgetfeedbackAttachment: function (data) {
      this.feedback.attachments = data;
    },
    socketfeedbackFileUploadDone: function (data) {
      if (data === this.feedback._id) {
        this.$socket.client.emit('getfeedbackAttachment', data);
        this.feedbackFile = undefined;
        this.uploadprogress = 100;
        this.uploadstatus = '完成！';
        window.clearTimeout(this.timer);
        this.timer = setTimeout(() => {
          this.uploadprogress = 0;
          this.uploadstatus = '';
          window.clearTimeout(this.timer);
        }, 1000);
      }
    },
    socketgetfeedbackList: function (data) {
      this.histroyListPopulated = true;
      this.feedbackList = data;
    },
    socketsetFeedback: function (data) {
      if(data) {
        this.feedback._id = undefined;
        this.feedback.type = [];
        this.feedback.title = '';
        this.feedback.body = '';
        this.feedback.attachments = [];
        this.feedback.parent = undefined;
        this.feedbackW = false;
      }
    },
    socketaddFeedback: function (data) {
      this.feedback._id = data._id;
      this.feedback.type = [];
      this.feedback.title = '';
      this.feedback.body = '';
      this.feedback.attachments = [];
      this.feedback.parent = data.parent;
      this.feedbackW = true;
    },
    socketeditFeedback: function (data) {
      this.feedback._id = data._id;
      this.feedback.type = data.type;
      this.feedback.title = data.title;
      this.feedback.body = this.HTMLConverter(data.body);
      this.feedback.attachments = data.attachments;
      this.feedback.parent = data.parent;
      this.feedbackW = true;
    },
    socketsendLINEnotify: function (data) {
      this.doneW = true;
      this.doneType = 'LINE訊息';
      this.doneMsg = '發送了' + (parseInt(data.success, 10) + parseInt(data.failed, 10)) + '則LINE notify訊息，' + parseInt(data.success, 10) + '則成功，' + parseInt(data.failed, 10) + '則失敗';
    },
    socketgetsiteSetting: function (data) {
      this.version = data.version;
      this.changeLog = data.changeLog;
      this.siteLocation = data.siteLocation;
      this.$socket.client.emit('getCurrentUser');
    },
    socketgetCurrentUser: function (data) {
      this.currentUser = data;
      this.$socket.client.emit('getfeedbackList');
    },
    socketgetsiteAdminUsers: function (data) {
      this.userList = data;
      this.$socket.client.emit('getsiteSetting');
    },
    adminConvert: function () {
      let oriobj = this;
      return this.userList.some((user) => {
        return user._id === oriobj.currentUser._id;
      });
    },
    ownerConvert: function (feedback) {
      let oriobj = this;
      return feedback.users.some((user) => {
        return user._id === oriobj.currentUser._id;
      });
    },
    editConvert: function (feedback) {
      let oriobj = this;
      if(feedback.users.some((user) => {
        return user._id === oriobj.currentUser._id
      })) {
        return true;
      } else {
        return false;
      }
    },
    editFeedback: function (feedback) {
      this.$socket.client.emit('editFeedback', feedback._id);
    },
    removeFeedback: function (feedback) {
      this.$socket.client.emit('removeFeedback', feedback._id);
    },
    addFeedback: function (parent) {
      this.$socket.client.emit('addFeedback', parent);
    },
    setFeedback: function () {
      this.$socket.client.emit('setFeedback', this.feedback);
    },
    getFeedback: function (id) {
      this.$socket.client.emit('getFeedback', id);
      this.feedbackListW = true;
    },
    dateConvert: function (time) {
      return time === 0 ? '尚未設定' : moment.unix(time).format('YYYY/MM/DD HH:mm:ss');
    },
    sendLINEnotify: function () {
      this.$socket.client.emit('sendLINEnotify', {
        body: turndownService.turndown(this.LINEbody),
        type: 1
      });
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
    agreeConvert: function () {
      let oriobj = this;
      if(this.feedbacksInView.main.users.some((user) => {
        return user._id === oriobj.currentUser._id
      })) {
        return 'fa-star';
      } else {
        return 'far fa-star';
      }
    },
    ratingConvert: function (status) {
      let oriobj = this;
      if(this.feedbacksInView.main.rating.some((user) => {
        return user._id === oriobj.currentUser._id
      })) {
        return status ? true : false;
      } else {
        return status ? false : this.feedbacksInView.main.rating.length === 0;
      }
    },
    statusConvert: function () {
      if(this.feedbacksInView.main.status) {
        return '恢復討論';
      } else {
        return '關閉討論';
      }
    },
    setRating: function (status) {
      let oriobj = this;
      this.$socket.client.emit('setRating', {
        _id: oriobj.feedbacksInView.main._id,
        status: status
      });
    },
    setAgree: function () {
      this.$socket.client.emit('setAgree', this.feedbacksInView.main._id);
    },
    setStatus: function () {
      this.$socket.client.emit('setStatus', this.feedbacksInView.main._id);
    },
    downloadFile: function (file) {
      if (file.status === 1) {
        let element = document.createElement('a');
        element.setAttribute('href', this.siteLocation + '/storages/' + file._id);
        element.setAttribute('download', file.name);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
      }
    }
  },
  watch: {
    feedbackFile: {
      immediate: true,
      handler () {
        if (this.feedbackFile !== undefined) {
          let oriobj = this;
          let fileReader = new FileReader();
          let slice = this.feedbackFile.slice(0, 100000);
          let uuid = uuidv4();
          files[uuid] = {
            _id: this.feedback._id,
            file: this.feedbackFile
          };
          fileReader.readAsArrayBuffer(slice);
          fileReader.onload = () => {
              var arrayBuffer = fileReader.result;
              oriobj.$socket.client.emit('sendfeedbackFile', {
                uid: this.feedback._id,
                uuid: uuid,
                name: this.feedbackFile.name,
                type: this.feedbackFile.type,
                size: this.feedbackFile.size,
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
        timer: null,
        changeLog: '**test**',
        siteLocation: '',
        currentUser: {
          _id: ''
        },
        feedbackW: false,
        feedbackListW: false,
        feedbackFile: undefined,
        uploadprogress: 0,
        uploadstatus: '',
        LINEbody: '',
        doneW: false,
        version: null,
        lineW: false,
        feedback: {
          type: [],
          title: '',
          body: '',
          attachments: [],
          parent: undefined,
          _id: undefined
        },
        feedbacksInView: {
          main: {
            title: '',
            body: '**test**',
            users: [
              {
                types: 'test',
                name: 'test',
                unit: 'test'
              }
            ],
            attachments: [],
            rating: []
          },
          collections: [
              {
              title: '',
              body: '**test**',
              users: [
                {
                  types: 'test',
                  name: 'test',
                  unit: 'test'
                }
              ],
              attachments: [],
              rating: []
            }
          ]
        },
        selectedFeature: null,
        wishFeatures: [
          '不明確功能（其他）',
          '前置功能編輯器（知識點編輯器）',
          '影片編輯器（影片審查）',
          'DashBoard儀錶板'
        ],
        feedbackList: [],
        histroyListPopulated: false,
        userList: []
      };
  },
  beforeDestroy () {
    this.$socket.client.off('getsiteAdminUsers', this.socketgetsiteAdminUsers);
    this.$socket.client.off('getCurrentUser', this.socketgetCurrentUser);
    this.$socket.client.off('getsiteSetting', this.socketgetsiteSetting);
    this.$socket.client.off('sendLINEnotify', this.socketsendLINEnotify);
    this.$socket.client.off('editFeedback', this.socketeditFeedback);
    this.$socket.client.off('addFeedback', this.socketaddFeedback);
    this.$socket.client.off('setFeedback', this.socketsetFeedback);
    this.$socket.client.off('getfeedbackList', this.socketgetfeedbackList);
    this.$socket.client.off('feedbackFileUploadDone', this.socketfeedbackFileUploadDone);
    this.$socket.client.off('getfeedbackAttachment', this.socketgetfeedbackAttachment);
    this.$socket.client.off('getFeedback', this.socketgetFeedback);
    this.$socket.client.off('removeFeedback', this.socketremoveFeedback);
    this.$socket.client.off('feedbackFileUploadError', this.socketfeedbackFileUploadError);
    this.$socket.client.off('feedbackFileDeleteError', this.socketfeedbackfileDeleteError);
    this.$socket.client.off('requestfeedbackSlice', this.socketrequestfeedbackSlice);
  },
  created () {
    this.$emit('viewIn', {
      text: '關於本系統&許願池',
      icon: faInfoCircle,
      module: '用戶回饋模組'
    });
    this.$socket.client.emit('getsiteAdminUsers', [
      'settingTags'
    ]);
    this.$socket.client.on('getCurrentUser', this.socketgetCurrentUser);
    this.$socket.client.on('getsiteSetting', this.socketgetsiteSetting);
    this.$socket.client.on('getsiteAdminUsers', this.socketgetsiteAdminUsers);
    this.$socket.client.on('sendLINEnotify', this.socketsendLINEnotify);
    this.$socket.client.on('editFeedback', this.socketeditFeedback);
    this.$socket.client.on('addFeedback', this.socketaddFeedback);
    this.$socket.client.on('setFeedback', this.socketsetFeedback);
    this.$socket.client.on('getfeedbackList', this.socketgetfeedbackList);
    this.$socket.client.on('feedbackFileUploadDone', this.socketfeedbackFileUploadDone);
    this.$socket.client.on('getfeedbackAttachment', this.socketgetfeedbackAttachment);
    this.$socket.client.on('getFeedback', this.socketgetFeedback);
    this.$socket.client.on('removeFeedback', this.socketremoveFeedback);
    this.$socket.client.on('feedbackFileUploadError', this.socketfeedbackFileUploadError);
    this.$socket.client.on('feedbackFileDeleteError', this.socketfeedbackfileDeleteError);
    this.$socket.client.on('requestfeedbackSlice', this.socketrequestfeedbackSlice);
  }
};
</script>
