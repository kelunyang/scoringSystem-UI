<template>
  <v-sheet>
    <v-dialog
      v-model="addBonusW"
      max-width="500px"
    >
      <v-card>
        <v-card-title>新增獎勵點數（已選{{ selectedGroup.length }}組）</v-card-title>
        <v-card-text class='text-left black--text text-body-1 pa-2 d-flex flex-column'>
          <v-alert v-if="bonusAdded" type="info" outlined icon='fa-info' class='text-left'>獎勵發放完成！</v-alert>
          <v-text-field outlined clearable dense label='獎勵名目' v-model='bonusName'></v-text-field>
          <v-slider
            :label='"新增"+defaultSchema.initCapital+"點"'
            :min='0'
            :max='10000'
            step='100'
            v-model="defaultSchema.initCapital"
            thumb-label
          ></v-slider>
        </v-card-text>
        <v-card-actions class='text-left black--text text-body-1 pa-2 d-flex flex-row'>
          <v-btn
            class='white--text ma-1'
            @click='addBonus()'
            color='red darken-4'
          >
            新增獎勵點數
          </v-btn>
          <v-btn
            class='white--text ma-1'
            @click='closeaddBonusW()'
            color='indigo darken-4'
          >
            關閉本對話框
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="removeBonusW" fullscreen hide-overlay transition='dialog-bottom-transition'>
      <v-card>
        <v-toolbar dark color='primary'>
          <v-btn icon dark @click='closeremoveBonusW()'>
            <v-icon>fa-times</v-icon>
          </v-btn>
          <v-toolbar-title>查詢／撤回獎勵點數（已選擇{{ selectedGroup.length }}組）</v-toolbar-title>
        </v-toolbar>
        <v-card-text class='text-left black--text text-body-1 pa-2 d-flex flex-column'>
          <v-alert v-if="accountingRemoved" type="info" outlined icon='fa-info' class='text-left'>帳目取消完成！</v-alert>
          <v-text-field label='獎勵名目' hint='支援正規表達式' outlined clearable dense v-model='bonusName'></v-text-field>
          <v-btn
            class='white--text ma-1'
            @click='queryBonus()'
            color='indigo darken-4'
          >
            查詢帳目
          </v-btn>
          <v-btn
            class='white--text ma-1'
            @click='removeAccounting()'
            color='red darken-4'
            v-if="selectedAccounting.length > 0"
          >
            撤銷所選帳目（{{ selectedAccounting.length }}）
          </v-btn>
          <v-btn
            class='white--text ma-1'
            @click='selectAllAccounting()'
            color='indigo darken-4'
            v-if="queryAccounting.length > 0"
          >
            全選{{ queryAccounting.length }}筆記錄
          </v-btn>
          <v-btn
            class='white--text ma-1'
            @click='deselectAccounting()'
            color='indigo darken-4'
            v-if="selectedAccounting.length > 0"
          >
            取消選取{{ selectedAccounting.length }}筆記錄
          </v-btn>
          <div class='text-caption text-center' v-if='queryAccounting.length === 0'>你查詢的關鍵字沒有相關帳目</div>
          <v-simple-table v-if='queryAccounting.length > 0'>
            <template v-slot:default>
              <thead>
                <tr>
                  <th class="text-left">
                    &nbsp;
                  </th>
                  <th class="text-left">
                    帳號
                  </th>
                  <th class="text-left">
                    日期
                  </th>
                  <th class="text-left">
                    點數
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="item in queryAccounting"
                  :key="item._id"
                >
                  <td>
                    <v-checkbox v-model="selectedAccounting" off-icon="far fa-square" on-icon="fa-check-square" :value="item._id"></v-checkbox>
                  </td>
                  <td>{{ item.user.name }}</td>
                  <td>{{ dateConvert(item.tick) }}</td>
                  <td>{{ item.value }}</td>
                </tr>
              </tbody>
            </template>
          </v-simple-table>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-dialog v-model="lonerW" fullscreen hide-overlay transition='dialog-bottom-transition'>
      <v-card>
        <v-toolbar dark color='primary'>
          <v-btn icon dark @click='lonerW = false'>
            <v-icon>fa-times</v-icon>
          </v-btn>
          <v-toolbar-title>檢查沒有組的人</v-toolbar-title>
        </v-toolbar>
        <v-card-text class='text-left black--text text-body-1 pa-2 d-flex flex-column'>
          <v-text-field label='關鍵字（可搜尋用戶名）' hint='支援正規表達式，用|表示OR，用(?=.*集合一)(?=.*集合二)表示AND' outlined clearable dense v-model='lonerKeyword'></v-text-field>
          <tag-filter
            @updateTags='updateTags'
            :mustSelected='false'
            :single='false'
            :selectedItem='lonerTags'
            @valueUpdated='updatelonerTag'
            :candidatedItem='savedTags'
            :createable='false'
            label='選擇你想查詢的歸屬標籤'
          />
          <v-btn
            class='white--text ma-1'
            @click='queryLoner()'
            color='indigo darken-4'
          >
            查詢沒有組的人
          </v-btn>
          <div class='text-caption text-center' v-if='loners.length === 0'>你查詢的範圍都有組囉</div>
          <v-simple-table v-if='loners.length > 0'>
            <template v-slot:default>
              <thead>
                <tr>
                  <th class="text-left">
                    姓名
                  </th>
                  <th class="text-left">
                    單位
                  </th>
                  <th class="text-left">
                    標籤
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="loner in loners"
                  :key="loner._id"
                >
                  <td>
                    {{ loner.name }}
                  </td>
                  <td>{{ loner.unit }}</td>
                  <td>{{ tagName(loner.tags) }}</td>
                </tr>
              </tbody>
            </template>
          </v-simple-table>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="userSelectorW"
      persistent
      max-width="50%"
    >
      <v-sheet class='d-flex flex-column pa-1'>
        <tag-filter
          :mustSelected='true'
          :single='true'
          :selectedItem='listedsUser'
          @valueUpdated='updatelistedsUser'
          :candidatedItem='schemaUsers'
          :createable='false'
          label='選擇你想查詢帳本的用戶'
        />
        <v-btn
          class='white--text ma-1'
          :disabled='loadingUser'
          @click='assetViewer(selectedUser, undefined)'
          color='indigo darken-4'
        >
          查詢指定的用戶的帳本
        </v-btn>
        <v-btn
          class='white--text ma-1'
          @click='balanceCSV()'
          color='indigo darken-4'
        >
          下載這個活動全部參與用戶的財產清單
        </v-btn>
        <v-btn
          class='white--text ma-1'
          color='red darken-4'
          @click='closeuserquery()'
        >
          關閉對話框
        </v-btn>
      </v-sheet>
    </v-dialog>
    <v-dialog v-model="addGroupW" fullscreen hide-overlay transition='dialog-bottom-transition'>
      <v-card>
        <v-toolbar dark color='primary'>
          <v-btn icon dark @click='addGroupW = false'>
            <v-icon>fa-times</v-icon>
          </v-btn>
          <v-toolbar-title>新增分組</v-toolbar-title>
        </v-toolbar>
        <v-card-text class='text-left black--text text-body-1 pa-2 d-flex flex-column'>
        <v-slider
          :label='"新增"+groupCount+"組"'
          :min='1'
          :max='10'
          v-model="groupCount"
          thumb-label
        ></v-slider>
        <tag-filter
          @updateTags='updateTags'
          @plusItem='plusTag'
          :mustSelected='true'
          :single='true'
          :selectedItem='groupTag'
          @valueUpdated='updategroupTag'
          :candidatedItem='savedTags'
          :createable='true'
          label='選擇該組別隸屬的標籤'
        />
        <v-btn
          class='white--text ma-1'
          @click='plusGroup'
          color='indigo darken-4'
        >
          新增{{ groupCount }}個組
        </v-btn>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-dialog v-model='assetViewerW' fullscreen hide-overlay transition='dialog-bottom-transition'>
      <v-card>
        <v-toolbar dark color='primary'>
          <v-btn icon dark @click='closeAssetW()'>
            <v-icon>fa-times</v-icon>
          </v-btn>
          <v-toolbar-title>查詢{{ defaultUser.name }}的財產</v-toolbar-title>
        </v-toolbar>
        <v-card-text class='text-left black--text text-body-1 pa-2 d-flex flex-column'>
          <apexchart type="bar" width='100%' :height="balanceHeight" :options="chartOptions" :series="chartSeries"></apexchart>
          <div class='text-body-1'>選擇查詢區間（如果你把兩個日期都選在同一天，那查詢就會查全部的時間段）</div>
          <v-text-field label='關鍵字（可搜尋用戶名、動作名、描述）' hint='支援正規表達式，用|表示OR，用(?=.*集合一)(?=.*集合二)表示AND' outlined clearable dense v-model='assetKeyword'></v-text-field>
          <v-slider
            label='下載條目數量'
            min='10'
            max='500'
            v-model="assetNum"
            thumb-label
          ></v-slider>
          <v-date-picker
            v-model="assetDates"
            full-width
            range
          ></v-date-picker>
          <v-btn class='ma-1' @click='filterAsset'>篩選帳本</v-btn>
          <v-simple-table v-if="assetLog.length > 0" class='black--text'>
            <template v-slot:default>
              <thead>
                <tr>
                  <th class="text-left">時間</th>
                  <th class="text-left">點數</th>
                  <th class="text-left">註解</th>
                  <th v-if='isSupervisor(defaultSchema)' class="text-left">&nbsp;</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="event in assetLog"
                  :key="event._id"
                >
                  <td class="text-left">
                    {{ dateConvert(event.tick) }}
                  </td>
                  <td class="text-left">
                    {{ event.value }}
                  </td>
                  <td class="text-left">
                    {{ event.desc }}
                  </td>
                  <td class='text-right' v-if='isSupervisor(defaultSchema)'>
                    <v-btn @click='rejectAccounting(event)'>撤銷紀錄</v-btn>
                  </td>
                </tr>
              </tbody>
            </template>
          </v-simple-table>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-dialog v-model='eventlogW' fullscreen hide-overlay transition='dialog-bottom-transition'>
      <v-card>
        <v-toolbar dark color='primary'>
          <v-btn icon dark @click='eventlogW = false'>
            <v-icon>fa-times</v-icon>
          </v-btn>
          <v-toolbar-title>查詢{{ defaultSchema.name }}的事件紀錄</v-toolbar-title>
        </v-toolbar>
        <v-card-text class='text-left black--text text-body-1 pa-2 d-flex flex-column'>
          <v-text-field label='關鍵字（可搜尋用戶名、動作名、描述）' hint='支援正規表達式，用|表示OR，用(?=.*集合一)(?=.*集合二)表示AND' outlined clearable dense v-model='eventKeyword'></v-text-field>
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
          <v-btn class='ma-1' @click='filterLog'>篩選紀錄</v-btn>
          <v-simple-table v-if="schemaLog.length > 0" class='black--text'>
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
                  v-for="event in schemaLog"
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
    <v-dialog v-model='stageeditorW' fullscreen hide-overlay transition='dialog-bottom-transition'>
      <v-card>
        <v-toolbar dark color='primary'>
          <v-btn icon dark @click='closeStageW()'>
            <v-icon>fa-times</v-icon>
          </v-btn>
          <v-toolbar-title>回合編輯器</v-toolbar-title>
        </v-toolbar>
        <v-card-text class='pa-0 ma-0 text-left black--text text-body-1'>
          <v-container class='pa-5'>
            <v-row class='d-flex flex-column'>
              <v-col>
                <v-tooltip bottom>
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn icon v-bind="attrs" v-on="on" @click='plusStage()'>
                      <v-icon>fa-plus</v-icon>
                    </v-btn>
                  </template>
                  <span>新增回合</span>
                </v-tooltip>                    
              </v-col>
            </v-row>
            <v-row>
              <v-col class='d-flex flex-column'>
                <draggable group="stages" v-model="stageList" style="min-height: 10px" handle='.handle'>
                  <v-list-item v-for="item in stageList" :key='"stage" + item._id'>
                    <v-list-item-content class="text-left">
                      <v-list-item-title>
                        <span v-if='item.matchPoint'>[賽點]</span>
                        <span v-if='item.closed > 0'>[關閉]</span>
                        {{ item.name }}({{ item.value }})
                      </v-list-item-title>
                      <v-list-item-subtitle>
                        <span>開始於{{ dateConvert(item.startTick) }}</span>
                        <span>結束於{{ dateConvert(item.endTick) }}</span>
                      </v-list-item-subtitle>
                    </v-list-item-content>
                    <v-list-item-action class='d-flex flex-row'>
                      <v-tooltip bottom>
                        <template v-slot:activator="{ on, attrs }">
                          <v-btn
                            icon
                            @click.stop='closeStage(item)'
                            v-bind="attrs" v-on="on"
                          >
                            <v-icon v-if='item.closed === 0'>fa-times-circle</v-icon>
                            <v-icon v-if='item.closed > 0'>fa-play-circle</v-icon>
                          </v-btn>
                        </template>
                        <span v-if='item.closed === 0'>關閉回合</span>
                        <span v-if='item.closed > 0'>啟動回合</span>
                      </v-tooltip>
                      <v-tooltip bottom>
                        <template v-slot:activator="{ on, attrs }">
                          <v-btn
                            icon
                            @click.stop='noreplyStage(item)'
                            v-bind="attrs" v-on="on"
                          >
                            <v-icon v-if='item.replyDisabled > 0'>fa-comment</v-icon>
                            <v-icon v-else>fa-comment-slash</v-icon>
                          </v-btn>
                        </template>
                        <span v-if='item.replyDisabled > 0'>啟動回合評分</span>
                        <span v-else>禁止回合評分</span>
                      </v-tooltip>
                      <v-tooltip bottom>
                        <template v-slot:activator="{ on, attrs }">
                          <v-btn icon v-bind="attrs" v-on="on" @click='getStage(item)'>
                            <v-icon>fa-pencil-alt</v-icon>
                          </v-btn>
                        </template>
                        <span>編輯回合</span>
                      </v-tooltip>
                      <v-tooltip bottom>
                        <template v-slot:activator="{ on, attrs }">
                          <v-btn v-bind="attrs" v-on="on" icon @click='removeStage(item)'>
                            <v-icon>fa-trash</v-icon>
                          </v-btn>
                        </template>
                        <span>刪除回合</span>
                      </v-tooltip>
                      <v-tooltip bottom>
                        <template v-slot:activator="{ on, attrs }">
                          <v-btn v-bind="attrs" v-on="on" icon class='handle'>
                            <v-icon>fa-arrows-alt</v-icon>
                          </v-btn>
                        </template>
                        <span>上下移動本分類</span>
                      </v-tooltip>
                    </v-list-item-action>
                  </v-list-item>
                </draggable>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-dialog v-model='groupeditorW' fullscreen hide-overlay transition='dialog-bottom-transition'>
      <v-card>
        <v-toolbar dark color='primary'>
          <v-btn icon dark @click='groupeditorW = false'>
            <v-icon>fa-times</v-icon>
          </v-btn>
          <v-toolbar-title>分組編輯器</v-toolbar-title>
        </v-toolbar>
        <v-card-text class='pa-0 ma-0 text-left black--text text-body-1'>
          <v-container class='pa-5'>
            <v-row class='d-flex flex-row'>
              <v-col class='d-flex flex-row'>
                <v-btn @click='addGroupW = true'>
                  新增分組
                </v-btn>
                <v-btn @click='checkLoner()'>
                  檢查無組別者
                </v-btn>
                <v-btn v-if="selectedGroup.length > 0" @click='addBonusW = true'>
                  新增獎勵點數
                </v-btn>
                <v-btn v-if="selectedGroup.length > 0" @click='removeBonusW = true'>
                  查詢／移除獎勵點數
                </v-btn>
                <v-btn v-if="groupList.length > 0" @click='selectAllGroup'>
                  全選{{ groupList.length }}個組
                </v-btn>
                <v-btn v-if="selectedGroup.length > 0" @click='deselectGroup'>
                  取消選取{{ selectedGroup.length }}個組
                </v-btn>
              </v-col>
            </v-row>
            <v-row>
              <v-col class='d-flex flex-column'>
                <v-list-item-group
                  multiple
                  active-class=""
                >
                  <v-list-item v-for="item in groupList" :key='"stage" + item._id'>
                    <template>
                      <v-list-item-action>
                        <v-checkbox v-model="selectedGroup" off-icon="far fa-square" on-icon="fa-check-square" :value="item._id"></v-checkbox>
                      </v-list-item-action>
                      <v-list-item-content class="text-left">
                        <v-list-item-title>
                          <v-icon v-if='item.locked'>fa-user-lock</v-icon>
                          組長：{{ arrayConverter(item.groupLeaderNames) }}
                        </v-list-item-title>
                        <v-list-item-subtitle>
                          <span>組員共{{ item.members.length }}人</span>
                        </v-list-item-subtitle>
                      </v-list-item-content>
                      <v-list-item-action class='d-flex flex-row'>
                        <v-btn @click='lockGroup(item)' class='ma-1'>
                          <span v-if='item.locked'>解鎖小組</span>
                          <span v-else>鎖定小組</span>
                        </v-btn>
                        <v-btn @click='editGroup(item)' class='ma-1'>
                          編輯小組
                        </v-btn>
                        <v-btn @click='removeGroup(item)' class='ma-1'>
                          刪除小組
                        </v-btn>
                      </v-list-item-action>
                    </template>
                  </v-list-item>
                </v-list-item-group>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-dialog v-model='modStageW' fullscreen hide-overlay transition='dialog-bottom-transition'>
      <v-card>
        <v-toolbar dark color='primary'>
          <v-btn icon dark @click='modStageW = false'>
            <v-icon>fa-times</v-icon>
          </v-btn>
          <v-toolbar-title>修改活動回合</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon dark @click='saveStage'>
            <v-icon>fa-cloud-upload-alt</v-icon>
          </v-btn>
        </v-toolbar>
        <v-card-text class='pa-0 ma-0 text-left black--text text-body-1'>
          <v-container class='pa-5'>
            <v-row>
              <v-col class='d-flex flex-column'>
                <v-text-field outlined clearable dense label='回合名稱' v-model='defaultStage.name'></v-text-field>
                <Tip-Tap
                  v-model="defaultStage.desc"
                  maxHeight="10vh"
                  minHeight="5vh"
                  hint='請輸入回合描述'
                />
                <div class='text-subtitle-2 font-weight-blod'>賽點</div>
                <v-switch
                  v-model="defaultStage.matchPoint"
                  label="如果是賽點，就會用總分排名計分，而非時間先後計分"
                ></v-switch>
                <div class='text-subtitle-2 font-weight-blod'>回合倍率</div>
                <v-slider
                  :label='"回合倍率為"+defaultStage.value+"倍"'
                  :min='1'
                  :max='10'
                  v-model="defaultStage.value"
                  thumb-label
                ></v-slider>
                <div class='text-subtitle-2 font-weight-blod'>押金</div>
                <v-slider
                  :label='"加入回合必須投注"+defaultStage.defaultDeposit+"點"'
                  :min='100'
                  :max='1000'
                  v-model="defaultStage.defaultDeposit"
                  thumb-label
                ></v-slider>
                <div class='text-subtitle-2 font-weight-blod'>押金投注刻度（每次要投注多少）</div>
                <v-slider
                  :label='"押金刻度每次為"+defaultStage.depositStep+"點"'
                  :min='10'
                  :max='100'
                  v-model="defaultStage.depositStep"
                  thumb-label
                ></v-slider>
                <div class='text-subtitle-2 font-weight-blod'>回合開始日期</div>
                <VueCtkDateTimePicker :noKeyboard='true' :inline='true' v-model="stagestartDate" label='請選擇開始日期' locale='zh-tw' format='YYYY-MM-DD HH:mm:ss' class='ma-2' />
                <div class='text-subtitle-2 font-weight-blod'>回合結束日期</div>
                <VueCtkDateTimePicker :noKeyboard='true' :inline='true' v-model="stageendDate" label='請選擇結束日期' locale='zh-tw' format='YYYY-MM-DD HH:mm:ss' class='ma-2' />
                <v-btn @click='saveStage'>
                  儲存回合
                </v-btn>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-dialog v-model='modGroupW' fullscreen hide-overlay transition='dialog-bottom-transition'>
      <v-card>
        <v-toolbar dark color='primary'>
          <v-btn icon dark @click='closeGroupW()'>
            <v-icon>fa-times</v-icon>
          </v-btn>
          <v-toolbar-title>修改分組</v-toolbar-title>
        </v-toolbar>
        <v-card-text class='ma-0 pa-0'>
          <v-container class='pa-5'>
            <v-row>
              <v-col class='d-flex flex-column'>
                <v-alert type="info" outlined icon='fa-info' class='text-left'>調整組員將導致該組員失去自己已經投放的押金（因為你可能得先移除他，再加入），但該押金仍會在小組的帳本裡，因此不會改變回合的出資與回饋比例，請謹慎調整組員</v-alert>
                <v-alert v-show='isSupervisor(defaultSchema)' type="error" outlined icon='fa-exclamation-triangle' class='text-left' v-if='!defaultSchema.tagGroupped'>本活動按照標籤分組，如果你隨意更改各組所屬的標籤，可能導致成員看不到分組</v-alert>
                <div v-if='isSupervisor(defaultSchema)' class='text-subtitle-2 font-weight-blod'>分組標籤</div>
                <tag-filter
                  v-if='isSupervisor(defaultSchema)'
                  :mustSelected='true'
                  :single='true'
                  @updateTags='updateTags'
                  :selectedItem='defaultGroup.tag'
                  @valueUpdated='updatedefaultGTag'
                  :candidatedItem='savedTags'
                  :createable='false'
                  label='分組標籤指的是該組隸屬的標籤'
                />
                <div v-if='isSupervisor(defaultSchema)' class='text-subtitle-2 font-weight-blod'>禁止調整組員</div>
                <v-switch
                  v-if='isSupervisor(defaultSchema)'
                  v-model="defaultGroup.locked"
                  label="鎖住分組，禁止組員更動"
                ></v-switch>
                <div v-if='isSupervisor(defaultSchema)' class='text-subtitle-2 font-weight-blod'>組長</div>
                <tag-filter
                  v-if='isSupervisor(defaultSchema)'
                  :mustSelected='false'
                  :single='false'
                  @updateTags='updateTags'
                  :selectedItem='leaderTag'
                  @valueUpdated='updateleaderTag'
                  :candidatedItem='savedTags'
                  :createable='false'
                  label='請在此輸入你要篩選的用戶標籤，該標籤的用戶會顯示在下面'
                />
                <tag-filter
                  v-if='isSupervisor(defaultSchema)'
                  :mustSelected='false'
                  :single='false'
                  :selectedItem='defaultGroup.leaders'
                  @valueUpdated='updateleaders'
                  :candidatedItem='savedLeaders'
                  @updateTags='fetchLeaders'
                  :createable='false'
                  label='請輸入用戶名稱'
                />
                <div class='text-subtitle-2 font-weight-blod'>組員（組長會自動成為組員）</div>
                <tag-filter
                  v-if='isSupervisor(defaultSchema)'
                  :mustSelected='false'
                  :single='false'
                  @updateTags='updateTags'
                  :selectedItem='memberTag'
                  @valueUpdated='updatememberTag'
                  :candidatedItem='savedTags'
                  :createable='false'
                  label='請在此輸入你要篩選的用戶標籤，該標籤的用戶會顯示在下面'
                />
                <tag-filter
                  :mustSelected='false'
                  :single='false'
                  :selectedItem='defaultGroup.members'
                  @valueUpdated='updatemembers'
                  :candidatedItem='savedMembers'
                  @updateTags='fetchMembers'
                  :createable='false'
                  label='請輸入用戶名稱'
                />
                <div class='text-subtitle-2 font-weight-blod'>成員資產表</div>
                <v-simple-table v-show="assetMembers.length > 0" class='black--text'>
                  <template v-slot:default>
                    <thead>
                      <tr>
                        <th class="text-center">
                          名稱
                        </th>
                        <th class="text-left" style="width:25px">
                          總資產
                        </th>
                        <th class='text-center'>
                          &nbsp;
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="member in assetMembers"
                        :key="member._id+'asset'"
                      >
                        <td class="text-center">
                          {{ member.uid.name }}
                        </td>
                        <td class="text-left">
                          {{ member.balance }}
                        </td>
                        <td class='text-center'>
                          <v-btn @click="assetViewer(member.uid, undefined)">
                            檢視帳本
                          </v-btn>
                        </td>
                      </tr>
                    </tbody>
                  </template>
                </v-simple-table>
                <v-btn @click='queryAssets'>
                  查詢全組資產表
                </v-btn>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-fab-transition>
      <v-tooltip bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            fab
            dark
            bottom
            right
            fixed
            color="indigo darken-4"
            @click.stop='statusFilter = !statusFilter'
            v-bind="attrs" v-on="on"
          >
            <v-icon v-if='!statusFilter'>fa-play</v-icon>
            <v-icon v-else>fa-square</v-icon>
          </v-btn>
        </template>
        <span v-if='!statusFilter'>顯示活動中的項目</span>
        <span v-else>顯示已結束的項目</span>
      </v-tooltip>
    </v-fab-transition>
    <div class='d-flex flex-row'>
      <v-text-field outlined clearable dense class='flex-grow-1' label='搜尋關鍵字' prepend-icon='fa-search' v-model='queryTerm' hint='系統會針對活動名稱進行關鍵字搜尋（可使用正規表達式）'></v-text-field>
      <v-btn color='indigo darken-4' class='white--text ma-1' @click="termQuery">搜尋</v-btn>
      <v-btn color="brown darken-4" class='white--text ma-1' @click="schemafilteredList = schemaList">清除</v-btn>
    </div>
    <div class='blue-grey--text darken-1 text-caption'>已篩選出{{ schemafilteredList.length }}個活動，為節省資源，不會全部展現出來，往下滑會載入更多</div>
    <v-lazy
      :options="{
        threshold: 0.5
      }"
      min-height="70"
      transition="fade-transition"
      v-for='item in schemafilteredList' :key='item._id'
    >
      <div class='d-flex flex-column' :key="item._id + 'handler'">
        <div class='d-flex flex-row '>
          <div class='flex-grow-1 text-left text-h6'>
            <span v-if='item.status === 1'>[進行中]</span>
            <span v-else>[已結束]</span>
            {{ item.name }}
          </div>
        </div>
        <div class='d-flex flex-column'>
          <div class='text-center text-caption grey--text darken-1 flex-grow-1' v-if='item.stages.length === 0'>
            本活動沒有任何回合<span v-if='isSupervisor(item)'>，點右上方樹枝圖案去增加回合吧</span>
          </div>
          <div class='ma-1'>
            <v-stepper v-model="item.stepPointer" width="100%">
              <v-stepper-header>
                <template>
                  <div v-for='(stage, index) in item.stages' :key='stage._id'>
                    <v-stepper-step
                      :complete="item.stepPointer >= index"
                      :step='index + 1'
                      complete-icon='fa-flag'
                      edit-icon='fa-pencil-alt'
                    >
                      <span :class='(index + 1) === item.stepPointer ? "text--indigo darken-4" : ""'>
                        <v-icon v-if='stage.matchPoint'>fa-bomb</v-icon>
                        <v-icon v-if='stage.closed > 0'>fa-times-circle</v-icon>
                        {{ stage.name }}
                      </span>
                    </v-stepper-step>
                    <v-divider
                      :key='"divider" + stage._id'
                      v-if='(index + 1) !== item.stages.length'
                    ></v-divider>
                  </div>
                </template>
              </v-stepper-header>
            </v-stepper>
          </div>
          <div class='d-flex flex-row flex-wrap justify-space-between'>
            <div class='d-flex flex-row flex-justify-start align-center'><v-icon>fa-flag</v-icon><div>：目前開放的階段</div></div>
            <div class='d-flex flex-row flex-wrap justify-end align-center'>
              <v-btn v-if='isLeader(item)' @click="manageMembers(item)" class='ma-1'>
                新增／刪除組員
              </v-btn>
              <v-btn v-if='isSupervisor(item)' @click="groupEditor(item)" class='ma-1'>
                組別管理
              </v-btn>
              <v-btn v-if='isSupervisor(item)' @click="stageEditor(item)" class='ma-1'>
                回合管理
              </v-btn>
              <v-btn v-if='isSupervisor(item)' @click="eventViewer(item)" class='ma-1'>
                檢視事件
              </v-btn>
              <v-btn v-if='isSupervisor(item)' @click="queryUsers(item)" class='ma-1'>
                檢視帳本
              </v-btn>
              <v-btn v-else @click="assetViewer(currentUser, item)" class='ma-1'>
                檢視帳本
              </v-btn>
              <v-btn color="red darken-4" link :href='"#/reportViewer/" + item._id' class='ma-1 white--text'>
                進入活動
              </v-btn>
            </div>
          </div>
        </div>
      </div>
    </v-lazy>
  </v-sheet>
</template>

<script>
// @ is an alias to /src
import Vue from 'vue';
import dayjs from 'dayjs';
import _toString from 'lodash/toString';
import _map from 'lodash/map';
import _inRange from 'lodash/inRange';
import _intersectionWith from 'lodash/intersectionWith';
import _unionWith from 'lodash/unionWith';
import _orderBy from 'lodash/orderBy';
import _find from 'lodash/find';
import _filter from 'lodash/filter';
import _isEqual from 'lodash/isEqual';
import VueApexCharts from 'vue-apexcharts';
import Papa from 'papaparse';
import 'vue-ctk-date-time-picker/dist/vue-ctk-date-time-picker.css';

Vue.use(VueApexCharts);
Vue.component('apexchart', VueApexCharts);

export default {
  name: 'userDashboard',
  beforeDestroy () {
    this.$socket.client.off('statusSchema', this.socketstatusSchema);
    this.$socket.client.off('getJoined', this.socketgetJoined);
    this.$socket.client.off('addStage', this.socketaddStage);
    this.$socket.client.off('getStage', this.socketgetStage);
    this.$socket.client.off('getStages', this.socketgetStages);
    this.$socket.client.off('modStage', this.socketmodStage);
    this.$socket.client.off('removeStage', this.socketremoveStage);
    this.$socket.client.off('closeStage', this.socketcloseStage);
    this.$socket.client.off('noreplyStage', this.socketnoreplyStage);
    this.$socket.client.off('getTagUsers', this.socketgetTagUsers);
    this.$socket.client.off('getGroups', this.socketgetGroups);
    this.$socket.client.off('addGroup', this.socketaddGroup);
    this.$socket.client.off('removeGroup', this.socketremoveGroup);
    this.$socket.client.off('getLeaders', this.socketgetLeaders);
    this.$socket.client.off('setLeader', this.socketsetLeader);
    this.$socket.client.off('getEventLog', this.socketgetEventLog);
    this.$socket.client.off('getPersonalAccounting', this.socketgetPersonalAccounting);
    this.$socket.client.off('getSchemaBalance', this.socketgetSchemaBalance);
    this.$socket.client.off('orderStages', this.socketorderStages);
    this.$socket.client.off('getSelectedUsers', this.socketgetSupervisors);
    this.$socket.client.off('getSchemaUsers', this.socketgetSchemaUsers);
    this.$socket.client.off('getLoner', this.socketgetLoner);
    this.$socket.client.off('rejectAccounting', this.socketrejectAccounting);
    this.$socket.client.off('setLocker', this.socketlockGroup);
    this.$socket.client.off('setBonus', this.socketsetBonus);
    this.$socket.client.off('queryBonus', this.socketqueryBonus);
    this.$socket.client.off('rejectBonusAccounting', this.socketrejectBonusAccounting);
  },
  components: { 
    TagFilter: () => import(/* webpackChunkName: 'TagFilter', webpackPrefetch: true */ './modules/TagFilter'),
    draggable: () => import(/* webpackChunkName: 'daraggable', webpackPrefetch: true */ 'vuedraggable'),
    TipTap: () => import(/* webpackChunkName: 'TipTap', webpackPrefetch: true */ './modules/TipTap'),
    VueCtkDateTimePicker: () => import(/* webpackChunkName: 'ctkPicker', webpackPrefetch: true */ 'vue-ctk-date-time-picker')
  },
  watch: {
    statusFilter: function () {
      this.termQuery();
    },
    stagestartDate: function () {
      this.defaultStage.startTick = dayjs(this.stagestartDate).unix();
    },
    stageendDate: function () {
      this.defaultStage.endTick = dayjs(this.stageendDate).unix();
    },
    'defaultStage.startTick': function () {
      this.stagestartDate = dayjs.unix(this.defaultStage.startTick).format("YYYY-MM-DDTHH:mm");
    },
    'defaultStage.endTick': function () {
      this.stageendDate = dayjs.unix(this.defaultStage.endTick).format("YYYY-MM-DDTHH:mm");
    },
    'defaultGroup.locked': function() {
      this.$socket.client.emit('setLocker',{
        gid: this.defaultGroup._id,
        sid: this.defaultSchema._id,
        locked: this.defaultGroup.locked
      });
    }
  },
  created () {
    this.$emit('viewIn', {
      text: 'Dashboard',
      icon: 'fa-tachometer-alt',
      module: '活動模組',
      location: '/userDashBoard'
    });
    this.$socket.client.emit('getJoined');
    this.$socket.client.on('statusSchema', this.socketstatusSchema);
    this.$socket.client.on('getJoined', this.socketgetJoined);
    this.$socket.client.on('getStage', this.socketgetStage);
    this.$socket.client.on('getStages', this.socketgetStages);
    this.$socket.client.on('addStage', this.socketaddStage);
    this.$socket.client.on('modStage', this.socketmodStage);
    this.$socket.client.on('closeStage', this.socketcloseStage);
    this.$socket.client.on('noreplyStage', this.socketnoreplyStage);
    this.$socket.client.on('removeStage', this.socketremoveStage);
    this.$socket.client.on('getTagUsers', this.socketgetTagUsers);
    this.$socket.client.on('getGroups', this.socketgetGroups);
    this.$socket.client.on('addGroup', this.socketaddGroup);
    this.$socket.client.on('removeGroup', this.socketremoveGroup);
    this.$socket.client.on('getLeaders', this.socketgetLeaders);
    this.$socket.client.on('setLeader', this.socketsetLeader);
    this.$socket.client.on('getEventLog', this.socketgetEventLog);
    this.$socket.client.on('getPersonalAccounting', this.socketgetPersonalAccounting);
    this.$socket.client.on('getSchemaBalance', this.socketgetSchemaBalance);
    this.$socket.client.on('orderStages', this.socketorderStages);
    this.$socket.client.on('getSelectedUsers', this.socketgetSupervisors);
    this.$socket.client.on('getSchemaUsers', this.socketgetSchemaUsers);
    this.$socket.client.on('getLoner', this.socketgetLoner);
    this.$socket.client.on('rejectAccounting', this.socketrejectAccounting);
    this.$socket.client.on('setLocker', this.socketlockGroup);
    this.$socket.client.on('setBonus', this.socketsetBonus);
    this.$socket.client.on('queryBonus', this.socketqueryBonus);
    this.$socket.client.on('rejectBonusAccounting', this.socketrejectBonusAccounting);
  },
  computed: {
    savedTags: function () {
      return this.$store.state.savedTags;
    },
    currentUser: function () {
      return this.$store.state.currentUser;
    }
  },
  methods: {
    lockGroup: function(item) {
      this.$socket.client.emit('setLocker',{
        gid: item._id,
        sid: this.defaultSchema._id,
        locked: !item.locked
      });
    },
    socketrejectAccounting: function() {
      this.filterAsset();
    },
    rejectAccounting: function(event) {
      this.$socket.client.emit('rejectAccounting', event);
    },
    socketgetLoner: function(loners) {
      this.loners = loners;
    },
    updatelonerTag: function(value) {
      this.lonerTags = value;
    },
    tagName: function(tags) {
      let oriobj = this;
      return _toString(_map(tags, (tag) => {
        let nameTag = _filter(oriobj.savedTags, (stag) => {
          return stag._id === tag;
        });
        if(nameTag.length > 0) {
          return nameTag[0].name;
        } else {
          return "";
        }
      }));
    },
    balanceCSV: function() {
      this.$socket.client.emit('getSchemaBalance', {
        sid: this.defaultSchema._id,
        uids: undefined,
        usage: 2
      });
    },
    socketgetSchemaUsers: function(data) {
      this.schemaUsers = data;
      this.userSelectorW = true;
    },
    closeuserquery: function() {
      this.schemaUsers = [];
      this.listedsUser = undefined;
      this.userSelectorW = false;
    },
    queryUsers: function(schema) {
      this.defaultSchema = schema;
      this.$socket.client.emit('getSchemaUsers', schema._id);
    },
    arrayConverter: function(array) {
      return _toString(array);
    },
    closeGroupW: function() {
      this.$socket.client.emit('getGroups', {
        sid: this.defaultSchema._id
      });
      this.modGroupW = false;
    },
    manageMembers: function(item) {
      let defaultGroup = _filter(this.leaders, (leader) => {
        return leader.sid === item._id;
      });
      if(defaultGroup.length > 0) {
        let group = defaultGroup[0].group;
        if(!group.locked) {
          this.defaultSchema = item;
          this.memberTag = [group.tag];
          this.$socket.client.emit('getTagUsers', this.memberTag);
          this.editGroup(group);
        } else {
          this.$emit('toastPop', '管理員已經鎖定這個編組了，無法變更組員！');
        }
      }
    },
    closeAssetW: function() {
      this.assetViewerW = false;
      this.balanceHeight = 10;
    },
    socketgetSupervisors: function(data) {
      if(data.type === 0) {
        this.savedLeaders = data.users;
        this.savedMembers = data.users;
      } else {
        if(data.users.length > 0) {
          this.loadingUser = false;
          this.selectedUser = data.users[0];
        }
      }
    },
    socketgetStages: function(data) {
      this.stageList = _orderBy(data, ['order'], ['asc']);
    },
    socketorderStages: function() {
      this.$socket.client.emit('getJoined');
    },
    socketgetSchemaBalance: function(data) {
      let oriobj = this;
      if(data.usage === 1) {
        this.balanceList = _orderBy(data.data, ['balance'], ['desc']);
        if(this.balanceList.length > 0) {
          this.maxBalance = this.balanceList[0];
          this.minBalance = this.balanceList[this.balanceList.length - 1];
          let self = _find(this.balanceList, (record) => {
            return record.uid._id === oriobj.defaultUser._id;
          });
          if(self !== undefined) {
            this.ownBalance = self;
          }
        }
        this.assetViewerW = true;
        this.renderChart();
      } else if(data.usage === 0) {
        this.assetMembers = data.data;
      } else if(data.usage === 2) {
        let exportArray = [];
        for(let i=0; i<data.data.length; i++) {
          let user = data.data[i];
          exportArray.push({
            "單位": user.uid.unit,
            "姓名": user.uid.name,
            "財產": user.balance
          });
        }
        let output = "\ufeff"+ Papa.unparse(exportArray);
        let element = document.createElement('a');
        let blob = new Blob([output], { type: 'text/csv' });
        let url = window.URL.createObjectURL(blob);
        element.setAttribute('href', url);
        element.setAttribute('download', "財產清單.csv");
        element.click();
      }
    },
    filterAsset: function() {
      this.assetLog = [];
      this.balanceList = [];
      this.$socket.client.emit('getPersonalAccounting', {
        sid: this.defaultSchema._id,
        uid: this.defaultUser._id,
        assetDates: this.assetDates,
        assetNum: this.assetNum,
        assetKeyword: this.assetKeyword
      });
    },
    socketgetPersonalAccounting: function(data) {
      this.assetLog = data;
      this.$socket.client.emit('getSchemaBalance', {
        sid: this.defaultSchema._id,
        uids: undefined,
        usage: 1
      });
    },
    assetViewer: function(uid, schema) {
      this.userSelectorW = false;
      this.selectedUser = undefined;
      this.listedsUser = undefined;
      this.schemaUsers = [];
      let now = dayjs().format("YYYY-MM-DD");
      if(schema !== undefined) { this.defaultSchema = schema; }
      this.assetKeyword = "";
      this.assetNum = 10;
      this.assetDates = [now, now];
      this.defaultUser = uid;
      this.$socket.client.emit('getPersonalAccounting', {
        sid: this.defaultSchema._id,
        uid: this.defaultUser._id,
        assetDates: this.assetDates,
        assetNum: this.assetNum,
        assetKeyword: this.assetKeyword
      });
      this.assetLog = [];
      this.balanceList = [];
    },
    filterLog: function() {
      this.$socket.client.emit('getEventLog', {
        sid: this.defaultSchema._id,
        keyword: this.eventKeyword,
        ignore: this.eventIgnore,
        logNum: this.eventNum,
        logRange: this.eventsRange
      });
      this.schemaLog = [];
    },
    eventViewer: function(schema) {
      let now = dayjs().format("YYYY-MM-DD");
      this.defaultSchema = schema;
      this.eventNum = 10;
      this.eventKeyword = '';
      this.eventsRange = [now, now];
      this.$socket.client.emit('getEventLog', {
        sid: this.defaultSchema._id,
        keyword: this.eventKeyword,
        logNum: this.eventNum,
        logRange: this.eventsRange
      });
      this.schemaLog = [];
    },
    socketgetEventLog: function(data) {
      this.schemaLog = data;
      this.eventlogW = true;
    },
    editGroup: function(item) {
      this.defaultGroup = item;
      if(item.members.length > 0 || item.leaders.length > 0) {
        this.$socket.client.emit('getSelectedUsers', {
          users: _unionWith(item.members, item.leaders, (a, b) => {
            return a === b;
          }),
          type: 0
        });
      }
      this.assetMembers = [];
      this.modGroupW = true;
    },
    socketsetLeader: function() {
      this.$socket.client.emit('getGroups', {
        sid: this.defaultSchema._id
      });
    },
    socketgetLeaders: function(data) {
      for(let i=0; i<data.length; i++) {
        let gData = data[i];
        let existGroup = _find(this.groupList, (group) => {
          return group._id === gData.gid;
        })
        if(existGroup !== undefined) {
          existGroup.groupLeaderNames = _map(gData.leaders, (leader) => {
            return leader.name;
          }, 10);
        }
      }
    },
    removeGroup: function(group) {
      this.$socket.client.emit('removeGroup', {
        sid: this.defaultSchema._id,
        gid: group._id
      });
    },
    socketlockGroup: function() {
      this.$socket.client.emit('getGroups', {
        sid: this.defaultSchema._id
      });
      this.$emit('toastPop', '鎖定完成');
    },
    socketaddGroup: function() {
      this.$socket.client.emit('getGroups', {
        sid: this.defaultSchema._id
      });
      this.$emit('toastPop', '新增完成');
      this.addGroupW = false;
    },
    socketgetGroups: function(data) {
      for(let i=0; i<data.length; i++) {
        data[i].groupLeaderNames = "載入中...";
      }
      this.groupList = data;
      this.bonusValue = this.defaultSchema.initCapital;
      this.$socket.client.emit('getLeaders', _map(this.groupList, (group) => { return group._id; }));
      this.$emit('toastPop', '分組列表已更新');
      if(this.isSupervisor(this.defaultSchema)) {
        this.groupeditorW = true;
      }
    },
    groupEditor: function(schema) {
      this.defaultSchema = schema;
      this.$socket.client.emit('getGroups', {
        sid: this.defaultSchema._id
      });
    },
    plusGroup: function() {
      this.$socket.client.emit('addGroup', {
        sid: this.defaultSchema._id,
        tag: this.groupTag,
        groupCount: this.groupCount
      }); //取得整個分組列表
    },
    saveStage: function() {
      this.$socket.client.emit('modStage', this.defaultStage);
    },
    socketgetStage: function(data) {
      this.defaultStage = data;
      this.modStageW = true;
    },
    getStage: function(item) {
      this.defaultStage = item;
      this.modStageW = true;
    },
    plusStage: function() {
      this.$socket.client.emit('addStage', {
        sid: this.defaultSchema._id,
        order: this.stageList.length
      });
    },
    closeStage: function(stage) {
      this.$socket.client.emit('closeStage', stage);
    },
    noreplyStage: function(stage) {
      this.$socket.client.emit('noreplyStage', stage);
    },
    removeStage: function(stage) {
      this.$socket.client.emit('removeStage', stage);
    },
    stageEditor: function(schema) {
      this.defaultSchema = schema;
      this.stageList = schema.stages;
      this.stageeditorW = true;
    },
    dateConvert: function (time) {
      return time === 0 ? '尚未設定' : dayjs.unix(time).format('YYYY/MM/DD HH:mm:ss');
    },
    selectAllTags: function () {
      if(this.selectedSchemas.length > 0) {
        this.selectedSchemas = [];
      } else {
        this.selectedSchemas = _map(this.schemafilteredList, '_id');
      }
    },
    selectAllAccounting: function () {
      this.selectedAccounting = _map(this.queryAccounting, '_id');
    },
    selectAllGroup: function () {
      this.selectedGroup = _map(this.groupList, '_id');
    },
    deselectAccounting: function () {
      this.selectedAccounting = [];
    },
    deselectGroup: function () {
      this.selectedGroup = [];
    },
    socketaddStage: function (data) {
      this.$socket.client.emit('getStage', {
        _id: data
      });
      this.$emit('toastPop', '新增完成');
    },
    socketmodStage: function () {
      this.$socket.client.emit('getStages', this.defaultSchema._id);
      this.$emit('toastPop', '修改完成');
      this.modStageW = false;
    },
    socketremoveGroup: function () {
      this.$socket.client.emit('getGroups', {
        sid: this.defaultSchema._id
      });
    },
    socketcloseStage: function () {
      this.$socket.client.emit('getStages', this.defaultSchema._id);
      this.$emit('toastPop', '關閉完成');
    },
    socketnoreplyStage: function () {
      this.$socket.client.emit('getStages', this.defaultSchema._id);
      this.$emit('toastPop', '禁止回合回復操作完成');
    },
    socketremoveStage: function () {
      this.$socket.client.emit('getStages', this.defaultSchema._id);
      this.$emit('toastPop', '刪除完成');
    },
    socketstatusSchema: function () {
      this.$socket.client.emit('getJoined');
      this.$emit('toastPop', '修改完成');
    },
    socketgetJoined: function (data) {
      let now = dayjs().unix();
      this.schemaList = data.schemas;
      this.supervisors= data.supervisorList;
      this.leaders = data.leaderList;
      for(let i=0; i<this.schemaList.length; i++) {
        let schema = this.schemaList[i];
        schema.stages = _orderBy(schema.stages, ['order'], ['asc']);
        for(let k=0; k<schema.stages.length; k++) {
          if(_inRange(now, schema.stages[k].startTick, schema.stages[k].endTick)) {
            schema.stepPointer = k;
          }
        }
      }
      this.selectedSchemas = [];
      this.termQuery();
    },
    statusSchema: function (item) {
      this.$socket.client.emit('statusSchema', {
        sid: item._id,
        status: !item.status
      });
    },
    termQuery: function () {
      let oriobj = this;
      this.schemafilteredList = this.schemaList.filter((item) => {
        if(oriobj.statusFilter) {
          return item.status === 1;
        } else {
          return item.status === 0;
        }
      });
      this.schemafilteredList = this.schemafilteredList.filter((item) => {
        let regex = new RegExp(this.queryTerm, 'g');
        return regex.test(item.name);
      });
    },
    removeSchema: function(item) {
      this.$socket.client.emit('removeSchema', item);
    },
    updateleaderTag: function(value) {
      this.leaderTag = value;
      this.$socket.client.emit('getTagUsers', this.leaderTag);
    },
    updatedefaultGTag: function(value) {
      this.defaultGroup.tag = value;
      this.$socket.client.emit('setGroupTag',{
        gid: this.defaultGroup._id,
        sid: this.defaultSchema._id,
        tag: this.defaultGroup.tag
      });
    },
    updatememberTag: function(value) {
      this.memberTag = value;
      this.$socket.client.emit('getTagUsers', this.memberTag);
    },
    updatelistedsUser: function (val) {
      this.listedsUser = val;
      this.loadingUser = true;
      this.$socket.client.emit('getSelectedUsers',{
        users: [this.listedsUser],
        type: 1
      });
    },
    updategroupTag: function (val) {
      this.groupTag = val;
    },
    updateleaders: function(value) {
      this.defaultGroup.leaders = value;
      this.$socket.client.emit('setLeader',{
        gid: this.defaultGroup._id,
        sid: this.defaultSchema._id,
        leaders: this.defaultGroup.leaders
      });
    },
    updatemembers: function(value) {
      this.defaultGroup.members = value;
      this.$socket.client.emit('setMember',{
        gid: this.defaultGroup._id,
        sid: this.defaultSchema._id,
        members: this.defaultGroup.members
      });
    },
    plusTag: function (val) {
      this.$emit('addTag', val);
    },
    fetchLeaders: function() {
      if(this.leaderTag.length > 0) {
        this.$socket.client.emit('getTagUsers', this.leaderTag);
      }
    },
    fetchMembers: function() {
      if(this.memberTag.length > 0) {
        this.$socket.client.emit('getTagUsers', this.memberTag);
      }
    },
    updateTags: function() {
      this.$emit('updateTags');
    },
    socketgetTagUsers: function(data) {
      let leaderCheck = _isEqual(data.query, [...this.leaderTag]);
      let memberCheck = _isEqual(data.query, [...this.memberTag]);
      if(leaderCheck) {
        let selectedLeader = _intersectionWith(this.savedLeaders, this.defaultGroup.leaders, (user, leader) => {
          return user._id === leader;
        });
        this.savedLeaders = _unionWith(data.result, selectedLeader, (a,b) => {
          return a._id === b._id;
        });
      }
      if(memberCheck) {
        let selectedMemeber = _intersectionWith(this.savedMembers, this.defaultGroup.members, (user, member) => {
          return user._id === member;
        });
        this.savedMembers = _unionWith(data.result, selectedMemeber, (a,b) => {
          return a._id === b._id;
        });
      }
    },
    closeStageW: function() {
      for(let i=0; i<this.stageList.length; i++) {
        this.stageList[i].order = i;
      }
      this.$socket.client.emit('orderStages', {
        sid: this.defaultSchema._id,
        stageList: this.stageList
      });
      this.stageeditorW = false;
    },
    isSupervisor: function(schema) {
      return (_filter(this.supervisors, (supervisor) => {
        return supervisor === schema._id;
      })).length > 0;
    },
    isLeader: function(schema) {
      return (_filter(this.leaders, (leader) => {
        return leader.sid === schema._id;
      })).length > 0;
    },
    queryAssets: function() {
      this.$socket.client.emit('getSchemaBalance', {
        sid: this.defaultSchema._id,
        uids: _unionWith(this.defaultGroup.leaders, this.defaultGroup.members, (a, b) => {
          return a === b;
        }),
        usage: 0
      });
    },
    renderChart: function() {
      let oriobj = this;
      let chartOptions = {...this.chartOptions};
      chartOptions.xaxis.categories = [this.maxBalance.uid.name, this.ownBalance.uid.name, this.minBalance.uid.name];
      this.chartOptions = chartOptions;
      this.chartSeries = [{ data: [this.maxBalance.balance, this.ownBalance.balance, this.minBalance.balance] }];
      Vue.nextTick(() => {
        oriobj.balanceHeight = 200;
      })
    },
    checkLoner: function() {
      this.loners = [];
      this.lonerW = true;
    },
    queryLoner: function() {
      this.$socket.client.emit('getLoner', {
        sid: this.defaultSchema._id,
        keywords: this.lonerKeyword,
        tags: this.lonerTags
      });
    },
    addBonus: function() {
      this.$socket.client.emit('setBonus', {
        sid: this.defaultSchema._id,
        gid: this.selectedGroup,
        desc: this.bonusName,
        value: this.bonusValue
      });
    },
    socketsetBonus: function(data) {
      if(data) {
        this.bonusAdded = true;
        this.bonusValue = this.defaultSchema.initCapital;
      }
    },
    queryBonus: function() {
      this.$socket.client.emit('queryBonus', {
        sid: this.defaultSchema._id,
        gid: this.selectedGroup,
        desc: this.bonusName
      });
    },
    socketqueryBonus: function(data) {
      this.queryAccounting = data
    },
    removeAccounting: function() {
      this.$socket.client.emit('rejectBonusAccounting', {
        sid: this.defaultSchema._id,
        aids: this.selectedAccounting,
        desc: this.bonusName
      });
    },
    socketrejectBonusAccounting: function(data) {
      if(data) {
        this.queryBonus();
        this.accountingRemoved = true;
      }
    },
    closeaddBonusW: function() {
      this.addBonusW = false;
      this.bonusValue = this.defaultSchema.initCapital;
      this.bonusName = "";
    },
    closeremoveBonusW: function() {
      this.removeBonusW = false;
      this.queryAccounting = [];
      this.bonusName = "";
    }
  },
  data () {
    return {
      queryAccounting: [],
      selectedAccounting: [],
      bonusAdded: false,
      bonusValue: 0,
      bonusName: "",
      addBonusW: false,
      removeBonusW: false,
      selectedGroup: [],
      lonerKeyword: "",
      lonerTags: [],
      lonerW: false,
      loners: [],
      loadingUser: false,
      selectedUser: undefined,
      listedsUser: undefined,
      userSelectorW: false,
      schemaUsers: [],
      addGroupW: false,
      balanceHeight: 50,
      maxBalance: {
        uid: {
          name: ""
        },
        balance: 0
      },
      minBalance: {
        uid: {
          name: ""
        },
        balance: 0
      },
      ownBalance: {
        uid: {
          name: ""
        },
        balance: 0
      },
      eventKeyword: "",
      balanceList: [],
      assetDates: [],
      assetLog: [],
      assetNum: 10,
      assetKeyword: "",
      assetViewerW: false,
      schemaLog: [],
      eventNum: 10,
      eventsRange: [],
      eventlogW: false,
      modGroupW: false,
      assetMembers: [],
      leaderTag: [],
      memberTag: [],
      groupCount: 1,
      groupTag: "",
      stageendDate: 0,
      stagestartDate: 0,
      supervisors: [],
      leaders: [],
      groupeditorW: false,
      stageeditorW: false,
      savedLeaders: [],
      savedMembers: [],
      statusFilter: true,
      queryTerm: '',
      schemaList: [],
      schemafilteredList: [],
      modStageW: false,
      groupList: [],
      stageList: [],
      defaultUser: {
        _id: "",
        name: ""
      },
      defaultSchema: {
        _id: "",
        tagGroupped: false,
        initCapital: 0
      },
      defaultStage: {
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
      }
    }
  }
};
</script>
