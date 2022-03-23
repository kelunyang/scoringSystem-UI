<template> 
    <v-main class='pa-0'>
      <v-dialog
        v-model="feedbackListW"
        persistent
        max-width="50vw"
      >
        <v-card>
          <v-toolbar
            color="primary"
            dark
          >檢視用戶回饋</v-toolbar>
          <v-card-text>
            <v-sheet>
              <div class='d-flex flex-row flex-grow-1'>
                <div class='d-flex flex-row justify-end flex-shrink-1'>
                  <v-menu
                    offset-y
                    attach
                    transition="slide-y-transition"
                    v-show='!feedbacksInView.main.status'
                  >
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn
                        class='white--text ma-1'
                        color='red darken-4'
                        v-bind="attrs" v-on="on"
                      >
                        回復feedback
                      </v-btn>
                    </template>
                    <v-sheet class='d-flex flex-column pa-1'>
                      <div class='text-h6'>確認回復feedback？</div>
                      <v-btn
                        class='white--text ma-1'
                        color='red darken-4'
                        @click='addFeedback(feedbacksInView.main._id)'
                      >
                        是，我要回復feedback！
                      </v-btn>
                      <div class='text-caption'>如果你只是誤觸，請隨意點擊其他地方即會關閉本對話框，請注意，只有系統管理員可以刪除feedback</div>
                    </v-sheet>
                  </v-menu>
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
                  <v-btn icon @click='removeFeedback(feedbacksInView.main)' v-if='adminConvert()'>
                    <v-icon>fa-trash</v-icon>
                  </v-btn>
                </div>
                <div>
                  <v-chip
                    v-for='type in feedbacksInView.main.type'
                    :key="type + feedbacksInView.main._id"
                    class="ma-1 pa-1"
                  >
                    {{ type }}
                  </v-chip>
                </div>
              </div>
              <div class='text-body-1'>
                {{ feedbacksInView.main.title }}
              </div>
              <div class='d-flex flex-column'>
                <v-lazy
                  :options="{
                    threshold: 0.5
                  }"
                  min-height="100"
                  transition="fade-transition"
                  style='width: 100%'
                >
                  <issue-view
                    :issue='feedbacksInView.main'
                    @download='downloadFile'
                    @remove='removeFeedback'
                  />
                </v-lazy>
                <v-lazy
                  :options="{
                    threshold: 0.5
                  }"
                  min-height="100"
                  transition="fade-transition"
                  style='width: 100%'
                  v-for="feedback in feedbacksInView.collections"
                  :key="feedback._id"
                >
                  <issue-view
                    :issue='feedback'
                    @download='downloadFile'
                    @remove='removeFeedback'
                  />
                </v-lazy>
              </div>
            </v-sheet>
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
          <v-toolbar dark color='primary'>
            <v-toolbar-title>編輯用戶回饋</v-toolbar-title>
          </v-toolbar>
          <v-card-text class='text-left pa-3'>
            <v-select outlined :items='wishFeatures' label='指定功能' multiple v-model='feedback.type' v-if='feedback.parent === undefined'></v-select>
            <v-text-field v-model='feedback.title' v-if='feedback.parent === undefined' outlined clearable dense/>
            <Tip-Tap
              v-model="feedback.body"
              maxHeight="20vh"
              minHeight="10vh"
              hint='請不要留白'
            />
            <!-- <v-file-input prepend-icon="fa-paperclip" v-model="feedbackFile" label='輔助說明文件／圖片上傳' :loading="uploadprogress !== 0">
              <template v-slot:progress>
                <v-progress-circular :value="uploadprogress"></v-progress-circular>速度：{{ uploadstatus }}
              </template>
            </v-file-input> -->
            <div v-if="feedback.attachments.length > 0" class='d-flex flex-row flex-wrap'>
              <v-chip
                v-for='file in feedback.attachments'
                :key="file._id"
                class="ma-2"
                close
                close-icon="fa-times"
                @click:close="deleteFeedbackFile(file)"
                @click="downloadFile(file)"
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
              :disabled='feedback.title === "" || feedback.body === ""'
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
          <v-toolbar dark color='primary'>
            <v-toolbar-title>發送LINE訊息給管理群</v-toolbar-title>
          </v-toolbar>
          <v-card-text class='text-left pa-3'>
            <v-textarea
              label="LINE訊息"
              v-model="LINEbody"
              hint="請不要留白"
              outlined clearable counter dense
            ></v-textarea>
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
        <v-col class='pa-2 black--text'>
          <div class='text-h5 font-weight-bold text-left'>系統版本</div>
          <div class='d-flex flex-row flex-wrap'>
            <div class='d-flex flex-column ma-1'>
              <div class='text-h6 text-left'>前端版本：{{ siteSettings.version.frontend.substring(0,7) }}</div>
              <div class='text-caption text-left'>
                <span v-if='frontendCommitInfo.latest'>[最新版]</span><br v-if='frontendCommitInfo.latest'/>
                <span v-if='!frontendCommitInfo.latest' class='red--text darken-4'>不是最新版，請提醒管理員更新！</span><br v-if='!frontendCommitInfo.latest'/>
                <span>發布日期： {{ frontendCommitInfo.date }} </span><br/>
                <span>發布者： {{ frontendCommitInfo.committer }} ({{ frontendCommitInfo.email }}) </span><br/>
                <span>發布訊息：</span><span v-html='HTMLConverter(frontendCommitInfo.message)'></span>
              </div>
            </div>
            <div class='d-flex flex-column ma-1'>
              <div class='text-h6 text-left'>後端版本：{{ siteSettings.version.backend.substring(0,7) }}</div>
              <div class='text-caption text-left'>
                <span v-if='backendCommitInfo.latest'>[最新版]</span><br v-if='backendCommitInfo.latest'/>
                <span v-if='!backendCommitInfo.latest' class='red--text darken-4'>不是最新版，請提醒管理員更新！</span><br v-if='!backendCommitInfo.latest'/>
                <span>發布日期： {{ backendCommitInfo.date }} </span><br/>
                <span>發布者： {{ backendCommitInfo.committer }} ({{ backendCommitInfo.email }}) </span><br/>
                <span>發布訊息： </span><span v-html='HTMLConverter(backendCommitInfo.message)'></span>
              </div>
            </div>
            <div class='d-flex flex-column ma-1'>
              <div class='text-h6 text-left'>機器人版本：{{ siteSettings.version.bot.substring(0,7) }}</div>
              <div class='text-caption text-left'>
                <span v-if='botCommitInfo.latest'>[最新版]</span><br v-if='botCommitInfo.latest'/>
                <span v-if='!botCommitInfo.latest' class='red--text darken-4'>不是最新版，請提醒管理員更新！</span><br v-if='!botCommitInfo.latest'/>
                <span>發布日期： {{ botCommitInfo.date }} </span><br/>
                <span>發布者： {{ botCommitInfo.committer }} ({{ botCommitInfo.email }}) </span><br/>
                <span>發布訊息： </span><span v-html='HTMLConverter(botCommitInfo.message)'></span>
              </div>
            </div>
          </div>
        </v-col>
      </v-row>
      <v-row ref='teamArea'>
        <v-col class='pa-2'>
          <div class='text-h5 font-weight-bold text-left'>系統管理員們</div>
          <v-sheet class='d-flex flex-column'>
            <v-btn @click='lineW = true'>
              <v-icon>fab fa-line</v-icon>
              給管理員發LINE訊息
            </v-btn>
            <v-list-item v-for='item in userList' :key='item._id'>
              <v-list-item-avatar>
                <v-avatar size='48'>
                  <Avatar :user='item' :size='48'/>
                </v-avatar>
              </v-list-item-avatar>
              <v-list-item-content class='text-left'>
                <v-list-item-title>{{ item.name }} @ {{ item.unit }}</v-list-item-title>
                <v-list-item-subtitle>
                  <v-icon>fa-envelope-open</v-icon>
                  {{item.email }}
                </v-list-item-subtitle>
              </v-list-item-content>
              <v-list-item-action>
                <v-btn v-clipboard:copy='item.email'>
                  <v-icon>fa-copy</v-icon>
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
          <v-menu
            offset-y
            attach
            transition="slide-y-transition"
            v-show='!feedbacksInView.main.status'
          >
            <template v-slot:activator="{ on, attrs }">
              <v-btn v-bind="attrs" v-on="on">
                <v-icon>fa-pray</v-icon>
                我需要新的功能&amp;反映現有功能的問題！
              </v-btn>
            </template>
            <v-sheet class='d-flex flex-column pa-1'>
              <div class='text-h6'>確認發feedback？</div>
              <v-btn
                class='white--text ma-1'
                color='red darken-4'
                @click='addFeedback(undefined)'
              >
                是，我要發feedback！
              </v-btn>
              <div class='text-caption'>如果你只是誤觸，請隨意點擊其他地方即會關閉本對話框，請注意，只有系統管理員可以刪除feedback</div>
            </v-sheet>
          </v-menu>
          <v-skeleton-loader
            class="mx-auto"
            type="card"
            width="100%"
            v-if='!histroyListPopulated'
          ></v-skeleton-loader>
          <div v-if='histroyListPopulated'>
            <span v-if='feedbackList.length === 0' class='text-body-1 text-center'>
              目前沒有使用者回饋
            </span>
            <v-simple-table v-show="feedbackList.length > 0" class='black--text'>
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
                      <v-icon v-if='!feedback.status'>fa-angle-double-right'</v-icon>
                      <v-icon v-if='feedback.status'>fa-check-square</v-icon>
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
                    <td style='text-overflow: ellipsis text-left'>
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

<style scoped>
.issueItem {
  background-color: #FFF;
  border: 1px solid #666;
}
</style>

<script>
import Vue from 'vue';
import VueClipboard from 'vue-clipboard2';
import dayjs from 'dayjs';
import TurndownService from 'turndown';
import { marked } from 'marked';
import { v4 as uuidv4 } from 'uuid';
import prettyBytes from 'pretty-bytes';
import _find from 'lodash/find';

const renderer = new marked.Renderer();
const linkRenderer = renderer.link;
renderer.link = (href, title, text) => {
  if(href !== undefined) { href = (decodeURIComponent(href)).replace(/\\/g, ''); }
  if(title !== undefined) { title = (decodeURIComponent(title)).replace(/\\/g, ''); }
  if(text !== undefined) { text = (decodeURIComponent(text)).replace(/\\/g, ''); }
  const html = linkRenderer.call(renderer, href, title, text);
  return html.replace(/^<a /, '<a target="_blank" rel="nofollow" ');
};

VueClipboard.config.autoSetContainer = true;
Vue.use(VueClipboard);

const turndownService = new TurndownService();
let files = [];

export default {
  name: 'Info',
  components: { 
    TipTap: () => import(/* webpackChunkName: 'TipTap', webpackPrefetch: true */ './modules/TipTap'),
    IssueView: () => import(/* webpackChunkName: 'IssueView', webpackPrefetch: true */ './modules/IssueView'),
    Avatar: () => import(/* webpackChunkName: 'Avatar', webpackPrefetch: true */ './modules/Avatar'),
  },
  methods: {
    socketrequestfeedbackSlice: function (data) {
      let oriobj = this;
      let place = data.currentSlice * 100000;
      let slice = files[data.uuid].file.slice(place, place + Math.min(100000, files[data.uuid].file.size - place));
      this.uploadprogress = Math.ceil((place / files[data.uuid].file.size) * 100);
      let nowdiff = dayjs().valueOf() - files[data.uuid].starttick;
      this.uploadstatus = nowdiff === 0 ? '' : prettyBytes(place / (nowdiff/1000)) + '/s';
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
      this.$emit('toastPop', '刪除檔案失敗（原因：' + data + '），請聯絡管理員');
      this.uploadprogress = 0;
      this.uploadstatus = '';
    },
    socketfeedbackFileUploadError: function (data) {
      this.$emit('toastPop', '上傳失敗（原因：' + data + '），請聯絡管理員');
      this.uploadprogress = 0;
      this.uploadstatus = '';
    },
    socketremoveFeedback: function () {
      this.$emit('toastPop', '刪除完成！');
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
      let oriobj = this;
      if (data === this.feedback._id) {
        this.$socket.client.emit('getfeedbackAttachment', data);
        this.feedbackFile = undefined;
        this.uploadprogress = 100;
        this.uploadstatus = '完成！';
        Vue.nextTick(() => {
          oriobj.uploadprogress = 0;
          oriobj.uploadstatus = '';
        });
      }
    },
    socketgetfeedbackList: function (data) {
      if(this.siteSettings.repos.frontend !== "") {
        this.$socket.client.emit('getGithubCommit', this.siteSettings.repos.frontend);
        this.$socket.client.emit('getGithubCommit', this.siteSettings.repos.backend);
        this.$socket.client.emit('getGithubCommit', this.siteSettings.repos.bot);
      } else {
        this.$socket.client.emit('getsiteSetting');
      }
      this.$socket.client.emit('getsiteAdminUsers', [
        'settingTags'
      ]);
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
      this.$emit('toastPop', '發送了' + (parseInt(data.success, 10) + parseInt(data.failed, 10)) + '則LINE notify訊息，' + parseInt(data.success, 10) + '則成功，' + parseInt(data.failed, 10) + '則失敗');
    },
    socketgetsiteAdminUsers: function (data) {
      this.userList = data;
    },
    adminConvert: function () {
      let oriobj = this;
      return _find(this.userList, (user) => {
        return user._id === oriobj.currentUser._id;
      }) !== undefined;
    },
    ownerConvert: function (feedback) {
      let oriobj = this;
      return _find(feedback.users, (user) => {
        return user._id === oriobj.currentUser._id;
      }) !== undefined;
    },
    editConvert: function (feedback) {
      let oriobj = this;
      return _find(feedback.users, (user) => {
        return user._id === oriobj.currentUser._id
      }) !== undefined;
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
      return time === 0 ? '尚未設定' : dayjs.unix(time).format('YYYY/MM/DD HH:mm:ss');
    },
    sendLINEnotify: function () {
      this.$socket.client.emit('sendLINEnotify', {
        body: turndownService.turndown(this.LINEbody),
        type: 1,
        useLINE: true
      });
    },
    HTMLConverter: function (msg) {
      msg = msg === null || msg == undefined ? '**test**' : msg;
      return marked(msg, { renderer });
    },
    filenameConvert: function (file) {
      let str = file.name;
      str += prettyBytes(file.size);
      return str;
    },
    byteConvert: function (size) {
      return prettyBytes(size);
    },
    agreeConvert: function () {
      let oriobj = this;
      return _find(this.feedbacksInView.main.users, (user) => {
        return user._id === oriobj.currentUser._id;
      }) !== undefined ? 'fa-star' : 'far fa-star';
    },
    ratingConvert: function (status) {
      let oriobj = this;
      return _find(this.feedbacksInView.main.rating, (user) => {
        return user._id === oriobj.currentUser._id
      }) !== undefined ? status ? true : false : status ? false : this.feedbacksInView.main.rating.length === 0;
    },
    deleteFeedbackFile: function (file) {
      this.$socket.client.emit('deleteFeedbackFile', {
        fileID: file._id,
        feedbackID: this.feedback._id
      });
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
      this.$emit('downloadFile', file);
    },
    socketgetGithubCommit: function (data) {
      if(data.repo === this.siteSettings.repos.frontend) {
        this.frontendCommits = data.commits;
      } else if(data.repo === this.siteSettings.repos.backend) {
        this.backendCommits = data.commits;
      } else if(data.repo === this.siteSettings.repos.bot) {
        this.botCommits = data.commits;
      }
    },
    getCommit: function (commits, id) {
      let commit = _find(commits, (commit) => {
        return commit.id === id;
      });
      if(commit !== undefined) {
        return {
          date: dayjs(commit.commitDate).format('YYYY/MM/DD HH:mm:ss'),
          message: commit.message,
          committer: commit.committerName,
          email: commit.committerEmail,
          latest: commits[0].id === id
        }
      } else {
        return {
          date: '無資訊',
          message: '無資訊',
          committer: '無資訊',
          email: '無資訊'
        }
      }
    }
  },
  computed: {
    frontendCommitInfo: function () {
      let frontendID = this.siteSettings.version.frontend;
      let commits = this.frontendCommits;
      return this.getCommit(commits, frontendID);
    },
    backendCommitInfo: function () {
      let backendID = this.siteSettings.version.backend;
      let commits = this.backendCommits;
      return this.getCommit(commits, backendID);
    },
    botCommitInfo: function () {
      let botID = this.siteSettings.version.bot;
      let commits = this.botCommits;
      return this.getCommit(commits, botID);
    },
    currentUser: function () {
      return this.$store.state.currentUser;
    },
    siteSettings: function () {
      return this.$store.state.siteSettings;
    }
  },
  watch: {
    "siteSettings.repos.frontend": function() {
      if(this.siteSettings.repos.frontend !== "") {
        this.$socket.client.emit('getGithubCommit', this.siteSettings.repos.frontend);
        this.$socket.client.emit('getGithubCommit', this.siteSettings.repos.backend);
        this.$socket.client.emit('getGithubCommit', this.siteSettings.repos.bot);
      }
    },
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
            file: this.feedbackFile,
            starttick: dayjs().valueOf()
          };
          fileReader.readAsArrayBuffer(slice);
          fileReader.onload = () => {
              var arrayBuffer = fileReader.result;
              oriobj.$socket.client.emit('sendfeedbackFile', {
                uid: oriobj.feedback._id,
                uuid: uuid,
                name: oriobj.feedbackFile.name,
                type: oriobj.feedbackFile.type,
                size: oriobj.feedbackFile.size,
                data: arrayBuffer
              });
          };
        }
      }
    }
  },
  data () {
      return {
        backendCommits: [],
        frontendCommits: [],
        botCommits: [],
        feedbackW: false,
        feedbackListW: false,
        feedbackFile: undefined,
        uploadprogress: 0,
        uploadstatus: '',
        LINEbody: '',
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
          '發送報告',
          '發送評分',
          'DashBoard儀錶板'
        ],
        feedbackList: [],
        histroyListPopulated: false,
        userList: []
      };
  },
  beforeDestroy () {
    this.$socket.client.off('getsiteAdminUsers', this.socketgetsiteAdminUsers);
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
    this.$socket.client.off('getGithubCommit', this.socketgetGithubCommit);
  },
  created () {
    this.$emit('viewIn', {
      text: '關於本系統&許願池',
      icon: 'fa-info-circle',
      module: '用戶回饋模組',
      location: '/Info'
    });
    this.$socket.client.on('getsiteAdminUsers', this.socketgetsiteAdminUsers);
    this.$socket.client.on('getGithubCommit', this.socketgetGithubCommit);
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
    this.$socket.client.emit('getfeedbackList');
  }
};
</script>
