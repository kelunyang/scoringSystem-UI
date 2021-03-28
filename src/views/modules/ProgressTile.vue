<template>
  <v-main class='pa-5 ma-0 d-flex'>
    <v-row class='pa-5'>
      <v-col class='d-flex flex-row pa-0'>
        <span class='text-subtitle-1 text-left font-weight-bold'>{{ progressItem.title }}</span>
        <v-spacer></v-spacer>
        <span v-if="events.length > 0">
          <v-icon>fa-bullhorn</v-icon>{{ announcedEvent.desc }}[{{ announcedEvent.user.name }} @ {{ dateConvert(announcedEvent.tick) }}]
        </span>
      </v-col>
    </v-row>
    <v-row>
      <v-col class='flex-grow-1 pa-0'>
        <v-stepper alt-labels v-model='currentStep'>
          <v-stepper-header>
              <template v-for='(stage, index) in progressItem.stages'>
                <v-stepper-step
                  :key='stage._id'
                  :step='index + 1'
                  :complete='stage.step < progressItem.currentStep'
                  :rules='[() => !stage.special]'
                  complete-icon='fa-check-circle'
                  error-icon='fa-bomb'
                  alt-labels
                  class='text-center'
                >
                  <div v-if='progressItem.currentStep === 0'>未啟動</div>
                  <div v-if='progressItem.currentStep > 0' v-show='(index + 1) === progressItem.currentStep'>{{ stage.name }}</div>
                  <div v-if='progressItem.currentStep > 0' v-show='(index + 1) < progressItem.currentStep'>已完成</div>
                  <div v-if='progressItem.currentStep > 0' v-show='(index + 1) > progressItem.currentStep'>尚未發生</div>
                  <small>{{ dateConvert(stage.dueTick) }}</small><br/>
                  <small v-if='stage.passTick > 0'>{{ dateConvert(stage.passTick) }}</small>
                </v-stepper-step>
                <v-divider
                  :key='"divider" + stage._id'
                  v-if='(index + 1) !== progressItem.stages.length'
                ></v-divider>
            </template>
          </v-stepper-header>
        </v-stepper>
      </v-col>
      <v-col ref='progressControl' class='d-flex flex-row align-center flex-grow-0 pa-0 ml-5 mr-5'>
        <v-checkbox v-if='progressItem.isPM || progressItem.isFinal' off-icon="far fa-square" on-icon="fa-check-square" v-model='selectedItem'></v-checkbox>
        <v-tooltip top>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              :icon='btnCount >= 5'
              link
              :href='"#/videoReview/" + progressItem._id'
              v-bind="attrs" v-on="on"
            >
              <v-icon v-if='btnCount >= 5'>fa-tasks</v-icon>
              <span v-if='btnCount < 5'>審查</span>
            </v-btn>
          </template>
          <span>開始審查</span>
        </v-tooltip>
        <v-tooltip top v-if='progressItem.isVendor'>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              :icon='btnCount >= 5'
              @click.stop='requestUpload(progressItem)'
              v-bind="attrs" v-on="on"
            >
              <v-icon v-if='btnCount >= 5'>fa-code-branch</v-icon>
              <span v-if='btnCount < 5'>上傳</span>
            </v-btn>
          </template>
          <span>Commit管理</span>
        </v-tooltip>
        <v-tooltip top v-if='progressItem.isPM'>
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
    <v-expand-transition>
      <v-row v-show="expand">
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
</template>

<script>
import moment from 'moment';
import _ from 'lodash';
import '@fortawesome/fontawesome-free/css/all.css';

export default {
    name: 'ProgressTile',
    props: {
      progressItem: Object
    },
    methods: {
      dateConvert: function (time) {
        return moment.unix(time).format('YYYY/MM/DD HH:mm:ss');
      },
      requestUpload: function (item) {
        this.$emit('requestUpload', item);
      }
    },
    computed: {
      currentUser: function () {
        return this.$store.state.currentUser;
      },
      events: function () {
        let events = this.progressItem.eventLog;
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
        this.$emit('KBselected', this.progressItem);
      }
    },
    created() {
      this.selectedItem = this.progressItem.selected;
    },
    mounted() {
      this.btnCount = this.$refs.progressControl.children.length;
    },
    data () {
      return {
        selectedItem: false,
        expand: false,
        btnCount: 0
      };
    }
};
</script>
