<template>
  <v-sheet class='d-flex flex-column'>
    <v-dialog v-model='eventlogW' fullscreen hide-overlay transition='dialog-bottom-transition'>
      <v-card>
        <v-toolbar dark color='primary'>
          <v-btn icon dark @click='eventlogW = false'>
            <v-icon>fa-times</v-icon>
          </v-btn>
          <v-toolbar-title>查詢{{ currentKB.title }}的編審紀錄</v-toolbar-title>
        </v-toolbar>
        <v-card-text class='text-left black--text text-body-1 pa-2 d-flex flex-column'>
          <v-text-field label='關鍵字（可搜尋用戶名、動作名、描述）' hint='支援正規表達式，用|表示OR，用(?=.*集合一)(?=.*集合二)表示AND' outlined clearable dense v-model='eventKeyword'></v-text-field>
          <v-switch v-model="eventIgnore" label="忽略「儲存知識點順序」"></v-switch>
          <div class='text-body-1'>選擇查詢區間（如果你把兩個日期都選在同一天，那查詢就會查全部的時間段）</div>
          <v-date-picker
            v-model="eventsRange"
            full-width
            range
          ></v-date-picker>
          <v-slider
            label='下載條目數量'
            min='10'
            max='500'
            v-model="eventNum"
            thumb-label
          ></v-slider>
          <v-btn class='ma-1' @click='filterKBLog'>篩選編審紀錄</v-btn>
          <v-btn class='ma-1' @click='downloadKBLog'>下載篩選的編審紀錄</v-btn>
          <v-simple-table v-if="KBLog.length > 0" class='black--text'>
            <template v-slot:default>
              <thead>
                <tr>
                  <th class="text-left">執行時間</th>
                  <th class="text-left">執行者</th>
                  <th class="text-left">執行動作</th>
                  <th class="text-left">執行註解</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="event in KBLog"
                  :key="event._id"
                >
                  <td class="text-left">
                    {{ dateConvert(event.tick) }}
                  </td>
                  <td class="text-left">
                    {{ event.user.name }}
                  </td>
                  <td class="text-left">
                    {{ event.type }}
                  </td>
                  <td class="text-left">
                    {{ event.desc }}
                  </td>
                </tr>
              </tbody>
            </template>
          </v-simple-table>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="stageFW"
      persistent
      max-width="50vw"
    >
      <v-card>
        <v-toolbar
          color="primary"
          dark
        >按照流程檢視知識點
        </v-toolbar>
        <v-card-text class='d-flex flex-column pa-1 text-left black--text text-body-1'>
          <v-alert outlined type='info' icon='fa-info-circle' class='text-left'>這個功能是提供給您篩選目前階段已經在您指定的位置的知識點</v-alert>
          <v-slider
            label='請指定階段（0代表不過濾，-1代表未啟動）'
            min='-1'
            :max='maxStep'
            v-model="stageFilter"
            thumb-label
          ></v-slider>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color='indigo darken-4'
            class='white--text'
            @click='generateList'
          >
            啟動流程過濾器
          </v-btn>
          <v-btn
            color='red'
            class='white--text'
            @click='stageFW = false'
          >
            關閉對話框
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="priviledgeVW"
      persistent
      max-width="50vw"
    >
      <v-card>
        <v-toolbar
          color="primary"
          dark
        >按照你在當前步驟的權限檢視知識點
        </v-toolbar>
        <v-card-text class='d-flex flex-column pa-0 text-left black--text text-body-1'>
          <v-alert outlined type='info' icon='fa-info-circle' class='text-left'>您可以在此按照您的角色／權限篩選知識點</v-alert>
          <div class='d-flex flex-column pa-1'>
            <v-switch
              v-model="viewReviewer"
              v-if='countReviewer > 0'
              :label="'查看我有審查者權限的' + countReviewer + '支影片'"
            ></v-switch>
            <v-switch
              v-model="viewPM"
              v-if='countPM > 0'
              :label="'查看我有PM權限的' + countPM + '支影片'"
            ></v-switch>
            <v-switch
              v-model="viewWriter"
              v-if='countWriter > 0'
              :label="'查看我有寫手權限的' + countWriter + '支影片'"
            ></v-switch>
            <v-switch
              v-model="viewFinal"
              v-if='countFinal > 0'
              :label="'查看我有行政端權限的' + countFinal + '支影片'"
            ></v-switch>
            <v-switch
              v-model="viewVendor"
              v-if='countVendor > 0'
              :label="'查看我有廠商權限的' + countVendor + '支影片'"
            ></v-switch>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color='indigo darken-4'
            class='white--text'
            @click='generateList'
          >
            啟動權限/角色過濾器
          </v-btn>
          <v-btn
            color='red'
            class='white--text'
            @click='priviledgeVW = false'
          >
            關閉對話框
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="initW"
      persistent
      max-width="50vw"
    >
      <v-card>
        <v-toolbar
          color="primary"
          dark
        >初次使用設定
        </v-toolbar>
        <v-card-text class='d-flex flex-column pa-0 text-left black--text text-body-1'>
          <v-alert outlined type='info' icon='fa-info-circle' class='text-left'>若您日後還要修改這條設定，請選擇右下角工具箱的i圖示開啟即可</v-alert>
          <div class='d-flex flex-column pa-1'>
            <v-switch
              v-model="initStatstics"
              label="每次開啟Dashboard都先打開知識點進度總統計（通常是PM、行政才會需要打開）"
            ></v-switch>
            <v-switch
              v-model="initHistory"
              label="打開所有和我有關的知識點，就算當前階段與我無關我也要看到（通常是PM、行政才會需要打開）"
            ></v-switch>
            <v-switch
              v-model="initSorting"
              label="按照完成時間排序，如果關掉的話就會按照知識點順序排序"
            ></v-switch>
          </div>
          <div class='text-caption red--text'>統計圖表的開關在右下角折線圖圖示，您就算不開啟此設定，平時也可以自己點擊叫出統計圖</div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color='red'
            class='white--text'
            @click='closeInitW'
          >
            關閉對話框
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="tagW"
      persistent
      max-width="50vw"
    >
      <v-card>
        <v-toolbar
          color="primary"
          dark
        >指定 {{ currentKB.title }} 的標籤
        </v-toolbar>
        <v-card-text class='d-flex flex-column pa-0'>
          <v-alert outlined type='info' icon='fa-info-circle' class='text-left'>PM可以針對不同知識點下行銷或管理需要的標籤（如「粉紅色」、「買賣問題」、「時事性」之類），請不要刪除你看不懂的標籤，否則知識點管理中找不到這個知識點</v-alert>
          <tag-filter
            @updateTags='updateTags'
            @plusItem='plusTag'
            :mustSelected='true'
            :single='false'
            :selectedItem='currentKB.tag'
            @valueUpdated='updateKBTag'
            :candidatedItem='savedTags'
            :createable='true'
            label='請輸入標籤'
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color='red'
            class='white--text'
            @click='saveKBTag'
          >
            儲存標籤
          </v-btn>
          <v-btn
            color="primary"
            @click="tagW = false"
          >
            關閉對話框
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="downloadW"
      persistent
      max-width="50vw"
    >
      <v-card>
        <v-toolbar dark color='primary'>
          <v-toolbar-title>下載 {{ selectedpmKBs.length }} 個知識點的最新版本</v-toolbar-title>
        </v-toolbar>
        <v-card-text class='d-flex flex-column text-left black--text text-body-1'>
          <v-alert outlined type='info' icon='fa-info-circle' class='text-left'>請注意，為節省系統資源，系統不會幫你把這些檔案壓縮，而會同時發送這些檔案給你，你應該會在瀏覽器正下方（或是正上方）看到「是否允許下載多個檔案」的提示，請務必按「同意」</v-alert>
          <div class='red--text text-caption'>你要下載最新的幾個版本呢？（{{ latestCount }}）</div>
          <v-slider
            label='最新版本數量'
            min='1'
            max='10'
            v-model="latestCount"
            thumb-label
          ></v-slider>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click='getlatestVersions'>點此開始下載</v-btn>
          <v-btn
            color="primary"
            @click="downloadW = false"
          >
            關閉對話框
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model='versionW'
      fullscreen
      hide-overlay
      transition="dialog-bottom-transition"
    >
      <v-card>
        <v-toolbar dark color='primary'>
          <v-btn
            icon
            dark
            @click="closeVersionW"
          >
            <v-icon>fa-times</v-icon>
          </v-btn>
          <v-toolbar-title>管理知識點版本</v-toolbar-title>
        </v-toolbar>
        <v-card-text class='d-flex flex-column pa-0'>
          <v-alert outlined type='info' v-if='currentKB.isVendor || currentKB.isPM' icon='fa-info-circle' class='text-left'>
            廠商/PM請注意：基本上你只能上傳影片（H.264/VP9）、PDF檔案（分鏡圖使用），除非是最終階段需要上傳可編輯原始檔，否則請勿上傳zip檔，另外，你的檔名就會是版本代號，請謹慎命名（如「腳本第一版」）
          </v-alert>
          <v-alert outlined type='info' v-if='currentKB.isWriter' icon='fa-info-circle' class='text-left'>
            寫手請注意：你只能上傳PDF檔案，請把你的腳本都轉換成PDF再上傳，另外，你的檔名就會是版本代號，請謹慎命名（如「腳本第一版」）
          </v-alert>
          <div v-if='currentKB.isWriter || currentKB.isVendor || currentKB.isPM' class='d-felx flex-column'>
            <div class='text-subtitle-2 font-weight-blod'>版本發行說明（必填但不得超過30個字）</div>
            <v-text-field outlined placeholder='請輸入一些說明，上傳檔案選單才會出現喔！' clearable dense hint='請輸入這個新版本的註解，不得超過30個字' v-model='versionComment' />
            <div class='text-subtitle-2 font-weight-blod'>版本檔案</div>
            <v-file-input
              v-if="versionComment !== ''"
              prepend-icon="fa-paperclip" 
              v-model="versionFile" 
              label='上傳知識點版本' 
              :accept="currentKB.isWriter ? 'application/pdf' : 'application/zip, application/pdf, video/mp4, video/webm'"
              :loading="uploadprogress !== 0">
              <template v-slot:progress>
                <v-progress-circular :value="uploadprogress"></v-progress-circular>速度：{{ uploadstatus }}
              </template>
            </v-file-input>
          </div>
          <div v-if='versionPopulated'>
            <span v-if='currentVersions.length === 0' class='text-body-1 text-center'>
              目前沒有任何版本
            </span>
            <v-simple-table v-show="currentVersions.length > 0">
              <template v-slot:default>
                <thead>
                  <tr>
                    <th class="text-left" style="width:200px">
                      版本發行日期（版號）
                    </th>
                    <th class="text-left" style="width:200px">
                      原始檔名
                    </th>
                    <th class="text-left" style="width:250px">
                      狀態
                    </th>
                    <th class="text-left">
                      版本發行紀錄（以及格式檢查紀錄）
                    </th>
                    <th class="text-left" style="width:25px">
                      &nbsp;
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="version in currentVersions"
                    :key="'ver'+version._id"
                  >
                    <td class="text-left">
                      <span v-if='version.readed' class='indigo--text darken-4'>[已看過]</span>
                      <span v-else class='red--text darken-4'>[未看過]</span>
                      {{ dateConvert(version.tick) }}
                    </td>
                    <td class="text-left">
                      {{ version.name }}
                    </td>
                    <td class="text-left">
                      <span v-if='version.status === 1'>
                        <span v-if='/video\//g.test(version.type)'>尚未格式檢查</span>
                        <span v-else>非影片不需檢查</span>
                      </span>
                      <span v-if='version.status === 0'>格式檢查失敗</span>
                      <span v-if='version.status >= 2'>格式
                        <span>{{ version.fileInfo.formatCheck ? '正確' : '錯誤' }}</span><br/>
                        <span v-if='version.status === 2'>({{ dateConvert(version.fileInfo.checkTick) }})</span>
                        <span v-if='version.status === 4'>({{ dateConvert(version.fileInfo.queueDate) }}已排入轉檔佇列)</span>
                        <span v-if='version.status === 3'>({{ dateConvert(version.fileInfo.converisionDate) }}已轉換為VP9/WebM)</span>
                      </span>
                    </td>
                    <td class="text-left">
                      {{ version.comment }}<br/>
                      <span v-if='version.status >= 2' class='codecSign'>{{ version.fileInfo.videoCodec }}</span>
                      <span v-if='version.status >= 2'>{{ version.fileInfo.hasAudio ? '🔊' : '' }}</span>
                      <span v-if='version.status >= 2'>{{ version.validAudio ? '' : '❌' }}</span>
                      <span v-if='version.status >= 2'>{{ version.fileInfo.width }}</span>
                      <span v-if='version.status >= 2'>{{ version.validWidth ? '' : '❌' }}</span>
                      <span v-if='version.status >= 2'>×{{ version.fileInfo.height }}</span>
                      <span v-if='version.status >= 2'>{{ version.validHeight ? '' : '❌' }}</span>
                      <span v-if='version.status >= 2'>@ {{ timeConvert(version.fileInfo.duration) }}</span>
                      <span v-if='version.status >= 2'>{{ version.validRange ? '' : '❌' }}</span>
                    </td>
                    <td class='d-flex flex-row'>
                      <v-menu
                        bottom
                        left
                        offset-y
                        attach
                        transition="slide-y-transition"
                      >
                        <template v-slot:activator="{ on, attrs }">
                          <v-btn
                            outlined
                            icon
                            v-bind="attrs" v-on="on"
                          >
                            <v-icon>fa-trash</v-icon>
                          </v-btn>
                        </template>
                        <v-sheet class='d-flex flex-column pa-1'>
                          <div class='text-h6'>確認刪除版本？</div>
                          <v-btn
                            color='red accent-4'
                            class='white--text ma-1'
                            @click='deleteKBVersion(version._id)'
                          >
                            是，我要刪除這個版本
                          </v-btn>
                          <div class='text-caption'>如果你只是誤觸，請隨意點擊其他地方即會關閉本對話框</div>
                        </v-sheet>
                      </v-menu>
                      <v-btn
                        @click='downloadFile(version)'
                        outlined
                        icon>
                        <v-icon>fa-file-download</v-icon>
                      </v-btn>
                    </td>
                  </tr>
                </tbody>
              </template>
            </v-simple-table>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model='participantW'
      fullscreen
      hide-overlay
      transition="dialog-bottom-transition"
    >
      <v-card>
        <v-toolbar dark color='primary'>
          <v-btn
            icon
            dark
            @click="participantW = false"
          >
            <v-icon>fa-times</v-icon>
          </v-btn>
          <v-toolbar-title>{{ participantsDB.proceedKBs.length }}個知識點的參與者們（{{ participantsDB.proceedUsers.length }}）</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn
            icon
            dark
            @click="exportParticipant"
          >
            <v-icon>fa-download</v-icon>
          </v-btn>
        </v-toolbar>
        <v-card-text class='pa-0 ma-0 d-flex flex-column text-left black--text text-body-1'>
          <v-alert outlined type="info" icon='fa-info-circle' class='text-left'>你如果發現你勾選的知識點少於系統回傳的知識點，那很明顯是因為你不具有該知識點的行政管理權，請洽你的知識點PM，把你放進行政組中</v-alert>
          <div v-if='participantsDB.statistics.length === 0'>
            你不具備你勾選的知識點的行政管理權，回傳的知識點數量為0
          </div>
          <div v-if='participantsDB.statistics.length > 0' class='ma-1'>
            <div class='text-left' v-for='participant in participantsDB.statistics' :key='"uid"+participant._id'>
              <div class='text-h6 indigo darken-4 font-weight-black white--text'>{{participant.name}} @ {{participant.unit}}</div>
              <v-divider></v-divider>
              <div class='text-subtitle-1 indigo--text darken-4 font-weight-medium'>參與PM工作（{{ participant.pmStages.length }}次）</div>
              <v-divider></v-divider>
              <div class='d-flex flex-row flex-wrap'>
                <v-chip
                  class="ma-2 white--text"
                  :color="tagColor(0)"
                  label
                  v-for='stage in participant.pmStages'
                  :key='"parp"+stage._id'
                >
                  {{ stage.KBtitle }} | {{ stage.name }}
                </v-chip>
              </div>
              <div class='text-subtitle-1 indigo--text darken-4 font-weight-medium'>參與審查者工作（{{ participant.reviewerStages.length }}次）</div>
              <v-divider></v-divider>
              <div class='d-flex flex-row flex-wrap'>
                <v-chip
                  class="ma-2 white--text"
                  :color="tagColor(1)"
                  label
                  v-for='stage in participant.reviewerStages'
                  :key='"parr"+stage._id'
                >
                  {{ stage.KBtitle }} | {{ stage.name }}
                </v-chip>
              </div>
              <div class='text-subtitle-1 indigo--text darken-4 font-weight-medium'>參與廠商工作（{{ participant.vendorStages.length }}次）</div>
              <v-divider></v-divider>
              <div class='d-flex flex-row flex-wrap'>
                <v-chip
                  class="ma-2 white--text"
                  :color="tagColor(2)"
                  label
                  v-for='stage in participant.vendorStages'
                  :key='"parv"+stage._id'
                >
                  {{ stage.KBtitle }} | {{ stage.name }}
                </v-chip>
              </div>
              <div class='text-subtitle-1 indigo--text darken-4 font-weight-medium'>參與寫手工作（{{ participant.writerStages.length }}次）</div>
              <v-divider></v-divider>
              <div class='d-flex flex-row flex-wrap'>
                <v-chip
                  class="ma-2 white--text"
                  :color="tagColor(3)"
                  label
                  v-for='stage in participant.writerStages'
                  :key='"parw"+stage._id'
                >
                  {{ stage.KBtitle }} | {{ stage.name }}
                </v-chip>
              </div>
              <div class='text-subtitle-1 indigo--text darken-4 font-weight-medium'>參與行政工作（{{ participant.finalStages.length }}次）</div>
              <v-divider></v-divider>
              <div class='d-flex flex-row flex-wrap'>
                <v-chip
                  class="ma-2 white--text"
                  :color="tagColor(4)"
                  label
                  v-for='stage in participant.finalStages'
                  :key='"parf"+stage._id'
                >
                  {{ stage.KBtitle }} | {{ stage.name }}
                </v-chip>
              </div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-dialog v-model="authDetailW" persistent>
      <v-card>
        <v-toolbar
          dark
          color="primary"
        >
          <v-toolbar-title>你在 {{ currentKB.title }} 目前階段中的的角色</v-toolbar-title>
        </v-toolbar>
        <v-card-text class='d-flex flex-column text-h6 font-weight-medium black--text text-left'>
          <div v-if='currentKB.isPM'>
            專案管理者：你可以關閉／開啟任何的Issue，並且在知識點編輯器中強制改變專案進度
          </div>
          <div v-if='currentKB.isVendor'>
            廠商：你可以在DashBoard中上傳知識點的版本，並且回復Issue
          </div>
          <div v-if='currentKB.isWriter'>
            寫手：你可以開啟Issue，上傳腳本，並回復Issue
          </div>
          <div v-if='currentKB.isReviewer'>
            審查者：你可以開啟／關閉Issue，並且決定本階段是否結束
          </div>
          <div v-if='currentKB.isFinal'>
            行政組：你只能看Issue，並在DashBoard中匯出專案統計
          </div>
        </v-card-text>
        <v-card-actions>
        <v-spacer></v-spacer>
          <v-btn color="green darken-1" text @click="authDetailW = false">關閉角色說明</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-fab-transition>
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
            style='margin-bottom: 160px'
            @click.stop='showStatstics = !showStatstics'
          >
            <v-icon>fa-chart-line</v-icon>
          </v-btn>
        </template>
        <span v-if='!showStatstics'>顯示完成度統計</span>
        <span v-if='showStatstics'>隱藏完成度統計</span>
      </v-tooltip>
    </v-fab-transition>
    <v-speed-dial style='margin-bottom: 80px' v-model="pmtoolsBtns" fixed bottom right direction="left" :open-on-hover="true" transition="slide-y-reverse-transition">
      <template v-slot:activator>
        <v-btn
          v-model="pmtoolsBtns"
          color="brown darken-4"
          dark
          fab
        >
          <v-icon v-if="configBtn">fa-chevron-up</v-icon>
          <v-icon v-else>fa-toolbox</v-icon>
        </v-btn>
      </template>
      <v-badge
        color="red"
        overlap
        :content='selectedpmKBs.length'
        :value='selectedpmKBs.length'
      >
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              v-bind="attrs" v-on="on"
              fab
              dark
              small
              color="deep-orange darken-4"
              @click.stop='selectAllKBs'
            >
              <v-icon v-if='selectedpmKBs.length > 0'>far fa-circle</v-icon>
              <v-icon v-if='selectedpmKBs.length === 0'>far fa-check-circle</v-icon>
            </v-btn>
          </template>
          <span v-if='selectedpmKBs.length > 0'>清除全部選擇的知識點</span>
          <span v-if='selectedpmKBs.length === 0'>選擇全部的知識點</span>
        </v-tooltip>
      </v-badge>
      <!-- <v-badge
        color="red"
        overlap
        :content='selectedpmKBs.length'
        :value='selectedpmKBs.length'
      >
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              v-bind="attrs" v-on="on"
              fab
              dark
              small
              color="deep-orange darken-4"
              @click.stop='youtubeW = true'
            >
              <v-icon>fab fa-youtube</v-icon>
            </v-btn>
          </template>
          <span>上傳到Youtube（尚未開發）</span>
        </v-tooltip>
      </v-badge> 本功能棄置，Youtube點數不足-->
      <v-badge
        color="red"
        overlap
        :content='selectedpmKBs.length'
        :value='selectedpmKBs.length'
      >
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              v-bind="attrs" v-on="on"
              fab
              dark
              small
              color="deep-orange darken-4"
              @click.stop='downloadW = true'
            >
              <v-icon>fa-file-download</v-icon>
            </v-btn>
          </template>
          <span>下載最新版本</span>
        </v-tooltip>
      </v-badge>
      <v-badge
        color="red"
        overlap
        :content='selectedpmKBs.length'
        :value='selectedpmKBs.length'
      >
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              v-bind="attrs" v-on="on"
              fab
              dark
              small
              color="deep-orange darken-4"
              @click.stop='participantStatstics'
            >
              <v-icon>fa-users</v-icon>
            </v-btn>
          </template>
          <span>參與者名單</span>
        </v-tooltip>
      </v-badge>
      <v-badge
        color="red"
        overlap
        :content='selectedpmKBs.length'
        :value='selectedpmKBs.length'
      >
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              v-bind="attrs" v-on="on"
              fab
              dark
              small
              color="deep-orange darken-4"
              @click.stop='exportKBCSV'
            >
              <v-icon>fa-table</v-icon>
            </v-btn>
          </template>
          <span>知識點報表（就你現在篩選的知識點結果匯出成報表）</span>
        </v-tooltip>
      </v-badge>
      <v-tooltip bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            v-bind="attrs" v-on="on"
            fab
            dark
            small
            color="deep-orange darken-4"
            @click.stop='initW = true'
          >
            <v-icon>fas fa-info</v-icon>
          </v-btn>
        </template>
        <span>修改預設值</span>
      </v-tooltip>
    </v-speed-dial>
    <v-speed-dial v-model="filterBtns" fixed bottom right direction="left" :open-on-hover="true" transition="slide-y-reverse-transition">
      <template v-slot:activator>
        <v-btn
          v-model="filterBtns"
          color="pink"
          dark
          fab
        >
          <v-icon v-if="filterBtn">fa-chevron-up</v-icon>
          <v-icon v-else>fa-filter</v-icon>
        </v-btn>
      </template>
      <!-- <v-tooltip bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            v-bind="attrs" v-on="on"
            fab
            dark
            small
            color="pink darken-4"
            @click.stop='queryHistory = !queryHistory'
          >
            <v-icon>fa-history</v-icon>
          </v-btn>
        </template>
        <span v-if='queryHistory'>查看目前屬於你的知識點</span>
        <span v-if='!queryHistory'>查看所有和你有關的知識點</span>
      </v-tooltip> -->
      <v-tooltip bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            v-bind="attrs" v-on="on"
            fab
            dark
            small
            color="pink darken-4"
            @click.stop='sortingRule = !sortingRule'
          >
            <v-icon>fa-sort-numeric-down-alt</v-icon>
          </v-btn>
        </template>
        <span v-if='sortingRule'>按照死線時間排序</span>
        <span v-if='!sortingRule'>按照知識點名稱排序</span>
      </v-tooltip>
      <v-tooltip bottom v-if='!queryHistory'>
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            v-bind="attrs" v-on="on"
            fab
            dark
            small
            color="pink darken-4"
            @click.stop='priviledgeVW = !priviledgeVW'
          >
            <v-icon>fa-user-tag</v-icon>
          </v-btn>
        </template>
        開啟權限/角色過濾器
      </v-tooltip>
      <v-tooltip bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            v-bind="attrs" v-on="on"
            fab
            dark
            small
            color="pink darken-4"
            @click.stop='stageFW = !stageFW'
          >
            <v-icon>fa-map-marker</v-icon>
          </v-btn>
        </template>
        開啟流程過濾器
      </v-tooltip>
    </v-speed-dial>
    <div v-show='showStatstics'>
      <div class='d-flex flex-row'>
        <tag-filter
          class='flex-grow-1'
          @updateTags='updateTags'
          :mustSelected='false'
          :single='false'
          :selectedItem='selectedFilterTags'
          @valueUpdated='updateFilterTag'
          :candidatedItem='savedTags'
          :createable='false'
          label='請輸入過濾用的標籤（如：國中、理化）'
        />
        <v-btn color='indigo darken-4' class='white--text ma-1' @click="generateList">搜尋</v-btn>
        <v-btn color="brown darken-4" class='white--text ma-1' @click="clearFilterTag">清除</v-btn>
      </div>
      <div class='text-body-2'>最近查詢的標籤（查詢紀錄與知識點編輯器共用，點擊後載入）</div>
      <div class='d-flex flex-row flex-wrap ma-1'>
        <v-chip
          v-for='ch in queriedChapters'
          :key="'recent'+ch" @click='addFilterTags(ch)'
          class='ma-1'
        >
          {{ tagQuery(ch) }}
        </v-chip>
      </div>
      <v-slider
        label='需要統計的階段數量'
        hint="請注意，如果你要統計的專案有6個階段，你只填了5個，這裡真的不會幫你算到第6階段"
        min='1'
        :max='maxStep'
        v-model="statisticSteps"
        thumb-label
      ></v-slider>
      <apexchart width="100%" height="150" type="bar" :options="chartOptions" :series="chartSeries"></apexchart>
      <v-simple-table>
        <template v-slot:default>
          <thead>
            <tr>
              <th class='text-center' v-for='(step,n) in chartSeries' :key='"stepth" + n'>
                <span v-if='step.name === 0'>尚未啟動</span>
                <span v-else>{{ step.name }}</span>
              </th>
              <th class="text-center">
                總計
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class='text-center' v-for='(step,n) in chartSeries' :key='"steptd" + n'>{{ step.data[0] }}</td>
              <td>{{ convertedList.length }}</td>
            </tr>
          </tbody>
        </template>
      </v-simple-table>
    </div>
    <v-skeleton-loader
      class="mx-auto"
      type="card"
      v-if='!dashboardPopulated'
      width="100%"
    ></v-skeleton-loader>
    <v-sheet v-if='dashboardPopulated' class='pa-0 ma-0 d-flex flex-column'>
      <div v-if='progressList.length === 0'>您目前沒有待處理的項目</div>
      <div class='d-flex flex-row' v-if='KBLoaded'>
        <v-text-field outlined clearable dense class='flex-grow-1' label='搜尋知識點關鍵字，可以搜科目、章節、排序、標題，輸入部分關鍵字即可' hint='支援正規表達式（可上網查詢語法），例如你可以使，用|表示OR，用(?=.*集合一)(?=.*集合二)表示AND' prepend-icon="fa-search" v-model="queryTerm"></v-text-field>
        <v-btn color='indigo darken-4' class='white--text ma-1' @click="execSearch">搜尋</v-btn>
        <v-btn color="brown darken-4" class='white--text ma-1' @click="clearQueryTerm">清除</v-btn>
      </div>
      <v-btn-toggle
        v-model="filterHistory"
        mandatory
        class="justify-center"
      >
        <v-btn>
          顯示當前處理階段和你有關的{{ renderList.length }}個知識點
        </v-btn>
        <v-btn>
          顯示全部你曾經手以及正在處理的{{ progressList.length }}個知識點
        </v-btn>
      </v-btn-toggle>
      <v-lazy
        :options="{
          threshold: 0.5
        }"
        min-height="100"
        transition="fade-transition"
        v-for="(item,n) in renderList" :key="'KB'+n"
      >
        <progress-tile @events='getKBLog' @tags='openTagW' @requestUpload='openUploadW' @viewDetail='openauthDetail' @KBselected='KBupdated' :progressItem='item' :selectedItems='selectedpmKBs' />
      </v-lazy>
    </v-sheet>
  </v-sheet>
</template>

<style scoped>
  .codecSign {
    border: 1px solid black;
    padding: 1px;
  }
</style>

<script>
import Vue from 'vue';
import moment from 'moment';
import momentDurationFormatSetup from 'moment-duration-format';
import { randomColor } from 'randomcolor';
import _filter from 'lodash/filter';
import _find from 'lodash/find';
import _uniq from 'lodash/uniq';
import _orderBy from 'lodash/orderBy';
import _uniqWith from 'lodash/uniqWith';
import _map from 'lodash/map';
import _includes from 'lodash/includes';
import _flatten from 'lodash/flatten';
import _countBy from 'lodash/countBy';
import _findIndex from 'lodash/findIndex';
import _intersectionWith from 'lodash/intersectionWith';
import _head from 'lodash/head';
import _unionWith from 'lodash/unionWith';
import _inRange from 'lodash/inRange';
import { v4 as uuidv4 } from 'uuid';
import VueApexCharts from 'vue-apexcharts';
import prettyBytes from 'pretty-bytes';
import Papa from 'papaparse';
Vue.use(VueApexCharts);
Vue.component('apexchart', VueApexCharts);
momentDurationFormatSetup(moment);
let files = [];

export default {
  name: 'userDashBoard',
  components: { 
    TagFilter: () => import(/* webpackPrefetch: true */ './modules/TagFilter'),
    ProgressTile: () => import(/* webpackPrefetch: true */ './modules/ProgressTile')
  },
  methods: {
    exportKBCSV: function() {
      let oriobj = this;
      let queryTerm = '無';
      if(this.queryTerm !== '') {
        queryTerm = queryTerm === '無' ? '關鍵字:' + this.queryTerm : queryTerm + '關鍵字:' + this.queryTerm;
      }
      if(this.selectedFilterTags.length > 0) {
        let tags = _map(this.selectedFilterTags, (tag) => {
          return oriobj.tagQuery(tag)+',';
        })
        queryTerm = queryTerm === '無' ? '過濾標籤:' + tags : queryTerm + '/過濾標籤:' + tags;
      }
      let output = [];
      for(let i=0; i< this.renderList.length; i++) {
        let item = this.renderList[i];
        let inSelected = _find(this.selectedpmKBs, (sItem) => {
          return sItem === item._id;
        });
        if(inSelected === undefined) { continue; }
        let csName = item.currentStep > 0 ? '[' + item.stages[item.currentStep - 1].name + ']' : "無";
        let outputItem = {
          '知識點ID': item._id,
          '知識點標題': item.title,
          '隸屬科目': item.mainTag,
          '隸屬章節': item.mainChapter,
          '目前步驟編號': item.currentStep === -1 ? '未啟動' : item.currentStep,
          '目前步驟名稱': csName,
          '目前步驟審查目標數量': item.currentObjs,
          '目前步驟完成審查目標數': item.finishedObjs
        };
        for(let k=0; k<this.maxStep; k++) {
          let otStatus = '無此階段';
          let osTime = '無此階段'
          let oeTime = '無此階段'
          let opTime = '無此階段'
          if(item.stages.length > k) {
            otStatus = item.currentStep - 1 === k ? '進行中' : item.currentStep - 1 < k ? '尚未發生' : '已完成';
            osTime = 'startTick' in item.stages[k] ? moment.unix(item.stages[k].startTick).format('YYYY/MM/DD HH:mm:ss') : '未設定開始時間';
            oeTime = 'dueTick' in item.stages[k] ? moment.unix(item.stages[k].dueTick).format('YYYY/MM/DD HH:mm:ss') : '未設定死線時間';
            opTime = 'passTick' in item.stages[k] ? moment.unix(item.stages[k].passTick).format('YYYY/MM/DD HH:mm:ss') : '未設定完成時間';
          }
          outputItem['第' + (k+1) + '階段執行狀態'] = otStatus;
          outputItem['第' + (k+1) + '階段開始時間'] = osTime;
          outputItem['第' + (k+1) + '階段死線時間'] = oeTime;
          outputItem['第' + (k+1) + '階段完成時間'] = opTime;
        }
        output.push(outputItem);
      }
      var element = document.createElement('a');
      element.setAttribute('href', 'data:text/plain;charset=utf-8,' + "\ufeff"+ Papa.unparse(output));
      element.setAttribute('download', moment().format('YYYY/MM/DD HH:mm:ss') + "知識點狀態報表，過濾條件：" + queryTerm + ".csv");
      element.style.display = 'none';
      element.click();
    },
    selectAllKBs: function() {
      if(this.selectedpmKBs.length > 0) {
        this.selectedpmKBs = [];
      } else {
        this.selectedpmKBs = _map(this.renderList, '_id');
      }
    },
    timeConvert: function (time) {
      return moment.duration(time, 'second').format('mm分ss秒SS');
    },
    execSearch:async function() {
      if(this.initialized) {
        this.initialized = false;
        await this.generateList();
        this.renderChart();
        this.initialized = true;
      }
    },
    socketdashBoardEventLog: function(data) {
      this.$emit('timerOn', false);
      this.$emit('toastPop', '知識點編審紀錄已下載，更新清單中');
      this.eventList = data;
      this.injectEvents(data);
      this.$emit('toastPop', '知識點編審紀錄更新完成');
    },
    socketdashboardObjectives: function(data) {
      this.$emit('timerOn', false);
      this.$emit('toastPop', '知識點審查目標已下載，更新清單中');
      this.objectiveStats = data;
      this.injectObjective(data);
      this.$emit('toastPop', '知識點審查目標更新完成');
    },
    socketdashboardUnreadedVersions: function(data) {
      this.$emit('timerOn', false);
      this.$emit('toastPop', '知識點檔案清單已下載，更新清單中');
      this.unreadedVersions = data;
      this.injectVersion(data);
      if(this.currentVersions.length > 0) {
        let currentList = this.currentVersions;
        this.currentVersions = [];
        this.injectVersionW(currentList);
      }
      this.$emit('toastPop', '知識點檔案清單更新完成');
    },
    injectEvents: function(data) {
      for(let i=0; i<data.length; i++) {
        let event = data[i];
        if(!('events' in data)) {
          data.events = {
            desc: '',
            user: {
              name: ''
            },
            tick: 0
          }
        }
        let eventRender = _find(this.renderList, (item) => {
          return item._id === event._id;
        });
        if(eventRender !== undefined) {
          eventRender.eventLog = event.events;
        }
        let eventProgress = _find(this.progressList, (item) => {
          return item._id === event._id;
        });
        if(eventProgress !== undefined) {
          eventProgress.eventLog = event.events;
        }
      }
    },
    injectObjective: function(data) {
      for(let i=0; i<data.length; i++) {
        let objective = data[i];
        let objRender = _find(this.renderList, (item) => {
          return item._id === objective._id;
        });
        if(objRender !== undefined) {
          objRender.finishedObjs = (_filter(objective.objectives, (item) => {
                                        return ('signUser' in item)
                                      })).length;
          objRender.currentObjs = objective.objectives.length
        }
        let objProgress = _find(this.progressList, (item) => {
          return item._id === objective._id;
        });
        if(objProgress !== undefined) {
          objProgress.finishedObjs = (_filter(objective.objectives, (item) => {
                                        return ('signUser' in item)
                                      })).length;
          objProgress.currentObjs = objective.objectives.length
        }
      }
    },
    injectVersion: function(data) {
      for(let i=0; i<data.length; i++) {
        let version = data[i];
        let versionRender = _find(this.renderList, (item) => {
          return item._id === version._id;
        });
        if(versionRender !== undefined) {
          versionRender.unreadedVersion = version.versions.length;
        }
        let versionProgress = _find(this.progressList, (item) => {
          return item._id === version._id;
        });
        if(versionProgress !== undefined) {
          versionProgress.unreadedVersion = version.versions.length;
        }
      }
    },
    injectUnread: function(data) {
      for(let i=0; i<data.length; i++) {
        let unreadKB = data[i];
        let readedRender = _find(this.renderList, (item) => {
          return item._id === unreadKB._id;
        });
        if(readedRender !== undefined) {
          readedRender.unreaded = unreadKB.numberOfissue;
        }
        let readedProgress = _find(this.progressList, (item) => {
          return item._id === unreadKB._id;
        });
        if(readedProgress !== undefined) {
          readedProgress.unreaded = unreadKB.numberOfissue;
        }
      }
    },
    addFilterTags: function(data) {
      let selectedFilterTags = [...this.selectedFilterTags];
      selectedFilterTags.push(data);
      this.selectedFilterTags = _uniq(selectedFilterTags);
    },
    socketdashBoardUnreaded: function(data) {
      this.$emit('timerOn', false);
      this.$emit('toastPop', '未讀取Issue清單已下載，更新清單中');
      this.unreadedList = data;
      this.injectUnread(data);
      this.$emit('toastPop', '未讀取Issue清單更新完成');
    },
    clearQueryTerm:async function() {
      this.queryTerm = '';
      await this.generateList();
      this.renderChart();
    },
    clearFilterTag:async function() {
      this.selectedFilterTags = [];
      await this.generateList();
      this.renderChart();
    },
    generateList: async function() {
      if(this.currentUser.tags.length > 0) {
        let now = moment().unix();
        let list = [];
        let oriobj = this;
        this.$emit('toastPop', '整理清單中，請稍後...');
        this.countReviewer = 0;
        this.countVendor = 0;
        this.countWriter = 0;
        this.countPM = 0;
        this.countFinal = 0;
        if(this.selectedFilterTags.length > 0) {
          for (let i = 0; i < this.selectedFilterTags.length; i++) {
            let tag = this.selectedFilterTags[i];
            let found = _filter(this.progressList, (item) => {
              return _includes(item.tag, tag);
            });
            if(found.length > 0) {
              this.queriedChapters.push(this.selectedKBTag);
              this.queriedChapters = _uniq(this.queriedChapters);
              localStorage.setItem('queriedChapters', JSON.stringify(this.queriedChapters));
              list.push(found);
            }
          }
          list = _flatten(list);
        } else {
          list = this.progressList;
        }
        if(this.queryTerm !== '') {
          list = _filter(list, (item) => {
            return (new RegExp(oriobj.queryTerm, 'g')).test(item.mainTag+item.mainChapter+item.sort+item.title + item.desc);
          });
        }
        for (let i = 0; i< list.length; i++) {
          let KB = list[i];
          KB.attention = 0;
          KB.selected = false;
          let chapter = _head(KB.chapter);
          KB.mainChapter = chapter === undefined ? '' : chapter.title;
          let mtag = _head(KB.tag);
          let mainTag = undefined;
          if(mtag !== undefined) {
            mainTag = _find(this.savedTags, (tag) => {
              return tag._id === mtag;
            });
          }
          KB.mainTag = mainTag === undefined ? '' : mainTag.name;
          KB.currentStep = (_countBy(KB.stages, {
            current: false
          })) === KB.stages.length ? 0 : (_findIndex(KB.stages, {
            current: true
          })) + 1 ;
          for (let k = 0; k < KB.stages.length; k++) {
            let stage = KB.stages[k];
            stage.special = false;
            if(!('passTick' in stage)) {
              if(stage.current) {
                if(stage.dueTick < moment().unix()) {
                  stage.special = true;
                }
                KB.attention = moment().unix() - stage.dueTick;
              }
            }
          }
          if(KB.currentStep > 0) {
            KB.isPM = (_intersectionWith(KB.stages[KB.currentStep - 1].pmTags, this.currentUser.tags, (cTag, uTag) => {
              return cTag === uTag._id;
            })).length > 0;
            KB.isVendor = (_intersectionWith(KB.stages[KB.currentStep - 1].vendorTags, this.currentUser.tags, (cTag, uTag) => {
              return cTag === uTag._id;
            })).length > 0;
            KB.isFinal = (_intersectionWith(KB.stages[KB.currentStep - 1].finalTags, this.currentUser.tags, (cTag, uTag) => {
              return cTag === uTag._id;
            })).length > 0;
            KB.isWriter = (_intersectionWith(KB.stages[KB.currentStep - 1].writerTags, this.currentUser.tags, (cTag, uTag) => {
              return cTag === uTag._id;
            })).length > 0;
            KB.isReviewer = (_intersectionWith(KB.stages[KB.currentStep - 1].reviewerTags, this.currentUser.tags, (cTag, uTag) => {
              return cTag === uTag._id;
            })).length > 0;
            if(KB.isPM) this.countPM++;
            if(KB.isReviewer) this.countReviewer++;
            if(KB.isVendor) this.countVendor++;
            if(KB.isFinal) this.countFinal++;
            if(KB.isWriter) this.countWriter++;
          }
          KB.dueTick = 0;
          let found = _find(this.selectedpmKBs, (item) => {
            return KB._id === item;
          });
          if (found !== undefined) {
            KB.selected = true;
          }
          KB.remainTick = KB.currentStep > 0 ? KB.stages[KB.currentStep - 1].dueTick - now: Number.MAX_SAFE_INTEGER ;
        }
        if(list.length > 0) {
          if(!this.queryHistory) {
            let result = [];
            for (let i = 0; i < this.currentUser.tags.length; i++) {
              let tag = this.currentUser.tags[i];
              result.push(_filter(list, (item) => {
                if(item.currentStep === 0) {
                  return false;
                } else {
                  return _includes(_flatten([
                          item.stages[item.currentStep - 1].pmTags,
                          item.stages[item.currentStep - 1].reviewerTags,
                          item.stages[item.currentStep - 1].vendorTags,
                          item.stages[item.currentStep - 1].writerTags,
                          item.stages[item.currentStep - 1].finalTags
                        ]), tag._id);
                }
              }));
            }
            list = _flatten(result);
          }
          list = _uniqWith(list, (aKB, bKB) => {
            return aKB._id === bKB._id;
          });
          if(!this.queryHistory) {
            list = _filter(list, (KB) => {
              if(oriobj.viewReviewer) {
                if(KB.isReviewer) return true;
              }
              if(oriobj.viewPM) {
                if(KB.isPM) return true;
              }
              if(oriobj.viewFinal) {
                if(KB.isFinal) return true;
              }
              if(oriobj.viewWriter) {
                if(KB.isWriter) return true;
              }
              if(oriobj.viewVendor) {
                if(KB.isVendor) return true;
              }            
              return false;
            });
          }
          if(this.stageFilter !== 0) {
            list = _filter(list, (KB) => {
              let filter = this.stageFilter === -1 ? 0 : this.stageFilter;
              return KB.currentStep === filter;
            });
          }
          list.sort((a, b) => {
            let aTime = a.attention > 0 ? aTime * 100000 : Math.abs(aTime);
            let bTime = b.attention > 0 ? bTime * 100000 : Math.abs(bTime);
            return aTime - bTime;
          });
        }
        this.convertedList = [];
        this.renderList = [];
        let convertedList = this.sortingRule ? _orderBy(list, ['remainTick'], ['asc']) : _orderBy(list, ['mainTag', 'sort'], ['asc', 'asc']);
        let steps = _map(convertedList, (item) => {
          return item.stages.length;
        });
        let orderedSteps = steps.sort((a, b) => {
          return b - a;
        });
        this.maxStep = orderedSteps.length > 0 ? orderedSteps[0] : 5;
        this.initialized = true;
        this.statisticSteps = this.maxStep;
        this.convertedList = convertedList;
        let requestList = _map(this.progressList, (item) => {
          return item._id;
        });
        let requestStages = _map(this.progressList, (item) => {
          if(item.currentStep === 0) { return false; }
          if(item.currentStep > 0) {
            if(item.stages.length < item.currentStep) { return false; }
            return item.stages[item.currentStep - 1]._id;
          }
        });
        requestStages = _filter(requestStages, (item) => {
          return item !== false;
        });
        window.clearTimeout(this.issueTimer);
        window.clearTimeout(this.eventTimer);
        window.clearTimeout(this.versionTimer);
        window.clearTimeout(this.objectiveTimer);
        window.clearTimeout(this.renderTimer);
        this.issueTimer = undefined;
        this.versionTimer = undefined;
        this.objectiveTimer = undefined;
        this.eventTimer = undefined;
        this.renderTimer = undefined;
        this.$emit('toastPop', '清單整理完成，請稍後...');
        this.renderTimer = setTimeout(() => {
          oriobj.renderList = convertedList;
          if(oriobj.unreadedList.length === 0) {
            oriobj.$emit('toastPop', '5秒後開始下載未讀取Issue清單（完成後您會在每個知識點左下方看到數量）');
            oriobj.issueTimer = setTimeout(() => {
              oriobj.$socket.client.emit('dashBoardUnreaded', requestList);
            }, 5000);
          } else {
            oriobj.injectUnread(oriobj.unreadedList);
          }
          if(oriobj.eventList.length === 0) {
            oriobj.$emit('toastPop', '3秒後開始下載知識點編審紀錄（完成後您會在每個知識點右上方看到最後一次的編審紀錄）');
            oriobj.eventTimer = setTimeout(() => {
              oriobj.$socket.client.emit('dashBoardEventLog', requestList);
            }, 3000);
          } else {
            oriobj.injectEvents(oriobj.eventList);
          }
          if(oriobj.unreadedVersions.length === 0) {
            oriobj.$emit('toastPop', '7秒後開始下載未讀取版本清單（完成後您會在每個知識點左下方看到數量）');
            oriobj.versionTimer = setTimeout(() => {
              oriobj.$socket.client.emit('dashboardUnreadedVersions', requestList);
            }, 7000);
          } else {
            oriobj.injectVersion(oriobj.unreadedVersions);
          }
          if(oriobj.objectiveStats.length === 0) {
            oriobj.$emit('toastPop', '10秒後開始下載階段目標統計（完成後您會在每個知識點左下方看到數量）');
            oriobj.objectiveTimer = setTimeout(() => {
              oriobj.$socket.client.emit('dashboardObjectives', requestStages);
            }, 10000);
          } else {
            oriobj.injectObjective(oriobj.objectiveStats);
          }
        }, 10);
      }
    },
    renderChart: function() {
      let steps = [];
      for (let i = 0; i <= this.statisticSteps; i++) {
        steps[i] = {
          name: i === 0 ? "尚未啟動" : "第"+ i +"階段",
          data: [0]
        };
      }
      for (let i = 0; i < this.convertedList.length; i++) {
        let KB = this.convertedList[i];
        if(KB.currentStep < steps.length) {
          steps[KB.currentStep].data[0]++;
        }
      }
      this.chartSeries = steps;
    },
    closeInitW: function() {
      this.initW = false;
      window.localStorage.setItem('dashBoardFirstUse', JSON.stringify(false));
    },
    updateTags: function() {
      this.$emit('updateTags');
    },
    saveKBTag: function () {
      this.$emit('toastPop', '新增標籤中...');
      this.$socket.client.emit('setKBTag', this.currentKB);
    },
    updateKBTag: function (val) {
      this.currentKB.tag = val;
    },
    plusTag: function (val) {
      this.$emit('addTag', val);
    },
    openTagW: function (item) {
      this.currentKB = item;
      this.tagW = true;
    },
    openauthDetail: function (item) {
      this.currentKB = item;
      this.authDetailW = true;
    },
    participantStatstics: function () {
      this.$emit('toastPop', '參與者清單產生中，請稍後...');
      this.$socket.client.emit('participantStatstics', this.selectedpmKBs);
    },
    KBupdated:  function (data) {
      let found = _find(this.selectedpmKBs, (KB) => {
        return KB === data._id;
      });
      if(found !== undefined) {
        let newpmKB = _filter(this.selectedpmKBs, (item) => {
          return item !== data._id;
        });
        this.selectedpmKBs = newpmKB;
      } else {
        this.selectedpmKBs.push(data._id);
      }
    },
    openUploadW: function (data) {
      this.currentKB = data;
      this.$socket.client.emit('getKBVersions', data._id);
    },
    socketlistDashBoard:async function (data) {
      let oriobj = this;
      this.$emit('timerOn', false);
      this.$emit('toastPop', '清單下載完成，請稍後...');
      this.lastCheckTime = moment().unix();
      for(let i=0; i<data.length;i++) {
        data[i].unreaded = 0;
        data[i].eventLog = {
          desc: '',
          user: {
            name: ''
          },
          tick: 0
        };
        data[i].unreadedVersion = 0;
        data[i].currentObjs = 0;
        data[i].finishedObjs = 0;
      }
      this.progressList = data;
      await this.generateList();
      this.renderChart();
      this.dashboardPopulated = true;
      //this.dashboardPopulated = true;
      this.$emit('toastPop', '更新清單完成');
      //if(this.exeUnread) {
      /*}
      if(this.firstRun) {
        this.unreadW = true;
        this.firstRun = false;
      }*/
      clearTimeout(this.queryTimer);
      this.queryTimer = setTimeout(() => {
        this.initialized = false;
        oriobj.$emit('timerOn', true);
        oriobj.$emit('toastPop', 'DashBoard更新中');
        oriobj.$socket.client.emit('listDashBoard');
      }, this.siteSettings.userCheckTime * 60 * 1000);
      this.KBLoaded = true;
    },
    updateFilterTag: function (value) {
      this.selectedFilterTags = value;
    },
    filterKBLog: function() {
      this.$socket.client.emit('listKBLog', {
        KBID: this.currentKB._id,
        keyword: this.eventKeyword,
        ignore: this.eventIgnore,
        logNum: this.eventNum,
        logRange: this.eventsRange
      });
      this.KBLog = [];
    },
    downloadKBLog: function() {
      let output = [];
      for(let i=0; i<this.KBLog.length; i++) {
        let event = this.KBLog[i];
        output.push({
          "事件時間": this.dateConvert(event.tick),
          "使用者": event.user.name + "(" + event.user._id + ")",
          "事件類型": event.type,
          "事件描述": event.desc
        });
      }
      var element = document.createElement('a');
      element.setAttribute('href', 'data:text/plain;charset=utf-8,' + "\ufeff"+ Papa.unparse(output));
      element.setAttribute('download', moment().format('YYYY/MM/DD HH:mm:ss') + this.currentKB.title + "編審紀錄報表.csv");
      element.style.display = 'none';
      element.click();
    },
    getKBLog: function(KB) {
      let now = moment().format("YYYY-MM-DD");
      this.currentKB = KB;
      this.eventNum = 10;
      this.eventKeyword = '';
      this.eventIgnore = true;
      this.eventsRange = [now, now];
      this.$socket.client.emit('listKBLog', {
        KBID: this.currentKB._id,
        keyword: this.eventKeyword,
        ignore: this.eventIgnore,
        logNum: this.eventNum,
        logRange: this.eventsRange
      });
      this.KBLog = [];
    },
    socketlistKBLog: function(data) {
      this.KBLog = data;
      this.eventlogW = true;
    },
    dateConvert: function (time) {
      return time === null || time === undefined ? moment().format('YYYY/MM/DD HH:mm:ss') : moment.unix(time).format('YYYY/MM/DD HH:mm:ss');
    },
    sockparticipantStatstics: function (data) {
      data.proceedUsers = _uniq(data.proceedUsers);
      let newuserData = [];
      for(let i=0; i<data.statistics.length; i++) {
        let userData = data.statistics[i];
        let existuserData = _find(newuserData, (item) => {
          return item._id === userData._id;
        });
        if(existuserData === undefined) {
          newuserData.push(userData);
        } else {
          existuserData.finalStages = _unionWith(existuserData.finalStages, userData.finalStages);
          existuserData.reviewerStages = _unionWith(existuserData.reviewerStages, userData.reviewerStages);
          existuserData.pmStages = _unionWith(existuserData.pmStages, userData.pmStages);
          existuserData.vendorStages = _unionWith(existuserData.vendorStages, userData.vendorStages);
          existuserData.writerStages = _unionWith(existuserData.writerStages, userData.writerStages);
        }
      }
      data.statistics = newuserData;
      this.participantsDB = data;
      this.participantW = true;
    },
    tagColor: function(n) {
      return this.randomColors[n];
    },
    exportParticipant: function () {
      this.$emit('toastPop', '參與者清單產生完成！');
      let output = [];
      for (let i = 0; i < this.participantsDB.statistics.length; i++) {
        let user = this.participantsDB.statistics[i];
        let pmKB = _map(user.pmStages, (item) => {
          return item.KBID;
        });
        pmKB = _uniq(pmKB);
        let reviewerKB = _map(user.reviewerStages, (item) => {
          return item.KBID;
        });
        reviewerKB = _uniq(reviewerKB);
        let writerKB = _map(user.writerStages, (item) => {
          return item.KBID;
        });
        writerKB = _uniq(writerKB);
        let vendorKB = _map(user.vendorStages, (item) => {
          return item.KBID;
        });
        vendorKB = _uniq(vendorKB);
        let finalKB = _map(user.finalStages, (item) => {
          return item.KBID;
        });
        finalKB = _uniq(finalKB);
        let outputItem = {
          '使用者ID': user._id,
          '參與者': user.name,
          '服務單位': user.unit,
          '擔任PM次數(階段別)': user.pmStages.length,
          '擔任PM次數(知識點別)': pmKB.length,
          '擔任審查者次數(階段別)': user.reviewerStages.length,
          '擔任審查者次數(知識點別)': reviewerKB.length,
          '擔任寫手次數(階段別)': user.writerStages.length,
          '擔任寫手次數(知識點別)': writerKB.length,
          '擔任廠商次數(階段別)': user.vendorStages.length,
          '擔任廠商次數(知識點別)': vendorKB.length,
          '擔任行政組次數(階段別)': user.finalStages.length,
          '擔任行政組次數(知識點別)': finalKB.length,
          '參與PM階段清單': _map(user.pmStages, (item) => {
            return '[' + item.KBtitle + '|' + item.name + ']';
          }),
          '參與審查者階段清單': _map(user.reviewerStages, (item) => {
            return '[' + item.KBtitle + '|' + item.name + ']';
          }),
          '參與寫手階段清單': _map(user.writerStages, (item) => {
            return '[' + item.KBtitle + '|' + item.name + ']';
          }),
          '參與廠商階段清單': _map(user.vendorStages, (item) => {
            return '[' + item.KBtitle + '|' + item.name + ']';
          }),
          '參與行政組階段清單': _map(user.finalStages, (item) => {
            return '[' + item.KBtitle + '|' + item.name + ']';
          }),
        };
        output.push(outputItem);
      }
      var element = document.createElement('a');
      element.setAttribute('href', 'data:text/plain;charset=utf-8,' + "\ufeff"+ Papa.unparse(output));
      element.setAttribute('download', moment().format('YYYY/MM/DD HH:mm:ss') + "參與者統計匯出報表.csv");
      element.style.display = 'none';
      element.click();
    },
    sockgetKBVersions: function (data) {
      this.versionPopulated = true;
      this.currentVersions = data;
      this.$socket.client.emit('dashboardUnreadedVersions', [this.currentKB._id]);
      this.versionComment = '';
      this.versionW = true;
    },
    injectVersionW: function(data) {
      let readedVersions = _find(this.unreadedVersions, (item) => {
        return item._id === this.currentKB._id;
      });
      for(let i=0; i<data.length; i++) {
        let currentVersion = data[i];
        let version = readedVersions === undefined ? undefined : {}; //如果沒有回傳unreadedversion，代表整篇都讀過，不然預設值就是沒讀
        if(readedVersions !== undefined) {
          version = _find(readedVersions.versions, (item) => {
            return item === currentVersion._id;
          });
        }
        currentVersion.readed = version === undefined;
        if('fileInfo' in currentVersion) {
          currentVersion.validHeight = currentVersion.fileInfo.height >= this.siteSettings.validFormat.validHeight;
          currentVersion.validWidth = currentVersion.fileInfo.width >= this.siteSettings.validFormat.validWidth;
          currentVersion.validAudio = this.siteSettings.validFormat.withAudio ? currentVersion.fileInfo.hasAudio : true;
          currentVersion.validRange = _inRange(currentVersion.fileInfo.duration, this.siteSettings.validFormat.validRange[0], this.siteSettings.validFormat.validRange[1]) || currentVersion.fileInfo.duration === this.siteSettings.validFormat.validRange[1];
        }
      }
      this.currentVersions = data;
    },
    getlatestVersions: function () {
      this.$socket.client.emit('getlatestVersions', {
        limit: this.latestCount,
        KBs: this.selectedpmKBs
      });
    },
    closeVersionW: function () {
      this.versionW = false;
      this.versionPopulated = false;
    },
    deleteKBVersion: function (data) {
      this.$socket.client.emit('deleteKBVersion', {
        fileID: data,
        KBID: this.currentKB._id
      });
    },
    socketrequestKBVersionSlice: function (data) {
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
        oriobj.$socket.client.emit('sendKBVersion', {
          uid: files[data.uuid]._id,
          uuid: data.uuid,
          name: files[data.uuid].file.name,
          type: files[data.uuid].file.type,
          size: files[data.uuid].file.size,
          comment: oriobj.versionComment,
          data: arrayBuffer
        });
      };
    },
    socketKBVersionDeleteError: function (data) {
      this.$emit('toastPop', '刪除檔案失敗（原因：' + data + '），請聯絡管理員');
      this.uploadprogress = 0;
      this.uploadstatus = '';
    },
    socketKBVersionUploadError: function (data) {
      this.$emit('toastPop', '上傳失敗（原因：' + data + '），請聯絡管理員');
      this.uploadprogress = 0;
      this.uploadstatus = '';
    },
    soketKBVersionUploadDone: function (data) {
      let oriobj = this;
      if (data === this.currentKB._id) {
        this.$socket.client.emit('getKBVersions', data);
        this.versionFile = undefined;
        this.uploadprogress = 100;
        this.uploadstatus = '完成！';
        this.importW = false;
        this.statusMsg = '';
        this.$socket.client.emit('dashboardUnreadedVersions', [data]);
        Vue.nextTick(() => {
          oriobj.uploadprogress = 0;
          oriobj.uploadstatus = '';
        });
      }
    },
    socketdeleteKBVersion: function(data) {
      if(data) {
        this.$socket.client.emit('getKBVersions', this.currentKB._id);
      }
    },
    soketsetKBTag: function (data) {
      if(data) {
        this.$socket.client.emit('listDashBoard');
        this.$emit('toastPop', '新增標籤完成！');
        this.tagW = false;
      } else {
        this.$emit('toastPop', '你不可以把全部的標籤都清除啦！');
      }
    },
    soketgetlatestVersions: function (data) {
      for (let i = 0; i < data.length; i++) {
        let file = data[i];
        this.downloadFile(file);
      }
    },
    socketcreateUsersReport: function (data) {
      this.$emit('toastPop', data);
    },
    downloadFile: function (file) {
      this.$emit('downloadFile', file);
    },
    tagQuery: function(tag) {
      let tagItem = _find(this.savedTags, (item) => {
        return item._id === tag
      });
      return tagItem === undefined ? '' : tagItem.name;
    }
  },
  watch: {
    "currentUser.tags": async function() {
      if(this.currentUser.tags.length > 0) {
        if(this.progressList.length > 0) {
          await this.generateList();
          this.renderChart();
          this.initialized = true;
          this.dashboardPopulated = true;
        }
      }
    },
    showStatstics: async function () {
      if(this.showStatstics) {
        if(this.convertedList.length > 0) {
          this.renderChart();
        }
      }
    },
    queryHistory: async function () {
      if(this.initialized) {
        console.dir(this.initialized);
        this.initialized = false;
        await this.generateList();
        this.renderChart();
        this.initialized = true;
      }
    },
    sortingRule:async function () {
      if(this.initialized) {
        this.initialized = false;
        await this.generateList();
        this.renderChart();
        this.initialized = true;
      }
    },
    statisticSteps: function () {
      if(this.initialized) {
        this.initialized = false;
        this.renderChart();
        this.initialized = true;
      }
    },
    dashBoardFirstUse: function () {
      if(this.localLoaded) {
        window.localStorage.setItem('dashBoardFirstUse', JSON.stringify(this.dashBoardFirstUse));
      }
    },
    initStatstics: function () {
      if(this.localLoaded) {
        window.localStorage.setItem('initStatstics', JSON.stringify(this.initStatstics));
      }
      this.showStatstics = this.initStatstics;
    },
    initHistory: function () {
      if(this.localLoaded) {
        window.localStorage.setItem('initHistory', JSON.stringify(this.initHistory));
      }
      this.queryHistory = this.initHistory;
    },
    initSorting: function () {
      if(this.localLoaded) {
        window.localStorage.setItem('initSorting', JSON.stringify(this.initSorting));
      }
      this.sortingRule = this.initSorting;
    },
    versionFile: {
      immediate: true,
      handler () {
        if (this.versionFile !== undefined) {
          let oriobj = this;
          let fileReader = new FileReader();
          let slice = this.versionFile.slice(0, 100000);
          let uuid = uuidv4();
          files[uuid] = {
            _id: this.currentKB._id,
            file: this.versionFile,
            starttick: moment().valueOf()
          };
          fileReader.readAsArrayBuffer(slice);
          fileReader.onload = () => {
              var arrayBuffer = fileReader.result;
              oriobj.$socket.client.emit('sendKBVersion', {
                uid: oriobj.versionFile._id,
                uuid: uuid,
                name: oriobj.versionFile.name,
                type: oriobj.versionFile.type,
                size: oriobj.versionFile.size,
                comment: oriobj.versionComment.substring(0, 30),
                data: arrayBuffer
              });
          };
        }
      }
    }
  },
  computed: {
    filterHistory: {
      get: function() {
        return this.queryHistory ? 1 : 0;
      },
      set: function(value) {
        this.queryHistory = value === 0 ? false : true;
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
    randomColors: function () {
      let color = randomColor({
          luminosity: 'dark',
          count: 5,
          format: 'rgb',
          hue: this.$store.state.siteColor
      });
      return color;
    },
    filterColor: function () {
      return this.selectedFilterTags.length > 0 || this.queryTerm !== '' || this.queryHistory === true ? '#B71C1C' : '#00B0FF';
    }
  },
  data () {
    return {
      eventsRange: [],
      eventKeyword: '',
      eventIgnore: true,
      eventNum: 10,
      KBLog: [],
      eventlogW: false,
      stageFilter: 0,
      stageFW: false,
      KBLoaded: false,
      priviledgeVW: false,
      viewReviewer: true,
      viewPM: true,
      viewFinal: true,
      viewWriter: true,
      viewVendor: true,
      countReviewer: 0,
      countVendor: 0,
      countPM: 0,
      countFinal: 0,
      countWriter: 0,
      unreadedVersions: [],
      issueTimer: undefined,
      eventTimer: undefined,
      versionTimer: undefined,
      objectiveTimer: undefined,
      renderTimer: undefined,
      objectiveStats: [],
      eventList: [],
      renderList: [],
      /*firstRun: true,
      unreadW: false,
      exeUnread: false,*/
      unreadedList: [],
      sortingRule: true,
      queriedChapters: [],
      initialized: false,
      maxStep: 5,
      convertedList: [],
      chartSeries: [
        {
          name: '0',
          data: [0]
        }
      ],
      chartOptions: {
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
          categories: ['專案完成度'],
        },
        tooltip: {
          y: {
            formatter: function (val) {
              return val + "個知識點"
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
      statisticSteps: 1,
      initStatstics: false,
      initHistory: false,
      initSorting: true,
      initW: false,
      dashBoardFirstUse: true,
      localLoaded: false,
      tagW: false,
      authDetailW: false,
      dashboardPopulated: false,
      showStatstics: false,
      latestCount: 1,
      currentKB: {
        _id: '',
        title: '',
        tag: []
      },
      versionComment: '',
      uploadprogress: 0,
      uploadstatus: '',
      versionW: false,
      versionPopulated: false,
      currentVersions: [],
      participantsDB: {
        proceedUsers: [],
        proceedKBs: [],
        statistics: []
      },
      youtubeW: false,
      participantW: false,
      versionFile: undefined,
      selectedpmKBs: [],
      pmtoolsBtns: false,
      queryTimer: null,
      queryHistory: false,
      filterBtn: false,
      filterTags: [],
      queryTerm: '',
      selectedFilterTags: [],
      progressList: []
    };
  },
  beforeDestroy () {
    this.$socket.client.off('dashboardObjectives', this.socketdashboardObjectives);
    this.$socket.client.off('dashBoardEventLog', this.socketdashBoardEventLog);
    this.$socket.client.off('dashBoardUnreaded', this.socketdashBoardUnreaded);
    this.$socket.client.off('createUsersReport', this.socketcreateUsersReport);
    this.$socket.client.off('listDashBoard', this.socketlistDashBoard);
    this.$socket.client.off('participantStatstics', this.sockparticipantStatstics);
    this.$socket.client.off('getKBVersions', this.sockgetKBVersions);
    this.$socket.client.off('KBVersionUploadError', this.socketKBVersionUploadError);
    this.$socket.client.off('KBVersionDeleteError', this.socketKBVersionDeleteError);
    this.$socket.client.off('requestKBVersionSlice', this.socketrequestKBVersionSlice);
    this.$socket.client.off('KBVersionUploadDone', this.soketKBVersionUploadDone);
    this.$socket.client.off('getlatestVersions', this.soketgetlatestVersions);
    this.$socket.client.off('setKBTag', this.soketsetKBTag);
    this.$socket.client.off('dashboardUnreadedVersions', this.socketdashboardUnreadedVersions);
    this.$socket.client.off('deleteKBVersion', this.socketdeleteKBVersion);
    this.$socket.client.off('listKBLog', this.socketlistKBLog);
    window.clearTimeout(this.queryTimer);
    this.queryTimer = null;
    window.clearTimeout(this.issueTimer);
    window.clearTimeout(this.versionTimer);
    window.clearTimeout(this.objectiveTimer);
    window.clearTimeout(this.eventTimer);
    this.issueTimer = undefined;
    this.versionTimer = undefined;
    this.objectiveTimer = undefined;
    this.eventTimer = undefined;
  },
  mounted () {
    let dashBoardFirstUse = window.localStorage.getItem('dashBoardFirstUse');
    if(dashBoardFirstUse) {
      this.dashBoardFirstUse = JSON.parse(dashBoardFirstUse);
    }
    let initStatstics = window.localStorage.getItem('initStatstics');
    if(initStatstics) {
      this.initStatstics = JSON.parse(initStatstics);
    }
    let initHistory = window.localStorage.getItem('initHistory');
    if(initHistory) {
      this.initHistory = JSON.parse(initHistory);
    }
    let initSorting = window.localStorage.getItem('initSorting');
    if(initSorting) {
      this.initSorting = JSON.parse(initSorting);
    }
    if(this.dashBoardFirstUse) {
      this.initW = true;
    }
    this.localLoaded = true;
  },
  created () {
    this.$emit('viewIn', {
      text: 'DashBoard',
      icon: 'fa-tachometer-alt',
      module: '審查模組',
      location: '/userDashBoard'
    });
    this.$emit('timerOn', true);
    this.$emit('toastPop', 'DashBoard更新中');
    let now = moment().format("YYYY-MM-DD");
    this.eventsRange = [now, now];
    this.$socket.client.on('listKBLog', this.socketlistKBLog);
    this.$socket.client.on('dashboardObjectives', this.socketdashboardObjectives);
    this.$socket.client.on('dashBoardEventLog', this.socketdashBoardEventLog);
    this.$socket.client.on('dashBoardUnreaded', this.socketdashBoardUnreaded);
    this.$socket.client.on('createUsersReport', this.socketcreateUsersReport);
    this.$socket.client.on('listDashBoard', this.socketlistDashBoard);
    this.$socket.client.on('participantStatstics', this.sockparticipantStatstics);
    this.$socket.client.on('getKBVersions', this.sockgetKBVersions);
    this.$socket.client.on('KBVersionUploadError', this.socketKBVersionUploadError);
    this.$socket.client.on('KBVersionDeleteError', this.socketKBVersionDeleteError);
    this.$socket.client.on('requestKBVersionSlice', this.socketrequestKBVersionSlice);
    this.$socket.client.on('KBVersionUploadDone', this.soketKBVersionUploadDone);
    this.$socket.client.on('getlatestVersions', this.soketgetlatestVersions);
    this.$socket.client.on('setKBTag', this.soketsetKBTag);
    this.$socket.client.on('dashboardUnreadedVersions', this.socketdashboardUnreadedVersions);
    this.$socket.client.on('deleteKBVersion', this.socketdeleteKBVersion);
    let queriedChapters = window.localStorage.getItem('queriedChapters');
    if(queriedChapters) {
      this.queriedChapters = JSON.parse(queriedChapters);
    }
    this.$socket.client.emit('listDashBoard');
  }
};
</script>
