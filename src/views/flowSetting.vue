<template>
    <v-main class='pa-0'>
      <v-row>
          <v-col>
            <v-timeline dense>
                <v-timeline-item icon="fa-pencil-ruler" fill-dot color="#1A237E">
                    <v-card class="elevation-2">
                    <v-card-title class="indigo darken-4 white--text text-h6 font-weight-black">前置作業</v-card-title>
                    </v-card>
                </v-timeline-item>
                <v-timeline-item small fill-dot color="#1A237E">
                    <v-card class="elevation-2">
                    <v-card-title class="text-h6 font-weight-black">設定計畫啟動成員標籤</v-card-title>
                    <v-card-text class='text-body-1'>
                        <div class="text-subtitle-1 font-weight-bold">權限</div>
                        <tag-filter :selectedItem='selectedAuthUserTags' @valueUpdated='updateAuthUserTag' :candidatedItem='savedUserTags' :createable='true' label='請輸入授權的使用者標籤' />
                    </v-card-text>
                    </v-card>
                </v-timeline-item>
                <v-timeline-item small fill-dot color="#1A237E">
                    <v-card class="elevation-2">
                    <v-card-title class="text-h6 font-weight-black">知識點設定／分工</v-card-title>
                    <v-card-text class='text-body-1'>
                        <div class="text-subtitle-1 font-weight-bold">權限</div>
                        <tag-filter :selectedItem='selectedCreateTags' @valueUpdated='updateCreateTag' :candidatedItem='savedUserTags' :createable='true' label='請輸入授權的使用者標籤' />
                        <div class="text-subtitle-1 font-weight-bold">工時</div>
                        <VueCtkDateTimePicker label='設定時間日期' v-model="displayCreate"></VueCtkDateTimePicker>
                    </v-card-text>
                    </v-card>
                </v-timeline-item>
                <v-timeline-item small fill-dot color="#1A237E">
                    <v-card class="elevation-2">
                    <v-card-title class="text-h6 font-weight-black">啟動時間設定</v-card-title>
                    <v-card-text class='text-body-1'>
                        <div class="text-subtitle-1 font-weight-bold">權限</div>
                        <tag-filter :selectedItem='selectedStartTimeTags' @valueUpdated='updateStartTimeTag' :candidatedItem='savedUserTags' :createable='true' label='請輸入授權的使用者標籤' />
                        <div class="text-subtitle-1 font-weight-bold">工時</div>
                        <VueCtkDateTimePicker label='設定時間日期' v-model="displayStartTime"></VueCtkDateTimePicker>
                    </v-card-text>
                    </v-card>
                </v-timeline-item>
                <v-timeline-item small fill-dot color="#1A237E">
                    <v-card class="elevation-2">
                    <v-card-title class="text-h6 font-weight-black">知識點寫作指引</v-card-title>
                    <v-card-text class='text-body-1'>
                        <div class="text-subtitle-1 font-weight-bold">工時</div>
                        <v-slider
                            label='死線設定（小時）'
                            min='24'
                            max='168'
                            v-model="deadlineInstruction"
                            thumb-label
                        ></v-slider>
                    </v-card-text>
                    </v-card>
                </v-timeline-item>
                <v-timeline-item icon="fa-clipboard" fill-dot color="#00838F">
                    <v-card class="elevation-2">
                    <v-card-title class="cyan darken-3 white--text text-h6 font-weight-black">文件審查作業</v-card-title>
                    </v-card>
                </v-timeline-item>
                <v-timeline-item small fill-dot color="#00838F">
                    <v-card class="elevation-2">
                    <v-card-title class="text-h6 font-weight-black">寫手／廠商端</v-card-title>
                    <v-card-text class='text-body-1'>
                        <div class="text-subtitle-1 font-weight-bold">權限</div>
                        <tag-filter :selectedItem='selectedDocEditTags' @valueUpdated='updateDocEditTag' :candidatedItem='savedUserTags' :createable='true' label='請輸入授權的使用者標籤' />
                        <div class="text-subtitle-1 font-weight-bold">工時</div>
                        <v-slider
                            label='死線設定（小時）'
                            min='24'
                            max='168'
                            v-model="deadlineDocEdit"
                            thumb-label
                        ></v-slider>
                    </v-card-text>
                    </v-card>
                </v-timeline-item>
                <v-timeline-item small fill-dot color="#00838F">
                    <v-card class="elevation-2">
                    <v-card-title class="text-h6 font-weight-black">審查者權限</v-card-title>
                    <v-card-text class='text-body-1'>
                        <div class="text-subtitle-1 font-weight-bold">權限</div>
                        <tag-filter :selectedItem='selectedDocReviewTags' @valueUpdated='updateDocReviewTag' :candidatedItem='savedUserTags' :createable='true' label='請輸入授權的使用者標籤' />
                        <div class="text-subtitle-1 font-weight-bold">工時</div>
                        <v-slider
                            label='死線設定（小時）'
                            min='24'
                            max='168'
                            v-model="deadlineDocReview"
                            thumb-label
                        ></v-slider>
                    </v-card-text>
                    </v-card>
                </v-timeline-item>
                <v-timeline-item small fill-dot color="#00838F">
                    <v-card class="elevation-2">
                    <v-card-title class="text-h6 font-weight-black">文稿被退回後的修改時間</v-card-title>
                    <v-card-text class='text-body-1'>
                        <div class="text-subtitle-1 font-weight-bold">工時</div>
                        <v-slider
                            label='死線設定（小時）'
                            min='24'
                            max='168'
                            v-model="deadlineDocReedit"
                            thumb-label
                        ></v-slider>
                    </v-card-text>
                    </v-card>
                </v-timeline-item>
                <v-timeline-item icon="fa-video" fill-dot color="#004D40">
                    <v-card class="elevation-2">
                    <v-card-title class="teal darken-4 white--text text-h6 font-weight-black">影片作業</v-card-title>
                    </v-card>
                </v-timeline-item>
                <v-timeline-item small fill-dot color="#004D40">
                    <v-card class="elevation-2">
                    <v-card-title class="text-h6 font-weight-black">廠商／寫手權限</v-card-title>
                    <v-card-text class='text-body-1'>
                        <div class="text-subtitle-1 font-weight-bold">權限</div>
                        <tag-filter :selectedItem='selectedVideoUploadTags' @valueUpdated='updateVideoUploadTag' :candidatedItem='savedUserTags' :createable='true' label='請輸入授權的使用者標籤' />
                        <div class="text-subtitle-1 font-weight-bold">工時</div>
                        <v-slider
                            label='死線設定（小時）'
                            min='24'
                            max='168'
                            v-model="deadlineVideoUpload"
                            thumb-label
                        ></v-slider>
                    </v-card-text>
                    </v-card>
                </v-timeline-item>
                <v-timeline-item small fill-dot color="#004D40">
                    <v-card class="elevation-2">
                    <v-card-title class="text-h6 font-weight-black">審查者權限</v-card-title>
                    <v-card-text class='text-body-1'>
                        <div class="text-subtitle-1 font-weight-bold">權限</div>
                        <tag-filter :selectedItem='selectedVideoReviewTags' @valueUpdated='updateVideoReviewTag' :candidatedItem='savedUserTags' :createable='true' label='請輸入授權的使用者標籤' />
                        <div class="text-subtitle-1 font-weight-bold">工時</div>
                        <v-slider
                            label='死線設定（小時）'
                            min='24'
                            max='168'
                            v-model="deadlineVideoReview"
                            thumb-label
                        ></v-slider>
                    </v-card-text>
                    </v-card>
                </v-timeline-item>
                <v-timeline-item small fill-dot color="#00838F">
                    <v-card class="elevation-2">
                    <v-card-title class="text-h6 font-weight-black">影片被退回後的修改時間</v-card-title>
                    <v-card-text class='text-body-1'>
                        <div class="text-subtitle-1 font-weight-bold">工時</div>
                        <v-slider
                            label='死線設定（小時）'
                            min='24'
                            max='168'
                            v-model="deadlineVideoReauthor"
                            thumb-label
                        ></v-slider>
                    </v-card-text>
                    </v-card>
                </v-timeline-item>
                <v-timeline-item icon="fa-stamp" fill-dot color="#263238">
                    <v-card class="elevation-2">
                    <v-card-title class="blue-grey darken-4 white--text text-h6 font-weight-black">驗收作業</v-card-title>
                    </v-card>
                </v-timeline-item>
                <v-timeline-item small fill-dot color="#263238">
                    <v-card class="elevation-2">
                    <v-card-title class="text-h6 font-weight-black">上傳Youtube</v-card-title>
                    <v-card-text class='text-body-1'>
                        <div class="text-subtitle-1 font-weight-bold">權限</div>
                        <tag-filter :selectedItem='selectedFinalizeTags' @valueUpdated='updateFinalizeTag' :candidatedItem='savedUserTags' :createable='true' label='請輸入授權的使用者標籤' />
                        <div class="text-subtitle-1 font-weight-bold">工時</div>
                        <v-slider
                            label='死線設定（小時）'
                            min='24'
                            max='168'
                            v-model="deadlineFinalize"
                            thumb-label
                        ></v-slider>
                    </v-card-text>
                    </v-card>
                </v-timeline-item>
            </v-timeline>
          </v-col>
      </v-row>
    </v-main>
</template>

<style scoped>

</style>

<script>
// @ is an alias to /src
import Vue from 'vue';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faSlidersH } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import VueCtkDateTimePicker from 'vue-ctk-date-time-picker';
import TagFilter from './modules/TagFilter';
import moment from 'moment';

import '@fortawesome/fontawesome-free/css/all.css';
import 'vue-ctk-date-time-picker/dist/vue-ctk-date-time-picker.css';

library.add(faSlidersH);
Vue.component('font-awesome-icon', FontAwesomeIcon);
Vue.component('VueCtkDateTimePicker', VueCtkDateTimePicker);

export default {
    name: 'flowSetting',
    components: {
        TagFilter
    },
    created () {
        this.$emit('viewIn', {
            text: '初始值設定',
            icon: faSlidersH
        });
    },
    computed: {
    },
    methods: {
        updateFinalizeTag: function (value) {
            this.selectedFinalizeTags = value;
        },
        updateDocReviewTag: function (value) {
            this.selectedDocReviewTags = value;
        },
        updateDocEditTag: function (value) {
            this.selectedDocEditTags = value;
        },
        updateVideoUploadTag: function (value) {
            this.selectedVideoUploadTags = value;
        },
        updateVideoReviewTag: function (value) {
            this.selectedVideoReviewTags = value;
        },
        updateStartTimeTag: function (value) {
            this.selectedStartTimeTags = value;
        },
        updateCreateTag: function (value) {
            this.selectedCreateTags = value;
        },
        updateAuthUserTag: function (value) {
            this.selectedCreateTags = value;
        }
    },
    watch: {
        deadlineCreate: function () {
            this.displayCreate = moment.unix(this.deadlineCreate).format('YYYY-MM-DD hh:mm a');
        },
        displayCreate: function () {
            this.deadlineCreate = moment(this.displayCreate).unix();
        },
        deadlineStartTime: function () {
            this.displayStartTime = moment.unix(this.deadlineStartTime).format('YYYY-MM-DD hh:mm a');
        },
        displayStartTime: function () {
            this.deadlineStartTime = moment(this.displayStartTime).unix();
        }
    },
    data () {
        return {
            deadlineCreate: 1605076442,
            deadlineStartTime: 1605076442,
            displayCreate: '2020/10/10 10:10 am',
            displayStartTime: '2020/10/10 10:10 am',
            deadlineDocEdit: 48,
            deadlineDocReview: 48,
            deadlineVideoUpload: 48,
            deadlineVideoReview: 48,
            deadlineFinalize: 48,
            deadlineDocReedit: 48,
            deadlineVideoReauthor: 48,
            deadlineInstruction: 48,
            savedUserTags: [
                '數學科輔導團',
                '中心PM',
                '系統管理員'
            ],
            selectedStartTimeTags: [
                '數學科輔導團'
            ],
            selectedCreateTags: [
                '數學科輔導團'
            ],
            selectedAuthUserTags: [
                '數學科輔導團'
            ],
            selectedDocEditTags: [
                '數學科輔導團'
            ],
            selectedDocReviewTags: [
                '數學科輔導團'
            ],
            selectedVideoUploadTags: [
                '數學科輔導團'
            ],
            selectedVideoReviewTags: [
                '數學科輔導團'
            ],
            selectedFinalizeTags: [
                '數學科輔導團'
            ]
        };
    }
};
</script>
