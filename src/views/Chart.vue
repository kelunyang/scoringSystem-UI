<template>
  <v-sheet>
    <v-dialog
      v-model="importSW"
      persistent
      max-width="50vw"
    >
      <v-card>
        <v-card-title class="headline">
          以下知識點匯入失敗
        </v-card-title>
        <v-card-text>
          <div class='text-caption red--text text-left'>
            以下知識點統計匯入失敗，可能是同範圍類型的資料以重複，或是找不到對應的知識點
            <ol>
              <li v-for='log in importLogs' :key='log'>{{ log }}</li>
            </ol>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            @click="importSW = false"
          >
            關閉對話框
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="importW"
      persistent
      max-width="50vw"
    >
      <v-card>
        <v-toolbar
          dark
          color="primary"
        >
          <v-toolbar-title>匯入知識點統計</v-toolbar-title>
        </v-toolbar>
        <v-card-text class='d-flex flex-column text-left'>
          <div class='red--text text-caption'>這個功能是提供給匯入知識點於各個平台的統計數據使用，特別提醒，如果你發現匯入進度一直停在同一處，那可能是資料庫寫入的時間差，但實際上已經匯入完成了，如果有疑惑，可以重新整理網頁，再匯入一次</div>
          <div class='text-h6'>資料來源標籤</div>
          <tag-filter
            @updateTags='updateTags'
            @plusItem='plusTag'
            :mustSelected='true'
            :single='true'
            :selectedItem='sourceTag'
            @valueUpdated='updatesourceTag'
            :candidatedItem='savedTags'
            :createable='true'
            label='數據來源標籤，如學習吧、酷課學習之類的'
          />
          <div class='text-h6'>資料類型標籤</div>
          <tag-filter
            @updateTags='updateTags'
            @plusItem='plusTag'
            :mustSelected='true'
            :single='false'
            :selectedItem='typeTags'
            @valueUpdated='updatetypeTags'
            :candidatedItem='savedTags'
            :createable='true'
            label='數據類型標籤，如瀏覽次數、瀏覽時長之類的'
          />
          <div class='text-h6' v-if='typeTags.length > 0 && sourceTag !== ""'>檔案上傳</div>
          <v-file-input
            v-if='typeTags.length > 0 && sourceTag !== ""'
            prepend-icon="fa-paperclip" 
            v-model="statisticsFile" 
            label='上傳統計數據' 
            accept="text/csv"
            :loading="uploadprogress !== 0">
            <template v-slot:progress>
              <v-progress-circular :value="uploadprogress"></v-progress-circular>速度：{{ uploadstatus }}
            </template>
          </v-file-input>
          <div class='gray--text text-caption'>{{ importStatus }}</div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            @click="importW = false"
          >
            關閉對話框
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="filterW"
      persistent
      max-width="50vw"
    >
      <v-card>
        <v-toolbar
          dark
          color="primary"
        >
          <v-toolbar-title>請選擇你要檢視的統計數據</v-toolbar-title>
        </v-toolbar>
        <v-card-text class='d-flex flex-column pa-0'>
          <v-alert type='info' v-if='currentPreset > 0'>已載入 {{ dateConvert(currentPreset) }} 設定的查詢集，請記得選擇查詢時間區間，否則預設值只會查今天的</v-alert>
          <div class='d-flex flex-column pa-5'>
            <div class='text-h6' v-if='usedPresets.length > 0'>已查詢過的設定檔</div>
            <v-simple-table v-if='usedPresets.length > 0'>
              <template v-slot:default>
                <thead>
                  <tr>
                    <th class="text-left">
                      上次查詢時間
                    </th>
                    <th>
                      資料源
                    </th>
                    <th>
                      資料類型
                    </th>
                    <th>
                      科目標籤
                    </th>
                    <th>
                      &nbsp;
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="preset in usedPresets"
                    :key="preset.tick"
                  >
                    <td class="text-left">
                      {{ dateConvert(preset.tick) }}
                    </td>
                    <td class="text-left">
                      <span class="text-decoration-underline ml-1" v-for='tag in preset.querysourceTags' :key='tag'>
                        {{ tagConverter(tag) }}
                      </span>
                    </td>
                    <td class="text-left">
                      <span>{{ tagConverter(preset.querytypeTag) }}</span>
                      <span v-if="preset.secondConvert">（秒時轉換）</span>
                    </td>
                    <td class="text-left">
                      <span class="text-decoration-underline ml-1" v-for='tag in preset.queryKBTags' :key='tag'>
                        {{ tagConverter(tag) }}
                      </span>
                    </td>
                    <td class="text-right d-flex flex-row justify-end">
                      <v-btn
                        color='indigo darken-4'
                        class='white--text ma-1'
                        @click='clonePreset(preset)'
                      >
                        套用設定
                      </v-btn>
                      <v-menu
                        offset-y
                        attach
                        transition="slide-y-transition"
                      >
                        <template v-slot:activator="{ on, attrs }">
                          <v-btn
                            color='red accent-4'
                            class='white--text ma-1'
                            v-bind="attrs" v-on="on"
                          >
                            刪除
                          </v-btn>
                        </template>
                        <v-sheet class='d-flex flex-column pa-1'>
                          <div class='text-h6'>確認刪除舊有設定檔？</div>
                          <v-btn
                            color='red accent-4'
                            class='white--text ma-1'
                            @click='deletePreset(preset)'
                          >
                            刪除
                          </v-btn>
                          <div class='text-caption'>如果你只是誤觸，請隨意點擊其他地方即會關閉本對話框</div>
                        </v-sheet>
                      </v-menu>
                    </td>
                  </tr>
                </tbody>
              </template>
            </v-simple-table>
            <div class='text-h6'>選擇資料源（如均一、學習吧等等）</div>
            <tag-filter
              :mustSelected='true'
              :single='false'
              :selectedItem='querysourceTags' 
              @valueUpdated='updatequerysourceTags'
              :candidatedItem='savedTags'
              :createable='false'
              label='數據來源標籤，如學習吧、酷課學習之類的'
              v-show='usedPresets.length === 0 || newPreset'
            />
            <div class='text-h6' v-show='usedPresets.length === 0 || newPreset'>選擇資料類型（如點擊量、觀看時長等等）</div>
            <tag-filter
              v-show='usedPresets.length === 0 || newPreset'
              :mustSelected='true'
              :single='true'
              :selectedItem='querytypeTag'
              @valueUpdated='updatequerytypeTag'
              :candidatedItem='savedTags'
              :createable='false'
              label='數據類型標籤，如點擊量、時長之類的'
            />
            <div class='text-h6' v-show='usedPresets.length === 0 || newPreset'>科目標籤（如數學科、理化科等等，非必選）</div>
            <tag-filter
              v-show='usedPresets.length === 0 || newPreset'
              :mustSelected='false'
              :single='false'
              :selectedItem='queryKBTags'
              @valueUpdated='updatequeryKBTags'
              :candidatedItem='savedTags'
              :createable='false'
              label='知識點科目標籤，如理化、數學之類的'
            />
            <div class='text-h6' v-show='usedPresets.length === 0 || newPreset'>秒/小時轉換，請打勾</div>
            <v-switch
              v-show='usedPresets.length === 0 || newPreset'
              v-model="secondConvert"
              label="如果你選的是秒類型的資料，請在這裡打勾，會自動把秒轉換為小時"
            ></v-switch>
            <div class='text-h6' v-show='usedPresets.length === 0 || newPreset'>設定統計區間</div>
            <v-select
              :items='rangeItems'
              label='統計區間'
              v-model='range'
              item-text="title"
              item-value="value"
            ></v-select>
            <div class='text-h6'>選擇查詢區間起點</div>
            <v-dialog
              v-model="starttickW"
              :return-value.sync="date"
              persistent
              width="290px"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-text-field
                  v-model="querystartTick"
                  label="選擇查詢區間起點"
                  prepend-icon="fa-calendar"
                  readonly
                  v-bind="attrs"
                  v-on="on"
                ></v-text-field>
              </template>
              <v-date-picker
                v-model="querystartTick"
                scrollable
              >
                <v-spacer></v-spacer>
                <v-btn
                  text
                  color="primary"
                  @click="starttickW = false"
                >
                  選擇完畢
                </v-btn>
              </v-date-picker>
            </v-dialog>
            <div class='text-h6'>選擇查詢區間終點</div>
            <v-dialog
              v-model="endtickW"
              :return-value.sync="date"
              persistent
              width="290px"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-text-field
                  v-model="queryendTick"
                  label="選擇查詢區間終點"
                  prepend-icon="fa-calendar"
                  readonly
                  v-bind="attrs"
                  v-on="on"
                ></v-text-field>
              </template>
              <v-date-picker
                v-model="queryendTick"
                scrollable
              >
                <v-spacer></v-spacer>
                <v-btn
                  text
                  color="primary"
                  @click="endtickW = false"
                >
                  選擇完畢
                </v-btn>
              </v-date-picker>
            </v-dialog>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            v-show='usedPresets.length > 0'
            @click='createPreset'
            color='indigo darken-4'
            class='white--text ma-1'
          >
            建立新的查詢集
          </v-btn>
          <v-btn
            :disable='querysourceTags.length === 0 && querytypeTag === ""'
            @click='sendKBStatistics()'
            color='red accent-4'
            class='white--text ma-1'
          >
            查詢瀏覽量統計
          </v-btn>
          <v-btn
            @click='closefilterW'
            class='ma-1'
          >
            關閉對話框
          </v-btn>
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
              large
              dark
              bottom
              right
              @click='openimportW'
            >
              <v-icon>fa-file-import</v-icon>
            </v-btn>
          </template>
        <span>匯入知識點統計</span>
      </v-tooltip>
    </v-fab-transition>
    <v-skeleton-loader
      class="mx-auto"
      type="card"
      v-if='!statisticsPopulated'
      width="100%"
    ></v-skeleton-loader>
    <div v-if='statisticsPopulated' class='d-flex flex-row flex-wrap justify-space-around'>
      <div>過濾條件：自{{ querystartTick }}至{{ queryendTick }}，來自
      <span v-if='selectedKB === undefined'>
        <span class="text-decoration-underline ml-1" v-for='tag in querysourceTags' :key='tag'>
          {{ tagConverter(tag) }}
        </span>
        的
        <span class="text-decoration-underline ml-1" v-for='tag in queryKBTags' :key='tag'>
          {{ tagConverter(tag) }}
        </span>
        <span>{{ tagConverter(querytypeTag) }}</span>
      </span>
      <span v-else>
        知識點： {{ selectedKB.title }}
      </span>
      </div>
      <v-btn @click='openFilterW'>改變查詢條件</v-btn>
    </div>
    <apexchart v-if='statisticsPopulated' width="100%" type="line" :options="chartData.chartOptions" :series="chartData.series"></apexchart>
    <div v-if='statisticsPopulated'>總量： {{ sumValue }} ／ {{ rankings.length }} 個知識點</div>
    <v-simple-table v-if='statisticsPopulated'>
      <template v-slot:default>
        <thead>
          <tr>
            <th class="text-left">
              時間
            </th>
            <th>
              逐時數據
            </th>
            <th>
              總量
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="data in periodData"
            :key="data._id"
          >
            <td class="text-left">
              {{ data._id }}
            </td>
            <td class="text-left">
              {{ data.peroidlySum }}
            </td>
            <td class="text-left">
              {{ data.accuSum }}
            </td>
          </tr>
        </tbody>
      </template>
    </v-simple-table>
    <div class='text-h6' v-if='statisticsPopulated'>各知識點排名</div>
    <v-simple-table v-if='statisticsPopulated'>
      <template v-slot:default>
        <thead>
          <tr>
            <th class="text-left">
              知識點名稱
            </th>
            <th>
              數量
            </th>
            <th>
              &nbsp;
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="rank in rankings"
            :key="rank._id._id"
          >
            <td class="text-left">
              {{ rank._id.title }}
            </td>
            <td class="text-left">
              {{ rank.KBSum }}
            </td>
            <td>
              <v-btn @click='sendKBStatistics(rank._id)'>查看本知識點的統計</v-btn>
            </td>
          </tr>
        </tbody>
      </template>
    </v-simple-table>
  </v-sheet>
</template>

<script>
import Vue from 'vue';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faChartLine } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';
import _ from 'lodash';
import prettyBytes from 'pretty-bytes';
import TagFilter from './modules/TagFilter';
import VueApexCharts from 'vue-apexcharts';
import { randomColor } from 'randomcolor';
import Decimal from 'decimal.js';

let files = [];

library.add(faChartLine);
Vue.use(VueApexCharts);
Vue.component('apexchart', VueApexCharts);
Vue.component('font-awesome-icon', FontAwesomeIcon);

export default {
  components: {
    TagFilter
  },
  name: 'charts',
  methods: {
    updateTags: function() {
      this.$emit('updateTags');
    },
    openFilterW: function () {
      this.currentPreset = 0;
      this.querysourceTags = [];
      this.queryKBTags = [];
      this.querytypeTag = '';
      this.newPreset = false;
      this.filterW = true;
    },
    createPreset: function () {
      this.newPreset = true;
      this.currentPreset = 0;
    },
    dateConvert: function (time) {
      return time === 0 ? '尚未設定' : moment.unix(time).format('YYYY/MM/DD HH:mm:ss');
    },
    deletePreset: function (preset) {
      this.usedPresets = _.filter(this.usedPresets, (upreset) => {
        return upreset.tick !== preset.tick;
      });
      this.currentPreset = 0;
    },
    clonePreset: function (preset) {
      this.currentPreset = preset.tick;
      this.querysourceTags = preset.querysourceTags;
      this.querytypeTag = preset.querytypeTag;
      this.queryKBTags = preset.queryKBTags;
      this.secondConvert = preset.secondConvert;
    },
    updatequeryKBTags: function (val) {
      this.queryKBTags = val;
    },
    openimportW: function () {
      this.importW = true;
      this.importStatus = '';
    },
    closefilterW: function () {
      this.filterW = false;
      this.statisticsPopulated = true;
    },
    tagConverter: function (tagID) {
      let tag = _.find(this.savedTags, (tag) => {
        return tag._id === tagID;
      });
      if(tag === undefined) {
        return '';
      } else {
        return tag.name;
      }
    },
    sendKBStatistics: function (KBID) {
      if(this.querysourceTags.length > 0) {
        if(this.querytypeTag !== '') {
          this.statisticsPopulated = false;
          this.$emit('toastPop', '取得數據中...');
          this.selectedKB = KBID;
          this.$socket.client.emit("periodKBStatistics", {
            type: this.range,
            KB: KBID === undefined ? undefined : this.selectedKB._id,
            querytypeTag: this.querytypeTag,
            querysourceTags: this.querysourceTags,
            queryKBTags: this.queryKBTags,
            starttick: moment(this.querystartTick).unix(),
            endtick: moment(this.queryendTick).unix()
          });
          this.$socket.client.emit("periodKBranking", {
            type: this.range,
            KB: KBID === undefined ? undefined : this.selectedKB._id,
            querytypeTag: this.querytypeTag,
            querysourceTags: this.querysourceTags,
            queryKBTags: this.queryKBTags,
            starttick: moment(this.querystartTick).unix(),
            endtick: moment(this.queryendTick).unix()
          });
          return;
        }
      }
      this.$emit('toastPop','你沒有設定任何條件，無法查詢！');
    },
    updatequerysourceTags: function (val) {
      this.querysourceTags = val;
    },
    updatequerytypeTag: function (val) {
      this.querytypeTag = val;
    },
    updatesourceTag: function (val) {
      this.sourceTag = val;
    },
    updatetypeTags: function (val) {
      this.typeTags = val;
    },
    plusTag: function (val) {
      this.$emit('addTag', val);
    },
    socketimportKBstatistics: function (data) {
      if(data.length > 0) {
        this.importSW = true;
        this.importLogs = data;
      }
    },
    soketKBstatisticsUploadDone: function () {
      let oriobj = this;
      this.statisticsFile = undefined;
      this.uploadprogress = 100;
      this.uploadstatus = '完成！';
      Vue.nextTick(() => {
        oriobj.uploadprogress = 0;
        oriobj.uploadstatus = '';
      });
    },
    socketKBstatisticsUploadError: function (data) {
      this.$emit('toastPop', '上傳失敗（原因：' + data + '），請聯絡管理員');
      this.uploadprogress = 0;
      this.uploadstatus = '';
    },
    socketrequestKBstatisticsSlice: function (data) {
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
        oriobj.$socket.client.emit('importKBstatistics', {
          typeTags: oriobj.typeTags,
          sourceTag: oriobj.sourceTag,
          uuid: data.uuid,
          name: files[data.uuid].file.name,
          type: files[data.uuid].file.type,
          size: files[data.uuid].file.size,
          data: arrayBuffer
        });
      };
    },
    soketKBstatisticsReport: function (data) {
      this.importStatus = data;
    },
    soketperiodKBStatistics: function (data) {
      let now = moment().unix();
      this.sumValue = new Decimal(0);
      if(this.secondConvert) {
        for(let i=0; i < data.length; i++) {
          data[i].peroidlySum = data[i].peroidlySum / 60 / 60;
        }
      }
      for(let i=0; i<data.length; i++) {
        data[i].peroidlySum = new Decimal(data[i].peroidlySum);
        this.sumValue = this.sumValue.plus(data[i].peroidlySum);
        if(this.secondConvert) { data[i].peroidlySum = (new Decimal(data[i].peroidlySum)).toFixed(2); }
        data[i].accuSum = this.secondConvert ? this.sumValue.toFixed(2) : this.sumValue.toNumber();
      }
      this.sumValue = this.secondConvert ? this.sumValue.toFixed(2) : this.sumValue.toNumber();
      this.periodData = data;
      if(this.currentPreset === 0) {
        this.usedPresets.push({
          tick: now,
          querysourceTags: this.querysourceTags,
          querytypeTag: this.querytypeTag,
          secondConvert: this.secondConvert,
          queryKBTags: this.queryKBTags
        });
        this.currentPreset = now;
      } else {
        let currentPreset = _.find(this.usedPresets, (preset) => {
          return preset.tick === this.currentPreset;
        });
        currentPreset.tick = now;
        this.currentPreset = now;
        window.localStorage.setItem('usedPresets', JSON.stringify(this.usedPresets));
      }
      this.statisticsPopulated = true;
      this.filterW = false;
    },
    soketperiodKBranking: function (data) {
      if(this.secondConvert) {
        for(let i=0; i < data.length; i++) {
          data[i].KBSum = (new Decimal(data[i].KBSum / 60 / 60)).toFixed(2);
        }
      }
      this.rankings = data;
      this.filterW = false;
    }
  },
  watch: {
    usedPresets: {
      immediate: true,
      handler () {
        if(this.localLoaded) {
          window.localStorage.setItem('usedPresets', JSON.stringify(this.usedPresets));
          console.log('exec watch');
        }
      }
    },
    statisticsFile: {
      immediate: true,
      handler () {
        if (this.statisticsFile !== undefined) {
          let oriobj = this;
          let fileReader = new FileReader();
          let slice = this.statisticsFile.slice(0, 100000);
          let uuid = uuidv4();
          files[uuid] = {
            typeTags: this.typeTags,
            sourceTag: this.sourceTag,
            file: this.statisticsFile,
            starttick: moment().valueOf()
          };
          fileReader.readAsArrayBuffer(slice);
          fileReader.onload = () => {
            var arrayBuffer = fileReader.result;
            oriobj.$socket.client.emit('importKBstatistics', {
              typeTags: oriobj.typeTags,
              sourceTag: oriobj.sourceTag,
              uuid: uuid,
              name: oriobj.statisticsFile.name,
              type: oriobj.statisticsFile.type,
              size: oriobj.statisticsFile.size,
              data: arrayBuffer
            });
          };
        }
      }
    }
  },
  data () {
    return {
      localLoaded: false,
      usedPresets: [],
      currentPreset: 0,
      newPreset: false,
      statisticsPopulated: false,
      filterW: true,
      secondConvert: false,
      sumValue: 0,
      starttickW: false,
      endtickW: false,
      periodData: [],
      rankings: [],
      selectedKB: undefined,
      importSW: false,
      importLogs: [],
      range: 1,
      querystartTick: moment().format("YYYY-MM-DD"),
      queryendTick: moment().format("YYYY-MM-DD"),
      queryKBTags: [],
      querysourceTags: [],
      querytypeTag: '',
      statisticsFile: undefined,
      importW: false,
      uploadprogress: 0,
      uploadstatus: '',
      typeTags: [],
      sourceTag: '',
      importStatus: '',
      rangeItems: [
        {
          title: '日',
          value: 0
        },
        {
          title: '月',
          value: 1
        },
        {
          title: '年',
          value: 2
        }
      ]
    };
  },
  computed: {
    savedTags: function () {
      return this.$store.state.savedTags;
    },
    chartData: function () {
      let dates = _.map(this.periodData, '_id');
      let periodColumn = _.map(this.periodData, 'peroidlySum');
      let accuLine = _.map(this.periodData, 'accuSum');
      return {
        series: [
          {
            name: "逐時結果",
            type: 'column',
            data: periodColumn
          },
          {
            name: "累計結果",
            type: 'line',
            data: accuLine
          },
        ],
        chartOptions: {
          chart: {
            type: 'line',
            height: 500,
          },
          stroke: {
            width: [0, 4]
          },
          colors: randomColor({
            luminosity: 'dark',
            count: 2,
            format: 'rgb'
          }),
          title: {
            text: '知識點逐時統計'
          },
          dataLabels: {
            enabled: true,
            enabledOnSeries: [1]
          },
          labels: dates,
          xaxis: {
            type: 'datetime'
          },
          yaxis: [{
            title: {
              text: '逐時量',
            },
          
          }, {
            opposite: true,
            title: {
              text: '累計量'
            }
          }],
          fill: {
            opacity: 1
          
          },
          legend: {
            position: 'top',
            horizontalAlign: 'left',
            offsetX: 40
          }
        }
      }
    },
  },
  created () {
    this.$emit('viewIn', {
      text: '知識點影片數據',
      icon: 'fa-chart-bar',
      module: '統計模組',
      location: '/Chart'
    });
    this.$socket.client.on('KBVersionUploadError', this.socketKBstatisticsUploadError);
    this.$socket.client.on('requestKBVersionSlice', this.socketrequestKBstatisticsSlice);
    this.$socket.client.on('KBVersionUploadDone', this.soketKBstatisticsUploadDone);
    this.$socket.client.on('KBstatisticsReport', this.soketKBstatisticsReport);
    this.$socket.client.on('periodKBStatistics', this.soketperiodKBStatistics);
    this.$socket.client.on('periodKBranking', this.soketperiodKBranking);
    this.$socket.client.on('importKBstatistics', this.socketimportKBstatistics);
  },
  mounted () {
    let oriobj = this;
    let usedPresets = window.localStorage.getItem('usedPresets');
    if(usedPresets) {
      oriobj.usedPresets = JSON.parse(usedPresets);
    }
    this.localLoaded = true;
  },
  beforeDestroy () {
    this.$socket.client.off('KBVersionUploadError', this.socketKBstatisticsUploadError);
    this.$socket.client.off('requestKBVersionSlice', this.socketrequestKBstatisticsSlice);
    this.$socket.client.off('KBVersionUploadDone', this.soketKBstatisticsUploadDone);
    this.$socket.client.off('KBstatisticsReport', this.soketKBstatisticsReport);
    this.$socket.client.off('periodKBStatistics', this.soketperiodKBStatistics);
    this.$socket.client.off('periodKBranking', this.soketperiodKBranking);
    this.$socket.client.off('importKBstatistics', this.socketimportKBstatistics);
  }
};
</script>
