import Vue from 'vue';
import Router from 'vue-router';
import store from './vuex/store';

Vue.use(Router);
const router = new Router({
  routes: [
    {
      path: '/',
      name: '首頁',
      component: () =>
        import(/* webpackChunkName: 'home', webpackPrefetch: true */ './views/Home.vue')
    },
    {
      path: '/messageMgnt',
      name: '訊息管理',
      component: () =>
        import(/* webpackChunkName: 'msgMgnt', webpackPrefetch: true */ './views/messageMgnt.vue')
    },
    {
      path: '/videoReview/:KBid',
      name: '審查頁面',
      props: true,
      component: () =>
        import(/* webpackChunkName: 'videoReview', webpackPrefetch: true */ './views/videoReview.vue')
    },
    {
      path: '/userDashBoard',
      name: 'DashBoard',
      component: () =>
        import(/* webpackChunkName: 'Dashboard', webpackPrefetch: true */ './views/userDashBoard.vue')
    },
    {
      path: '/userMgnt',
      name: '使用者管理',
      component: () =>
        import(/* webpackChunkName: 'userMgnt', webpackPrefetch: true */ './views/userMgnt.vue')
    },
    {
      path: '/setting',
      name: '系統設定',
      component: () =>
        import(/* webpackChunkName: 'setting', webpackPrefetch: true */ './views/setting.vue')
    },
    {
      path: '/user',
      name: '使用者資料',
      component: () =>
        import(/* webpackChunkName: 'user', webpackPrefetch: true */ './views/user.vue')
    },
    {
      path: '/login',
      name: '登入',
      component: () =>
        import(/* webpackChunkName: 'login', webpackPrefetch: true */ './views/Login.vue')
    },
    {
      path: '/Info',
      name: '關於本站',
      component: () =>
        import(/* webpackChunkName: 'info', webpackPrefetch: true */ './views/Info.vue')
    },
    {
      path: '/createKB',
      name: '知識點管理',
      component: () =>
        import(/* webpackChunkName: 'createKB', webpackPrefetch: true */ './views/createKB.vue')
    },
    {
      path: '/logout',
      name: '登出',
      component: () =>
          import(/* webpackChunkName: 'logout', webpackPrefetch: true */ './views/Logout.vue')
    },
    {
      path: '/Chart',
      name: '統計功能',
      component: () =>
          import(/* webpackChunkName: 'chart', webpackPrefetch: true */ './views/Chart.vue')
    }
  ]
});
router.afterEach((to) => {
  Vue.nextTick(() => {
    let DEFAULT_TITLE = store.state.siteSettings.systemName;
    let sepStr = DEFAULT_TITLE === "" ? "" : " | ";
    document.title = !('name' in to) ? DEFAULT_TITLE : to.name === null ? DEFAULT_TITLE : DEFAULT_TITLE + sepStr + to.name;
  });
});
export default router;