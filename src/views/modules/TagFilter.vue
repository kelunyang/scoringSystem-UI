<template>
  <v-autocomplete
    v-model="selectedItems"
    :items="candidatedItem"
    chips
    clearable
    :label="label"
    :multiple='multipleD'
    prepend-icon="fab fa-slack-hash"
    solo
    :search-input.sync="newTerm"
    item-text='name'
    item-value='_id'
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
      <v-list-item @click="emitPlus" v-if='createable'>
        <v-list-item-icon>
          <v-icon>fa-plus</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>
            點擊這裡新增： {{ newTerm }}
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-list-item v-if='!createable'>
        <v-list-item-content>
          <v-list-item-title>
            找不到： {{ newTerm }}
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </template>
  </v-autocomplete>
</template>

<script>
import '@fortawesome/fontawesome-free/css/all.css';
import _ from 'lodash';

export default {
  name: 'TagFilter',
  props: {
    label: String,
    selectedItem: [Array, String],
    candidatedItem: Array,
    createable: Boolean,
    single: Boolean,
    mustSelected: Boolean
  },
  methods: {
    test: function (item) {
      console.dir(item);
    },
    emitPlus: function () {
      this.$emit('plusItem', this.newTerm);
    },
    textConvert: function (item) {
      let found = _.find(this.candidatedItem, (element) => {
        return element._id === item._id;
      });
      return found === undefined ? '' : found.name;
    },
    removeTag: function (item) {
      if (this.multipleD) {
        if (this.mustSelected) {
          if (this.selectedItems.length > 1) {
            let found = _.find(this.candidatedItem, (element) => {
              return element._id === item._id;
            });
            if (found !== undefined) {
              this.selectedItems = this.selectedItems.filter((sitem) => {
                return sitem !== item._id;
              });
            }
          }
        } else {
          let found = _.find(this.candidatedItem, (element) => {
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
    }
  },
  watch: {
    selectedItems: function () {
      this.$emit('valueUpdated', this.selectedItems);
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
      newTerm: '',
      selectedItems: this.selectedItem,
      multipleD: !this.single
    };
  }
};
</script>
