<template>
  <v-sheet>
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
        <v-alert outlined type="info" icon='fa-dollar-sign' class='text-left' v-if='userBalance <= 0'>
          你根本沒有點數，無法送出押金！
        </v-alert>
        <v-slider
          v-if='defaultReport.grantedDate === 0'
          :label='"投入"+defaultAudit.feedback+"點"'
          :min='minFeedback'
          :max='suggestedfeedBackValue'
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
            <span v-if='defaultReport.grantedDate > 0'>(已在{{ dateConvert(defaultReport.grantedDate) }}批改，獲得{{ defaultReport.grantedValue }}點)</span>
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
          <v-alert outlined type="info" icon='fa-info-circle' class='text-left'>
            <span v-if='falseAudit'>這份報告有負評，已關閉自動評分</span><span v-else>收到並完成回復{{ groupGap }}份評分後會啟動自動評分（並關閉互評）</span>，現在已經收到{{ defaultReport.audits.length }}份評分<span v-if='isAuthor'>，你可以確認對方的評分是否正確</span><span v-if='allowAudit()'>，快來給這份報告一個評分吧！</span>
          </v-alert>
          <apexchart type="bar" width='100%' :height="scoreHeight" :options="chartOptions" :series="chartSeries"></apexchart>
          <v-btn class='ma-1' v-if='allowAudit()' v-show='enableAudit' @click='addAudit'>給予評分</v-btn>
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
            v-for='item in defaultReport.audits' :key='item._id'
          >
            <v-list-item>
              <v-list-item-icon>
                <v-icon v-if='item.short'>fa-thumbs-down</v-icon>
                <v-icon v-else>fa-thumbs-up</v-icon>
              </v-list-item-icon>
              <v-list-item-content class="text-left">
                <v-list-item-title v-html="HTMLConverter(item.content)">
                </v-list-item-title>
                <v-list-item-subtitle>
                  <span v-if='groupCheck(item)'>[你同組的評分]</span>
                  <span>給分{{ item.value }}點</span>
                  <span> | 建立於{{ dateConvert(item.tick) }}</span>
                  <span v-show='isAuthor' v-if='item.feedbackTick === 0'>，快去回復他的評分吧</span>
                  <span v-if='item.feedbackTick > 0'> | 已於{{ dateConvert(item.feedbackTick) }}確認為{{ item.feedback }}，預估這份評分值{{ predictScore(item.value, item.feedback, item.short) }}</span>
                </v-list-item-subtitle>
              </v-list-item-content>
              <v-list-item-action class='d-flex flex-row'>
                <v-btn
                  @click='agreeAudit(item)'
                  v-if="isSupervisor" v-show='defaultReport.gained === 0'
                  class='ma-1'
                >
                  <span v-if='item.confirm === 0'>認可評分</span>
                  <span v-if='item.confirm > 0'>撤回認可</span>
                </v-btn>
                <v-btn
                  @click='setFeedback(item)'
                  v-if='isAuthor' v-show='acceptFeedback(item)'
                  class='ma-1'
                >
                  回復評分
                </v-btn>
              </v-list-item-action>
            </v-list-item>
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
          <v-alert outlined v-if='waitValue' type="info" icon='fa-info-circle' class='text-left'>
            用戶財產計算中請稍候
          </v-alert>
          <v-alert outlined type="info" icon='fa-dollar-sign' class='text-left' v-if='userBalance <= 0'>
            你根本沒有點數，無法送出押金！
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
          <v-alert outlined v-if='waitValue' type="info" icon='fa-info-circle' class='text-left'>
            用戶財產計算中請稍候
          </v-alert>
          <v-alert outlined type="info" icon='fa-dollar-sign' class='text-left' v-if='userBalance <= 0'>
            你根本沒有點數，無法送出押金！
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
          <div v-if='suggestedValue > 0' class='text-subtitle-2 font-weight-blod'>投入點數（活動限制為參與評分者總點數的{{ defaultSchema.betRate * 100 }}%，因此最大值為{{ suggestedValue }}，請注意，其他人對你的評分都不會超過你自己給的自評分）</div>
          <v-slider
            v-if='suggestedValue > 0'
            :label='"投入"+defaultReport.value+"點"'
            min='0'
            :max='suggestedValue'
            :disabled='waitValue'
            v-model="defaultReport.value"
            thumb-label
          ></v-slider>
          <span class='text-caption red--text'>你的自評分可以幫你得到{{ previewReport }}點<span v-if='defaultReport.coworkers.length > 0'>，共同作者有{{ defaultReport.coworkers.length + 1 }}人，每個人出{{ Math.ceil(defaultReport.value / (defaultReport.coworkers.length + 1)) }}點</span></span>
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
    <div class='d-flex flex-column pa-1'>
      <div class='blue-grey--text darken-1 text-caption' v-if='defaultStage._id === undefined'>本活動共{{ defaultSchema.stages.length }}個回合，請點擊任何一個回合後點右下角繳交本階段成果（旗子為目前開放的階段）</div>
      <v-stepper v-model="stepPointer">
        <v-stepper-header>
          <template
            v-for='(stage, index) in defaultSchema.stages'
          >
            <v-stepper-step
              :key='stage._id'
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
              :key='"divider" + stage._id'
              v-if='(index + 1) !== defaultSchema.stages.length'
            ></v-divider>
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
      v-for='item in filteredReportList' :key='item._id'
    >
      <v-list-item>
        <v-badge
          :color="item.gained > 0 ? 'teal darken-4' : 'red darken-4'"
          inline
          tile
        >
          <template v-slot:badge>
            <span v-if="item.coworkers.length > 0">作者×{{ item.coworkers.length }}</span>
          </template>
          <v-list-item-avatar size='36'>
            <Avatar :user='firstCoworker(item.coworkers)' :size='36'/>
          </v-list-item-avatar>
        </v-badge>
        <v-list-item-content class="text-left">
          <v-list-item-title>
            <span v-if='groupCheck(item)'>[你同組的報告]</span>
            <span v-if='item.locked'>[已禁止撤回和自動批改]</span>
            <span v-if='(item.tick - defaultStage.endTick) > 0'>[遲交]</span>
            繳交人：{{ getCoworkers(item.coworkers) }}
          </v-list-item-title>
          <v-list-item-subtitle>
            <span>{{ item.audits.length }}個評分</span>
            <span v-if='item.gained > 0'> | 得分： {{ item.grantedValue }}(批改於{{ dateConvert(item.grantedDate) }})</span>
            <span> | 建立於{{ dateConvert(item.tick) }}</span>
          </v-list-item-subtitle>
        </v-list-item-content>
        <v-list-item-action class='d-flex flex-row align-center flex-justify-end'>
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
            v-if='isSupervisor || isLeader(item)'
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
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-btn icon v-bind="attrs" v-on="on" @click='groupFilter(item.gid)'>
                <v-icon>fa-thumbtack</v-icon>
              </v-btn>
            </template>
            <span>過濾這組的成果（只看這組的）</span>
          </v-tooltip>
        </v-list-item-action>
      </v-list-item>
    </v-lazy>
  </v-sheet>
</template>

<script>
// @ is an alias to /src
import Vue from 'vue';
import dayjs from 'dayjs';
import _sumBy from 'lodash/sumBy';
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
    this.$socket.client.off('rejectReport', this.socketrejectReport);
    this.$socket.client.off('getSchema', this.socketgetSchema);
    this.$socket.client.off('getStage', this.socketgetStage);
    this.$socket.client.off('getTagUsers', this.socketgetTagUsers);
    this.$socket.client.off('getSchemaBalance', this.socketgetSchemaBalance);
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
  },
  components: { 
    TagFilter: () => import(/* webpackChunkName: 'TagFilter', webpackPrefetch: true */ './modules/TagFilter'),
    TipTap: () => import(/* webpackChunkName: 'TipTap', webpackPrefetch: true */ './modules/TipTap'),
    Avatar: () => import(/* webpackChunkName: 'Avatar', webpackPrefetch: true */ './modules/Avatar'),
  },
  created () {
    this.$socket.client.emit('getOwnGroup', this.sid);
    this.$socket.client.on('getSchema', this.socketgetSchema);
    this.$socket.client.on('rejectReport', this.socketrejectReport);
    this.$socket.client.on('getReports', this.socketgetReports);
    this.$socket.client.on('getStage', this.socketgetStage);
    this.$socket.client.on('getTagUsers', this.socketgetTagUsers);
    this.$socket.client.on('getSchemaBalance', this.socketgetSchemaBalance);
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
      console.dir(series);
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
      this.$socket.client.emit('getSchemaBalance', {
        sid: this.defaultSchema._id,
        uids: [this.currentUser._id]
      });
    },
    socketgetReport: function(data) {
      this.defaultReport = data.report;
      this.isAuthor = data.isAuthor;
      this.falseAudit = data.falseAudit;
      this.auditValues = data.auditValues <= 0 ? 1 : data.auditValues;
      this.auditValues = data.report.audits.length > 0 ? this.auditValues : data.report.value;
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
        short: false
      };
      let coworkers = _unionWith(this.defaultAudit.coworkers, [this.currentUser._id], (a, b) => {
        return a === b;
      });
      this.$socket.client.emit('getSchemaBalance', {
        sid: this.defaultSchema._id,
        uids: coworkers
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
    socketgetSchemaBalance: function(data) {
      let oriobj = this;
      this.userBalance = _sumBy(data.data, (user) => {
        return user.balance;
      });
      this.suggestedValue = Math.floor(this.userBalance * this.defaultSchema.betRate);
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
        revokeTick: 0
      };
      let coworkers = _unionWith(this.defaultReport.coworkers, [this.currentUser._id], (a, b) => {
        return a === b;
      });
      this.$socket.client.emit('getSchemaBalance', {
        sid: this.defaultSchema._id,
        uids: coworkers
      });
    },
    socketrejectReport: function() {
      this.$socket.client.emit('getReports', {
        sid: this.defaultSchema._id,
        rids: this.defaultStage.reports
      });
    },
    revokeReport: function(report) {
      this.$socket.client.emit('rejectReport', report);
    },
    isLeader: function(report) {
      return (_filter(this.leaders, (leader) => {
        return leader === report._id;
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
      this.$socket.client.emit('getSchemaBalance', {
        sid: this.defaultSchema._id,
        uids: []
      });
      this.$socket.client.emit('getAuditionGap', this.defaultSchema);
    },
    dateConvert: function (time) {
      return time === 0 ? '尚未設定' : dayjs.unix(time).format('YYYY/MM/DD HH:mm:ss');
    },
    updateACoworkers: function(value) {
      this.defaultAudit.coworkers = value;
      this.waitValue = true;
      this.$socket.client.emit('getSchemaBalance', {
        sid: this.defaultSchema._id,
        uids: _unionWith(value, [this.currentUser._id], (a, b) => {
          return a === b;
        })
      });
    },
    updateCoworkers: function(value) {
      this.defaultReport.coworkers = value;
      this.waitValue = true;
      let coworkers = _unionWith(value, [this.currentUser._id], (a, b) => {
        return a === b;
      });
      this.$socket.client.emit('getSchemaBalance', {
        sid: this.defaultSchema._id,
        uids: coworkers
      });
    },
    plusTag: function (val) {
      this.$emit('addTag', val);
    },
    fetchCoworkers: function() {
      this.$socket.client.emit('getCoworkers', this.defaultSchema._id );
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
        _id: undefined
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
        _id: undefined
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
        betRate: 0,
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
        closed: 0
      },
      defaultGroup: {
        createTick: 0,
        modTick: 0,
        locked: false,
        sid: "",
        leaders: [],
        members: [],
        tags: []
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
