<template>
    <v-sheet>
      <v-dialog v-model='modTagW' fullscreen hide-overlay transition='dialog-bottom-transition'>
        <v-card>
          <v-toolbar dark color='primary'>
            <v-btn icon dark @click='modTagW = false'>
              <v-icon>fa-times</v-icon>
            </v-btn>
            <v-toolbar-title>修改標籤</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn icon dark @click='savemodTag'>
              <v-icon>fa-cloud-upload-alt</v-icon>
            </v-btn>
          </v-toolbar>
          <v-card-text class='pa-0 ma-0 text-left black--text text-body-1'>
            <v-container class='pa-5'>
              <v-row>
                <v-col class='pa-0 d-flex flex-column align-items-center'>
                  <div class="text-body-2 font-weight-bold">標籤創建於： {{ dateConvert(defaultTag.tick) }} </div>
                  <div class="text-body-2 font-weight-bold" v-if='defaultTag.modTick > 0'>標籤修改於： {{ dateConvert(defaultTag.modTick) }} </div>
                  <v-text-field outlined clearable dense label='標籤名稱' v-model='defaultTag.name'></v-text-field>
                  <v-btn @click='savemodTag'>
                    儲存設定
                  </v-btn>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
        </v-card>
      </v-dialog>
      <v-dialog v-model='addTagW' fullscreen hide-overlay transition='dialog-bottom-transition'>
        <v-card>
          <v-toolbar dark color='primary'>
            <v-btn icon dark @click='addTagW = false'>
              <v-icon>fa-times</v-icon>
            </v-btn>
            <v-toolbar-title>新增標籤</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn icon dark @click='plusTag'>
              <v-icon>fa-cloud-upload-alt</v-icon>
            </v-btn>
          </v-toolbar>
          <v-card-text class='ma-0 pa-0'>
            <v-container class='pa-5'>
              <v-row>
                <v-col class='d-flex flex-column'>
                  <v-text-field outlined clearable dense label='標籤名稱' v-model='defaultTag.name'></v-text-field>
                  <v-btn @click='plusTag'>
                    儲存設定
                  </v-btn>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
        </v-card>
      </v-dialog>
      <v-speed-dial v-model="functionBtn" fixed bottom right direction="left" :open-on-hover="true" transition="slide-x-reverse-transition">
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
          :content='selectedTags.length'
          :value='selectedTags.length'
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
                <v-icon v-if='selectedTags.length > 0'>far fa-circle</v-icon>
                <v-icon v-if='selectedTags.length === 0'>far fa-check-circle</v-icon>
              </v-btn>
            </template>
            <span v-if='selectedTags.length > 0'>清除全部選擇的標籤</span>
            <span v-if='selectedTags.length === 0'>選擇全部篩選的標籤</span>
          </v-tooltip>
        </v-badge>
        <v-badge
          color="red"
          overlap
          :content='selectedTags.length'
          :value='selectedTags.length'
          v-if='selectedTags.length > 0'
        >
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                v-bind="attrs" v-on="on"
                fab
                dark
                small
                color="deep-orange darken-4"
                @click.stop='visTag(undefined, true)'
              >
                <v-icon>fas fa-eye</v-icon>
              </v-btn>
            </template>
            <span>顯示所選{{ selectedTags.length }}個標籤</span>
          </v-tooltip>
        </v-badge>
        <v-badge
          color="red"
          overlap
          :content='selectedTags.length'
          :value='selectedTags.length'
          v-if='selectedTags.length > 0'
        >
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                v-bind="attrs" v-on="on"
                fab
                dark
                small
                color="deep-orange darken-4"
                @click.stop='visTag(undefined, false)'
              >
                <v-icon>fas fa-eye-slash</v-icon>
              </v-btn>
            </template>
            <span>隱藏所選{{ selectedTags.length }}個標籤</span>
          </v-tooltip>
        </v-badge>
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
                <v-btn
                    fab
                    dark
                    small
                    color="indigo"
                    @click.stop='addTag'
                    v-bind="attrs" v-on="on"
                >
                    <v-icon>fa-plus</v-icon>
                </v-btn>
            </template>
            <span>新增標籤</span>
          </v-tooltip>
      </v-speed-dial>
      <div class='d-flex flex-row'>
        <v-text-field outlined clearable dense class='flex-grow-1' label='搜尋關鍵字' prepend-icon='fa-search' v-model='queryTerm' hint='系統會針對標籤名稱進行關鍵字搜尋（可使用正規表達式）'></v-text-field>
        <v-btn color='indigo darken-4' class='white--text ma-1' @click="termQuery">搜尋</v-btn>
        <v-btn color="brown darken-4" class='white--text ma-1' @click="tagfilteredList = tagList">清除</v-btn>
      </div>
      <div class='blue-grey--text darken-1 text-caption'>已篩選出{{ tagfilteredList.length }}個標籤，為節省資源，不會全部展現出來，往下滑會載入更多</div>
      <v-lazy
        :options="{
          threshold: 0.5
        }"
        min-height="70"
        transition="fade-transition"
        v-for='item in tagfilteredList' :key='item._id'
      >
        <v-list-item>
          <v-list-item-content class="text-left">
            <v-list-item-title>
              <span v-if='item.visibility'>[顯示]</span>
              <span v-else>[隱藏]</span>
              {{ item.name }}
            </v-list-item-title>
            <v-list-item-subtitle>
              <span>建立於{{ dateConvert(item.tick) }}</span>
              <span v-if='item.modTick > 0'> | 修改於{{ dateConvert(item.modTick) }}</span>
            </v-list-item-subtitle>
          </v-list-item-content>
          <v-list-item-action class='d-flex flex-row'>
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn icon v-bind="attrs" v-on="on" @click='modTag(item)'>
                  <v-icon>fa-pencil-alt</v-icon>
                </v-btn>
              </template>
              <span>編輯名稱</span>
            </v-tooltip>
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn icon v-bind="attrs" v-on="on" @click='visTag(item)'>
                  <v-icon v-if='item.visibility'>fa-eye-slash</v-icon>
                  <v-icon v-else>fa-eye</v-icon>
                </v-btn>
              </template>
              <span v-if='item.visibility'>隱藏標籤</span>
              <span v-else>隱藏標籤</span>
            </v-tooltip>
            <v-checkbox off-icon="far fa-square" on-icon="fa-check-square" v-model='selectedTags' :value='item._id'></v-checkbox>
          </v-list-item-action>
        </v-list-item>
      </v-lazy>
    </v-sheet>
</template>

<script>
// @ is an alias to /src
import dayjs from 'dayjs';
import _map from 'lodash/map';

export default {
    name: 'tagMgnt',
    beforeDestroy () {
      this.$socket.client.off('getTags');
      this.$socket.client.off('addTag');
      this.$socket.client.off('setTagname');
      this.$socket.client.off('setTagvis');
    },
    created () {
      this.$emit('viewIn', {
        text: '標籤管理',
        icon: 'fa-users-cog',
        module: '標籤模組',
        location: '/tagMgnt'
      });
      this.$socket.client.emit('getTags');
      this.$socket.client.on('getTags', this.socketgetTags);
      this.$socket.client.on('addTag', this.socketaddTag);
      this.$socket.client.on('setTagname', this.socketsetTagname);
      this.$socket.client.on('setTagvis', this.socketsetTagvis);
    },
    methods: {
      dateConvert: function (time) {
        return time === 0 ? '尚未設定' : dayjs.unix(time).format('YYYY/MM/DD HH:mm:ss');
      },
      selectAllTags: function () {
        if(this.selectedTags.length > 0) {
          this.selectedTags = [];
        } else {
          this.selectedTags = _map(this.tagfilteredList, '_id');
        }
      },
      socketaddTag: function (data) {
        this.$emit('toastPop', data ? '新增完成' : '新增失敗，該標籤已重複');
        this.addTagW = false;
      },
      socketsetTagname: function () {
        this.$emit('toastPop', '修改完成');
        this.modTagW = false;
      },
      socketsetTagvis: function () {
        this.$emit('toastPop', '修改完成');
      },
      socketgetTags: function (data) {
        this.tagList = data;
        this.selectedTags = [];
        this.termQuery();
      },
      plusTag: function () {
        this.$emit('addTag', this.defaultTag.name);
      },
      termQuery: function () {
        this.tagfilteredList = this.tagList.filter((item) => {
          let regex = new RegExp(this.queryTerm, 'g');
          return regex.test(item.name) || regex.test(item.email) || regex.test(item.unit);
        });
      },
      savemodTag: function () {
        this.$socket.client.emit('setTagname', {
          _id: this.defaultTag._id,
          name: this.defaultTag.name
        });
      },
      modTag: function(item) {
        this.defaultTag = item;
        this.modTagW = true;
      },
      addTag: function() {
        this.defaultTag = {
          name: "",
          _id: "",
          tick: "",
          modTick: ""
        }
        this.addTagW = true;
      },
      visTag: function(item, status) {
        if(item === undefined) {
          if(this.selectedTags.length > 0) {
            this.$socket.client.emit('setTagvis', {
              tags: this.selectedTags,
              vis: status
            });
          }
        } else {
          this.$socket.client.emit('setTagvis', {
            tags: [item._id],
            vis: !item.visibility
          });
        }
      }
    },
    data () {
      return {
        queryTerm: '',
        tagList: [],
        tagfilteredList: [],
        modTagW: false,
        addTagW: false,
        selectedTags: [],
        defaultTag: {
          _id: "",
          name: "",
          modTick: 0,
          tick: 0
        }
      };
    }
};
</script>
