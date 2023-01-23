<template>
  <v-sheet>
    <v-dialog v-model="stageAccountingW" fullscreen hide-overlay transition='dialog-bottom-transition'>
      <v-card>
        <v-toolbar dark color='primary'>
          <v-btn icon dark @click='stageAccountingW = false'>
            <v-icon>fa-times</v-icon>
          </v-btn>
          <v-toolbar-title>
            本階段押金運用狀況（該組在本回合的押金剩餘：{{ queryBalance }}）
          </v-toolbar-title>
        </v-toolbar>
        <v-card-text class='text-left black--text text-body-1 pa-2 d-flex flex-column'>
          <v-simple-table v-if="stageAccounting.length > 0" class='black--text'>
            <template v-slot:default>
              <thead>
                <tr>
                  <th class="text-center">
                    押金點數
                  </th>
                  <th class="text-center">
                    使用狀況
                  </th>
                  <th class="text-center">
                    確認時間
                  </th>
                  <th class="text-right">
                    &nbsp;
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="accounting in stageAccounting"
                  :key="accounting._id"
                >
                  <td class="text-center">
                    {{ accounting.value }}
                  </td>
                  <td class="text-center">
                    {{ accounting.comment }}
                  </td>
                  <td class="text-center">
                    {{ dateConvert(accounting.tick) }}
                  </td>
                  <td>
                    <v-btn v-if="isSupervisor" color="primary" @click='rejectDeposit(accounting)'>取消帳目</v-btn>
                  </td>
                </tr>
              </tbody>
            </template>
          </v-simple-table>
          <div v-else>無資料（或者是你沒有權限存取別人的小組帳本）</div>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-dialog v-model="depositW" fullscreen hide-overlay transition='dialog-bottom-transition'>
      <v-card>
        <v-toolbar dark color='primary'>
          <v-btn icon dark @click='depositW = false'>
            <v-icon>fa-times</v-icon>
          </v-btn>
          <v-toolbar-title>
            <span v-if="isSupervisor">本階段各組參與狀況</span><span v-else>本階段參與狀況</span>
          </v-toolbar-title>
        </v-toolbar>
        <v-card-text class='text-left black--text text-body-1 pa-2 d-flex flex-column'>
          <v-alert outlined type="error" icon='fa-dollar-sign' class='text-left' v-if='notConfirm'>
            貴組尚未全員確認是否參與本回合，你可以按左上方關閉本對話框，但將會無法發表報告、評分（可以檢視別人的報告）
          </v-alert>
          <v-alert outlined type="info" icon='fa-dollar-sign' class='text-left' v-if='stageJoined === -1'>
            你不在該活動的名單中
          </v-alert>
          <v-alert outlined type="info" icon='fa-dollar-sign' class='text-left' v-if='stageJoined === 0'>
            你尚未加入回合，請按下面的按鍵決定你到底要不要加入回合
          </v-alert>
          <v-alert outlined type="info" icon='fa-dollar-sign' class='text-left' v-if="stageJoined > 0">
            你已經加入回合
          </v-alert>
          <div class="d-flex flex-row pa-2">
            <v-btn v-if="stageJoined === 0" color="primary" @click='joinStage(1)' class='flex-shrink-1 ma-1'>我要加入回合</v-btn>
            <v-btn v-if="stageJoined === 0" @click="joinStage(0)" class='flex-shrink-1 ma-1'>我不加入回合</v-btn>
            <v-btn v-show='!notConfirm' v-if="stageJoined > 0" color="primary" @click="depositAccounting(undefined)" class='flex-shrink-1 ma-1'>查詢本組回合帳本</v-btn>
          </div>
          <v-simple-table v-if="deposits.length > 0" class='black--text'>
            <template v-slot:default>
              <thead>
                <tr>
                  <th class="text-center">
                    姓名
                  </th>
                  <th class="text-center">
                    押金點數
                  </th>
                  <th class="text-center">
                    參與狀態
                  </th>
                  <th class="text-center">
                    確認時間
                  </th>
                  <th class="text-right">
                    &nbsp;
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="deposit in deposits"
                  :key="deposit._id"
                >
                  <td class='text-center'>
                    {{ deposit.uid.name }}
                  </td>
                  <td class="text-center">
                    {{ deposit.value }}
                  </td>
                  <td class="text-center">
                    <span v-if="deposit.confirmTick === 0">尚未確認</span>
                    <span v-else>{{ deposit.confirm ? "是" : "否" }}{{ deposit.confirmTick > 0 ? "[" + dateConvert(deposit.confirmTick) + "]" : "" }}</span>
                  </td>
                  <td class="text-center">
                    {{ deposit.joinTick > 0 ? dateConvert(deposit.joinTick) : "" }}
                  </td>
                  <td class="text-right d-flex flex-row">
                    <v-btn v-show="deposit.joinTick === 0" v-if="depositSupervisor" :disable="currentUser._id === deposit.uid._id" color="error" @click="joinStage(2, deposit.uid._id)" class='flex-shrink-1 ma-1'>踢除用戶</v-btn>
                    <v-btn v-show="showRevoke(deposit)" v-if="depositSupervisor" :disable="currentUser._id === deposit.uid._id" color="info" @click="revokeStage(deposit.uid._id)" class='flex-shrink-1 ma-1'>恢復用戶</v-btn>
                    <v-btn v-show="isSupervisor" color="primary" @click="depositAccounting(deposit)" class='flex-shrink-1 ma-1'>查詢該組回合帳本</v-btn>
                  </td>
                </tr>
              </tbody>
            </template>
          </v-simple-table>
          <div v-else>無資料（應該是還沒有用戶點進來這個階段）</div>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-dialog v-model="interventionW" fullscreen hide-overlay transition='dialog-bottom-transition'>
      <v-card>
        <v-toolbar dark color='primary'>
          <v-btn icon dark @click='interventionW = false'>
            <v-icon>fa-times</v-icon>
          </v-btn>
          <v-toolbar-title>
            檢視批改建議（目前為{{ interventions.length > 0 ? calcIntervention : "無" }}）
          </v-toolbar-title>
        </v-toolbar>
        <v-card-text class='text-left black--text text-body-1 pa-2 d-flex flex-column'>
          <v-text-field v-if='isSupervisor' outlined clearable dense label='批改建議內容' v-model='interventionObj.content'></v-text-field>
          <v-slider
            v-if='isSupervisor'
            :label='"調整為"+interventionObj.value+"%"'
            min='0'
            max='200'
            v-model="interventionObj.value"
            thumb-label
          ></v-slider>
          <v-btn
            class='white--text ma-1'
            color='blue darken-4'
            v-if='isSupervisor'
            :disabled='interventionObj.content === ""'
            @click='addIntervention'
          >
            送出批改建議
          </v-btn>
          <apexchart v-if="interventions.length > 0" type="line" width='100%' :height="interventHeight" :options="interventOpetions" :series="interventSeries"></apexchart>
          <v-simple-table v-if="interventions.length > 0" class='black--text'>
            <template v-slot:default>
              <thead>
                <tr>
                  <th class="text-left">
                    建議內容
                  </th>
                  <th class="text-center" style="width:25px">
                    調整比例
                  </th>
                  <th class="text-right">
                    時間和批改者
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="intervention in interventions"
                  :key="intervention._id"
                >
                  <td class='text-left'>
                    {{ intervention.content }}
                  </td>
                  <td class='text-center'>
                    {{ intervention.value }}%
                  </td>
                  <td class="text-right">
                    {{ dateConvert(intervention.tick) }}（{{ intervention.user.name }}）
                  </td>
                </tr>
              </tbody>
            </template>
          </v-simple-table>
          <v-btn
            class='white--text ma-1'
            color='red darken-4'
            @click='interventionW = false'
          >
            關閉對話框
          </v-btn>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-dialog v-model="groupfilterSelectorW" fullscreen hide-overlay transition='dialog-bottom-transition'>
      <v-card>
        <v-toolbar dark color='primary'>
          <v-btn icon dark @click='groupfilterSelectorW = false'>
            <v-icon>fa-times</v-icon>
          </v-btn>
          <v-toolbar-title>
            過濾你想看到的群組
          </v-toolbar-title>
        </v-toolbar>
        <v-card-text class='text-left black--text text-body-1 pa-2 d-flex flex-column'>
          <tag-filter
            v-if="isSupervisor"
            :mustSelected='false'
            :single='false'
            :selectedItem='selectedfilterTags'
            @valueUpdated='updateselectTags'
            :candidatedItem='filterTagList'
            :createable='false'
            label='選擇你想查詢的歸屬標籤'
          />
          <v-btn class='ma-1' v-if='isSupervisor' @click='setfilterTag'>
            查詢指定的標籤
          </v-btn>
          <v-btn
            class='white--text ma-1'
            color='red darken-4'
            @click='groupfilterSelectorW = false'
          >
            關閉對話框
          </v-btn>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="feedbackW"
      persistent
      max-width="50%"
    >
      <v-sheet class='d-flex flex-column pa-1'>
        <v-alert outlined type="error" icon='fa-dollar-sign' class='text-left' v-if='notConfirm'>
          貴組尚未全員確認是否參與本回合，你可以按左上方關閉本對話框，但將會無法發表報告、評分（可以檢視別人的報告）
        </v-alert>
        <v-alert outlined type="info" icon='fa-dollar-sign' class='text-left' v-if='userBalance <= 0'>
          你根本沒有點數，無法送出押金！（可能是你並沒有參與這個回合）
        </v-alert>
        <v-alert outlined type="info" icon='fa-dollar-sign' class='text-left' v-if='userBalance < defaultAudit.value'>
          你擁有的點數比對方給你的還少，你最多只能回復{{ intConvert(this.userBalance/this.defaultAudit.value) }}%而已，建議你等手上有更多點數再來回復
        </v-alert>
        <v-slider
          v-if='defaultReport.grantedDate === 0'
          :label='"投入"+defaultAudit.feedback+"點"'
          :min='minFeedback'
          :max='suggestedfeedBackValue'
          :step='defaultStage.depositStep'
          v-model="defaultAudit.feedback"
          :disabled='waitValue'
          thumb-label
        ></v-slider>
        <span class='text-caption red--text'>你的評分預估可以幫你得到{{ previewFeedback }}點（以實際工作者計算）</span>
        <v-menu
          offset-y
          attach
          left
          bottom
          transition="slide-y-transition"
        >
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              color='indigo darken-4'
              class='white--text ma-1'
              :disabled='suggestedfeedBackValue === 0 || defaultAudit.feedback === 0'
              v-bind="attrs" v-on="on"
              v-show="userBalance > 0"
            >
              回復對方互評
            </v-btn>
          </template>
          <v-sheet class='d-flex flex-column pa-1'>
            <div class='text-h6'>確認送出評分？</div>
            <v-btn
              class='white--text ma-1'
              color='red darken-4'
              @click='addFeedback'
            >
              是，我要送出評分！
            </v-btn>
            <div class='text-caption'>如果你只是誤觸，請隨意點擊其他地方即會關閉本對話框</div>
          </v-sheet>
        </v-menu>
        <v-btn
          class='white--text ma-1'
          color='red darken-4'
          @click='feedbackW = false'
        >
          關閉對話框
        </v-btn>
      </v-sheet>
    </v-dialog>
    <v-dialog v-model="descW" fullscreen hide-overlay transition='dialog-bottom-transition'>
      <v-card>
        <v-toolbar dark color='primary'>
          <v-btn icon dark @click='descW = false'>
            <v-icon>fa-times</v-icon>
          </v-btn>
          <v-toolbar-title>
            {{ defaultSchema.name }}的階段目標說明
          </v-toolbar-title>
        </v-toolbar>
        <v-card-text class='text-left black--text text-body-1 pa-2 d-flex flex-column'>
          <div class='text-body-1' v-html="HTMLConverter(defaultStage.desc)"></div>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-dialog v-model="googlelinkW" fullscreen hide-overlay transition='dialog-bottom-transition'>
      <v-card>
        <v-toolbar dark color='primary'>
          <v-btn icon dark @click='googlelinkW = false'>
            <v-icon>fa-times</v-icon>
          </v-btn>
          <v-toolbar-title>
            說明：如何從Google文件取得可分享連結
          </v-toolbar-title>
        </v-toolbar>
        <v-card-text class='text-left black--text text-body-1 pa-2 d-flex flex-column'>
          <v-img width="100%" src="@/assets/googlelink.gif" />
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-dialog v-model="falserateW" fullscreen hide-overlay transition='dialog-bottom-transition'>
      <v-card>
        <v-toolbar dark color='primary'>
          <v-btn icon dark @click='falserateW = false'>
            <v-icon>fa-times</v-icon>
          </v-btn>
          <v-toolbar-title>
            批改階段成果
          </v-toolbar-title>
        </v-toolbar>
        <v-card-text class='text-left black--text text-body-1 pa-2 d-flex flex-column'>
          <v-alert outlined type="error" icon='fa-dollar-sign' class='text-left' v-if='notConfirm'>
            貴組尚未全員確認是否參與本回合，你可以按左上方關閉本對話框，但將會無法發表報告、評分（可以檢視別人的報告）
          </v-alert>
          <v-alert outlined type="info" icon='fa-info-circle' class='text-left' v-if='falseAudit' v-show='isSupervisor'>
            這份報告評分有負分，如果你要自動評分，你必須勾選評分結果無誤
          </v-alert>
          <v-alert outlined type="info" icon='fa-info-circle' class='text-left' v-if='defaultReport.locked' v-show='isSupervisor'>
            這份報告已經被鎖住，你必須手動批改
          </v-alert>
          <v-alert outlined type="info" icon='fa-info-circle' class='text-left' v-if='defaultReport.audits.length === 0' v-show='isSupervisor'>
            這份報告無人評分，系統自動將手動給分的上限改為自評分
          </v-alert>
          <v-alert outlined type="info" icon='fa-info-circle' class='text-left'>
            你的評分預估可以幫該報告負責人得到{{ previewReport }}點（以實際工作者計算），你已勾選{{ getConfirmed() }}份評分
          </v-alert>
          <v-switch
            v-model="ignoreTime"
            label="不計入時間分（如果你要懲罰特殊的人群）"
          ></v-switch>
          <v-slider
            :label='"給分為"+defaultReport.grantedValue+"點"'
            min='0'
            :max='auditValues'
            :disabled='waitValue'
            v-model="defaultReport.grantedValue"
            thumb-label
          ></v-slider>
          <v-btn class='ma-1' @click='saveGrant()'>強制寫入評分</v-btn>
          <v-btn class='ma-1' v-if='!falseAudit' @click='calcReport()'>啟動自動評分</v-btn>
          <span class='text-caption red--text text-center'>如果是決勝點，你必須在同標籤報告都完成評分後，再按下評分按鈕才會發點數（因為決勝點得看名次發點）</span>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-dialog v-model='reportW' fullscreen hide-overlay transition='dialog-bottom-transition'>
      <v-card>
        <v-toolbar dark color='primary'>
          <v-btn icon dark @click='closeReport()'>
            <v-icon>fa-times</v-icon>
          </v-btn>
          <v-toolbar-title>
            檢視{{ getCoworkers(defaultReport.coworkers) }}的本階段成果
            <span v-if='defaultReport.grantedDate > 0'>(已在{{ dateConvert(defaultReport.grantedDate) }}批改，</span>
            <span v-if='defaultReport.gained > 0'>獲得{{ defaultReport.grantedValue }}點)</span>
            <span v-if='defaultReport.gained === 0'>尚未發點)</span>
          </v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon dark v-if="isSupervisor" v-show='defaultReport.gained === 0' @click='falserateW = true'>
            <v-icon>fa-pen-alt</v-icon>
          </v-btn>
        </v-toolbar>
        <v-card-text class='text-left black--text text-body-1 pa-2 d-flex flex-column'>
          <v-alert outlined v-if='waitValue' type="info" icon='fa-info-circle' class='text-left'>
            用戶財產計算中請稍候
          </v-alert>
          <v-alert outlined v-if='defaultStage.matchPoint' type="info" icon='fa-info-circle' class='text-left'>
            這回合是決勝點，會關閉自動評分，最終得分會把點數在乘上名次（按照評分結果決定）
          </v-alert>
          <v-alert outlined v-if='defaultStage.replyDisabled > 0' type="info" icon='fa-comment-slash' class='text-left'>
            本回合暫停評分，請等待開放評分時再來
          </v-alert>
          <v-alert outlined type="info" icon='fa-info-circle' class='text-left'>
            <span v-if='falseAudit'>這份報告有負評，已關閉自動評分</span><span v-else>收到{{ groupGap }}份評分後系統會關閉互評，報告組確認互評後，會啟動自動評分</span>，現在已經收到{{ defaultReport.audits.length }}份評分<span v-if='isAuthor'>，你可以確認對方的評分是否正確</span><span v-if='allowAudit()'>，快來給這份報告一個評分吧！</span>
          </v-alert>
          <v-btn class='ma-1 white--text' v-if='allowAudit()' v-show='enableAudit' @click='addAudit' color='red darken-4'>給予評分</v-btn>
          <v-btn class='ma-1' v-if='defaultReport.intervention.length > 0 || isSupervisor' @click='viewIntervention(defaultReport, 0)'>{{ isSupervisor ? "新增／" : "" }}查看批改建議（{{ defaultReport.intervention.length }}）</v-btn>
          <apexchart type="bar" width='100%' :height="scoreHeight" :options="chartOptions" :series="chartSeries"></apexchart>
          <div class='text-subtitle-2 font-weight-blod'>成果內容</div>
          <v-divider></v-divider>
          <div class='text-body-1' v-html="HTMLConverter(defaultReport.content)"></div>
          <div class='text-subtitle-2 font-weight-blod'>評分列表（已有{{ defaultReport.audits.length }}份互評）</div>
          <v-divider></v-divider>
          <v-lazy
            :options="{
              threshold: 0.5
            }"
            min-height="70"
            transition="fade-transition"
            v-for='(item, bg) in defaultReport.audits' :key='item._id'
          >
            <div class='ma-1 flex-column pa-1' :class='bg % 2 === 0 ? "grey lighten-4" : "white"'>
              <div class='d-flex flex-row'>
                <div class='pa-1 justify-center d-flex flex-column'>
                  <v-icon v-if='item.short'>fa-thumbs-down</v-icon>
                  <v-icon v-else>fa-thumbs-up</v-icon>
                </div>
                <div class='ma-1 d-flex flex-column ma-1 justify-center font-weight-bold text-caption'>
                  <div v-if='groupCheck(item)' class="blue--text darken-4">同組評分</div>
                  <div v-if='item.feedbackTick === 0' class="red--text darken-4">尚未確認</div>
                  <div v-if='item.feedbackTick > 0' class="green--text darken-4">已經確認</div>
                </div>
                <div class="d-flex text-left flex-column justify-center">
                  <div v-html="HTMLConverter(item.content)"></div>
                  <div class='text-left text-body-2'>
                    <span>給分{{ item.value }}點</span>
                    <span> | 建立於{{ dateConvert(item.tick) }}</span>
                    <span v-if='item.feedbackTick > 0'> | 已於{{ dateConvert(item.feedbackTick) }}確認為{{ item.feedback }}，預估這份評分值{{ predictScore(item.value, item.feedback, item.short) }}</span>
                  </div>
                </div>
              </div>
              <div class='d-flex flex-row align-center justify-end'>
                <v-btn
                  @click='agreeAudit(item)'
                  v-if="isSupervisor" v-show='defaultReport.gained === 0'
                  class='ma-1'
                >
                  <span v-if='item.confirm === 0'>認可互評</span>
                  <span v-if='item.confirm > 0'>撤回認可</span>
                </v-btn>
                <v-btn
                  @click='viewIntervention(item, 1)'
                  v-if='item.intervention.length > 0 || isSupervisor'
                  class='ma-1'
                >
                  {{ isSupervisor ? "新增／" : "" }}查看批改建議({{ item.intervention.length }})
                </v-btn>
                <v-menu
                  offset-y
                  attach
                  left
                  transition="slide-y-transition"
                  v-if='isSupervisor || isLeader(item, false)'
                >
                  <template v-slot:activator="{ on: menu, attrs }">
                    <v-btn
                      v-bind="attrs"
                      v-on="{ ...menu }"
                      v-if="item.feedbackTick === 0"
                    >
                      撤回互評
                    </v-btn>
                  </template>
                  <v-sheet class='d-flex flex-column pa-1'>
                    <div class='text-h6'>確認撤回互評？不會退回你原本的押金喔</div>
                    <v-btn
                      color='red accent-4'
                      class='white--text ma-1'
                      @click='revokeAudit(item)'
                    >
                      確認撤回互評
                    </v-btn>
                    <div class='text-caption'>如果你只是誤觸，請隨意點擊其他地方即會關閉本對話框</div>
                  </v-sheet>
                </v-menu>
                <v-btn
                  @click='setFeedback(item)'
                  v-if='isAuthor' v-show='acceptFeedback(item)'
                  class='ma-1'
                >
                  回復互評
                </v-btn>
              </div>
            </div>
          </v-lazy>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-dialog v-model='auditW' fullscreen hide-overlay transition='dialog-bottom-transition'>
      <v-card>
        <v-toolbar dark color='primary'>
          <v-btn icon dark @click='auditW = false'>
            <v-icon>fa-times</v-icon>
          </v-btn>
          <v-toolbar-title>給予評分</v-toolbar-title>
        </v-toolbar>
        <v-card-text class='text-left black--text text-body-1 pa-2 d-flex flex-column'>
          <v-alert outlined type="error" icon='fa-dollar-sign' class='text-left' v-if='notConfirm'>
            貴組尚未全員確認是否參與本回合，你可以按左上方關閉本對話框，但將會無法發表報告、評分（可以檢視別人的報告）
          </v-alert>
          <v-alert outlined v-if='waitValue' type="info" icon='fa-info-circle' class='text-left'>
            用戶財產計算中請稍候
          </v-alert>
          <v-alert outlined type="info" icon='fa-dollar-sign' class='text-left' v-if='userBalance <= 0'>
            你根本沒有點數，無法送出押金！（可能是你並沒有參與這個回合）
          </v-alert>
          <div class='text-subtitle-2 font-weight-blod'>好評／負評</div>
          <v-switch
            v-model="defaultAudit.short"
            :label="'我要給負評（負評成功積點放大' + defaultSchema.shortBonus + '倍）'"
          ></v-switch>
          <div class='text-subtitle-2 font-weight-blod'>共同作者</div>
          <tag-filter
            :mustSelected='true'
            :single='false'
            :selectedItem='defaultAudit.coworkers'
            @valueUpdated='updateACoworkers'
            :candidatedItem='savedCoworker'
            @updateTags='fetchCoworkers'
            :createable='false'
            label='請輸入用戶名稱'
          />
          <div class='text-subtitle-2 font-weight-blod'>投入點數</div>
          <div class='text-caption'>這份階段成果的自評分為{{ defaultReport.value }}，而你的財產是{{ userBalance }}，因此你能投下去的點數不可以超過{{ auditsuggestValue }}</div>
          <v-slider
            :label='"投入"+defaultAudit.value+"點"'
            min='0'
            :max='auditsuggestValue'
            :disabled='waitValue'
            :step='defaultStage.depositStep'
            v-model="defaultAudit.value"
            thumb-label
          ></v-slider>
          <span class='text-caption red--text'>你的評分預估可以幫你得到{{ previewAudit }}點（以實際工作者計算），<span v-if='defaultAudit.coworkers.length > 0'>共同作者有{{ defaultAudit.coworkers.length + 1 }}人，每個人出{{ Math.floor(defaultAudit.value / (defaultAudit.coworkers.length + 1)) }}點</span></span>
          <div class='text-subtitle-2 font-weight-blod'>給予短評（必填）</div>
          <Tip-Tap
            v-model="defaultAudit.content"
            maxHeight="10vh"
            minHeight="10vh"
            hint='請不要留白'
          />
          <v-menu
            offset-y
            attach
            left
            bottom
            transition="slide-y-transition"
            v-if='defaultAudit.value > 0'
          >
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                color='indigo darken-4'
                class='white--text ma-1'
                :disabled='defaultAudit.content === ""'
                v-show='userBalance > 0'
                v-bind="attrs" v-on="on"
              >
                送出評分
              </v-btn>
            </template>
            <v-sheet class='d-flex flex-column pa-1'>
              <div class='text-h6'>確認送出評分？</div>
              <v-btn
                class='white--text ma-1'
                color='red darken-4'
                @click='submitAudit'
              >
                是，我要送出評分！
              </v-btn>
              <div class='text-caption'>如果你只是誤觸，請隨意點擊其他地方即會關閉本對話框</div>
            </v-sheet>
          </v-menu>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-dialog v-model='addreportW' fullscreen hide-overlay transition='dialog-bottom-transition'>
      <v-card>
        <v-toolbar dark color='primary'>
          <v-btn icon dark @click='addreportW = false'>
            <v-icon>fa-times</v-icon>
          </v-btn>
          <v-toolbar-title>發送階段成果</v-toolbar-title>
        </v-toolbar>
        <v-card-text class='pa-0 ma-0 text-left black--text text-body-1 pa-2 d-flex flex-column'>
          <v-alert outlined type="error" icon='fa-dollar-sign' class='text-left' v-if='notConfirm'>
            貴組尚未全員確認是否參與本回合，你可以按左上方關閉本對話框，但將會無法發表報告、評分（可以檢視別人的報告）
          </v-alert>
          <v-alert outlined v-if='waitValue' type="info" icon='fa-info-circle' class='text-left'>
            用戶財產計算中請稍候
          </v-alert>
          <v-alert outlined type="info" icon='fa-dollar-sign' class='text-left' v-if='userBalance <= 0'>
            你根本沒有點數，無法送出押金！（可能是你並沒有參與這個回合）
          </v-alert>
          <div class='text-subtitle-2 font-weight-blod'>共同作者</div>
          <tag-filter
            :mustSelected='true'
            :single='false'
            :selectedItem='defaultReport.coworkers'
            @valueUpdated='updateCoworkers'
            :candidatedItem='savedCoworker'
            @updateTags='fetchCoworkers'
            :createable='false'
            label='請輸入用戶名稱'
          />
          <div v-if='suggestedValue > 0' class='text-subtitle-2 font-weight-blod'>你們這組的押金為{{ suggestedValue }}，每次下注為{{ defaultStage.depositStep }}的倍數，請注意，謹慎使用押金，押金還要拿去互評和確認彼此的分數）</div>
          <v-slider
            v-if='suggestedValue > 0'
            :label='"投入"+defaultReport.value+"點"'
            min='0'
            :max='suggestedValue'
            :disabled='waitValue'
            :step='defaultStage.depositStep'
            v-model="defaultReport.value"
            thumb-label
          ></v-slider>
          <span class='text-caption red--text'>如果其他人和你的看法相同，你的自評分可以幫你得到{{ previewReport }}點<span v-if='defaultReport.coworkers.length > 0'>，共同作者有{{ defaultReport.coworkers.length + 1 }}人，每個人出{{ Math.ceil(defaultReport.value / (defaultReport.coworkers.length + 1)) }}點</span></span>
          <div class='text-subtitle-2 font-weight-blod'>成果內容（Google文件請貼連結）</div>
          <Tip-Tap
            v-model="defaultReport.content"
            maxHeight="10vh"
            minHeight="10vh"
            hint='請不要留白'
          />
          <v-menu
            offset-y
            attach
            left
            bottom
            transition="slide-y-transition"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                color='indigo darken-4'
                class='white--text ma-1'
                :disabled='suggestedValue === 0 || defaultReport.value === 0'
                v-show="userBalance > 0"
                v-bind="attrs" v-on="on"
              >
                送出階段成果
              </v-btn>
            </template>
            <v-sheet class='d-flex flex-column pa-1'>
              <div class='text-h6'>確認階段成果？</div>
              <v-btn
                class='white--text ma-1'
                color='red accent-4'
                @click='submitReport'
              >
                是，我要送出本階段成果！
              </v-btn>
              <div class='text-caption'>如果你只是誤觸，請隨意點擊其他地方即會關閉本對話框</div>
            </v-sheet>
          </v-menu>
          <v-btn
            @click='viewDesc()'
            v-if='defaultStage._id !== undefined'
            class='ma-1'
          >
            送出前最好點此再看一次階段說明喔！
          </v-btn>
          <v-btn
            @click='googlelinkW = true'
            v-if='defaultStage._id !== undefined'
            class='ma-1'
          >
            按此查看如何複製Google文件的可檢視連結說明
          </v-btn>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-alert outlined type="info" icon='fa-info-circle' v-if='defaultStage._id !== undefined' class='text-left'>
      {{ defaultStage.name }}：回合倍率為{{ defaultStage.value }}倍，組員得分倍率{{ defaultSchema.memberRate }}倍，組長得分倍率{{ defaultSchema.leaderRate }}倍，實際工作者得分倍率{{ defaultSchema.workerRate }}倍，截止時間是：{{ dateConvert(defaultStage.endTick) }}，已收到{{ defaultStage.reports.length }}份階段成果
    </v-alert>
    <v-alert outlined type="info" icon='fa-info-circle' v-if='defaultStage.matchPoint' class='text-left'>
      決勝點：本回合是按照每份階段成果的得分高低計算名次，得分會根據名次加成
    </v-alert>
    <v-alert outlined type="error" icon='fa-skull' v-if='defaultStage.closed > 0' class='text-left'>
      {{ dateConvert(defaultStage.closed) }}起，本回合不收成果啦！
    </v-alert>
    <v-alert outlined type="info" icon='fa-comment-slash' v-if='defaultStage.replyDisabled' class='text-left'>
      {{ dateConvert(defaultStage.replyDisabled) }}起，本回合禁止評分啦！（你還是可以發成果）
    </v-alert>
    <div class='d-flex flex-column pa-1'>
      <div class='blue-grey--text darken-1 text-caption' v-if='defaultStage._id === undefined'>本活動共{{ defaultSchema.stages.length }}個回合，請點擊任何一個回合後點右下角繳交本階段成果（旗子為目前開放的階段）</div>
      <v-stepper v-model="stepPointer">
        <v-stepper-header>
          <template>
            <div v-for='(stage, index) in defaultSchema.stages' :key='stage._id'>
              <v-stepper-step
                :complete="stepPointer >= index"
                :step='index + 1'
                complete-icon='fa-flag'
                edit-icon='fa-pencil-alt'
                @click="getStage(stage)"
              >
                <span :class='(index + 1) === stepPointer ? "text--indigo darken-4" : ""'>
                  <v-icon v-if='stage.matchPoint'>fa-bomb</v-icon>
                  {{ stage.name }}
                </span>
              </v-stepper-step>
              <v-divider
                v-if='(index + 1) !== defaultSchema.stages.length'
              ></v-divider>
            </div>
          </template>
        </v-stepper-header>
      </v-stepper>
      <v-btn
        @click='viewDesc()'
        class='ma-1'
        v-if='defaultStage._id !== undefined'
      >
        查看本階段說明
      </v-btn>
      <v-btn
        color="indigo darken-4"
        @click='addReport()'
        class="white--text ma-1"
        v-if='stageAllowed()'
        v-show='defaultStage.closed === 0'
      >
        繳交本階段成果
      </v-btn>
    </div>
    <v-divider></v-divider>
    <apexchart v-if='reportList.length > 0' width="100%" type="bar" :options="reportOptions" :series="reportSeries" :height="reportHeight"></apexchart>
    <v-btn-toggle v-model="reportFilters" multiple v-if='reportList.length > 0'>
      <v-btn @click='orderBy === 0 ? 1 : 0'>
        用「互評能拿最多分」排序
      </v-btn>
      <v-btn @click='filterCoworker = !filterCoworker'>
        查看我是共同作者的成果
      </v-btn>
      <v-btn @click='groupFilter()'>
        查看我這組的成果
      </v-btn>
      <v-btn v-if='isSupervisor' @click='groupfilterSelectorW = true'>
        查看特定歸屬標籤的組別成果
      </v-btn>
      <v-btn @click='clearFilter'>
        清除過濾器
      </v-btn>
    </v-btn-toggle>
    <v-lazy
      :options="{
        threshold: 0.5
      }"
      min-height="70"
      transition="fade-transition"
      v-for='(item, bg) in filteredReportList' :key='item._id'
    >
      <div class='d-flex flex-column ma-1 pa-1' :class='bg % 2 === 0 ? "grey lighten-4" : "white"'>
        <div class='d-flex flex-row'>
          <div class='d-flex flex-column justify-center align-center ma-1'>
            <Avatar :user='firstCoworker(item.coworkers)' :size='36'/>
            <div v-if="item.coworkers.length > 0" class="text-caption">作者×{{ item.coworkers.length }}</div>
          </div>
          <div class='d-flex flex-column ma-1 align-center justify-center'>
            <span :class="item.gained > 0 ? 'teal darken-4' : 'red darken-4'" class='white--text text-caption pa-1'>{{ item.gained > 0 ? "已批改" : "未批改" }}</span>
            <span class='text-caption'>各組互評×{{ item.audits.length }}</span>
            <span class='text-caption'>批改建議×{{ item.intervention.length }}</span>
          </div>
          <div class='ma-1 d-flex flex-column ma-1 justify-center font-weight-bold text-caption'>
            <div v-if='groupCheck(item)' class="blue--text darken-4">同組</div>
            <div v-if='item.locked' class="red--text darken-4">鎖定</div>
            <div v-if='(item.tick - defaultStage.endTick) > 0' class="red--text darken-4">遲交</div>
          </div>
          <div class="d-flex flex-column pa-1 justify-center">
            <div class='text-left font-weight-bold'>繳交人：{{ getCoworkers(item.coworkers) }}</div>
            <div class='text-left text-body-2'>
              <span>建立於{{ dateConvert(item.tick) }}</span>
              <span v-if='item.gained > 0'> | 得分： {{ item.grantedValue }}(批改於{{ dateConvert(item.grantedDate) }})</span>
            </div>
          </div>
        </div>
        <div class='d-flex flex-row align-center justify-end'>
          <v-btn @click='viewReport(item)' class='ma-1'>
            檢視成果
          </v-btn>
          <v-btn
            @click='lockReport(item)'
            v-if="isSupervisor" v-show='item.gained === 0'
             class='ma-1'
          >
            <span v-if='item.locked'>解鎖報告</span>
            <span v-else>鎖住報告</span>
          </v-btn>
          <v-menu
            offset-y
            attach
            left
            transition="slide-y-transition"
            v-if='isSupervisor || isLeader(item, true)'
          >
            <template v-slot:activator="{ on: menu, attrs }">
              <v-btn
                v-bind="attrs"
                v-on="{ ...menu }"
                v-show='item.gained === 0'
              >
                撤回階段成果
              </v-btn>
            </template>
            <v-sheet class='d-flex flex-column pa-1'>
              <div class='text-h6'>確認撤回階段成果？不會退回你原本的押金喔</div>
              <v-btn
                color='red accent-4'
                class='white--text ma-1'
                @click='revokeReport(item)'
              >
                確認撤回階段成果
              </v-btn>
              <div class='text-caption'>如果你只是誤觸，請隨意點擊其他地方即會關閉本對話框</div>
            </v-sheet>
          </v-menu>
          <v-btn @click='groupFilter(item.gid)'>只看這組的成果</v-btn>
        </div>
      </div>
    </v-lazy>
  </v-sheet>
</template>

<script>
// @ is an alias to /src
import Vue from 'vue';
import dayjs from 'dayjs';
import _sumBy from 'lodash/sumBy';
import _meanBy from 'lodash/meanBy';
import _uniqBy from 'lodash/uniqBy';
import _map from 'lodash/map';
import _filter from 'lodash/filter';
import _inRange from 'lodash/inRange';
import _orderBy from 'lodash/orderBy';
import _unionWith from 'lodash/unionWith';
import _toString from 'lodash/toString';
import _intersectionWith from 'lodash/intersectionWith'
import VueApexCharts from 'vue-apexcharts';
import { marked } from 'marked';
const renderer = new marked.Renderer();
const linkRenderer = renderer.link;
Vue.use(VueApexCharts);
Vue.component('apexchart', VueApexCharts);

renderer.link = (href, title, text) => {
  if(href !== undefined) { href = (decodeURIComponent(href)).replace(/\\/g, ''); }
  if(title !== undefined) { title = (decodeURIComponent(title)).replace(/\\/g, ''); }
  if(text !== undefined) { text = (decodeURIComponent(text)).replace(/\\/g, ''); }
  const html = linkRenderer.call(renderer, href, title, text);
  return html.replace(/^<a /, '<a target="_blank" rel="nofollow" ');
};

export default {
  name: 'reportViewer',
  props: {
    sid: String
  },
  beforeDestroy () {
    this.$socket.client.off('rejectAudit', this.socketrejectAudit);
    this.$socket.client.off('rejectReport', this.socketrejectReport);
    this.$socket.client.off('getSchema', this.socketgetSchema);
    this.$socket.client.off('getStage', this.socketgetStage);
    this.$socket.client.off('getTagUsers', this.socketgetTagUsers);
    this.$socket.client.off('getDepositBalance', this.socketgetDepositBalance);
    this.$socket.client.off('getReports', this.socketgetReports);
    this.$socket.client.off('getCoworkers', this.socketgetCoworkers);
    this.$socket.client.off('addReport', this.socketaddReport);
    this.$socket.client.off('addAudit', this.socketaddAudit);
    this.$socket.client.off('calcReport', this.socketcalcReport);
    this.$socket.client.off('getReport', this.socketgetReport);
    this.$socket.client.off('auditFeedback', this.socketauditFeedback);
    this.$socket.client.off('setGrant', this.socketsetGrant);
    this.$socket.client.off('confirmAudit', this.socketconfirmAudit);
    this.$socket.client.off('previewFeedback', this.socketpreviewFeedback);
    this.$socket.client.off('previewAudit', this.socketpreviewAudit);
    this.$socket.client.off('getAuditionGap', this.socketgetAuditionGap);
    this.$socket.client.off('lockReport', this.socketlockReport);
    this.$socket.client.off('previewReport', this.socketpreviewReport);
    this.$socket.client.off('getOwnGroup', this.socketgetOwnGroup);
    this.$socket.client.off('getGroupTags', this.socketgetGroupTags);
    this.$socket.client.off('getTagGroups', this.socketgetTagGroups);
    this.$socket.client.off('getInterventions', this.socketgetInterventions);
    this.$socket.client.off('addIntervention', this.socketaddIntervention);
    this.$socket.client.off('getDeposit', this.socketgetDeposit);
    this.$socket.client.off('joinStage', this.socketjoinStage);
    this.$socket.client.off('getDepositAccounting', this.socketgetDepositAccounting);
    this.$socket.client.off('rejectDeposit', this.socketrejectDeposit);
    this.$socket.client.off('revokeDeposit', this.socketrevokeDeposit);
  },
  components: { 
    TagFilter: () => import(/* webpackChunkName: 'TagFilter', webpackPrefetch: true */ './modules/TagFilter'),
    TipTap: () => import(/* webpackChunkName: 'TipTap', webpackPrefetch: true */ './modules/TipTap'),
    Avatar: () => import(/* webpackChunkName: 'Avatar', webpackPrefetch: true */ './modules/Avatar'),
  },
  created () {
    this.$socket.client.emit('getOwnGroup', this.sid);
    this.$socket.client.on('getSchema', this.socketgetSchema);
    this.$socket.client.on('getDeposit', this.socketgetDeposit);
    this.$socket.client.on('rejectAudit', this.socketrejectAudit);
    this.$socket.client.on('rejectReport', this.socketrejectReport);
    this.$socket.client.on('getReports', this.socketgetReports);
    this.$socket.client.on('getStage', this.socketgetStage);
    this.$socket.client.on('getTagUsers', this.socketgetTagUsers);
    this.$socket.client.on('getDepositBalance', this.socketgetDepositBalance);
    this.$socket.client.on('getCoworkers', this.socketgetCoworkers);
    this.$socket.client.on('addReport', this.socketaddReport);
    this.$socket.client.on('addAudit', this.socketaddAudit);
    this.$socket.client.on('calcReport', this.socketcalcReport);
    this.$socket.client.on('getReport', this.socketgetReport);
    this.$socket.client.on('auditFeedback', this.socketauditFeedback);
    this.$socket.client.on('setGrant', this.socketsetGrant);
    this.$socket.client.on('confirmAudit', this.socketconfirmAudit);
    this.$socket.client.on('previewFeedback', this.socketpreviewFeedback);
    this.$socket.client.on('previewAudit', this.socketpreviewAudit);
    this.$socket.client.on('previewReport', this.socketpreviewReport);
    this.$socket.client.on('getAuditionGap', this.socketgetAuditionGap);
    this.$socket.client.on('lockReport', this.socketlockReport);
    this.$socket.client.on('getOwnGroup', this.socketgetOwnGroup);
    this.$socket.client.on('getGroupTags', this.socketgetGroupTags);
    this.$socket.client.on('getTagGroups', this.socketgetTagGroups);
    this.$socket.client.on('getInterventions', this.socketgetInterventions);
    this.$socket.client.on('addIntervention', this.socketaddIntervention);
    this.$socket.client.on('joinStage', this.socketjoinStage);
    this.$socket.client.on('getDepositAccounting', this.socketgetDepositAccounting);
    this.$socket.client.on('rejectDeposit', this.socketrejectDeposit);
    this.$socket.client.on('revokeDeposit', this.socketrevokeDeposit);
  },
  watch: {
    'defaultAudit.feedback': function () {
      if(this.feedbackW) {
        this.$socket.client.emit('previewFeedback', this.defaultAudit);
      }
    },
    'defaultAudit.value': function () {
      if(this.auditW) {
        this.$socket.client.emit('previewAudit', {
          report: this.defaultReport,
          value: this.defaultAudit.value,
          short: this.defaultAudit.short
        });
      }
    },
    'defaultAudit.short': function () {
      if(this.auditW) {
        this.$socket.client.emit('previewAudit', {
          report: this.defaultReport,
          value: this.defaultAudit.value,
          short: this.defaultAudit.short
        });
      }
    },
    'defaultReport.value': function () {
      if(this.addreportW) {
        this.$socket.client.emit('previewReport', {
          stage: this.defaultStage,
          value: this.defaultReport.value
        });
      }
    },
    'defaultReport.grantedValue': function () {
      if(this.falserateW) {
        this.$socket.client.emit('previewReport', {
          stage: this.defaultStage,
          value: this.defaultReport.grantedValue
        });
      }
    },
    filterGroups: {
      handler: function() {
        this.filterReport();
      },
      deep: true,
      immediate: true
    },
    filterCoworker: function() {
      this.filterReport();
    },
    orderBy: function() {
      this.filterReport();
    }
  },
  computed: {
    notConfirm: function() {
      if(!this.isSupervisor) {
        let groups = _uniqBy(this.deposits, (deposit) => {
          return deposit.gid;
        });
        if(groups.length === 1) {
          let notConfirm = _filter(this.deposits, (deposit) => {
            return deposit.joinTick === 0;
          });
          return notConfirm.length > 0;
        }
      }
      return false;
    },
    queryBalance: function() {
      return _sumBy(this.stageAccounting, (accounting) => {
        return accounting.value;
      });
    },
    calcIntervention: function() {
      if(this.interventions.length > 0) {
        return Math.ceil(_meanBy(this.interventions, (intervent) => {
          return intervent.value;
        })) + "%";
      }
      return "";
    },
    enableAudit: function() {
      return this.groupGap - this.defaultReport.audits.length > 0;
    },
    savedTags: function () {
      return this.$store.state.savedTags;
    },
    currentUser: function () {
      return this.$store.state.currentUser;
    },
    now: function() {
      return dayjs().unix();
    }
  },
  methods: {
    socketrevokeDeposit: function() {
      this.$emit('toastPop', "用戶押金狀態修改完成，請通知用戶可以投放押金");
    },
    showRevoke: function(deposit) {
      let now = dayjs().unix();
      if(this.defaultStage.endTick > now) {
        if(deposit.value === 0) {
          if(deposit.joinTick > 0) return true;
        }
      }
      return false;
    },
    revokeStage: function(user) {
      this.$socket.client.emit('revokeDeposit', {
        tid: this.defaultStage._id,
        user: user
      });
    },
    socketrejectDeposit: function() {
      this.$socket.client.emit('getDepositAccounting', {
        tid: this.defaultStage._id,
        gid: this.defaultGroup._id
      });
    },
    socketgetDepositAccounting: function(data) {
      this.stageAccounting = data;
      this.stageAccountingW = true;
    },
    rejectDeposit: function(accounting) {
      this.$socket.client.emit('rejectDeposit', accounting);
    },
    depositAccounting: function(deposit) {
      if(deposit !== undefined) {
        this.defaultGroup._id = deposit.gid;
      }
      this.$socket.client.emit('getDepositAccounting', {
        tid: this.defaultStage._id,
        gid: this.defaultGroup._id
      });
    },
    socketjoinStage: function(data) {
      this.$emit('toastPop', data ? "加入回合狀態修改完成！" : "您無法加入回合！");
      this.$socket.client.emit('getDeposit', {
        tid: this.defaultStage._id,
      });
    },
    joinStage: function(status, user) {
      if(status === 0) {
        this.$socket.client.emit('joinStage', {
          tid: this.defaultStage._id,
          confirm: false
        });
      } else if(status === 1) {
        this.$socket.client.emit('joinStage', {
          tid: this.defaultStage._id,
          confirm: true
        });
      } else {
        this.$socket.client.emit('joinStage', {
          tid: this.defaultStage._id,
          confirm: false,
          queryUser: user
        });
      }
    },
    socketgetDeposit: function(data) {
      let oriobj = this;
      this.$socket.client.emit('getDepositBalance', {
        tid: this.defaultStage._id
      });
      this.deposits = _orderBy(data.deposits, ['gid', 'value'], ['asc', 'desc']);
      let stageCheck = _filter(this.deposits, (deposit) => {
        return deposit.uid._id === oriobj.currentUser._id;
      });
      if(stageCheck.length > 0) {
        this.stageJoined = stageCheck[0].joinTick
        this.defaultGroup._id = stageCheck[0].gid;
      } else {
        this.stageJoined = -1;
      }
      this.depositSupervisor = data.isSupervisor;
      this.depositW = true;
    },
    socketrejectAudit: function() {
      this.$emit('toastPop', '互評已撤銷');
      this.$socket.client.emit('getReport', this.defaultReport);
    },
    socketaddIntervention: function(data) {
      this.viewIntervention(data, data.type);
    },
    addIntervention: function() {
      this.$socket.client.emit('addIntervention', this.interventionObj);
    },
    socketgetInterventions: function(data) {
      if(data._id === this.interventionObj._id) {
        this.interventions = data.interventions;
        this.renderIntervention();
        if(!this.interventionW) {
          this.interventionW = true;
        }
      }
    },
    viewIntervention: function(obj, type) {
      this.interventionObj._id = obj._id;
      this.interventionObj.type = type;
      this.interventionObj.value = 0;
      this.interventionObj.content = "";
      this.$socket.client.emit('getInterventions', this.interventionObj);
    },
    intConvert: function(val) {
      return parseInt(Math.floor(val * 100));
    },
    clearFilter: function() {
      this.filterGroups = [];
      this.reportFilters = [];
    },
    updateselectTags: function(value) {
      this.selectedfilterTags = value;
    },
    socketgetTagGroups: function(data) {
      let taggroups = _map(data, (group) => {
        return group._id;
      });
      this.filterGroups = _unionWith(taggroups, this.filterGroups, (qgroup,fgroup) => {
        return qgroup === fgroup;
      })
    },
    setfilterTag: function() {
      this.$socket.client.emit('getTagGroups', {
        tid: this.defaultStage._id,
        ids: this.selectedfilterTags
      });
    },
    socketgetGroupTags: function(data) {
      this.filterTagList = _intersectionWith(this.savedTags, data, (stag, gtag) => {
        return stag._id === gtag;
      })
    },
    socketgetOwnGroup: function(data) {
      this.ownGroup = data;
      this.$socket.client.emit('getSchema', this.sid);
    },
    acceptFeedback: function(audit) {
      if(this.defaultReport.gained === 0) {
        if(audit.feedbackTick === 0) {
          return true;
        }
      }
      return false;
    },
    getConfirmed: function() {
      return (_filter(this.defaultReport.audits, (audit) => {
        return audit.confirm > 0;
      })).length;
    },
    socketpreviewReport: function(data) {
      if(data.query === this.defaultReport.value || data.query === this.defaultReport.grantedValue) {
        this.previewReport = data.score;
      }
    },
    firstCoworker: function(users) {
      if(users.length > 0) {
        return users[0];
      } else {
        return {
          _id: 'notSet',
          types: 'bottts',
          name: 'notSet',
          unit: 'notSet'
        };
      }
    },
    socketlockReport: function(status) {
      this.$emit('toastPop', status ? '階段成果鎖定' : '階段成果解鎖');
      this.$socket.client.emit('getReport', this.defaultReport);
    },
    lockReport: function(item) {
      item.locked = !item.locked;
      this.defaultReport = item;
      this.$socket.client.emit('lockReport', this.defaultReport);
    },
    socketgetAuditionGap: function(data) {
      this.groupGap = data;
    },
    socketpreviewAudit: function(data) {
      if(data.query === this.defaultAudit.value) {
        this.previewAudit = data.score;
      }
    },
    socketpreviewFeedback: function(data) {
      if(data.query === this.defaultAudit.feedback) {
        this.previewFeedback = data.score;
      }
    },
    predictScore: function(value, feedback, short) {
      let score = 0;
      if(short) {
        score = Math.abs((Math.ceil(Math.abs(value - (value - feedback)) / 2)) + (value * -1));
      } else {
        score = (Math.ceil(Math.abs(value - feedback) / 2)) + feedback;
      }
      return score;
    },
    closeReport: function() {
      this.reportW = false;
      this.scoreHeight = 50;
    },
    renderIntervention: function() {
      let oriobj = this;
      let interventOpetions = {...this.interventOpetions};
      let values = _orderBy(this.interventions, ['tick'], ['asc']);
      if(values.length > 0) {
        interventOpetions.xaxis.categories = _map(values, (intervent) => {
          return oriobj.dateConvert(intervent.tick)
        });
        let avgScore = [];
        let meanScore = _meanBy(this.interventions, (intervent) => {
          return intervent.value;
        });
        for(let i=0; i<this.interventions.length; i++) {
          avgScore.push(meanScore);
        }
        let interventSeries = [{ 
          name: "評分調整比例",
          type: 'column',
          data: _map(values, (intervent) => {
            return intervent.value;
          })
        },{
          name: "平均調整比例",
          type: 'line',
          data: avgScore
        }];
        this.interventOpetions = interventOpetions;
        this.interventSeries = interventSeries;
        Vue.nextTick(() => {
          oriobj.interventHeight = 200;
        });
      }
    },
    renderChart: function() {
      let oriobj = this;
      let chartOptions = {...this.chartOptions};
      chartOptions.xaxis.categories = ['自評分'];
      for(let i=0; i<this.defaultReport.audits.length; i++) {
        chartOptions.xaxis.categories.push('評分['+(i+1)+']');
      }
      let series = [{ data: [this.defaultReport.value] }];
      for(let i=0; i<this.defaultReport.audits.length; i++) {
        if(this.defaultReport.audits[i].feedbackTick > 0) {
          let score = this.predictScore(this.defaultReport.audits[i].value, this.defaultReport.audits[i].feedback, this.defaultReport.audits[i].short);
          series[0].data.push(this.defaultReport.audits[i].short ? score * -1 : score);
        } else {
          let score = this.defaultReport.audits[i].short ? this.defaultReport.audits[i].value * -1 : this.defaultReport.audits[i].value;
          series[0].data.push(score);
        }
      }
      this.chartOptions = chartOptions;
      this.chartSeries = series;
      Vue.nextTick(() => {
        oriobj.scoreHeight = 200;
      })
    },
    renderReport: function() {
      let oriobj = this;
      let series = [];
      let ungained = _filter(this.filteredReportList, (report) => {
        return report.gained === 0;
      });
      let unAudit = _filter(ungained, (report) => {
        return report.audits.length === 0;
      });
      series.push({
        name: "已批改",
        data: [this.filteredReportList.length - ungained.length]
      });
      series.push({
        name: "無人評分",
        data: [unAudit.length]
      });
      series.push({
        name: "已有評分",
        data: [ungained.length - unAudit.length]
      });
      this.reportSeries = series;
      Vue.nextTick(() => {
        oriobj.reportHeight = 130;
      })
    },
    socketconfirmAudit: function() {
      this.$emit('toastPop', '確認完成');
      this.$socket.client.emit('getReport', this.defaultReport);
    },
    socketsetGrant: function() {
      this.$emit('toastPop', '評分完成');
      this.falserateW = false;
      this.$socket.client.emit('getReport', this.defaultReport);
    },
    agreeAudit: function(item) {
      this.defaultAudit = item;
      this.$socket.client.emit('confirmAudit', this.defaultAudit);
    },
    saveGrant: function() {
      this.$socket.client.emit('setGrant', {
        report: this.defaultReport,
        ignoreTime: this.ignoreTime
      });
    },
    socketauditFeedback: function() {
      this.$emit('toastPop', '評分完成');
      this.feedbackW = false;
      this.enableReportW = true;
      this.$socket.client.emit('getReport', this.defaultReport);
    },
    addFeedback: function() {
      this.$socket.client.emit('auditFeedback', this.defaultAudit);
    },
    setFeedback: function(item) {
      this.feedbackW = true;
      this.defaultAudit = item;
      this.minFeedback = item.feedback < this.minFeedback ? item.feedback : this.minFeedback;
      this.waitValue = true;
      this.$socket.client.emit('getDepositBalance', {
        tid: this.defaultStage._id
      });
    },
    socketgetReport: function(data) {
      this.defaultReport = data.report;
      this.isAuthor = data.isAuthor;
      this.falseAudit = data.falseAudit;
      this.auditValues = data.auditValues <= 0 ? data.report.value : data.auditValues;
      this.auditValues = data.report.audits.length > 0 ? this.auditValues : data.report.value;
      this.auditLeaders = data.auditLeaders;
      if(this.enableReportW) {
        this.reportW = true;
        this.enableReportW = false;
        this.renderChart();
      }
    },
    socketcalcReport: function() {
      this.$emit('toastPop', '計算完成');
      this.$socket.client.emit('getReport', this.defaultReport);
    },
    calcReport: function() {
      this.$socket.client.emit('calcReport', {
        report: this.defaultReport,
        ignoreTime: this.ignoreTime
      });
    },
    viewReport: function(report) {
      this.defaultReport = report;
      this.$socket.client.emit('getReport', this.defaultReport);
      this.enableReportW = true;
    },
    addAudit: function() {
      this.auditW = true;
      this.savedACoworker = [];
      this.defaultAudit = {
        content: "",
        tick: 0,
        gained: 0,
        confirm: 0,
        gid: "",
        coworkers: [],
        rid: this.defaultReport._id,
        sid: this.defaultSchema._id,
        tid: this.defaultStage._id,
        value: 0,
        feedback: 0,
        feedbackTick: 0,
        feedbackUser: "",
        short: false,
        intervention: []
      };
      this.$socket.client.emit('getDepositBalance', {
        tid: this.defaultStage._id
      });
    },
    socketaddAudit: function() {
      this.enableReportW = true;
      this.$socket.client.emit('getReport', this.defaultReport);
      this.$socket.client.emit('getReports', {
        sid: this.defaultSchema._id,
        rids: this.defaultStage.reports
      });
      this.$emit('toastPop', '新增完成');      
      this.auditW = false;
    },
    submitAudit: function() {
      this.$socket.client.emit('addAudit', this.defaultAudit);
    },
    socketaddReport: function() {
      this.$socket.client.emit('getStage', this.defaultStage);
      this.$emit('toastPop', '新增完成');
      this.addreportW = false;
    },
    submitReport: function() {
      this.$socket.client.emit('addReport', this.defaultReport);
    },
    socketgetDepositBalance: function(data) {
      let oriobj = this;
      this.userBalance = data;
      this.suggestedValue = Math.floor(this.userBalance);
      this.auditsuggestValue = this.defaultReport.value > this.userBalance ? this.userBalance : this.defaultReport.value;
      this.suggestedfeedBackValue = this.userBalance > this.defaultAudit.value ? this.defaultAudit.value : this.userBalance;
      Vue.nextTick(() => {
        oriobj.waitValue = false;
      });
    },
    addReport: function() {
      this.addreportW = true;
      this.savedCoworker = [];
      this.defaultReport = {
        content: "",
        tick: 0,
        sid: this.defaultSchema._id,
        tid: this.defaultStage._id,
        gid: "",
        coworkers: [],
        audits: [],
        value: 0,
        grantedUser: "",
        grantedDate: 0,
        grantedValue: 0,
        gained: 0,
        visibility: false,
        revokeTick: 0,
        intervention: []
      };
      this.$socket.client.emit('getDepositBalance', {
        tid: this.defaultStage._id
      });
    },
    socketrejectReport: function() {
      this.$emit('toastPop', '階段成果已撤銷');
      this.$socket.client.emit('getReports', {
        sid: this.defaultSchema._id,
        rids: this.defaultStage.reports
      });
    },
    revokeReport: function(report) {
      this.$socket.client.emit('rejectReport', report);
    },
    revokeAudit: function(report) {
      this.$socket.client.emit('rejectAudit', report);
    },
    isLeader: function(object, type) {
      let query = type ? this.leaders : this.auditLeaders;
      return (_filter(query, (leader) => {
        return leader === object._id;
      })).length > 0;
    },
    socketgetStage: function(data) {
      this.reportList = [];
      this.filteredReportList = [];
      this.selectedfilterTags = [];
      this.groupList = [];
      this.leaders = [];
      this.defaultStage = data;
      this.$socket.client.emit('getReports', {
        sid: this.defaultSchema._id,
        rids: this.defaultStage.reports
      });
      this.$socket.client.emit('getDeposit', {
        tid: this.defaultStage._id,
      });
      this.$emit('toastPop', '活動回合已載入');
    },
    getCoworkers: function(coworkers) {
      return _toString(_map(coworkers, (coworker) => {
        return coworker.name;
      }));
    },
    HTMLConverter: function (msg) {
      msg = msg === null || msg == undefined ? '**test**' : msg;
      return marked(msg, { renderer });
    },
    getStage: function(stage) {
      this.defaultStage = stage;
      this.$socket.client.emit('getStage', stage);
    },
    socketgetReports: function(data) {
      let reportGroup = _map(data.reports, (report) => {
        return report.gid
      });
      this.$socket.client.emit('getGroupTags', reportGroup);
      this.reportList = data.reports;
      this.filterReport();
      this.isSupervisor = data.isSupervisor;
      this.leaders = data.leaders;
      this.renderReport();
    },
    filterReport: function() {
      let reportList = this.reportList;
      let oriobj = this;
      let groups = _map(reportList, (report) => {
        return report.gid;
      });
      this.$socket.client.emit('getGroupTags', groups);
      if(this.filterCoworker) {
        reportList = _filter(reportList, (report) => {
          return (_filter(report.coworkers, (coworker) => {
            return coworker._id === oriobj.currentUser._id
          })).length > 0
        });
      }
      if(this.filterGroups.length > 0) {
        reportList = _filter(reportList, (report) => {
          return (_filter(oriobj.filterGroups, (group) => {
            return group === report.gid
          })).length > 0
        });
      }
      this.filteredReportList = this.orderBy === 0 ?
        _orderBy(reportList, ['gained', 'tick'], ['asc', 'desc']) :
        _orderBy(reportList, ['gained', (item) => { return Math.abs(item.tick) }], ['asc', 'desc']);
    },
    socketgetSchema: function(data) {
      let now = dayjs().unix();
      if(data !== null) {
        data.stages = _orderBy(data.stages, ['order'], ['asc']);
      }
      this.defaultSchema = data;
      for(let k=0; k<this.defaultSchema.stages.length; k++) {
        if(_inRange(now, this.defaultSchema.stages[k].startTick, this.defaultSchema.stages[k].endTick)) {
          this.stepPointer = k;
        }
      }
      this.waitValue = true;
      this.$emit('viewIn', {
        text: '活動頁面-' + this.defaultSchema.name,
        icon: 'fa-star-half-stroke',
        module: '評分模組',
        location: '/reportViewer'
      });
      this.$socket.client.emit('getAuditionGap', this.defaultSchema);
    },
    dateConvert: function (time) {
      return time === 0 ? '尚未設定' : dayjs.unix(time).format('YYYY/MM/DD HH:mm:ss');
    },
    updateACoworkers: function(value) {
      this.defaultAudit.coworkers = value;
      this.waitValue = true;
      this.$socket.client.emit('getDepositBalance', {
        tid: this.defaultStage._id
      });
    },
    updateCoworkers: function(value) {
      this.defaultReport.coworkers = value;
      this.waitValue = true;
      this.$socket.client.emit('getDepositBalance', {
        tid: this.defaultStage._id
      });
    },
    plusTag: function (val) {
      this.$emit('addTag', val);
    },
    fetchCoworkers: function() {
      this.$socket.client.emit('getCoworkers', {
        sid: this.defaultSchema._id,
        tid: this.defaultStage._id
      });
    },
    updateTags: function() {
      this.$emit('updateTags');
    },
    socketgetCoworkers: function(data) {
      let oriobj = this;
      this.savedCoworker = _filter(data, (user) => {
        return user._id !== oriobj.currentUser._id;
      });
    },
    viewDesc: function() {
      this.descW = true;
    },
    groupCheck: function(item) {
      if(this.ownGroup !== null) {
        if(this.ownGroup._id === item.gid) {
          return true;
        }
      }
      return false;
    },
    allowAudit: function() {
      if(this.defaultStage.replyDisabled === 0) {
        if(!this.defaultReport.locked) {
          if(this.isAuthor) {
            return false;
          } else {
            if(this.ownGroup !== null) {
              for(let i=0; i<this.defaultReport.audits.length; i++) {
                if(this.defaultReport.audits[i].gid === this.ownGroup._id) {
                  return false;
                }
              }
            }
          }
          return true;
        }
      }
      return false;
    },
    stageAllowed: function() {
      let stageCheck = false;
      if(this.defaultStage._id !== undefined) {
        stageCheck = true;
        if(this.defaultStage.closed === 0) {
          stageCheck = true;
          if(this.ownGroup !== null) {
            for(let i=0; i<this.reportList.length; i++) {
              if(this.reportList[i].gid === this.ownGroup._id) {
                stageCheck = false;
                break;
              }
            }
          }
        }
      }
      return stageCheck;
    },
    groupFilter: function(group) {
      let ownGroupID = this.ownGroup === null ? null : this.ownGroup._id;
      group = group === undefined ? ownGroupID : group;
      if(group !== null) {
        if(_filter(this.filterGroups, (fgroup) => {
          return fgroup === group;
        }).length > 0) {
          this.filterGroups = _filter(this.filterGroups, (fgroup) => {
            return fgroup !== group;
          });
        } else {
          this.filterGroups.push(group);
        }
      }
    },
    updatelonerTag: function(value) {
      this.lonerTags = value;
    }
  },
  data () {
    return {
      stageJoined: 0,
      stageAccountingW: false,
      stageAccounting: [],
      depositW: false,
      deposits: [],
      depositSupervisor: false,
      auditLeaders: [],
      interventHeight: 100,
      interventOpetions: {
        chart: {
          height: 350,
          type: 'line',
          zoom: {
            enabled: false
          }
        },
        dataLabels: {
          enabled: false
        },
        colors: [
          '#E76F51',
          '#F8961E'
        ],
        stroke: {
          curve: 'straight'
        },
        grid: {
          row: {
            colors: ['#f3f3f3', 'transparent'],
            opacity: 0.5
          },
        },
        xaxis: {
          categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
        },
        yaxis: [
          {
            labels: {
              formatter: function(val) {
                return val.toFixed(0);
              }
            }
          }
        ]
      },
      interventSeries: [{
        name: "Desktops",
        data: [10, 41, 35, 51, 49, 62, 69, 91, 148]
      }],
      interventionObj: {
        _id: "",
        type: 0,
        content: "",
        value: 0
      },
      interventions: [],
      interventionW: false,
      ignoreTime: false,
      ownGroup: null,
      googlelinkW: false,
      descW: false,
      userBalance: 0,
      groupGap: 0,
      previewReport: 0,
      previewAudit: 0,
      previewFeedback: 0,
      auditsuggestValue: 0,
      minFeedback: 0,
      falserateW: false,
      feedbackW: false,
      stepPointer: 0,
      auditValues: 1,
      falseAudit: false,
      suggestedfeedBackValue: 1,
      waitValue: false,
      reportW: false,
      enableReportW: false,
      isAuthor: false,
      auditW: false,
      suggestedValue: 0,
      savedCoworker: [],
      addreportW: false,
      isSupervisor: false,
      reportList: [],
      supervisors: [],
      leaders: [],
      defaultAudit: {
        content: "",
        tick: 0,
        gained: 0,
        confirm: 0,
        gid: "",
        coworkers: [],
        rid: "",
        sid: "",
        tid: "",
        value: 0,
        feedback: 0,
        feedbackTick: 0,
        feedbackUser: "",
        short: false,
        _id: undefined,
        intervention: []
      },
      defaultReport: {
        content: "",
        tick: 0,
        sid: "",
        tid: "",
        gid: "",
        coworkers: [],
        audits: [],
        value: 0,
        grantedUser: "",
        grantedDate: 0,
        grantedValue: 0,
        gained: 0,
        visibility: false,
        revokeTick: 0,
        _id: undefined,
        intervention: []
      },
      defaultUser: {
        _id: "",
        name: ""
      },
      defaultSchema: {
        createTick: 0,
        modTick: 0,
        name: "",
        supervisors: [],
        groups: [],
        stages: [],
        initCapital: 0,
        status: 0,
        leaderRate: 0,
        workerRate: 0,
        memberRate: 0,
        tagGroupped: false,
        shortBonus: 0,
        _id: undefined
      },
      defaultStage: {
        _id: undefined,
        createTick: 0,
        modTick: 0,
        name: "",
        desc: "",
        startTick: 0,
        endTick: 0,
        order: 0,
        value: 0,
        sid: "",
        matchPoint: false,
        reports:[],
        closed: 0,
        depositStep: 10,
        defaultDeposit: 100
      },
      defaultGroup: {
        createTick: 0,
        modTick: 0,
        locked: false,
        sid: "",
        leaders: [],
        members: [],
        tags: [],
        _id: ""
      },
      chartSeries: [
        {
          data: [100, 100, 100]
        }
      ],
      chartOptions: {
        chart: {
          type: 'bar',
          height: 150
        },
        plotOptions: {
          bar: {
            barHeight: '100%',
            distributed: true,
            horizontal: true,
            dataLabels: {
              position: 'bottom'
            }
          },
        },
        dataLabels: {
          enabled: true,
          textAnchor: 'start',
          style: {
            colors: ['#fff']
          },
          formatter: function (val, opt) {
            return opt.w.globals.labels[opt.dataPointIndex] + ":  " + val
          },
          offsetX: 0,
          dropShadow: {
            enabled: true
          }
        },
        stroke: {
          width: 1,
          colors: ['#fff']
        },
        colors: [
          '#E76F51',
          '#F8961E',
          '#F9C74F',
          '#90BE6D',
          '#43AA8B',
          '#577590'
        ],
        xaxis: {
          categories: ['test', 'test', 'test'],
        },
        yaxis: {
          labels: {
            show: false
          }
        },
        fill: {
          opacity: 1
        },
        legend: {
          position: 'top',
          horizontalAlign: 'left',
          offsetX: 40
        },
        tooltip: {
          theme: 'dark',
          x: {
            show: false
          },
          y: {
            title: {
              formatter: function () {
                return ''
              }
            }
          }
        }
      },
      scoreHeight: 100,
      reportHeight: 50,
      reportSeries: [
        {
          name: '0',
          data: [0]
        }
      ],
      reportOptions: {
        chart: {
          type: 'bar',
          height: 150,
          stacked: true,
          stackType: '100%'
        },
        plotOptions: {
          bar: {
            horizontal: true,
          },
        },
        stroke: {
          width: 1,
          colors: ['#fff']
        },
        colors: [
          '#E76F51',
          '#F8961E',
          '#F9C74F',
          '#90BE6D',
          '#43AA8B',
          '#577590'
        ],
        xaxis: {
          categories: ['完成度'],
        },
        tooltip: {
          y: {
            formatter: function (val) {
              return val + "個成果"
            }
          }
        },
        fill: {
          opacity: 1
        },
        legend: {
          position: 'top',
          horizontalAlign: 'left',
          offsetX: 40
        }
      },
      filteredReportList: [],
      filterCoworker: false,
      filterGroups: [],
      filterTagList: [],
      selectedfilterTags: [],
      orderBy: 0,
      reportFilters: [],
      groupfilterSelectorW: false,
    }
  }
};
</script>
