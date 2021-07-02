import moment from 'moment';
import Vue from 'vue';
import Vuex, {Store} from "vuex";
import _orderBy from 'lodash/orderBy';
import VueGtag from "vue-gtag";

Vue.config.productionTip = false;
Vue.config.devtools = false;

Vue.use(Vuex);
Vue.use(VueGtag, {
  config: { id: "G-HJFFVTFX4X" }  //CooC GA
});

const store = new Store({
  state: {
    currentUser: {
      _id: '',
      tags: [],
      types: 'bottts',
      name: 'undefined',
      unit: 'undefined',
      email: 'undefined@undefined.com',
      createDate: 0,
      modDate: 0,
      lineDate: 0
    },
    siteSettings: {
      version: {
        frontend: '',
        backend: '',
        bot: ''
      },
      repos: {
        frontend: '',
        backend: '',
        bot: ''
      },
      userCheckTime: 0,
      lastCheckTime: 0,
      connectionTimeout: 1,
      siteLocation: '',
      changeLog: '**test**',
      validFormat: {
        validWidth: 1024,
        validHeight: 768,
        withAudio: false
      },
      systemName: ''
    },
    savedTags: [],
    siteColor: '#15858A'
  },
  mutations: {
    updateSavedTags(state, tags) {
      state.savedTags = _orderBy(tags, ['name'], ['asc']);
    },
    updateGlobalSetting(state, settings) {
      state.siteSettings = settings;
      state.siteSettings.lastCheckTime = moment().unix();
    },
    updateUser(state, user) {
      if(user === null) {
        state.currentUser = {
          _id: '',
          tags: [],
          types: 'bottts',
          name: 'undefined',
          unit: 'undefined',
          email: 'undefined@undefined.com',
          createDate: 0,
          modDate: 0,
          lineDate: 0
        }
      } else {
        state.currentUser = user;
      }
    }
  }
})

export default store;