<template>
  <v-sheet class='pa-0'>
    <v-dialog
      v-model='pointerW'
      fullscreen
      hide-overlay
      scrollable
      transition="dialog-bottom-transition"
    >
      <v-card tile>
        <v-toolbar dark color='primary'>
          <v-btn
            icon
            dark
            @click="pointerW = false"
          >
            <v-icon>fa-times</v-icon>
          </v-btn>
          <v-toolbar-title>快速指派用戶標籤</v-toolbar-title>
        </v-toolbar>
        <v-card-actions>
          <v-btn class='ma-1' @click='tagUserW = true'>快速建立新的用戶群組標籤</v-btn>
          <v-btn class='ma-1' @click='execPointer'>執行指派</v-btn>
        </v-card-actions>
        <v-card-text class='pa-5 text-left black--text text-body-1'>
          <v-alert v-if='pointerMin === 0' outlined type='error' icon='fa-skull' class='text-left'>你選擇了{{ selectedKBs.length }}個知識點，其中有知識點根本沒有階段，無法派送！</v-alert>
          <div v-if='pointerMin > 0' class='d-flex flex-column'>
            <v-alert outlined type='info' icon='fa-info' class='text-left'>你選擇了{{ selectedKBs.length }}個知識點（清單在底部），他們最少具有{{ pointerMax }}個階段，變更完要請用戶重新整理才會看到</v-alert>
            <div class='text-subtitle-2 font-weight-blod'>要權限標籤打入這些知識點的哪個階段裡？</div>
            <v-slider
              :label='"統一打入第"+pointerStage+"個階段"'
              :min='pointerMin'
              :max='pointerMax'
              v-model="pointerStage"
              thumb-label
            ></v-slider>
            <div class='text-subtitle-2 font-weight-blod'>新增到該階段的PM群組標籤</div>
            <tag-filter
              :mustSelected='false'
              @updateTags='updateTags'
              :single='false'
              :selectedItem='pointerpmTags'
              @valueUpdated='pointerPMTagUpdated'
              :candidatedItem='savedTags'
              :createable='false'
              label='請輸入新增到該階段的PM標籤'
            />
            <div class='d-flex flex-row flex-wrap ma-1'>
              <v-chip
                v-for='rt in recentTags'
                :key="'recentpm'+rt._id" @click='addpointerPMTag(rt._id)'
                class='ma-1'
              >
                {{ tagQuery(rt._id) }}
              </v-chip>
            </div>
            <div class='text-subtitle-2 font-weight-blod'>新增到該階段的審查者群組標籤</div>
            <tag-filter
              :mustSelected='false'
              @updateTags='updateTags'
              :single='false'
              :selectedItem='pointerreviewerTags'
              @valueUpdated='pointerreviewerTagUpdated'
              :candidatedItem='savedTags'
              :createable='false'
              label='請輸入新增到該階段的審查者標籤'
            />
            <div class='d-flex flex-row flex-wrap ma-1'>
              <v-chip
                v-for='rt in recentTags'
                :key="'recentreviewer'+rt._id" @click='addpointerReviewerTag(rt._id)'
                class='ma-1'
              >
                {{ tagQuery(rt._id) }}
              </v-chip>
            </div>
            <div class='text-subtitle-2 font-weight-blod'>新增到該階段的廠商群組標籤</div>
            <tag-filter
              :mustSelected='false'
              @updateTags='updateTags'
              :single='false'
              :selectedItem='pointervendorTags'
              @valueUpdated='pointervendorTagUpdated'
              :candidatedItem='savedTags'
              :createable='false'
              label='請輸入新增到該階段的廠商標籤'
            />
            <div class='d-flex flex-row flex-wrap ma-1'>
              <v-chip
                v-for='rt in recentTags'
                :key="'recentvendor'+rt._id" @click='addpointerVendorTag(rt._id)'
                class='ma-1'
              >
                {{ tagQuery(rt._id) }}
              </v-chip>
            </div>
            <div class='text-subtitle-2 font-weight-blod'>新增到該階段的寫手群組標籤</div>
            <tag-filter
              :mustSelected='false'
              @updateTags='updateTags'
              :single='false'
              :selectedItem='pointerwriterTags'
              @valueUpdated='pointerwriterTagUpdated'
              :candidatedItem='savedTags'
              :createable='false'
              label='請輸入新增到該階段的寫手標籤'
            />
            <div class='d-flex flex-row flex-wrap ma-1'>
              <v-chip
                v-for='rt in recentTags'
                :key="'recentwriter'+rt._id" @click='addpointerWriterTag(rt._id)'
                class='ma-1'
              >
                {{ tagQuery(rt._id) }}
              </v-chip>
            </div>
            <div class='text-subtitle-2 font-weight-blod'>新增到該階段的行政組群組標籤</div>
            <tag-filter
              :mustSelected='false'
              @updateTags='updateTags'
              :single='false'
              :selectedItem='pointerfinalTags'
              @valueUpdated='pointerfinalTagUpdated'
              :candidatedItem='savedTags'
              :createable='false'
              label='請輸入新增到該階段的行政組標籤'
            />
            <div class='d-flex flex-row flex-wrap ma-1'>
              <v-chip
                v-for='rt in recentTags'
                :key="'recentfinal'+rt._id" @click='addpointerFinalTag(rt._id)'
                class='ma-1'
              >
                {{ tagQuery(rt._id) }}
              </v-chip>
            </div>
            <div class='text-subtitle-2 font-weight-blod'>你選取的知識點清單</div>
            <ol>
              <li v-for='KB in scanPointerKBs' :key='"pointer"+KB._id'>{{ KB.title }}({{ KB.stages.length }}個階段)</li>
            </ol>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="fabRemoveKB"
      max-width="50vw"
    >
      <template>
        <v-sheet class='d-flex flex-column pa-1'>
          <div class='text-h6'>確認刪除多個知識點？</div>
          <v-btn
            color='red accent-4'
            class='white--text ma-1'
            @click='removeMutipleKB'
          >
            是，快讓我刪除知識點！
          </v-btn>
          <div class='text-caption'>如果你只是誤觸，請隨意點擊其他地方即會關閉本對話框</div>
        </v-sheet>
      </template>
    </v-dialog>
    <v-dialog
      v-model='assignW'
      fullscreen
      hide-overlay
      scrollable
      transition="dialog-bottom-transition"
    >
      <v-card tile>
        <v-toolbar dark color='primary'>
          <v-btn
            icon
            dark
            @click="closeAssign"
          >
            <v-icon>fa-times</v-icon>
          </v-btn>
          <v-toolbar-title><span v-if='currentStage._id === ""'>設定知識點編輯階段</span><span v-if='currentStage._id !== ""'>{{ currentKB.title }}： {{ currentStage.name }}[{{ (currentStage.sort+1) }}]</span></v-toolbar-title>
        </v-toolbar>
        <v-card-actions>
          <v-menu
            offset-y
            attach
            transition="slide-y-transition"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                v-bind="attrs" v-on="on"
                class='ma-1'
              >
                刪除目前的階段
              </v-btn>
            </template>
            <v-sheet class='d-flex flex-column pa-1'>
              <div class='text-h6'>確認刪除階段？</div>
              <v-btn
                color='red accent-4'
                class='white--text ma-1'
                @click='removeStage'
              >
                是，我要刪除這個階段
              </v-btn>
              <div class='text-caption'>如果你只是誤觸，請隨意點擊其他地方即會關閉本對話框</div>
            </v-sheet>
          </v-menu>
          <v-btn class='ma-1' @click='setStage'>儲存目前的階段</v-btn>
          <v-btn class='ma-1' @click='tagUserW = true'>快速建立新的用戶群組標籤</v-btn>
          <v-btn class='ma-1' @click='closeAssign'>關閉對話框</v-btn>
        </v-card-actions>
        <v-card-text class='pa-5 text-left black--text text-body-1'>
          <div v-if='currentKB.stages.length === 0'>目前沒有設定階段</div>
          <v-skeleton-loader
            class="mx-auto"
            type="card"
            v-if='!stagePopulated'
            width="100%"
          ></v-skeleton-loader>
          <div v-if='stagePopulated' v-show='currentStage._id === ""'>
            找不到編輯階段
          </div>
          <div v-if='stagePopulated' v-show='currentStage._id !== ""'>
            <div class='d-flex flex-column black--text'>
              <div class='text-caption red--text text-left'>
                請注意以下事項：
                <ol>
                  <li>如果這個階段不需要有人參與，你就不需要給標籤</li>
                  <li>要把人拉入標籤，請去使用者管理中操作</li>
                  <li>所謂最終行政，指的是驗收、會計之類的，他們會看到「給予通過」這顆按鈕</li>
                </ol>
              </div>
              <v-switch
                v-model="currentStage.current"
                label="設定為目前工作階段"
              ></v-switch>
              <v-switch
                v-model="currentStage.coolDown"
                label="進入冷靜期（用戶不准發新的Issue，只可以回復既有的）"
              ></v-switch>
              <div class='text-subtitle-2 font-weight-blod'>本階段名稱</div>
              <v-text-field hint='請輸入本階段名稱' outlined clearable dense v-model='currentStage.name'/>
              <div class='text-subtitle-2 font-weight-blod'>編輯階段死線</div>
              <VueCtkDateTimePicker :inline='true' v-model="currentStageDate" label='請選擇日期死線' locale='zh-tw' format='YYYY-MM-DD HH:mm:ss' class='ma-2' />
              <div class='text-subtitle-2 font-weight-blod'>編輯階段目標</div>
              <div class='d-flex flex-row'>
                <v-text-field outlined clearable dense label="請輸入你想要加入的目標名稱" hint='輸入完之後請按右側加號增加目標，請務必最後再編輯目標，否則你輸入的用戶標籤都不會存檔（目標和標籤是分開存檔的）' v-model='objectiveAwaited'/>
                <v-btn
                  icon
                  outlined
                  @click='plusObjective'
                >
                  <v-icon>fa-plus</v-icon>
                </v-btn>
              </div>
              <v-simple-table v-show="currentStage.objectives.length > 0">
                <template v-slot:default>
                  <thead>
                    <tr>
                      <th class="text-left" style="width:25px">
                        階段目標名稱
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
                        {{ objective.name }}<span v-if='"signUser" in objective'>[已通過]</span>
                      </td>
                      <td class='d-flex flex-row justify-end'>
                        <v-tooltip bottom v-if='"signUser" in objective'>
                          <template v-slot:activator="{ on, attrs }">
                            <v-btn
                              outlined
                              icon
                              @click='revokeObjective(objective._id)'
                              v-bind="attrs" v-on="on"
                            >
                              <v-icon>fas fa-undo-alt</v-icon>
                            </v-btn>
                          </template>
                          <span>撤回目標許可</span>
                        </v-tooltip>
                        <v-menu>
                          <template v-slot:activator="{ on: menu, attrs }">
                            <v-tooltip bottom>
                              <template v-slot:activator="{ on: tooltip }">
                                <v-btn
                                  icon
                                  outlined
                                  v-bind="attrs"
                                  v-on="{ ...tooltip, ...menu }"
                                >
                                  <v-icon>fas fa-trash</v-icon>
                                </v-btn>
                              </template>
                              <span>刪除審查指標</span>
                            </v-tooltip>
                          </template>
                          <v-sheet class='d-flex flex-column pa-1'>
                            <div class='text-h6'>確認刪除審查指標？</div>
                            <v-btn
                              color='red accent-4'
                              class='white--text ma-1'
                              @click='removeObjective(objective._id)'
                            >
                              是，我要刪除審查指標！
                            </v-btn>
                            <div class='text-caption'>如果你只是誤觸，請隨意點擊其他地方即會關閉本對話框</div>
                          </v-sheet>
                        </v-menu>
                      </td>
                    </tr>
                  </tbody>
                </template>
              </v-simple-table>
              <v-btn class='flex-grow-1' @click='revokeObjectives'>全數撤回本階段審查指標許可</v-btn>
              <div class='text-subtitle-2 font-weight-blod'>本階段的PM群組標籤</div>
              <tag-filter
                :mustSelected='false'
                @updateTags='updateTags'
                :single='false'
                :selectedItem='currentStage.pmTags'
                @valueUpdated='filterPMTagUpdated'
                :candidatedItem='savedTags'
                :createable='false'
                label='請輸入本階段的PM標籤'
              />
              <div class='d-flex flex-row flex-wrap ma-1'>
                <v-chip
                  v-for='rt in recentTags'
                  :key="'recentpm'+rt._id" @click='addPMTag(rt._id)'
                  class='ma-1'
                >
                  {{ tagQuery(rt._id) }}
                </v-chip>
              </div>
              <div class='text-subtitle-2 font-weight-blod'>本階段的審查者群組標籤</div>
              <tag-filter
                :mustSelected='false'
                @updateTags='updateTags'
                :single='false'
                :selectedItem='currentStage.reviewerTags'
                @valueUpdated='filterreviewerTagUpdated'
                :candidatedItem='savedTags'
                :createable='false'
                label='請輸入本階段的審查者標籤'
              />
              <div class='d-flex flex-row flex-wrap ma-1'>
                <v-chip
                  v-for='rt in recentTags'
                  :key="'recentreviewer'+rt._id" @click='addReviewerTag(rt._id)'
                  class='ma-1'
                >
                  {{ tagQuery(rt._id) }}
                </v-chip>
              </div>
              <div class='text-subtitle-2 font-weight-blod'>本階段的廠商群組標籤</div>
              <tag-filter
                :mustSelected='false'
                @updateTags='updateTags'
                :single='false'
                :selectedItem='currentStage.vendorTags'
                @valueUpdated='filtervendorTagUpdated'
                :candidatedItem='savedTags'
                :createable='false'
                label='請輸入本階段的廠商標籤'
              />
              <div class='d-flex flex-row flex-wrap ma-1'>
                <v-chip
                  v-for='rt in recentTags'
                  :key="'recentvendor'+rt._id" @click='addVendorTag(rt._id)'
                  class='ma-1'
                >
                  {{ tagQuery(rt._id) }}
                </v-chip>
              </div>
              <div class='text-subtitle-2 font-weight-blod'>本階段的寫手群組標籤</div>
              <tag-filter
                :mustSelected='false'
                @updateTags='updateTags'
                :single='false'
                :selectedItem='currentStage.writerTags'
                @valueUpdated='filterwriterTagUpdated'
                :candidatedItem='savedTags'
                :createable='false'
                label='請輸入本階段的寫手標籤'
              />
              <div class='d-flex flex-row flex-wrap ma-1'>
                <v-chip
                  v-for='rt in recentTags'
                  :key="'recentwriter'+rt._id" @click='addWriterTag(rt._id)'
                  class='ma-1'
                >
                  {{ tagQuery(rt._id) }}
                </v-chip>
              </div>
              <div class='text-subtitle-2 font-weight-blod'>本階段的行政組群組標籤</div>
              <tag-filter
                :mustSelected='false'
                @updateTags='updateTags'
                :single='false'
                :selectedItem='currentStage.finalTags'
                @valueUpdated='filterfinalTagUpdated'
                :candidatedItem='savedTags'
                :createable='false'
                label='請輸入本階段的行政組標籤'
              />
              <div class='d-flex flex-row flex-wrap ma-1'>
                <v-chip
                  v-for='rt in recentTags'
                  :key="'recentfinal'+rt._id" @click='addFinalTag(rt._id)'
                  class='ma-1'
                >
                  {{ tagQuery(rt._id) }}
                </v-chip>
              </div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="tagUserW"
      max-width="50vw"
    >
      <v-card>
        <v-toolbar
          color="primary"
          dark
        >快速建立用戶標籤</v-toolbar>
        <v-card-text class='pa-0 d-flex flex-column text-left black--text text-body-1'>
          <v-alert outlined type='error' icon='fa-skull' class='text-left'>請要記得按下下方的「儲存設定值」，不然你輸入的東西都不會存起來啊啊啊啊啊啊啊啊啊啊啊啊!!!!!</v-alert>
          <div class='black--text d-flex flex-column pa-3 text-left'>
            <div class='text-h6'>請選擇你要框選的用戶所在的用戶標籤</div>
            <div class='text-caption grey--text darken-3'>可以不選，那你就會在下一個選單裡要從全部的用戶去篩選名單，基於多數用戶在帳號開設時已經被納入如「110年寫手群」這類的大標籤群組，建議你先在這裡選好，方便過濾</div>
            <tag-filter
              :mustSelected='false'
              @updateTags='updateTags'
              :single='false'
              :selectedItem='filteruserTag'
              @valueUpdated='filteruserTagUpdated'
              :candidatedItem='savedTags'
              :createable='false'
              label='請選擇用戶所在的標籤'
            />
            <v-btn @click='getUsers'>上欄留空，按此，可以列出全部的用戶清單</v-btn>
            <div class='text-h6'>請選擇你要框選的用戶</div>
            <div class='text-caption grey--text darken-3'>系統在此會把email、姓名全部合併成一個欄位，方便你搜尋，你輸入什麼，系統都會直接顯示出來</div>
            <tag-filter
              :mustSelected='true'
              :single='false'
              :selectedItem='selectedUsers'
              @updateTags='getUsers'
              @valueUpdated='selecteduserUpdated'
              :candidatedItem='savedUsers'
              :createable='false'
              label='請選擇要框選的用戶'
            />
            <div class='text-h6'>請建立新的用戶標籤</div>
            <div class='text-caption grey--text darken-3'>如果這些用戶要放置的新標籤不再選單裡（通常都是），請按右側加號自己建立一個，再勾選，記得要存檔</div>
            <tag-filter
              :mustSelected='true'
              @updateTags='updateTags'
              @plusItem='plusTag'
              :single='false'
              :selectedItem='selectednewTags'
              @valueUpdated='newtagUpdated'
              :candidatedItem='savedTags'
              :createable='true'
              label='請新的用戶標籤'
            />
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn class='white--text indigo darken-4' @click='saveuserTags'>儲存設定值</v-btn>
          <v-btn @click='tagUserW = false'>關閉對話框</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="cloneW"
      persistent
      max-width="50vw"
    >
      <v-card>
        <v-toolbar
          color="primary"
          dark
        >選擇性複製知識點</v-toolbar>
        <v-card-text class='pa-0 d-flex flex-column text-left black--text text-body-1'>
          <v-alert outlined type='info' icon='fa-info-circle' class='text-left'>請注意，所有的複製都是用「累加」的模式，不會複寫知識點原本的階段與權限設定，關閉對話框後，請將目標知識點打勾（右側），然後在右下角工具箱中選擇「複製」，就會按照你的設定複製過去了</v-alert>
          <div class='red--text text-center'>
            你目前選擇的知識點： {{ currentKB.title }} 
          </div>
          <div class='d-flex flex-column pa-3'>
            <v-switch
              v-model="cloneSetting.issues"
              label="複製0秒的Issue"
            ></v-switch>
            <div class='text-h6'>要複製的階段請點擊打勾</div>
            <v-item-group
              v-model="cloneSetting.stages"
              multiple
              color="indigo"
            >
              <div class='d-flex flex-row flex-wrap; height: 50px;'>
                <v-item
                  v-for="(stage, i) in currentKB.stages"
                  :key="stage._id"
                  v-slot="{ active, toggle }"
                  height='50'
                  class='pa-1 flex-grow-1'
                  style='height: 60px'
                >
                  <v-card
                    :color="active ? 'primary' : ''"
                    class="d-flex align-center"
                    @click="toggle"
                  >
                    第{{ i+1 }}階段
                    <v-scroll-y-transition>
                      <div
                        v-if="active"
                        class="display-3 flex-grow-1 text-center"
                      >
                        <v-icon v-if='active' large>far fa-check-square</v-icon>
                      </div>
                    </v-scroll-y-transition>
                  </v-card>
                </v-item>
              </div>
            </v-item-group>
            <v-switch
              v-model="cloneSetting.objectives"
              label="複製選取的階段的審查指標"
            ></v-switch>
            <v-switch
              v-model="cloneSetting.roles"
              label="複製選取的階段的權限角色分配"
            ></v-switch>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click='cloneW = false'>關閉對話框</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="importW"
      persistent
      max-width="50vw"
    >
      <v-card>
        <v-toolbar
          color="primary"
          dark
        >匯入知識點</v-toolbar>
        <v-card-text>
          <div class='text-caption red--text text-left black--text text-body-1'>
            知識點匯入功能，請完全按照以下說明操作
            <ol>
              <li><a href='/storages/importSample.zip' target='_blank'>請點這裡，下載範例檔，你也只能仿造範例檔的格式，上傳一個zip</a></li>
              <li>請按照範例檔中的CSV修改資料，一個知識點一條</li>
              <li>每一個知識點你都得在CSV裡給一個流水號（隨意，不重複即可），如果你的知識點說明無法使用文字描述（例如有公式），請直接將說明存成圖片，圖片檔名必須是和流水號一模一樣的圖檔（如[1].jpg）</li>
              <li>寫匯入成功就是成功了，如果清單沒有載入，請嘗試重新整理網頁</li>
            </ol>
          </div>
          <v-file-input 
            prepend-icon="fa-paperclip" 
            v-model="importFile" 
            label='上傳知識點匯入檔' 
            accept="application/zip"
            :loading="uploadzipprogress !== 0">
            <template v-slot:progress>
              <v-progress-circular :value="uploadzipprogress"></v-progress-circular>速度：{{ uploadzipstatus }}
            </template>
          </v-file-input>
          <div class='text-caption'>{{ importStatus }}</div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            @click="closeImport()"
          >
            關閉對話框
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model='KBeditorW' persistent width='60vw'>
      <v-card>
        <v-toolbar dark color='primary'>
          <v-toolbar-title>編輯知識點</v-toolbar-title>
        </v-toolbar>
        <v-card-text>
          <v-text-field
            label="知識點標題"
            v-model='currentKB.title'
            outlined clearable dense
          ></v-text-field>
          <v-text-field
            label="對應課綱學習表現或是課本內容"
            v-model='currentKB.textbook'
            outlined clearable dense
          ></v-text-field>
          <div class='red--text text-caption text-left'>以下兩項為細部說明相關內容，細部說明指的是出現在審查畫面抬頭提供參考用的資料</div>
          <Tip-Tap
            v-model="currentKB.desc"
            maxHeight="20vh"
            minHeight="10vh"
            hint='細部說明，請不要留白'
          />
          <v-file-input prepend-icon="fa-paperclip" v-model="KBFile" label='輔助說明文件／圖片上傳' :loading="uploadprogress !== 0">
            <template v-slot:progress>
              <v-progress-circular :value="uploadprogress"></v-progress-circular>速度：{{ uploadstatus }}
            </template>
          </v-file-input>
          <div v-if="currentKB.descAtt.length > 0" class='d-flex flex-row flex-wrap'>
            <v-tooltip 
              v-for='file in currentKB.descAtt'
              :key="file._id"
              bottom
            >
              <template v-slot:activator="{ on, attrs }">
                <v-chip
                  v-bind="attrs" v-on="on"
                  class="ma-2"
                  close
                  close-icon="fa-times"
                  @click:close="deleteKBFile(file)"
                  @click="downloadFile(file)"
                >
                  {{ filenameConvert(file.name) }} ({{ byteConvert(file.size) }})
                </v-chip>
              </template>
              <span>{{ file.name }}</span>
            </v-tooltip>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-btn :disabled='KBwatch' @click='setKB()'>儲存設定值</v-btn>
          <v-btn @click='KBeditorW = false'>關閉對話框</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model='insertM' persistent width='60vw'>
      <v-card>
        <v-toolbar dark color='primary'>
          <v-toolbar-title>新增大分類</v-toolbar-title>
        </v-toolbar>
        <v-card-text>
          <v-text-field
            label="大分類標題"
            v-model='currentChapter.title'
            outlined clearable dense
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-btn :disabled='currentChapter.title === ""' @click='insertMCata()'>儲存大分類</v-btn>
          <v-btn @click='insertM = false'>關閉對話框</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model='tagW' persistent width='60vw'>
      <v-card>
        <v-toolbar dark color='primary'>
          <v-toolbar-title>選擇科目標籤</v-toolbar-title>
        </v-toolbar>
        <v-card-text class='ma-0 pa-0'>
          <v-alert outlined type='info' icon='fa-info-circle' class='text-left'>請選擇您要編輯的科目標籤（如：109年國中數學科），如果您需要新增，直接輸入即可</v-alert>
          <tag-filter
            :mustSelected='true'
            @updateTags='updateTags'
            @plusItem='plusTag'
            :single='true'
            :selectedItem='selectedKBTag'
            @valueUpdated='updateKBTag'
            :candidatedItem='savedTags'
            :createable='true'
            label='請輸入知識點標籤'
          />
          <div class='text-body-2'>最近查詢的標籤（點擊後載入）</div>
          <div class='d-flex flex-row flex-wrap ma-1'>
            <v-chip
              v-for='ch in queriedChapters'
              :key="ch" @click='selectedKBTag = ch'
              class='ma-1'
            >
              {{ tagQuery(ch) }}
            </v-chip>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click='loadKB()' :disabled='selectedKBTag === ""'>載入科目</v-btn>
          <v-btn @click='tagW = false'>關閉對話框</v-btn>
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
            @click.stop='saveSort'
          >
            <v-icon>fa-cloud-upload-alt</v-icon>
          </v-btn>
        </template>
        <span>儲存知識點順序結構</span>
      </v-tooltip>
    </v-fab-transition>
    <v-speed-dial style='margin-bottom: 80px' v-model="editBtns" fixed bottom right direction="left" :open-on-hover="true" transition="slide-y-reverse-transition">
      <template v-slot:activator>
        <v-btn
          v-model="configBtn"
          color="indigo darken-4"
          dark
          fab
        >
          <v-icon v-if="configBtn">fa-chevron-up</v-icon>
          <v-icon v-else>fa-pencil-alt</v-icon>
        </v-btn>
      </template>
      <v-tooltip bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            v-bind="attrs" v-on="on"
            fab
            dark
            small
            color="blue darken-4"
            @click.stop='addChapter()'
          >
            <v-icon>fa-folder-plus</v-icon>
          </v-btn>
        </template>
        <span>新增知識點大分類</span>
      </v-tooltip>
      <v-badge
        color="red"
        overlap
        :content='selectedKBs.length'
        :value='selectedKBs.length'
      >
        <v-tooltip bottom v-if='selectedKBs.length > 0'>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              v-bind="attrs" v-on="on"
              fab
              dark
              small
              color="blue darken-4"
              @click.stop='fabRemoveKB = true'
            >
              <v-icon>fa-folder-minus</v-icon>
            </v-btn>
          </template>
          <span>刪除知識點</span>
        </v-tooltip>
      </v-badge>
      <v-badge
        color="red"
        overlap
        :content='selectedKBs.length'
        :value='selectedKBs.length'
        v-show='currentKB._id !== ""'
      >
        <v-tooltip bottom v-if='selectedKBs.length > 0'>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              v-bind="attrs" v-on="on"
              fab
              dark
              small
              color="blue darken-4"
              :disabled='currentKB._id === ""'
              @click.stop='cloneStages()'
            >
              <v-icon>fa-copy</v-icon>
            </v-btn>
          </template>
          <span>複製知識點的流程設定</span>
        </v-tooltip>
      </v-badge>
      <v-badge
        color="red"
        overlap
        :content='selectedKBs.length'
        :value='selectedKBs.length'
      >
        <v-tooltip bottom v-if='selectedKBs.length > 0'>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              v-bind="attrs" v-on="on"
              fab
              dark
              small
              color="blue darken-4"
              @click.stop='scanPointerKB'
            >
              <v-icon>fa-users</v-icon>
            </v-btn>
          </template>
          <span>大量指派用戶標籤到選定知識點</span>
        </v-tooltip>
      </v-badge>
    </v-speed-dial>
    <v-speed-dial v-model="configBtns" fixed bottom right direction="left" :open-on-hover="true" transition="slide-y-reverse-transition">
      <template v-slot:activator>
        <v-btn
          v-model="configBtn"
          color="pink darken-4"
          dark
          fab
        >
          <v-icon v-if="configBtn">fa-chevron-up</v-icon>
          <v-icon v-else>fa-toolbox</v-icon>
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
            @click.stop='tagW = true'
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
            color="purple darken-4"
            @click.stop='importW = true'
          >
            <v-icon>fa-file-import</v-icon>
          </v-btn>
        </template>
        <span>匯入知識點</span>
      </v-tooltip>
    </v-speed-dial>
    <div v-if='selectedKBTag === ""' class='d-flex flex-column align-self-center'>
      <v-btn class='white--text text-h5 indigo darken-4' @click='tagW = true'>請點這裡載入科目標籤</v-btn>
      <div class='text-caption'>你之後可以從右下角工具箱按鈕切換至其他的科目標籤，或者是由鉛筆按鈕新增本標簽下的章節知識點</div>
    </div>
    <div v-if='DB.length > 0' class='blue-grey--text darken-1 text-caption'>目前編輯的知識點標籤是「{{ tagQuery(selectedKBTag) }}」，已篩選出{{ DB.length }}個章節，為節省資源，不會全部展現出來，往下滑會載入更多</div>
    <draggable group="Mitems" v-model="DB" style="min-height: 10px" handle='.handle'>
      <template v-for="mitem in DB">
        <v-lazy
          :options="{
            threshold: 0.5
          }"
          min-height="65"
          transition="fade-transition"
          :key='mitem._id+"lazy"'
        >
          <div class='KBcata pa-0 mt-6 d-flex flex-column justify-start' dense>
            <div class='d-flex flex-row justify-start'>
                <v-tooltip bottom>
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn v-bind="attrs" v-on="on" icon @click="addKB(mitem)">
                      <v-icon>fa-plus</v-icon>
                    </v-btn>
                  </template>
                  <span>新增知識點</span>
                </v-tooltip>
                <v-menu>
                  <template v-slot:activator="{ on: menu, attrs }">
                    <v-tooltip bottom>
                      <template v-slot:activator="{ on: tooltip }">
                        <v-btn
                          icon
                          v-bind="attrs"
                          v-on="{ ...tooltip, ...menu }"
                        >
                          <v-icon>fas fa-minus</v-icon>
                        </v-btn>
                      </template>
                      <span>刪除本分類</span>
                    </v-tooltip>
                  </template>
                  <v-sheet class='d-flex flex-column pa-1'>
                    <div class='text-h6'>確認刪除知識點大分類？</div>
                    <v-btn
                      color='red accent-4'
                      class='white--text ma-1'
                      @click='removeChapter(mitem)'
                    >
                      是，我要刪除這個大分類！
                    </v-btn>
                    <div class='text-caption'>如果你只是誤觸，請隨意點擊其他地方即會關閉本對話框</div>
                  </v-sheet>
                </v-menu>
                <v-tooltip bottom v-show='mitem.collapse === false'>
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn v-bind="attrs" v-on="on" icon @click='mitem.collapse = true' v-show='mitem.collapse === false'>
                      <v-icon>fa-angle-up</v-icon>
                    </v-btn>
                  </template>
                  <span>折起本分類</span>
                </v-tooltip>
                <v-tooltip bottom v-show='mitem.collapse === true'>
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn v-bind="attrs" v-on="on" icon @click='mitem.collapse = false' v-show='mitem.collapse === true'>
                      <v-icon>fa-angle-down</v-icon>
                    </v-btn>
                  </template>
                  <span>打開本分類</span>
                </v-tooltip>
                <v-tooltip bottom>
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn v-bind="attrs" v-on="on" icon class='handle'>
                      <v-icon>fa-arrows-alt</v-icon>
                    </v-btn>
                  </template>
                  <span>上下移動本分類</span>
                </v-tooltip>
                <div v-show='mitem.collapse === true'>
                  {{ mitem.title }}（共 {{ mitem.KBs.length }} 項）
                </div>
            </div>
            <v-subheader class='black--text text-h6' v-show='mitem.collapse === false'>
              <v-icon>fa-folder-open</v-icon>
              {{mitem.title}}
              <v-btn icon @click='editChapter(mitem)'>
                <v-icon>fa-pencil-alt</v-icon>
              </v-btn>
            </v-subheader>
            <draggable v-model="mitem.KBs" :group="'KBitems'" handle=".subhandle" style="min-height: 10px" v-show='mitem.collapse === false'>
              <template v-for="KBitem in mitem.KBs">
                <v-lazy
                  :options="{
                    threshold: 0.5
                  }"
                  min-height="65"
                  transition="fade-transition"
                  :key='KBitem._id+"lazy"'
                >
                  <div class='d-flex flex-column' :key="KBitem._id + 'handler'">
                    <div class='d-flex flex-row blue-grey lighten-5'>
                      <div class='flex-grow-1 text-left text-h6'>
                        {{ KBitem.title }}
                      </div>
                      <div class='align-center flex-grow-0 flex-shrink-1 ma-0 pa-0 d-flex flex-row'>
                        <v-checkbox v-model="selectedKBs" :value='KBitem._id' off-icon="far fa-square" on-icon="fa-check-square"></v-checkbox>
                        <v-tooltip top>
                          <template v-slot:activator="{ on, attrs }">
                            <v-btn @click="loadKBEditor(KBitem)" v-bind="attrs" v-on="on" icon>
                              <v-icon>fa-pencil-alt</v-icon>
                            </v-btn>
                          </template>
                          <span>編輯知識點</span>
                        </v-tooltip>
                        <v-tooltip top>
                          <template v-slot:activator="{ on, attrs }">
                            <v-btn @click="cloneConfigs(KBitem)" v-bind="attrs" v-on="on" icon>
                              <v-icon>fa-copy</v-icon>
                            </v-btn>
                          </template>
                          <span>設定為知識點複製範本</span>
                        </v-tooltip>
                        <v-menu>
                          <template v-slot:activator="{ on: menu, attrs }">
                            <v-tooltip bottom>
                              <template v-slot:activator="{ on: tooltip }">
                                <v-btn
                                  icon
                                  v-bind="attrs"
                                  v-on="{ ...tooltip, ...menu }"
                                >
                                  <v-icon>fas fa-trash</v-icon>
                                </v-btn>
                              </template>
                              <span>刪除知識點</span>
                            </v-tooltip>
                          </template>
                          <v-sheet class='d-flex flex-column pa-1'>
                            <div class='text-h6'>確認刪除知識點？</div>
                            <v-btn
                              color='red accent-4'
                              class='white--text ma-1'
                              @click='removeKB(KBitem)'
                            >
                              是，我要刪除知識點！
                            </v-btn>
                            <div class='text-caption'>如果你只是誤觸，請隨意點擊其他地方即會關閉本對話框</div>
                          </v-sheet>
                        </v-menu>
                        <v-tooltip top>
                          <template v-slot:activator="{ on, attrs }">
                            <v-btn v-bind="attrs" v-on="on" icon class='subhandle'>
                              <v-icon>fa-arrows-alt</v-icon>
                            </v-btn>
                          </template>
                          <span>上下移動知識點</span>
                        </v-tooltip>
                      </div>
                    </div>
                    <div class='d-flex flex-row'>
                      <div class='text-center text-caption grey--text darken-1 flex-grow-1' v-if='KBitem.stages.length === 0'>
                        本知識點沒有任何階段，點右邊加號圖案去增加階段吧
                      </div>
                      <div class='flex-grow-1' v-if='KBitem.stages.length > 0'>
                        <v-stepper v-model="KBitem.stepPointer">
                          <v-stepper-header>
                            <template
                              v-for='(stage, index) in KBitem.stages'
                            >
                              <v-stepper-step
                                :key='stage._id'
                                :complete="KBitem.stepPointer > index"
                                :step='index + 1'
                                editable
                                @click="loadReviewer(KBitem)"
                                complete-icon='fa-check-circle'
                                edit-icon='fa-pencil-alt'
                              >
                                <span v-show='(index + 1) === KBitem.stepPointer'>[{{ (stage.sort+1) }}]{{ stage.name }}</span>
                              </v-stepper-step>
                              <v-divider
                                :key='"divider" + stage._id'
                                v-if='(index + 1) !== KBitem.stages.length'
                              ></v-divider>
                            </template>
                          </v-stepper-header>
                        </v-stepper>
                      </div>
                    <div class='flex-shrink-1 flex-grow-0'>
                      <v-tooltip top>
                        <template v-slot:activator="{ on, attrs }">
                          <v-btn v-bind="attrs" v-on="on" icon @click="addStage(KBitem)">
                            <v-icon>fas fa-plus</v-icon>
                          </v-btn>
                        </template>
                        <span>新增知識點編輯階段</span>
                      </v-tooltip>
                    </div>
                  </div>
                </div>
              </template>
            </draggable>
          </div>
        </v-lazy>
      </template>
    </draggable>
  </v-sheet>
</template>

<style scoped>
.KBcata {
  border-left: none;
}

.KBsub {
  border-left: none;
}

.handle, .subhandle {
  cursor: grab;
}

</style>

<script>
// @ is an alias to /src
import Vue from 'vue';
import prettyBytes from 'pretty-bytes';
import { v4 as uuidv4 } from 'uuid';
import marked from 'marked';
import _map from 'lodash/map';
import _find from 'lodash/find';
import _uniq from 'lodash/uniq';
import _uniqWith from 'lodash/uniqWith';
import _findIndex from 'lodash/findIndex';
import _flatten from 'lodash/flatten';
import _orderBy from 'lodash/orderBy';
import _slice from 'lodash/slice';
import moment from 'moment';
import 'vue-ctk-date-time-picker/dist/vue-ctk-date-time-picker.css';

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

export default {
  name: 'createKB',
  components: { 
    TagFilter: () => import(/* webpackPrefetch: true */ './modules/TagFilter'),
    draggable: () => import(/* webpackPrefetch: true */ 'vuedraggable'),
    TipTap: () => import(/* webpackPrefetch: true */ './modules/TipTap'),
    VueCtkDateTimePicker: () => import(/* webpackPrefetch: true */ 'vue-ctk-date-time-picker')
  },
  watch: {
    currentStageDate: function () {
      this.currentStage.dueTick = moment(this.currentStageDate).unix();
    },
    currentStage: function () {
      this.currentStageDate = moment.unix(this.currentStage.dueTick).format(moment.HTML5_FMT.DATETIME_LOCAL);
    },
    KBFile: {
      immediate: true,
      handler () {
        if (this.KBFile !== undefined) {
          let oriobj = this;
          let fileReader = new FileReader();
          let slice = this.KBFile.slice(0, 100000);
          let uuid = uuidv4();
          files[uuid] = {
            _id: this.currentKB._id,
            file: this.KBFile,
            starttick: moment().valueOf()
          };
          fileReader.readAsArrayBuffer(slice);
          fileReader.onload = () => {
              var arrayBuffer = fileReader.result;
              oriobj.$socket.client.emit('sendKBFile', {
                uid: oriobj.currentKB._id,
                uuid: uuid,
                name: oriobj.KBFile.name,
                type: oriobj.KBFile.type,
                size: oriobj.KBFile.size,
                data: arrayBuffer
              });
          };
        }
      }
    },
    importFile: {
      immediate: true,
      handler () {
        if (this.importFile !== undefined) {
          let oriobj = this;
          let fileReader = new FileReader();
          let slice = this.importFile.slice(0, 100000);
          let uuid = uuidv4();
          files[uuid] = {
            _id: this.currentKB._id,
            file: this.importFile,
            starttick: moment().valueOf()
          };
          fileReader.readAsArrayBuffer(slice);
          fileReader.onload = () => {
              var arrayBuffer = fileReader.result;
              oriobj.$socket.client.emit('importKBZip', {
                uid: oriobj.importFile._id,
                uuid: uuid,
                name: oriobj.importFile.name,
                type: oriobj.importFile.type,
                size: oriobj.importFile.size,
                tag: oriobj.selectedKBTag,
                data: arrayBuffer
              });
          };
        }
      }
    }
  },
  methods: {
    socketpointerStageTags: function () {
      this.$emit('toastPop', '快速指派操作完成...');
      this.pointerW = false;
    },
    execPointer: function () {
      this.$emit('toastPop', '送出快速指派中...');
      this.$socket.client.emit('pointerStageTags', {
        KBs: this.selectedKBs,
        tag: this.selectedKBTag,
        stagePointer: this.pointerStage,
        writerTags: this.pointerwriterTags,
        vendorTags: this.pointerwriterTags,
        reviewerTags: this.pointervendorTags,
        pmTags: this.pointerpmTags,
        finalTags: this.pointerfinalTags
      });
    },
    scanPointerKB: function () {
      this.scanPointerKBs = [];
      for(let i=0; i<this.selectedKBs.length; i++) {
        let search = this.selectedKBs[i];
        for(let k=0;k<this.DB.length;k++) {
          let KBs = this.DB[k].KBs;
          let KB = _find(KBs, (item) => {
            return item._id === search;
          });
          if(KB !== undefined) {
            this.pointerMin = KB.stages.length > 0 ? 1 : 0;
            this.scanPointerKBs.push(KB);
          }
        }
      }
      let maxs = _map(this.scanPointerKBs, (item) => {
        return item.stages.length;
      });
      let sorted = maxs.sort((a, b) => {
        return a-b;
      });
      this.pointerMax = sorted.length > 0 ? sorted[0] : this.pointerMin;
      this.pointerfinalTags = [];
      this.pointerwriterTags = [];
      this.pointervendorTags = [];
      this.pointerreviewerTags = [];
      this.pointerpmTags = [];
      this.pointerStage = this.pointerMin;
      this.pointerW = true;
    },
    socketpriviTagUsed: function (data) {
      let now = moment().unix();
      let tags = this.recentTags;
      let newTags = [];
      let successTag = _flatten([data.pmTags, data.reviewerTags, data.vendorTags, data.writerTags, data.finalTags]);
      if(successTag.length > 0) {
        for(let i=0; i<successTag.length; i++) {
          let workingTag = successTag[i];
          let tag = _find(tags, (item) => {
            return item._id === workingTag[i];
          });
          if(tag !== undefined) {
            tag.tick = now;
          } else {
            newTags.push({
              _id: workingTag,
              tick: now
            });
          }
        }
        for(let i=0; i<newTags.length; i++) {
          let workingTag = newTags[i];
          tags.push(workingTag);
        }
        let sorted = _orderBy(tags, ['tick'], ['desc']);
        let uniqed = _uniqWith(sorted, (aKB, bKB) => {
          return aKB._id === bKB._id;
        });
        this.recentTags = _slice(uniqed, 0 , 5);
        localStorage.setItem('recentEditTags', JSON.stringify(this.recentTags));
      }
    },
    addFinalTag: function (data) {
      let finalTags = [...this.currentStage.finalTags];
      finalTags.push(data);
      this.currentStage.finalTags = _uniq(finalTags);
    },
    addWriterTag: function (data) {
      let writerTags = [...this.currentStage.writerTags];
      writerTags.push(data);
      this.currentStage.writerTags = _uniq(writerTags);
    },
    addVendorTag: function (data) {
      let vendorTags = [...this.currentStage.vendorTags];
      vendorTags.push(data);
      this.currentStage.vendorTags = _uniq(vendorTags);
    },
    addReviewerTag: function (data) {
      let reviewerTags = [...this.currentStage.reviewerTags];
      reviewerTags.push(data);
      this.currentStage.reviewerTags = _uniq(reviewerTags);
    },
    addPMTag: function (data) {
      let pmTags = [...this.currentStage.pmTags];
      pmTags.push(data);
      this.currentStage.pmTags = _uniq(pmTags);
    },
    addpointerFinalTag: function (data) {
      let pointerfinalTags = [...this.pointerfinalTags];
      pointerfinalTags.push(data);
      this.pointerfinalTags = _uniq(pointerfinalTags);
    },
    addpointerWriterTag: function (data) {
      let pointerwriterTags = [...this.pointerwriterTags];
      pointerwriterTags.push(data);
      this.pointerwriterTags = _uniq(pointerwriterTags);
    },
    addpointerVendorTag: function (data) {
      let pointervendorTags = [...this.pointervendorTags];
      pointervendorTags.push(data);
      this.pointervendorTags = _uniq(pointervendorTags);
    },
    addpointerReviewerTag: function (data) {
      let pointerreviewerTags = [...this.pointerreviewerTags];
      pointerreviewerTags.push(data);
      this.pointerreviewerTags = _uniq(pointerreviewerTags);
    },
    addpointerPMTag: function (data) {
      let pointerpmTags = [...this.pointerpmTags];
      pointerpmTags.push(data);
      this.pointerpmTags = _uniq(pointerpmTags);
    },
    getUsers: function () {
      if(this.filteruserTag.length > 0) {
        this.$socket.client.emit('getTagUsers', this.filteruserTag);
      } else {
        this.$socket.client.emit('getUsers');
      }
    },
    socketmodUserTags: function (data) {
      this.selectednewTags = [];
      this.selectedUsers = [];
      this.filteruserTag = [];
      this.$emit('toastPop', '為' + data.processed + '/' + data.planned + '個用戶的加上' + data.tags + '個使用者標籤已完成');
    },
    saveuserTags: function () {
      this.$emit('toastPop', '設定用戶的使用者標籤中...');
      this.$socket.client.emit('modUserTags', {
          users: _map(this.selectedUsers, (item) => {
            return {
              _id: item
            }
          }),
          tags: this.selectednewTags,
          mode: false
      });
    },
    newtagUpdated: function (val) {
      this.selectednewTags = val;
    },
    selecteduserUpdated: function (val) {
      this.selectedUsers = val;
    },
    socketgetUsers: function (data) {
      this.savedUsers = _map(data, (item) => {
        return {
          _id: item._id,
          name: item.name+"@"+item.unit+" ("+item.email+")"
        }
      });
    },
    filteruserTagUpdated: function(val) {
      this.filteruserTag = val;
      this.getUsers();
    },
    tagQuery: function(tag) {
      let tagItem = _find(this.savedTags, (item) => {
        return item._id === tag
      });
      return tagItem === undefined ? '' : tagItem.name;
    },
    updateTags: function() {
      this.$emit('updateTags');
    },
    revokeObjective: function (OID) {
      this.$emit('toastPop', '移除單一目標許可權中...');
      this.$socket.client.emit('revokeObjective', {
        KB: this.currentStage.KB,
        oid: OID,
        stage: this.currentStage._id
      });
    },
    revokeObjectives: function () {
      this.$socket.client.emit('revokeObjectives', {
        KB: this.currentStage.KB,
        stage: this.currentStage._id
      });
    },
    downloadFile: function (file) {
      this.$emit('downloadFile', file);
    },
    removeObjective: function (OID) {
      this.$emit('toastPop', '取得新的目標清單中...');
      this.$socket.client.emit('removeObjective', {
        OID: OID,
        KB: this.currentStage.KB,
        stage: this.currentStage._id
      });
    },
    isodateConverter: function () {
      this.currentStageDate = moment.unix(this.currentStage.dueTick).format(moment.HTML5_FMT.DATETIME_LOCAL);
    },
    closeAssign: function () {
      this.assignW = false;
    },
    resetKB: function () {
      this.currentKB = {
        _id: '',
        title: '',
        textbook: '',
        desc: '',
        descAtt: [],
        stages: [],
        stepPointer: -1
      };
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
    resetChapter: function () {
      this.currentChapter = {
        title: ''
      };
    },
    socketgetStage: function (data) {
      this.objectiveAwaited = '';
      if(data === null || data === undefined) {
        this.resetStage();
      } else {
        this.currentStage = data;
      }
      this.assignW = true;
      this.stagePopulated = true;
    },
    dateConvert: function (time) {
      return time === null || time === undefined ? moment().format('YYYY/MM/DD HH:mm:ss') : moment.unix(time).format('YYYY/MM/DD HH:mm:ss');
    },
    filenameConvert: function (name) {
      let filenameLength = name.length > 3 ? 3 : name.length;
      return (name.substring(0, filenameLength)) + '⋯';
    },
    socketsetChapter: function (data) {
      if (data) {
        this.insertM = false;
      }
    },
    socketaddChapter: function (data) {
      this.currentChapter = data;
      this.insertM = true;
    },
    socketremoveStage: function () {
      this.resetStage();
      this.assignW = false;
      this.$emit('toastPop', '知識點流程移除完成');
      if(this.currentKB.stages.length > 0) {
        this.currentKB.stepPointer = 1;
      } else {
        this.currentKB.stepPointer = -1;
      }
    },
    removeStage: function () {
      this.removePointer = true;
      this.$emit('toastPop', '儲存知識點流程...');
      this.$socket.client.emit('removeStage', {
        stage: this.currentStage,
        tag: this.selectedKBTag
      });
    },
    setStage: function () {
      this.$emit('toastPop', '儲存知識點流程...');
      this.$socket.client.emit('setStage', {
        stage: this.currentStage,
        tag: this.selectedKBTag
      });
    },
    socketsaveSort: function () {
      this.$emit('toastPop', '知識點排序儲存完成');
    },
    saveSort: function () {
      this.$emit('toastPop', '儲存知識點排序...');
      this.$socket.client.emit('saveSort', {
        DB: this.DB,
        tag: this.selectedKBTag
      });
    },
    editChapter: function (data) {
      this.currentChapter = data;
      this.insertM = true;
    },
    addChapter: function () {
      this.$socket.client.emit('addChapter', this.selectedKBTag);
    },
    socketremoveChapter: function () {
      this.resetChapter();
      this.$emit('toastPop', '章節刪除完成');
    },
    removeChapter: function (data) {
      this.$emit('toastPop', '刪除章節中...');
      this.currentChapter = data;
      this.$socket.client.emit('removeChapter', {
        _id: this.currentChapter._id,
        tag: this.selectedKBTag
      });
    },
    socketeditKB: function (data) {
      data.desc = marked(data.desc, { renderer });
      data.stages.sort((a,b) => {
        return a.sort - b.sort;
      });
      this.currentKB = data;
      this.KBeditorW = true;
    },
    socketaddKB: function () {
      this.$emit('toastPop', '知識點新增完成');
    },
    socketcloneStages: function (data) {
      this.resetKB();
      this.cloneSetting.stages = [];
      if(data) {
        this.$emit('toastPop', '知識點流程複製完成');
      }
    },
    loadKB: function () {
      this.tagW = false;
      this.$emit('toastPop', '載入知識點中...');
      this.$socket.client.emit('getChapters', this.selectedKBTag);
    },
    updateKBTag: function (val) {
      this.selectedKBTag = val;
    },
    socketgetChapters: function (data) {
      this.queriedChapters.push(this.selectedKBTag);
      this.queriedChapters = _uniq(this.queriedChapters);
      localStorage.setItem('queriedChapters', JSON.stringify(this.queriedChapters));
      this.$emit('toastPop', '取得章節中');
      let KBs = [];
      for(let i=0; i< data.length; i++) {
        let chapter = data[i];
        chapter.collapse = false;
        KBs.push(chapter.KBs);
        for(let k=0; k<chapter.KBs.length; k++) {
          let KB = chapter.KBs[k];
          KB.desc = marked(KB.desc, { renderer });
          KB.stages.sort((a,b) => {
            return a.sort - b.sort;
          });
          let stepPointer = _findIndex(KB.stages, { current: true });
          KB.stepPointer = stepPointer === -1 ? -1 : stepPointer + 1;
        }
        chapter.KBs.sort((a,b) => {
          return a.sort - b.sort;
        });
      }
      data.sort((a,b) => {
        return a.sort - b.sort;
      })
      this.DB = data;
      if(this.currentKB._id !== '') {
        let flattenKBs = _flatten(KBs);
        let currentKB = _find(flattenKBs, (KB) => {
          return KB._id === this.currentKB._id;
        });
        if(currentKB === undefined) {
          this.resetKB();
        } else {
          this.currentKB = currentKB;
        }
      }
    },
    socketgetKB: function (data) {
      data.desc = marked(data.desc, { renderer });
      data.stages.sort((a,b) => {
        return a.sort - b.sort;
      });
      this.currentKB = data;
    },
    socketaddStage: function (data) {
      if(data) {
        this.$emit('toastPop', '新增知識點流程完成');
      }
    },
    plusTag: function (val) {
      this.$emit('addTag', val);
    },
    plusObjective: function () {
      this.$emit('toastPop', '取得新的目標清單中...');
      this.$socket.client.emit('addObjective', {
        name: this.objectiveAwaited,
        KB: this.currentStage.KB,
        stage: this.currentStage._id
      });
    },
    socketrequestKBSlice: function (data) {
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
        oriobj.$socket.client.emit('sendKBFile', {
          uid: files[data.uuid]._id,
          uuid: data.uuid,
          name: files[data.uuid].file.name,
          type: files[data.uuid].file.type,
          size: files[data.uuid].file.size,
          data: arrayBuffer
        });
      };
    },
    socketKBFileDeleteError: function (data) {
      this.$emit('toastPop', '刪除檔案失敗（原因：' + data + '），請聯絡管理員');
      this.uploadprogress = 0;
      this.uploadstatus = '';
    },
    socketKBFileUploadError: function (data) {
      this.$emit('toastPop', '上傳失敗（原因：' + data + '），請聯絡管理員');
      this.uploadprogress = 0;
      this.uploadstatus = '';
    },
    socketgetKBAttachment: function (data) {
      this.currentKB.descAtt = data;
    },
    soketKBFileUploadDone: function (data) {
      let oriobj = this;
      if (data === this.currentKB._id) {
        this.$socket.client.emit('getKBAttachment', data);
        this.KBFile = undefined;
        this.uploadprogress = 100;
        this.uploadstatus = '完成！';
        this.importW = false;
        this.$emit('toastPop', '知識點附件上傳完成');
        Vue.nextTick(() => {
          oriobj.uploadprogress = 0;
          oriobj.uploadstatus = '';
        });
      }
    },
    socketrequestKBZipSlice: function (data) {
      let oriobj = this;
      let place = data.currentSlice * 100000;
      let slice = files[data.uuid].file.slice(place, place + Math.min(100000, files[data.uuid].file.size - place));
      this.uploadzipprogress = Math.ceil((place / files[data.uuid].file.size) * 100);
      let nowdiff = moment().valueOf() - files[data.uuid].starttick;
      this.uploadzipstatus = nowdiff === 0 ? '' : prettyBytes(place / (nowdiff/1000)) + '/s';
      let fileReader = new FileReader();
      fileReader.readAsArrayBuffer(slice);
      fileReader.onload = () => {
        var arrayBuffer = fileReader.result;
        oriobj.$socket.client.emit('importKBZip', {
          uid: files[data.uuid]._id,
          uuid: data.uuid,
          name: files[data.uuid].file.name,
          type: files[data.uuid].file.type,
          size: files[data.uuid].file.size,
          data: arrayBuffer
        });
      };
    },
    soketKBZipUploadDone: function () {
      let oriobj = this;
      this.importFile = undefined;
      this.uploadzipprogress = 100;
      this.uploadzipstatus = '完成！';
      Vue.nextTick(() => {
        oriobj.uploadzipprogress = 0;
        oriobj.uploadzipstatus = '';
      });
    },
    socketKBZipUploadError: function (data) {
      this.$emit('toastPop', '上傳知識點匯入檔失敗（原因：' + data + '），請聯絡管理員');
      this.uploadzipprogress = 0;
      this.uploadzipstatus = '';
    },
    addStage: function (KB) {
      this.$emit('toastPop', '新增知識點流程中');
      this.$socket.client.emit('addStage', {
        _id: KB._id,
        tag: this.selectedKBTag
      });
    },
    deleteKBFile: function (file) {
      this.$socket.client.emit('deleteKBFile', {
        fileID: file._id,
        KBID: this.currentKB._id
      });
    },
    byteConvert: function (size) {
      return prettyBytes(size);
    },
    pointerreviewerTagUpdated: function (val) {
      this.pointerreviewerTags = val;
    },
    pointervendorTagUpdated: function (val) {
      this.pointervendorTags = val;
    },
    pointerwriterTagUpdated: function (val) {
      this.pointerwriterTags = val;
    },
    pointerfinalTagUpdated: function (val) {
      this.pointerfinalTags = val;
    },
    pointerPMTagUpdated: function (val) {
      this.pointerpmTags = val;
    },
    filterreviewerTagUpdated: function (val) {
      this.currentStage.reviewerTags = val;
    },
    filtervendorTagUpdated: function (val) {
      this.currentStage.vendorTags = val;
    },
    filterwriterTagUpdated: function (val) {
      this.currentStage.writerTags = val;
    },
    filterfinalTagUpdated: function (val) {
      this.currentStage.finalTags = val;
    },
    filterPMTagUpdated: function (val) {
      this.currentStage.pmTags = val;
    },
    loadKBEditor: function (KB) {
      this.currentKB = KB;
      this.KBeditorW = true;
    },
    loadReviewer: function (data) {
      let oriobj = this;
      this.resetKB();
      oriobj.currentKB = data;
      setTimeout(() => {  //奇怪的問題，Vue nexttick也抓不到vmodel更新，只好用setTimeout
        if(oriobj.currentKB.stepPointer > 0) {
          if(oriobj.currentKB.stages.length >= oriobj.currentKB.stepPointer) {
            oriobj.stagePopulated = false;
            oriobj.$socket.client.emit('getStage', oriobj.currentKB.stages[oriobj.currentKB.stepPointer - 1]._id);
          }
        }
      }, 100);
      this.$emit('toastPop', '階段載入中...');
    },
    insertMCata: function () {
      this.$emit('toastPop', '新增章節中');
      this.$socket.client.emit('setChapter', {
        _id: this.currentChapter._id,
        title: this.currentChapter.title,
        tag: this.selectedKBTag
      });
    },
    removeMutipleKB: function () {
      this.$emit('toastPop', '刪除多個知識點...');
      this.$socket.client.emit('removeKB', {
        KBs: this.selectedKBs,
        tag: this.selectedKBTag
      });
    },
    removeKB: function (data) {
      this.$emit('toastPop', '刪除知識點...');
      this.$socket.client.emit('removeKB', {
        KBs: [data._id],
        tag: this.selectedKBTag
      });
    },
    cloneStages: function () {
      this.$emit('toastPop', '複製知識點流程設定...');
      this.$socket.client.emit('cloneStages', {
        subject: this.currentKB,
        target: this.selectedKBs,
        tag: this.selectedKBTag,
        setting: this.cloneSetting
      });
    },
    cloneConfigs: function (KB) {
      this.currentKB = KB;
      this.cloneW = true;
    },
    setKB: function () {
      this.$emit('toastPop', '設定知識點...');
      this.$socket.client.emit('setKB', {
        KB: this.currentKB,
        tag: this.selectedKBTag
      });
    },
    addKB: function (chapter) {
      this.$emit('toastPop', '新增知識點...');
      this.currentChapter = chapter;
      this.$socket.client.emit('addKB', {
        tag: this.selectedKBTag,
        chapter: this.currentChapter._id
      });
    },
    socketsetKB: function (data) {
      if (data) {
        this.$emit('toastPop', '設定知識點完成');
        this.KBeditorW = false;
      }
    },
    socketgetimportReport: function (data) {
      this.importStatus = data;
    },
    closeImport: function () {
      this.importW = false;
      this.importStatus = '';
    },
    socketremoveKB: function () {
      this.resetKB();
      this.$emit('toastPop', '刪除知識點完成');
    }
  },
  computed: {
    savedTags: function () {
      return this.$store.state.savedTags;
    },
    KBwatch: function () {
      let monitor = ['title', 'textbook', 'desc'];
      let monitorCount = 0;
      for(let i=0; i < monitor.length; i++) {
        if(this.currentKB[monitor[i]] === '') {
          monitorCount++;
        }
      }
      return monitorCount === monitor.length;
    }
  },
  data () {
    return {
      scanPointerKBs: [],
      pointerfinalTags: [],
      pointerwriterTags: [],
      pointervendorTags: [],
      pointerreviewerTags: [],
      pointerpmTags: [],
      pointerMin: 0,
      pointerMax: 1,
      pointerStage: 0,
      pointerW: false,
      fabRemoveKB: false,
      tagUserW: false,
      selectednewTags: [],
      selectedUsers: [],
      savedUsers: [],
      filteruserTag: [],
      cloneW: false,
      cloneSetting: {
        issues: false,
        objectives: false,
        stages: [],
        roles: false
      },
      recentTags: [],
      queriedChapters: [],
      currentStageDate: '1970-01-01 00:00:00',
      stagePopulated: true,
      currentStage: {
        current: false,
        name: '',
        dueTick: 0,
        pmTags: [],
        reviewerTags: [],
        vendorTags: [],
        writerTags: [],
        finalTags: [],
        _id: '',
        objectives: [],
        coolDown: false
      },
      removePointer: false,
      timePicker: false,
      assignW: false,
      configBtns: false,
      editBtns: false,
      DB: [],
      uploadzipstatus: '',
      importFile: undefined,
      uploadzipprogress: 0,
      importW: false,
      insertM: false,
      configBtn: false,
      tagW: false,
      selectedKBTag: '',
      selectedKBs: [],
      currentChapter: {
        title: ''
      },
      objectiveAwaited: '',
      importStatus: '',
      KBeditorW: false,
      uploadstatus: '',
      uploadprogress: 0,
      KBFile: undefined,
      currentKB: {
        _id: '',
        title: '',
        textbook: '',
        desc: '',
        descAtt: [],
        stages: [],
        stepPointer: -1
      },
      stageStatus: ''
    };
  },
  beforeDestroy () {
    this.$socket.client.emit('saveSort', {
      DB: this.DB,
      tag: this.selectedKBTag
    });
    this.$socket.client.off('pointerStageTags', this.socketpointerStageTags);
    this.$socket.client.off('priviTagUsed', this.socketpriviTagUsed);
    this.$socket.client.off('modUserTags', this.socketmodUserTags);
    this.$socket.client.off('getUsers', this.socketgetUsers);
    this.$socket.client.off('getTagUsers', this.socketgetUsers);
    this.$socket.client.off('KBFileUploadDone', this.soketKBFileUploadDone);
    this.$socket.client.off('getKBAttachment', this.socketgetKBAttachment);
    this.$socket.client.off('KBFileUploadError', this.socketKBFileUploadError);
    this.$socket.client.off('KBFileDeleteError', this.socketKBFileDeleteError);
    this.$socket.client.off('requestKBSlice', this.socketrequestKBSlice);
    this.$socket.client.off('addStage', this.socketaddStage);
    this.$socket.client.off('addChapter', this.socketaddChapter);
    this.$socket.client.off('getKB', this.socketgetKB);
    this.$socket.client.off('getChapters', this.socketgetChapters);
    this.$socket.client.off('cloneStages', this.socketcloneStages);
    this.$socket.client.off('KBZipUploadDone', this.soketKBZipUploadDone);
    this.$socket.client.off('KBZipUploadError', this.socketKBFileUploadError);
    this.$socket.client.off('requestKBZipSlice', this.socketrequestKBZipSlice);
    this.$socket.client.off('addKB', this.socketaddKB);
    this.$socket.client.off('editKB', this.socketeditKB);
    this.$socket.client.off('removeChapter', this.socketremoveChapter);
    this.$socket.client.off('saveSort', this.socketsaveSort);
    this.$socket.client.off('removeStage', this.socketremoveStage);
    this.$socket.client.off('setChapter', this.socketsetChapter);
    this.$socket.client.off('setKB', this.socketsetKB);
    this.$socket.client.off('getStage', this.socketgetStage);
    this.$socket.client.off('KBZipReport', this.socketgetimportReport);
    this.$socket.client.off('refreshKB', this.loadKB);
    this.$socket.client.off('removeKB', this.socketremoveKB);
  },
  created () {
    this.$emit('viewIn', {
      text: '知識點管理',
      icon: 'fa-network-wired',
      module: '知識節點模組',
      location: '/createKB'
    });
    let queriedChapters = window.localStorage.getItem('queriedChapters');
    if(queriedChapters) {
      this.queriedChapters = JSON.parse(queriedChapters);
    }
    let recentTags = window.localStorage.getItem('recentEditTags');
    if(recentTags) {
      this.recentTags = JSON.parse(recentTags);
    }
    this.$socket.client.on('pointerStageTags', this.socketpointerStageTags);
    this.$socket.client.on('priviTagUsed', this.socketpriviTagUsed);
    this.$socket.client.on('modUserTags', this.socketmodUserTags);
    this.$socket.client.on('getUsers', this.socketgetUsers);
    this.$socket.client.on('getTagUsers', this.socketgetUsers);
    this.$socket.client.on('KBFileUploadDone', this.soketKBFileUploadDone);
    this.$socket.client.on('getKBAttachment', this.socketgetKBAttachment);
    this.$socket.client.on('KBFileUploadError', this.socketKBFileUploadError);
    this.$socket.client.on('KBFileDeleteError', this.socketKBFileDeleteError);
    this.$socket.client.on('requestKBSlice', this.socketrequestKBSlice);
    this.$socket.client.on('addStage', this.socketaddStage);
    this.$socket.client.on('addChapter', this.socketaddChapter);
    this.$socket.client.on('getKB', this.socketgetKB);
    this.$socket.client.on('getChapters', this.socketgetChapters);
    this.$socket.client.on('cloneStages', this.socketcloneStages);
    this.$socket.client.on('KBZipUploadDone', this.soketKBZipUploadDone);
    this.$socket.client.on('KBZipUploadError', this.socketKBFileUploadError);
    this.$socket.client.on('requestKBZipSlice', this.socketrequestKBZipSlice);
    this.$socket.client.on('addKB', this.socketaddKB);
    this.$socket.client.on('editKB', this.socketeditKB);
    this.$socket.client.on('removeChapter', this.socketremoveChapter);
    this.$socket.client.on('saveSort', this.socketsaveSort);
    this.$socket.client.on('removeStage', this.socketremoveStage);
    this.$socket.client.on('setChapter', this.socketsetChapter);
    this.$socket.client.on('setKB', this.socketsetKB);
    this.$socket.client.on('getStage', this.socketgetStage);
    this.$socket.client.on('KBZipReport', this.socketgetimportReport);
    this.$socket.client.on('refreshKB', this.loadKB);
    this.$socket.client.on('removeKB', this.socketremoveKB);
  }
};
</script>
