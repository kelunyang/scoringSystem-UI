<template>
  <v-sheet class='pa-0 d-flex flex-column'>
    <v-dialog v-model='logW' fullscreen hide-overlay transition='dialog-bottom-transition'>
      <v-card>
        <v-toolbar dark color='primary'>
          <v-btn icon dark @click='logW = false'>
            <v-icon>fa-times</v-icon>
          </v-btn>
          <v-toolbar-title>機器人執行記錄檔</v-toolbar-title>
        </v-toolbar>
        <v-card-text class='text-left black--text text-body-1 pa-0'>
          <v-simple-table v-if="botLog.length > 0" class='black--text'>
            <template v-slot:default>
              <thead>
                <tr>
                  <th class="text-left">執行時間</th>
                  <th class="text-left">執行內容</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="log in botLog"
                  :key="log._id"
                >
                  <td class="text-left">
                    {{ dateConvert(log.tick) }}
                  </td>
                  <td class="text-left">
                    {{ log.action }}
                  </td>
                </tr>
              </tbody>
            </template>
          </v-simple-table>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-dialog v-model='ntemplateW' fullscreen hide-overlay transition='dialog-bottom-transition'>
      <v-card>
        <v-toolbar dark color='primary'>
          <v-btn icon dark @click='closeNTemplate'>
            <v-icon>fa-times</v-icon>
          </v-btn>
          <v-toolbar-title>設定通知範本</v-toolbar-title>
        </v-toolbar>
        <v-card-text class='text-left black--text text-body-1 pa-0'>
          <v-alert type='info' icon="fa-info">設定完畢後，請按右上角X關閉對話框，上次啟動時間：{{ dateConvert(cnTemplate.sendTick) }}</v-alert>
          <v-sheet class='pa-1 d-flex flex-column'>
            <v-switch v-model="cnTemplate.status" label="啟動本範本"></v-switch>
            <v-slider
              label='範本執行時間（幾點執行）'
              min='0'
              max='23'
              v-model="cnTemplate.setTick"
              thumb-label
            ></v-slider>
            <v-slider
              label='範本執行時間（幾點執行）'
              min='1'
              max='14'
              v-model="cnTemplate.durationDay"
              thumb-label
            ></v-slider>
            <v-text-field label='標題' hint='請簡述一下這個範本是什麼，標題不會寄出，只是備忘而已' outlined clearable dense v-model='cnTemplate.title'></v-text-field>
            <tag-filter
              :mustSelected='true'
              :single='false'
              @updateTags='updateTags'
              @plusItem='plusTag'
              :selectedItem='cnTemplate.group'
              @valueUpdated='updatecnGroup'
              :candidatedItem='savedTags'
              :createable='true'
              label='請輸入接收本訊息範本的群組'
            />
            <v-textarea
              outlined
              clearable
              counter
              clear-icon="fa-times"
              v-model="cnTemplate.body"
              rows="3"
              hint="這是LINE訊息，別打太多字"
            />
            <div>您可以在訊息中嵌入以下關鍵字，系統會自動發出對應訊息：
              <ol>
                <li><span class='text-weight-black blue--text darken-4'>{newUploads}</span>N個新檔案未讀</li>
                <li><span class='text-weight-black blue--text darken-4'>{newIssues}</span>N個新Issue未讀</li>
                <li><span class='text-weight-black blue--text darken-4'>{expiredKBs}</span>N個過期的知識點</li>
              </ol>
            </div>
          </v-sheet>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-fab-transition>
      <v-btn
        color="pink"
        fixed
        fab
        large
        dark
        bottom
        right
        @click='saveSetting'
      >
        <v-icon>{{ icontype }}</v-icon>
      </v-btn>
    </v-fab-transition>
    <div class='text-h5 text-center pt-5 font-weight-black'>全域設定設定</div>
    <v-divider inset></v-divider>
    <v-text-field outlined clearable dense label='網站名稱' v-model='systemName'></v-text-field>
    <v-text-field label='網站網址' outlined clearable dense v-model='siteLocation'></v-text-field>
    <v-text-field label='用戶預設密碼（系統預設值為0000）' outlined clearable dense v-model='defaultPassword'></v-text-field>
    <v-select
      outlined
      :items='frontendCommits'
      label='系統前端版本'
      v-model='versionFrontend'
      item-text="commitDate"
      item-value="id"
    >
      <template slot="selection" slot-scope="data">
        <span>{{ githubConvert(data.item) }}</span>
      </template>
      <template slot="item" slot-scope="data">
        <span>{{ githubConvert(data.item) }}</span>
      </template>
    </v-select>
    <div class='text-caption red--text'>如果你發現預設沒有選到東西，那代表你太久沒來這裡選一下新版本的commit（記得要先做git pull）</div>
    <v-select
      outlined
      :items='backendCommits'
      label='系統後端版本'
      v-model='versionBackend'
      item-text="commitDate"
      item-value="id"
    >
      <template slot="selection" slot-scope="data">
        <span>{{ githubConvert(data.item) }}</span>
      </template>
      <template slot="item" slot-scope="data">
        <span>{{ githubConvert(data.item) }}</span>
      </template>
    </v-select>
    <div class='text-caption red--text'>如果你發現預設沒有選到東西，那代表你太久沒來這裡選一下新版本的commit（記得要先做git pull）</div>
    <v-select
      outlined
      :items='botCommits'
      label='機器人版本'
      v-model='versionBot'
      item-text="commitDate"
      item-value="id"
    >
      <template slot="selection" slot-scope="data">
        <span>{{ githubConvert(data.item) }}</span>
      </template>
      <template slot="item" slot-scope="data">
        <span>{{ githubConvert(data.item) }}</span>
      </template>
    </v-select>
    <div class='text-caption red--text'>如果你發現預設沒有選到東西，那代表你太久沒來這裡選一下新版本的commit（記得要先做git pull）</div>
    <v-text-field outlined clearable dense label='檔案儲存位置' v-model='storageLocation' hint='請注意，這裡是檔案儲存位置指的是NFS主機上的位置，不知道別亂調，最後不用加上/'></v-text-field>
    <v-text-field outlined clearable dense label='Github Personal Token' v-model='githubKey' hint='請注意，這是GitHub產生的Personal Token'></v-text-field>
    <v-text-field outlined clearable dense label='前端Github Repo位置' v-model='frontendRepo' hint='請注意，這是前端專案在GitHub的位置'></v-text-field>
    <v-text-field outlined clearable dense label='後端Github Repo位置' v-model='backendRepo' hint='請注意，這是後端專案在GitHub的位置'></v-text-field>
    <v-text-field outlined clearable dense label='機器人Github Repo位置' v-model='botRepo' hint='請注意，這是後端專案在GitHub的位置'></v-text-field>
    <div class='text-h5 text-center pt-5 font-weight-black'>權限設定</div>
    <v-divider inset></v-divider>
    <div class='text-subtitle-2 font-weight-blod'>用戶連線中定時更新時間</div>
    <div class='red--text text-caption'>這裡指的是用戶端多久跟伺服器更新同時線上用戶、用戶權限的等待時間</div>
    <v-slider
      label='用戶連線中定時更新時間（分鐘）'
      min='5'
      max='120'
      v-model="userCheckTime"
      thumb-label
    ></v-slider>
    <div class='text-subtitle-2 font-weight-blod'>用戶連線逾時時間</div>
    <v-slider
      label='用戶連線逾時時間（秒）'
      min='1'
      max='10'
      v-model="connectionTimeout"
      thumb-label
    ></v-slider>
    <div class='text-subtitle-2 font-weight-blod'>授權系統設定功能的使用者標籤</div>
    <tag-filter
      :mustSelected='true'
      :single='false'
      @updateTags='updateTags'
      @plusItem='plusTag'
      :selectedItem='selectedSysTags'
      @valueUpdated='updateSysTag'
      :candidatedItem='savedTags'
      :createable='true'
      label='請輸入授權系統設定功能的使用者標籤'
    />
    <div class='text-subtitle-2 font-weight-blod'>授權用戶管理功能的使用者標籤</div>
    <tag-filter
      :mustSelected='true'
      :single='false'
      @updateTags='updateTags'
      @plusItem='plusTag'
      :selectedItem='selectedUsrTags'
      @valueUpdated='updateUsrTag'
      :candidatedItem='savedTags'
      :createable='true'
      label='請輸入授權用戶管理功能的使用者標籤'
    />
    <div class='text-subtitle-2 font-weight-blod'>授權知識點管理功能的使用者標籤</div>
    <tag-filter
      :mustSelected='true'
      :single='false'
      @updateTags='updateTags'
      @plusItem='plusTag'
      :selectedItem='selectedflowTags'
      @valueUpdated='updateFlowTag'
      :candidatedItem='savedTags'
      :createable='true'
      label='請輸入授權知識點管理功能的使用者標籤'
    />
    <div class='text-subtitle-2 font-weight-blod'>授權統計功能的使用者標籤</div>
    <tag-filter
      :mustSelected='true'
      :single='false'
      @updateTags='updateTags'
      @plusItem='plusTag'
      :selectedItem='selectedstatisticsTags'
      @valueUpdated='updateStatisticsTag'
      :candidatedItem='savedTags'
      :createable='true'
      label='請輸入授權使用統計功能的使用者標籤'
    />
    <div class='text-subtitle-2 font-weight-blod'>顯示在系統資訊頁的使用者標籤</div>
    <tag-filter
      :mustSelected='true'
      :single='false'
      @updateTags='updateTags'
      @plusItem='plusTag'
      :selectedItem='selectedserviceTags'
      @valueUpdated='updateServiceTag'
      :candidatedItem='savedTags'
      :createable='true'
      label='請輸入顯示在系統資訊頁的使用者標籤'
    />
    <div class='text-subtitle-2 font-weight-blod'>機器人的使用者標籤</div>
    <tag-filter
      :mustSelected='true'
      :single='true'
      @updateTags='updateTags'
      @plusItem='plusTag'
      :selectedItem='selectedrobotTag'
      @valueUpdated='updateRobotTag'
      :candidatedItem='savedTags'
      :createable='true'
      label='請輸入授權用戶管理功能的使用者標籤'
    />
    <div class='text-h5 text-center pt-5 font-weight-black'>機器人巡邏參數</div>
    <v-divider inset></v-divider>
    <v-slider
      label='機器人定期執行時間（小時）'
      min='0'
      max='23'
      v-model="patrolHour"
      thumb-label
    ></v-slider>
    <div class='text-subtitle-2 font-weight-blod'>機器人代表帳號</div>
    <tag-filter
      :mustSelected='true'
      :single='true'
      :selectedItem='PatrolAccount'
      @valueUpdated='updateRobatAccount'
      :candidatedItem='savedUsers'
      :createable='false'
      @updateTags='updateUsers'
      label='請輸入巡邏機器人代表帳號'
    />
    <div class='text-subtitle-2 font-weight-blod'>無人操作代表帳號</div>
    <tag-filter
      :mustSelected='true'
      :single='true'
      :selectedItem='nobodyAccount'
      @valueUpdated='updateNobodyAccount'
      :candidatedItem='savedUsers'
      @updateTags='updateUsers'
      :createable='false'
      label='請輸入紀錄機器人代表帳號'
    />
    <v-text-field outlined clearable dense label='EMail帳號' v-model='mailAccount' hint='請注意，這是在Google/Outlook.com裡建立的應用程式帳號'></v-text-field>
    <v-text-field outlined clearable dense label='EMail密碼' v-model='mailPassword' hint='請注意，這是在Google/Outlook.com裡建立的應用程式密碼'></v-text-field>
    <v-text-field outlined clearable dense label='EMail主機' v-model='mailSMTP' hint='請貼上你的主機的SMTP位置'></v-text-field>
    <v-text-field outlined clearable dense label='EMail Port' v-model='mailPort' hint='請貼上你的主機的SMTP port'></v-text-field>
    <v-switch v-model="mailSSL" label="SMTP是否有SSL"></v-switch>
    <v-text-field outlined clearable dense label='LINE Notify client id' v-model='LINENotifyKey' hint='請注意，這是在LINE notify裡建立取得的client key'></v-text-field>
    <v-text-field outlined clearable dense label='LINE Notify secret key' v-model='LINESecretKey' hint='請注意，這是在LINE notify裡取得的secret'></v-text-field>
    <v-slider
      label='通知執行時間（小時）'
      min='0'
      max='23'
      v-model="notifyHour"
      thumb-label
    ></v-slider>
    <v-slider
      label='死線設定（小時）'
      min='24'
      max='168'
      v-model="robotDeadLine"
      thumb-label
    ></v-slider>
    <v-slider
      label='定期匯報（天）'
      min='1'
      max='21'
      v-model="reportDuration"
      thumb-label
    ></v-slider>
    <v-btn @click="getrobotLog('通知機器人')">查看通知機器人執行紀錄</v-btn>
    <v-simple-table v-if="ntemplateList.length > 0" class='black--text'>
      <template v-slot:default>
        <thead>
          <tr>
            <th class="text-left">上次發送時間</th>
            <th class="text-left">標題</th>
            <th class="text-left">涉及群組</th>
            <th class="text-left">編修者</th>
            <th class="text-left">編修時間</th>
            <th class="text-left">&nbsp;</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="ntemplate in ntemplateList"
            :key="ntemplate._id"
          >
            <td class="text-left">
              {{ ntemplate.status ? '已啟動' : '未啟動' }}<br/>
              (每天{{ ntemplate.setTick }}點/{{ ntemplate.durationDay }}天)
            </td>
            <td class="text-left">{{ ntemplate.title }}</td>
            <td class="text-left">
              <span class="text-decoration-underline ml-1" v-if='ntemplate.group.length > 0'>
                {{ tagConverter(ntemplate.group[0]) }}
              </span>
              <span v-if='ntemplate.group.length > 1'>＋{{ ntemplate.group.length }}</span>
            </td>
            <td class="text-left">
              <span v-if='ntemplate.creator._id === ntemplate.editor._id'>{{ ntemplate.creator.name }}</span>
              <span v-else>{{ ntemplate.editor.name }}</span>
            </td>
            <td class="text-left">
              <span v-if='ntemplate.createTick === ntemplate.modTick'>{{ dateConvert(ntemplate.createTick) }}</span>
              <span v-else>{{ dateConvert(ntemplate.modTick) }}</span>
            </td>
            <td class="text-left">
              <v-btn icon @click='editNTemplate(ntemplate)'>
                <v-icon>fa-pencil-alt</v-icon>
              </v-btn>
              <v-btn icon @click='removeNTemplate(ntemplate._id)'>
                <v-icon>fa-trash</v-icon>
              </v-btn>
            </td>
          </tr>
        </tbody>
      </template>
    </v-simple-table>
    <v-btn @click='addNTemplate'>新增定時通知範本</v-btn>
    <v-text-field outlined clearable dense label='備份檔案位置' v-model='backupLocation' hint='請注意，這裡的位置是NFS主機上的位置，不知道別亂調，最後不用加上/，另外，檔案備份是直接複寫舊備份檔，沒有版本問題'></v-text-field>
    <v-slider
      label='檔案備份頻率（天）'
      min='1'
      max='10'
      v-model="backupDuration"
      thumb-label
    ></v-slider>
    <v-slider
      label='檔案保留份數'
      min='1'
      max='5'
      v-model="backupCopies"
      thumb-label
    ></v-slider>
    <v-slider
      label='檔案備份延後啟動時間'
      hint='檔案備份時間會比其他的定時時間延後，目的在於避開影片轉檔和備份壓縮檔案的時間'
      min='1'
      max='23'
      v-model="backupHour"
      thumb-label
    ></v-slider>
    <v-btn @click="getrobotLog('存檔備份機器人')">查看檔案備份機器人執行紀錄</v-btn>
    <v-text-field outlined clearable dense label='資料庫備份檔案位置' v-model='dbbackupLocation' hint='請注意，這裡的位置是NFS主機上的位置，不知道別亂調，最後不用加上/'></v-text-field>
    <v-slider
      label='資料庫檔案備份頻率（天）'
      min='1'
      max='10'
      v-model="dbbackupDuration"
      thumb-label
    ></v-slider>
    <v-slider
      label='資料庫檔案保留份數'
      min='1'
      max='5'
      v-model="dbbackupCopies"
      thumb-label
    ></v-slider>
    <v-btn @click="getrobotLog('資料庫備份機器人')">查看資料庫備份機器人執行紀錄</v-btn>
    <div>轉檔機器人執行時間： {{ converisionTick === 0 ? '未啟動' : dateConvert(converisionTick) }}</div>
    <v-alert outlined type="error" icon='fa-skull' class='text-left' v-if='resetFFmpegBot'>
      轉檔機器人疑似沒有在執行了（記憶體不足？），你按下存檔時，系統會重設轉檔機器人（但建議你還是SSH進去轉檔機看一看）
    </v-alert>
    <v-slider
      label='轉檔/格式檢查頻率（天）'
      min='1'
      max='7'
      v-model="converisionDuration"
      thumb-label
    ></v-slider>
    <v-slider
      label='影片許可高度'
      min='720'
      max='2160'
      v-model="converisionHeight"
      thumb-label
    ></v-slider>
    <v-slider
      label='影片許可寬度'
      min='1280'
      max='4096'
      v-model="converisionWidth"
      thumb-label
    ></v-slider>
    <v-range-slider
      label='影片許可秒數區間'
      min='300'
      max='900'
      v-model="converisionDurationLimit"
      thumb-label
    ></v-range-slider>
    <v-switch
      v-model="converisionAudio"
      label="檢查是否有音軌（檔案中存有第二軌）"
    ></v-switch>
    <v-switch v-model="enableConverision" label="是否啟動轉檔（不啟動就是純檢查）"></v-switch>
    <v-text-field outlined clearable dense label='影片檔轉換暫存檔位置' v-model='converisionLocation' hint='請注意，這裡的位置是NFS主機上的位置，不知道別亂調，最後不用加上/'></v-text-field>
    <v-text-field outlined clearable dense label='轉檔後的原MP4存放位置' v-model='originalVideos' hint='這裡指的是轉檔完之後的舊影片檔備份地'></v-text-field>
    <v-text-field outlined clearable dense label='轉檔機的暫存資料夾' v-model='converisionDropzoneB' hint='轉檔前會先將影片複製到轉檔機的暫存位置，再進行轉檔'></v-text-field>
    <v-text-field outlined clearable dense label='儲存機的暫存資料夾' v-model='converisionDropzoneA' hint='轉檔後會將轉檔好的檔案移動到實際儲存的NFS暫存區，再搬入檔案儲存區'></v-text-field>
    <tag-filter
      :mustSelected='true'
      :single='false'
      @updateTags='updateTags'
      @plusItem='plusTag'
      :selectedItem='converisionFailTag'
      @valueUpdated='updateconverisionFailTag'
      :candidatedItem='savedTags'
      :createable='true'
      label='請輸入轉檔或格式檢查失敗時會得到通知的使用者標籤'
    />
    <v-btn @click="getrobotLog('轉檔機器人')">查看轉檔機器人執行紀錄</v-btn>
    <div class='text-h5 text-center pt-5 font-weight-black'>啟動／關閉v2ray</div>
    <v-switch
      :disabled='!v2RayChecked'
      v-model="v2Ray"
      label="啟動v2Ray穿牆"
    ></v-switch>
    <v-textarea
      outlined clearable counter dense
      label="回傳紀錄"
      v-model="shellReport"
    ></v-textarea>
    <div class='text-caption red--text' v-if='!v2RayChecked'>確認v2Ray狀態中</div>
    <div class='text-caption red--text' v-if='serverAddress !== ""'>主機IP位置： {{ serverAddress }} </div>
  </v-sheet>
</template>

<script>
// @ is an alias to /src
import Vue from 'vue';
import TurndownService from 'turndown';
import marked from 'marked';
import moment from 'moment';
import _find from 'lodash-es/find';

const renderer = new marked.Renderer();
const linkRenderer = renderer.link;
renderer.link = (href, title, text) => {
  if(href !== undefined) { href = (decodeURIComponent(href)).replace(/\\/g, ''); }
  if(title !== undefined) { title = (decodeURIComponent(title)).replace(/\\/g, ''); }
  if(text !== undefined) { text = (decodeURIComponent(text)).replace(/\\/g, ''); }
  const html = linkRenderer.call(renderer, href, title, text);
  return html.replace(/^<a /, '<a target="_blank" rel="nofollow" ');
};

const turndownService = new TurndownService();

export default {
  name: 'settings',
  components: { 
    TagFilter: () => import(/* webpackPrefetch: true */ './modules/TagFilter')
  },
  computed: {
    savedTags: function () {
      return this.$store.state.savedTags;
    },
    siteSettings: function () {
      return this.$store.state.siteSettings;
    }
  },
  beforeDestroy () {
    this.$socket.client.off('setSetting', this.socketsetSetting);
    this.$socket.client.off('getTagUsers', this.socketgetTagUsers);
    this.$socket.client.off('getGlobalSettings', this.socketgetGlobalSettings);
    this.$socket.client.off('getRobotSetting', this.socketgetRobotSetting);
    this.$socket.client.off('getGithubCommit', this.socketgetGithubCommit);
    this.$socket.client.off('v2rayReport', this.socketv2rayReport);
    this.$socket.client.off('checkV2ray', this.socketcheckV2ray);
    this.$socket.client.off('getserverADDR', this.socketgetserverADDR);
    this.$socket.client.off('modNTemplate', this.socketmodNTemplate);
    this.$socket.client.off('listNTemplate', this.socketlistNTemplate);
    this.$socket.client.off('removeNTemplate', this.socketremoveNTemplate);
    this.$socket.client.off('addNTemplate', this.socketaddNTemplate);
    this.$socket.client.off('listRobotLog', this.socketlistRobotLog);
  },
  created () {
    this.$emit('viewIn', {
      text: '系統設定',
      icon: 'fa-cogs',
      module: '設定模組',
      location: '/setting'
    });
    this.$socket.client.emit('getTagUsers');
    this.$socket.client.emit('getGlobalSettings');
    this.$socket.client.emit('getRobotSetting');
    this.$socket.client.emit('checkV2ray');
    this.$socket.client.emit('checkFFmpeg');
    this.$socket.client.emit('listNTemplate');
    if(this.siteSettings.repos.frontend !== "") {
      this.$socket.client.emit('getGithubCommit', this.siteSettings.repos.frontend);
      this.$socket.client.emit('getGithubCommit', this.siteSettings.repos.backend);
      this.$socket.client.emit('getGithubCommit', this.siteSettings.repos.bot);
    } else {
      this.$socket.client.emit('getsiteSetting');
    }
    this.$socket.client.on('addNTemplate', this.socketaddNTemplate);
    this.$socket.client.on('removeNTemplate', this.socketremoveNTemplate);
    this.$socket.client.on('listNTemplate', this.socketlistNTemplate);
    this.$socket.client.on('modNTemplate', this.socketmodNTemplate);
    this.$socket.client.on('setSetting', this.socketsetSetting);
    this.$socket.client.on('getserverADDR', this.socketgetserverADDR);
    this.$socket.client.on('checkV2ray', this.socketcheckV2ray);
    this.$socket.client.on('getTagUsers', this.socketgetTagUsers);
    this.$socket.client.on('getGlobalSettings', this.socketgetGlobalSettings);
    this.$socket.client.on('getRobotSetting', this.socketgetRobotSetting);
    this.$socket.client.on('getGithubCommit', this.socketgetGithubCommit);
    this.$socket.client.on('v2rayReport', this.socketv2rayReport);
    this.$socket.client.on('checkFFmpeg', this.socketcheckFFmpeg);
    this.$socket.client.on('listRobotLog', this.socketlistRobotLog);
  },
  methods: {
    getrobotLog: function(data) {
      this.$socket.client.emit('listRobotLog', data);
      this.botLog = [];
    },
    resetcnTemplate: function() {
      this.cnTemplate._id = '';
      this.cnTemplate.title = '';
      this.cnTemplate.body = '';
      this.cnTemplate.group = [];
      this.cnTemplate.durationDay = 1;
      this.cnTemplate.setTick = 0;
      this.cnTemplate.status = false;
      this.cnTemplate.sendTick = 0;
    },
    socketlistRobotLog: function(data) {
      this.botLog = data;
      this.logW = true;
    },
    socketaddNTemplate: function(data) {
      this.cnTemplate._id = data;
      this.ntemplateW = true;
    },
    addNTemplate: function() {
      this.resetcnTemplate();
      this.$socket.client.emit('addNTemplate');
    },
    socketremoveNTemplate: function() {
      this.$emit('toastPop', "訊息範本刪除完成！");
    },
    editNTemplate: function(data) {
      this.cnTemplate = data;
      this.ntemplateW = true;
    },
    removeNTemplate: function(data) {
      this.$socket.client.emit('removeNTemplate', data);
    },
    socketlistNTemplate: function(data) {
      this.ntemplateList = data;
    },
    socketmodNTemplate: function () {
      this.resetcnTemplate();
      this.$emit('toastPop', "訊息範本修改完成！");
      this.ntemplateW = false;
    },
    tagConverter: function (tagID) {
      let tag = _find(this.savedTags, (tag) => {
        return tag._id === tagID;
      });
      if(tag === undefined) {
        return '';
      } else {
        return tag.name;
      }
    },
    socketcheckFFmpeg: function(status) {
      this.resetFFmpegBot = status;
    },
    updateTags: function() {
      this.$emit('updateTags');
    },
    dateConvert: function (time) {
      return time === 0 ? '尚未發生' : moment.unix(time).format('YYYY/MM/DD HH:mm:ss');
    },
    socketgetserverADDR: function (data) {
      this.serverAddress = data;
    },
    socketv2rayReport: function (data) {
      this.shellReport += data + '\n';
    },
    socketcheckV2ray: function (data) {
      let oriobj = this;
      this.v2Ray = data > -1;
      Vue.nextTick(() => {
        oriobj.v2RayChecked = true;
      });
    },
    githubConvert: function (commit) {
      return commit.id + '(發布於' + moment(commit.commitDate).format('YYYY/MM/DD HH:mm:ss') + ')';
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
    socketgetRobotSetting: function (data) {
      this.mailAccount = data.mailAccount;
      this.mailPassword = data.mailPassword;
      this.robotDeadLine = data.robotDeadLine;
      this.patrolHour = data.patrolHour;
      this.reportDuration = data.reportDuration;
      this.LINENotifyKey = data.LINENotifyKey;
      this.LINESecretKey = data.LINESecretKey;
      this.nobodyAccount = data.nobodyAccount;
      this.PatrolAccount = data.PatrolAccount;
      this.mailSSL = data.mailSSL;
      this.mailSMTP = data.mailSMTP;
      this.mailPort = data.mailPort;
      this.backupLocation = data.backupLocation;
      this.dbbackupLocation = data.dbbackupLocation;
      this.backupDuration = data.backupDuration;
      this.dbbackupDuration = data.dbbackupDuration;
      this.dbbackupCopies = data.dbbackupCopies;
      this.backupCopies = data.backupCopies;
      this.backupHour = data.backupHour;
      this.converisionLocation = data.converisionLocation;
      this.converisionTick = data.converisionTick;
      this.notifyHour = data.notifyHour;
      this.originalVideos = data.originalVideos;
      this.converisionDropzoneB = data.converisionDropzoneB;
      this.converisionDropzoneA = data.converisionDropzoneA;
      this.converisionFailTag = data.converisionFailTag;
      this.converisionHeight = data.converisionHeight;
      this.converisionWidth = data.converisionWidth;
      this.converisionAudio = data.converisionAudio;
      this.converisionDuration = data.converisionDuration;
      this.enableConverision = data.enableConverision;
      this.converisionDurationLimit = data.converisionDurationLimit;
    },
    socketgetGlobalSettings: function (data) {
      this.defaultPassword = data.defaultPassword;
      this.selectedSysTags = data.settingTags;
      this.selectedUsrTags = data.userTags;
      this.selectedflowTags = data.projectTags;
      this.selectedstatisticsTags = data.statisticsTags;
      this.selectedrobotTag = data.robotTag;
      this.siteLocation = data.siteLocation;
      this.userCheckTime = data.userCheckTime;
      this.changeLog = this.HTMLConverter(data.changeLog);
      this.versionFrontend = data.versionFrontend;
      this.versionBackend = data.versionBackend;
      this.versionBot = data.versionBot;
      this.githubKey = data.githubKey;
      this.frontendRepo = data.frontendRepo;
      this.backendRepo = data.backendRepo;
      this.connectionTimeout = data.connectionTimeout;
      this.storageLocation = data.storageLocation;
      this.selectedserviceTags = data.serviceTags;
      this.botRepo = data.botRepo;
      this.systemName = data.systemName;
    },
    socketgetTagUsers: function (data) {
      this.savedUsers = data;
    },
    socketsetSetting: function () {
      this.$emit('toastPop', "系統設定儲存完成！");
      this.icontype = 'fa-cloud-upload-alt';
    },
    HTMLConverter: function (msg) {
      msg = msg === null || msg == undefined ? '**test**' : msg;
      return marked(msg, { renderer });
    },
    saveSetting: function () {
      this.$emit('toastPop', "儲存系統設定中...");
      this.icontype = 'fa-spinner';
      this.$socket.client.emit('setSetting', {
        defaultPassword: this.defaultPassword,
        storageLocation: this.storageLocation,
        backupDuration: this.backupDuration,
        backupLocation: this.backupLocation,
        dbbackupLocation: this.dbbackupLocation,
        dbbackupDuration: this.dbbackupDuration,
        backupCopies: this.backupCopies,
        dbbackupCopies: this.dbbackupCopies,
        selectedSysTags: this.selectedSysTags,
        selectedUsrTags: this.selectedUsrTags,
        selectedflowTags: this.selectedflowTags,
        selectedrobotTag: this.selectedrobotTag,
        selectedstatisticsTags: this.selectedstatisticsTags,
        reportDuration: this.reportDuration,
        robotDeadLine: this.robotDeadLine,
        mailAccount: this.mailAccount,
        mailPassword: this.mailPassword,
        patrolHour: this.patrolHour,
        nobodyAccount: this.nobodyAccount,
        LINENotifyKey: this.LINENotifyKey,
        LINESecretKey: this.LINESecretKey,
        PatrolAccount: this.PatrolAccount,
        serviceTags: this.selectedserviceTags,
        mailSMTP: this.mailSMTP,
        mailPort: this.mailPort,
        mailSSL: this.mailSSL,
        siteLocation: this.siteLocation,
        versionFrontend: this.versionFrontend,
        versionBackend: this.versionBackend,
        versionBot: this.versionBot,
        githubKey: this.githubKey,
        frontendRepo: this.frontendRepo,
        backendRepo: this.backendRepo,
        userCheckTime: this.userCheckTime,
        connectionTimeout: this.connectionTimeout,
        backupHour: this.backupHour,
        converisionLocation: this.converisionLocation,
        notifyHour: this.notifyHour,
        converisionDropzoneA: this.converisionDropzoneA,
        converisionDropzoneB: this.converisionDropzoneB,
        originalVideos: this.originalVideos,
        converisionTick: this.resetFFmpegBot ? 0 : this.converisionTick,
        converisionFailTag: this.converisionFailTag,
        converisionHeight: this.converisionHeight,
        converisionWidth: this.converisionWidth,
        converisionAudio: this.converisionAudio,
        converisionDuration: this.converisionDuration,
        systemName: this.systemName,
        botRepo: this.botRepo,
        enableConverision: this.enableConverision,
        converisionDurationLimit: this.converisionDurationLimit,
        changeLog: turndownService.turndown(this.changeLog)
      });
    },
    plusTag: function (val) {
      this.$emit('addTag', val);
    },
    closeNTemplate: function () {
      this.$socket.client.emit('modNTemplate', this.cnTemplate);
    },
    updatecnGroup: function (value) {
      this.cnTemplate.group = value;
    },
    updateSysTag: function (value) {
      this.selectedSysTags = value;
    },
    updateconverisionFailTag: function (value) {
      this.converisionFailTag = value;
    },
    updateRobotTag: function (value) {
      this.selectedrobotTag = value;
    },
    updateUsrTag: function (value) {
      this.selectedUsrTags = value;
    },
    updateServiceTag: function (value) {
      this.selectedserviceTags = value;
    },
    updateFlowTag: function (value) {
      this.selectedflowTags = value;
    },
    updateUsers: function () {
      this.$socket.client.emit('getTagUsers');
    },
    updateStatisticsTag: function (value) {
      this.selectedstatisticsTags = value;
    },
    updateRobotAccount: function (value) {
      this.PatrolAccount = value;
    },
    updateNobodyAccount: function (value) {
      this.nobodyAccount = value;
    }
  },
  watch: {
    v2Ray: function () {
      if(this.v2RayChecked) {
        if(this.v2Ray) {
          this.$socket.client.emit('startV2ray');
        } else {
          this.$socket.client.emit('stopV2ray');
        }
      }
    },
    "siteSettings.repos.frontend": function() {
      if(this.siteSettings.repos.frontend !== "") {
        this.$socket.client.emit('getGithubCommit', this.siteSettings.repos.frontend);
        this.$socket.client.emit('getGithubCommit', this.siteSettings.repos.backend);
        this.$socket.client.emit('getGithubCommit', this.siteSettings.repos.bot);
      }
    }
  },
  data () {
    return {
      enableConverision: false,
      converisionDurationLimit: [ 360, 600 ],
      systemName: '',
      botRepo: '',
      converisionDuration: 1,
      converisionHeight: 0,
      converisionWidth: 0,
      converisionAudio: false,
      converisionFailTag: [],
      logW: false,
      ntemplateList: [],
      ntemplateW: false,
      cnTemplate: {
        _id: '',
        title: '',
        body: '',
        group: [],
        durationDay: 1,
        setTick: 0,
        status: false,
        sendTick: 0
      },
      resetFFmpegBot: false,
      converisionDropzoneA: '',
      converisionDropzoneB: '',
      originalVideos: '',
      notifyHour: 7,
      converisionTick: 0,
      converisionLocation: '',
      backupCopies: 3,
      backupHour: 3,
      defaultPassword: '0000',
      selectedserviceTags: [],
      botLog: [],
      storageLocation: '',
      backupLocation: '',
      dbbackupLocation: '',
      backupDuration: 1,
      dbbackupDuration: 1,
      dbbackupCopies: 1,
      serverAddress: '',
      v2RayChecked: false,
      v2Ray: false,
      shellReport: '',
      githubKey: '',
      frontendRepo: '',
      backendRepo: '',
      connectionTimeout: 2,
      userCheckTime: 10,
      changeLog: '',
      versionFrontend: '',
      versionBackend: '',
      versionBot: '',
      botCommits: [],
      frontendCommits: [],
      backendCommits: [],
      siteLocation: '',
      mailSSL: true,
      mailSMTP: '',
      mailPort: '',
      icontype: 'fa-cloud-upload-alt',
      savedUsers: [
        {
          name: '',
          _id: ''
        }
      ],
      selectedSysTags: [],
      selectedUsrTags: [],
      selectedflowTags: [],
      selectedstatisticsTags: [],
      selectedrobotTag: '',
      PatrolAccount: '',
      nobodyAccount: '',
      reportDuration: 7,
      robotDeadLine: 60,
      mailAccount: '',
      mailPassword: '',
      patrolHour: 7
    };
  }
};
</script>
