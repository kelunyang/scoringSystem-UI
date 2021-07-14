<template>
  <v-main class='pa-0 mt-1 mb-1 ml-0 mr-0 d-flex black--text'>
    <v-row no-gutters class='pa-0 mb-1'>
      <v-col class='d-flex flex-row pa-0'>
        <span class='text-h6 text-decoration-underline text-left font-weight-bold'>{{ currentItem.title }}</span>
      </v-col>
    </v-row>
    <v-row no-gutters  class='d-flex justify-space-between text-caption pa-1'>
      <v-col class='text-left'>
        [{{currentItem.mainTag}}][{{ currentItem.mainChapter }}] 編號：{{ (currentItem.sort) }}
      </v-col>
      <v-col class='text-right'>
        <v-icon small>fas fa-paw</v-icon>{{ announceEvent.desc }}[{{ announceEvent.user.name }} @ {{ dateConvert(announceEvent.tick) }}]
      </v-col>
    </v-row>
    <v-row no-gutters>
      <v-col class='flex-grow-1 pa-0'>
        <v-stepper alt-labels v-model='currentStep'>
          <v-stepper-header>
              <template v-for='(stage, index) in currentItem.stages'>
                <v-stepper-step
                  :key='"pt"+stage._id'
                  :step='index + 1'
                  :complete='"passTick" in stage'
                  :rules='[() => !stage.special]'
                  complete-icon='fa-check-circle'
                  error-icon='fa-bomb'
                >
                  <div>
                    <span v-if='"passTick" in stage'>[已完成]</span>
                    <span v-else>
                      <span v-if='currentStep === 0'>[未啟動]</span>
                      <span v-if='currentStep > 0'>{{ (index + 1) === currentStep ? "[進行中]" : "[尚未發生]" }}</span>
                    </span><br/>
                    {{ stage.name }}
                  </div>
                  <small v-if='"startTick" in stage'>起：{{ dateConvert(stage.startTick) }}</small>
                  <small v-if='!("passTick" in stage)'>至：{{ dateConvert(stage.dueTick) }}</small>
                  <small v-if='"passTick" in stage'>至：{{ dateConvert(stage.passTick) }}</small>
                </v-stepper-step>
                <v-divider
                  :key='"divider" + stage._id'
                  v-if='(index + 1) !== currentItem.stages.length'
                ></v-divider>
            </template>
          </v-stepper-header>
        </v-stepper>
      </v-col>
      <v-col ref='progressControl' class='d-flex flex-row flex-wrap align-center flex-grow-0 pa-0 ml-5 mr-5'>
        <v-btn
          link
          :href='"#/videoReview/" + currentItem._id'
        >
          進入審查／回應審查
        </v-btn>
        <v-btn
          @click.stop='requestUpload(currentItem)'
          v-if='currentItem.isVendor || currentItem.isWriter || currentItem.isPM'
        >
          <span v-if='currentItem.isVendor || currentItem.isWriter'>上傳檔案</span>
          <span v-if='currentItem.isPM'>版本管理</span>
        </v-btn>
        <v-btn
          v-if='currentItem.isPM'
          @click.stop='tagMgnt(currentItem)'
        >
          標籤
        </v-btn>
        <div class='d-flex flex-row'>
          <v-checkbox class='ma-0' v-if='currentItem.isPM || currentItem.isFinal' off-icon="far fa-square" on-icon="fa-check-square" v-model='selected'></v-checkbox>
          <v-tooltip top v-if='currentItem.isPM'>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                icon
                @click.stop="expand = !expand"
                v-bind="attrs" v-on="on">
                <v-icon>fa-ellipsis-v</v-icon>
              </v-btn>
            </template>
            <span>查看最近發生的3則事件</span>
          </v-tooltip>
        </div>
      </v-col>
    </v-row>
    <v-row no-gutters v-if='currentItem.currentStep > 0'>
      <v-col class='d-flex flex-row pa-1 align-center' :class='currentItem.remainTick < 86400 ? "red--text" : "black--text"'>
        <span v-if='currentItem.unreadedVersion > 0'>
          <v-icon  class='ma-1' small left :color='currentItem.remainTick < 86400 ? "red" : "black"'>
            fas fa-upload
          </v-icon>
          {{ currentItem.unreadedVersion }}個新版本已上傳
        </span>
        <span v-if='currentItem.unreaded > 0'>
          <v-icon  class='ma-1' small left :color='currentItem.remainTick < 86400 ? "red" : "black"'>
            fas fa-envelope-open-text
          </v-icon>
          {{ currentItem.unreaded }}則Issue未讀
        </span>
        <span>
          <v-icon  class='ma-1' small left :color='currentItem.remainTick < 86400 ? "red" : "black"'>
            fas fa-stopwatch
          </v-icon>
          目前階段：{{ stageConvert(currentItem.currentStep) }}
        </span>
        <span v-if='currentItem.remainTick < Number.MAX_SAFE_INTEGER'>，
          <span v-if='rangeConvert(currentItem.remainTick,0, 864000)'>距離死線約有：{{ timeConvert(currentItem.remainTick) }}</span>
          <span v-if='currentItem.remainTick < 0'>超過死線約有：{{ timeConvert(currentItem.remainTick) }}</span>
        </span>
        <span :color='currentItem.remainTick < 86400 ? "red" : "black"'>，
          審查目標已完成：{{ currentItem.finishedObjs }} / {{ currentItem.currentObjs }}
        </span>
        <v-icon class='ma-1' small :color='currentItem.remainTick < 86400 ? "red" : "black"'>fa-user</v-icon>
        <span>你的角色為</span>
        <span class='text-weight-bold'>
          <span class='cyan--text darken-4' v-if='currentItem.isPM'>[PM]</span>
          <span class='blue-grey--text darken-4' v-if='currentItem.isWriter'>[寫手]</span>
          <span class='teal--text darken-4' v-if='currentItem.isReviewer'>[審查者]</span>
          <span class='indigo--text darken-4' v-if='currentItem.isVendor'>[廠商]</span>
          <span class='deep-purple--text darken-4' v-if='currentItem.isFinal'>[行政]</span>
        </span>
        <v-tooltip top>
          <template v-slot:activator="{ on, attrs }">     
            <v-btn
              icon
              outlined
              @click='openauthDetail(currentItem)'
              color="grey darken-3"
              class='black--text ml-1'
              v-bind="attrs" v-on="on"
              x-small
            >
              <v-icon x-small>fas fa-info</v-icon>
            </v-btn>
          </template>
          <span>查看我的角色所具有的權限</span>
        </v-tooltip>
      </v-col>
    </v-row>
    <v-expand-transition>
      <v-row v-show="expand" no-gutters>
        <v-col>
          <v-timeline dense reverse>
            <v-lazy
              :options="{
                threshold: 0.5
              }"
              min-height="100"
              transition="fade-transition"
              v-for="event in currentItem.eventLog"
              :key="'event'+event._id"
            >
              <v-timeline-item
                fill-dot
              >
                <template v-slot:icon>
                  <v-avatar>
                    <img :src='"https://avatars.dicebear.com/api/" + event.user.types + "/" + encodeURIComponent(event.user.name + "@" + event.user.unit) + ".svg"' />
                  </v-avatar>
                </template>
                <v-card class="elevation-2">
                <v-card-text class='text-body-1 text-right'>
                  <span class='text-subtitle-2 font-weight-black'>[{{ event.type }}]{{ event.user.name }} @ {{ dateConvert(event.tick) }} </span> :  {{ event.desc }}
                </v-card-text>
                </v-card>
              </v-timeline-item>
            </v-lazy>
          </v-timeline>
        </v-col>
      </v-row>
    </v-expand-transition>
  </v-main>
</template>

<script>
import moment from 'moment';
import _head from 'lodash/head';
import _inRange from 'lodash/inRange';
import _find from 'lodash/find'
import momentDurationFormatSetup from 'moment-duration-format';

momentDurationFormatSetup(moment);

export default {
    name: 'ProgressTile',
    props: {
      progressItem: Object,
      selectedItems: Array
    },
    methods: {
      stageConvert: function (step) {
        return step > 0 ? this.currentItem.stages[step-1].name : "未啟動";
      },
      rangeConvert: function (value, start, end) {
        return _inRange(value, start - 0.001, end + 0.001);
      },
      dateConvert: function (time) {
        return moment.unix(time).format('YYYY/MM/DD HH:mm:ss');
      },
      requestUpload: function (item) {
        this.$emit('requestUpload', item);
      },
      timeConvert: function (time) {
        return moment.duration(Math.abs(time), 'second').format('DD日HH小時')
      },
      openauthDetail: function (item) {
        this.$emit('viewDetail', item);
      },
      tagMgnt: function (item) {
        this.$emit('tags', item);
      }
    },
    computed: {
      savedTags: function () {
        return this.$store.state.savedTags;
      },
      announceEvent: function () {
        if(this.currentItem.eventLog.length === 0) {
          return {
            desc: '',
            user: {
              name: ''
            },
            tick: 0
          }
        } else {
          return _head(this.currentItem.eventLog);
        }
      }
    },
    watch: {
      selectedItems: function() {
        let oriobj = this;
        let found = _find(this.selectedItems, (item) => {
          return item === oriobj.currentItem._id;
        });
        if(found !== undefined) {
          this.selected = true;
        } else {
          this.selected = false;
        }
      },
      selected: function () {
        let oriobj = this;
        let found = _find(this.selectedItems, (item) => {
          return item === oriobj.currentItem._id;
        });
        if(found === undefined) {
          if(this.selected) {
            this.$emit('KBselected', this.currentItem);
          }
        } else {
          if(!this.selected) {
            this.$emit('KBselected', this.currentItem);
          }
        }
      }
    },
    created () {
      this.currentItem = this.progressItem;
      this.currentStep = this.currentItem.currentStep;
    },
    data () {
      return {
        currentItem: {
          finishedObjs: 0,
          currentObjs: 0,
          _id: '',
          mainChapter: '',
          mainTag: '',
          currentStep: 0,
          isPM: false,
          isVendor: false,
          isReviewer: false,
          isWriter: false,
          isFinal: false,
          remainTick: 0,
          createDate: 0,
          modDate: 0,
          title: '',
          desc: '',
          descAtt: [],
          tag: [],
          user: '',
          chapter: '',
          sort: 0,
          textbook: '',
          versions: [],
          issues: [],
          eventLog: [],
          stages: []
        },
        selected: false,
        expand: false,
        currentStep: 0
      };
    }
};
</script>
