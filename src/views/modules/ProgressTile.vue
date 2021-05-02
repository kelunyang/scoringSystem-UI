<template>
  <v-lazy
    :options="{
      threshold: 0.5
    }"
    min-height="100"
    transition="fade-transition"
  >
    <v-main class='pa-0 mt-1 mb-1 ml-0 mr-0 d-flex black--text'>
      <v-row no-gutters class='pa-0 mb-1'>
        <v-col class='d-flex flex-row pa-0'>
          <span class='text-h6 text-decoration-underline text-left font-weight-bold'>{{ currentItem.title }}</span>
        </v-col>
      </v-row>
      <v-row v-if="events.length > 0" no-gutters>
        <v-col class='text-right d-flex justify-end text-caption pa-1'>
          <v-icon small>fa-bullhorn</v-icon>{{ announcedEvent.desc }}[{{ announcedEvent.user.name }} @ {{ dateConvert(announcedEvent.tick) }}]
        </v-col>
      </v-row>
      <v-row no-gutters>
        <v-col class='flex-grow-1 pa-0'>
          <v-stepper alt-labels v-model='currentStep'>
            <v-stepper-header>
                <template v-for='(stage, index) in currentItem.stages'>
                  <v-stepper-step
                    :key='stage._id'
                    :step='index + 1'
                    :complete='index + 1 < currentStep'
                    :rules='[() => !stage.special]'
                    complete-icon='fa-check-circle'
                    error-icon='fa-bomb'
                    alt-labels
                  >
                    <div v-if='currentStep === 0'>[未啟動]<br/>{{ stage.name }}</div>
                    <div v-if='currentStep > 0' v-show='(index + 1) === currentStep'>[進行中]<br/>{{ stage.name }}</div>
                    <div v-if='currentStep > 0' v-show='(index + 1) < currentStep'>[已完成]<br/>{{ stage.name }}</div>
                    <div v-if='currentStep > 0' v-show='(index + 1) > currentStep'>[尚未發生]<br/>{{ stage.name }}</div>
                    <small>起：{{ dateConvert(stage.dueTick) }}</small>
                    <small v-if='stage.passTick === 0'>至：{{ dateConvert(stage.dueTick) }}</small><br/>
                    <small v-if='stage.passTick > 0'>至：{{ dateConvert(stage.passTick) }}</small>
                  </v-stepper-step>
                  <v-divider
                    :key='"divider" + stage._id'
                    v-if='(index + 1) !== currentItem.stages.length'
                  ></v-divider>
              </template>
            </v-stepper-header>
          </v-stepper>
        </v-col>
        <v-col ref='progressControl' class='d-flex flex-row align-center flex-grow-0 pa-0 ml-5 mr-5'>
          <v-checkbox v-if='currentItem.isPM || currentItem.isFinal' off-icon="far fa-square" on-icon="fa-check-square" v-model='selectedItem'></v-checkbox>
          <v-tooltip top>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                :icon='currentItem.isPM'
                link
                :href='"#/videoReview/" + currentItem._id'
                v-bind="attrs" v-on="on"
              >
                <v-icon v-if='currentItem.isPM'>fa-tasks</v-icon>
                <span v-if='!currentItem.isPM'>進入審查／回應審查</span>
              </v-btn>
            </template>
            <span>開始審查</span>
          </v-tooltip>
          <v-tooltip top v-if='currentItem.isVendor || currentItem.isWriter || currentItem.isPM'>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                :icon='currentItem.isPM'
                @click.stop='requestUpload(currentItem)'
                v-bind="attrs" v-on="on"
              >
                <v-icon v-if='currentItem.isPM'>fa-code-branch</v-icon>
                <span v-if='!currentItem.isPM'>上傳</span>
              </v-btn>
            </template>
            <span>版本管理</span>
          </v-tooltip>
          <v-tooltip top v-if='currentItem.isPM'>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                icon
                @click.stop='tagMgnt(currentItem)'
                v-bind="attrs" v-on="on"
              >
                <v-icon>fab fa-slack-hash</v-icon>
              </v-btn>
            </template>
            <span>標籤管理</span>
          </v-tooltip>
          <v-tooltip top v-if='currentItem.isPM'>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                icon
                @click.stop="expand = !expand"
                v-bind="attrs" v-on="on">
                <v-icon>fa-ellipsis-v</v-icon>
              </v-btn>
            </template>
            <span>查看最近發生的10則事件</span>
          </v-tooltip>
        </v-col>
      </v-row>
      <v-row no-gutters v-if='currentItem.currentStep > 0'>
        <v-col class='d-flex flex-row pa-1 align-center' :class='currentItem.remainTick < 86400 ? "red--text" : "black--text"'>
          <span v-if='currentItem.remainTick < Number.MAX_SAFE_INTEGER'>
            <v-icon class='ma-1' small :color='currentItem.remainTick < 86400 ? "red" : "black"'>fa-stopwatch</v-icon>
            <span>本階段</span>
            <span v-if='rangeConvert(currentItem.remainTick,0, 864000)'>距離死線約有：{{ timeConvert(currentItem.remainTick) }}</span>
            <span v-if='currentItem.remainTick < 0'>超過死線約有：{{ timeConvert(currentItem.remainTick) }}</span>
            <span>／</span>
          </span>
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
              <v-timeline-item
                v-for="event in events"
                :key="event._id"
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
            </v-timeline>
          </v-col>
        </v-row>
      </v-expand-transition>
    </v-main>
  </v-lazy>
</template>

<script>
import moment from 'moment';
import _ from 'lodash';
import '@fortawesome/fontawesome-free/css/all.css';
import momentDurationFormatSetup from 'moment-duration-format';

momentDurationFormatSetup(moment);

export default {
    name: 'ProgressTile',
    props: {
      progressItem: Object
    },
    methods: {
      rangeConvert: function (value, start, end) {
        return _.inRange(value, start - 0.001, end + 0.001);
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
      currentUser: function () {
        return this.$store.state.currentUser;
      },
      events: function () {
        let events = this.currentItem.eventLog;
        events.sort((a, b) => {
          return b.tick - a.tick;
        });
        return _.slice(events, 0, 10);
      },
      announcedEvent: function () {
        return _.first(this.events);
      }
    },
    watch: {
      selectedItem: function () {
        this.$emit('KBselected', this.currentItem);
      },
      'currentItem.currentStep': function () {
        this.currentStep = this.currentItem.currentStep;
      }
    },
    created () {
      this.currentItem = this.progressItem;
      this.selectedItem = this.currentItem.selected;
    },
    data () {
      return {
        currentItem: {
          _id: '',
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
        selectedItem: false,
        expand: false,
        currentStep: 0
      };
    }
};
</script>
