import moment from 'moment';
import Vue from 'vue';
import Vuex, {Store} from "vuex";
import { randomColor } from 'randomcolor';
import _ from 'lodash';

Vue.config.productionTip = false;
Vue.config.devtools = false;

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
      versionFrontend: '',
      versionBackend: '',
      userCheckTime: 0,
      lastCheckTime: 0,
      connectionTimeout: 1,
      siteLocation: '',
      changeLog: '**test**'
    },
    savedTags: [],
    randomColor: '#199494'
  },
  mutations: {
    updateSiteColor(state) {
      let color = randomColor({
          luminosity: 'dark',
          format: 'hex'
      });
      state.randomColor = color;
    },
    updateSavedTags(state, tags) {
      state.savedTags = _.orderBy(tags, ['name'], ['asc']);
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