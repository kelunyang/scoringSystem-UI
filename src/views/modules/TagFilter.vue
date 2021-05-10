<template>
  <div class='d-flex flex-row'>
    <div class='d-flex flex-row flex-grow-1' v-if='addMode'>
      <v-text-field
        label="請輸入你想新增的標籤"
        placeholder="輸入完成後，請按右側的雲朵圖案儲存標籤"
        v-model='newTagAwaited'
        class='flex-grow-1'
        outlined clearable dense
      ></v-text-field>
    <v-tooltip bottom>
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          class='flex-shrink-1 flex-grow-0 ma-1'
          v-bind="attrs" v-on="on"
          outlined
          icon
          @click="addnewTag"
        >
          <v-icon>fas fa-cloud-upload-alt</v-icon>
        </v-btn>
      </template>
      <span>新增標籤</span>
    </v-tooltip>
    </div>
    <v-autocomplete
      v-if='!addMode'
      v-model="selectedItems"
      :items="filteredItems"
      chips
      clearable dense
      :label="label"
      :multiple='multipleD'
      prepend-icon="fab fa-slack-hash"
      outlined
      :search-input.sync="newTerm"
      item-text='name'
      item-value='_id'
      class='flex-grow-1'
    >
      <template v-slot:item='data'>
        <v-list-item v-bind='data.attrs' v-on='data.on'>
          <template v-slot:default="{ active }">
            <v-list-item-icon>
              <v-icon v-if='active'>far fa-check-square</v-icon>
              <v-icon v-else>far fa-square</v-icon>
            </v-list-item-icon>
            <v-list-item-content class='text-left'>{{ data.item.name }}</v-list-item-content>
          </template>
        </v-list-item>
      </template>
      <template v-slot:selection="data">
        <v-chip
          v-bind="data.attrs"
          :input-value="data.item"
          close
          close-icon="fa-times"
          @click:close="removeTag(data.item)"
        >
          <strong>{{ textConvert(data.item) }}</strong>
        </v-chip>
      </template>
      <template v-slot:no-data>
        <v-list-item v-if='newTerm === ""'>
          <v-list-item-icon>
            <v-icon>fas fa-sync-alt</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>
              請輸入點什麼讓系統可以反查
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item v-else>
          <v-list-item-icon>
            <v-icon v-if='createable'>fas fa-hand-point-right</v-icon>
            <v-icon v-if='!createable'>fas fa-times</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>
              找不到：「 {{ newTerm }}」<span v-if='createable'>，請點右側加號新增</span>
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </template>
    </v-autocomplete>
    <v-tooltip bottom v-if='createable'>
      <template v-slot:activator="{ on, attrs }">
        <v-btn
         v-bind="attrs" v-on="on"
         outlined
         icon
         @click='addMode = !addMode'
         class='ma-1'
        >
          <v-icon v-if='!addMode'>fas fa-plus</v-icon>
          <v-icon v-if='addMode'>fas fa-search</v-icon>
        </v-btn>
      </template>
      <span v-if='!addMode'>新增標籤</span>
      <span v-if='addMode'>回到搜尋模式</span>
    </v-tooltip>
  </div>
</template>

<script>
import _find from 'lodash/find';
import _filter from 'lodash/filter';
import _intersectionWith from 'lodash/intersectionWith';
import _unionWith from 'lodash/unionWith';

export default {
  name: 'TagFilter',
  props: {
    label: String,
    candidatedItem: Array,
    selectedItem: [Array, String],
    createable: Boolean,
    single: Boolean,
    mustSelected: Boolean
  },
  methods: {
    textConvert: function (item) {
      let found = _find(this.candidatedItem, (element) => {
        return element._id === item._id;
      });
      return found === undefined ? '' : found.name;
    },
    removeTag: function (item) {
      if (this.multipleD) {
        if (this.mustSelected) {
          if (this.selectedItems.length > 1) {
            let found = _find(this.candidatedItem, (element) => {
              return element._id === item._id;
            });
            if (found !== undefined) {
              this.selectedItems = this.selectedItems.filter((sitem) => {
                return sitem !== item._id;
              });
            }
          }
        } else {
          let found = _find(this.candidatedItem, (element) => {
            return element._id === item._id;
          });
          if (found !== undefined) {
            this.selectedItems = this.selectedItems.filter((sitem) => {
              return sitem !== item._id;
            });
          }
        }
      } else {
        if (!this.mustSelected) {
          if(this.selectedItems === item._id) {
            this.selectedItems = '';
          }
        }
      }
    },
    queryTags: function () {
      this.loading = true;
      this.$emit('updateTags');
    },
    addnewTag: function () {
      this.$emit('plusItem', this.newTagAwaited);
    }
  },
  watch: {
    candidatedItem: {
      immediate: true,
      handler () {
        let searchItem = _filter(this.candidatedItem, (item) => {
          return (new RegExp(this.newTerm, 'g')).test(item.name);
        });
        let passedsItems = this.multipleD ? this.selectedItems : [this.selectedItems];
        let selectedItem = _intersectionWith(this.candidatedItem, passedsItems, (cItem, sItem) => {
          return cItem._id === sItem;
        });
        this.filteredItems = _unionWith(searchItem, selectedItem, (qItem, sItem) => {
          return qItem._id === sItem._id;
        });
        this.loading = false;
      }
    },
    newTerm: function () {
      if(this.newTerm !== '') {
        let selected = _filter(this.selectedItems, (item) => {
          return this.newTerm === item.name;
        });
        if(selected.length === 0) {
          this.queryTags();
        }
      }
    },
    selectedItems: function () {
      this.$emit('valueUpdated', this.selectedItems);
      let searchItem = _filter(this.candidatedItem, (item) => {
        return (new RegExp(this.newTerm, 'g')).test(item.name);
      });
      let passedsItems = this.multipleD ? this.selectedItems : [this.selectedItems];
      let selectedItem = _intersectionWith(this.candidatedItem, passedsItems, (cItem, sItem) => {
        return cItem._id === sItem;
      });
      this.filteredItems = _unionWith(searchItem, selectedItem, (qItem, sItem) => {
        return qItem._id === sItem._id;
      });
    },
    selectedItem: {
      immediate: true,
      handler () {
        this.selectedItems = this.selectedItem;
      }
    },
    single: {
      immediate: true,
      handler () {
        this.multipleD = !this.single;
      }
    }
  },
  data () {
    return {
      newTagAwaited: '',
      addMode: false,
      filteredItems: [],
      newTerm: '',
      selectedItems: this.selectedItem,
      multipleD: !this.single
    };
  }
};
</script>
