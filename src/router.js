import Vue from 'vue';
import Router from 'vue-router';
import Home from './views/Home.vue';

Vue.use(Router);
const DEFAULT_TITLE = '臺北市學科影片線上審查系統';
const router = new Router({
  routes: [
    {
      path: '/',
      name: '首頁',
      component: Home
    },
    {
      path: '/messageMgnt',
      name: '訊息管理',
      component: () =>
        import(/* webpackChunkName: 'msgMgnt' */ './views/messageMgnt.vue')
    },
    {
      path: '/videoReview/:KBid',
      name: '審查頁面',
      props: true,
      component: () =>
        import(/* webpackChunkName: 'videoReview' */ './views/videoReview.vue')
    },
    {
      path: '/userDashBoard',
      name: 'DashBoard',
      component: () =>
        import(/* webpackChunkName: 'Dashboard' */ './views/userDashBoard.vue')
    },
    {
      path: '/userMgnt',
      name: '使用者管理',
      component: () =>
        import(/* webpackChunkName: 'userMgnt' */ './views/userMgnt.vue')
    },
    {
      path: '/setting',
      name: '系統設定',
      component: () =>
        import(/* webpackChunkName: 'setting' */ './views/setting.vue')
    },
    {
      path: '/user',
      name: '使用者資料',
      component: () =>
        import(/* webpackChunkName: 'user' */ './views/user.vue')
    },
    {
      path: '/login',
      name: '登入',
      component: () =>
        import(/* webpackChunkName: 'login' */ './views/Login.vue')
    },
    {
      path: '/Info',
      name: '關於本站',
      component: () =>
        import(/* webpackChunkName: 'info' */ './views/Info.vue')
    },
    {
      path: '/createKB',
      name: '知識點管理',
      component: () =>
        import(/* webpackChunkName: 'createKB' */ './views/createKB.vue')
    },
    {
      path: '/logout',
      name: '登出',
      component: () =>
          import(/* webpackChunkName: 'logout' */ './views/Logout.vue')
    },
    {
      path: '/Chart',
      name: '統計功能',
      component: () =>
          import(/* webpackChunkName: 'chart' */ './views/Chart.vue')
    }
  ]
});
router.afterEach((to) => {
  Vue.nextTick(() => {
    document.title = !('name' in to) ? DEFAULT_TITLE : to.name === null ? DEFAULT_TITLE : DEFAULT_TITLE + ' | ' + to.name;
  });
});
export default router;