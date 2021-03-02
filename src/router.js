import Vue from 'vue';
import Router from 'vue-router';
import Home from './views/Home.vue';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      meta: { auth: true },
      component: Home
    },
    {
      path: '/error',
      name: 'error',
      meta: { auth: true },
      component: () =>
        import(/* webpackChunkName: 'about' */ './views/Error.vue')
    },
    {
      path: '/videoProp',
      name: 'videoProp',
      meta: { auth: true },
      component: () =>
        import(/* webpackChunkName: 'about' */ './views/videoProp.vue')
    },
    {
      path: '/messageMgnt',
      name: 'messageMgnt',
      meta: { auth: true },
      component: () =>
        import(/* webpackChunkName: 'about' */ './views/messageMgnt.vue')
    },
    {
      path: '/videoReview',
      name: 'videoReview',
      meta: { auth: true },
      component: () =>
        import(/* webpackChunkName: 'about' */ './views/videoReview.vue')
    },
    {
      path: '/userDashBoard',
      name: 'userDashBoard',
      meta: { auth: true },
      component: () =>
        import(/* webpackChunkName: 'about' */ './views/userDashBoard.vue')
    },
    {
      path: '/flowSetting',
      name: 'flowSetting',
      meta: { auth: true },
      component: () =>
        import(/* webpackChunkName: 'about' */ './views/flowSetting.vue')
    },
    {
      path: '/userMgnt',
      name: 'userMgnt',
      meta: { auth: true },
      component: () =>
        import(/* webpackChunkName: 'about' */ './views/userMgnt.vue')
    },
    {
      path: '/resetUser',
      name: 'resetUser',
      meta: { auth: true },
      component: () =>
        import(/* webpackChunkName: 'about' */ './views/resetUser.vue')
    },
    {
      path: '/setting',
      name: 'setting',
      meta: { auth: true },
      component: () =>
        import(/* webpackChunkName: 'about' */ './views/setting.vue')
    },
    {
      path: '/user',
      name: 'user',
      meta: { auth: true },
      component: () =>
        import(/* webpackChunkName: 'about' */ './views/user.vue')
    },
    {
      path: '/login',
      name: 'login',
      meta: { auth: true },
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () =>
        import(/* webpackChunkName: 'about' */ './views/Login.vue')
    },
    {
      path: '/Chart',
      name: 'chart',
      meta: { auth: true },
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () =>
        import(/* webpackChunkName: 'about' */ './views/Chart.vue')
    },
    {
      path: '/Info',
      name: 'Info',
      meta: { auth: true },
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () =>
        import(/* webpackChunkName: 'about' */ './views/Info.vue')
    },
    {
      path: '/Finalization',
      name: 'Finalization',
      meta: { auth: true },
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () =>
        import(/* webpackChunkName: 'about' */ './views/Finalization.vue')
    },
    {
      path: '/createKB',
      name: 'createKB',
      meta: { auth: true },
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () =>
        import(/* webpackChunkName: 'about' */ './views/createKB.vue')
    },
    {
      path: '/logout',
      name: 'logout',
      meta: { auth: true },
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () =>
          import(/* webpackChunkName: 'about' */ './views/Logout.vue')
    }
  ]
});
