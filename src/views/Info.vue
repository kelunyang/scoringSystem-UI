<template>
    <v-main class='pa-0'>
      <v-dialog
        v-model="doneW"
        persistent
        max-width="50vw"
      >
        <v-card>
          <v-card-title class="headline">
            <font-awesome-icon icon='satellite-dish' />
            {{ doneType }}
          </v-card-title>
          <v-card-text>
            {{ doneMsg }}！
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="primary"
              @click="doneW = false"
            >
              關閉通知
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog
        v-model="lineW"
        persistent
        max-width="50vw"
      >
        <v-card>
          <v-card-title class="headline">
            <v-icon>fab fa-line</v-icon>
            發送LINE訊息給管理群
          </v-card-title>
          <v-card-text>
            <tiptap-vuetify
              v-model="LINEbody"
              :extensions="extensions"
            />
            <v-textarea
              solo
              label="輸入你想發送的LINE通知"
              rows="4"
              row-height="40"
              v-model="LINEbody"
            ></v-textarea>
            <v-btn @click='sendLINEnotify' class='ma-3'>
              發出LINE通知
            </v-btn>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="primary"
              @click="doneW = false"
            >
              關閉通知
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-row ref='aboutArea'>
        <v-col class='pa-2'>
          <div class='text-h5 font-weight-bold'>關於本系統</div>
          <div class='text-body-2'>臺北市影片審查平台 {{ version }}</div>
        </v-col>
      </v-row>
      <v-row ref='teamArea'>
        <v-col class='pa-2'>
          <div class='text-h5 font-weight-bold'>管理團隊</div>
          <v-sheet class='d-flex flex-column'>
            <v-btn @click='lineW = true'>
              <v-icon>fab fa-line</v-icon>
              給管理群發LINE訊息
            </v-btn>
            <v-list-item v-for='item in userList' :key='item._id'>
              <v-list-item-avatar>
                <v-avatar size='48'>
                  <img :src='"https://avatars.dicebear.com/api/" + item.type + "/" + encodeURIComponent(item.name + "@" + item.unit) + ".svg"' />
                </v-avatar>
              </v-list-item-avatar>
              <v-list-item-content class='text-left'>
                <v-list-item-title>{{ item.name }} @ {{ item.unit }}</v-list-item-title>
                <v-list-item-subtitle>
                  <font-awesome-icon icon='envelope-open' />
                  {{item.email }}
                </v-list-item-subtitle>
              </v-list-item-content>
              <v-list-item-action>
                <v-btn v-clipboard:copy='item.email'>
                    <font-awesome-icon icon='copy' />
                  複製Email
                </v-btn>
              </v-list-item-action>
            </v-list-item>
          </v-sheet>
        </v-col>
      </v-row>
      <v-row>
            <v-col class='pa-0 d-flex flex-column'>
                <div class='text-h5 font-weight-bold'>許願池</div>
                <v-menu offset-y :close-on-content-click="false" v-model='wishPop'>
                    <template v-slot:activator='{ on, attrs }'>
                        <v-btn
                            color='primary'
                            dark
                            v-bind='attrs'
                            v-on='on'
                        >
                        <font-awesome-icon icon='pray'/>
                        向管理團隊許願吧！
                        </v-btn>
                    </template>
                    <v-card>
                        <v-card-title>來許願吧！</v-card-title>
                        <v-card-text>
                            <v-text-field label='標題' v-model='wishTitle'></v-text-field>
                            <v-textarea
                                label='請輸入你的願望是什麼呢？'
                                v-model='wishBody'
                            ></v-textarea>
                            <v-file-input prepend-icon='fa-paperclip' multiple label='輔助說明文件／圖片上傳'></v-file-input>
                            <v-select :items='wishFeatures' label='指定功能' v-model='selectedFeature'></v-select>
                        </v-card-text>
                        <v-card-actions>
                            <v-btn @click='wishPop = false'>送出願望</v-btn>
                        </v-card-actions>
                    </v-card>
                </v-menu>
                <v-sheet :height='wishSheetHeight' class='pa-2 overflow-y-auto'>
                    <v-expansion-panels focusable accordion v-model='wishExpanded'>
                        <v-expansion-panel v-for='item in wishes' :key='"wish" + item.id'>
                            <v-expansion-panel-header expand-icon='fa-chevron-down'>
                                <div>
                                    [ {{ item.feature }} @ {{ dateConvert(item.tick) }}] {{ item.title }}
                                </div>
                            </v-expansion-panel-header>
                            <v-expansion-panel-content>
                                <v-timeline dense>
                                    <v-timeline-item>
                                        <template v-slot:icon>
                                        <v-avatar>
                                            <img :src='"https://avatars.dicebear.com/api/" + item.type + "/" + encodeURIComponent(item.user.name + "@" + item.user.unit) + ".svg"' />
                                        </v-avatar>
                                        </template>
                                        <v-textarea
                                        label='請輸入您的意見'
                                        hint='如果您只是想關閉這個issue，直接按下面的關閉issue按鈕即可'
                                        ></v-textarea>
                                        <v-btn>
                                            <font-awesome-icon icon='reply'/>
                                            送出回復
                                        </v-btn>
                                        <v-btn>
                                            <font-awesome-icon icon='thumbs-up'/>
                                            只是按個讚
                                        </v-btn>
                                        <v-btn>
                                            <font-awesome-icon icon='thumbs-down'/>
                                            覺得沒必要
                                        </v-btn>
                                    </v-timeline-item>
                                    <v-timeline-item v-for='dialog in item.dialogs' :key='dialog.id'>
                                        <template v-slot:icon>
                                        <v-avatar>
                                            <img :src='"https://avatars.dicebear.com/api/" + dialog.user.type + "/" + encodeURIComponent(dialog.user.name + "@" + dialog.user.unit) + ".svg"' />
                                        </v-avatar>
                                        </template>
                                        <v-row justify='space-between'>
                                        <v-col cols='7' class='text-left'>
                                            <div class='text-subtitle-2 font-weight-bold text-decoration-underline'> {{ dialog.name }} </div>
                                            <div class='text-body-2'> {{ dialog.body }} </div>
                                            <div class='text-caption'>附件下載（點此）</div>
                                        </v-col>
                                        <v-col class='text-right text-overline' cols='5'>
                                            {{ dateConvert(dialog.tick) }}
                                        </v-col>
                                        </v-row>
                                    </v-timeline-item>
                                </v-timeline>
                            </v-expansion-panel-content>
                        </v-expansion-panel>
                    </v-expansion-panels>
                </v-sheet>
            </v-col>
        </v-row>
    </v-main>
</template>

<script>
import Vue from 'vue';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import VueClipboard from 'vue-clipboard2';
import moment from 'moment';
import '@fortawesome/fontawesome-free/css/all.css';
import { TiptapVuetifyPlugin } from 'tiptap-vuetify';
import { TiptapVuetify, Heading, Bold, Italic, Strike, Underline, Code, Paragraph, BulletList, OrderedList, ListItem, Link, Blockquote, HardBreak, HorizontalRule, History } from 'tiptap-vuetify';
import 'tiptap-vuetify/dist/main.css';

library.add(faInfoCircle);
Vue.component('font-awesome-icon', FontAwesomeIcon);

Vue.config.productionTip = false;
VueClipboard.config.autoSetContainer = true;
Vue.use(VueClipboard);
Vue.use(TiptapVuetifyPlugin, { vuetify });

export default {
    name: 'Info',
    components: { TiptapVuetify },
    methods: {
      test: function () {
        console.dir(this.LINEbody);
      },
      dateConvert: function (time) {
        return time === 0 ? '尚未設定' : moment.unix(time).format('YYYY/MM/DD HH:mm:ss');
      },
      sendLINEnotify: function () {
        this.$socket.client.emit('sendLINEnotify', {
          body: this.LINEbody,
          type: 1
        });
      }
    },
    data () {
        return {
          extensions: [
            History,
            Blockquote,
            Link,
            Underline,
            Strike,
            Italic,
            ListItem,
            BulletList,
            OrderedList,
            [Heading, {
              options: {
                levels: [1, 2, 3]
              }
            }],
            Bold,
            Code,
            HorizontalRule,
            Paragraph,
            HardBreak
          ],
          LINEbody: 'Slate is flexible enough to add **decorations** that can format text based on its content. For example, this editor has **Markdown** preview decorations on it, to make it _dead_ simple to make an editor with built-in Markdown previewing.',
          doneW: false,
          version: null,
          lineW: false,
            wishPop: false,
            wishTitle: '',
            wishBody: '',
            selectedFeature: null,
            wishFeatures: [
                '不明確功能',
                '前置功能編輯器（知識點編輯器）',
                '文件編輯器（腳本／分鏡圖審查）',
                '影片編輯器（影片審查）',
                'DashBoard儀錶板'
            ],
            wishSheetHeight: 0,
            wishExpanded: null,
            wishes: [
                {
                    feature: '功能一',
                    tick: 1604547482,
                    title: '這是一條普通訊息',
                    body: '這是訊息的內容',
                    id: 0,
                    status: true,
                    user: {
                        type: 'male',
                        unit: '特殊天賦青少年學校',
                        name: 'X博士'
                    },
                    dialogs: [
                        {
                            tick: 1604547482,
                            body: '測試一下',
                            title: '測試標題',
                            id: 5,
                            user: {
                                type: 'male',
                                unit: '特殊天賦青少年學校',
                                name: 'X博士'
                            }
                        },
                        {
                            tick: 1604547482,
                            body: '測試一下',
                            title: '測試標題',
                            id: 5,
                            user: {
                                type: 'male',
                                unit: '特殊天賦青少年學校',
                                name: 'X博士'
                            }
                        }
                    ]
                },
                {
                    feature: '功能二',
                    tick: 1604548482,
                    title: '這是一條設備維護訊息',
                    body: '這是訊息的內容',
                    id: 3,
                    status: true,
                    user: {
                        type: 'male',
                        unit: '特殊天賦青少年學校',
                        name: 'X博士'
                    },
                    dialogs: [
                        {
                            tick: 1604547482,
                            body: '測試一下',
                            title: '測試標題',
                            id: 5,
                            user: {
                                type: 'male',
                                unit: '特殊天賦青少年學校',
                                name: 'X博士'
                            }
                        },
                        {
                            tick: 1604547482,
                            body: '測試一下',
                            title: '測試標題',
                            id: 5,
                            user: {
                                type: 'male',
                                unit: '特殊天賦青少年學校',
                                name: 'X博士'
                            }
                        }
                    ]
                },
                {
                    feature: '功能三',
                    tick: 1604549482,
                    title: '這是一條緊急訊息',
                    body: '這是訊息的內容',
                    id: 1,
                    status: false,
                    user: {
                        type: 'male',
                        unit: '特殊天賦青少年學校',
                        name: 'X博士'
                    },
                    dialogs: [
                        {
                            tick: 1604547482,
                            body: '測試一下',
                            title: '測試標題',
                            id: 5,
                            user: {
                                type: 'male',
                                unit: '特殊天賦青少年學校',
                                name: 'X博士'
                            }
                        },
                        {
                            tick: 1604547482,
                            body: '測試一下',
                            title: '測試標題',
                            id: 5,
                            user: {
                                type: 'male',
                                unit: '特殊天賦青少年學校',
                                name: 'X博士'
                            }
                        }
                    ]
                }
            ],
            userList: []
        };
    },
    created () {
      this.$emit('viewIn', {
        text: '關於本系統&許願池',
        icon: faInfoCircle
      });
      let oriobj = this;
      this.$socket.client.emit('getsiteSetting');
      this.$socket.client.emit('getsiteAdminUsers');
      this.$socket.$subscribe('getsiteSetting', (data) => {
        oriobj.version = data.version;
      });
      this.$socket.$subscribe('getsiteAdminUsers', (data) => {
        oriobj.userList = data;
      });
      this.$socket.$subscribe('sendLINEnotify', (data) => {
        oriobj.doneW = true;
        oriobj.doneType = 'LINE訊息';
        oriobj.doneMsg = '發送了' + (parseInt(data.success, 10) + parseInt(data.failed, 10)) + '則LINE notify訊息，' + parseInt(data.success, 10) + '則成功，' + parseInt(data.failed, 10) + '則失敗';
      });
    },
    mounted () {
      let oriobj = this;
      this.editor = new Editor({
        content: this.LINEbody,
        onUpdate: ({ getHTML }) => {
          oriobj.LINEbody = getHTML();
          console.log(oriobj.LINEbody);
        }
      });
    },
    beforeDestroy () {
      this.editor.destroy();
    }
};
</script>
