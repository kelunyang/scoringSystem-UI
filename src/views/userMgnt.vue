<template>
    <v-sheet>
      <v-dialog
        v-model="emailW"
        persistent
        max-width="50vw"
      >
        <v-card>
          <v-card-title class="headline">
            <v-icon>fa-key</v-icon>
            Email修改： {{ editingUser.name }}
          </v-card-title>
          <v-card-text>
            <v-alert type="alert" icon="fa-exclamation-circle" class='ma-0'>請注意，使用者登入時是依據Email登入，因此Email不可重複</v-alert>
            <v-text-field prepend-icon='fa-at' label='用戶Email' v-model='editingUser.email'></v-text-field>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="teal darken-4"
              class='white--text'
              @click="checkEmail"
            >
              檢查Email
            </v-btn>
            <v-btn
              color="deep-orange darken-4"
              class='white--text'
              @click="setnewEmail"
            >
              設定Email
            </v-btn>
            <v-btn
              color="primary"
              @click="closeEmailW"
            >
              關閉對話框
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog
        v-model="passwordW"
        persistent
        max-width="50vw"
      >
        <v-card>
          <v-card-title class="headline">
            <v-icon>fa-key</v-icon>
            密碼重置： {{ editingUser.name }}
          </v-card-title>
          <v-card-text>
            請注意，當你按下確認按鈕之後，用戶的舊密碼就會被系統自動產生的暫時密碼複寫，用戶會收到一封通知信，告訴他新的密碼，基於資訊安全，你不會知道這個密碼，請務必確認主機的Email伺服器設定正確，然後用戶也收的到這封信
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="deep-orange darken-4"
              class='white--text'
              @click="sendpasswordReset"
            >
              確認重置
            </v-btn>
            <v-btn
              color="primary"
              @click="passwordW = false"
            >
              取消重置
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog v-model='modUserW' fullscreen hide-overlay transition='dialog-bottom-transition'>
        <v-card>
          <v-toolbar dark color='primary'>
            <v-btn icon dark @click='closemodUser'>
              <v-icon>fa-times</v-icon>
            </v-btn>
            <v-toolbar-title>修改使用者</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn icon dark @click='savemodUser'>
              <v-icon>fa-cloud-upload-alt</v-icon>
            </v-btn>
          </v-toolbar>
          <v-card-text class='pa-0 ma-0'>
            <v-alert type="info" icon="fa-exclamation-circle" class='ma-0'>
              如果你打算變更用戶的密碼，請用補發密碼功能，這裡是用來修改用戶資訊用的
            </v-alert>
            <v-container class='pa-5'>
              <v-row>
                <v-col class='pa-0 d-flex flex-column align-items-center'>
                  <v-avatar v-bind="attrs" v-on="on" size='48'>
                    <img :src='"https://avatars.dicebear.com/api/" + editingUser.types + "/" + encodeURIComponent(editingUser.name + "@" + editingUser.unit) + ".svg"' />
                  </v-avatar>
                  <div class="text-body-2 font-weight-bold">帳號創建於： {{ dateConvert(editingUser.createDate) }} </div>
                  <div class="text-body-2 font-weight-bold">帳號修改於： {{ dateConvert(editingUser.modDate) }} </div>
                  <v-text-field prepend-icon='fa-user-alt' label='用戶名稱' v-model='editingUser.name'></v-text-field>
                  <v-text-field prepend-icon='fa-building' label='用戶單位' v-model='editingUser.unit'></v-text-field>
                  <v-select
                    prepend-icon='fa-transgender-alt'
                    v-model='editingUser.types'
                    :items='types'
                    item-text='title'
                    item-value='value'
                    label='用戶性別'
                  ></v-select>
                  <span class='text-subtitle-1 font-weight-bold'>使用者標籤：</span><br/>
                  <tag-filter :mustSelected='false' @plusItem='plusTag' :single='false' :selectedItem='editingUser.tags' @valueUpdated='modTagUpdated' :candidatedItem='savedTags' :createable='true' label='請輸入使用者歸屬的標籤' />
                </v-col>
              </v-row>
              <v-row>
              </v-row>
            </v-container>
          </v-card-text>
        </v-card>
      </v-dialog>
      <v-dialog v-model='delUserW' fullscreen hide-overlay transition='dialog-bottom-transition'>
        <v-card>
          <v-toolbar dark color='primary'>
            <v-btn icon dark @click='delUserW = false'>
              <v-icon>fa-times</v-icon>
            </v-btn>
            <v-toolbar-title>刪除使用者</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn icon dark @click='removeUsers'>
              <v-icon>fa-cloud-upload-alt</v-icon>
            </v-btn>
          </v-toolbar>
          <v-card-text class='ma-0 pa-0'>
            <v-alert type="info" icon="fa-exclamation-circle">
                請注意，刪除使用者可能導致某些標籤下沒有成員，影響資料編輯，若發生如此情形，請記得日後手動添加成員到指定標籤
            </v-alert>
            <v-container class='pa-5'>
              <v-row>
                <v-col class='pa-0'>
                  <div class='text-subtitle-1 font-weight-bold'>要刪除的使用者分屬於以下幾個標籤</div>
                  <v-btn @click='checkTagUsers'>
                    <v-icon>fa-sort-numeric-down</v-icon>
                    確認各標籤用戶數量
                  </v-btn>
                  <v-simple-table>
                    <template v-slot:default>
                      <thead>
                        <tr>
                          <th class='text-center'>標籤名稱</th>
                          <th class='text-center'>標籤內用戶數量</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="item in tagList" :key="'remove' + item._id">
                          <td>{{ item.name }}</td>
                          <td>{{ item.count }}</td>
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
      <v-dialog v-model='addUserW' fullscreen hide-overlay transition='dialog-bottom-transition'>
          <v-card>
              <v-toolbar dark color='primary'>
                <v-btn icon dark @click='addUserW = false'>
                  <v-icon>fa-times</v-icon>
                </v-btn>
                <v-toolbar-title>新增使用者</v-toolbar-title>
                <v-spacer></v-spacer>
                <v-btn icon dark @click='createUsers'>
                  <v-icon>fa-cloud-upload-alt</v-icon>
                </v-btn>
              </v-toolbar>
              <v-card-text class='ma-0 pa-0'>
                <v-alert type="info" icon="fa-exclamation-circle">
                  由於本系統的用戶都是廠商、各校老師，因此新增用戶功能採用邀請制，這裡只能設定你要建立幾個User，系統會在下面出現邀請碼，你可以自己把邀請碼寄給使用者，讓他們填完自己的相關資料，你唯一能修改的只有用戶的標籤
                </v-alert>
                <v-container class='pa-5'>
                  <v-row>
                    <v-col class='d-flex flex-column'>
                      <tag-filter :mustSelected='false' @plusItem='plusTag' :single='false' :selectedItem='selectedAddTags' @valueUpdated='addTagUpdated' :candidatedItem='savedTags' :createable='true' label='請輸入使用者歸屬的標籤' />
                      <v-textarea
                        solo
                        v-model='newEmail'
                        label='請貼上用戶的Email'
                      ></v-textarea>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col class='d-flex flex-column'>
                      已記錄 {{ emailList.length + invalidEmailList.length }} 支Email，有 {{ invalidEmailList.length }} 支格式錯誤， {{ emailList.length }} 支格式正確
                      <v-simple-table v-if='invalidEmailList.length > 0'>
                        <template v-slot:default>
                          <thead>
                            <tr>
                              <th class='text-center'>錯誤的Email</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr v-for="item in invalidEmailList" :key="'invalid' + item">
                              <td>{{ item }}</td>
                            </tr>
                          </tbody>
                        </template>
                      </v-simple-table>
                    </v-col>
                  </v-row>
              </v-card-text>
          </v-card>
      </v-dialog>
      <v-dialog v-model="tagFilterW" persistent>
        <v-card>
          <v-card-title class="headline">設定標籤過濾</v-card-title>
          <v-card-text>
            <tag-filter :mustSelected='false' :single='false' :selectedItem='selectedFilterTags' @valueUpdated='filterTagUpdated' :candidatedItem='savedTags' :createable='false' label='請輸入您想篩選的使用者標籤' />
          </v-card-text>
          <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="brown darken-4" text @click="selectedFilterTags = ''">清除過濾標籤</v-btn>
          <v-btn color="green darken-1" text @click="tagFilterW = false">回到檢視畫面</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog v-model="termFilterW" persistent>
        <v-card>
          <v-card-title class="headline">搜尋用戶關鍵字</v-card-title>
          <v-card-text>
            <v-alert type="alert" icon="fa-exclamation-circle" class='ma-0'>系統會針對用戶的Email、帳號名稱、服務單位進行關鍵字搜尋（使用正規表達式，<a href='https://regex101.com/' target='_blank'>語法請看此</a>）</v-alert>
            <v-text-field label='搜尋關鍵字' prepend-icon='fa-search' v-model='queryTerm' full-width></v-text-field>
          </v-card-text>
          <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="deep-orange darken-4" text @click="termQuery">搜尋關鍵字</v-btn>
          <v-btn color="brown darken-4" text @click="userfilteredList = userList">清除搜尋結果</v-btn>
          <v-btn color="green darken-1" text @click="termFilterW = false">回到檢視畫面</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog v-model="tagUserW" persistent>
          <v-card>
              <v-card-title class="headline">設定用戶所屬標籤</v-card-title>
              <v-card-text>
                  <v-alert type="alert" icon="fa-exclamation-triangle" class='ma-0'>請注意選取你要複寫或是新增用戶標籤到使用者的帳號中</v-alert>
                  <v-switch
                    v-model="moduserTagMode"
                    label="啟動複寫模式（預設值是新增）"
                  ></v-switch>
                  <tag-filter @plusItem='plusTag' :single='false' :selectedItem='selectednewTags' @valueUpdated='newTagUpdated' :candidatedItem='savedTags' :createable='true' label='請輸入您想加入的使用者標籤' />
                  <div class='text-caption'>
                    目前選取的 {{ selectedUsers.length }} 個用戶的使用者標籤聯集為：
                    <v-simple-table>
                      <template v-slot:default>
                        <thead>
                            <tr>
                                <th class='text-center'>標籤名稱</th>
                                <th class='text-center'>標籤內用戶數量</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="item in tagList" :key="'remove' + item._id">
                                <td>{{ item.name }}</td>
                                <td>{{ item.count }}</td>
                            </tr>
                        </tbody>
                      </template>
                    </v-simple-table>
                  </div>
              </v-card-text>
              <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn @click='checkTagUsers'>
                <v-icon>fa-sort-numeric-down</v-icon>
                確認各標籤用戶數量
              </v-btn>
              <v-btn color="brown darken-4" text @click='modUserTags'>設定 {{ selectedUsers.length }} 個用戶的使用者標籤</v-btn>
              <v-btn color="green darken-1" text @click="closeTagW">回到檢視畫面</v-btn>
              </v-card-actions>
          </v-card>
      </v-dialog>
      <v-speed-dial style='margin-bottom: 80px' v-model="functionBtn" fixed bottom right direction="left" :open-on-hover="true" transition="slide-x-reverse-transition">
          <template v-slot:activator>
              <v-btn
                  v-model="functionBtn"
                  color="#006064"
                  dark
                  fab
              >
                  <v-icon v-if="functionBtn">fa-chevron-left</v-icon>
                  <v-icon v-else>fa-tools</v-icon>
              </v-btn>
          </template>
          <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-badge
                  color="red"
                  :content="selectedUsers.length"
                  :value="selectedUsers.length"
                  overlap
                >
                  <v-btn
                    fab
                    dark
                    small
                    color="#BF360C"
                    @click.stop='enableDelW'
                    v-bind="attrs" v-on="on"
                  >
                    <v-icon>fa-trash-alt</v-icon>
                  </v-btn>
                </v-badge>
              </template>
              <span>刪除 {{ selectedUsers.length }} 個用戶</span>
          </v-tooltip>
          <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-badge
                  color="red"
                  :content="selectedUsers.length"
                  :value="selectedUsers.length"
                  overlap
                >
                  <v-btn
                    fab
                    dark
                    small
                    color="green"
                    v-bind="attrs" v-on="on"
                    @click.stop='tagUserW = true'
                  >
                    <v-icon>fab fa-slack-hash</v-icon>
                  </v-btn>
                </v-badge>
              </template>
              <span>設定 {{ selectedUsers.length }} 個用戶的使用者標籤</span>
          </v-tooltip>
          <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                  <v-btn
                      fab
                      dark
                      small
                      color="indigo"
                      @click.stop='addUserW = true'
                      v-bind="attrs" v-on="on"
                  >
                      <v-icon>fa-plus</v-icon>
                  </v-btn>
              </template>
              <span>新增使用者</span>
          </v-tooltip>
      </v-speed-dial>
      <v-speed-dial v-model="filterBtn" fixed bottom right direction="left" :open-on-hover="true" transition="slide-x-reverse-transition">
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
          <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                  <v-btn
                      fab
                      dark
                      small
                      color="indigo darken-4"
                      @click.stop='robotFilter = !robotFilter'
                      v-bind="attrs" v-on="on"
                  >
                      <v-icon>fa-robot</v-icon>
                  </v-btn>
              </template>
              <span>{{ robotConvert(robotFilter) }}</span>
          </v-tooltip>
          <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                  <v-btn
                      fab
                      dark
                      small
                      color="green"
                      @click.stop='tagFilterW = true'
                      v-bind="attrs" v-on="on"
                  >
                      <v-icon>fab fa-slack-hash</v-icon>
                  </v-btn>
              </template>
              <span>設定標籤過濾</span>
          </v-tooltip>
          <v-tooltip bottom>
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
              <span>設定關鍵字過濾</span>
          </v-tooltip>
      </v-speed-dial>
      <v-list-item v-for='item in userfilteredList' :key='item._id'>
        <v-list-item-avatar>
          <v-avatar size="48">
            <img :src='"https://avatars.dicebear.com/api/" + item.types + "/" + encodeURIComponent(item.name + "@" + item.unit) + ".svg"' />
          </v-avatar>
        </v-list-item-avatar>
        <v-list-item-content class="text-left">
          <v-list-item-title>
            <span class='text-caption red--text' v-if='item.firstRun'>新用戶</span>
            {{ item.name }} @ {{ item.unit }}</v-list-item-title>
          <v-list-item-subtitle>
            <v-icon>fa-envelope-open</v-icon>
            {{item.email }}
            <v-icon :color="item.lineDate > 0 ? 'green accent-4' : 'grey darken-1'">fab fa-line</v-icon>
            <span v-if='item.lineDate > 0'>已於 {{ dateConvert(item.lineDate) }} 綁定LINE</span>
            <span v-else>未綁定LINE</span>
          </v-list-item-subtitle>
        </v-list-item-content>
        <v-list-item-action class='d-flex flex-row'>
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-btn icon v-bind="attrs" v-on="on" @click='modUser(item)'>
                <v-icon>fa-pencil-alt</v-icon>
              </v-btn>
            </template>
            <span>編輯用戶</span>
          </v-tooltip>
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-btn icon v-bind="attrs" v-on="on" @click='passwordReset(item)'>
                <v-icon>fa-key</v-icon>
              </v-btn>
            </template>
            <span>寄出密碼遺忘信</span>
          </v-tooltip>
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-btn icon v-bind="attrs" v-on="on" @click='setEmail(item)'>
                <v-icon>fa-at</v-icon>
              </v-btn>
            </template>
            <span>修改用戶Email</span>
          </v-tooltip>
          <v-checkbox off-icon="far fa-square" on-icon="fa-check-square" v-model='selectedUsers' :value='item'></v-checkbox>
        </v-list-item-action>
      </v-list-item>
    </v-sheet>
</template>

<script>
// @ is an alias to /src
import Vue from 'vue';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faUsersCog, faEnvelopeOpen } from '@fortawesome/free-solid-svg-icons';
import { faSlackHash } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import moment from 'moment';
import TagFilter from './modules/TagFilter';
import validator from 'validator';
import _ from 'lodash';

import '@fortawesome/fontawesome-free/css/all.css';

library.add(faUsersCog, faSlackHash, faEnvelopeOpen);
Vue.component('font-awesome-icon', FontAwesomeIcon);

export default {
    name: 'userMgnt',
    beforeDestroy () {
      this.$socket.client.off('checkTagUsers', this.socketcheckTagUsers);
      this.$socket.client.off('getUsers', this.socketgetUsers);
      this.$socket.client.off('getGlobalSettings', this.socketgetGlobalSettings);
      this.$socket.client.off('createUsers', this.socketcreateUsers);
      this.$socket.client.off('modUserTags', this.socketmodUserTags);
      this.$socket.client.off('removeUser', this.socketremoveUser);
      this.$socket.client.off('passwordReset', this.socketpasswordReset);
      this.$socket.client.off('checkEmail', this.socketcheckEmail);
      this.$socket.client.off('setEmail', this.socketsetEmail);
      this.$socket.client.off('modUsers', this.socketmodUsers);
    },
    created () {
      this.$emit('viewIn', {
        text: '使用者管理',
        icon: 'fa-users-cog',
        module: '帳號模組',
        location: '/userMgnt'
      });
      this.$socket.client.emit('getGlobalSettings');
      this.$socket.client.on('checkTagUsers', this.socketcheckTagUsers);
      this.$socket.client.on('getUsers', this.socketgetUsers);
      this.$socket.client.on('getGlobalSettings', this.socketgetGlobalSettings);
      this.$socket.client.on('createUsers', this.socketcreateUsers);
      this.$socket.client.on('modUserTags', this.socketmodUserTags);
      this.$socket.client.on('removeUser', this.socketremoveUser);
      this.$socket.client.on('passwordReset', this.socketpasswordReset);
      this.$socket.client.on('checkEmail', this.socketcheckEmail);
      this.$socket.client.on('setEmail', this.socketsetEmail);
      this.$socket.client.on('modUsers', this.socketmodUsers);
    },
    components: {
      TagFilter
    },
    computed: {
      filterColor: function () {
        return this.selectedFilterTags.length > 0 || this.queryTerm !== '' ? '#B71C1C' : '#00B0FF';
      },
      savedTags: function () {
        return this.$store.state.savedTags;
      }
    },
    watch: {
      newEmail: function () {
        this.invalidEmailList = [];
        this.emailList = [];
        let emailList = this.newEmail.split('\n');
        for (let i = 0; i < emailList.length; i++) {
          let email = emailList[i];
          if (!validator.isEmail(email)) {
            this.invalidEmailList.push(email);
          } else {
            this.emailList.push(email);
          }
        }
      },
      selectedFilterTags: function () {
        if (this.selectedFilterTags.length > 0) {
          let filteredList = [];
          for (let i = 0; i < this.selectedFilterTags.length; i++) {
            let searchTag = this.selectedFilterTags[i];
            filteredList.push(_.filter(this.userList, (u) => {
              return _.includes(u.tags, searchTag);
            }));
          }
          this.userfilteredList = _.flatten(filteredList);
        } else {
          this.userfilteredList = this.userList;
        }
      },
      selectedUsers: function () {
        let oriobj = this;
        if (this.selectedUsers.length > 0) {
          let tags = this.selectedUsers.map((item) => {
            return item.tags.map((tag) => {
              return tag;
            });
          });
          oriobj.tagList = [];
          let flatTag = _.uniq(_.flatten(tags));
          for(let i = 0; i < flatTag.length; i++) {
            let tag = flatTag[i];
            let tagObj = _.find(oriobj.savedTags, { _id: tag });
            oriobj.tagList.push({
              id: tagObj._id,
              name: tagObj.name,
              count: '請點選查詢按鈕'
            });
          }
        }
      },
      robotFilter: function () {
        let oriobj = this;
        if (this.robotFilter) {
          this.userfilteredList = this.userList.filter((item) => {
            if (item.tags.length > 0) {
              return item.tags.findIndex((tag) => {
                return tag !== oriobj.robotTag;
              }) > -1;
            } else {
              return true;
            }
          });
        } else {
          this.userfilteredList = this.userList;
        }
      },
      userList: function () {
        let oriobj = this;
        if (this.robotFilter) {
          this.userfilteredList = this.userList.filter((item) => {
            if (item.tags.length > 0) {
              return item.tags.findIndex((tag) => {
                return tag !== oriobj.robotTag;
              }) > -1;
            } else {
              return true;
            }
          });
        } else {
          this.userfilteredList = this.userList;
        }
      }
    },
    methods: {
      socketmodUsers: function (data) {
        this.$emit('toastPop', data.name + '的用戶資訊修改完成，寫入失敗的使用者標籤有' + data.zeroTag + '個');
      },
      socketsetEmail: function (data) {
        this.$emit('toastPop', data ? '修改完成' : '修改失敗，可能為該Email已重複');
      },
      socketcheckEmail: function (data) {
        this.$emit('toastPop', 'Email：' + data.email + '有' + data.count + '個重複');
      },
      socketpasswordReset: function (data) {
        this.$emit('toastPop', data.name + '的密碼已重置，記得通知用戶去收信啊');
        this.editingUser = {
          name: '',
          tags: []
        };
      },
      socketremoveUser: function (data) {
        this.delUserW = false;
        this.$emit('toastPop', '刪除' + data.processed + '/' + data.planned + '個用戶已完成');
      },
      socketmodUserTags: function (data) {
        this.$emit('toastPop', '為' + data.processed + '/' + data.planned + '個用戶的加上' + data.tags + '個使用者標籤已完成');
        if (data.zeroTag.length > 0) {
          this.doneMsg += '，' + JSON.stringify(data.zeroTag) + '等標籤由於剩餘用戶數小於1，因此無法將用戶移出';
        }
      },
      socketcreateUsers: function (data) {
        this.addUserW = false;
        this.$emit('toastPop', '新增' + data.processed + '/' + data.planned + '個用戶已完成');
      },
      socketgetGlobalSettings: function (data) {
        this.$socket.client.emit('getUsers');
        this.robotTag = data.robotTag;
      },
      socketgetUsers: function (data) {
        this.userList = data;
        this.selectedUsers = [];
      },
      socketcheckTagUsers: function (data) {
        let oriobj = this;
        for (let i = 0; i < data.length; i++) {
          let item = data[i];
          let tagObj = _.find(oriobj.tagList, { id: item._id });
          tagObj.count = item.count.length;
        }
      },
      closeEmailW: function () {
        this.emailW = false;
        this.editingUser = {
          name: '',
          tags: []
        };
      },
      checkEmail: function () {
        this.$socket.client.emit('checkEmail', this.editingUser.email);
      },
      setnewEmail: function () {
        this.$socket.client.emit('setEmail', {
          id: this.editingUser._id,
          email: this.editingUser.email
        });
      },
      closemodUser: function () {
        this.modUserW = false;
        this.editingUser = {
          name: '',
          tags: []
        };
      },
      checkTagUsers: function () {
        this.$socket.client.emit('checkTagUsers', _.map(this.tagList, (item) => {
          return item.id;
        }));
      },
      savemodUser: function () {
        this.$socket.client.emit('modUsers', this.editingUser);
      },
      sendpasswordReset: function () {
        this.$emit('toastPop', '密碼重置中，請稍後，會另有訊息通知伺服器操作已完成...');
        this.$socket.client.emit('passwordReset', this.editingUser._id);
        this.passwordW = false;
      },
      modUser: function (obj) {
        this.modUserW = true;
        this.editingUser = obj;
      },
      passwordReset: function (obj) {
        this.passwordW = true;
        this.editingUser = obj;
      },
      setEmail: function (obj) {
        this.emailW = true;
        this.editingUser = obj;
      },
      createUsers: function () {
        this.$emit('toastPop', '新增用戶中，請稍後，會另有訊息通知操作已完成...');
        this.$socket.client.emit('createUsers', {
          email: this.emailList,
          tags: this.selectedAddTags
        });
      },
      removeUsers: function () {
        this.$socket.client.emit('removeUser', this.selectedUsers);
      },
      closeTagW: function () {
        this.tagUserW = false;
        this.selectednewTags = [];
      },
      modUserTags: function () {
        this.$socket.client.emit('modUserTags', {
            users: this.selectedUsers,
            tags: this.selectednewTags,
            mode: this.moduserTagMode
        });
      },
      newTagUpdated: function (value) {
          this.selectednewTags = value;
      },
      plusTag: function (val) {
          this.$socket.client.emit('addTag', val);
      },
      termQuery: function () {
        this.userfilteredList = this.userList.filter((item) => {
          let regex = new RegExp(this.queryTerm, 'g');
          return regex.test(item.name) || regex.test(item.email) || regex.test(item.unit);
        });
      },
      robotConvert: function (robot) {
        return robot ? '過濾機器人' : '不過濾機器人';
      },
      enableDelW: function () {
        if (this.selectedUsers.length > 0) {
          this.delUserW = true;
        }
      },
      dateConvert: function (time) {
        return time === 0 ? '尚未設定' : moment.unix(time).format('YYYY/MM/DD HH:mm:ss');
      },
      filterTagUpdated: function (val) {
        this.selectedFilterTags = val;
      },
      addTagUpdated: function (val) {
        this.selectedAddTags = val;
      },
      modTagUpdated: function (val) {
        this.editingUser.tags = val;
      }
    },
    data () {
      return {
        moduserTagMode: false,
        emailW: false,
        passwordW: false,
        editingUser: {
          name: '',
          tags: []
        },
        invalidEmailList: [],
        emailList: [],
        tagUserW: false,
        robotFilter: true,
        functionBtn: false,
        tagFilterW: false,
        termFilterW: false,
        filterBtn: false,
        newEmail: '',
        expiredDate: 0,
        selectedUsers: [],
        newUserQuantity: 1,
        addUserW: false,
        modUserW: false,
        delUserW: false,
        queryTerm: '',
        selectedFilterTags: [],
        selectedAddTags: [],
        tagList: [],
        userList: [],
        userfilteredList: [],
        robotTag: null,
        selectednewTags: [],
        types: [
          {
            title: '男',
            value: 'male'
          },
          {
            title: '女',
            value: 'female'
          },
          {
            title: '不想說',
            value: 'human'
          }
        ]
      };
    }
};
</script>
