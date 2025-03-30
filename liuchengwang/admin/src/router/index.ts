import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

// 配置NProgress
NProgress.configure({ 
  showSpinner: false,
  minimum: 0.1,
  easing: 'ease',
  speed: 500
});

// 路由配置
const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/login/LoginView.vue'),
    meta: {
      title: '登录',
      requiresAuth: false
    }
  },
  {
    path: '/',
    component: () => import('../components/layout/MainLayout.vue'),
    meta: {
      requiresAuth: true
    },
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: () => import('../views/dashboard/DashboardView.vue'),
        meta: {
          title: '仪表盘',
          icon: 'Menu'
        }
      },
      {
        path: 'projects',
        name: 'Projects',
        component: () => import('../views/projects/ProjectListView.vue'),
        meta: {
          title: '项目管理',
          icon: 'Folder'
        }
      },
      {
        path: 'projects/create',
        name: 'ProjectCreate',
        component: () => import('../views/projects/ProjectCreateView.vue'),
        meta: {
          title: '创建项目',
          icon: 'Plus',
          hideInMenu: true
        }
      },
      {
        path: 'projects/:id',
        name: 'ProjectDetail',
        component: () => import('../views/projects/ProjectDetailView.vue'),
        meta: {
          title: '项目详情',
          hideInMenu: true,
          dynamicTitle: true
        },
        props: true
      },
      {
        path: 'projects/:id/nodes',
        name: 'NodeList',
        component: () => import('../views/nodes/NodeListView.vue'),
        meta: {
          title: '节点管理',
          hideInMenu: true,
          dynamicTitle: true,
          parentTitle: '项目管理'
        },
        props: true
      },
      {
        path: 'nodes/:nodeId/issues',
        name: 'IssueList',
        component: () => import('../views/issues/IssueListView.vue'),
        meta: {
          title: '问题管理',
          hideInMenu: true,
          dynamicTitle: true
        },
        props: true
      },
      {
        path: 'nodes/:nodeId/materials',
        name: 'MaterialList',
        component: () => import('../views/materials/MaterialListView.vue'),
        meta: {
          title: '材料管理',
          hideInMenu: true,
          dynamicTitle: true
        },
        props: true
      },
      {
        path: 'project-assign',
        name: 'ProjectAssign',
        component: () => import('../views/project/ProjectAssign.vue'),
        meta: {
          title: '项目分配',
          icon: 'Share',
          requiresAuth: true,
          requiredRoles: ['super_admin', 'project_admin']
        },
        beforeEnter: (to, from, next) => {
          console.log('项目分配路由守卫触发');
          
          try {
            // 使用和App.vue相同的方式获取用户信息
            const userInfoStr = localStorage.getItem('userInfo');
            if (!userInfoStr) {
              console.log('未找到用户信息，重定向到首页');
              next('/');
              return;
            }
            
            const userInfo = JSON.parse(userInfoStr);
            const userRole = userInfo.role;
            
            console.log('项目分配路由检查权限:', {
              userRole,
              有权限: userRole === 'super_admin' || userRole === 'project_admin'
            });
            
            if (userRole === 'super_admin' || userRole === 'project_admin') {
              console.log('权限验证通过，允许访问项目分配页面');
              next();
            } else {
              console.log('权限不足，重定向到首页');
              next('/');
            }
          } catch (error) {
            console.error('权限检查出错:', error);
            next('/');
          }
        }
      },
      {
        path: 'users',
        name: 'Users',
        component: () => import('../views/users/UserListView.vue'),
        meta: {
          title: '用户管理',
          icon: 'User',
          requiresAuth: true,
          requiredRoles: ['super_admin']
        },
        beforeEnter: (to, from, next) => {
          try {
            const userInfoStr = localStorage.getItem('userInfo');
            if (!userInfoStr) {
              next('/');
              return;
            }
            
            const userInfo = JSON.parse(userInfoStr);
            const userRole = userInfo.role;
            
            if (userRole === 'super_admin') {
              next();
            } else {
              next('/');
            }
          } catch (error) {
            console.error('权限检查出错:', error);
            next('/');
          }
        }
      }
    ]
  },
  // 404页面
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFound.vue'),
    meta: {
      title: '页面不存在',
      hideInMenu: true
    }
  },
  // 项目详情路由
  {
    path: '/project/:id',
    component: () => import('../views/project/ProjectDetail.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: { name: 'project-overview' }
      },
      {
        path: 'overview',
        name: 'project-overview',
        component: () => import('../views/project/ProjectOverview.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'nodes',
        name: 'project-nodes',
        component: () => import('../views/project/ProjectNodes.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'users',
        name: 'project-users',
        component: () => import('../views/project/ProjectUsers.vue'),
        meta: { requiresAuth: true }
      }
    ]
  }
];

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(_, __, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  }
});

// 路由守卫
router.beforeEach((to, from, next) => {
  // 开始加载进度条
  NProgress.start();
  
  console.log('路由导航开始:', {
    from: from.path,
    to: to.path,
    toFullPath: to.fullPath,
    toName: to.name,
    toParams: to.params,
    toQuery: to.query
  });
  
  // 设置页面标题
  let title = '流程王';
  if (to.meta.title) {
    if (to.meta.dynamicTitle && to.meta.currentTitle) {
      title = `${to.meta.currentTitle} - ${title}`;
    } else {
      title = `${to.meta.title} - ${title}`;
    }
  }
  document.title = title;
  
  // 获取token
  const token = localStorage.getItem('token');
  console.log('检查路由权限:', { 
    路径: to.path, 
    需要认证: to.matched.some(record => record.meta.requiresAuth),
    已登录: !!token 
  });
  
  // 检查是否需要登录权限
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  
  if (requiresAuth && !token) {
    // 如果需要认证但没有token，重定向到登录页
    console.log('需要登录，重定向到登录页');
    next({
      path: '/login',
      query: { redirect: to.fullPath }
    });
  } else if (to.path === '/login' && token) {
    // 如果已登录但访问登录页，重定向到首页
    console.log('已登录，从登录页重定向到首页');
    next('/');
  } else {
    console.log('路由导航通过，继续...');
    next();
  }
});

// 路由后置钩子
router.afterEach((to) => {
  console.log('路由导航完成, 当前路径:', to.path);
  // 结束加载进度条
  NProgress.done();
});

export default router; 