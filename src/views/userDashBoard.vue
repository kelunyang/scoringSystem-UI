<template>
  <v-sheet>
    <v-dialog v-model="tagFilterW" persistent>
        <v-card>
            <v-card-title class="headline">設定標籤過濾</v-card-title>
            <v-card-text>
              <tag-filter :selectedItem='selectedFilterTags' @valueUpdated='updateFilterTag' :candidatedItem='savedFilterTags' :createable='false' label='請輸入過濾用的標籤' />
            </v-card-text>
            <v-card-actions>
            <v-spacer></v-spacer>
                <v-btn color="green darken-1" text @click="tagFilterW = false">回到檢視畫面</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
    <v-dialog v-model="termFilterW" persistent>
        <v-card>
            <v-card-title class="headline">搜尋關鍵字</v-card-title>
            <v-card-text>
              <v-text-field label='搜尋關鍵字' prepend-icon="fa-search" v-model="queryTerm" full-width></v-text-field>
            </v-card-text>
            <v-card-actions>
            <v-spacer></v-spacer>
                <v-btn color="green darken-1" text @click="termFilterW = false">回到檢視畫面</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
    <v-speed-dial v-model="filterBtn" fixed bottom right direction="left" :open-on-hover="true" transition="slide-y-reverse-transition">
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
    <v-btn
        fab
        dark
        small
        color="green"
        @click.stop='tagFilterW = true'
    >
        <v-icon>fab fa-slack-hash</v-icon>
    </v-btn>
    <v-btn
        fab
        dark
        small
        color="indigo"
        @click.stop='termFilterW = true'
    >
        <v-icon>fa-search</v-icon>
    </v-btn>
    </v-speed-dial>
    <v-main class='pa-0 pl-5'>
        <v-row>
          <v-col class="pa-0">
            <bar-chart :height='100' :chart-data='chartData' :options='options'></bar-chart>
            <p>
              [{{ dateConvert() }}]
              前置作業：{{ stepCount(1) }}
              <font-awesome-icon icon='grip-lines-vertical' />
              腳本／分鏡圖：{{ stepCount(2) }}
              <font-awesome-icon icon='grip-lines-vertical' />
              影片：{{ stepCount(3) }}
              <font-awesome-icon icon='grip-lines-vertical' />
              驗收階段：{{ stepCount(4) }}
              （共 {{ progressList.length }}）</p>
          </v-col>
        </v-row>
        <v-row>
          <v-col class="pa-0">
            <progress-tile v-for="(item,n) in progressList" :key="'tile'+n" :progressItem='item' :externalCommands='externalCommands' />
          </v-col>
        </v-row>
    </v-main>
  </v-sheet>
</template>

<script>
import Vue from 'vue';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faSnapchatGhost } from '@fortawesome/free-brands-svg-icons';
import { faPhotoVideo, faClipboard, faTachometerAlt, faVideo, faSearch, faSkullCrossbones, faExclamationTriangle, faPencilAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import moment from 'moment';
import { randomColor } from 'randomcolor';
import BarChart from './modules/BarChart';
import ProgressTile from './modules/ProgressTile';
import TagFilter from './modules/TagFilter';

import '@fortawesome/fontawesome-free/css/all.css';

library.add(faTachometerAlt, faSnapchatGhost, faPhotoVideo, faClipboard, faVideo, faSearch, faSkullCrossbones, faExclamationTriangle, faPencilAlt);
Vue.component('font-awesome-icon', FontAwesomeIcon);

export default {
  name: 'userDashBoard',
  components: {
    BarChart,
    ProgressTile,
    TagFilter
  },
  methods: {
    updateFilterTag: function (value) {
      this.selectedFilterTags = value;
    },
    stepCount: function (step) {
      return (this.progressList.filter((item) => {
                return item.currentStep === step;
              })).length;
    },
    dateConvert: function (time) {
      return time === null || time === undefined ? moment().format('YYYY/MM/DD HH:mm:ss') : moment.unix(time).format('YYYY/MM/DD HH:mm:ss');
    }
  },
  computed: {
    randomColors: function () {
      let color = randomColor({
          luminosity: 'dark',
          count: 4,
          format: 'rgb'
      });
      return color;
    },
    chartData: function () {
      let oriobj = this;
      let steps = [1, 2, 3, 4];
      let datasets = [...this.filterTags];
      let labels = ['數學科'];
      datasets.forEach((item) => {
        /* labels.push(item.name); 這裡之後要用regex反查知識點的XX科 */
        item.label = item.name;
        item.backgroundColor = oriobj.randomColors[item.id];
        item.data = [oriobj.stepCount(steps[item.id])];
      });
      return {
        labels: labels,
        datasets: datasets
      };
    },
    savedFilterTags: function () {
      let tags = [];
      [...this.filterTags].forEach((item) => {
        tags.push(item.name);
      });
      return tags;
    },
    filterColor: function () {
      return this.selectedFilterTags.length > 0 || this.queryTerm !== '' ? '#B71C1C' : '#00B0FF';
    }
  },
  props: {
  },
  data () {
    return {
      tagFilterW: false,
      termFilterW: false,
      filterBtn: false,
      externalCommands: [
        {
          icon: 'pencil-alt',
          Fn: function () {
            location.href = '#/videoProp';
          }
        }
      ],
      filterTags: [
        {
          id: 1,
          name: '前置作業'
        },
        {
          id: 2,
          name: '腳本／分鏡圖審查'
        },
        {
          id: 3,
          name: '影片審查'
        },
        {
          id: 4,
          name: '驗收階段'
        }
      ],
      queryTerm: '',
      selectedFilterTags: [],
      progressList: [
        {
          id: 0,
          title: '測試標題',
          currentStep: 3,
          historyList: [
              {
                  date: 1602288000,
                  user: {
                      name: 'A廠商',
                      type: 'male'
                  },
                  message: '影片已上傳'
              },
              {
                  date: 1602255000,
                  user: {
                      name: 'X博士',
                      type: 'female'
                  },
                  message: '腳本已同意'
              },
              {
                  date: 1606688000,
                  user: {
                      name: 'A廠商',
                      type: 'male'
                  },
                  message: '腳本已上傳（第2次）'
              },
              {
                  date: 1602200000,
                  user: {
                      name: 'X博士',
                      type: 'female'
                  },
                  message: '要求修改後重新上傳腳本'
              },
              {
                  date: 1601188000,
                  user: {
                      name: 'A廠商',
                      type: 'male'
                  },
                  message: '腳本已上傳（第1次）'
              }
          ],
          currentSteps: [
            {
                step: 1,
                date: 1602288000,
                special: false
            },
            {
                step: 2,
                date: 1604966400,
                special: false
            },
            {
                step: 3,
                date: 1,
                special: true
            }
          ]
        },
        {
          id: 1,
          title: '測試標題1',
          currentStep: 2,
          historyList: [
              {
                  date: 1602288000,
                  user: {
                      name: 'A廠商',
                      type: 'male'
                  },
                  message: '影片已上傳'
              },
              {
                  date: 1602255000,
                  user: {
                      name: 'X博士',
                      type: 'female'
                  },
                  message: '腳本已同意'
              },
              {
                  date: 1606688000,
                  user: {
                      name: 'A廠商',
                      type: 'male'
                  },
                  message: '腳本已上傳（第2次）'
              },
              {
                  date: 1602200000,
                  user: {
                      name: 'X博士',
                      type: 'female'
                  },
                  message: '要求修改後重新上傳腳本'
              },
              {
                  date: 1601188000,
                  user: {
                      name: 'A廠商',
                      type: 'male'
                  },
                  message: '腳本已上傳（第1次）'
              }
          ],
          currentSteps: [
            {
                step: 1,
                date: 1602288000,
                special: false
            },
            {
                step: 2,
                date: 1604966400,
                special: false
            }
          ]
        },
        {
          id: 3,
          title: '測試標題3',
          currentStep: 4,
          historyList: [
              {
                  date: 1602288000,
                  user: {
                      name: 'A廠商',
                      type: 'male'
                  },
                  message: '影片已上傳'
              },
              {
                  date: 1602255000,
                  user: {
                      name: 'X博士',
                      type: 'female'
                  },
                  message: '腳本已同意'
              },
              {
                  date: 1606688000,
                  user: {
                      name: 'A廠商',
                      type: 'male'
                  },
                  message: '腳本已上傳（第2次）'
              },
              {
                  date: 1602200000,
                  user: {
                      name: 'X博士',
                      type: 'female'
                  },
                  message: '要求修改後重新上傳腳本'
              },
              {
                  date: 1601188000,
                  user: {
                      name: 'A廠商',
                      type: 'male'
                  },
                  message: '腳本已上傳（第1次）'
              }
          ],
          currentSteps: [
            {
                step: 1,
                date: 1602288000,
                special: false
            },
            {
                step: 2,
                date: 1604966400,
                special: false
            },
            {
                step: 3,
                date: 1604986400,
                special: false
            },
            {
                step: 4,
                date: 1,
                special: true
            }
          ]
        }
      ],
      options: {
        tooltips: {
            enabled: false
        },
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            xAxes: [{
                stacked: true
            }],
            yAxes: [{
                stacked: true
            }]
        }
      }
    };
  },
  created () {
    this.$emit('viewIn', {
      text: 'DashBoard',
      icon: faTachometerAlt,
      module: '審查模組'
    });
  }
};
</script>
