<template>
  <v-main ref='mainBlock' class='pa-0' style="width: 100% !important;">
    <v-alert outlined type="success" icon="fa-grin-wink" class='text-left' v-show="hideAlert" v-if="statistics.unfinishObj === 0">
      本階段審查指標已全部完成，請回到DashBoard，可進入下一個階段（如果你在下一個階段還有權力的話）
    </v-alert>
    <v-alert outlined type="error" icon="fa-skull" class='text-left' v-show="hideAlert" v-if="!currentStage.current">
      本階段已經是歷史了，離開吧！
    </v-alert>
    <v-alert outlined type="info" icon='fa-info-circle' class='text-left' v-show="hideAlert" v-if="currentStage.coolDown">
      本階段進入冷靜期，你只能回復既有Issue，不能開新的Issue！
    </v-alert>
    <v-dialog v-model='diffW' fullscreen hide-overlay transition='dialog-bottom-transition'>
      <v-card>
        <v-toolbar dark color='primary'>
          <v-btn icon dark @click='closeDiff'>
            <v-icon>fa-times</v-icon>
          </v-btn>
          <v-toolbar-title>Issue對比</v-toolbar-title>
        </v-toolbar>
        <v-card-text class='text-left black--text text-body-1'>
          <v-container>
            <v-row no-gutters>
              <v-col v-for='(diff, index) in diffIssues' :key='diff._id' class='d-flex flex-column pa-1 ma-1' style='border:1px solid #333'>
                <div class='text-h6 text-decoration-underline'>第{{ (index+1) }}個Issue</div>
                <div class='pa-1 text-body-1' v-html="HTMLConverter(diff.body)"></div>
              </v-col>
            </v-row>
            <v-row no-gutters>
              <v-col style='border: 1px solid black' class='pa-1 ma-1'>
                <div class='text-h6 text-decoration-underline'>對比結果，紅色代表刪除，綠色代表新增</div>
                <div class='text-body-1' v-html="HTMLConverter(diffResult)"></div>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="configW"
      persistent
      max-width="50vw"
    >
      <v-card>
        <v-toolbar
          dark
          color="primary"
        >
          <v-toolbar-title>修改審查功能的畫面預設值</v-toolbar-title>
        </v-toolbar>
        <v-card-text class='d-flex flex-column pa-0 text-left black--text text-body-1'>
          <v-alert outlined type='info' icon='fa-info-circle' class='text-left'>在這裡的設定只會保存在這台機器上，意思是你換一台電腦就看不到了</v-alert>
          <div class='d-flex flex-column pa-3 black--text'>
            <div class='text-h6'>隱藏右下角的Issue過濾器</div>
            <v-switch
              v-model="hideFilterBtns"
              label="啟動這個選項，隱藏右下角過濾器"
            ></v-switch>
            <div class='text-h6'>關閉版本對比模式</div>
            <v-switch
              v-model="disableCompareMode"
              label="啟動這個選項，關閉版本對比模式"
            ></v-switch>
            <v-switch
              v-model="disableIssueDiff"
              label="啟動這個選項，關閉Issue對照功能"
            ></v-switch>
            <div class='text-h6'>顯示區比例</div>
            <v-slider
              label='調整顯示區比例'
              min='4'
              max='8'
              v-model="videoWidth"
              thumb-label
            ></v-slider>
            <div class='d-flex flex-row'>
              <v-btn class='flex-grow-1' @click='videoWidth = 4'>一鍵放大Issue區</v-btn>
              <v-btn class='flex-grow-1' @click='videoWidth = 8'>一鍵縮小Issue區</v-btn>
            </div>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            @click='closeConfigW'
          >
            關閉對話框
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="commitFilterW"
      persistent
      max-width="50vw"
    >
      <v-card>
        <v-toolbar
          dark
          color="primary"
        >
          <v-toolbar-title>依照版本來過濾Issue</v-toolbar-title>
        </v-toolbar>
        <v-card-text class='d-flex flex-column'>
          <v-select
            v-model="compareCommit"
            hint="請選擇一個你要的版本"
            :items="currentVersions"
            label="請選擇一個你要的版本"
            persistent-hint
            return-object
            single-line
            outlined
          >
            <template slot="selection" slot-scope="data">
              <span class='text-caption'>{{ dateConvert(data.item.tick) }}版</span>
            </template>
            <template slot="item" slot-scope="data">
              <span class='text-caption'>{{ dateConvert(data.item.tick) }}版</span>
            </template>
          </v-select>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click='compareCommit = { tick: 0 }'>取消版本標記</v-btn>
          <v-btn v-if='issueFilterCommit' @click='issueFilterCommit = false'>我只是要標記，不要過濾</v-btn>
          <v-btn v-if='!issueFilterCommit' @click='issueFilterCommit = true'>啟動版本過濾</v-btn>
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
        <v-card-text class='d-flex flex-row justify-space-around flex-wrap'>
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
        <v-card-text class='pa-0 text-left black--text text-body-1'>
          <v-alert outlined type='info' icon='fa-info-circle' class='text-left'>這個對話框關閉之後，你可以在審查畫面右上角點一下i按鈕開啟</v-alert>
          <div v-if='currentKB.currentStep === 0'>專案目前沒啟動，你是怎麼到這裡的？</div>
          <div v-if='currentKB.currentStep > 0' class='pa-3'>
            <div class='text-body-1'>目前進度（階段 {{ currentKB.currentStep }} / {{ currentKB.stages.length }}）</div>
            <div class='text-h6 font-weight-medium black--text text-left'>{{ currentKB.stages[currentKB.currentStep - 1].name }}</div>
            <div class='text-body-1'>進度日期</div>
            <div class='text-h6 font-weight-medium black--text text-left d-flex flex-column'>
              <div>起：{{ dateConvert(currentKB.stages[currentKB.currentStep - 1].startTick) }}</div>
              <div>至：{{ dateConvert(currentKB.stages[currentKB.currentStep - 1].dueTick) }}</div>
            </div>
            <div class='text-body-1'>你在目前進度中的角色</div>
            <div v-if='currentStage.isPM'>
              <div class='text-h6 font-weight-medium black--text text-left'>
                專案管理者：你可以關閉／開啟任何的Issue，並且在知識點編輯器中強制改變專案進度
              </div>
            </div>
            <div v-if='currentStage.isVendor'>
              <div class='text-h6 font-weight-medium black--text text-left'>
                廠商：你可以在DashBoard中上傳知識點的版本，並且回復Issue
              </div>
            </div>
            <div v-if='currentStage.isWriter'>
              <div class='text-h6 font-weight-medium black--text text-left'>
                寫手：你可以開啟Issue，上傳腳本，並回復Issue
              </div>
            </div>
            <div v-if='currentStage.isReviewer'>
              <div class='text-h6 font-weight-medium black--text text-left'>
                審查者：你可以開啟／關閉Issue，並且決定本階段是否結束
              </div>
            </div>
            <div v-if='currentStage.isFinal'>
              <div class='text-h6 font-weight-medium black--text text-left'>
                行政組：你只能看Issue，並在DashBoard中匯出專案統計
              </div>
            </div>
          </div>
        </v-card-text>
        <v-card-actions class='d-flex flex-row justify-end'>
          <v-spacer>
          </v-spacer>
          <v-btn
            color='indigo darken-4'
            class='white--text ma-1'
            @click="configW = true"
          >
            修改審查功能的畫面預設值
          </v-btn>
          <v-btn
            color='red accent-4'
            class='white--text ma-1'
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
        <v-card-text class='text-left black--text text-body-1'>
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
                  <v-btn :disabled='historyConvert(item) !== "舊版"' @click='loadVersion(item)'>{{ historyConvert(item) }}</v-btn>
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
          <v-toolbar-title>標記修改重點（已開啟繪圖模式，請在圖上畫記）</v-toolbar-title>
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
            <v-icon color="#2C7AD6">fa-square</v-icon>
          </v-btn>
          <v-btn
            icon
            @click='citeColor = "#2CDA76"'>
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
          <v-menu offset-y>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                v-bind="attrs"
                v-on="on"
              >
                我畫好了，送出！
              </v-btn>
            </template>
            <v-sheet class='d-flex flex-column pa-1'>
              <div class='text-h6'>確認送出手繪標記？</div>
              <v-btn
                @click="citetoIssue"
                color='red accent-4'
                class='white--text ma-1'
              >
                確認送出！
              </v-btn>
              <div class='text-caption red--text'>如果你只是誤觸，請隨意點擊其他地方即會關閉本對話框，如果你發圖後想預覽，點選Issue附件區的檔案名稱即可</div>
            </v-sheet>
          </v-menu>
          <div>如果您只要下載截圖，請點右邊兩顆按鈕</div>
          <v-tooltip top v-if='cType === "video" || cType === "pdf"'>
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
            <span>擷取並下載當前版畫面</span>
          </v-tooltip>
          <v-tooltip top v-if='pType === "video" || pType === "pdf"'>
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
            <span>擷取對照版畫面</span>
          </v-tooltip>
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
    <v-dialog
      v-model="fabIssue"
      max-width="50vw"
    >
      <template>
        <v-sheet class='d-flex flex-column pa-1'>
          <div class='text-h6'>確認發新Issue？</div>
          <v-btn
            color='red accent-4'
            class='white--text ma-1'
            @click='addIssue'
          >
            是，快讓我發Issue！
          </v-btn>
          <div class='text-caption'>如果你只是誤觸，請隨意點擊其他地方即會關閉本對話框，請注意，只有PM、審查者才有權力刪除Issue</div>
        </v-sheet>
      </template>
    </v-dialog>
    <v-fab-transition v-if='pinMode'>
      <v-tooltip bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            v-bind="attrs" v-on="on"
            color="pink"
            fixed
            fab
            dark
            bottom
            right
            style='margin-bottom: 80px'
            @click.stop='fabIssue = true'
          >
            <v-icon>fas fa-comment-medical</v-icon>
          </v-btn>
        </template>
        <span>發Issue</span>
      </v-tooltip>
    </v-fab-transition>
    <v-speed-dial v-if='!hideFilterBtns' v-model="filterBtn" fixed bottom right direction="left" :open-on-hover="true" transition="slide-y-reverse-transition">
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
            @click.stop='issueFilterTime = !issueFilterTime'
            v-bind="attrs" v-on="on"
          >
            <v-icon v-if='issueFilterTime'>far fa-clock</v-icon>
            <v-icon v-if='!issueFilterTime'>fas fa-clock</v-icon>
          </v-btn>
        </template>
        <span v-if='issueFilterTime'>我要看所有的Issue</span>
        <span v-if='!issueFilterTime'>我要目前秒數的Issue</span>
      </v-tooltip>
      <v-tooltip top v-if='currentVersions.length > 0'>
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
        <span>我要選擇版本來過濾Issue</span>
      </v-tooltip>
      <v-tooltip top>
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            fab
            dark
            small
            :color="filterColor('flag')"
            @click.stop='issueFilterFlag = !issueFilterFlag'
            v-bind="attrs" v-on="on"
          >
            <v-icon v-if='!issueFilterFlag'>far fa-flag</v-icon>
            <v-icon v-if='issueFilterFlag'>fas fa-flag</v-icon>
          </v-btn>
        </template>
        <span v-if='!issueFilterFlag'>去除0秒的Issue</span>
        <span v-if='issueFilterFlag'>看0秒的Issue</span>
      </v-tooltip>
      <v-tooltip top>
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            fab
            dark
            small
            :color="filterColor('closed')"
            @click.stop='issueFilterClosed = !issueFilterClosed'
            v-bind="attrs" v-on="on"
          >
            <v-icon v-if='!issueFilterClosed'>far fa-comment</v-icon>
            <v-icon v-if='issueFilterClosed'>fas fa-comment</v-icon>
          </v-btn>
        </template>
        <span v-if='!issueFilterClosed'>不論Issue狀態都顯示</span>
        <span v-if='issueFilterClosed'>只看沒被關閉的Issue</span>
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
    <v-row no-gutters style='width: 100%' class='d-flex flex-column pr-2'>
      <div style='width: 100%' class='flex-grow-1 d-flex flex-row align-self-center'>
        <v-progress-linear
          v-model="objectiveRate"
          :color="statistics.unfinishObj - statistics.finishObj <= 1 ? 'red darken-4' : 'grey darken-4'"
          class='white--text flex-grow-1'
          height="25"
        >
          <template v-slot:default="{ value }">
            <span>本階段審查指標完成度：{{ Math.ceil(value) }}%</span>
            <span v-if='statistics.unfinishObj > 0'>
              <span v-show='currentStage.isPM || currentStage.isReviewer' v-if='statistics.unfinishObj - statistics.finishObj <= 1'>（再通過一個你就不能回頭啦！）</span>
              <span v-else>（階段死線： {{ dateConvert(currentStage.dueTick) }}）</span>
            </span>
          </template>
        </v-progress-linear>
        <div class='d-flex flex-row flex-shrink-1 flex-grow-0 floatPanel justify-end'>
          <v-btn
            color='indigo darken-4'
            class='white--text ma-1'
            @click='objectiveW = !objectiveW'
          >
            {{ objectiveWConvert() }}
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
                :disabled='currentStage.coolDown'
              >
                發Issue
              </v-btn>
            </template>
            <v-sheet class='d-flex flex-column pa-1'>
              <div class='text-h6'>確認發新Issue？</div>
              <v-btn
                color='red accent-4'
                class='white--text ma-1'
                @click='addIssue'
              >
                是，我要發Issue
              </v-btn>
              <div class='text-caption'>如果你只是誤觸，請隨意點擊其他地方即會關閉本對話框，請注意，只有PM、審查者才有權力刪除Issue</div>
            </v-sheet>
          </v-menu>
          <v-btn
            @click='editlogw = true'
            color="grey lighten-1"
            class='black--text ma-1'
          >
            <span>查看版本紀錄</span>
          </v-btn>
          <v-btn
            color="grey lighten-1"
            class='black--text ma-1'
            @click='tipW = !tipW'
          >
            {{ tipConvert() }}
          </v-btn>
          <v-tooltip top>
            <template v-slot:activator="{ on, attrs }">                
              <v-btn
                v-bind="attrs" v-on="on"
                icon
                outlined
                color="grey darken-3"
                class='black--text ma-1'
                @click='progressW = true'
              >
                <v-icon>fas fa-info</v-icon>
              </v-btn>
            </template>
            <span>查看任務進度和你的權限</span>
          </v-tooltip>
        </div>
      </div>
      <v-expand-transition>
        <v-simple-table class='text-left' v-show='objectiveW'>
          <template v-slot:default>
            <thead>
              <tr>
                <th class="text-left" style="width:25px">
                  審查指標名稱
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
                  <v-btn
                    v-if='currentStage.isReviewer || currentStage.isPM'
                    v-bind="attrs" v-on="on"
                    color="red darken-4"
                    class='white--text'
                    @click='setObjective(objective._id)'
                  >
                    {{ objectiveConvert(objective) }}
                  </v-btn>
                </td>
              </tr>
            </tbody>
          </template>
        </v-simple-table>
      </v-expand-transition>
    </v-row>
    <v-row ref='rowBlock' no-gutters style='width: 100%'>
      <v-col ref='viewColumn' :xl='videoWidth' :lg='videoWidth' :md='videoWidth' sm='12' xs='12' class='d-flex flex-column justify-center align-self-start'>
        <div class='previewArea' ref='previewArea'>
          <div v-show='tipW' class='black--text text-left'>
            <div class='text-h5'>知識點對應課綱／課本</div>
            <div class='text-body-1'>{{ currentKB.textbook }}</div>
            <div class='text-h5'>細部說明</div>
            <div class='text-body-1' v-html='HTMLConverter(currentKB.desc)'></div>
            <div v-if="currentKB.descAtt.length > 0">
              <div class='text-h5'>細部說明附件</div>
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
          <div ref='viewArea' class='viewArea' :class='pinOn ? "floatView" : ""' v-show='!tipW' style='position: relative'>
            <div class='d-flex flex-column' v-if='currentVersion._id === ""'>
              <v-icon x-large class='ma-1' style='transform: scale(1.5);'>fa-exclamation-circle</v-icon>
              <div class='text-h5 font-weight-black ma-3'>目前沒有任何檔案</div>
            </div>
            <div ref='videoArea' v-if='currentVersion._id !== ""'>
              <div ref='currentPlayerArea' class="compareComp">
                <div ref='currentControl' class='d-flex flex-row justify-start white' :class='pinOn ? "floatControl" : "viewControl"'>
                  <div class='versionSign'>當前版本</div>
                  <v-tooltip top v-if='cType === "video"'>
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
                  <v-tooltip top v-if='cType === "video"'>
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
                  <div class='tickArea' v-if='currentData.position !== undefined'>
                    <span v-if='cType === "pdf"'>{{ currentData.position }}</span>
                    <span v-if='cType === "video"'> {{ timeConvert(currentData.position) }}</span> / {{ currentData.total }}
                  </div>
                  <v-tooltip top v-if='cType === "video" || cType === "pdf"'>
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn
                        v-bind="attrs" v-on="on"
                        icon
                        color="light-blue darken-4"
                        @click='backwardVersionContent(0)'
                      >
                        <v-icon>fa-backward</v-icon>
                      </v-btn>
                    </template>
                    <span v-if='cType === "video"'>減速播放</span>
                    <span v-if='cType === "pdf"'>上一頁</span>
                  </v-tooltip>
                  <v-tooltip top v-if='cType === "video" || cType === "pdf"'>
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn
                        v-bind="attrs" v-on="on"
                        icon
                        color="light-blue darken-4"
                        @click='forwardVersionContent(0)'
                      >
                        <v-icon>fa-forward</v-icon>
                      </v-btn>
                    </template>
                    <span v-if="cType === 'video'">加速播放</span>
                    <span v-if="cType === 'pdf'">下一頁</span>
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
                <div class='dragBanner' style='left: 2px'>[當前]{{ versionnameConvert(currentVersion.name) }}</div>
                <div v-show='cType === "video"'><video ref='currentPlayer' class='video-js'></video></div>
                <canvas ref='currentPDF' v-show='cType === "pdf"' />
                <v-list ref='currentZip' class='currentZip overflow-y-auto pa-0 ma-0 text-left' v-show='cType === "zip"'>
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
                <div ref='previousControl' class='d-flex flex-row justify-end white' :class='pinOn ? "floatControl" : "viewControl"'>
                  <v-tooltip top v-if='pType === "video"'>
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
                  <div class='tickArea' v-if='previousData.position !== undefined'>
                    <span v-if='pType === "pdf"'>{{ previousData.position }}</span>
                    <span v-if='pType === "video"'> {{ timeConvert(previousData.position) }}</span> / {{ previousData.total }}
                  </div>
                  <v-tooltip top v-if='pType === "video"'>
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
                  <v-tooltip top v-if='pType === "video" || pType === "pdf"'>
                    <template v-slot:activator="{ on, attrs }">
                        <v-btn
                          v-bind="attrs" v-on="on"
                          icon
                          color="red darken-4"
                          @click='backwardVersionContent(1)'
                        >
                          <v-icon>fa-backward</v-icon>
                        </v-btn>
                    </template>
                    <span v-if='pType === "video"'>減速播放</span>
                    <span v-if='pType === "pdf"'>上一頁</span>
                  </v-tooltip>
                  <v-tooltip top v-if='pType === "video" || pType === "pdf"'>
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn
                        v-bind="attrs" v-on="on"
                        icon
                        color="red darken-4"
                        @click='forwardVersionContent(1)'
                      >
                        <v-icon>fa-forward</v-icon>
                      </v-btn>
                    </template>
                    <span v-if='pType === "video"'>加速播放</span>
                    <span v-if='pType === "pdf"'>下一頁</span>
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
                  <div class='versionSign'>對照版本</div>
                </div>
                <div class='dragBanner' style='right: 2px'>[對照]{{ versionnameConvert(previousVersion.name) }}</div>
                <div v-show='pType === "video"'><video ref='previousPlayer' class='video-js'></video></div>
                <canvas ref='previousPDF' v-show='pType === "pdf"' />
                <v-list ref='previousZip' class='overflow-y-auto pa-0 ma-0 text-left' v-show='pType === "zip"'>
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
                  <v-tooltip top>
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn
                        icon
                        ref='compareBtn'
                        class='compareBtn'
                        draggable="true"
                        @touchmove.prevent='checkDrag'
                        @touchend.prevent='checkDrag'
                        @dragend.prevent='checkDrag'
                        @drag.prevent="checkDrag"
                        @dblclick='cancalCompare'
                        v-bind="attrs" v-on="on"
                      >
                        <v-icon>fa-arrows-alt-h</v-icon>
                      </v-btn>
                    </template>
                    拖曳可移動對比框，雙擊可關閉/開啟對比模式
                  </v-tooltip>
                </div>
              </div>
            </div>
          </div>
        </div>
      </v-col>
      <v-col ref='issueArea' :xl='issueWidth' :lg='issueWidth' :md='issueWidth' sm='12' xs='12' class='d-flex flex-column'>
        <v-skeleton-loader
          class="mx-auto"
          type="card"
          width="100%"
          v-show='!issueListPopulated'
        ></v-skeleton-loader>
        <v-text-field
          outlined clearable dense
          label="輸入關鍵字篩選Issue標題"
          v-model="issuekeywordFilter"
          hint='只篩選Issue標題，支援正規表達式'
        ></v-text-field>
        <div class='text-caption' v-show='issueListPopulated'>篩選出 {{ filteredIssues.length }}條Issue／{{ unReadedCount }}條未讀</div>
        <div v-if='filteredIssues.length === 0' v-show='issueListPopulated'>
          目前沒有任何Issue
        </div>
        <v-sheet class='d-flex flex-column align-start' v-if='filteredListW' v-show='issueListPopulated'>
          <v-lazy
            :options="{
              threshold: 0.5
            }"
            min-height="100"
            transition="fade-transition"
            style='width: 100%'
            v-for='issue in filteredIssues'
            :key='issue._id'
          >
            <issue-list
              :issues='issuesInView'
              :cStage='currentStage'
              :dDetect='diffDetect'
              :issue='issue'
              :compareCommit='compareCommit'
              :compareUser='compareUser'
              :currentVersion='currentVersion'
              :rStatus='readedStatus'
              @status='setStatus'
              @star='setStar'
              @back='backtoIssueList'
              @view='getIssue'
              @edit='editIssue'
              @sendDiff='addDiff'
              @download='downloadFile'
              @remove='removeIssue'
              @add='addIssue'
            />
          </v-lazy>
        </v-sheet>
        <v-card ref='issueW' class='issueW' v-show='issueW'>
          <v-card-title>
            編輯Issue
          </v-card-title>
          <v-card-text class='text-left'>
            <v-text-field outlined clearable dense label="Issue標題" v-model='issue.title' v-if='issue.parent === undefined'/>
            <Tip-Tap
              v-model="issue.body"
              maxHeight="40vh"
              minHeight="20vh"
              hint='請不要留白'
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
                @click="downloadFile(file)"
              >
                {{ file.name }} ({{ byteConvert(file.size) }})
              </v-chip>
            </div>
            <div class='text-right'>@{{ currentPosD }}</div>
          </v-card-text>
          <v-card-actions>
            <div style='width: 100%' class='d-flex flex-column align-self-baseline justify-end'>
              <v-btn
                color="grey lighten-1"
                class='black--text ma-1 flex-grow-1'
                @click="snapshotPaint(0)"
              >
                手繪標註目前版本預覽畫面
              </v-btn>
              <v-btn
                color="grey lighten-1"
                class='black--text ma-1 flex-grow-1'
                @click="snapshotPaint(1)"
              >
                手繪標註對比版本的預覽畫面
              </v-btn>
              <v-btn
                color="red darken-4"
                class='white--text ma-1 flex-grow-1'
                @click="setIssue"
              >
                儲存Issue
              </v-btn>
            </div>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
    <div class='shotBlock' v-show='snapShot'>
      <v-icon x-large color="black" style='filter: drop-shadow(0px 0px 10px rgb(30, 30, 30)); transform: scale(2)'>fa-camera<v-icon>
    </div>
  </v-main>
</template>

<style scoped>
  .floatControl {
    position: fixed !important;
    top: 70px !important;
  }
  .viewControl {
    position: static;
  }
  .floatView {
    top: 70px !important;
    height: 93vh !important;
    overflow-y: scroll !important;
    position: fixed !important;
  }
  .viewArea {
    position: static;
  }
  .viewArea, .issueW {
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
    top: 50%;
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
  .floatPanel {
    margin: auto;
    width: 50%;
  }
  .previewArea {
    max-width: 100%;
    outline: none;
    text-decoration: none;
    position: relative;
    white-space: normal;
  }
  .tickArea {
    border: 1px solid black;
    padding: 2px;
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
import moment from 'moment';
import momentDurationFormatSetup from 'moment-duration-format';
import videojs from 'video.js';
import _uniqWith from 'lodash/uniqWith';
import _find from 'lodash/find';
import _filter from 'lodash/filter';
import _sortBy from 'lodash/sortBy';
import _head from 'lodash/head';
import _intersectionWith from 'lodash/intersectionWith';
import _orderBy from 'lodash/orderBy';
import _inRange from 'lodash/inRange';
import _countBy from 'lodash/countBy';
import _findIndex from 'lodash/findIndex';
import 'video.js/dist/video-js.css';
import marked from 'marked';
import { v4 as uuidv4 } from 'uuid';
import prettyBytes from 'pretty-bytes';
import axios from 'axios';
import JSZip from 'jszip';
import mime from 'mime-types';
import Paintable from 'vue-paintable';
import * as htmlToImage from 'html-to-image';
import * as Diff from 'diff'
import * as pdfjsLib from 'pdfjs-dist/es5/build/pdf';
import PdfjsWorker from 'workerize-loader!pdfjs-dist/build/pdf.worker.js';
pdfjsLib.GlobalWorkerOptions.workerPort = new PdfjsWorker();
import 'pdfjs-dist/build/pdf.worker.entry';

const renderer = new marked.Renderer();
const linkRenderer = renderer.link;
renderer.link = (href, title, text) => {
  if(href !== undefined) { href = (decodeURIComponent(href)).replace(/\\/g, ''); }
  if(title !== undefined) { title = (decodeURIComponent(title)).replace(/\\/g, ''); }
  if(text !== undefined) { text = (decodeURIComponent(text)).replace(/\\/g, ''); }
  const html = linkRenderer.call(renderer, href, title, text);
  return html.replace(/^<a /, '<a target="_blank" rel="nofollow" ');
};

let files = [];

momentDurationFormatSetup(moment);
Vue.use(Paintable);

export default {
  name: 'videoReview',
  components: { 
    TipTap: () => import(/* webpackPrefetch: true */ './modules/TipTap'),
    IssueList: () => import(/* webpackPrefetch: true */ './modules/IssueList')
  },
  methods: {
    cancalCompare: function () {
      this.disableCompareMode = !this.disableCompareMode;
    },
    backtoIssueList: function () {
      this.$emit('toastPop', '更新已讀取Issue清單');
      this.$socket.client.emit('getReadedIssue');
    },
    addDiff: function (issue) {
      let tempDiff = this.diffIssues;
      tempDiff.push(issue);
      this.diffIssues = _uniqWith(tempDiff, (aIssue, bIssue) => {
        return aIssue._id === bIssue._id;
      });
      this.$emit('toastPop', "對比Issue清單已有" + this.diffIssues.length + '/2 條Issue，選到2條Issue時，會自動開啟Issue對比');
    },
    closeDiff: function () {
      this.diffW = false;
      this.diffIssues = [];
      this.diffResult = '';
      this.$emit('toastPop', "對比Issue清單已清空");
    },
    closeConfigW: function () {
      this.firstReview = true;  //意思是結束第一次執行審查畫面才會出現的畫面設定提示框，因為懶得改變數名稱了，就用firstReview吧
      this.configW = false;
    },
    versionnameConvert: function (filename) {
      return filename.replace(/\.[^/.]+$/, "");
    },
    filterColor: function (type) {
      if(type === 'time') {
        if(this.issueFilterTime) {
          return 'red accent-4';
        } else {
          return 'light-blue darken-4';
        }
      }
      if(type === 'commit') {
        if(this.issueFilterCommit) {
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
        if(this.issueFilterFlag) {
          return 'red accent-4';
        } else {
          return 'light-blue darken-4';
        }
      }
      if(type === 'closed') {
        if(this.issueFilterClosed) {
          return 'red accent-4';
        } else {
          return 'light-blue darken-4';
        }
      }
      if(type === 'all') {
        if(this.issueFilterFlag || this.compareUser.tick > 0 || this.issueFilterTime || this.issueFilterClosed || this.issueFilterCommit) {
          return 'red accent-4';
        } else {
          return 'light-blue darken-4';
        }
      }
    },
    scrollEvent: function () {
      let top = (this.$refs.previewArea.getBoundingClientRect().top - 80);
      if(top < 0) {
        this.pinMode = true;
        this.hideAlert = false;
      } else {
        this.pinMode = false;
        this.hideAlert = true;
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
      if(type.indexOf('word') > -1) {
        return "fas fa-file-word";
      }
      if(type.indexOf('excel') > -1 || type.indexOf('sheet') > -1) {
        return "fas fa-file-excel";
      }
      if(type.indexOf('powerpoint') > -1 || type.indexOf('presentation') > -1) {
        return "fas fa-file-powerpoint";
      }
      if(type.indexOf('video') > -1) {
        return "fas fa-file-video";
      }
      if(type.indexOf('pdf') > -1) {
        return "far fa-file-pdf";
      }
      return "fas fa-file";
    },
    viewObjConvert: function () {
      return this.selectedObjective === undefined ? '檢視這個目標相關的Issue' : '檢視全部的Issue';
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
      let DOM = null;
      if(this.cType === 'pdf') {
        if(type === 0) {
          DOM = this.$refs.currentPDF;
        } else {
          DOM = this.$refs.previousPDF;
        }
      } else {
        if(type === 0) {
          DOM = this.$refs.currentPlayer;
        } else {
          DOM = this.$refs.previousPlayer;
        }
      }
      let version = type === 0 ? this.versionnameConvert(this.currentVersion.name) : this.versionnameConvert(this.previousVersion.name);
      let pos = type === 0 ? this.currentData.position : this.previousData.position;
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
        oriobj.snapShot = false;
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
      let oriobj = this;
      this.$emit('timerOn', false);
      this.$emit('toastPop', 'Issue列表更新完成');
      let item = _find(this.loadingItems, { icon: 'fa-comments' });
      item.loaded = true;
      this.issueListPopulated = true;
      this.issueList = [];
      let loaded = _find(this.loadingItems, { loaded: false });
      if(loaded === undefined) {
        this.loadW = false;
        if(this.firstRun) {
          this.progressW = true;
          Vue.nextTick(() => {
            if(!oriobj.firstReview) {
              oriobj.configW = true;
            }
          });
        }
        this.firstRun = false;
      }
      Vue.nextTick(() => {
        oriobj.issueList = data;
      });
    },
    socketgetReadedIssue: function (data) {
      this.$emit('timerOn', false);
      this.$emit('toastPop', '已讀取Issue更新完成');
      this.readedIssueList = data;
      let item = _find(this.loadingItems, { icon: 'fa-envelope-open-text' });
      item.loaded = true;
      this.$emit('timerOn', true);
      this.$emit('toastPop', '更新Issue列表');
      this.$socket.client.emit('getissueList', this.KBid);
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
      this.issue._id = data._id;
      this.issue.position = 0;
      this.issue.title = '';
      this.issue.body = '';
      this.issue.attachments = [];
      this.issue.parent = data.parent;
      this.issueW = true;
      this.filteredListW = false;
      this.fabIssue = false;
    },
    socketsetReadedIssue: function (data) {
      this.readedStatus = data;
    },
    socketeditIssue: function (data) {
      this.issue._id = data._id;
      this.issue.title = data.title;
      this.issue.body = this.HTMLConverter(data.body);
      this.issue.attachments = data.attachments;
      this.issue.parent = data.parent;
      this.issueW = true;
      this.filteredListW = false;
    },
    editIssue: function (issue) {
      this.$socket.client.emit('editIssue', issue._id);
    },
    removeIssue: function (issue) {
      this.$socket.client.emit('removeIssue', issue._id);
    },
    addIssue: function (parent) {
      let pause = 0;
      if(this.currentPlayer) {
        this.currentPlayer.pause();
        pause++;
      }
      if(this.previousPlayer) {
        this.previousPlayer.pause();
        pause++;
      }
      if(pause > 0) {
        this.$emit('toastPop', '發送Issue中，播放器已暫停');
      }
      let parentIssue = !('_id' in parent) ? undefined : parent._id;
      let sendIssue = false;
      if(parent === undefined) {
        if(!this.currentStage.coolDown) {
          sendIssue = true;
        } else {
          sendIssue = false;
        }
      } else {
        sendIssue = true;
      }
      if(sendIssue) {
        let temp = {};
        temp.parent = parentIssue;
        temp.objective = !('objective' in parent) ? undefined : parent.objective;
        temp.position = this.currentData.position;
        temp.KB = this.currentKB._id;
        temp.version = this.currentVersion._id === '' ? undefined : this.currentVersion._id;
        this.$socket.client.emit('addIssue', temp);
      } else {
        this.$emit("toastPop", "本階段已經進入冷靜期，禁止建立新的Issue，你只可以回復既有的");
      }
    },
    setIssue: function () {
      this.$socket.client.emit('setIssue', this.issue);
    },
    getIssue: function (issue) {
      this.issuePointer = issue._id;
      this.$socket.client.emit('setReadedIssue', issue._id);
      if('version' in issue) {
        if(issue.version !== undefined) {
          if('_id' in issue.version) {
            if(issue.version._id === this.currentVersion._id) {
              if(this.cType.indexOf('video') > -1) {
                this.currentPlayer.currentTime(issue.position);
                this.currentPlayer.pause();
              } else if(this.cType.indexOf('pdf') > -1) {
                this.currentData.position = issue.position
              }
            } else {
              this.previousVersion = issue.version;
              if(issue.version.type.indexOf('video') > -1) {
                this.previousGoto = this.issue.position;
              } else if(issue.version.type.indexOf('pdf') > -1) {
                this.previousGoto = issue.position
              }
              this.disableCompareMode = true;
              this.$emit('toastPop', '這則Issue與舊版文件有關，對比模式已自動開啟');
            }
          }
        }
      }
    },
    dateConvert: function (time) {
      return time === 0 ? '尚未設定' : moment.unix(time).format('YYYY/MM/DD HH:mm:ss');
    },
    HTMLConverter: function (msg) {
      msg = msg === null || msg == undefined ? '**用戶未輸入任何內容**' : msg;
      return marked(msg, { renderer });
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
      this.$socket.client.emit('deleteissueFile', {
        fileID: file._id,
        issueID: this.issue._id
      });
    },
    tipConvert: function () {
      return this.tipW ? '隱藏細部說明' : '查看細部說明';
    },
    setStar: function (issue) {
      this.$socket.client.emit('setissueStar', issue._id);
    },
    setStatus: function (issue) {
      this.$socket.client.emit('setissueStatus', issue._id);
    },
    downloadFile: function (file) {
      this.$emit('downloadFile', file);
    },
    loadVersion: function (item) {
      this.previousVersion = item;
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
    forwardVersionContent: function (type) {
      let mime = type === 0 ? this.cType : this.pType;
      if(mime === "pdf") {
        let totalPages = type === 0 ? this.currentData.total : this.previousData.total;
        let currentPage = type === 0 ? this.currentData.position : this.previousData.position;
        if(currentPage + 1 <= totalPages) {
          if(type === 0) {
            this.currentData.position = this.currentData.position + 1;
          } else {
            this.previousData.position = this.previousData.position + 1;
          }
        }
      } else if(mime === 'video') {
        let player = type === 0 ? this.currentPlayer : this.previousPlayer;
        this.playbackrate = this.playbackrate < 1.5 ? this.playbackrate + 0.5 : 2;
        player.playbackRate(this.playbackrate);
      }
    },
    backwardVersionContent: function (type) {
      let mime = type === 0 ? this.cType : this.pType;
      if(mime === "pdf") {
        let currentPage = type === 0 ? this.currentData.position : this.previousData.position;
        if(currentPage -1 > 0) {
          if(type === 0) {
            this.currentData.position = this.currentData.position -1;
          } else {
            this.previousData.position = this.previousData.position - 1;
          }
        }
      } else if(mime === 'video') {
        let player = type === 0 ? this.currentPlayer : this.previousPlayer;
        this.playbackrate = this.playbackrate > -1.5 ? this.playbackrate - 0.5 : -2;
        player.playbackRate(this.playbackrate);
      }
    },
    playVideo: function (type) {
      this.$emit('toastPop', {
        message: "小提示：，如果你開啟右下角沙漏的「按照時間過濾Issue」，你可以只看到當前撥放秒數的Issue",
        time: 5000
      });
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
        if(version === undefined || !('_id' in version)) {
          return '無對應版本';
        } else {
          return version._id === this.currentVersion._id ? '當前版本' : '舊版';
        }
      } else {
        return '目前無任何已上傳版本'
      }
    },
    historyConvert: function (version) {
      if(this.currentVersion._id !== '') {
        return version._id === this.previousVersion._id ? '對照版本' : this.versionConvert(version);
      } else {
        return '目前無任何已上傳版本'
      }
    },
    editorConvert: function (dialog) {
      dialog = [...dialog].sort((a, b) => {
        return a.tick - b.tick;
      });
      return dialog[0].name;
    },
    socketgetKB: function (data) {
      if(data._id === this.currentKB._id || this.firstRun) {
        this.$emit('timerOn', false);
        this.$emit('toastPop', '知識點更新完成');
        this.currentKB = data;
        this.currentKB.currentStep = (_countBy(this.currentKB.stages, {
          current: false
        })) === this.currentKB.stages.length ? 0 : (_findIndex(this.currentKB.stages, {
          current: true
        })) + 1 ;
        let currentStage = this.currentKB.currentStep === 0 ? this.currentKB.stages[this.currentKB.currentStep] : this.currentKB.stages[this.currentKB.currentStep - 1];
        let item = _find(this.loadingItems, { icon: 'fa-photo-video' });
        item.loaded = true;
        this.$emit('viewIn', {
          text: '影片審查-' + data.title,
          icon: 'fa-photo-video',
          module: '審查模組',
          location: '/viewReview/' + this.KBid
        });
        this.$emit('timerOn', true);
        this.$emit('toastPop', '更新知識點工作階段');
        this.$socket.client.emit('getStage', currentStage._id);
      }
    },
    sockgetKBVersions: function (data) {
      this.$emit('timerOn', false);
      this.$emit('toastPop', '更新知識點版本更新完成');
      this.versionPopulated = true;
      this.currentVersions = data;
      if(data.length === 0) {
        this.tipW = true;
      }
      let item = _find(this.loadingItems, { icon: 'fa-code-branch' });
      item.loaded = true;
      this.$emit('timerOn', true);
      this.$emit('toastPop', '更新已讀取Issue清單');
      this.$socket.client.emit('getReadedIssue');
    },
    authClass: function (item) {
      return item.loaded ? 'd-flex flex-column loadedItem' : 'd-flex flex-column loadingItem';
    },
    objectiveWConvert: function () {
      return this.objectiveW ? '隱藏審查目標清單' : this.currentStage.isPM || this.currentStage.isReviewer ? '同意通過審查目標' : '查看審查目標';
    },
    objectiveConvert: function (data) {
      return 'signUser' in data ? '撤回完成許可（請按此確認）' : '本目標可通過（請按此確認）';
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
          src: '/storages/' + oriobj.currentVersion._id
        });
        this.on('timeupdate', function () {
          oriobj.currentData.position = this.currentTime();
        });
        this.on('loadedmetadata', function () {
          oriobj.currentData.total = oriobj.timeConvert(this.duration());
          Vue.nextTick(() => {
            oriobj.barCalc();
          })
        });
        this.on('playing', function () {
          oriobj.tipword = '提示：影片開始播放時，右側issue區塊會同步展開當前時間對應的issue';
        });
      });
    },
    loadpreviousVideo: function () {
      let oriobj = this;
      this.previousPlayer = videojs(this.$refs.previousPlayer, this.videoOptions, function onPlayerReady () {
        this.src({
          type: oriobj.previousVersion.type,
          src: '/storages/' + oriobj.previousVersion._id
        });
        this.on('loadedmetadata', function () {
          oriobj.previousData.total = oriobj.timeConvert(this.duration());
          Vue.nextTick(() => {
            oriobj.barCalc();
          });
        });
        this.on('timeupdate', function () {
          oriobj.previousData.position = this.currentTime();
        });
      });
    },
    sockgetStage: function (data) {
      if(data._id === this.currentStage._id || this.firstRun) {
        this.currentStageData = data;
        this.$emit('timerOn', false);
        this.$emit('toastPop', '當前階段更新完成');
        let item = _find(this.loadingItems, { icon: 'fa-stopwatch' });
        item.loaded = true;
        this.$emit('timerOn', true);
        this.$emit('toastPop', '更新知識點版本');
        this.$socket.client.emit('getKBVersions', this.currentKB._id);
      }
    },
    snapshotPaint: async function (data) {
      if(this.currentVersions.length > 0) {
        this.$emit("toastPop", "螢幕截圖中，請稍後...");
        this.snapShot = true;
        let oriobj = this;
        let DOM = null;
        let img = new Image();
        let isMedia = false;
        let isPDF = false;
        let canvasHeight = 0;
        let canvasOffsetTop = 0;
        let canvasWidth = 0;
        Vue.nextTick(async () => {
          if(data === 0) {
            if(oriobj.cType === 'video') {
              DOM = oriobj.$refs.currentPlayer;
              isMedia = true;
            } else if(oriobj.cType === 'pdf') {
              DOM = oriobj.$refs.currentPDF;
              isMedia = true;
              isPDF = true;
            } else {
              DOM = oriobj.$refs.currentZip.$el;
            }
          } else {
            if(oriobj.pType === 'video') {
              DOM = oriobj.$refs.previousPlayer;
              isMedia = true;
            } else if(oriobj.pType === 'pdf') {
              DOM = oriobj.$refs.previousPDF;
              isMedia = true;
              isPDF = true;
            } else {
              DOM = oriobj.$refs.previousZip.$el;
            }
          }
          canvasWidth = DOM.clientWidth;
          img.width = DOM.clientWidth;
          img.height = DOM.clientHeight;
          if(isMedia) {
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
          if(isPDF) {
            canvasHeight = DOM.clientHeight > window.innerHeight ? window.innerHeight : DOM.clientHeight;
            canvasOffsetTop = oriobj.$refs.viewArea.scrollTop > 0 ? oriobj.$refs.viewArea.scrollTop : 0;
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
      } else {
        this.$emit("toastPop", "根本沒有Commit，無法進行螢幕截圖");
      }
    },
    barCalc: function() {
      let oriobj = this;
      let compareComps = document.getElementsByClassName('compareComp');
      let barHeight = 0;
      if(compareComps.length > 1) {
        barHeight = compareComps[0].clientHeight > compareComps[1].clientHeight ? compareComps[0].clientHeight : compareComps[1].clientHeight;
      }
      this.$refs.compareBar.style.height = barHeight + 'px';
      this.$refs.compareBar.style.left = '50%';
      this.$refs.previousPlayerArea.style.clipPath = 'inset( 0 0 0 50% )';
      this.$refs.currentPlayerArea.style.clipPath = 'inset( 0 50% 0 0 )';
      if(this.disableCompareMode) {
        Vue.nextTick(() => {
          oriobj.$refs.previousPlayerArea.style.clipPath = 'inset( 0 0 0 100% )';
          oriobj.$refs.currentPlayerArea.style.clipPath = 'inset( 0 0% 0 0 )';
          oriobj.$refs.compareBar.style.left = '100%';
        });
      }
    }
  },
  beforeDestroy () {
    if (this.currentPlayer) {
        this.currentPlayer.dispose();
        this.previousPlayer.dispose();
    }
    this.$socket.client.off('setReadedIssue', this.socketsetReadedIssue);
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
    this.$socket.client.off('getReadedIssue', this.socketgetReadedIssue);
    this.$socket.client.emit('leaveKBEditing', this.KBid);
    window.removeEventListener('scroll', this.scrollEvent);
  },
  created () {
    this.$socket.client.on('setReadedIssue', this.socketsetReadedIssue);
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
    this.$socket.client.on('getReadedIssue', this.socketgetReadedIssue);
    window.addEventListener('scroll', this.scrollEvent);
    let oriobj = this;
    Vue.nextTick(() => {
      oriobj.$socket.client.emit('getKB', this.KBid);
      oriobj.$socket.client.emit('joinKBEditing', this.KBid);
    });
  },
  computed: {
    diffDetect: function () {
      if(!this.disableIssueDiff) {
        if(this.diffIssues.length < 2) {
          return true;
        }
      }
      return false;
    },
    unReadedCount: function () {
      let unreadeds = _filter(this.filteredIssues, (issue) => {
        return !issue.readed;
      })
      return unreadeds.length;
    },
    objectiveRate: function () {
      return (this.statistics.finishObj  / (this.statistics.finishObj + this.statistics.unfinishObj)) * 100;
    },
    issuesInView: function () {
      let oriobj = this;
      let mainThread = _find(this.issueList, (issue) => {
                        return issue._id === oriobj.issuePointer;
                      });
      if(mainThread !== undefined) {
        return  {
          id: mainThread._id,
          issues: _sortBy(_filter(this.issueList, (issue) => {
            return issue.parent === oriobj.issuePointer;
          }), ['tick'])
        }
      }
      return {
        id: undefined,
        issues: []
      };
    },
    statistics: function () {
      return {
        closedIssue: (_filter(this.issueList, (item) => {
                      return item.status
                    })).length,
        openIssue: _filter(this.issueList, (item) => {
                      return !item.status
                    }).length,
        finishObj: _filter(this.currentStage.objectives, (item) => {
                      return ('signUser' in item)
                    }).length,
        unfinishObj: _filter(this.currentStage.objectives, (item) => {
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
      let readedIssueList = this.readedIssueList;
      let filterList = _filter(this.issueList, (issue) => {
        return !('parent' in issue) || issue.parent === undefined;
      });
      if(this.issuekeywordFilter !== '') {
        filterList = _filter(filterList, (issue) => {
          return new RegExp(oriobj.issuekeywordFilter, 'g').test(issue.title);
        });
      }
      if(obj !== undefined) {
        filterList = _filter(filterList, (issue) => {
          return issue.objective === obj;
        });
      } else {
        if(this.compareCommit.tick > 0) {
          if(this.issueFilterCommit) {
            filterList = _filter(filterList, (issue) => {
              if('_id' in issue.version) {
                return issue.version._id === oriobj.compareCommit._id;
              } else {
                return false;
              }
            });
          }
        }
        filterList = _filter(filterList, (issue) => {
          if(!('parent' in issue) || issue.parent === undefined) {
            if(oriobj.issueFilterFlag) {
              if(issue.position === 0) { return true; }
            }
            if(oriobj.issueFilterTime) {
              return _inRange(issue.position, Math.floor(oriobj.currentData.position) - 0.01, Math.ceil(oriobj.currentData.position) + 0.01);
            } else {
              return true;
            }
          }
          return false;
        });
        if(!this.issueFilterClosed) {
          filterList = _filter(filterList, (issue) => {
            return !issue.status;
          });
        }
      }
      for(let i=0; i<filterList.length; i++) {
        filterList[i].readed = false;
      }
      for(let i=0; i<readedIssueList.length; i++) {
        let readedIssue = readedIssueList[i];
        let foundIssue = _find(filterList, (issue) => {
          return issue._id === readedIssue.issue;
        });
        if(foundIssue) {
          foundIssue.readed = true;
        }
      }
      for(let i=0; i<filterList.length; i++) {
        let issue = filterList[i];
        if(!issue.readed) {
          if('parent' in issue) {
            if(issue.parent !== undefined) {
              let mainThread = _find(filterList, (issue) => {
                return issue._id === issue.parent;
              });
              if(mainThread) {
                mainThread.readed = false;
              }
            }
          }
        }
      }
      return _orderBy(filterList, ['star', 'tick', 'readed', 'position', 'status', 'version.tick'], ['desc', 'desc', 'desc', 'asc', 'desc', 'desc']);
    },
    currentPosD: function () {
      return this.timeConvert(this.currentData.position);
    },
    substringTitle: function (data) {
      return data === undefined ? '' : data.substring(0, 10);
    },
    currentVersion: function () {
      if(this.currentVersions.length > 0) {
        return _head(this.currentVersions);
      } else {
        return {
          _id: '',
          type: '',
          name: ''
        };
      }
    },
    issueWidth: function () {
      return 12 - this.videoWidth;
    },
    previousZip: function () {
      if(this.previousZipFile != null) {
        let zipList = [];
        let oriobj = this;
        this.previousZipFile.forEach((relativePath, zipEntry) => {
          zipList.push({
            file: zipEntry,
            id: uuidv4()
          });
        });
        Vue.nextTick(() => {
          oriobj.barCalc();
        });
        return zipList;
      } else {
        return [];
      }
    },
    currentZip: function () {
      if(this.currentZipFile != null) {
        let zipList = [];
        let oriobj = this;
        this.currentZipFile.forEach((relativePath, zipEntry) => {
          zipList.push({
            file: zipEntry,
            id: uuidv4()
          });
        });
        Vue.nextTick(() => {
          oriobj.barCalc();
        });
        return zipList;
      } else {
        return [];
      }
    },
    currentStage: function () {
      if(this.currentUser._id !== '') {
        let isPM = (_intersectionWith(this.currentStageData.pmTags, this.currentUser.tags, (cTag, uTag) => {
          return cTag === uTag._id;
        })).length > 0;
        let isWriter = (_intersectionWith(this.currentStageData.writerTags, this.currentUser.tags, (cTag, uTag) => {
          return cTag === uTag._id;
        })).length > 0;
        let isVendor = (_intersectionWith(this.currentStageData.vendorTags, this.currentUser.tags, (cTag, uTag) => {
          return cTag === uTag._id;
        })).length > 0;
        let isFinal = (_intersectionWith(this.currentStageData.finalTags, this.currentUser.tags, (cTag, uTag) => {
          return cTag === uTag._id;
        })).length > 0;
        let isReviewer = (_intersectionWith(this.currentStageData.reviewerTags, this.currentUser.tags, (cTag, uTag) => {
          return cTag === uTag._id;
        })).length > 0;
        return {
          _id: this.currentStageData._id,
          current: this.currentStageData.current,
          name: this.currentStageData.name,
          dueTick: this.currentStageData.dueTick,
          pmTags: this.currentStageData.pmTags,
          reviewerTags: this.currentStageData.reviewerTags,
          vendorTags: this.currentStageData.vendorTags,
          writerTags: this.currentStageData.writerTags,
          finalTags: this.currentStageData.finalTags,
          objectives: this.currentStageData.objectives,
          isPM: isPM,
          isVendor: isVendor,
          isFinal: isFinal,
          isWriter: isWriter,
          isReviewer: isReviewer,
          coolDown: this.currentStageData.coolDown
        }
      } else {
        return {
          _id: '',
          current: false,
          name: '',
          dueTick: 0,
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
          isReviewer: false,
          coolDown: false
        }
      }
    }
  },
  mounted () {
    let oriobj = this;
    let firstReview = window.localStorage.getItem('firstReview');
    if(firstReview) {
      oriobj.firstReview = JSON.parse(firstReview);
    }
    let videoWidth = window.localStorage.getItem('videoWidth');
    if(videoWidth) {
      oriobj.videoWidth = JSON.parse(videoWidth);
    }
    let hideFilterBtns = window.localStorage.getItem('hideFilterBtns');
    if(hideFilterBtns) {
      oriobj.hideFilterBtns = JSON.parse(hideFilterBtns);
    }
    let disableCompareMode = window.localStorage.getItem('disableCompareMode');
    if(disableCompareMode) {
      oriobj.disableCompareMode = JSON.parse(disableCompareMode);
    }
    let disableIssueDiff = window.localStorage.getItem('disableIssueDiff');
    if(disableIssueDiff) {
      oriobj.disableIssueDiff = JSON.parse(disableIssueDiff);
    }
    this.localLoaded = true;
  },
  watch: {
    diffIssues: {
      immediate: true,
      handler() {
        if(this.diffIssues.length == 2) {
          try {
            let diff = Diff.diffChars(this.diffIssues[0].body, this.diffIssues[1].body);
            let fragment = document.createElement('div');
            diff.forEach((part) => {
              const color = part.added ? 'teal--text darken-4' :
                            part.removed ? 'red--text darken-4' : 'black--text';
              let span = document.createElement('span');
              span.className = color;
              span.appendChild(document.createTextNode(part.value));
              fragment.appendChild(span);
            });
            this.diffResult = fragment.innerHTML;
            this.diffW = true;
          } catch(e) {
            this.diffIssues = [];
            this.diffResult = '';
            this.$emit('toastPop', '發生錯誤，你選的Issue無法進行對比！對比Issue清單已清空');
          }
        }
      }
    },
    firstReview: function () {
      if(this.localLoaded) {
        window.localStorage.setItem('firstReview', JSON.stringify(this.firstReview));
      }
    },
    videoWidth: function () {
      if(this.localLoaded) {
        window.localStorage.setItem('videoWidth', JSON.stringify(this.videoWidth));
      }
    },
    hideFilterBtns: function () {
      if(this.localLoaded) {
        window.localStorage.setItem('hideFilterBtns', JSON.stringify(this.hideFilterBtns));
      }
    },
    disableIssueDiff: function () {
      if(this.localLoaded) {
        window.localStorage.setItem('disableIssueDiff', JSON.stringify(this.disableIssueDiff));
      }
    },
    disableCompareMode: function () {
      if(this.localLoaded) {
        window.localStorage.setItem('disableCompareMode', JSON.stringify(this.disableCompareMode));
        if(this.$refs.compareBar !== undefined) {
          this.barCalc();
        }
      }
    },
    pinMode: function () {
      let oriobj = this;
      if(this.pinMode) {
        this.$emit('toastPop', {
          time: 10000,
          message: '預覽框置頂模式開啟！請勿調整視窗大小！'
        });
        this.$refs.viewArea.style.left = this.$refs.viewArea.getBoundingClientRect().left + 'px';
        this.$refs.viewArea.style.width = this.$refs.viewArea.clientWidth + 'px';
        setTimeout(() => {  //vue nexttick 不會更新data，只能用settimeout，以下同
          oriobj.$refs.currentControl.style.left = oriobj.$refs.viewArea.getBoundingClientRect().left + 'px';
          oriobj.$refs.currentControl.style.width = oriobj.$refs.viewArea.clientWidth + 'px';
          oriobj.$refs.previousControl.style.left = oriobj.$refs.viewArea.getBoundingClientRect().left + 'px';
          oriobj.$refs.previousControl.style.width = oriobj.$refs.viewArea.clientWidth + 'px';
          oriobj.pinOn = true;
        }, 500);
      } else {
        this.$emit('toastPop', '預覽框置頂模式關閉！');
        setTimeout(() => {
          oriobj.$refs.viewArea.style.left = '';
          oriobj.$refs.currentControl.style.left = '';
          oriobj.$refs.previousControl.style.left = '';
          oriobj.pinOn = false;
        }, 500);
      }
    },
    currentVersion: {
      immediate: true,
      async handler () {
        let oriobj = this;
        if(this.currentVersion !== null) {
          if(this.currentVersion._id !== '') {
            this.currentData.position = undefined;
            this.currentData.total = undefined;
            this.previousVersion = this.currentVersion;
            if(this.currentVersion.type.indexOf('video') > -1) {
              this.cType = 'video';
              if(!this.currentPlayer) {
                Vue.nextTick(() => {
                  oriobj.loadcurrentVideo();
                });
              } else {
                this.currentPlayer.src({
                  type: this.currentVersion.type,
                  src: '/storages/' + oriobj.currentVersion._id
                });
              }
            } else if(this.currentVersion.type.indexOf('pdf') > -1) {
              let oriobj = this;
              this.cType = 'pdf';
              this.$emit("toastPop", "最新版本為PDF，開始下載PDF檔案");
              Vue.nextTick(async () => {
                let result = await axios.get('/storages/' + oriobj.currentVersion._id, {
                                          responseType: 'blob'    
                                    });
                oriobj.$emit("toastPop", "PDF下載完成，開始繪製PDF");
                let pdf = await (pdfjsLib.getDocument({data: await result.data.arrayBuffer() })).promise;
                oriobj.currentData.position = 1;
                oriobj.currentData.total = pdf.numPages;
                oriobj.currentPDF = null;
                oriobj.currentPDF = pdf;
              });
            } else {
              this.cType = 'zip';
              this.$emit("toastPop", "最新版本為Zip，開始下載Zip檔案");
              Vue.nextTick(async () => {
                let result = await axios.get('/storages/' + oriobj.currentVersion._id, { responseType: 'blob' });
                let zipFile = new JSZip();
                oriobj.currentZipFile = await zipFile.loadAsync(result.data);
                oriobj.$emit("toastPop", "Zip檔案載入完成");
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
            this.previousData.position = undefined;
            this.previousData.total = undefined;
            if(this.previousVersion.type.indexOf('video') > -1) {
              this.pType = "video";
              if(!this.previousPlayer) {
                Vue.nextTick(() => {
                  oriobj.loadpreviousVideo();
                });
              } else {
                this.previousPlayer.src({
                  type: this.previousVersion.type,
                  src: '/storages/' + this.previousVersion._id
                });
              }
            } else if(this.previousVersion.type.indexOf('pdf') > -1) {
              let oriobj = this;
              this.pType = 'pdf';
              this.$emit("toastPop", "對照版本為PDF，開始下載PDF檔案");
              Vue.nextTick(async () => {
                let result = await axios.get('/storages/' + oriobj.previousVersion._id, {
                                          responseType: 'blob'    
                                    });
                oriobj.$emit("toastPop", "PDF下載完成，開始繪製PDF");
                let pdf = await (pdfjsLib.getDocument({data: await result.data.arrayBuffer() })).promise;
                oriobj.previousData.position = oriobj.previousGoto > 0 ? oriobj.previousGoto : 1;
                oriobj.previousData.total = pdf.numPages;
                oriobj.previousPDF = null;
                oriobj.previousPDF = pdf;
              });
            } else {
              this.pType = "zip";
              this.$emit("toastPop", "對照版本為Zip，開始下載Zip檔案");
              Vue.nextTick(async () => {
                let result = await axios.get('/storages/' + oriobj.previousVersion._id, { responseType: 'blob' });
                let zipFile = new JSZip();
                oriobj.previousZipFile = await zipFile.loadAsync(result.data);
                this.$emit("toastPop", "對照版本Zip檔案下載完成");
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
          this.issueCite.name = this.currentVersion.type.indexOf('pdf') > -1 ? this.versionnameConvert(this.currentVersion.name)+'版/'+this.currentData.position+'頁.png' : this.versionnameConvert(this.currentVersion.name)+'版/時間'+this.currentPosD+'.png';
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
    versionLog: function () {
      this.versionLog.sort((a, b) => {
        return b.date - a.date;
      });
      return this.versionLog;
    },
    issueList: function () {
      let parents = _filter(this.issueList, (item) => {
        return item.parent === undefined;
      });
      for(let i=0; i<parents.length; i++) {
        let parent = parents[i];
        let children = _sortBy(_filter(this.issueList, (item) => {
          if(!('parent' in item) || item.parent === undefined) { return false; }
          return item.parent === parent._id;
        }), ['tick']);
        let latestTick = children.length === 0 ? parent.tick : (_head(children)).tick;
        parent.latestTick = latestTick;
        for(let k=0; k<children.length; k++) {
          let child = children[k];
          child.latestTick = latestTick;
        }
      }
    },
    'currentData.position': async function () {
      let oriobj = this;
      if(this.currentPDF !== null) {
        if(this.currentData.position <= this.currentData.total) {
          this.$emit("toastPop", "開始繪製當前版本PDF的PDF第" + this.currentData.position + "頁");
          let page = await this.currentPDF.getPage(this.currentData.position);
          let viewport = page.getViewport({ scale: 1, });
          let desiredWidth = this.$refs.viewArea.clientWidth;
          let scale = desiredWidth / viewport.width;
          let scaledViewport = page.getViewport({ scale: scale, });
          this.$refs.currentPDF.width = desiredWidth;
          this.$refs.currentPDF.height = viewport.height * scale;
          let renderContext = {
            canvasContext: this.$refs.currentPDF.getContext('2d'),
            viewport: scaledViewport
          };
          await page.render(renderContext);
          this.$emit("toastPop", "當前版本PDF的第" + this.currentData.position + "頁繪製完成");
          Vue.nextTick(() => {
            oriobj.barCalc();
          });
        }
      }
    },
    'previousData.position': async function () {
      let oriobj = this;
      if(this.previousPDF !== null) {
        if(this.previousData.position <= this.previousData.total) {
          this.$emit("toastPop", "開始繪製對照版本PDF的第" + this.previousData.position + "頁");
          let page = await this.previousPDF.getPage(this.previousData.position);
          let viewport = page.getViewport({ scale: 1, });
          let desiredWidth = this.$refs.viewArea.clientWidth;
          let scale = desiredWidth / viewport.width;
          let scaledViewport = page.getViewport({ scale: scale, });
          this.$refs.previousPDF.width = desiredWidth;
          this.$refs.previousPDF.height = viewport.height * scale;
          let renderContext = {
            canvasContext: this.$refs.previousPDF.getContext('2d'),
            viewport: scaledViewport
          };
          await page.render(renderContext);
          this.$emit("toastPop", "對照版本PDF的第" + this.previousData.position + "頁繪製完成");
          Vue.nextTick(() => {
            oriobj.barCalc();
          });
        }
      }
    }
  },
  props: {
    KBid: String
  },
  data () {
    return {
      readedStatus: {
        _id: undefined,
        numberOfIssues: 0
      },
      hideAlert: true,
      issuekeywordFilter: '',
      fabIssue: false,
      pinOn: false,
      disableIssueDiff: false,
      diffW: false,
      diffResult: '',
      diffIssues: [],
      localLoaded: false,
      hideFilterBtns: false,
      disableCompareMode: true,
      previousPDF: null,
      currentPDF: null,
      currentZipFIle: null,
      previousZipFile: null,
      configW: false,
      firstReview: false,
      commitFilterW: false,
      previousGoto: 0,
      issueFilterTime: false,
      issueFilterFlag: true,
      issueFilterClosed: true,
      issueFilterCommit: false,
      snapShot: false,
      filteredListW: true,
      pinMode: false,
      cType: true,
      pType: true,
      issueCite: undefined,
      citeColor: '#000',
      citeEraser: false,
      paintWidth: 100,
      paintHeight: 100,
      currentStageData: {
        pmTags: [],
        reviewerTags: [],
        vendorTags: [],
        writerTags: [],
        finalTags: []
      },
      selectedObjective: undefined,
      largeBtn: true,
      firstRun: true,
      issueList: [],
      uploadprogress: 0,
      uploadstatus: '',
      versionPopulated: false,
      issueListPopulated: false,
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
          text: '版本控制',
          icon: 'fa-code-branch',
          id: uuidv4()
        },
        {
          loaded: false,
          text: '未讀取的Issues',
          icon: 'fa-envelope-open-text',
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
      objectiveW: false,
      previousPos: 0,
      issueFile: undefined,
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
      videoWidth: 6,
      previousVersion: {
        _id: '',
        type: '',
        name: ''
      },
      readedIssueList: [],
      filterBtn: false,
      extendWord: '放大Issue區塊',
      progressW: false,
      previousPlayer: null,
      tipword: '',
      displaypanelHeight: 0,
      currentPlayer: null,
      playbackrate: 1,
      editlogw: false,
      issueareaWidth: 0,
      issuelistViewer: [],
      videoOptions: {
        autoplay: false,
        controls: true,
        fluid: true,
      },
      currentData: {
        position: undefined,
        total: undefined
      },
      previousData: {
        position: undefined,
        total: undefined
      },
    };
  }
};
</script>
