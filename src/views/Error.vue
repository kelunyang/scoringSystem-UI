<template>
  <div class='home'>
    <font-awesome-icon icon='bug' />
    <p>發生錯誤！</p>
  </div>
</template>

<script>
// @ is an alias to /src
import Vue from 'vue';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faBug } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
library.add(faBug);
Vue.component('font-awesome-icon', FontAwesomeIcon);
Vue.config.productionTip = false;

export default {
  name: 'error',
  created () {
    this.$emit('viewIn', {
      text: '發生錯誤',
      icon: faBug
    });
  }
};
</script>
