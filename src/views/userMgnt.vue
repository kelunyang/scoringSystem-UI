<template>
    <v-sheet>
      <v-dialog
        v-model="emailW"
        persistent
        max-width="50vw"
      >
        <v-card>
          <v-toolbar dark color='primary'>
            <v-toolbar-title>Email修改： {{ editingUser.name }}</v-toolbar-title>
          </v-toolbar>
          <v-card-text class='text-left black--text text-body-1'>
            <v-alert outlined type="alert" icon='fa-exclamation-triangle' class='text-left'>請注意，使用者登入時是依據Email登入，因此Email不可重複</v-alert>
            <v-text-field outlined clearable dense prepend-icon='fa-at' label='用戶Email' v-model='editingUser.email'></v-text-field>
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
          <v-toolbar dark color='primary'>
            <v-toolbar-title>密碼重置： {{ editingUser.name }}</v-toolbar-title>
          </v-toolbar>
          <v-card-text class='text-left black--text text-body-1'>
            請注意，當你按下確認按鈕之後，用戶的舊密碼就會被系統系統預設密碼（{{ defaultPassword }}）複寫，基於資訊安全，請務必確認主機的Email伺服器設定正確，然後用戶也收的到這封信，並立刻修改密碼！
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
          <v-card-text class='pa-0 ma-0 text-left black--text text-body-1'>
            <v-alert outlined type="info" icon='fa-info-circle' class='text-left'>
              如果你打算變更用戶的密碼，請用補發密碼功能，這裡是用來修改用戶資訊用的
            </v-alert>
            <v-container class='pa-5'>
              <v-row>
                <v-col class='pa-0 d-flex flex-column align-items-center'>
                  <v-avatar v-bind="attrs" v-on="on" size='48'>
                    <Avatar :user='editingUser' :size='48'/>
                  </v-avatar>
                  <div class="text-body-2 font-weight-bold">帳號創建於： {{ dateConvert(editingUser.createDate) }} </div>
                  <div class="text-body-2 font-weight-bold">帳號修改於： {{ dateConvert(editingUser.modDate) }} </div>
                  <v-text-field outlined clearable dense prepend-icon='fa-user-alt' label='用戶名稱' v-model='editingUser.name'></v-text-field>
                  <v-text-field outlined clearable dense prepend-icon='fa-building' label='用戶單位' v-model='editingUser.unit'></v-text-field>
                  <v-select
                    prepend-icon='fa-transgender-alt'
                    v-model='editingUser.types'
                    :items='types'
                    item-text='title'
                    item-value='value'
                    label='用戶性別'
                    outlined
                  ></v-select>
                  <span class='text-subtitle-1 font-weight-bold'>使用者標籤：</span><br/>
                  <tag-filter
                    :mustSelected='false'
                    @updateTags='updateTags'
                    @plusItem='plusTag'
                    :single='false'
                    :selectedItem='editingUser.tags'
                    @valueUpdated='modTagUpdated'
                    :candidatedItem='savedTags'
                    :createable='true'
                    label='請輸入使用者歸屬的標籤'
                  />
                  <v-btn @click='savemodUser'>
                    儲存設定
                  </v-btn>
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
            <v-alert outlined type="info" icon='fa-info-circle' class='text-left'>
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
            <v-btn icon dark @click='closeAddW'>
              <v-icon>fa-times</v-icon>
            </v-btn>
            <v-toolbar-title>新增使用者</v-toolbar-title>
          </v-toolbar>
          <v-card-text class='ma-0 pa-0'>
            <v-alert outlined type="info" icon='fa-info-circle' class='text-left'>
              你可以下載範本檔後，把使用者的email和相關資訊都編輯好之後上傳，各用戶的歸屬標籤也會自動建立，請注意，如果你懶得設定密碼，密碼欄位留空，就會填入預設密碼（{{ defaultPassword }}）
            </v-alert>
            <v-alert outlined type="info" icon='fas fa-database' class='text-left' v-if='!listParsed'>
              請稍後，正在匯入使用者清單中...<span v-if='currentCreated !== ""'>{{ currentCreated }}</span>
            </v-alert>
            <v-container class='pa-5'>
              <v-row>
                <v-col class='d-flex flex-column'>
                  <v-btn @click='downloadCSV(sampleList,"範例用戶清單")'>按此下載範例CSV</v-btn>
                  <v-file-input
                    prepend-icon="fa-paperclip" 
                    v-model="userlistFile" 
                    label='上傳使用者清單' 
                    accept="text/csv"
                    :loading="uploadprogress !== 0">
                    <template v-slot:progress>
                      <v-progress-circular :value="uploadprogress"></v-progress-circular>速度：{{ uploadstatus }}
                    </template>
                  </v-file-input>
                  <div class='gray--text text-caption'>{{ importStatus }}</div>
                </v-col>
              </v-row>
              <v-row>
                <v-col class='d-flex flex-column'>
                  <v-simple-table v-if='usersConfirm.length > 0'>
                    <template v-slot:default>
                      <thead>
                        <tr>
                          <th
                            class="text-center"
                          >
                            &nbsp;
                          </th>
                          <th class='text-left'>&nbsp;</th>
                          <th
                            class="text-left"
                          >
                            姓名
                          </th>
                          <th
                            class="text-left"
                          >
                            Email
                          </th>
                          <th
                            class="text-left"
                          >
                            密碼
                          </th>
                          <th
                            class="text-left"
                          >
                            服務單位
                          </th>
                          <th
                            class="text-left"
                          >
                            群組標籤
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr
                          v-for="user in usersConfirm"
                          :key="user._id"
                        >
                          <td class="text-center">
                            <v-icon v-if='user.valid'>fa-check</v-icon>
                            <v-icon v-else>fa-times</v-icon>
                          </td>
                          <td class='text-left'>
                            <span v-if='user.emailExist'>[Email重複]</span>
                            <span v-if='user.emailInvalid'>[Email格式錯誤]</span>
                          </td>
                          <td class="text-left">{{ user.name }}</td>
                          <td class="text-left">
                            {{ user.email }}
                          </td>
                          <td class="text-left">{{ user.password === "" ? "預設密碼" : user.password }}</td>
                          <td class="text-left">{{ user.unit }}</td>
                          <td class="text-left">{{ getTagname(user.tags) }}</td>
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
      <v-dialog v-model="tagUserW" persistent>
          <v-card>
            <v-toolbar color='primary'>
              <v-toolbar-title>設定用戶所屬標籤</v-toolbar-title>
            </v-toolbar>
            <v-card-text>
                <v-alert outlined type="alert" icon='fa-exclamation-triangle' class='text-left'>請注意選取你要複寫或是新增用戶標籤到使用者的帳號中，然後，記得按右下方的儲存設定，才會把變更存起來</v-alert>
                <v-switch
                  v-model="moduserTagMode"
                  label="啟動複寫模式（預設值是新增）"
                ></v-switch>
                <tag-filter
                  @updateTags='updateTags'
                  @plusItem='plusTag'
                  :single='false'
                  :selectedItem='selectednewTags'
                  @valueUpdated='newTagUpdated'
                  :candidatedItem='savedTags'
                  :createable='true'
                  label='請輸入您想加入的使用者標籤'
                />
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
              <v-btn class='indigo darken-4 white--text' @click='checkTagUsers'>確認各標籤用戶數量</v-btn>
              <v-btn class="red darken-4 white--text" @click='modUserTags'>儲存用戶標籤設定</v-btn>
              <v-btn @click="closeTagW">回到檢視畫面</v-btn>
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
                  @click.stop='openAddW'
                  v-bind="attrs" v-on="on"
              >
                  <v-icon>fa-plus</v-icon>
              </v-btn>
          </template>
          <span>新增使用者</span>
        </v-tooltip>
      </v-speed-dial>
      <v-fab-transition>
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
              <v-btn
                fab
                dark
                bottom
                right
                fixed
                color="indigo darken-4"
                @click.stop='robotFilter = !robotFilter'
                v-bind="attrs" v-on="on"
              >
                <v-icon>fa-robot</v-icon>
              </v-btn>
          </template>
          <span>{{ robotConvert(robotFilter) }}</span>
        </v-tooltip>
      </v-fab-transition>
      <div class='d-flex flex-row'>
        <v-text-field outlined clearable dense class='flex-grow-1' label='搜尋關鍵字' prepend-icon='fa-search' v-model='queryTerm' hint='系統會針對用戶的Email、帳號名稱、服務單位進行關鍵字搜尋（可使用正規表達式）'></v-text-field>
        <v-btn color='indigo darken-4' class='white--text ma-1' @click="termQuery">搜尋</v-btn>
        <v-btn color="brown darken-4" class='white--text ma-1' @click="userfilteredList = userList">清除</v-btn>
      </div>
      <div class='d-flex flex-row'>
        <tag-filter
          class='flex-grow-1'
          @updateTags='updateTags'
          :mustSelected='false'
          :single='false'
          :selectedItem='selectedFilterTags'
          @valueUpdated='filterTagUpdated'
          :candidatedItem='savedTags'
          :createable='false'
          label='請輸入您想篩選的使用者標籤'
        />
        <v-btn color="brown darken-4" class='white--text flex-shrink-1' @click="selectedFilterTags = ''">清除過濾標籤</v-btn>
      </div>
      <div class='blue-grey--text darken-1 text-caption'>已篩選出{{ userfilteredList.length }}個用戶，為節省資源，不會全部展現出來，往下滑會載入更多</div>
      <v-lazy
        :options="{
          threshold: 0.5
        }"
        min-height="70"
        transition="fade-transition"
        v-for='item in userfilteredList' :key='item._id'
      >
        <v-list-item>
          <v-list-item-avatar>
            <v-avatar size="48">
              <Avatar :user='item' :size='48'/>
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
      </v-lazy>
    </v-sheet>
</template>

<script>
// @ is an alias to /src
import Vue from 'vue';
import dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';
import Papa from 'papaparse';
import _filter from 'lodash/filter';
import _includes from 'lodash/includes';
import _flatten from 'lodash/flatten';
import _uniq from 'lodash/uniq';
import _find from 'lodash/find';
import _map from 'lodash/map';
import prettyBytes from 'pretty-bytes';
let files = [];

export default {
    name: 'userMgnt',
    beforeDestroy () {
      this.$socket.client.off('checkTagUsers', this.socketcheckTagUsers);
      this.$socket.client.off('getUsers', this.socketgetUsers);
      this.$socket.client.off('getGlobalSettings', this.socketgetGlobalSettings);
      this.$socket.client.off('modUserTags', this.socketmodUserTags);
      this.$socket.client.off('removeUser', this.socketremoveUser);
      this.$socket.client.off('passwordReset', this.socketpasswordReset);
      this.$socket.client.off('checkEmail', this.socketcheckEmail);
      this.$socket.client.off('setEmail', this.socketsetEmail);
      this.$socket.client.off('modUsers', this.socketmodUsers);
      this.$socket.client.off('userlistUploadError', this.socketuserlistUploadError);
      this.$socket.client.off('requestuserlistSlice', this.socketrequestuserlistSlice);
      this.$socket.client.off('userlistUploadDone', this.socketuserlistUploadDone);
      this.$socket.client.off('userlistParsed', this.socketuserlistParsed);
      this.$socket.client.off('usercreateReport', this.socketusercreateReport);
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
      this.$socket.client.on('modUserTags', this.socketmodUserTags);
      this.$socket.client.on('removeUser', this.socketremoveUser);
      this.$socket.client.on('passwordReset', this.socketpasswordReset);
      this.$socket.client.on('checkEmail', this.socketcheckEmail);
      this.$socket.client.on('setEmail', this.socketsetEmail);
      this.$socket.client.on('modUsers', this.socketmodUsers);
      this.$socket.client.on('userlistUploadError', this.socketuserlistUploadError);
      this.$socket.client.on('requestuserlistSlice', this.socketrequestuserlistSlice);
      this.$socket.client.on('userlistUploadDone', this.socketuserlistUploadDone);
      this.$socket.client.on('userlistParsed', this.socketuserlistParsed);
      this.$socket.client.on('usercreateReport', this.socketusercreateReport);
    },
    components: { 
      TagFilter: () => import(/* webpackChunkName: 'TagFilter', webpackPrefetch: true */ './modules/TagFilter'),
      Avatar: () => import(/* webpackChunkName: 'Avatar', webpackPrefetch: true */ './modules/Avatar')
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
      selectedFilterTags: function () {
        if (this.selectedFilterTags.length > 0) {
          let filteredList = [];
          for (let i = 0; i < this.selectedFilterTags.length; i++) {
            let searchTag = this.selectedFilterTags[i];
            filteredList.push(_filter(this.userList, (u) => {
              return _includes(u.tags, searchTag);
            }));
          }
          this.userfilteredList = _flatten(filteredList);
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
          let flatTag = _uniq(_flatten(tags));
          for(let i = 0; i < flatTag.length; i++) {
            let tag = flatTag[i];
            let tagObj = _find(oriobj.savedTags, { _id: tag });
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
      },
      userlistFile: {
        immediate: true,
        handler () {
          if (this.userlistFile !== undefined) {
            let oriobj = this;
            let fileReader = new FileReader();
            let slice = this.userlistFile.slice(0, 100000);
            let uuid = uuidv4();
            files[uuid] = {
              file: this.userlistFile,
            };
            fileReader.readAsArrayBuffer(slice);
            fileReader.onload = () => {
              var arrayBuffer = fileReader.result;
              oriobj.$socket.client.emit('importUserlist', {
                uuid: uuid,
                name: oriobj.userlistFile.name,
                type: oriobj.userlistFile.type,
                size: oriobj.userlistFile.size,
                data: arrayBuffer
              });
            };
          }
        }
      }
    },
    methods: {
      socketusercreateReport: function(data) {
        this.currentCreated = "（[" + (data.count+1) + '/' + data.total + ']' + data.name + "）";
      },
      getTagname: function(tag) {
        return _map(tag, (item) => {
          let created = item.newItem ? '[新建]' : '';
          return item.name + created;
        });
      },
      closeAddW: function() {
        this.$socket.client.emit('getUsers');
        this.updateTags();
        this.addUserW = false;
      },
      openAddW: function() {
        this.usersConfirm = [];
        this.listParsed = true;
        this.addUserW = true;
      },
      socketuserlistParsed: function (data) {
        this.listParsed = true;
        this.currentCreated = "";
        this.usersConfirm = data;
      },
      socketuserlistUploadDone: function () {
        let oriobj = this;
        this.userlistFile = undefined;
        this.uploadprogress = 100;
        this.uploadstatus = '完成！';
        this.listParsed = false;
        Vue.nextTick(() => {
          oriobj.uploadprogress = 0;
          oriobj.uploadstatus = '';
        });
      },
      socketuserlistUploadError: function (data) {
        this.$emit('toastPop', '上傳失敗（原因：' + data + '），請聯絡管理員');
        this.uploadprogress = 0;
        this.uploadstatus = '';
      },
      socketrequestuserlistSlice: function (data) {
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
          oriobj.$socket.client.emit('importUserlist', {
            uuid: data.uuid,
            name: files[data.uuid].file.name,
            type: files[data.uuid].file.type,
            size: files[data.uuid].file.size,
            data: arrayBuffer
          });
        };
      },
      updateTags: function() {
        this.$emit('updateTags');
      },
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
      },
      socketgetGlobalSettings: function (data) {
        this.$socket.client.emit('getUsers');
        this.robotTag = data.robotTag;
        this.defaultPassword = data.defaultPassword;
      },
      socketgetUsers: function (data) {
        this.userList = data;
        this.selectedUsers = [];
      },
      socketcheckTagUsers: function (data) {
        let oriobj = this;
        for (let i = 0; i < data.length; i++) {
          let item = data[i];
          let tagObj = _find(oriobj.tagList, { id: item._id });
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
        this.$socket.client.emit('checkTagUsers', _map(this.tagList, (item) => {
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
        if(this.usersConfirm.length > 0) {
          this.$emit('toastPop', '新增用戶中，請稍後，會另有訊息通知操作已完成...');
          this.$socket.client.emit('createUsers', this.usersConfirm);
        } else {
          this.$emit('toastPop', '待新增用戶清單為空，無法上傳！');
        }
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
        this.$emit('addTag', val);
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
        return time === 0 ? '尚未設定' : dayjs.unix(time).format('YYYY/MM/DD HH:mm:ss');
      },
      filterTagUpdated: function (val) {
        this.selectedFilterTags = val;
      },
      modTagUpdated: function (val) {
        this.editingUser.tags = val;
      },
      downloadCSV: function(arr, filename) {
        let output = "\ufeff"+ Papa.unparse(arr);
        let element = document.createElement('a');
        let blob = new Blob([output], { type: 'text/csv' });
        let url = window.URL.createObjectURL(blob);
        element.setAttribute('href', url);
        element.setAttribute('download', filename + ".csv");
        element.click();
      }
    },
    data () {
      return {
        currentCreated: "",
        sampleList: [
          {
            "姓名": "諸葛村夫",
            "密碼": "",
            "服務單位": "大漢",
            "email": "aaa@aaa.com",
            "群組標籤": "南陽,蜀地"
          },
          {
            "姓名": "艾莎",
            "密碼": "",
            "服務單位": "迪士尼",
            "email": "bbb@bbb.com",
            "群組標籤": "東京,加州"
          },
        ],
        listParsed: true,
        usersConfirm: [],
        userlistFile: undefined,
        uploadstatus: '',
        uploadprogress: 0,
        defaultPassword: '0000',
        moduserTagMode: false,
        emailW: false,
        passwordW: false,
        editingUser: {
          name: '',
          tags: []
        },
        tagUserW: false,
        robotFilter: true,
        functionBtn: false,
        filterBtn: false,
        expiredDate: 0,
        selectedUsers: [],
        newUserQuantity: 1,
        addUserW: false,
        modUserW: false,
        delUserW: false,
        queryTerm: '',
        selectedFilterTags: [],
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
