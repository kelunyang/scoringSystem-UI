<template>
  <v-sheet class='d-flex flex-column'>
    <v-dialog
      v-model="initW"
      persistent
      max-width="50vw"
    >
      <v-card>
        <v-toolbar
          color="primary"
          dark
        >初次使用設定
        </v-toolbar>
        <v-card-text class='d-flex flex-column pa-0 text-left black--text text-body-1'>
          <v-alert outlined type='info' icon='fa-info-circle' class='text-left'>若您日後還要修改這條設定，請選擇右下角工具箱的i圖示開啟即可</v-alert>
          <div class='d-flex flex-column pa-1'>
            <v-switch
              v-model="initStatstics"
              label="每次開啟Dashboard都先打開知識點進度總統計（通常是PM才會需要打開）"
            ></v-switch>
            <v-switch
              v-model="initHistory"
              label="打開所有和我有關的知識點，就算當前階段與我無關我也要看到（通常是PM才會需要打開）"
            ></v-switch>
          </div>
          <div class='text-caption red--text'>統計圖表的開關在右下角折線圖圖示，您就算不開啟此設定，平時也可以自己點擊叫出統計圖</div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color='red'
            class='white--text'
            @click='closeInitW'
          >
            關閉對話框
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="tagW"
      persistent
      max-width="50vw"
    >
      <v-card>
        <v-toolbar
          color="primary"
          dark
        >指定 {{ currentKB.title }} 的標籤
        </v-toolbar>
        <v-card-text class='d-flex flex-column pa-0'>
          <v-alert outlined type='info' icon='fa-info-circle' class='text-left'>PM可以針對不同知識點下行銷或管理需要的標籤（如「粉紅色」、「買賣問題」、「時事性」之類），請不要刪除你看不懂的標籤，否則知識點管理中找不到這個知識點</v-alert>
          <tag-filter
            @updateTags='updateTags'
            @plusItem='plusTag'
            :mustSelected='true'
            :single='false'
            :selectedItem='currentKB.tag'
            @valueUpdated='updateKBTag'
            :candidatedItem='savedTags'
            :createable='true'
            label='請輸入標籤'
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color='red'
            class='white--text'
            @click='saveKBTag'
          >
            儲存標籤
          </v-btn>
          <v-btn
            color="primary"
            @click="tagW = false"
          >
            關閉對話框
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="downloadW"
      persistent
      max-width="50vw"
    >
      <v-card>
        <v-toolbar dark color='primary'>
          <v-toolbar-title>下載 {{ selectedpmKBs.length }} 個知識點的最新版本</v-toolbar-title>
        </v-toolbar>
        <v-card-text class='d-flex flex-column text-left black--text text-body-1'>
          <v-alert outlined type='info' icon='fa-info-circle' class='text-left'>請注意，為節省系統資源，系統不會幫你把這些檔案壓縮，而會同時發送這些檔案給你，你應該會在瀏覽器正下方（或是正上方）看到「是否允許下載多個檔案」的提示，請務必按「同意」</v-alert>
          <div class='red--text text-caption'>你要下載最新的幾個版本呢？（{{ latestCount }}）</div>
          <v-slider
            label='最新版本數量'
            min='1'
            max='10'
            v-model="latestCount"
            thumb-label
          ></v-slider>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click='getlatestVersions'>點此開始下載</v-btn>
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
          <v-toolbar-title>管理知識點版本</v-toolbar-title>
        </v-toolbar>
        <v-card-text class='d-flex flex-column pa-0'>
          <v-alert outlined type='info' v-if='currentKB.isVendor' icon='fa-info-circle' class='text-left'>
            廠商請注意：基本上你只能上傳影片（H.264/VP9）、PDF檔案（分鏡圖使用），除非是最終階段需要上傳可編輯原始檔，否則請勿上傳zip檔，另外，你的檔名就會是版本代號，請警慎命名（如「腳本第一版」）
          </v-alert>
          <v-alert outlined type='info' v-if='currentKB.isWriter' icon='fa-info-circle' class='text-left'>
            寫手請注意：你只能上傳PDF檔案，請把你的腳本都轉換成PDF再上傳，另外，你的檔名就會是版本代號，請警慎命名（如「腳本第一版」）
          </v-alert>
          <div v-if='currentKB.isWriter || currentKB.isVendor' class='d-felx flex-column'>
            <div class='text-subtitle-2 font-weight-blod'>版本發行說明（必填但不得超過30個字）</div>
            <v-text-field outlined clearable dense hint='請輸入這個新版本的註解，不得超過30個字' v-model='versionComment' />
            <div class='text-subtitle-2 font-weight-blod'>版本檔案</div>
            <v-file-input
              v-if="versionComment !== ''"
              prepend-icon="fa-paperclip" 
              v-model="versionFile" 
              label='上傳知識點版本' 
              :accept="currentKB.isWriter ? 'application/pdf' : 'application/zip, application/pdf, video/mp4, video/webm'"
              :loading="uploadprogress !== 0">
              <template v-slot:progress>
                <v-progress-circular :value="uploadprogress"></v-progress-circular>速度：{{ uploadstatus }}
              </template>
            </v-file-input>
          </div>
          <div v-if='versionPopulated'>
            <span v-if='currentVersions.length === 0' class='text-body-1 text-center'>
              目前沒有任何版本
            </span>
            <v-simple-table v-show="currentVersions.length > 0">
              <template v-slot:default>
                <thead>
                  <tr>
                    <th class="text-left" style="width:200px">
                      版本發行日期（版號）
                    </th>
                    <th class="text-left" style="width:200px">
                      原始檔名
                    </th>
                    <th class="text-left" style="width:250px">
                      狀態
                    </th>
                    <th class="text-left">
                      版本發行紀錄
                    </th>
                    <th class="text-left" style="width:25px">
                      &nbsp;
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="version in currentVersions"
                    :key="'ver'+version._id"
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
                        @click='downloadFile(version)'
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
        <v-card-text class='pa-0 ma-0 d-flex flex-column text-left black--text text-body-1'>
          <v-alert outlined type="info" icon='fa-info-circle' class='text-left'>你如果發現你勾選的知識點少於系統回傳的知識點，那很明顯是因為你不具有該知識點的行政管理權，請洽你的知識點PM，把你放進行政組中</v-alert>
          <div v-if='participantsDB.statistics.length === 0'>
            你不具備你勾選的知識點的行政管理權，回傳的知識點數量為0
          </div>
          <div v-if='participantsDB.statistics.length > 0'>
            <div class='text-left' v-for='participant in participantsDB.statistics' :key='"uid"+participant._id'>
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
                  :key='"parp"+stage._id'
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
                  :key='"parr"+stage._id'
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
                  :key='"parv"+stage._id'
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
                  :key='"parw"+stage._id'
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
                  :key='"parf"+stage._id'
                >
                  {{ stage.KBtitle }} | {{ stage.name }}
                </v-chip>
              </div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-dialog v-model="authDetailW" persistent>
      <v-card>
        <v-toolbar
          dark
          color="primary"
        >
          <v-toolbar-title>你在 {{ currentKB.title }} 目前階段中的的角色</v-toolbar-title>
        </v-toolbar>
        <v-card-text class='d-flex flex-column text-h6 font-weight-medium black--text text-left'>
          <div v-if='currentKB.isPM'>
            專案管理者：你可以關閉／開啟任何的Issue，並且在知識點編輯器中強制改變專案進度
          </div>
          <div v-if='currentKB.isVendor'>
            廠商：你可以在DashBoard中上傳知識點的版本，並且回復Issue
          </div>
          <div v-if='currentKB.isWriter'>
            寫手：你可以開啟Issue，上傳腳本，並回復Issue
          </div>
          <div v-if='currentKB.isReviewer'>
            審查者：你可以開啟／關閉Issue，並且決定本階段是否結束
          </div>
          <div v-if='currentKB.isFinal'>
            行政組：你只能看Issue，並在DashBoard中匯出專案統計
          </div>
        </v-card-text>
        <v-card-actions>
        <v-spacer></v-spacer>
          <v-btn color="green darken-1" text @click="authDetailW = false">關閉角色說明</v-btn>
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
          <span>下載最新版本</span>
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
      <v-tooltip bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            v-bind="attrs" v-on="on"
            fab
            dark
            small
            color="deep-orange darken-4"
            @click.stop='initW = true'
          >
            <v-icon>fas fa-info</v-icon>
          </v-btn>
        </template>
        <span>修改預設值</span>
      </v-tooltip>
    </v-speed-dial>
    <v-speed-dial v-model="filterBtns" fixed bottom right direction="left" :open-on-hover="true" transition="slide-y-reverse-transition">
      <template v-slot:activator>
        <v-btn
          v-model="filterBtns"
          color="pink"
          dark
          fab
        >
          <v-icon v-if="filterBtn">fa-chevron-up</v-icon>
          <v-icon v-else>fa-filter</v-icon>
        </v-btn>
      </template>
      <v-tooltip bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            v-bind="attrs" v-on="on"
            fab
            dark
            small
            color="pink darken-4"
            @click.stop='queryHistory = !queryHistory'
          >
            <v-icon>fa-history</v-icon>
          </v-btn>
        </template>
        <span v-if='queryHistory'>查看目前屬於你的知識點</span>
        <span v-if='!queryHistory'>查看所有和你有關的知識點</span>
      </v-tooltip>
      <v-tooltip bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            v-bind="attrs" v-on="on"
            fab
            dark
            small
            color="pink darken-4"
            @click.stop='sortingRule = !sortingRule'
          >
            <v-icon>fa-sort-numeric-down-alt</v-icon>
          </v-btn>
        </template>
        <span v-if='sortingRule'>按照死線時間排序</span>
        <span v-if='!sortingRule'>按照知識點名稱排序</span>
      </v-tooltip>
    </v-speed-dial>
    <div v-show='showStatstics'>
      <div class='d-flex flex-row'>
        <tag-filter
          class='flex-grow-1'
          @updateTags='updateTags'
          :mustSelected='false'
          :single='false'
          :selectedItem='selectedFilterTags'
          @valueUpdated='updateFilterTag'
          :candidatedItem='savedTags'
          :createable='false'
          label='請輸入過濾用的標籤（如：國中、理化）'
        />
        <v-btn color='indigo darken-4' class='white--text ma-1' @click="generateList">搜尋</v-btn>
        <v-btn color="brown darken-4" class='white--text ma-1' @click="clearFilterTag">清除</v-btn>
      </div>
      <div class='text-body-2'>最近查詢的標籤（查詢紀錄與知識點編輯器共用，點擊後載入）</div>
      <div class='d-flex flex-row flex-wrap ma-1'>
        <v-chip
          v-for='ch in queriedChapters'
          :key="ch" @click='selectedFilterTags.push(ch)'
          class='ma-1'
        >
          {{ tagQuery(ch) }}
        </v-chip>
      </div>
      <v-slider
        label='需要統計的階段數量'
        hint="請注意，如果你要統計的專案有6個階段，你只填了5個，這裡真的不會幫你算到第6階段"
        min='1'
        :max='maxStep'
        v-model="statisticSteps"
        thumb-label
      ></v-slider>
      <apexchart width="100%" height="150" type="bar" :options="chartOptions" :series="chartSeries"></apexchart>
      <v-simple-table>
        <template v-slot:default>
          <thead>
            <tr>
              <th class='text-center' v-for='(step,n) in chartSeries' :key='"stepth" + n'>
                <span v-if='step.name === 0'>尚未啟動</span>
                <span v-else>{{ step.name }}</span>
              </th>
              <th class="text-center">
                總計
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class='text-center' v-for='(step,n) in chartSeries' :key='"steptd" + n'>{{ step.data[0] }}</td>
              <td>{{ convertedList.length }}</td>
            </tr>
          </tbody>
        </template>
      </v-simple-table>
    </div>
    <v-skeleton-loader
      class="mx-auto"
      type="card"
      v-if='!dashboardPopulated'
      width="100%"
    ></v-skeleton-loader>
    <v-sheet v-if='dashboardPopulated' class='pa-0 ma-0 d-flex flex-column'>
      <div v-if='progressList.length === 0'>您目前沒有待處理的項目</div>
      <div class='d-flex flex-row' v-if='progressList.length > 0'>
        <v-text-field outlined clearable dense class='flex-grow-1' label='搜尋知識點關鍵字' prepend-icon="fa-search" v-model="queryTerm"></v-text-field>
        <v-btn color='indigo darken-4' class='white--text ma-1' @click="generateList">搜尋</v-btn>
        <v-btn color="brown darken-4" class='white--text ma-1' @click="clearQueryTerm">清除</v-btn>
      </div>
      <div class='blue-grey--text darken-1 text-caption'>已篩選出{{ convertedList.length }}個知識點，為節省資源，不會全部展現出來，往下滑會載入更多</div>
      <v-lazy
        :options="{
          threshold: 0.5
        }"
        min-height="100"
        transition="fade-transition"
        v-for="item in convertedList" :key="'KB'+item._id"
      >
        <progress-tile @tags='openTagW' @requestUpload='openUploadW' @viewDetail='openauthDetail' @KBselected='KBupdated' :progressItem='item' />
      </v-lazy>
    </v-sheet>
  </v-sheet>
</template>

<script>
import Vue from 'vue';
import moment from 'moment';
import { randomColor } from 'randomcolor';
import _filter from 'lodash/filter';
import _toString from 'lodash/toString';
import _find from 'lodash/find';
import _uniq from 'lodash/uniq';
import _orderBy from 'lodash/orderBy';
import _map from 'lodash/map';
import _includes from 'lodash/includes';
import _flatten from 'lodash/flatten';
import _countBy from 'lodash/countBy';
import _findIndex from 'lodash/findIndex';
import _intersectionWith from 'lodash/intersectionWith';
import { v4 as uuidv4 } from 'uuid';
import VueApexCharts from 'vue-apexcharts';
import prettyBytes from 'pretty-bytes';
Vue.use(VueApexCharts);
Vue.component('apexchart', VueApexCharts);
let files = [];

export default {
  name: 'userDashBoard',
  components: { 
    TagFilter: () => import(/* webpackPrefetch: true */ './modules/TagFilter'),
    ProgressTile: () => import(/* webpackPrefetch: true */ './modules/ProgressTile')
  },
  methods: {
    socketdashBoardUnreaded: function(data) {
      let oriobj = this;
      this.$emit('timerOn', false);
      this.$emit('toastPop', '未讀取Issue清單已下載，更新清單中');
      this.unreadedList = data;
      this.generateList();
      this.dashboardPopulated = true;
      this.$emit('toastPop', '更新清單完成');
      clearTimeout(this.queryTimer);
      this.queryTimer = setTimeout(() => {
        this.initialized = false;
        oriobj.$emit('timerOn', true);
        oriobj.$emit('toastPop', 'DashBoard更新中');
        oriobj.$socket.client.emit('listDashBoard');
      }, this.siteSettings.userCheckTime * 60 * 1000);
    },
    clearQueryTerm: function() {
      this.queryTerm = '';
      this.generateList();
    },
    clearFilterTag: function() {
      this.selectedFilterTags = '';
      this.generateList();
    },
    generateList: function() {
      let now = moment().unix();
      let list = [];
      let oriobj = this;
      if(oriobj.selectedFilterTags.length > 0) {
        for (let i = 0; i < oriobj.selectedFilterTags.length; i++) {
          let tag = oriobj.selectedFilterTags[i];
          let found = _filter(this.progressList, (item) => {
            return _includes(item.tag, tag);
          });
          if(found.length > 0) {
            oriobj.queriedChapters.push(oriobj.selectedKBTag);
            oriobj.queriedChapters = _uniq(oriobj.queriedChapters);
            localStorage.setItem('queriedChapters', JSON.stringify(oriobj.queriedChapters));
            list.push(found);
          }
        }
        list = _flatten(list);
      } else {
        list = this.progressList;
      }
      if(this.queryTerm !== '') {
        list = _filter(list, (item) => {
          return (new RegExp(oriobj.queryTerm, 'g')).test(item.title + item.desc);
        });
      }
      for (let i = 0; i< list.length; i++) {
        let KB = list[i];
        KB.attention = 0;
        KB.selected = false;
        let unreaded = _find(oriobj.unreadedList, (item) => {
          return item._id === KB._id;
        });
        KB.unreaded = unreaded !== undefined ? unreaded.numberOfissue : 0;
        KB.sortingRank = KB.tag.length > 0 ? KB.tag[0] + KB.sort : KB.title;
        KB.currentStep = (_countBy(KB.stages, {
          current: false
        })) === KB.stages.length ? 0 : (_findIndex(KB.stages, {
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
        if(KB.currentStep > 0) {
          KB.isPM = (_intersectionWith(KB.stages[KB.currentStep - 1].pmTags, this.currentUser.tags, (cTag, uTag) => {
            return cTag === uTag._id;
          })).length > 0;
          KB.isVendor = (_intersectionWith(KB.stages[KB.currentStep - 1].vendorTags, this.currentUser.tags, (cTag, uTag) => {
            return cTag === uTag._id;
          })).length > 0;
          KB.isFinal = (_intersectionWith(KB.stages[KB.currentStep - 1].finalTags, this.currentUser.tags, (cTag, uTag) => {
            return cTag === uTag._id;
          })).length > 0;
          KB.isWriter = (_intersectionWith(KB.stages[KB.currentStep - 1].writerTags, this.currentUser.tags, (cTag, uTag) => {
            return cTag === uTag._id;
          })).length > 0;
          KB.isReviewer = (_intersectionWith(KB.stages[KB.currentStep - 1].reviewerTags, this.currentUser.tags, (cTag, uTag) => {
            return cTag === uTag._id;
          })).length > 0;
        }
        KB.dueTick = 0;
        let found = _find(this.selectedpmKBs, (item) => {
          return KB._id === item;
        });
        if (found !== undefined) {
          KB.selected = true;
        }
        KB.remainTick = KB.currentStep > 0 ? KB.stages[KB.currentStep - 1].dueTick - now: Number.MAX_SAFE_INTEGER ;
      }
      if(list.length > 0) {
        if(!this.queryHistory) {
          let result = [];
          for (let i = 0; i < this.currentUser.tags.length; i++) {
            let tag = this.currentUser.tags[i];
            result.push(_filter(list, (item) => {
              if(item.currentStep === 0) {
                return false;
              } else {
                return _includes(_flatten([
                        item.stages[item.currentStep - 1].pmTags,
                        item.stages[item.currentStep - 1].reviewerTags,
                        item.stages[item.currentStep - 1].vendorTags,
                        item.stages[item.currentStep - 1].writerTags,
                        item.stages[item.currentStep - 1].finalTags
                      ]), tag._id);
              }
            }));
          }
          list = _flatten(result);
        }
        list.sort((a, b) => {
          let aTime = a.attention > 0 ? aTime * 100000 : Math.abs(aTime);
          let bTime = b.attention > 0 ? bTime * 100000 : Math.abs(bTime);
          return aTime - bTime;
        });
      }
      this.convertedList = [];
      let convertedList = this.sortingRule ? _orderBy(list, ['remainTick'], ['asc']) : _orderBy(list, ['sortingRank'], ['asc']);
      this.convertedList = convertedList;
      let steps = _map(this.convertedList, (item) => {
        return item.stages.length;
      });
      let orderedSteps = steps.sort((a, b) => {
        return b - a;
      });
      this.maxStep = orderedSteps.length > 0 ? orderedSteps[0] : 5;
      this.initialized = true;
      this.statisticSteps = this.maxStep;
    },
    renderChart: function() {
      let steps = [];
      for (let i = 0; i <= this.statisticSteps; i++) {
        steps[i] = {
          name: i === 0 ? "尚未啟動" : "第"+ i +"階段",
          data: [0]
        };
      }
      for (let i = 0; i < this.convertedList.length; i++) {
        let KB = this.convertedList[i];
        if(KB.currentStep < steps.length) {
          steps[KB.currentStep].data[0]++;
        }
      }
      this.chartSeries = steps;
    },
    closeInitW: function() {
      this.initW = false;
      window.localStorage.setItem('dashBoardFirstUse', JSON.stringify(false));
    },
    updateTags: function() {
      this.$emit('updateTags');
    },
    saveKBTag: function () {
      this.$emit('toastPop', '新增標籤中...');
      this.$socket.client.emit('setKBTag', this.currentKB);
    },
    updateKBTag: function (val) {
      this.currentKB.tag = val;
    },
    plusTag: function (val) {
      this.$emit('addTag', val);
    },
    openTagW: function (item) {
      this.currentKB = item;
      this.tagW = true;
    },
    openauthDetail: function (item) {
      this.currentKB = item;
      this.authDetailW = true;
    },
    participantStatstics: function () {
      this.$socket.client.emit('participantStatstics', this.selectedpmKBs);
    },
    KBupdated:  function (data) {
      let found = _find(this.selectedpmKBs, (KB) => {
        return KB === data._id;
      });
      if(found !== undefined) {
        let newpmKB = _filter(this.selectedpmKBs, (item) => {
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
      this.$emit('timerOn', false);
      this.$emit('toastPop', '您目前被分派到的知識點以下載，正在確認未讀issue數量...');
      this.lastCheckTime = moment().unix();
      this.progressList = data;
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
          let stageParticipants = _map(user.pmStages[k], (item) => {
            return item.KBtitle + '|' + item.name
          });
          exportCSV += _toString(stageParticipants) + '\n';
        }
        exportCSV += '參與審查者工作：\n';
        for (let k = 0; k < user.reviewerStages.length; k++) {
          let stageParticipants = _map(user.reviewerStages[k], (item) => {
            return item.KBtitle + '|' + item.name
          });
          exportCSV += _toString(stageParticipants) + '\n';
        }
        exportCSV += '參與寫手工作：\n';
        for (let k = 0; k < user.writerStages.length; k++) {
          let stageParticipants = _map(user.writerStages[k], (item) => {
            return item.KBtitle + '|' + item.name
          });
          exportCSV += _toString(stageParticipants) + '\n';
        }
        exportCSV += '參與行政組工作：\n';
        for (let k = 0; k < user.finalStages.length; k++) {
          let stageParticipants = _map(user.finalStages[k], (item) => {
            return item.KBtitle + '|' + item.name
          });
          exportCSV += _toString(stageParticipants) + '\n';
        }
        exportCSV += '參與廠商工作：\n';
        for (let k = 0; k < user.vendorStages.length; k++) {
          let stageParticipants = _map(user.vendorStages[k], (item) => {
            return item.KBtitle + '|' + item.name
          });
          exportCSV += _toString(stageParticipants) + '\n';
        }
      }
      exportCSV += '\n';
      let element = document.createElement('a');
      element.setAttribute('href', 'data:text/csv;base64,' + window.btoa(exportCSV));
      element.setAttribute('download', '參與者統計匯出.csv');
      element.style.display = 'none';
      element.click();
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
    soketsetKBTag: function (data) {
      if(data) {
        this.$socket.client.emit('listDashBoard');
        this.$emit('toastPop', '新增標籤完成！');
        this.tagW = false;
      } else {
        this.$emit('toastPop', '你不可以把全部的標籤都清除啦！');
      }
    },
    soketgetlatestVersions: function (data) {
      for (let i = 0; i < data.length; i++) {
        let file = data[i];
        this.downloadFile(file);
      }
    },
    socketcreateUsersReport: function (data) {
      this.$emit('toastPop', data);
    },
    downloadFile: function (file) {
      this.$emit('downloadFile', file);
    },
    tagQuery: function(tag) {
      let tagItem = _find(this.savedTags, (item) => {
        return item._id === tag
      });
      return tagItem === undefined ? '' : tagItem.name;
    }
  },
  watch: {
    queryHistory: function () {
      if(this.initialized) {
        this.initialized = false;
        this.generateList();
        this.renderChart();
        this.initialized = true;
      }
    },
    sortingRule: function () {
      if(this.initialized) {
        this.initialized = false;
        this.generateList();
        this.renderChart();
        this.initialized = true;
      }
    },
    statisticSteps: function () {
      if(this.initialized) {
        this.initialized = false;
        this.renderChart();
        this.initialized = true;
      }
    },
    dashBoardFirstUse: function () {
      if(this.localLoaded) {
        window.localStorage.setItem('dashBoardFirstUse', JSON.stringify(this.dashBoardFirstUse));
      }
    },
    initStatstics: function () {
      if(this.localLoaded) {
        window.localStorage.setItem('initStatstics', JSON.stringify(this.initStatstics));
      }
      this.showStatstics = this.initStatstics;
    },
    initHistory: function () {
      if(this.localLoaded) {
        window.localStorage.setItem('initHistory', JSON.stringify(this.initHistory));
      }
      this.queryHistory = this.initHistory;
      this.$socket.client.emit('listDashBoard');
    },
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
    randomColors: function () {
      let color = randomColor({
          luminosity: 'dark',
          count: 5,
          format: 'rgb',
          hue: this.$store.state.siteColor
      });
      return color;
    },
    filterColor: function () {
      return this.selectedFilterTags.length > 0 || this.queryTerm !== '' || this.queryHistory === true ? '#B71C1C' : '#00B0FF';
    }
  },
  data () {
    return {
      unreadedList: [],
      sortingRule: true,
      queriedChapters: [],
      initialized: false,
      maxStep: 5,
      convertedList: [],
      chartSeries: [
        {
          name: '0',
          data: [0]
        }
      ],
      chartOptions: {
        chart: {
          type: 'bar',
          height: 150,
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
        colors: [
          '#E76F51',
          '#F8961E',
          '#F9C74F',
          '#90BE6D',
          '#43AA8B',
          '#577590'
        ],
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
      },
      statisticSteps: 1,
      initStatstics: false,
      initHistory: false,
      historyConfig: false,
      initW: false,
      dashBoardFirstUse: true,
      localLoaded: false,
      tagW: false,
      authDetailW: false,
      dashboardPopulated: false,
      showStatstics: false,
      latestCount: 1,
      currentKB: {
        _id: '',
        title: '',
        tag: []
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
      filterBtn: false,
      filterTags: [],
      queryTerm: '',
      selectedFilterTags: [],
      progressList: []
    };
  },
  beforeDestroy () {
    this.$socket.client.off('dashBoardUnreaded', this.socketdashBoardUnreaded);
    this.$socket.client.off('createUsersReport', this.socketcreateUsersReport);
    this.$socket.client.off('listDashBoard', this.socketlistDashBoard);
    this.$socket.client.off('participantStatstics', this.sockparticipantStatstics);
    this.$socket.client.off('getKBVersions', this.sockgetKBVersions);
    this.$socket.client.off('KBVersionUploadError', this.socketKBVersionUploadError);
    this.$socket.client.off('KBVersionDeleteError', this.socketKBVersionDeleteError);
    this.$socket.client.off('requestKBVersionSlice', this.socketrequestKBVersionSlice);
    this.$socket.client.off('KBVersionUploadDone', this.soketKBVersionUploadDone);
    this.$socket.client.off('getlatestVersions', this.soketgetlatestVersions);
    this.$socket.client.off('setKBTag', this.soketsetKBTag);
    window.clearTimeout(this.queryTimer);
    this.queryTimer = null;
  },
  mounted () {
    let dashBoardFirstUse = window.localStorage.getItem('dashBoardFirstUse');
    if(dashBoardFirstUse) {
      this.dashBoardFirstUse = JSON.parse(dashBoardFirstUse);
    }
    let initStatstics = window.localStorage.getItem('initStatstics');
    if(initStatstics) {
      this.initStatstics = JSON.parse(initStatstics);
    }
    let initHistory = window.localStorage.getItem('initHistory');
    if(initHistory) {
      this.initHistory = JSON.parse(initHistory);
      this.historyConfig = true;
    }
    if(this.dashBoardFirstUse) {
      this.initW = true;
    }
    this.localLoaded = true;
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
    if(!this.historyConfig) {
      this.$socket.client.emit('listDashBoard');
    }
    this.$socket.client.on('dashBoardUnreaded', this.socketdashBoardUnreaded);
    this.$socket.client.on('createUsersReport', this.socketcreateUsersReport);
    this.$socket.client.on('listDashBoard', this.socketlistDashBoard);
    this.$socket.client.on('participantStatstics', this.sockparticipantStatstics);
    this.$socket.client.on('getKBVersions', this.sockgetKBVersions);
    this.$socket.client.on('KBVersionUploadError', this.socketKBVersionUploadError);
    this.$socket.client.on('KBVersionDeleteError', this.socketKBVersionDeleteError);
    this.$socket.client.on('requestKBVersionSlice', this.socketrequestKBVersionSlice);
    this.$socket.client.on('KBVersionUploadDone', this.soketKBVersionUploadDone);
    this.$socket.client.on('getlatestVersions', this.soketgetlatestVersions);
    this.$socket.client.on('setKBTag', this.soketsetKBTag);
    let queriedChapters = window.localStorage.getItem('queriedChapters');
    if(queriedChapters) {
      this.queriedChapters = JSON.parse(queriedChapters);
    }
  }
};
</script>
