import dayjs from 'dayjs';
import Vue from 'vue';
import Vuex, {Store} from "vuex";
import _orderBy from 'lodash/orderBy';
//import VueGtag from "vue-gtag";

Vue.config.productionTip = false;
Vue.config.devtools = false;

Vue.use(Vuex);
/*Vue.use(VueGtag, {
  config: { id: "" }  //GA
});*/

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
      lineDate: 0,
      seed: ""
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
        withAudio: false,
        validRange: [300, 600]
      },
      systemName: ''
    },
    savedTags: [],
    siteColor: '#a08b4c',
    isiOS: false,
    isIE: false,
    isSafari: false,
    isPortrait: false
  },
  mutations: {
    updateisIE(state, detect) {
      state.isIE = detect;
    },
    updateisiOS(state, detect) {
      state.isiOS = detect;
    },
    updateisPortrait(state, detect) {
      state.isPortrait = detect;
    },
    updateisSafari(state, detect) {
      state.isSafari = detect;
    },
    updateSavedTags(state, tags) {
      state.savedTags = _orderBy(tags, ['name'], ['asc']);
    },
    updateGlobalSetting(state, settings) {
      state.siteSettings = settings;
      state.siteSettings.lastCheckTime = dayjs().unix();
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