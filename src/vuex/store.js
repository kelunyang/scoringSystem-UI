import moment from 'moment';
import Vue from 'vue';
import Vuex, {Store} from "vuex";
Vue.config.productionTip = false;
Vue.config.devtools = true;

Vue.use(Vuex)

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
      version: '',
      userCheckTime: 0,
      lastCheckTime: 0,
      connectionTimeout: 1,
      siteLocation: '',
      changeLog: '**test**'
    },
    savedTags: []
  },
  mutations: {
    updateSavedTags(state, tags) {
      state.savedTags = tags;
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