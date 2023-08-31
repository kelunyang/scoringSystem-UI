<template>
    <v-sheet>
      <v-dialog v-model='modSchemaW' fullscreen hide-overlay transition='dialog-bottom-transition'>
        <v-card>
          <v-toolbar dark color='primary'>
            <v-btn icon dark @click='modSchemaW = false'>
              <v-icon>fa-times</v-icon>
            </v-btn>
            <v-toolbar-title>修改活動</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn icon dark @click='savemodTag'>
              <v-icon>fa-cloud-upload-alt</v-icon>
            </v-btn>
          </v-toolbar>
          <v-card-text class='pa-0 ma-0 text-left black--text text-body-1'>
            <v-container class='pa-5'>
              <v-row>
                <v-col class='d-flex flex-column'>
                  <v-text-field outlined clearable dense label='活動名稱' v-model='defaultSchema.name'></v-text-field>
                  <div class='text-subtitle-2 font-weight-blod'>不可跨標籤</div>
                  <v-switch
                    v-model="defaultSchema.tagGroupped"
                    label="如果不可跨標籤，就代表使用者只能看到和自己同標籤的組（通常一個標籤對應一個班）"
                  ></v-switch>
                  <div class='text-subtitle-2 font-weight-blod'>活動主管群（可以用以下的群組來過濾）</div>
                  <tag-filter
                    :mustSelected='true'
                    :single='false'
                    @updateTags='updateTags'
                    :selectedItem='supervisorTags'
                    @valueUpdated='updatesupervisorTags'
                    :candidatedItem='savedTags'
                    :createable='false'
                    label='請在此輸入你要篩選的用戶標籤，該標籤的用戶會顯示在下面'
                  />
                  <tag-filter
                    :mustSelected='true'
                    :single='false'
                    :selectedItem='defaultSchema.supervisors'
                    @valueUpdated='updatesupervisors'
                    :candidatedItem='savedUsers'
                    @updateTags='updateUsers'
                    :createable='false'
                    label='請輸入用戶名稱'
                  />
                  <div class='text-subtitle-2 font-weight-blod'>獎勵點數預設值</div>
                  <v-slider
                    :label='"獎勵點數為"+defaultSchema.initCapital+"點"'
                    :min='100'
                    :max='10000'
                    v-model="defaultSchema.initCapital"
                    thumb-label
                  ></v-slider>
                  <div class='text-subtitle-2 font-weight-blod'>組員的回饋點數比例</div>
                  <v-slider
                    :label='"回饋比例為["+defaultSchema.memberRate+"倍]"'
                    :min='1'
                    :max='10'
                    v-model="defaultSchema.memberRate"
                    thumb-label
                  ></v-slider>
                  <div class='text-subtitle-2 font-weight-blod'>組長的回饋點數比例</div>
                  <v-slider
                    :label='"回饋比例為[" + defaultSchema.leaderRate + "倍]"'
                    :min='1'
                    :max='10'
                    v-model="defaultSchema.leaderRate"
                    thumb-label
                  ></v-slider>
                  <div class='text-subtitle-2 font-weight-blod'>實際工作者的回饋點數比例</div>
                  <v-slider
                    :label='"回饋比例為[" + defaultSchema.workerRate + "倍]"'
                    :min='1'
                    :max='10'
                    v-model="defaultSchema.workerRate"
                    thumb-label
                  ></v-slider>
                  <div class='text-subtitle-2 font-weight-blod'>評分做空獎勵倍率</div>
                  <v-slider
                    :label='"獎勵倍率為[" + defaultSchema.shortBonus + "倍]"'
                    :min='1'
                    :max='10'
                    v-model="defaultSchema.shortBonus"
                    thumb-label
                  ></v-slider>
                  <div class='text-subtitle-2 font-weight-blod'>自動評分啟動標準（當你的組數小於你設定的值的時候，會改用組數）</div>
                  <v-slider
                    :label='"["+Math.floor(defaultSchema.gapRate * 100)+"%]的組評分就會自動評分"'
                    :min='0.1'
                    :max='1'
                    step='0.1'
                    v-model="defaultSchema.gapRate"
                    thumb-label
                  ></v-slider>
                  <v-btn @click='savemodSchema'>
                    儲存修改
                  </v-btn>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
        </v-card>
      </v-dialog>
      <v-dialog v-model='addSchemaW' fullscreen hide-overlay transition='dialog-bottom-transition'>
        <v-card>
          <v-toolbar dark color='primary'>
            <v-btn icon dark @click='addSchemaW = false'>
              <v-icon>fa-times</v-icon>
            </v-btn>
            <v-toolbar-title>新增活動</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn icon dark @click='plusTag'>
              <v-icon>fa-cloud-upload-alt</v-icon>
            </v-btn>
          </v-toolbar>
          <v-card-text class='ma-0 pa-0'>
            <v-container class='pa-5'>
              <v-row>
                <v-col class='d-flex flex-column'>
                  <v-text-field outlined clearable dense label='活動名稱' v-model='defaultSchema.name'></v-text-field>
                  <div class='text-subtitle-2 font-weight-blod'>不可跨標籤</div>
                  <v-switch
                    v-model="defaultSchema.tagGroupped"
                    label="如果不可跨標籤，就代表使用者只能看到和自己同標籤的組（通常一個標籤對應一個班）"
                  ></v-switch>
                  <div class='text-subtitle-2 font-weight-blod'>活動主管群（可以用以下的群組來過濾）</div>
                  <tag-filter
                    :mustSelected='true'
                    :single='false'
                    @updateTags='updateTags'
                    :selectedItem='supervisorTags'
                    @valueUpdated='updatesupervisorTags'
                    :candidatedItem='savedTags'
                    :createable='false'
                    label='請在此輸入你要篩選的用戶標籤，該標籤的用戶會顯示在下面'
                  />
                  <tag-filter
                    :mustSelected='true'
                    :single='false'
                    :selectedItem='defaultSchema.supervisors'
                    @valueUpdated='updatesupervisors'
                    :candidatedItem='savedUsers'
                    @updateTags='updateUsers'
                    :createable='false'
                    label='請用戶名稱'
                  />
                  <div class='text-subtitle-2 font-weight-blod'>初始點數</div>
                  <v-slider
                    :label='"初始點數為"+defaultSchema.initCapital+"點"'
                    :min='100'
                    :max='10000'
                    v-model="defaultSchema.initCapital"
                    thumb-label
                  ></v-slider>
                  <div class='text-subtitle-2 font-weight-blod'>組員的回饋點數比例</div>
                  <v-slider
                    :label='"回饋比例為["+defaultSchema.memberRate+"倍]"'
                    :min='1'
                    :max='10'
                    v-model="defaultSchema.memberRate"
                    thumb-label
                  ></v-slider>
                  <div class='text-subtitle-2 font-weight-blod'>組長的回饋點數比例</div>
                  <v-slider
                    :label='"回饋比例為[" + defaultSchema.leaderRate + "倍]"'
                    :min='1'
                    :max='10'
                    v-model="defaultSchema.leaderRate"
                    thumb-label
                  ></v-slider>
                  <div class='text-subtitle-2 font-weight-blod'>實際工作者的回饋點數比例</div>
                  <v-slider
                    :label='"回饋比例為[" + defaultSchema.workerRate + "倍]"'
                    :min='1'
                    :max='10'
                    v-model="defaultSchema.workerRate"
                    thumb-label
                  ></v-slider>
                  <div class='text-subtitle-2 font-weight-blod'>評分做空獎勵倍率</div>
                  <v-slider
                    :label='"獎勵倍率為[" + defaultSchema.shortBonus + "倍]"'
                    :min='1'
                    :max='10'
                    v-model="defaultSchema.shortBonus"
                    thumb-label
                  ></v-slider>
                  <div class='text-subtitle-2 font-weight-blod'>自動評分啟動標準（當你的組數小於你設定的值的時候，會改用組數）</div>
                  <v-slider
                    :label='"["+Math.floor(defaultSchema.gapRate * 100)+"%]的組評分就會自動評分"'
                    :min='0.1'
                    :max='1'
                    step='0.1'
                    v-model="defaultSchema.gapRate"
                    thumb-label
                  ></v-slider>
                  <v-btn @click='createSchema'>
                    新增活動
                  </v-btn>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
        </v-card>
      </v-dialog>
      <v-speed-dial style='margin-bottom: 80px' v-model="functionBtn" fixed bottom right direction="left" :open-on-hover="true" transition="slide-x-reverse-transition">
        <template v-slot:activator>
          <v-btn
            v-model="functionBtn"
            color="#006064"
            dark
            fab
          >
            <v-icon v-if="functionBtn">fa-chevron-left</v-icon>
            <v-icon v-else>fa-tools</v-icon>
          </v-btn>
        </template>
        <v-badge
          color="red"
          overlap
          :content='selectedSchemas.length'
          :value='selectedSchemas.length'
        >
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                v-bind="attrs" v-on="on"
                fab
                dark
                small
                color="deep-orange darken-4"
                @click.stop='selectAllTags'
              >
                <v-icon v-if='selectedSchemas.length > 0'>far fa-circle</v-icon>
                <v-icon v-if='selectedSchemas.length === 0'>far fa-check-circle</v-icon>
              </v-btn>
            </template>
            <span v-if='selectedSchemas.length > 0'>清除全部選擇的活動</span>
            <span v-if='selectedSchemas.length === 0'>選擇全部篩選的活動</span>
          </v-tooltip>
        </v-badge>
        <v-badge
          color="red"
          overlap
          :content='selectedSchemas.length'
          :value='selectedSchemas.length'
          v-if='selectedSchemas.length > 0'
        >
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                v-bind="attrs" v-on="on"
                fab
                dark
                small
                color="deep-orange darken-4"
                @click.stop='removeSchema(undefined, true)'
              >
                <v-icon>fas fa-eye</v-icon>
              </v-btn>
            </template>
            <span>顯示所選{{ selectedSchemas.length }}個活動</span>
          </v-tooltip>
        </v-badge>
        <v-badge
          color="red"
          overlap
          :content='selectedSchemas.length'
          :value='selectedSchemas.length'
          v-if='selectedSchemas.length > 0'
        >
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                v-bind="attrs" v-on="on"
                fab
                dark
                small
                color="deep-orange darken-4"
                @click.stop='removeSchema(undefined, false)'
              >
                <v-icon>fas fa-eye-slash</v-icon>
              </v-btn>
            </template>
            <span>隱藏所選{{ selectedSchemas.length }}個活動</span>
          </v-tooltip>
        </v-badge>
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              fab
              dark
              small
              color="indigo"
              @click.stop='addSchema'
              v-bind="attrs" v-on="on"
            >
              <v-icon>fa-plus</v-icon>
            </v-btn>
          </template>
          <span>新增活動</span>
        </v-tooltip>
      </v-speed-dial>
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
              @click.stop='statusfilterSwitcher()'
              v-bind="attrs" v-on="on"
            >
              <v-icon v-if='statusFilter === undefined'>fa-play</v-icon>
              <v-icon v-if='statusFilter === 0'>fa-square</v-icon>
              <v-icon v-if='statusFilter === 1'>fa-times</v-icon>
            </v-btn>
          </template>
          <span v-if='statusFilter === undefined'>顯示活動中的項目</span>
          <span v-if='statusFilter === 0'>顯示已結束的項目</span>
          <span v-if='statusFilter === 1'>關閉狀態過濾器</span>
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
        <v-list-item>
          <v-list-item-content class="text-left">
            <v-list-item-title>
              <span v-if='item.status === 1'>[進行中]</span>
              <span v-else>[已結束]</span>
              {{ item.name }}
            </v-list-item-title>
            <v-list-item-subtitle>
              <span>{{ item.stages.length }}個回合</span>
              <span> | {{ item.groups.length }}個組參與</span>
              <span>建立於{{ dateConvert(item.createTick) }}</span>
              <span v-if='item.modTick > 0'> | 修改於{{ dateConvert(item.modTick) }}</span>
            </v-list-item-subtitle>
          </v-list-item-content>
          <v-list-item-action class='d-flex flex-row'>
            <v-btn @click='statusSchema(item)'>
              <span v-if='item.status === 1'>結束活動</span>
              <span v-else>開始活動</span>
            </v-btn>
            <v-btn @click='getSchemaSupervisors(item)'>
              編輯活動
            </v-btn>
            <v-menu
              offset-y
              attach
              left
              bottom
              transition="slide-y-transition"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  v-bind="attrs" v-on="on"
                >
                  刪除活動
                </v-btn>
              </template>
              <v-sheet class='d-flex flex-column pa-1'>
                <div class='text-h6'>確認刪除活動？</div>
                <v-btn
                  class='white--text ma-1'
                  color='red darken-4'
                  @click='removeSchema(item)'
                >
                  是，我要刪除活動！
                </v-btn>
                <div class='text-caption'>如果你只是誤觸，請隨意點擊其他地方即會關閉本對話框</div>
              </v-sheet>
            </v-menu>
            <v-checkbox off-icon="far fa-square" on-icon="fa-check-square" v-model='selectedSchemas' :value='item._id'></v-checkbox>
          </v-list-item-action>
        </v-list-item>
      </v-lazy>
    </v-sheet>
</template>

<script>
// @ is an alias to /src
import dayjs from 'dayjs';
import _map from 'lodash/map';
import _unionWith from 'lodash/unionWith';
import _intersectionWith from 'lodash/intersectionWith';

export default {
    name: 'schMgnt',
    beforeDestroy () {
      this.$socket.client.off('statusSchema', this.socketstatusSchema);
      this.$socket.client.off('getSchemas', this.socketgetSchemas);
      this.$socket.client.off('addSchema', this.socketaddSchema);
      this.$socket.client.off('modSchema', this.socketmodSchema);
      this.$socket.client.off('getSelectedUsers', this.socketgetSupervisors);
      this.$socket.client.off('removeSchema', this.socketremoveSchema);
      this.$socket.client.off('getTagUsers', this.socketgetTagUsers);
    },
    components: { 
      TagFilter: () => import(/* webpackChunkName: 'TagFilter', webpackPrefetch: true */ './modules/TagFilter'),
    },
    created () {
      this.$emit('viewIn', {
        text: '活動管理',
        icon: 'fa-calendar-alt',
        module: '活動模組',
        location: '/tagMgnt'
      });
      this.$socket.client.emit('getSchemas', { status: this.statusFilter });
      this.$socket.client.on('statusSchema', this.socketstatusSchema);
      this.$socket.client.on('getSchemas', this.socketgetSchemas);
      this.$socket.client.on('addSchema', this.socketaddSchema);
      this.$socket.client.on('modSchema', this.socketmodSchema);
      this.$socket.client.on('getSelectedUsers', this.socketgetSupervisors);
      this.$socket.client.on('removeSchema', this.socketremoveSchema);
      this.$socket.client.on('getTagUsers', this.socketgetTagUsers);
    },
    computed: {
      savedTags: function () {
        return this.$store.state.savedTags;
      }
    },
    methods: {
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
      socketaddSchema: function (data) {
        this.$socket.client.emit('getSchemas', { status: this.statusFilter });
        this.$emit('toastPop', data ? '新增完成' : '新增失敗，該活動已重複');
        this.addSchemaW = false;
      },
      socketmodSchema: function () {
        this.$socket.client.emit('getSchemas', { status: this.statusFilter });
        this.$emit('toastPop', '修改完成');
        this.modSchemaW = false;
      },
      socketremoveSchema: function () {
        this.$socket.client.emit('getSchemas', { status: this.statusFilter });
        this.$emit('toastPop', '刪除完成');
      },
      socketstatusSchema: function () {
        this.$socket.client.emit('getSchemas', { status: this.statusFilter });
        this.$emit('toastPop', '修改完成');
      },
      socketgetSchemas: function (data) {
        this.schemaList = data;
        this.selectedSchemas = [];
        this.termQuery();
      },
      statusSchema: function (item) {
        this.$socket.client.emit('statusSchema', {
          sid: item._id,
          status: !item.status
        });
      },
      createSchema: function () {
        this.$socket.client.emit('addSchema', this.defaultSchema);
      },
      termQuery: function () {
        this.schemafilteredList = this.schemaList.filter((item) => {
          let regex = new RegExp(this.queryTerm, 'g');
          return regex.test(item.name);
        });
      },
      savemodSchema: function () {
        this.$socket.client.emit('modSchema', this.defaultSchema);
      },
      getSchemaSupervisors: function(item) {
        this.defaultSchema = item;
        this.modSchemaW = true;
        this.$socket.client.emit('getSelectedUsers', {
          users: item.supervisors,
          type: 0
        });
      },
      socketgetSupervisors: function(data) {
        if(data.type === 0) {
          this.savedUsers = data.users;
        }
      },
      addSchema: function() {
        this.defaultSchema = {
          name: "",
          _id: "",
          createTick: 0,
          modTick: 0,
          supervisors: [],
          groups: [],
          stages: [],
          initCapital: 0,
          status: 0,
          memberRate: 0,
          workerRate: 0,
          leaderRate: 0,
          shortBonus: 0,
          gapRate: 0
        }
        this.addSchemaW = true;
      },
      removeSchema: function(item) {
        this.$socket.client.emit('removeSchema', item);
      },
      statusfilterSwitcher: function() {
        if(this.statusFilter === undefined) {
          this.statusFilter = 0;
        } else if(this.statusFilter === 0) {
          this.statusFilter = 1;
        } else if(this.statusFilter === 1) {
          this.statusFilter === undefined;
        }
        this.$socket.client.emit('getSchemas', { status: this.statusFilter });
      },
      updatesupervisorTags: function(value) {
        this.supervisorTags = value;
        this.$socket.client.emit('getTagUsers', this.supervisorTags);
      },
      updatesupervisors: function(value) {
        this.defaultSchema.supervisors = value;
      },
      updateUsers: function() {
        this.$socket.client.emit('getTagUsers', this.supervisorTags);
      },
      updateTags: function() {
        this.$emit('updateTags');
      },
      socketgetTagUsers: function(data) {
        let selectedSaved = _intersectionWith(this.savedUsers, this.defaultSchema.supervisors, (user, supervisor) => {
          return user._id === supervisor;
        });
        this.savedUsers = _unionWith(data.result, selectedSaved, (a,b) => {
          return a._id === b._id;
        });
      }
    },
    data () {
      return {
        savedUsers: [],
        supervisorTags: [],
        statusFilter: undefined,
        queryTerm: '',
        schemaList: [],
        schemafilteredList: [],
        modSchemaW: false,
        addSchemaW: false,
        selectedSchemas: [],
        defaultSchema: {
          gapRate: 10,
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
          shortBonus: 0
        }
      };
    }
};
</script>
