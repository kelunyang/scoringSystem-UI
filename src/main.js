// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import './plugins/fontawesome'
import App from './App';
import router from './router';
import vuetify from '@/plugins/vuetify';
import { TiptapVuetifyPlugin } from 'tiptap-vuetify';

Vue.config.productionTip = false;

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  vuetify,
  components: { App },
  template: '<App/>',
  icons: {
    iconfont: 'faSvg'
  },
  render: h => h(App)
}).$mount('#app');
Vue.use(TiptapVuetifyPlugin, { 
  vuetify,
  iconsGroup: 'fa'
});
Vue.config.productionTip = false;
Vue.config.devtools = true;