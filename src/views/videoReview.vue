<template>
  <v-main ref='mainBlock' class='pa-0' style="width: 100% !important;">
    <v-alert type="error" v-if="statistics.unfinishObj === 0">
      本階段目標已全部完成，請回到DashBoard，可進入下一個階段（如果你在下一個階段還有權力的話）
    </v-alert>
    <v-alert type="error" v-if="!currentStage.current">
      本階段已經是歷史了，離開吧！
    </v-alert>
    <v-dialog
      v-model="commitFilterW"
      persistent
      max-width="50vw"
    >
      <v-card>
        <v-card-title class="headline">
          依照Commit來過濾Issue
        </v-card-title>
        <v-card-text class='d-flex flex-column'>
          <v-select
            v-model="compareCommit"
            hint="請選擇一個你要的Commit"
            :items="currentVersions"
            label="請選擇一個你要的Commit"
            persistent-hint
            return-object
            single-line
          >
            <template slot="selection" slot-scope="data">
              <span class='text-caption'>COMMIT: {{ dateConvert(data.item.tick) }}</span>
            </template>
            <template slot="item" slot-scope="data">
              <span class='text-caption'>COMMIT: {{ dateConvert(data.item.tick) }}</span>
            </template>
          </v-select>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click='compareCommit = { tick: 0 }'>取消Commit標記</v-btn>
          <v-btn v-if='issueFilter.commit' @click='issueFilter.commit = false'>我只是要標記，不要過濾</v-btn>
          <v-btn v-if='!issueFilter.commit' @click='issueFilter.commit = true'>啟動Commit過濾</v-btn>
          <v-btn @click='commitFilterW = false'>關閉對話框</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="loadW"
      persistent
      max-width="50vw"
    >
      <v-card>
        <v-card-title class="headline">
          載入知識點... {{ currentKB.title }}
        </v-card-title>
        <v-card-text class='d-flex flex-row justify-space-around'>
          <div v-for='item in loadingItems' :key='item.id' :class='authClass(item)'>
            <v-icon>{{ item.icon }}</v-icon>
            <div>{{ item.text }}</div>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="progressW"
      transition="dialog-bottom-transition"
      width="50vw"
    >
      <v-card>
        <v-toolbar
          dark
          color="primary"
        >
          <v-toolbar-title>{{ currentKB.title }} 目前進度概況</v-toolbar-title>
        </v-toolbar>
        <v-card-text class='pa-5'>
          <div v-if='currentKB.currentStep === 0'>專案目前沒啟動，你是怎麼到這裡的？</div>
          <div v-if='currentKB.currentStep > 0'>
            <div class='text-h6'>目前進度（階段 {{ currentKB.currentStep }} / {{ currentKB.stages.length }}）</div>
            <div class='text-body-1 font-weight-medium black--text text-left'>{{ currentKB.stages[currentKB.currentStep - 1].name }}</div>
            <div class='text-h6'>進度日期</div>
            <div class='text-body-1 font-weight-medium black--text text-left d-flex flex-row flex-wrap'>
              <div>{{ dateConvert(currentKB.stages[currentKB.currentStep - 1].startTick) }}</div>
              <v-icon>fa-forward</v-icon>
              <div>{{ dateConvert(currentKB.stages[currentKB.currentStep - 1].dueTick) }}</div>
            </div>
            <div class='text-h6'>你在目前進度中的角色以及你該注意的按鈕</div>
            <div v-if='taguserConvert(["PM"])'>
              <div class='text-body-1 font-weight-medium black--text text-left'>專案管理者：你可以關閉／開啟任何的Issue，並且在知識點編輯器中強制改變專案進度</div>
              <div class='text-body-1 flex-wrap d-flex flex-row font-weight-medium black--text text-left justify-start'>
                <div class='flex-column d-flex ma-2'>
                  <v-icon large>fas fa-comment-slash</v-icon>
                  <div>同意／不同意Issue</div>
                </div>
                <div class='flex-column d-flex ma-2'>
                  <v-icon large>fa-flag</v-icon>
                  <div>查看階段目標</div>
                </div>
                <div class='flex-column d-flex ma-2'>
                  <v-icon large>fa-filter</v-icon>
                  <div>按右下角過濾器可以找到你要的Issue</div>
                </div>
              </div>
            </div>
            <div v-if='taguserConvert(["vendor"])'>
              <div class='text-body-1 font-weight-medium black--text text-left'>廠商：你可以在DashBoard中上傳知識點的commit，並且回復Issue</div>
              <div class='text-body-1 flex-wrap d-flex flex-row font-weight-medium black--text text-left justify-start'>
                <div class='flex-column d-flex ma-2'>
                  <v-icon large>fa-envelope-open-text</v-icon>
                  <div>查看知識點細部內容</div>
                </div>
                <div class='flex-column d-flex ma-2'>
                  <v-icon large>fa-flag</v-icon>
                  <div>查看階段目標</div>
                </div>
                <div class='flex-column d-flex ma-2'>
                  <v-icon large>fa-code-branch</v-icon>
                  <div>發布commit（Dashboard）</div>
                </div>
                <div class='flex-column d-flex ma-2'>
                  <v-icon large>fa-filter</v-icon>
                  <div>按右下角過濾器可以找到你要的Issue</div>
                </div>
              </div>
            </div>
            <div v-if='taguserConvert(["writer"])'>
              <div class='text-body-1 font-weight-medium black--text text-left'>寫手：你可以開啟Issue，並回復Issue</div>
              <div class='text-body-1 flex-wrap d-flex flex-row font-weight-medium black--text text-left justify-start'>
                <div class='flex-column d-flex ma-2'>
                  <v-icon large>fa-envelope-open-text</v-icon>
                  <div>查看知識點細部內容</div>
                </div>
                <div class='flex-column d-flex ma-2'>
                  <v-icon large>fa-comment-medical</v-icon>
                  <div>送出新Issue</div>
                </div>
                <div class='flex-column d-flex ma-2'>
                  <v-icon large>fa-flag</v-icon>
                  <div>查看階段目標</div>
                </div>
                <div class='flex-column d-flex ma-2'>
                  <v-icon large>fa-filter</v-icon>
                  <div>按右下角過濾器可以找到你要的Issue</div>
                </div>
              </div>
            </div>
            <div v-if='taguserConvert(["reviewer"])'>
              <div class='text-body-1 font-weight-medium black--text text-left'>審查者：你可以開啟／關閉Issue，並且決定本階段是否結束</div>
              <div class='text-body-1 flex-wrap d-flex flex-row font-weight-medium black--text text-left justify-start'>
                <div class='flex-column d-flex ma-2'>
                  <v-icon large>fa-envelope-open-text</v-icon>
                  <div>查看知識點細部內容</div>
                </div>
                <div class='flex-column d-flex ma-2'>
                  <v-icon large>fas fa-comment-slash</v-icon>
                  <div>同意／不同意Issue</div>
                </div>
                <div class='flex-column d-flex ma-2'>
                  <v-icon large>fa-flag</v-icon>
                  <div>查看階段目標</div>
                </div>
                <div class='flex-column d-flex ma-2'>
                  <v-icon large>fa-code-branch</v-icon>
                  <div>啟動Commit對比</div>
                </div>
                <div class='flex-column d-flex ma-2'>
                  <v-icon large>fa-filter</v-icon>
                  <div>按右下角過濾器可以找到你要的Issue</div>
                </div>
              </div>
            </div>
            <div v-if='taguserConvert(["final"])'>
              <div class='text-body-1 font-weight-medium black--text text-left'>行政組：你只能看Issue，並在DashBoard中匯出專案統計</div>
              <div class='text-body-1 flex-wrap d-flex flex-row font-weight-medium black--text text-left justify-start'>
                <div class='flex-column d-flex ma-2'>
                  <v-icon large>fa-chart-bar</v-icon>
                  <div>查看統計（Dashboard）</div>
                </div>
                <div class='flex-column d-flex ma-2'>
                  <v-icon large>fa-filter</v-icon>
                  <div>按右下角過濾器可以找到你要的Issue</div>
                </div>
              </div>
            </div>
          </div>
        </v-card-text>
        <v-card-actions class='d-flex flex-row justify-end'>
          <v-spacer>
          </v-spacer>
          <v-btn
            @click="progressW = false"
          >
            好的，我要開始工作了！
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model='editlogw' fullscreen hide-overlay transition='dialog-bottom-transition'>
      <v-card>
        <v-toolbar dark color='primary'>
          <v-btn icon dark @click='editlogw = false'>
            <v-icon>fa-times</v-icon>
          </v-btn>
          <v-toolbar-title>知識點影片完整歷程</v-toolbar-title>
        </v-toolbar>
        <v-card-text>
          <v-skeleton-loader
            class="mx-auto"
            type="card"
            width="100%"
            v-if='!versionPopulated'
          ></v-skeleton-loader>
          <v-virtual-scroll
            :items='currentVersions'
            :item-height='50'
            height='550'
            v-if='versionPopulated'
          >
            <template v-slot='{ item }'>
              <v-list-item>
                <v-list-item-content style='text-align: left'>
                  <v-list-item-title>[ {{ versionConvert(item) }} ] {{ dateConvert(item.tick) }}</v-list-item-title>
                  <v-list-item-subtitle>{{ item.name }}</v-list-item-subtitle>
                </v-list-item-content>
                <v-list-item-action>
                  <v-btn :disabled='historyConvert(item) !== "舊commit"' @click='loadVersion(item)'>{{ historyConvert(item) }}</v-btn>
                </v-list-item-action>
              </v-list-item>
            </template>
          </v-virtual-scroll>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-dialog v-model='paintW' fullscreen hide-overlay transition='dialog-bottom-transition'>
      <v-card>
        <v-toolbar dark color='primary'>
          <v-btn icon dark @click='paintW = false'>
            <v-icon>fa-times</v-icon>
          </v-btn>
          <v-toolbar-title>標記修改重點（繪圖模式）</v-toolbar-title>
        </v-toolbar>
        <v-card-actions class='d-flex flex-row'>
          <v-tooltip top>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                icon
                @click="citeEraser = !citeEraser"
                v-bind="attrs" v-on="on"
              >
                <v-icon v-if='citeEraser'>fa-eraser</v-icon>
                <v-icon v-if='!citeEraser'>fa-paint-brush</v-icon>
              </v-btn>
            </template>
            <span v-if='!citeEraser'>使用橡皮擦</span>
            <span v-if='citeEraser'>使用筆</span>
          </v-tooltip>
          <div>畫筆顏色</div>
          <v-btn
            icon
            @click='citeColor = "#D00000"'>
            <v-icon color="#D00000">fa-square</v-icon>
          </v-btn>
          <v-btn
            icon
            @click='citeColor = "#2C7AD6"'>
            <v-icon color="#2CDA76">fa-square</v-icon>
          </v-btn>
          <v-btn
            icon
            @click='citeColor = "#D6E510"'>
            <v-icon color="#D6E510">fa-square</v-icon>
          </v-btn>
          <v-btn
            icon
            @click='citeColor = "#000"'>
            <v-icon color="#000">fa-square</v-icon>
          </v-btn>
          <v-tooltip top>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                icon
                @click="undoCanvas"
                v-bind="attrs" v-on="on"
              >
                <v-icon>fa-undo</v-icon>
              </v-btn>
            </template>
            <span>復原</span>
          </v-tooltip>
          <v-tooltip top>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                icon
                @click="redoCanvas"
                v-bind="attrs" v-on="on"
              >
                <v-icon>fa-redo</v-icon>
              </v-btn>
            </template>
            <span>重作</span>
          </v-tooltip>
          <v-tooltip top>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                @click="clearCanvas"
                icon
                v-bind="attrs" v-on="on"
              >
                <v-icon>fa-chalkboard</v-icon>
              </v-btn>
            </template>
            <span>清空繪圖區</span>
          </v-tooltip>
          <v-btn
            v-bind="attrs" v-on="on"
            @click="citetoIssue"
          >我畫好了，送出！</v-btn>
        </v-card-actions>
        <v-card-text class='text-left'>
          <paintable
            alwaysOnTop
            :width="paintWidth"
            :height="paintHeight"
            :disableNavigation="true"
            :active="true"
            :factor="1"
            :lineWidthEraser="20"
            :useEraser="citeEraser"
            :color="citeColor"
            ref="paintable"
          >
            <canvas ref='paintBase'></canvas>
          </paintable>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-speed-dial v-model="filterBtn" fixed bottom right direction="left" :open-on-hover="true" transition="slide-y-reverse-transition">
      <template v-slot:activator>
        <v-btn
          v-model="filterBtn"
          :color="filterColor('all')"
          dark
          fab
        >
          <v-icon v-if="filterBtn">fa-chevron-left</v-icon>
          <v-icon v-else>fa-filter</v-icon>
        </v-btn>
      </template>
      <v-tooltip top>
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            fab
            dark
            small
            :color="filterColor('time')"
            @click.stop='issueFilter.time = !issueFilter.time'
            v-bind="attrs" v-on="on"
          >
            <v-icon v-if='issueFilter.time'>far fa-clock</v-icon>
            <v-icon v-if='!issueFilter.time'>fas fa-clock</v-icon>
          </v-btn>
        </template>
        <span v-if='issueFilter.time'>我要看所有的Issue</span>
        <span v-if='!issueFilter.time'>我要目前秒數的Issue</span>
      </v-tooltip>
      <v-tooltip top>
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            fab
            dark
            small
            :color="filterColor('commit')"
            @click.stop='commitFilterW = true'
            v-bind="attrs" v-on="on"
          >
            <v-icon>fa-code-branch</v-icon>
          </v-btn>
        </template>
        <span>我要選擇commit來過濾Issue</span>
      </v-tooltip>
      <v-tooltip top>
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            fab
            dark
            small
            :color="filterColor('flag')"
            @click.stop='issueFilter.flag = !issueFilter.flag'
            v-bind="attrs" v-on="on"
          >
            <v-icon v-if='!issueFilter.flag'>far fa-flag</v-icon>
            <v-icon v-if='issueFilter.flag'>fas fa-flag</v-icon>
          </v-btn>
        </template>
        <span v-if='!issueFilter.flag'>去除0秒的Issue</span>
        <span v-if='issueFilter.flag'>看0秒的Issue</span>
      </v-tooltip>
      <v-tooltip top>
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            fab
            dark
            small
            :color="filterColor('closed')"
            @click.stop='issueFilter.closed = !issueFilter.closed'
            v-bind="attrs" v-on="on"
          >
            <v-icon v-if='!issueFilter.closed'>far fa-comment</v-icon>
            <v-icon v-if='issueFilter.closed'>fas fa-comment</v-icon>
          </v-btn>
        </template>
        <span v-if='!issueFilter.closed'>不論Issue狀態都顯示</span>
        <span v-if='issueFilter.closed'>只看沒被關閉的Issue</span>
      </v-tooltip>
      <v-tooltip top>
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            fab
            dark
            small
            :color="filterColor('user')"
            disabled
            v-bind="attrs" v-on="on"
          >
            <v-icon>fas fa-user-clock</v-icon>
          </v-btn>
        </template>
        <span>標記在我上一次登入後出現的Issue（第二期工程，請勿點選）</span>
      </v-tooltip>
    </v-speed-dial>
    <v-row ref='rowBlock' no-gutters style='width: 100%'>
      <v-col ref='viewColumn' :xl='videoWidth' :lg='videoWidth' md='12' sm='12' xs='12' class='d-flex flex-column justify-center align-self-start'>
        <div class='d-flex flex-row justify-space-between white'>
          <div class='d-flex flex-row justify-space-around flex-grow-1'>
            <v-tooltip top>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  v-bind="attrs" v-on="on"
                  :icon='!largeBtn'
                  @click='extendIssue'
                  color="white"
                  class='ma-2'
                >
                  <v-icon v-if='!largeBtn' :large='largeBtn' :medium='!largeBtn' color="black">fa-arrows-alt-h</v-icon>
                  <span v-if='largeBtn'>{{ extendWord }}</span>
                </v-btn>
              </template>
              <span>{{ extendWord }}</span>
            </v-tooltip>
            <v-tooltip top>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  v-bind="attrs" v-on="on"
                  :icon='!largeBtn'
                  @click='editlogw = true'
                  color="white"
                  class='ma-2'
                >
                  <v-icon v-if='!largeBtn' :large='largeBtn' :medium='!largeBtn' color="black">fa-history</v-icon>
                  <span v-if='largeBtn'>查看Commit紀錄</span>
                </v-btn>
              </template>
              <span>查看Commit紀錄</span>
            </v-tooltip>
            <v-tooltip top>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  v-bind="attrs" v-on="on"
                  @click='objectiveW = !objectiveW'
                  :icon='!largeBtn'
                  color="white"
                  class='ma-2'
                >
                  <v-icon v-if='!largeBtn' :large='largeBtn' :medium='!largeBtn' color="black">{{ objectiveWConvert().icon }}</v-icon>
                  <span v-if='largeBtn'>{{ objectiveWConvert().msg }}</span>
                </v-btn>
              </template>
              <span>{{ objectiveWConvert().msg }}</span>
            </v-tooltip>
            <v-tooltip top>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  v-bind="attrs" v-on="on"
                  @click='tipW = !tipW'
                  :icon='!largeBtn'
                  color="white"
                  class='ma-2'
                >
                  <v-icon v-if='!largeBtn' :large='largeBtn' :medium='!largeBtn' color="black">fa-envelope-open-text</v-icon>
                  <span v-if='largeBtn'>{{ tipConvert() }}</span>
                </v-btn>
              </template>
              <span>{{ tipConvert() }}</span>
            </v-tooltip>
            <v-tooltip top v-if='!currentStage.isFinal'>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  @click='addIssue'
                  :icon='!largeBtn'
                  v-bind="attrs" v-on="on"
                  color="white"
                  class='ma-2'
                >
                  <v-icon v-if='!largeBtn' :large='largeBtn' :medium='!largeBtn' color="black">fa-comment-medical</v-icon>
                  <span v-if='largeBtn'>新增Issue</span>
                </v-btn>
              </template>
              <span>新增Issue</span>
            </v-tooltip>
          </div>
          <div class='d-flex flex-row white--text justify-end pa-2' style='background-color: #1e1e1e'>
            <div>統計</div>
            <v-tooltip top>
              <template v-slot:activator="{ on, attrs }">
                <div v-bind="attrs" v-on="on">
                  <v-icon color="white">far fa-flag</v-icon>
                  {{ statistics.unfinishObj }}
                </div>
              </template>
              <span>未完成的階段目標</span>
            </v-tooltip>
            <v-tooltip top>
              <template v-slot:activator="{ on, attrs }">
                <div v-bind="attrs" v-on="on">
                  <v-icon color="white">fas fa-flag</v-icon>
                  {{ statistics.finishObj }}
                </div>
              </template>
              <span>已完成的階段目標</span>
            </v-tooltip>
            <v-tooltip top>
              <template v-slot:activator="{ on, attrs }">
                <div v-bind="attrs" v-on="on">
                  <v-icon color="white">far fa-comment</v-icon>
                  {{ statistics.openIssue }}
                </div>
              </template>
              <span>尚在討論的Issue</span>
            </v-tooltip>
            <v-tooltip top>
              <template v-slot:activator="{ on, attrs }">
                <div v-bind="attrs" v-on="on">
                  <v-icon color="white">fas fa-comment-slash</v-icon>
                  {{ statistics.closedIssue }}
                </div>
              </template>
              <span>已關閉的Issue</span>
            </v-tooltip>
          </div>
        </div>
        <div class='previewArea' ref='previewArea'>
          <div v-show='objectiveW' class='white--text pa-5' style='background-color: #1e1e1e'>
            <div class='text-h5 text-center'>階段目標</div>
            <v-simple-table dark class='text-left' v-if="currentStage.objectives.length > 0">
              <template v-slot:default>
                <thead>
                  <tr>
                    <th class="text-left" style="width:25px">
                      階段目標名稱
                    </th>
                    <th class="text-left" style="width:25px">
                      同意人
                    </th>
                    <th class="text-left" style="width:25px">
                      &nbsp;
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="objective in currentStage.objectives"
                    :key="objective._id"
                  >
                    <td class="text-left">
                      {{ objective.name }}
                    </td>
                    <td class="text-left">
                      <div v-if='"signUser" in objective'>{{ objective.signUser.name }} （通過日期：{{ dateConvert(objective.signTick) }}）</div>
                    </td>
                    <td class='d-flex flex-row justify-end'>
                      <v-tooltip top v-if='taguserConvert(["reviewer"])'>
                        <template v-slot:activator="{ on, attrs }">
                          <v-btn
                            v-bind="attrs" v-on="on"
                            outlined
                            icon
                            color="white"
                            @click='setObjective(objective._id)'
                          >
                            <v-icon>{{ objectiveConvert(objective).icon }}</v-icon>
                          </v-btn>
                        </template>
                        <span>{{ objectiveConvert(objective).msg }}</span>
                      </v-tooltip>
                      <v-tooltip top v-if='taguserConvert(["PM", "reviewer", "writer"])'>
                        <template v-slot:activator="{ on, attrs }">
                          <v-btn
                            outlined
                            icon
                            color="white"
                            @click='addIssue({ objective: objective._id })'
                            v-bind="attrs" v-on="on"
                          >
                            <v-icon>fa-comment-medical</v-icon>
                          </v-btn>
                        </template>
                        <span>針對這個目標發Issue</span>
                      </v-tooltip>
                      <v-tooltip top v-if='!currentStage.isFinal'>
                        <template v-slot:activator="{ on, attrs }">
                          <v-btn
                            outlined
                            icon
                            color="white"
                            @click='viewObjective(objective._id)'
                            v-bind="attrs" v-on="on"
                          >
                            <v-icon>{{ viewObjConvert().icon }}</v-icon>
                          </v-btn>
                        </template>
                        <span>{{ viewObjConvert().msg }}</span>
                      </v-tooltip>
                    </td>
                  </tr>
                </tbody>
              </template>
            </v-simple-table>
          </div>
          <div v-show='tipW' class='black--text text-left'>
            <div class='text-h5'>知識點對應課綱／課本</div>
            <div class='text-body-1'>{{ currentKB.textbook }}</div>
            <div class='text-h5'>寫作指引</div>
            <div class='text-body-1' v-html='HTMLConverter(currentKB.desc)'></div>
            <div v-if="currentKB.descAtt.length > 0">
              <div class='text-h5'>寫作指引附件</div>
              <div class='d-flex flex-row flex-wrap'>
                <v-chip
                  v-for='file in currentKB.descAtt'
                  :key="file._id"
                  class="ma-2"
                  @click="downloadFile(file)"
                >
                  {{ file.name }} ({{ byteConvert(file.size) }})
                </v-chip>
              </div>
            </div>
          </div>
          <div ref='viewArea' class='viewArea' v-show='!tipW' style='position: relative'>
            <div class='d-flex flex-column' v-if='currentVersion._id === ""'>
              <v-icon x-large class='ma-1' style='transform: scale(1.5);'>fa-exclamation-circle</v-icon>
              <div class='text-h5 font-weight-black ma-3'>目前沒有任何檔案</div>
            </div>
            <div ref='videoArea' v-if='currentVersion._id !== ""'>
              <div ref='currentPlayerArea' class="compareComp">
                <div style='display: flex; justify-content: flex-start'>
                  <div class='versionSign'>當前Commit</div>
                  <v-tooltip top v-if='currentVersion.type.indexOf("zip") === -1'>
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn
                        v-bind="attrs" v-on="on"
                        icon
                        color="light-blue darken-4"
                        @click='playVideo(0)'
                      >
                        <v-icon>fa-play</v-icon>
                      </v-btn>
                    </template>
                    <span>播放影片</span>
                  </v-tooltip>
                  <v-tooltip top v-if='currentVersion.type.indexOf("zip") === -1'>
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn
                        v-bind="attrs" v-on="on"
                        icon
                        color="light-blue darken-4"
                        @click='pauseVideo(0)'
                      >
                        <v-icon>fa-stop</v-icon>
                      </v-btn>
                    </template>
                    <span>停止影片</span>
                  </v-tooltip>
                  <v-tooltip top v-if='currentVersion.type.indexOf("zip") === -1'>
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn
                        v-bind="attrs" v-on="on"
                        icon
                        color="light-blue darken-4"
                        @click='decreasePlaybackrate(0)'
                      >
                        <v-icon>fa-backward</v-icon>
                      </v-btn>
                    </template>
                    <span>減速播放</span>
                  </v-tooltip>
                  <v-tooltip top v-if='currentVersion.type.indexOf("zip") === -1'>
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn
                        v-bind="attrs" v-on="on"
                        icon
                        color="light-blue darken-4"
                        @click='increasePlaybackrate(0)'
                      >
                        <v-icon>fa-forward</v-icon>
                      </v-btn>
                    </template>
                    <span>加速撥放</span>
                  </v-tooltip>
                  <v-tooltip top v-if='currentVersion.type.indexOf("zip") === -1'>
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn
                        v-bind="attrs" v-on="on"
                        icon
                        color="light-blue darken-4"
                        @click='captureDOM(0)'
                      >
                        <v-icon>fa-camera</v-icon>
                      </v-btn>
                    </template>
                    <span>擷取當前撥放畫面</span>
                  </v-tooltip>
                  <v-tooltip top>
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn
                        v-bind="attrs" v-on="on"
                        icon
                        color="light-blue darken-4"
                        @click="downloadFile(currentVersion)"
                      >
                        <v-icon>fa-download</v-icon>
                      </v-btn>
                    </template>
                    <span>下載原始檔</span>
                  </v-tooltip>
                </div>
                <div class='dragBanner' style='left: 2px'>[當前]{{ dateConvert(currentVersion.tick) }}</div>
                <video ref='currentPlayer' class='video-js' v-show='!cZip'></video>
                <v-list ref='currentZip' class='currentZip overflow-y-auto pa-0 ma-0 text-left' v-show='cZip'>
                  <v-list-item
                    v-for="zipfile in currentZip"
                    :key="zipfile.id"
                  >
                    <v-list-item-icon>
                      <v-icon v-if='zipfile.file.dir'>fa-folder</v-icon>
                      <v-icon v-if='!zipfile.file.dir'>{{ fileiconConvert(zipfile.file.name) }}</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-title>{{ zipfile.file.name }}</v-list-item-title>
                      <v-list-item-subtitle v-if='!zipfile.file.dir'>{{ dateobjConvert(zipfile.file.date) }} {{ byteConvert(zipfile.file._data.uncompressedSize) }}</v-list-item-subtitle>
                    </v-list-item-content>
                    <v-list-item-action>
                    <v-tooltip top>
                      <template v-slot:activator="{ on, attrs }">
                        <v-btn
                          v-bind="attrs" v-on="on"
                          :disabled='zipfile.file.dir'
                          @click='extraZipfile(zipfile.file)'
                          icon
                        >
                          <v-icon>fa-download</v-icon>
                        </v-btn>
                      </template>
                      <span>下載檔案</span>
                    </v-tooltip>
                    </v-list-item-action>
                  </v-list-item>
                </v-list>
              </div>
              <div ref='previousPlayerArea' class="compareComp"  style='clip-path: inset( 0 0 0 100% )' v-if='previousVersion._id !== ""'>
                <div style='display: flex; justify-content: flex-end'>
                  <v-tooltip top v-if='previousVersion.type.indexOf("zip") === -1'>
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn
                        v-bind="attrs" v-on="on"
                        icon
                        color="red darken-4"
                        @click='playVideo(1)'
                      >
                        <v-icon>fa-play</v-icon>
                      </v-btn>
                    </template>
                    <span>播放影片</span>
                  </v-tooltip>
                  <v-tooltip top v-if='previousVersion.type.indexOf("zip") === -1'>
                    <template v-slot:activator="{ on, attrs }">
                        <v-btn
                          v-bind="attrs" v-on="on"
                          icon
                          color="red darken-4"
                          @click='pauseVideo(1)'
                        >
                          <v-icon>fa-stop</v-icon>
                        </v-btn>
                    </template>
                    <span>停止影片</span>
                  </v-tooltip>
                  <v-tooltip top v-if='previousVersion.type.indexOf("zip") === -1'>
                    <template v-slot:activator="{ on, attrs }">
                        <v-btn
                          v-bind="attrs" v-on="on"
                          icon
                          color="red darken-4"
                          @click='decreasePlaybackrate(1)'
                        >
                          <v-icon>fa-backward</v-icon>
                        </v-btn>
                    </template>
                    <span>減速播放</span>
                  </v-tooltip>
                  <v-tooltip top v-if='previousVersion.type.indexOf("zip") === -1'>
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn
                        v-bind="attrs" v-on="on"
                        icon
                        color="red darken-4"
                        @click='increasePlaybackrate(1)'
                      >
                        <v-icon>fa-forward</v-icon>
                      </v-btn>
                    </template>
                    <span>加速撥放</span>
                  </v-tooltip>
                  <v-tooltip top v-if='currentVersion.type.indexOf("zip") === -1'>
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn
                        v-bind="attrs" v-on="on"
                        icon
                        color="red darken-4"
                        @click='captureDOM(1)'
                      >
                        <v-icon>fa-camera</v-icon>
                      </v-btn>
                    </template>
                    <span>擷取當前撥放畫面</span>
                  </v-tooltip>
                  <v-tooltip top>
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn
                        v-bind="attrs" v-on="on"
                        icon
                        color="red darken-4"
                        @click="downloadFile(previousVersion)"
                      >
                        <v-icon>fa-download</v-icon>
                      </v-btn>
                    </template>
                    <span>下載原始檔</span>
                  </v-tooltip>
                  <div class='versionSign'>對照Commit</div>
                </div>
                <div class='dragBanner' style='right: 2px'>[對照]{{ dateConvert(previousVersion.tick) }}</div>
                <video ref='previousPlayer' class='video-js' v-show='!pZip'></video>
                <v-list ref='previousZip' class='overflow-y-auto pa-0 ma-0 text-left' v-show='pZip'>
                  <v-list-item
                    v-for="zipfile in previousZip"
                    :key="zipfile.id"
                  >
                    <v-list-item-icon>
                      <v-icon v-if='zipfile.file.dir'>fa-folder</v-icon>
                      <v-icon v-if='!zipfile.file.dir'>fa-file-archive</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-title>{{ zipfile.file.name }}</v-list-item-title>
                      <v-list-item-subtitle v-if='!zipfile.file.dir'>{{ dateobjConvert(zipfile.file.date) }} {{ byteConvert(zipfile.file._data.uncompressedSize) }}</v-list-item-subtitle>
                    </v-list-item-content>
                    <v-list-item-action>
                    <v-tooltip top>
                      <template v-slot:activator="{ on, attrs }">
                        <v-btn
                          v-bind="attrs" v-on="on"
                          :disabled='zipfile.file.dir'
                          @click='extraZipfile(zipfile.file)'
                          icon
                        >
                          <v-icon>fa-download</v-icon>
                        </v-btn>
                      </template>
                      <span>下載檔案</span>
                    </v-tooltip>
                    </v-list-item-action>
                  </v-list-item>
                </v-list>
              </div>
              <div ref='compareBar' class='compareBar' v-if='currentVersion._id !== ""'>
                <div ref='compareBtnC'>
                  <v-btn icon ref='compareBtn' class='compareBtn' draggable="true" @touchmove.prevent='checkDrag' @touchend.prevent='checkDrag' @dragend.prevent='checkDrag' @drag.prevent="checkDrag">
                    <v-icon>fa-arrows-alt-h</v-icon>
                  </v-btn>
                </div>
              </div>
              <div v-if='pinMode' class='pinAlert'>
                <v-btn
                  @click="endPinMode"
                  class='red accent-4 white--text ma-1'
                >
                  置頂模式已開啟，按此關閉
                </v-btn>
                <v-btn
                  @click='addIssue'
                  class='ma-1 indigo darken-4 white--text'
                >
                  我要留言
                </v-btn>
              </div>
            </div>
          </div>
        </div>
      </v-col>
      <v-col ref='issueArea' :xl='controlWidth' :lg='controlWidth' md='12' sm='12' xs='12' class='d-flex flex-column'>
        <div class='text-caption'>篩選出 {{ filteredIssues.length }}條Issue</div>
        <v-sheet class='d-flex flex-column align-start' v-if='filteredListW'>
          <issue-list
            v-for='issue in filteredIssues'
            :key='issue._id'
            :issue='issue'
            :compareCommit='compareCommit'
            :compareUser='compareUser'
            :currentVersion='currentVersion'
            @view='getIssue'
          >
          </issue-list>
        </v-sheet>
        <v-card ref='issueW' class='issueW' v-show='issueW'>
          <v-card-title>
            編輯Issue
          </v-card-title>
          <v-card-text class='text-left'>
            <v-text-field label="Issue標題" v-model='issue.title' v-if='issue.parent === undefined'/>
            <tiptap-vuetify
              v-model="issue.body"
              :extensions="extensions"
              max-height="40vh"
              min-height="20vh"
              placeholder='請不要留白'
              class='text-left'
            />
            <v-file-input prepend-icon="fa-paperclip" v-model="issueFile" label='輔助說明文件／圖片上傳' :loading="uploadprogress !== 0">
              <template v-slot:progress>
                <v-progress-circular :value="uploadprogress"></v-progress-circular>速度：{{ uploadstatus }}
              </template>
            </v-file-input>
            <div v-if="issue.attachments.length > 0" class='d-flex flex-row flex-wrap'>
              <v-chip
                v-for='file in issue.attachments'
                :key="file._id"
                class="ma-2"
                close
                close-icon="fa-times"
                @click:close="deleteIssueFile(file)"
              >
                {{ file.name }} ({{ byteConvert(file.size) }})
              </v-chip>
            </div>
            <div class='text-right'>@{{ currentPosD }}</div>
          </v-card-text>
          <v-card-actions class='d-flex flex-column align-self-baseline justify-end'>
            <v-spacer></v-spacer>
            <v-btn
              color="blue darken-4"
              class='white--text ma-31'
              @click="snapshotPaint(0)"
            >
              手繪標註目前影片
            </v-btn>
            <v-btn
              color="red darken-4"
              class='white--text ma-1'
              @click="snapshotPaint(1)"
            >
              手繪標註對比影片
            </v-btn>
            <v-btn
              color="red darken-4"
              class='white--text ma-1'
              @click="setIssue"
            >
              儲存Issue
            </v-btn>
          </v-card-actions>
        </v-card>
        <v-sheet
          class='ma-0 pa-0 issueListW'
          ref='issueListW'
          v-show='issueListW'
        >
          <div class="d-flex flex-column align-self-start">
            <div class='ma-0 pa-0 text-h6'>
              {{ issuesInView.main.title }}
            </div>
            <div class='text-right text-caption d-flex flex-row'>
              <div class="versionSign">{{ versionConvert(issuesInView.main.version) }}</div>
              <div v-if='("tick" in issuesInView.main.version)'>{{ timeConvert(issuesInView.main.position) }} @ COMMIT: {{ dateConvert(issuesInView.main.version.tick) }}</div>
              <div v-else>{{ timeConvert(issuesInView.main.position) }}</div>
            </div>
            <div class='d-flex flex-row justify-end align-self-end ma-0 pa-0'>
              <v-tooltip top v-if='!currentStage.isFinal'>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    icon
                    @click='addIssue(issuesInView.main)'
                    v-bind="attrs" v-on="on"
                  >
                    <v-icon>fa-comment-medical</v-icon>
                  </v-btn>
                </template>
                <span>回復Issue</span>
              </v-tooltip>
              <v-tooltip top v-if='taguserConvert(["reviewer", "PM"])'>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    icon
                    @click='setStar()'
                    v-bind="attrs" v-on="on"
                  >
                    <v-icon dense>{{ starConvert(issuesInView.main) }}</v-icon>
                  </v-btn>
                </template>
                <span>標記為重要Issue</span>
              </v-tooltip>
              <v-tooltip top v-if='taguserConvert(["reviewer", "PM"])'>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn icon v-bind="attrs" v-on="on" @click='setStatus()'>
                    <v-icon dense>{{ statusConvert().icon }}</v-icon>
                  </v-btn>
                </template>
                <span>{{ statusConvert().msg }}</span>
              </v-tooltip>
              <v-tooltip top>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn icon @click='issueListW = false; filteredListW = true;' v-bind="attrs" v-on="on">
                    <v-icon dense>fa-times-circle</v-icon>
                  </v-btn>
                </template>
                <span>回到列表檢視</span>
              </v-tooltip>
            </div>
            <issue-view
              :issue='issuesInView.main'
              :compareCommit='compareCommit'
              :compareUser='compareUser'
              :currentStage="currentStage"
              @edit='editIssue'
              @download='downloadFile'
              @remove='removeIssue'
            />
            <issue-view
              v-for="issue in issuesInView.collections"
              :key="issue._id"
              :issue='issue'
              :compareCommit='compareCommit'
              :compareUser='compareUser'
              :currentStage="currentStage"
              @edit='editIssue'
              @download='downloadFile'
              @remove='removeIssue'
            />
          </div>
        </v-sheet>
        <div v-if='filteredIssues.length === 0'>
          目前沒有任何Issue
        </div>
      </v-col>
    </v-row>
    <div class='shotBlock' v-show='snapShot'>
      <v-icon x-large color="black" style='filter: drop-shadow(0px 0px 10px rgb(30, 30, 30)); transform: scale(2)'>fa-camera<v-icon>
    </div>
  </v-main>
</template>

<style scoped>
  .pinAlert {
    position: absolute;
    left: 50%;
    display: flex;
    flex-direction: column;
    margin-left: -110px;
  }
  .viewArea, .issueW, .issueListW {
    background-color: white;
  }
  div.versionSign {
    border: 1px solid white;
    padding: 2px;
    margin: 2px;
    color: white;
    background-color: black;
  }
  .loadingItem {
    opacity: 0.5;
  }
  .loadedItem {
    opacity: 1;
  }
  .compareComp {
    width: 100%;
    position: absolute;
    top: 0px;
  }
  .compareBar {
    border-left: 2px solid #707070;
    position: absolute;
    top: 0px;
    left: 0px;
    display: flex;
    align-items: center;
  }
  .compareBtn {
    cursor: grab;
    top: 10vh;
    position: absolute;
    left: -18px;
  }
  .dragBanner {
    position: absolute;
    border: 2px solid white;
    padding: 10px;
    top: 30px;
    background-color: rgba(0, 0, 0, 0.7);
    display: none;
    z-index: 1000;
    color: white;
    font-size: 2em;
  }
  .previewArea {
    max-width: 100%;
    outline: none;
    text-decoration: none;
    position: relative;
    white-space: normal;
  }
  .hidePlayer {
    display: none !important;
  }
  .shotBlock{
    animation:cameraShotAnmi ease-in 1s infinite;
    width: 100%;
    height: 100%;
    position: fixed;
    background-color: white;
    top: 0px;
    left: 0px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-self:center;
  }

  @keyframes cameraShotAnmi{
    0% {
      opacity:0.0;
    }
    30% {
      opacity:0.3;
    }
    50% {
      opacity:1.0;
    }
    60% {
      opacity:0.6;
    }
    90% {
      opacity:1;
    }
    100% {
      opacity:0;
    }
  }
</style>

<script>
// @ is an alias to /src
import Vue from 'vue';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas, faVideo } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import moment from 'moment';
import momentDurationFormatSetup from 'moment-duration-format';
import videojs from 'video.js';
import _ from 'lodash';
import 'video.js/dist/video-js.css';
//import TurndownService from 'turndown';
import marked from 'marked';
import { v4 as uuidv4 } from 'uuid';
import '@fortawesome/fontawesome-free/css/all.css';
import { TiptapVuetify, Bold, Italic, Strike, Underline, Code, Paragraph, BulletList, OrderedList, ListItem, Link, HardBreak, History } from 'tiptap-vuetify';
import 'tiptap-vuetify/dist/main.css';
import prettyBytes from 'pretty-bytes';
import axios from 'axios';
import JSZip from 'jszip';
import mime from 'mime-types';
import Paintable from 'vue-paintable';
import * as htmlToImage from 'html-to-image';
import IssueView from './modules/IssueView.vue';
import IssueList from './modules/IssueList.vue';

let files = [];

momentDurationFormatSetup(moment);
library.add(fas, faVideo);
Vue.component('font-awesome-icon', FontAwesomeIcon);
Vue.use(Paintable);

export default {
  name: 'videoReview',
  components: { TiptapVuetify, IssueView, IssueList },
  methods: {
    filterColor: function (type) {
      if(type === 'time') {
        if(this.issueFilter.time) {
          return 'red accent-4';
        } else {
          return 'light-blue darken-4';
        }
      }
      if(type === 'commit') {
        if(this.issueFilter.commit) {
          return 'red accent-4';
        } else {
          return 'light-blue darken-4';
        }
      }
      if(type === 'user') {
        if(this.compareUser.tick > 0) {
          return 'red accent-4';
        } else {
          return 'light-blue darken-4';
        }
      }
      if(type === 'flag') {
        if(this.issueFilter.flag) {
          return 'red accent-4';
        } else {
          return 'light-blue darken-4';
        }
      }
      if(type === 'closed') {
        if(this.issueFilter.closed) {
          return 'red accent-4';
        } else {
          return 'light-blue darken-4';
        }
      }
      if(type === 'all') {
        if(this.issueFilter.flag || this.compareUser.tick > 0 || this.issueFilter.time || this.issueFilter.closed || this.issueFilter.commit) {
          return 'red accent-4';
        } else {
          return 'light-blue darken-4';
        }
      }
    },
    endPinMode: function () {
      this.pinMode = false;
      Vue.nextTick(() => {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      });
    },
    scrollEvent: function () {
      let top = (this.$refs.previewArea.getBoundingClientRect().top - 64);
      if(top < 10) {
        this.pinMode = true;
      }
    },
    citetoIssue: async function () {
      let oriobj = this;
      let activeCanvas = document.getElementsByClassName("canvas back active");
      if(activeCanvas.length > 0) {
        let active = activeCanvas[0];
        let canvas = document.createElement('canvas');
        canvas.height = active.height;
        canvas.width = active.width;
        canvas.getContext('2d').drawImage(this.$refs.paintBase, 0, 0);
        canvas.getContext('2d').drawImage(active, 0, 0);
        canvas.toBlob(function(blob) {
          oriobj.issueCite = blob;
        });
        this.paintW = false;
      }
    },
    undoCanvas: function () {
      this.$refs.paintable.undoDrawingStep();
    },
    redoCanvas: function () {
      this.$refs.paintable.redoDrawingStep();
    },
    clearCanvas: function () {
      this.$refs.paintable.clearCanvas();
    },
    fileiconConvert: function (name) {
      let type = mime.lookup(name);
      if(type.indexOf("image") > -1) {
        return "fas fa-file-image";
      }
      if(type.indexOf('msword') > -1 || type.indexOf('vnd.openxmlformats-officedocument.wordprocessingml.document') > -1) {
        return "fas fa-file-word";
      }
      if(type.indexOf('excel') > -1 || type.indexOf('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') > -1) {
        return "fas fa-file-excel";
      }
      if(type.indexOf('powerpoint') > -1 || type.indexOf('vnd.openxmlformats-officedocument.presentationml.presentation') > -1) {
        return "fas fa-file-powerpoint";
      }
      if(type.indexOf('video') > -1) {
        return "fas fa-file-video";
      }
      return "fas fa-file";
    },
    viewObjConvert: function () {
      return this.selectedObjective === undefined ? {
        icon: 'fa-comment',
        msg: '檢視這個目標相關的Issue'
      } : {
        icon: 'fa-comments',
        msg: '檢視全部的Issue'
      }
    },
    viewObjective: function (data) {
      if(this.selectedObjective === undefined) {
        this.selectedObjective = data;
        this.$emit('toastPop', '進入篩選特定目標的Issue模式，如果你想看到全部的Issue請關閉本模式');
      } else {
        this.selectedObjective = undefined;
        this.$emit('toastPop', '回復到Issue正常顯示模式');
      }
    },
    setObjective: function (data) {
      this.$emit('toastPop', '更新目標狀態中...');
      this.$socket.client.emit('setObjective', {
        OID: data,
        KB: this.currentKB._id,
        stage: this.currentStage._id
      });
    },
    dateobjConvert: function (date) {
      return moment(date).format('YYYY/MM/DD HH:mm:ss');
    },
    acceptStage: function () {
      this.$socket.client.emit('acceptStage', this.currentKB._id);
    },
    starConvert: function (data) {
      return data.star ? 'far fa-star' : 'fas fa-star';
    },
    extraZipfile: function (file) {
      let oriobj = this;
      file.async("blob").then((blob) => {
        let downloadLink = document.createElement('a');
        downloadLink.href = window.URL.createObjectURL(blob);
        downloadLink.download = oriobj.currentKB.title + '/' + oriobj.currentVersion._id + '-' + file.name;
        downloadLink.click();
      });
    },
    captureDOM: function (type) {
      this.snapShot = true;
      let oriobj = this;
      let DOM = type === 0 ? this.$refs.currentPlayer : this.$refs.previousPlayer;
      let version = type === 0 ? this.dateConvert(this.currentVersion.tick) : this.dateConvert(this.previousVersion.tick);
      let pos = type === 0 ? this.currentPos : this.previousPos;
      Vue.nextTick(() => {
        let canvas = document.createElement('canvas');
        canvas.width = DOM.clientWidth;
        canvas.height = DOM.clientHeight;
        canvas.getContext('2d').drawImage(DOM, 0, 0, canvas.width, canvas.height);
        let img = canvas.toDataURL('image/png');
        let downloadLink = document.createElement('a');
        downloadLink.href = img;
        downloadLink.download = oriobj.currentKB.title + '(' + version + '/ min ' + Math.floor(pos) + ').png';
        downloadLink.click();
      });
    },
    socketrequestissueSlice: function (data) {
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
        oriobj.$socket.client.emit('sendissueFile', {
          uid: files[data.uuid]._id,
          uuid: data.uuid,
          name: files[data.uuid].file.name,
          type: files[data.uuid].file.type,
          size: files[data.uuid].file.size,
          data: arrayBuffer
        });
      };
    },
    socketissuefileDeleteError: function (data) {
      this.$emit('toastPop', '刪除檔案失敗（原因：' + data + '），請聯絡管理員');
      this.uploadprogress = 0;
      this.uploadstatus = '';
    },
    socketissueFileUploadError: function (data) {
      this.$emit('toastPop', '上傳失敗（原因：' + data + '），請聯絡管理員');
      this.uploadprogress = 0;
      this.uploadstatus = '';
    },
    socketremoveIssue: function () {
      this.$emit('toastPop', 'Issue刪除完成！');
      this.issueListW = false;
      this.issueW = false;
      this.filteredListW = true;
    },
    socketgetissueAttachment: function (data) {
      this.issue.attachments = data;
    },
    socketissueFileUploadDone: function (data) {
      let oriobj = this;
      if (data === this.issue._id) {
        this.$socket.client.emit('getissueAttachment', data);
        this.issueFile = undefined;
        this.uploadprogress = 100;
        this.uploadstatus = '完成！';
        Vue.nextTick(() => {
          oriobj.uploadprogress = 0;
          oriobj.uploadstatus = '';
        });
      }
    },
    socketgetissueList: function (data) {
      this.$emit('timerOn', false);
      this.$emit('toastPop', 'Issue列表更新完成');
      let item = _.find(this.loadingItems, { icon: 'fa-comments' });
      item.loaded = true;
      this.histroyListPopulated = true;
      this.issueList = data;
      let loaded = _.find(this.loadingItems, { loaded: false });
      if(loaded === undefined) {
        this.loadW = false;
        if(this.firstRun) { 
          this.detectAuth();
        }
      }
    },
    socketsetIssue: function (data) {
      if(data) {
        this.issue._id = undefined;
        this.issue.position = 0;
        this.issue.title = '';
        this.issue.body = '';
        this.issue.attachments = [];
        this.issue.parent = undefined;
        this.issueW = false;
        this.filteredListW = true;
      }
    },
    socketaddIssue: function (data) {
      if(this.currentPlayer) {
        this.currentPlayer.pause();
      }
      this.issue._id = data._id;
      this.issue.position = 0;
      this.issue.title = '';
      this.issue.body = '';
      this.issue.attachments = [];
      this.issue.parent = data.parent;
      this.issueW = true;
      this.issueListW = false;
      this.filteredListW = false;
    },
    socketeditIssue: function (data) {
      this.issue._id = data._id;
      this.issue.title = data.title;
      this.issue.body = this.HTMLConverter(data.body);
      this.issue.attachments = data.attachments;
      this.issue.parent = data.parent;
      this.issueW = true;
      this.issueListW = false;
      this.filteredListW = false;
    },
    socketgetsiteAdminUsers: function (data) {
      this.userList = data;
    },
    taguserConvert: function (tags, issue) {
      let found = false;
      for(let i=0; i<tags.length; i++) {
        let tag = tags[i];
        if(tag === 'PM') {
          found = this.currentStage.isPM;
        }
        if(tag === 'reviewer') {
          found = this.currentStage.isReviewer;
        }
        if(tag === 'vendor') {
          found = this.currentStage.isVendor;
        }
        if(tag === 'writer') {
          found = this.currentStage.isWriter;
        }
        if(tag === 'final') {
          found = this.currentStage.isFinal;
        }
        if(found) {
          break;
        }
      }
      if(issue) {
        if(!found) {
          found = issue.user === this.currentUser._id;
        }
      }
      return found;
    },
    editIssue: function (issue) {
      this.$socket.client.emit('editIssue', issue._id);
    },
    removeIssue: function (issue) {
      this.$socket.client.emit('removeIssue', issue._id);
    },
    addIssue: function (parent) {
      if(this.currentPlayer) {
        this.$emit('toastPop', '發送Issue中，撥放器已暫停');
        this.currentPlayer.pause();
      }
      let temp = {};
      temp.parent = !('_id' in parent) ? undefined : parent._id;
      temp.objective = !('objective' in parent) ? undefined : parent.objective;
      temp.position = this.currentPos;
      temp.KB = this.currentKB._id;
      temp.version = this.currentVersion._id === '' ? undefined : this.currentVersion._id;
      this.$socket.client.emit('addIssue', temp);
    },
    setIssue: function () {
      this.$socket.client.emit('setIssue', this.issue);
    },
    getIssue: function (issue) {
      this.issuePointer = issue._id;
      this.issueListW = true;
      this.filteredListW = false;
      if('_id' in issue.version) {
        if(issue.version._id === this.currentVersion._id) {
          if(issue.version.type.indexOf('zip') === -1) {
            this.currentPlayer.currentTime(issue.position);
            this.currentPlayer.pause();
          }
        } else {
          this.previousVersion = issue.version;
          if(issue.version.type.indexOf('zip') === -1) {
            this.previousGoto = this.issue.position;
          }
        }
      }
    },
    dateConvert: function (time) {
      return time === 0 ? '尚未設定' : moment.unix(time).format('YYYY/MM/DD HH:mm:ss');
    },
    HTMLConverter: function (msg) {
      msg = msg === null || msg == undefined ? '**test**' : msg;
      return marked(msg);
    },
    filenameConvert: function (file) {
      let str = file.name;
      str += file.status !== 1 ? '(暫不可用)' : '';
      str += prettyBytes(file.size);
      return str;
    },
    byteConvert: function (size) {
      return prettyBytes(size);
    },
    deleteIssueFile: function (file) {
      this.$socket.client.emit('deleteIssueFile', {
        fileID: file._id,
        issueID: this.issue._id
      });
    },
    tipConvert: function () {
      return this.tipW ? '隱藏寫作指引' : '查看寫作指引';
    },
    statusConvert: function () {
      if(this.issuesInView.main.status) {
        return {
          icon: 'far fa-comment',
          msg: '恢復討論'
        }
      } else {
        return {
          icon: 'fas fa-comment-slash',
          msg: '關閉討論'
        }
      }
    },
    setStar: function () {
      this.$socket.client.emit('setissueStar', this.issuesInView.main._id);
    },
    setStatus: function () {
      this.$socket.client.emit('setissueStatus', this.issuesInView.main._id);
    },
    downloadFile: function (file) {
      if (file.status === 1) {
        let element = document.createElement('a');
        element.setAttribute('href', this.siteSettings.siteLocation + '/storages/' + file._id);
        element.setAttribute('download', file.name);
        element.click();
      }
    },
    loadVersion: function (item) {
      this.previousVersion = item;
    },
    detectAuth: function () {
      if(this.currentUser._id !== '') {
        this.currentStage.isPM = false;
        this.currentStage.isWriter = false;
        this.currentStage.isVendor = false;
        this.currentStage.isFinal = false;
        this.currentStage.isReviewer = false;
        for(let i=0; i<this.currentUser.tags.length; i++) {
          let userTag = this.currentUser.tags[i]._id;
          if(!this.currentStage.isPM) {
            this.currentStage.isPM = _.includes(this.currentStage.pmTags, userTag);
          }
          if(!this.currentStage.isFinal) {
            this.currentStage.isFinal = _.includes(this.currentStage.finalTags, userTag);
          }
          if(!this.currentStage.isReviewer) {
            this.currentStage.isReviewer = _.includes(this.currentStage.reviewerTags, userTag);
          }
          if(!this.currentStage.isWriter) {
            this.currentStage.isWriter = _.includes(this.currentStage.writerTags, userTag);
          }
          if(!this.currentStage.isVendor) {
            this.currentStage.isVendor = _.includes(this.currentStage.vendorTags, userTag);
          }
        }
        if(this.firstRun) {
          this.progressW = true;
          this.firstRun = false;
        }
      }
    },
    checkDrag: function (event) {
      let clientX = event.type.includes('touch') ? event.touches[0].clientX : event.clientX;
      let currentComparePos = ((clientX - this.$refs.currentPlayerArea.offsetLeft) / this.$refs.currentPlayerArea.clientWidth) * 100;
      currentComparePos = currentComparePos < 0 ? 0 : currentComparePos > 100 ? 100 : currentComparePos;
      let reverseComparePos = 100 - currentComparePos;
      this.$refs.previousPlayerArea.style.clipPath = 'inset( 0 0 0 ' + currentComparePos + '% )';
      this.$refs.currentPlayerArea.style.clipPath = 'inset( 0 ' + reverseComparePos + '% 0 0 )';
      this.$refs.compareBar.style.left = currentComparePos + '%';
      let banners = document.querySelectorAll('.dragBanner');
      if (event.type === 'drag' || event.type === 'touchmove') {
        banners.forEach((element) => {
          element.style.display = 'block';
        });
      } else {
        banners.forEach((element) => {
          element.style.display = 'none';
        });
      }
    },
    increasePlaybackrate: function (type) {
      let player = type === 0 ? this.currentPlayer : this.previousPlayer;
      this.playbackrate = this.playbackrate < 1.5 ? this.playbackrate + 0.5 : 2;
      player.playbackRate(this.playbackrate);
    },
    decreasePlaybackrate: function (type) {
      let player = type === 0 ? this.currentPlayer : this.previousPlayer;
      this.playbackrate = this.playbackrate > -1.5 ? this.playbackrate - 0.5 : -2;
      player.playbackRate(this.playbackrate);
    },
    playVideo: function (type) {
      let player = type === 0 ? this.currentPlayer : this.previousPlayer;
      player.play();
    },
    pauseVideo: function (type) {
      let player = type === 0 ? this.currentPlayer : this.previousPlayer;
      if (player.paused()) {
        player.currentTime(0);
      } else {
        player.pause();
      }
    },
    timeConvert: function (time) {
      return moment.duration(time, 'second').format('mm分ss秒SS');
    },
    versionConvert: function (version) {
      if(this.currentVersion._id !== '') {
        if('_id' in version) {
          return version._id === this.currentVersion._id ? '當前Commit' : '舊Commit';
        } else {
          return '無Commit';
        }
      } else {
        return '尚無當前Commit'
      }
    },
    historyConvert: function (version) {
      if(this.currentVersion._id !== '') {
        return version._id === this.previousVersion._id ? '對照Commit' : this.versionConvert(version);
      } else {
        return '尚無當前Commit'
      }
    },
    editorConvert: function (dialog) {
      dialog = [...dialog].sort((a, b) => {
        return a.tick - b.tick;
      });
      return dialog[0].name;
    },
    extendIssue: function () {
      if (this.videoWidth === 3) {
        this.videoWidth = 9;
        this.controlWidth = 3;
        this.extendWord = '縮小Issue區';
        this.largeBtn = true;
      } else {
        this.videoWidth = 3;
        this.controlWidth = 9;
        this.extendWord = '放大Issue區';
        this.largeBtn = false;
      }
    },
    socketgetKB: function (data) {
      if(data._id === this.currentKB._id || this.firstRun) {
        this.$emit('timerOn', false);
        this.$emit('toastPop', '知識點更新完成');
        this.currentKB = data;
        this.currentKB.currentStep = (_.countBy(this.currentKB.stages, {
          current: false
        })) === this.currentKB.stages.length ? 0 : (_.findIndex(this.currentKB.stages, {
          current: true
        })) + 1 ;
        let currentStage = this.currentKB.currentStep === 0 ? this.currentKB.stages[this.currentKB.currentStep] : this.currentKB.stages[this.currentKB.currentStep - 1];
        let item = _.find(this.loadingItems, { icon: 'fa-photo-video' });
        item.loaded = true;
        this.$emit('viewIn', {
          text: '影片審查-' + data.title,
          icon: 'fa-photo-video',
          module: '審查模組',
          location: '/viewReview/' + this.KBid
        });
        this.$socket.client.emit('getStage', currentStage._id);
        this.$socket.client.emit('getKBVersions', data._id);
        this.$socket.client.emit('getissueList', this.KBid);
      }
    },
    sockgetKBVersions: function (data) {
      this.versionPopulated = true;
      this.currentVersions = data;
      if(data.length === 0) {
        this.tipW = true;
      }
      let item = _.find(this.loadingItems, { icon: 'fa-code-branch' });
      item.loaded = true;
      let loaded = _.find(this.loadingItems, { loaded: false });
      if(loaded === undefined) {
        this.loadW = false;
      }
    },
    authClass: function (item) {
      return item.loaded ? 'd-flex flex-column loadedItem' : 'd-flex flex-column loadingItem';
    },
    objectiveWConvert: function () {
      return this.objectiveW ? {
        icon: 'far fa-flag',
        msg: '隱藏階段目標'
      } : {
        icon: 'fas fa-flag',
        msg: '顯示階段目標'
      }
    },
    objectiveConvert: function (data) {
      return 'signUser' in data ? {
        icon: 'fas fa-flag',
        msg: '標記為未完成'
      } : {
        icon: 'far fa-flag',
        msg: '標記為完成'
      }
    },
    updateKBTag: function (value) {
      this.currentKB.tag = value;
    },
    plusTag: function (val) {
      this.$socket.client.emit('addTag', val);
    },
    loadcurrentVideo: function () {
      let oriobj = this;
      this.currentPlayer = videojs(this.$refs.currentPlayer, this.videoOptions, function onPlayerReady () {
        this.src({
          type: oriobj.currentVersion.type,
          src: oriobj.siteSettings.siteLocation + '/storages/' + oriobj.currentVersion._id
        });
        this.on('timeupdate', function () {
          oriobj.currentPos = this.currentTime();
        });
        this.on('playing', function () {
          oriobj.tipword = '提示：影片開始撥放時，右側issue區塊會同步展開當前時間對應的issue';
        });
      });
    },
    loadpreviousVideo: function () {
      let oriobj = this;
      this.previousPlayer = videojs(this.$refs.previousPlayer, this.videoOptions, function onPlayerReady () {
        this.src({
          type: oriobj.previousVersion.type,
          src: oriobj.siteSettings.siteLocation + '/storages/' + oriobj.previousVersion._id
        });
        this.on('loadedmetadata', function () {
          let compareComps = document.getElementsByClassName('compareComp');
          let barHeight = 0;
          if(compareComps.length > 1) {
            barHeight = compareComps[0].clientHeight > compareComps[1].clientHeight ? compareComps[0].clientHeight : compareComps[1].clientHeight;
          }
          oriobj.$refs.compareBar.style.height = barHeight + 'px';
          oriobj.$refs.compareBar.style.left = '50%';
          oriobj.$refs.previousPlayerArea.style.clipPath = 'inset( 0 0 0 50% )';
          oriobj.$refs.currentPlayerArea.style.clipPath = 'inset( 0 50% 0 0 )';
          if(oriobj.previousGoto !== 0) {
            oriobj.previousPlayer.currentTime(oriobj.previousGoto);
            oriobj.previousPlayer.pause();
          }
        });
        this.on('timeupdate', function () {
          oriobj.previousPos = this.currentTime();
        });
      });
    },
    sockgetStage: function (data) {
      if(data._id === this.currentStage._id || this.firstRun) {
        this.currentStage = data;
        this.$emit('timerOn', false);
        this.$emit('toastPop', '當前階段更新完成');
        let item = _.find(this.loadingItems, { icon: 'fa-stopwatch' });
        item.loaded = true;
        let loaded = _.find(this.loadingItems, { loaded: false });
        if(loaded === undefined) {
          this.loadW = false;
          this.detectAuth();
        }
      }
    },
    resetStage: function () {
      this.currentStage = {
        _id: '',
        current: false,
        name: '',
        dueTick: 0,
        dueTime: '00:00:00',
        dueDate: '1970-01-01',
        pmTags: [],
        reviewerTags: [],
        vendorTags: [],
        writerTags: [],
        finalTags: [],
        objectives: []
      };
    },
    snapshotPaint: async function (data) {
      this.$emit("toastPop", "螢幕截圖中，請稍後...");
      this.snapShot = true;
      let oriobj = this;
      let DOM = null;
      let img = new Image();
      let isVideo = false;
      let canvasHeight = 0;
      let canvasOffsetTop = 0;
      let canvasWidth = 0;
      Vue.nextTick(async () => {
        if(data === 0) {
          if(oriobj.currentPlayer) {
            DOM = oriobj.$refs.currentPlayer;
            isVideo = true;
          } else {
            DOM = oriobj.$refs.currentZip.$el;
          }
        } else {
          if(oriobj.previousPlayer) {
            DOM = oriobj.$refs.previousPlayer;
            isVideo = true;
          } else {
            DOM = oriobj.$refs.previousZip.$el;
          }
        }
        canvasWidth = DOM.clientWidth;
        img.width = DOM.clientWidth;
        img.height = DOM.clientHeight;
        if(isVideo) {
          let canvas = document.createElement('canvas');
          canvasHeight = DOM.clientHeight;
          canvas.width = canvasWidth;
          canvas.height = canvasHeight;
          canvas.getContext('2d').drawImage(DOM, 0, 0, canvas.width, canvas.height);
          img.src = canvas.toDataURL('image/png');
        } else {
          canvasHeight = DOM.clientHeight > window.innerHeight ? window.innerHeight : DOM.clientHeight;
          canvasOffsetTop = DOM.getBoundingClientRect().top < 0 ? DOM.getBoundingClientRect().top : 0;
          img.src = await htmlToImage.toPng(DOM);
        }
        oriobj.paintWidth = canvasWidth;
        oriobj.paintHeight = canvasHeight;
        oriobj.paintW = true;
        Vue.nextTick(() => {
          oriobj.$refs.paintable.clearCanvas();
          oriobj.$refs.paintBase.height = canvasHeight;
          oriobj.$refs.paintBase.width = canvasWidth;
          oriobj.$refs.paintBase.getContext('2d').drawImage(img, 0, canvasOffsetTop, canvasWidth, canvasHeight, 0, 0, canvasWidth, canvasHeight);
          oriobj.$emit("toastPop", "螢幕截圖完成，請開始標記");
          oriobj.snapShot = false;
        });
      });
    }
  },
  beforeDestroy () {
    if (this.currentPlayer) {
        this.currentPlayer.dispose();
        this.previousPlayer.dispose();
    }
    this.$socket.client.off('getsiteAdminUsers', this.socketgetsiteAdminUsers);
    this.$socket.client.off('editIssue', this.socketeditIssue);
    this.$socket.client.off('addIssue', this.socketaddIssue);
    this.$socket.client.off('setIssue', this.socketsetIssue);
    this.$socket.client.off('getissueList', this.socketgetissueList);
    this.$socket.client.off('issueFileUploadDone', this.socketissueFileUploadDone);
    this.$socket.client.off('getissueAttachment', this.socketgetissueAttachment);
    this.$socket.client.off('removeIssue', this.socketremoveIssue);
    this.$socket.client.off('issueFileUploadError', this.socketissueFileUploadError);
    this.$socket.client.off('issueFileDeleteError', this.socketissuefileDeleteError);
    this.$socket.client.off('requestissueSlice', this.socketrequestissueSlice);
    this.$socket.client.off('getKB', this.socketgetKB);
    this.$socket.client.off('getKBVersions', this.sockgetKBVersions);
    this.$socket.client.off('getStage', this.sockgetStage);
    this.$socket.client.emit('leaveKBEditing', this.KBid);
    window.removeEventListener('scroll', this.scrollEvent);
  },
  created () {
    this.$socket.client.emit('getKB', this.KBid);
    this.$socket.client.emit('joinKBEditing', this.KBid);
    this.$socket.client.on('getsiteAdminUsers', this.socketgetsiteAdminUsers);
    this.$socket.client.on('editIssue', this.socketeditIssue);
    this.$socket.client.on('addIssue', this.socketaddIssue);
    this.$socket.client.on('setIssue', this.socketsetIssue);
    this.$socket.client.on('getissueList', this.socketgetissueList);
    this.$socket.client.on('issueFileUploadDone', this.socketissueFileUploadDone);
    this.$socket.client.on('getissueAttachment', this.socketgetissueAttachment);
    this.$socket.client.on('removeIssue', this.socketremoveIssue);
    this.$socket.client.on('issueFileUploadError', this.socketissueFileUploadError);
    this.$socket.client.on('issueFileDeleteError', this.socketissuefileDeleteError);
    this.$socket.client.on('requestissueSlice', this.socketrequestissueSlice);
    this.$socket.client.on('getKB', this.socketgetKB);
    this.$socket.client.on('getKBVersions', this.sockgetKBVersions);
    this.$socket.client.on('getStage', this.sockgetStage);
    window.addEventListener('scroll', this.scrollEvent);
  },
  computed: {
    issuesInView: function () {
      let oriobj = this;
      let mainThread = _.find(this.issueList, (issue) => {
                        return issue._id === oriobj.issuePointer;
                      });
      if(mainThread !== undefined) {
        return {
          main: mainThread,
          collections: _.sortBy(_.filter(this.issueList, (issue) => {
                        return issue.parent === oriobj.issuePointer;
                      }), ['tick'])
        };
      }
      return {
        main: {
          title: '',
          body: '**test**',
          user: {
            types: 'bottts',
            name: 'test',
            unit: 'test'
          },
          attachments: [],
          star: false,
          status: false,
          version: {}
        },
        collections: [
            {
            title: '',
            body: '**test**',
            user:
            {
              types: 'bottts',
              name: 'test',
              unit: 'test'
            },
            attachments: [],
            star: false,
            status: false,
            version: {}
          }
        ]
      };
    },
    statistics: function () {
      return {
        closedIssue: (_.filter(this.issueList, (item) => {
                      return item.status
                    })).length,
        openIssue: _.filter(this.issueList, (item) => {
                      return !item.status
                    }).length,
        finishObj: _.filter(this.currentStage.objectives, (item) => {
                      return ('signUser' in item)
                    }).length,
        unfinishObj: _.filter(this.currentStage.objectives, (item) => {
                      return !('signUser' in item)
                    }).length,
      }
    },
    currentUser: function () {
      return this.$store.state.currentUser;
    },
    savedTags: function () {
      return this.$store.state.savedTags;
    },
    siteSettings: function () {
      return this.$store.state.siteSettings;
    },
    filteredIssues: function () {
      let oriobj = this;
      let obj = this.selectedObjective;
      let filterList = _.filter(this.issueList, (issue) => {
        return !('parent' in issue) || issue.parent === undefined;
      });
      if(obj !== undefined) {
        filterList = _.filter(filterList, (issue) => {
          return issue.objectives === obj;
        });
      } else {
        if(this.compareCommit.tick > 0) {
          if(this.issueFilter.commit) {
            filterList = _.filter(filterList, (issue) => {
              if('_id' in issue.version) {
                return issue.version._id === oriobj.compareCommit._id;
              } else {
                return false;
              }
            });
          }
        }
        filterList = _.filter(filterList, (issue) => {
          if(!('parent' in issue) || issue.parent === undefined) {
            if(oriobj.issueFilter.flag) {
              if(issue.position === 0) { return true; }
            }
            if(oriobj.issueFilter.time) {
              return _.inRange(issue.position, Math.floor(oriobj.currentPos) - 0.01, Math.ceil(oriobj.currentPos) + 0.01);
            } else {
              return true;
            }
          }
          return false;
        });
        if(!this.issueFilter.closed) {
          filterList = _.filter(filterList, (issue) => {
            return !issue.status;
          });
        }
      }
      return _.orderBy(filterList, ['star', 'status', 'position', 'version.tick'], ['desc', 'asc', 'desc', 'desc']);
    },
    currentPosD: function () {
      return this.timeConvert(this.currentPos);
    },
    substringTitle: function (data) {
      return data === undefined ? '' : data.substring(0, 10);
    },
    currentVersion: function () {
      if(this.currentVersions.length > 0) {
        return _.head(this.currentVersions);
      } else {
        return {
          _id: '',
          type: '',
          name: ''
        };
      }
    }
  },
  watch: {
    pinMode: function () {
      let oriobj = this;
      if(this.pinMode) {
        Vue.nextTick(() => {
          oriobj.$refs.viewArea.style.left = oriobj.$refs.viewArea.getBoundingClientRect().left + 'px';
          oriobj.$refs.viewArea.style.width = oriobj.$refs.viewArea.clientWidth + 'px';
          oriobj.$refs.viewArea.style.top = '70px';
          oriobj.$refs.viewArea.style.height = '90vh';
          oriobj.$refs.viewArea.style.overflowY = 'scroll';
          oriobj.$refs.viewArea.style.position = 'fixed';
          oriobj.$refs.issueW.$el.style.left = oriobj.$refs.issueArea.getBoundingClientRect().left + 'px';
          oriobj.$refs.issueW.$el.style.width = oriobj.$refs.issueArea.clientWidth + 'px';
          oriobj.$refs.issueW.$el.style.top = '70px';
          oriobj.$refs.issueW.$el.style.height = '90vh';
          oriobj.$refs.issueW.$el.style.overflowY = 'scroll';
          oriobj.$refs.issueW.$el.style.position = 'fixed';
          oriobj.$refs.issueListW.$el.style.left = oriobj.$refs.issueArea.getBoundingClientRect().left + 'px';
          oriobj.$refs.issueListW.$el.style.width = oriobj.$refs.issueArea.clientWidth + 'px';
          oriobj.$refs.issueListW.$el.style.top = '70px';
          oriobj.$refs.issueListW.$el.style.height = '90vh';
          oriobj.$refs.issueListW.$el.style.overflowY = 'scroll';
          oriobj.$refs.issueListW.$el.style.position = 'fixed';
        });
      } else {
        Vue.nextTick(() => {
          oriobj.$refs.viewArea.style.position = 'relative';
          oriobj.$refs.viewArea.style.left = '';
          oriobj.$refs.viewArea.style.top = '';
          oriobj.$refs.viewArea.style.height = '';
          oriobj.$refs.viewArea.style.width = '';
          oriobj.$refs.viewArea.style.overflowY = '';
          oriobj.$refs.issueW.$el.style.left = '';
          oriobj.$refs.issueW.$el.style.width = '';
          oriobj.$refs.issueW.$el.style.top = '';
          oriobj.$refs.issueW.$el.style.height = '';
          oriobj.$refs.issueW.$el.style.overflowY = '';
          oriobj.$refs.issueW.$el.style.position = 'relative';
          oriobj.$refs.issueListW.$el.style.left = '';
          oriobj.$refs.issueListW.$el.style.width = '';
          oriobj.$refs.issueListW.$el.style.top = '';
          oriobj.$refs.issueListW.$el.style.height = '';
          oriobj.$refs.issueListW.$el.style.overflowY = '';
          oriobj.$refs.issueListW.$el.style.position = 'relative';
        });
      }
    },
    currentVersion: {
      immediate: true,
      async handler () {
        let oriobj = this;
        if(this.currentVersion !== null) {
          if(this.currentVersion._id !== '') {
            this.previousVersion = this.currentVersion;
            this.cZip = !(this.currentVersion.type.indexOf('zip') === -1);
            if(this.currentVersion.type.indexOf('zip') === -1) {
              if(this.currentPlayer === null || this.currentPlayer === undefined) {
                Vue.nextTick(() => {
                  oriobj.loadcurrentVideo();
                });
              } else {
                this.currentPlayer.src = this.siteSettings.siteLocation + '/storages/' + this.previousVersion._id;
                this.currentPlayer.type = this.previousVersion.type;
              }
            } else {
              let result = await axios.get('/storages/' + this.currentVersion._id, { responseType: 'blob' });
              let zipFile = new JSZip();
              zipFile.loadAsync(result.data)
              .then(async(zip) => {
                oriobj.currentZip = [];
                zip.forEach((relativePath, zipEntry) => {
                  oriobj.currentZip.push({
                    file: zipEntry,
                    id: uuidv4()
                  });
                });
              });
            }
          }
        }
      }
    },
    previousVersion: {
      immediate: true,
      async handler () {
        let oriobj = this;
        if(this.previousVersion !== null) {
          if(this.previousVersion._id !== '') {
            this.pZip = !(this.previousVersion.type.indexOf('zip') === -1);
            if(this.previousVersion.type.indexOf('zip') === -1) {
              if(this.previousPlayer === null || this.previousPlayer === undefined) {
                Vue.nextTick(() => {
                  oriobj.loadpreviousVideo();
                });
              } else {
                this.previousPlayer.src = this.siteSettings.siteLocation + '/storages/' + this.previousVersion._id;
                this.previousPlayer.type = this.previousVersion.type;
              }
            } else {
              if(this.previousPlayer) {
                this.previousPlayer.dispose();
                this.previousPlayer = null;
              }
              let result = await axios.get('/storages/' + this.previousVersion._id, { responseType: 'blob' });
              let zipFile = new JSZip();
              zipFile.loadAsync(result.data)
              .then(async(zip) => {
                oriobj.previousZip = [];
                zip.forEach((relativePath, zipEntry) => {
                  oriobj.previousZip.push({
                    file: zipEntry,
                    id: uuidv4()
                  });
                });
                let compareComps = document.getElementsByClassName('compareComp');
                let barHeight = 0;
                if(compareComps.length > 1) {
                  barHeight = compareComps[0].clientHeight > compareComps[1].clientHeight ? compareComps[0].clientHeight : compareComps[1].clientHeight;
                }
                oriobj.$refs.compareBar.style.height = barHeight + 'px';
                oriobj.$refs.compareBar.style.left = '50%';
                oriobj.$refs.previousPlayerArea.style.clipPath = 'inset( 0 0 0 50% )';
                oriobj.$refs.currentPlayerArea.style.clipPath = 'inset( 0 50% 0 0 )';
              });
            }
          }
        }
      }
    },
    issueFile: {
      immediate: true,
      handler () {
        if (this.issueFile !== undefined) {
          let oriobj = this;
          let fileReader = new FileReader();
          let slice = this.issueFile.slice(0, 100000);
          let uuid = uuidv4();
          files[uuid] = {
            _id: this.issue._id,
            file: this.issueFile,
            starttick: moment().valueOf()
          };
          fileReader.readAsArrayBuffer(slice);
          fileReader.onload = () => {
              var arrayBuffer = fileReader.result;
              oriobj.$socket.client.emit('sendissueFile', {
                uid: oriobj.issue._id,
                uuid: uuid,
                name: oriobj.issueFile.name,
                type: oriobj.issueFile.type,
                size: oriobj.issueFile.size,
                data: arrayBuffer
              });
          };
        }
      }
    },
    issueCite: {
      immediate: true,
      handler () {
        if (this.issueCite !== undefined) {
          let oriobj = this;
          let fileReader = new FileReader();
          let slice = this.issueCite.slice(0, 100000);
          let uuid = uuidv4();
          this.issueCite.lastModifiedDate = new Date();
          this.issueCite.name = 'Commit:'+this.dateConvert(this.currentVersion.tick)+'時間'+this.currentPosD+'.png';
          files[uuid] = {
            _id: this.issue._id,
            file: this.issueCite,
            starttick: moment().valueOf()
          };
          fileReader.readAsArrayBuffer(slice);
          fileReader.onload = () => {
            var arrayBuffer = fileReader.result;
            oriobj.$socket.client.emit('sendissueFile', {
              uid: oriobj.issue._id,
              uuid: uuid,
              name: oriobj.issueCite.name,
              type: oriobj.issueCite.type,
              size: oriobj.issueCite.size,
              data: arrayBuffer
            });
          };
        }
      }
    },
    currentPos: function () {
    },
    versionLog: function () {
      this.versionLog.sort((a, b) => {
        return b.date - a.date;
      });
      return this.versionLog;
    },
    currentUser: function () {
      this.detectAuth();
    },
    issueList: function () {
      let parents = _.filter(this.issueList, (item) => {
        return item.parent === undefined;
      });
      for(let i=0; i<parents.length; i++) {
        let parent = parents[i];
        let children = _.sortBy(_.filter(this.issueList, (item) => {
          if(!('parent' in item) || item.parent === undefined) { return false; }
          return item.parent === parent._id;
        }), ['tick']);
        let latestTick = children.length === 0 ? parent.tick : (_.head(children)).tick;
        parent.latestTick = latestTick;
        for(let k=0; k<children.length; k++) {
          let child = children[k];
          child.latestTick = latestTick;
        }
      }
    }
  },
  props: {
    KBid: String
  },
  data () {
    return {
      commitFilterW: false,
      previousGoto: 0,
      issueFilter: {
        time: false,
        flag: true,
        closed: true,
        commit: false
      },
      snapShot: false,
      filteredListW: true,
      pinMode: false,
      cZip: true,
      pZip: true,
      issueCite: undefined,
      citeColor: '#000',
      citeEraser: false,
      paintWidth: 100,
      paintHeight: 100,
      currentStage: {
        _id: '',
        current: false,
        name: '',
        dueTick: 0,
        dueTime: '00:00:00',
        dueDate: '1970-01-01',
        pmTags: [],
        reviewerTags: [],
        vendorTags: [],
        writerTags: [],
        finalTags: [],
        objectives: [],
        isPM: false,
        isVendor: false,
        isFinal: false,
        isWriter: false,
        isReviewer: false
      },
      selectedObjective: undefined,
      largeBtn: true,
      firstRun: true,
      issueList: [],
      uploadprogress: 0,
      uploadstatus: '',
      versionPopulated: false,
      compareCommit: {
        tick: 0
      },
      compareUser: {
        tick: 0
      },
      currentVersions: [],
      loadW: true,
      loadingItems: [
        {
          loaded: false,
          text: '影片內容',
          icon: 'fa-photo-video',
          id: uuidv4()
        },
        {
          loaded: false,
          text: '流程控制',
          icon: 'fa-stopwatch',
          id: uuidv4()
        },
        {
          loaded: false,
          text: 'Commits',
          icon: 'fa-code-branch',
          id: uuidv4()
        },
        {
          loaded: false,
          text: 'Issues',
          icon: 'fa-comments',
          id: uuidv4()
        }
      ],
      paintW: false,
      objectiveW: true,
      currentZip: [],
      previousZip: [],
      previousPos: 0,
      issueFile: undefined,
      extensions: [
        History,
        Link,
        Underline,
        Strike,
        Italic,
        ListItem,
        BulletList,
        OrderedList,
        Bold,
        Code,
        Paragraph,
        HardBreak
      ],
      issueW: false,
      issue: {
        type: [],
        title: '',
        body: '',
        attachments: [],
        parent: undefined,
        _id: undefined
      },
      tipW: false,
      issuePointer: '',
      issueListW: false,
      currentKB: {
        _id: '',
        currentStep: 0,
        stages: [],
        versions: [],
        title: '',
        desc: '',
        descAtt: [],
        textbook: ''
      },
      videoWidth: 9,
      controlWidth: 3,
      previousVersion: {
        _id: '',
        type: '',
        name: ''
      },
      filterBtn: false,
      extendWord: '放大Issue區塊',
      progressW: false,
      previousPlayer: null,
      tipword: '',
      displaypanelHeight: 0,
      currentPlayer: null,
      playbackrate: 1,
      currentPos: 0,
      editlogw: false,
      issueareaWidth: 0,
      issuelistViewer: [],
      videoOptions: {
        autoplay: false,
        controls: true,
        fluid: true,
      }
    };
  }
};
</script>
