<template>
    <v-main class='pa-0'>
        <v-dialog v-model='uploadW' persistent width='60vw'>
            <v-card>
                <v-toolbar dark color='primary'>
                    <v-toolbar-title>上傳影片</v-toolbar-title>
                </v-toolbar>
                <v-card-text class='pa-5'>
                    <div class='red--text text-body-1'>上傳影片功能是廠商帳號專屬功能，審查平台會將投影片、影片都當作影片處理，因此請務必注意製作腳本時，以PowerPoint製作，並且將投影片另存為mp4檔案</div>
                    <v-file-input prepend-icon='fa-video' label='選擇影片檔' accept='video/mp4'></v-file-input>
                </v-card-text>
                <v-card-actions>
                    <v-btn>下載腳本範本投影片</v-btn>
                    <v-btn>上傳影片</v-btn>
                    <v-btn @click='uploadW = false'>關閉對話框</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-alert type='error' icon="fa-exclamation-triangle">
            [2020/10/15 15:20] 機器人巡邏提醒：機器人提醒功能屬於第二期功能
        </v-alert>
        <v-row>
            <v-col class='pa-0'>
                <h1>{{ title }}</h1>
            </v-col>
        </v-row>
        <v-row>
            <v-col class='pa-5'>
                <v-stepper v-model='currentStep' vertical>
                    <v-stepper-step :complete='currentStep > 1' step='1' complete-icon='fa-check-circle' error-icon='fa-bomb'>
                        腳本／分鏡圖階段
                        <small>{{ historyConvert(mixedSteps[0]) }}</small>
                    </v-stepper-step>
                    <v-stepper-content step='2'>
                        <v-card>
                            <v-card-title class='d-flex flex-column'>
                                <span class='text-h6'>目前的未關閉的Issue數量: {{ currentSteps[1].issues }}</span>
                                <span class='text-caption red--text'>請注意，只有Issue全部關閉，才能結束這個步驟（若Issue全部關閉，時間到了系統也會自動結束這個程序）</span>
                            </v-card-title>
                            <v-card-text class='d-flex flex-row'>
                                <count-down-panel :editable='true' label='寫手／廠商第一次上傳截止時間' :deadline='currentSteps[1].deadlineDocEdit' @valueUpdated='editTimeUpdate' />
                                <count-down-panel :editable='true' label='審查截止時間' :deadline='currentSteps[1].deadlineDocReview' @valueUpdated='reviewTimeUpdate' />
                            </v-card-text>
                            <v-card-actions class='d-flex flex-wrap'>
                                <v-btn color="blue-grey" class="ma-2 white--text" @click="uploadW = true">上傳影片</v-btn>
                                <v-btn color="blue-grey" class="ma-2 white--text" link href="#/videoReview">進入審查頁面</v-btn>
                                <v-btn color='primary'>通知已發出Issue／已回復Issue</v-btn>
                                <v-btn>結束這個階段</v-btn>
                                <v-btn @click = 'currentStep--'>測試功能：回上一步</v-btn>
                                <v-btn @click = 'currentStep++'>測試功能：看下一步</v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-stepper-content>
                    <v-stepper-step :complete='currentStep > 2' step='2' complete-icon='fa-check-circle' error-icon='fa-bomb'>
                        影片階段
                        <small>{{ historyConvert(mixedSteps[1]) }}</small>
                    </v-stepper-step>
                    <v-stepper-content step='3'>
                        <v-card>
                            <v-card-title class='d-flex flex-column'>
                                <span class='text-h6'>目前的未關閉的Issue數量: {{ currentSteps[2].issues }}</span>
                                <span class='text-caption red--text'>請注意，只有Issue全部關閉，才能結束這個程序（若Issue全部關閉，時間到了系統也會自動結束這個程序）</span>
                            </v-card-title>
                            <v-card-text class='d-flex flex-row'>
                                <count-down-panel :editable='true' label='廠商第一次上傳影片截止時間' :deadline='currentSteps[2].deadlineVideoUpload' @valueUpdated='videouploadTimeUpdate' />
                                <count-down-panel :editable='true' label='審查截止時間' :deadline='currentSteps[2].deadlineVideoReview' @valueUpdated='videoreviewTimeUpdate' />
                            </v-card-text>
                            <v-card-actions class='d-flex flex-wrap'>
                                <v-btn color="blue-grey" class="ma-2 white--text" @click='uploadW = true'>上傳影片</v-btn>
                                <v-btn color="blue-grey" class="ma-2 white--text" link href="#/videoReview">進入影片審查頁面</v-btn>
                                <v-btn color='primary'>通知已發出Issue／已回復Issue</v-btn>
                                <v-btn>結束這個階段</v-btn>
                                <v-btn @click = 'currentStep--'>測試功能：回上一步</v-btn>
                                <v-btn @click = 'currentStep++'>測試功能：看下一步</v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-stepper-content>
                    <v-stepper-step :complete='currentStep > 3' step='3' complete-icon='fa-check-circle' error-icon='fa-bomb'>
                        驗收階段
                        <small>{{ historyConvert(mixedSteps[2]) }}</small>
                    </v-stepper-step>
                    <v-stepper-content step='4'>
                        <v-card>
                            <v-card-text class='d-flex flex-row'>
                                <count-down-panel icon='stopwatch' :editable='true' label='驗收作業截止時間' :deadline='currentSteps[3].deadlineFinalize' @valueUpdated='finalizeTimeUpdate' />
                            </v-card-text>
                            <v-card-actions class='d-flex flex-wrap'>
                                <v-btn color="blue-grey" class="ma-2 white--text" link href="#/Finalization">進入驗收作業</v-btn>
                                <v-btn>結束這個階段</v-btn>
                                <v-btn @click = 'currentStep--'>測試功能：回上一步</v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-stepper-content>
                </v-stepper>
            </v-col>
        </v-row>
    </v-main>
</template>

<script>
// @ is an alias to /src
import Vue from 'vue';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faTasks } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import moment from 'moment';
import CountDownPanel from './modules/CountDownPanel';

import '@fortawesome/fontawesome-free/css/all.css';

library.add(faTasks);
Vue.component('font-awesome-icon', FontAwesomeIcon);
Vue.config.productionTip = false;

export default {
    name: 'videoProp',
    components: {
        CountDownPanel
    },
    methods: {
        historyConvert: function (item) {
            let status = item.date === 0 ? '[未發生]' : item.date === 1 ? '[當前步驟]' : '[已完成]' + moment.unix(item.date).format('YYYY/MM/DD HH:mm:ss');
            if (item.historyStep.length > 0) {
                status += '🔊' + item.historyStep[0].message + '[' + item.historyStep[0].user.name + '@' + moment.unix(item.historyStep[0].date).format('YYYY/MM/DD HH:mm:ss') + ']';
            }
            return status;
        },
        instructionTimeUpdate: function (value) {
            this.currentSteps[0].deadlineInstruction = value;
        },
        editTimeUpdate: function (value) {
            this.currentSteps[1].deadlineDocEdit = value;
        },
        reviewTimeUpdate: function (value) {
            this.currentSteps[1].deadlineDocReview = value;
        },
        videouploadTimeUpdate: function (value) {
            this.currentSteps[2].deadlineVideoUpload = value;
        },
        videoreviewTimeUpdate: function (value) {
            this.currentSteps[2].deadlineVideoReview = value;
        },
        finalizeTimeUpdate: function (value) {
            this.currentSteps[3].deadlineFinalize = value;
        }
    },
    computed: {
        mixedSteps: function () {
            let oriobj = this;
            let newArr = [...this.progressSteps];
            newArr.forEach((item) => {
                let foundItem = oriobj.currentSteps.filter((cstep) => {
                    return item.step === cstep.step;
                });
                let currentItem = foundItem.length > 0 ? foundItem[0] : {
                    date: 0,
                    special: false
                };
                item.date = currentItem.date;
                item.special = currentItem.special;
                item.historyStep = this.historyList.filter((historyItem) => {
                    return historyItem.step === item.step;
                });
                item.historyStep = item.historyStep.sort((a, b) => {
                    return b.date - a.date;
                });
            });
            return newArr;
        }
    },
    data () {
        return {
            uploadW: false,
            step: 4,
            id: 1,
            title: '測試標題1',
            currentStep: 3,
            progressSteps: [
                {
                    name: '前置階段',
                    step: 1
                },
                {
                    name: '腳本／分鏡圖階段',
                    step: 2
                },
                {
                    name: '影片階段',
                    step: 3
                },
                {
                    name: '驗收階段',
                    step: 4
                }
            ],
            historyList: [
                {
                    date: 1602288000,
                    step: 3,
                    user: {
                        name: 'A廠商',
                        type: 'male'
                    },
                    message: '影片已上傳'
                },
                {
                    date: 1602255000,
                    step: 2,
                    user: {
                        name: 'X博士',
                        type: 'female'
                    },
                    message: '腳本已同意'
                },
                {
                    date: 1606688000,
                    step: 2,
                    user: {
                        name: 'A廠商',
                        type: 'male'
                    },
                    message: '腳本已上傳（第2次）'
                },
                {
                    date: 1602200000,
                    step: 2,
                    user: {
                        name: 'X博士',
                        type: 'female'
                    },
                    message: '要求修改後重新上傳腳本'
                },
                {
                    date: 1601188000,
                    step: 2,
                    user: {
                        name: 'A廠商',
                        type: 'male'
                    },
                    message: '腳本已上傳（第1次）'
                },
                {
                    date: 1501188000,
                    step: 1,
                    user: {
                        name: 'X博士',
                        type: 'male'
                    },
                    message: '知識點編輯完成'
                }
            ],
            currentSteps: [
                {
                    step: 1,
                    date: 1602288000,
                    special: false,
                    deadlineInstruction: 1604916766
                },
                {
                    step: 2,
                    date: 1604966400,
                    special: false,
                    deadlineDocEdit: 1604916766,
                    deadlineDocReview: 1604916766,
                    issues: 10
                },
                {
                    step: 3,
                    date: 1,
                    special: true,
                    deadlineVideoUpload: 1604916766,
                    deadlineVideoReview: 1604916766,
                    issues: 10
                },
                {
                    step: 4,
                    date: 0,
                    special: false,
                    deadlineFinalize: 1604916766
                }
            ]
        };
    },
    created () {
        this.$emit('viewIn', {
            text: '檢視影片內容',
            icon: faTasks
        });
    }
};
</script>
