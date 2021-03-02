<template><!-- TODO: 1. 指派選單  -->
    <v-sheet class='pa-0'>
        <v-dialog v-model='KBeditorW' persistent width='60vw'>
            <v-card>
                <v-toolbar dark color='primary'>
                    <v-toolbar-title>編輯知識點</v-toolbar-title>
                </v-toolbar>
                <v-card-text>
                    <v-text-field
                        label="知識點標題"
                        v-model='KBtitle'
                    ></v-text-field>
                    <v-text-field
                        label="對應課綱學習表現或是課本內容"
                        v-model='KBtextbook'
                    ></v-text-field>
                    <v-textarea
                        label='寫作指引'
                        v-model='instrBody'
                    ></v-textarea>
                    <div class='red--text text-caption'>寫作指引是提供寫手和廠商創作的引導，您可以用簡單的幾句話回復，寫作指引會出現在所有影片起點位置（0秒）</div>
                    <v-file-input prepend-icon='fa-paperclip' multiple label='輔助說明文件／圖片上傳'></v-file-input>
                </v-card-text>
                <v-card-actions>
                    <v-btn :disabled='KBwatch' @click='editKB()'>送出寫作指引</v-btn>
                    <v-btn @click='KBeditorW = false'>關閉對話框</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-dialog v-model='assignW' persistent width='60vw'>
            <v-card>
                <v-toolbar dark color='primary'>
                    <v-toolbar-title>指派知識點審查者</v-toolbar-title>
                    <template v-slot:extension>
                        <v-tabs v-model="assignTab" background-color="primary" dark>
                            <v-tab>審查老師群</v-tab>
                            <v-tab>負責廠商群</v-tab>
                            <v-tab>負責寫手群</v-tab>
                            <v-tab>負責PM群</v-tab>
                        </v-tabs>
                    </template>
                </v-toolbar>
                <v-alert type="success" v-show='userTip'>
                    {{ currentEditUser.text }}寫入完成！
                </v-alert>
                <v-card-text class='pa-0'>
                    <v-tabs-items v-model="assignTab">
                        <v-tab-item>
                            <v-stepper v-model="reviewerStep" vertical>
                                <v-stepper-step :complete="reviewerStep > 1" step="1" complete-icon='fa-check-circle'>
                                選擇使用者標籤
                                <small>請選擇既有的或是新建一個使用者標籤</small>
                                </v-stepper-step>
                                <v-stepper-content step="1">
                                    <v-card class='pa-3'>
                                        <v-card-text>
                                            <tag-filter :single='true' :selectedItem='currentEditUser.reviewerTag' @valueUpdated='filterReviewerTagUpdated' :candidatedItem='savedUserTags' :createable='true' label='請輸入您想篩選的使用者標籤' />
                                        </v-card-text>
                                        <v-card-actions>
                                            <v-btn color="primary" @click='loadreviewerTag()'>載入使用者標籤</v-btn>
                                        </v-card-actions>
                                    </v-card>
                                </v-stepper-content>
                                    <v-stepper-step :complete="reviewerStep > 2" step="2" complete-icon='fa-check-circle'>
                                    設定 {{ currentEditUser.reviewerTag }} 使用者名單
                                    <small>請選擇該標籤下的使用者名單</small>
                                </v-stepper-step>
                                <v-stepper-content step="2">
                                    <v-card class='pa-3'>
                                        <v-card-text>
                                            <tag-filter :single='false' :selectedItem='currentEditUser.reviewers' @valueUpdated='filterReviewerUpdated' :candidatedItem='savedUsers' :createable='false' label='請輸入您想篩選的使用者' />
                                        </v-card-text>
                                        <v-card-actions>
                                            <v-btn @click='reviewerStep = 1'>回上一步</v-btn>
                                            <v-btn color="primary" @click='saveReviewer()'>確定指派</v-btn>
                                        </v-card-actions>
                                    </v-card>
                                </v-stepper-content>
                            </v-stepper>
                        </v-tab-item>
                        <v-tab-item>
                            <v-stepper v-model="vendorStep" vertical>
                                <v-stepper-step :complete="vendorStep > 1" step="1" complete-icon='fa-check-circle'>
                                選擇使用者標籤
                                <small>請選擇既有的或是新建一個使用者標籤</small>
                                </v-stepper-step>
                                <v-stepper-content step="1">
                                    <v-card class='pa-3'>
                                        <v-card-text>
                                            <tag-filter :single='true' :selectedItem='currentEditUser.vendorTag' @valueUpdated='filterVendorTagUpdated' :candidatedItem='savedUserTags' :createable='true' label='請輸入您想篩選的使用者標籤' />
                                        </v-card-text>
                                        <v-card-actions>
                                            <v-btn color="primary" @click='loadvendorTag()'>載入使用者標籤</v-btn>
                                        </v-card-actions>
                                    </v-card>
                                </v-stepper-content>
                                    <v-stepper-step :complete="vendorStep > 2" step="2" complete-icon='fa-check-circle'>
                                    設定 {{ currentEditUser.vendorTag }} 使用者名單
                                    <small>請選擇該標籤下的使用者名單</small>
                                </v-stepper-step>
                                <v-stepper-content step="2">
                                    <v-card class='pa-3'>
                                        <v-card-text>
                                            <tag-filter :single='false' :selectedItem='currentEditUser.vendors' @valueUpdated='filterVendorUpdated' :candidatedItem='savedUsers' :createable='false' label='請輸入您想篩選的使用者' />
                                        </v-card-text>
                                        <v-card-actions>
                                            <v-btn @click='vendorStep = 1'>回上一步</v-btn>
                                            <v-btn color="primary" @click='saveVendor()'>確定指派</v-btn>
                                        </v-card-actions>
                                    </v-card>
                                </v-stepper-content>
                            </v-stepper>
                        </v-tab-item>
                        <v-tab-item>
                            <v-stepper v-model="writerStep" vertical>
                                <v-stepper-step :complete="writerStep > 1" step="1" complete-icon='fa-check-circle'>
                                選擇使用者標籤
                                <small>請選擇既有的或是新建一個使用者標籤</small>
                                </v-stepper-step>
                                <v-stepper-content step="1">
                                    <v-card class='pa-3'>
                                        <v-card-text>
                                            <tag-filter :single='true' :selectedItem='currentEditUser.writerTag' @valueUpdated='filterWriterTagUpdated' :candidatedItem='savedUserTags' :createable='true' label='請輸入您想篩選的使用者標籤' />
                                        </v-card-text>
                                        <v-card-actions>
                                            <v-btn color="primary" @click='loadwriterTag()'>載入使用者標籤</v-btn>
                                        </v-card-actions>
                                    </v-card>
                                </v-stepper-content>
                                    <v-stepper-step :complete="writerStep > 2" step="2" complete-icon='fa-check-circle'>
                                    設定 {{ currentEditUser.writerTag }} 使用者名單
                                    <small>請選擇該標籤下的使用者名單</small>
                                </v-stepper-step>
                                <v-stepper-content step="2">
                                    <v-card class='pa-3'>
                                        <v-card-text>
                                            <tag-filter :single='false' :selectedItem='currentEditUser.writers' @valueUpdated='filterWriterUpdated' :candidatedItem='savedUsers' :createable='false' label='請輸入您想篩選的使用者' />
                                        </v-card-text>
                                        <v-card-actions>
                                            <v-btn @click='writerStep = 1'>回上一步</v-btn>
                                            <v-btn color="primary" @click='saveReviewer()'>確定指派</v-btn>
                                        </v-card-actions>
                                    </v-card>
                                </v-stepper-content>
                            </v-stepper>
                        </v-tab-item>
                        <v-tab-item>
                            <v-stepper v-model="pmStep" vertical>
                                <v-stepper-step :complete="pmStep > 1" step="1" complete-icon='fa-check-circle'>
                                選擇使用者標籤
                                <small>請選擇既有的或是新建一個使用者標籤</small>
                                </v-stepper-step>
                                <v-stepper-content step="1">
                                    <v-card class='pa-3'>
                                        <v-card-text>
                                            <tag-filter :single='true' :selectedItem='currentEditUser.pmTag' @valueUpdated='filterPMTagUpdated' :candidatedItem='savedUserTags' :createable='true' label='請輸入您想篩選的使用者標籤' />
                                        </v-card-text>
                                        <v-card-actions>
                                            <v-btn color="primary" @click='loadpmTag()'>載入使用者標籤</v-btn>
                                        </v-card-actions>
                                    </v-card>
                                </v-stepper-content>
                                    <v-stepper-step :complete="pmStep > 2" step="2" complete-icon='fa-check-circle'>
                                    設定 {{ currentEditUser.pmTag }} 使用者名單
                                    <small>請選擇該標籤下的使用者名單</small>
                                </v-stepper-step>
                                <v-stepper-content step="2">
                                    <v-card class='pa-3'>
                                        <v-card-text>
                                            <tag-filter :single='false' :selectedItem='currentEditUser.pms' @valueUpdated='filterPMUpdated' :candidatedItem='savedUsers' :createable='false' label='請輸入您想篩選的使用者' />
                                        </v-card-text>
                                        <v-card-actions>
                                            <v-btn @click='pmStep = 1'>回上一步</v-btn>
                                            <v-btn color="primary" @click='savePM()'>確定指派</v-btn>
                                        </v-card-actions>
                                    </v-card>
                                </v-stepper-content>
                            </v-stepper>
                        </v-tab-item>
                    </v-tabs-items>
                </v-card-text>
                <v-card-actions>
                    <v-btn @click='closeAssignW'>關閉對話框</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-dialog v-model='insertM' persistent width='60vw'>
            <v-card>
                <v-toolbar dark color='primary'>
                    <v-toolbar-title>新增知識點大分類</v-toolbar-title>
                </v-toolbar>
                <v-card-text>
                    <v-text-field
                        label="大分類標題"
                        v-model='mainCata'
                    ></v-text-field>
                </v-card-text>
                <v-card-actions>
                    <v-btn  :disabled='mainCata === ""' @click='insertMCata()'>新增知識點大分類</v-btn>
                    <v-btn @click='insertM = false'>關閉對話框</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-dialog v-model='tagW' persistent width='60vw'>
            <v-card>
                <v-toolbar dark color='primary'>
                    <v-toolbar-title>選擇科目標籤</v-toolbar-title>
                </v-toolbar>
                <v-card-subtitle>請選擇您要編輯的科目標籤（如：109年國中數學科），如果您需要新增，直接輸入即可</v-card-subtitle>
                <v-card-text>
                    <tag-filter :single='true' :selectedItem='selectedKBTag' @valueUpdated='updateKBTag' :candidatedItem='savedKBTags' :createable='true' label='請輸入知識點標籤' />
                </v-card-text>
                <v-card-actions>
                    <v-btn @click='tagW = false'>載入科目</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-dialog v-model='timeW' persistent width='60vw'>
            <v-card>
                <v-toolbar dark color='primary'>
                    <v-toolbar-title>設定科目標籤的時間參數</v-toolbar-title>
                </v-toolbar>
                <v-card-text class='d-flex flex-column'>
                    <span>雖然您已經在編輯本科目了，但請設定本科目標籤最後的編輯與分配截止日期</span>
                    <count-down-panel :editable='true' label='知識點編輯／分配' :deadline='deadlineCreate' @valueUpdated='createTimeUpdate' />
                    <span>請設定本科目影片開始拍攝的時間，請注意，這項設定非常重要，系統會用這個時間搭配系統中已設定的各影片工期參數配置影片的預設完成日期</span>
                    <count-down-panel :editable='true' label='設置計畫啟動時間' :deadline='deadlineStartTime' @valueUpdated='startTimeUpdate' />
                </v-card-text>
                <v-card-actions>
                    <v-btn @click='timeW = false'>設定完成</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-speed-dial v-model="configBtn" fixed bottom right direction="top" :open-on-hover="true" transition="slide-y-reverse-transition">
            <template v-slot:activator>
                <v-btn
                    v-model="configBtn"
                    color="deep-orange darken"
                    dark
                    fab
                >
                    <v-icon v-if="configBtn">fa-chevron-up</v-icon>
                    <v-icon v-else>fa-pencil-ruler</v-icon>
                </v-btn>
            </template>
            <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                    <v-btn
                        v-bind="attrs" v-on="on"
                        fab
                        dark
                        small
                        color="deep-purple darken-2"
                    >
                        <v-icon>fa-hashtag</v-icon>
                    </v-btn>
                </template>
                <span>切換科目標籤</span>
            </v-tooltip>
            <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                    <v-btn
                        v-bind="attrs" v-on="on"
                        fab
                        dark
                        small
                        color="green"
                        @click.stop='timeW = true'
                    >
                        <v-icon>fa-stopwatch</v-icon>
                    </v-btn>
                </template>
                <span>設定科目時間參數</span>
            </v-tooltip>
            <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                    <v-btn
                        v-bind="attrs" v-on="on"
                        fab
                        dark
                        small
                        color="indigo"
                        @click='insertM = true'
                    >
                        <v-icon>fa-folder-plus</v-icon>
                    </v-btn>
                </template>
                <span>新增知識點大分類</span>
            </v-tooltip>
            <v-badge
                color="red"
                :content="selectedDeleted.length"
            >
                <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                        <v-btn
                            v-bind="attrs" v-on="on"
                            fab
                            dark
                            small
                            color="cyan"
                            @click='removeKB()'
                        >
                            <v-icon>fa-folder-minus</v-icon>
                        </v-btn>
                    </template>
                    <span>刪除知識點大分類</span>
                </v-tooltip>
            </v-badge>
        </v-speed-dial>
        <draggable @change='scanItems' v-model="items" :group="'mainc'" style="min-height: 10px" handle='.handle'>
            <template v-for="mitem in items">
                <v-list class='KBcata pa-0 mt-6 d-flex flex-column justify-start' dense :key='mitem.key'>
                    <div class='d-flex flex-row justify-start'>
                        <v-checkbox v-model="selectedDeleted" :value='mitem.key' class='pa-1 ma-1' off-icon="far fa-square" on-icon="fa-check-square"></v-checkbox>
                        <v-tooltip bottom>
                            <template v-slot:activator="{ on, attrs }">
                                <v-btn v-bind="attrs" v-on="on" icon @click="openSubKBW( mitem.key )">
                                    <font-awesome-icon icon='plus' />
                                </v-btn>
                            </template>
                            <span>新增知識點</span>
                        </v-tooltip>
                        <v-tooltip bottom>
                            <template v-slot:activator="{ on, attrs }">
                                <v-btn v-bind="attrs" v-on="on" icon @click='removeKB(mitem.key)'>
                                    <font-awesome-icon icon='minus' />
                                </v-btn>
                            </template>
                            <span>刪除本分類</span>
                        </v-tooltip>
                        <v-tooltip bottom v-show='mitem.collapse === false'>
                            <template v-slot:activator="{ on, attrs }">
                                <v-btn v-bind="attrs" v-on="on" icon @click='mitem.collapse = true' v-show='mitem.collapse === false'>
                                    <font-awesome-icon icon='angle-up' />
                                </v-btn>
                            </template>
                            <span>折起本分類</span>
                        </v-tooltip>
                        <v-tooltip bottom v-show='mitem.collapse === true'>
                            <template v-slot:activator="{ on, attrs }">
                                <v-btn v-bind="attrs" v-on="on" icon @click='mitem.collapse = false' v-show='mitem.collapse === true'>
                                    <font-awesome-icon icon='angle-down' />
                                </v-btn>
                            </template>
                            <span>打開本分類</span>
                        </v-tooltip>
                        <v-tooltip bottom>
                            <template v-slot:activator="{ on, attrs }">
                                <v-btn v-bind="attrs" v-on="on" icon class='handle'>
                                    <font-awesome-icon icon='arrows-alt' />
                                </v-btn>
                            </template>
                            <span>上下移動本分類</span>
                        </v-tooltip>
                        <div v-show='mitem.collapse === true'>
                            {{ mitem.title }}（共 {{ mitem.KBs.length }} 項）
                        </div>
                    </div>
                    <v-subheader class='black--text text-h6' v-show='mitem.collapse === false'>
                        <font-awesome-icon icon='folder-open' />
                        <v-text-field
                            v-model="mitem.title"
                            append-icon= 'fa-cloud-upload-alt'
                            solo
                            clear-icon="fa-eraser"
                            clearable
                            label="知識點大分類標題"
                            type="text"
                            @click:append="uploadTitle( mitem.title, mitem.key )"
                        ></v-text-field>
                    </v-subheader>
                    <draggable @change='scanItems' v-model="mitem.KBs" handle=".subhandle" :group="'subc'" style="min-height: 10px" v-show='mitem.collapse === false'>
                        <template v-for="KBitem in mitem.KBs">
                            <v-row :key="KBitem.key" class='KBsub d-flex'>
                                <v-col col='1' class='flex-grow-0 flex-shrink-1 align-center'>
                                    <font-awesome-icon icon='angle-double-right' />
                                </v-col>
                                <v-col col='8' class='flex-grow-1 text-left'>
                                    [{{ KBitem.textbook }}] {{ KBitem.text }}
                                </v-col>
                                <v-col col='3' class='align-center flex-grow-0 flex-shrink-0 ma-0 pa-0 d-flex flex-row'>
                                    <v-checkbox v-model="selectedDeleted" :value='KBitem.key' off-icon="far fa-square" on-icon="fa-check-square"></v-checkbox>
                                    <v-tooltip bottom>
                                        <template v-slot:activator="{ on, attrs }">
                                            <v-btn @click="loadKBEditor( KBitem )" v-bind="attrs" v-on="on" icon>
                                                <font-awesome-icon icon='pencil-alt' />
                                            </v-btn>
                                        </template>
                                        <span>編輯知識點</span>
                                    </v-tooltip>
                                    <v-tooltip bottom>
                                        <template v-slot:activator="{ on, attrs }">
                                            <v-btn v-bind="attrs" v-on="on" icon @click="loadReviewer( KBitem )">
                                                <font-awesome-icon icon='users-cog' />
                                            </v-btn>
                                        </template>
                                        <span>指派知識點</span>
                                    </v-tooltip>
                                    <v-tooltip bottom>
                                        <template v-slot:activator="{ on, attrs }">
                                            <v-btn v-bind="attrs" v-on="on" icon @click='removeKB(KBitem.key)'>
                                                <font-awesome-icon icon='minus'/>
                                            </v-btn>
                                        </template>
                                        <span>刪除知識點</span>
                                    </v-tooltip>
                                    <v-tooltip bottom>
                                        <template v-slot:activator="{ on, attrs }">
                                            <v-btn v-bind="attrs" v-on="on" icon class='subhandle'>
                                                <font-awesome-icon icon='arrows-alt' />
                                            </v-btn>
                                        </template>
                                        <span>上下移動知識點</span>
                                    </v-tooltip>
                                </v-col>
                            </v-row>
                        </template>
                    </draggable>
                </v-list>
            </template>
        </draggable>
    </v-sheet>
</template>

<style scoped>
.KBcata {
    border-left: none;
}

.KBcata:hover {
    border-left: 10px solid #333;
}

.KBsub {
    border-left: none;
}

.KBsub:hover {
    border-left: 5px solid #AAA;
}

.handle, .subhandle {
    cursor: grab;
}

</style>

<script>
// @ is an alias to /src
import Vue from 'vue';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faNetworkWired } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import draggable from 'vuedraggable';
// import moment from 'moment';
import TagFilter from './modules/TagFilter';
import CountDownPanel from './modules/CountDownPanel';

import '@fortawesome/fontawesome-free/css/all.css';

library.add(faNetworkWired);
Vue.component('font-awesome-icon', FontAwesomeIcon);
Vue.config.productionTip = false;

export default {
    name: 'createKB',
    components: {
        TagFilter,
        CountDownPanel,
        draggable
    },
    methods: {
        loadKBEditor: function (KB) {
            this.KBtitle = KB.text;
            this.KBtextbook = KB.textbook;
            this.instrBody = KB.comment;
            this.insertKBM = KB.parent;
            this.KBeditorW = true;
            this.KBkey = KB.key;
        },
        loadreviewerTag: function () {
            this.reviewerStep = 2;
        },
        closeAssignW: function () {
            this.assignW = false;
            this.pmStep = 1;
            this.vendorStep = 1;
            this.writerStep = 1;
            this.reviewerStep = 1;
            this.currentEditUser = {
                reviewers: [],
                vendors: [],
                pms: [],
                writers: []
            };
        },
        saveReviewer: function () {
            let oriobj = this;
            this.userTip = true;
            setTimeout(() => {
                oriobj.userTip = false;
            }, 500);
        },
        loadwriterTag: function () {
            this.writerStep = 2;
        },
        saveWriter: function () {
            let oriobj = this;
            this.userTip = true;
            setTimeout(() => {
                oriobj.userTip = false;
            }, 500);
        },
        loadvendorTag: function () {
            this.vendorStep = 2;
        },
        saveVendor: function () {
            let oriobj = this;
            this.userTip = true;
            setTimeout(() => {
                oriobj.userTip = false;
            }, 500);
        },
        loadpmTag: function () {
            this.pmStep = 2;
        },
        savePM: function () {
            let oriobj = this;
            this.userTip = true;
            setTimeout(() => {
                oriobj.userTip = false;
            }, 500);
        },
        loadReviewer: function (item) {
            this.currentEditUser = item;
            this.assignW = true;
        },
        filterReviewerUpdated: function (val) {
            this.currentEditUser.reviewers = val;
        },
        filterReviewerTagUpdated: function (val) {
            this.currentEditUser.reviewerTag = val;
        },
        filterPMUpdated: function (val) {
            this.currentEditUser.pms = val;
        },
        filterPMTagUpdated: function (val) {
            this.currentEditUser.pmTag = val;
        },
        filterWriterUpdated: function (val) {
            this.currentEditUser.writers = val;
        },
        filterWriterTagUpdated: function (val) {
            this.currentEditUser.writerTag = val;
        },
        filterVendorUpdated: function (val) {
            this.currentEditUser.vendors = val;
        },
        filterVendorTagUpdated: function (val) {
            this.currentEditUser.vendorTag = val;
        },
        scanItems: function () {
            let count = 0;
            this.items.forEach((item) => {
                item.KBs.forEach((KB) => {
                    KB.order = count++;
                });
            });
        },
        uploadTitle: function (value, key) {
            alert(value);
        },
        insertMCata: function () {
            if (this.mainCata !== '') {
                this.items.push({
                    title: this.mainCata,
                    key: 'm' + Math.floor(Math.random() * 100),
                    collapse: false,
                    KBs: []
                });
                this.mainCata = '';
                this.insertM = false;
            }
        },
        updateKBTag: function (value) {
            this.selectedKBTag = value;
        },
        startTimeUpdate: function (value) {
            this.deadlineStartTime = value;
        },
        createTimeUpdate: function (value) {
            this.deadlineCreate = value;
        },
        removeKB: function (value) {
            if (value === undefined) {
                this.selectedDeleted.forEach((sval) => {
                    this.items = this.items.filter((item) => {
                        item.KBs = item.KBs.filter((subitem) => {
                            return subitem.key !== sval;
                        });
                        return item.key !== sval;
                    });
                });
                this.selectedDeleted = [];
            } else {
                this.items = this.items.filter((item) => {
                    item.KBs = item.KBs.filter((subitem) => {
                        return subitem.key !== value;
                    });
                    return item.key !== value;
                });
            }
        },
        editKB: function () {
            if (this.KBtitle !== '') {
                let filteredM = this.items.filter(item => item.key === this.insertKBM);
                if (filteredM.length > 0) {
                    let Mitem = filteredM[0];
                    let filteredKB = Mitem.KBs.filter(item => item.key === this.KBkey);
                    if (filteredKB.length > 0) {
                        let KBitem = filteredKB[0];
                        KBitem.text = this.KBtitle;
                        KBitem.textbook = this.KBtextbook;
                        KBitem.comment = this.instrBody;
                        // 這裡是修改區
                    } else {
                        Mitem.KBs.push({
                            text: this.KBtitle,
                            textbook: this.KBtextbook,
                            comment: this.instrBody,
                            key: 's' + Math.floor(Math.random() * 100),
                            parent: this.insertKBM,
                            reviewerTag: '數學輔導團',
                            vendorTag: '',
                            pmTag: '',
                            writerTag: '',
                            reviewers: [],
                            vendors: [],
                            pms: [],
                            writers: []
                        });
                    }
                }
            }
            this.KBtitle = '';
            this.KBtextbook = '';
            this.insertKBM = '';
            this.instrBody = '';
            this.KBeditorW = false;
        },
        openSubKBW: function (value) {
            this.KBeditorW = true;
            this.insertKBM = value;
        }
    },
    computed: {
        KBwatch: function () {
            if (this.KBtitle !== '') {
                if (this.KBtextbook !== '') {
                    if (this.instrBody !== '') {
                        return false;
                    }
                }
            }
            return true;
        }
    },
    data () {
        return {
            KBtextbook: '',
            userTip: false,
            pmStep: 1,
            usertagLoaded: false,
            currentEditUser: {
                reviewerTag: '數學輔導團',
                vendorTag: '',
                pmTag: '',
                writerTag: '',
                reviewers: [],
                vendors: [],
                pms: [],
                writers: []
            },
            assignTab: 0,
            reviewerStep: 1,
            vendorStep: 1,
            writerStep: 1,
            assignW: false,
            insertKBM: undefined,
            insertM: false,
            KBtitle: '',
            KBkey: undefined,
            KBeditorW: false,
            mainCata: '',
            instrBody: '',
            timeW: false,
            tagW: true,
            configBtn: true,
            reviewerCount: 1,
            KBeditorMessage: '',
            deadlineCreate: 1605076442,
            deadlineStartTime: 1605076442,
            selectedDeleted: [],
            savedUserTags: [
                '數學輔導團',
                '理化輔導團',
                '中心PM'
            ],
            savedUsers: [
                '萬磁王',
                '測試帳號',
                'X博士'
            ],
            savedKBTags: [
                '109 年國中數學科',
                '109 年國中理化科',
                '109 年國中生物科'
            ],
            selectedKBTag: '109 年國中理化科',
            previewW: false,
            items: [
                {
                    title: '測試用大項目1',
                    key: 'm1',
                    collapse: false,
                    KBs: [
                        {
                            text: '111a',
                            key: 's1',
                            order: 0,
                            reviewerTag: '數學輔導團',
                            vendorTag: '',
                            pmTag: '',
                            writerTag: '',
                            reviewers: [],
                            vendors: [],
                            pms: [],
                            writers: [],
                            comment: '',
                            parent: 'm1',
                            textbook: ''
                        },
                        {
                            text: '222a',
                            key: 's2',
                            order: 0,
                            reviewerTag: '數學輔導團',
                            vendorTag: '',
                            pmTag: '',
                            writerTag: '',
                            reviewers: [],
                            vendors: [],
                            pms: [],
                            writers: [],
                            comment: '',
                            parent: 'm1',
                            textbook: ''
                        },
                        {
                            text: '333a333a333a333a333a333a333a333a',
                            key: 's3',
                            order: 0,
                            reviewerTag: '數學輔導團',
                            vendorTag: '',
                            pmTag: '',
                            writerTag: '',
                            reviewers: [],
                            vendors: [],
                            pms: [],
                            writers: [],
                            comment: '',
                            parent: 'm1',
                            textbook: ''
                        }
                    ]
                },
                {
                    title: '測試用大項目2測試用大項目2測試用大項目2',
                    key: 'm2',
                    collapse: false,
                    KBs: [
                        {
                            text: '111b',
                            key: 's5',
                            order: 0,
                            reviewerTag: '數學輔導團',
                            vendorTag: '',
                            pmTag: '',
                            writerTag: '',
                            reviewers: [],
                            vendors: [],
                            pms: [],
                            writers: [],
                            comment: '',
                            parent: 'm2',
                            textbook: ''
                        },
                        {
                            text: '222b222b222b222b',
                            key: 's6',
                            order: 0,
                            reviewerTag: '數學輔導團',
                            vendorTag: '',
                            pmTag: '',
                            writerTag: '',
                            reviewers: [],
                            vendors: [],
                            pms: [],
                            writers: [],
                            comment: '',
                            parent: 'm2',
                            textbook: ''
                        },
                        {
                            text: '333b',
                            key: 's7',
                            order: 0,
                            reviewerTag: '數學輔導團',
                            vendorTag: '',
                            pmTag: '',
                            writerTag: '',
                            reviewers: [],
                            vendors: [],
                            pms: [],
                            writers: [],
                            comment: '',
                            parent: 'm2',
                            textbook: ''
                        }
                    ]
                }
            ]
        };
    },
    created () {
        this.$emit('viewIn', {
            text: '編輯知識點',
            icon: faNetworkWired
        });
    }
};
</script>
