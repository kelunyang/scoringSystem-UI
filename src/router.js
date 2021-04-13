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
        import(/* webpackChunkName: 'about' */ './views/messageMgnt.vue')
    },
    {
      path: '/videoReview/:KBid',
      name: '審查頁面',
      props: true,
      component: () =>
        import(/* webpackChunkName: 'about' */ './views/videoReview.vue')
    },
    {
      path: '/userDashBoard',
      name: 'DashBoard',
      component: () =>
        import(/* webpackChunkName: 'about' */ './views/userDashBoard.vue')
    },
    {
      path: '/userMgnt',
      name: '使用者管理',
      component: () =>
        import(/* webpackChunkName: 'about' */ './views/userMgnt.vue')
    },
    {
      path: '/setting',
      name: '系統設定',
      component: () =>
        import(/* webpackChunkName: 'about' */ './views/setting.vue')
    },
    {
      path: '/user',
      name: '使用者資料',
      component: () =>
        import(/* webpackChunkName: 'about' */ './views/user.vue')
    },
    {
      path: '/login',
      name: '登入',
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () =>
        import(/* webpackChunkName: 'about' */ './views/Login.vue')
    },
    {
      path: '/Info',
      name: '關於本站',
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () =>
        import(/* webpackChunkName: 'about' */ './views/Info.vue')
    },
    {
      path: '/createKB',
      name: '知識點管理',
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () =>
        import(/* webpackChunkName: 'about' */ './views/createKB.vue')
    },
    {
      path: '/logout',
      name: '登出',
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () =>
          import(/* webpackChunkName: 'about' */ './views/Logout.vue')
    },
    {
      path: '/Chart',
      name: '統計功能',
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () =>
          import(/* webpackChunkName: 'about' */ './views/Chart.vue')
    }
  ]
});
router.afterEach((to) => {
  Vue.nextTick(() => {
    document.title = !('name' in to) ? DEFAULT_TITLE : to.name === null ? DEFAULT_TITLE : DEFAULT_TITLE + ' | ' + to.name;
  });
});
export default router;