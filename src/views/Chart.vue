<template>
  <v-card>
    <v-card-text>
      <p>第二期工程，預計開發項目：LINE訊息發送量統計、每個人的使用紀錄、不同時期的完成量統計</p>
    </v-card-text>
  </v-card>
</template>

<script>
import Vue from 'vue';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faChartLine } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

library.add(faChartLine);
Vue.component('font-awesome-icon', FontAwesomeIcon);

export default {
  data () {
    return {
    };
  },
  created () {
    this.$emit('viewIn', {
      text: '統計圖表',
      icon: 'fa-chart-bar'
    });
  }
};
</script>
