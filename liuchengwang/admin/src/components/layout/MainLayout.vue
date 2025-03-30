<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { 
  Fold, 
  Expand, 
  ArrowDown,
  Plus
} from '@element-plus/icons-vue';
import Breadcrumb from './Breadcrumb.vue';

const router = useRouter();
const route = useRoute();

// 侧边栏折叠状态
const isCollapse = ref(false);

// 获取路由中的菜单项
const menuItems = computed(() => {
  const mainRoute = router.options.routes?.find(route => route.path === '/');
  const items = mainRoute?.children?.filter(item => !item.meta?.hideInMenu) || [];
  
  // 获取用户角色
  const userInfoStr = localStorage.getItem('userInfo');
  const userRole = userInfoStr ? JSON.parse(userInfoStr).role : null;
  
  // 过滤菜单项
  return items.filter(item => {
    // 如果菜单项没有角色要求，则所有人都可以看到
    if (!item.meta?.requiredRoles) {
      return true;
    }
    
    // 如果菜单项有角色要求，检查用户角色是否满足要求
    return item.meta.requiredRoles.includes(userRole);
  }).map(item => {
    // 项目管理使用绝对路径
    if (item.path === 'projects') {
      return {
        ...item,
        path: '/projects',
      };
    }
    // 项目分配使用绝对路径
    if (item.path === 'project-assign') {
      return {
        ...item,
        path: '/project-assign',
      };
    }
    return item;
  });
});

// 当前激活的菜单项
const activeMenu = computed(() => {
  const { path } = route;
  // 使用includes而不是startsWith，更灵活地匹配路径
  if (path.includes('/projects') || path.includes('/nodes')) {
    return '/projects';
  }
  if (path.includes('/project-assign')) {
    return '/project-assign';
  }
  return path;
});

// 处理菜单点击
const handleMenuSelect = async (index: string) => {
  try {
    console.log('菜单点击:', index, '当前路径:', route.path);
    
    // 如果点击的是项目管理菜单
    if (index === '/projects') {
      console.log('检测到项目管理菜单点击，使用绝对路径导航');
      
      // 强制使用绝对路径导航
      window.location.href = '/projects';
      return;
    }
    
    // 如果点击的是项目分配菜单
    if (index === '/project-assign') {
      console.log('检测到项目分配菜单点击，使用router导航');
      console.log('导航前路由状态:', router.currentRoute.value.fullPath);
      
      try {
        // 使用命名路由导航
        await router.push({ name: 'ProjectAssign' });
        console.log('使用命名路由导航完成，当前路径:', router.currentRoute.value.fullPath);
      } catch (navError) {
        console.error('命名路由导航失败:', navError);
        
        try {
          // 尝试使用路径导航
          await router.push('/project-assign');
          console.log('路径导航完成，当前路径:', router.currentRoute.value.fullPath);
        } catch (pathError) {
          console.error('路径导航也失败:', pathError);
          // 最后尝试使用window.location作为备选方案
          console.log('尝试使用window.location重定向');
          window.location.href = '/project-assign';
        }
      }
      return;
    }
    
    // 其他菜单项的跳转
    await router.push(index);
  } catch (error) {
    console.error('路由跳转错误:', error);
  }
};

// 处理退出登录
const handleLogout = () => {
  localStorage.removeItem('token');
  router.push('/login');
};
</script>

<template>
  <el-container class="layout-container">
    <!-- 侧边栏 -->
    <el-aside :width="isCollapse ? '60px' : '180px'" class="aside">
      <div class="logo-container">
        <h2 class="logo-text" v-if="!isCollapse">流程王</h2>
        <h2 class="logo-text-small" v-else>流</h2>
      </div>
      
      <el-menu
        :default-active="activeMenu"
        class="el-menu-vertical"
        :collapse="isCollapse"
        @select="handleMenuSelect"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
      >
        <el-menu-item 
          v-for="item in menuItems" 
          :key="item.path" 
          :index="item.path.startsWith('/') ? item.path : `/${item.path}`"
        >
          <el-icon>
            <component :is="item.meta?.icon || Plus" />
          </el-icon>
          <template #title>{{ item.meta?.title }}</template>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <!-- 主内容区 -->
    <el-container class="right-container">
      <!-- 头部 -->
      <el-header class="header">
        <div class="header-left">
          <el-icon class="toggle-icon" @click="isCollapse = !isCollapse">
            <component :is="isCollapse ? Expand : Fold" />
          </el-icon>
          <Breadcrumb />
        </div>
        <div class="header-right">
          <el-dropdown @command="handleLogout">
            <span class="user-dropdown">
              管理员 <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 内容区 -->
      <el-main class="main">
        <div class="content-container">
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </div>
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.layout-container {
  height: 100vh;
  width: 100%;
}

.aside {
  background-color: #304156;
  transition: width 0.3s;
  overflow: hidden;
}

.logo-container {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #263445;
}

.logo-text {
  color: #fff;
  font-size: 18px;
  margin: 0;
}

.logo-text-small {
  color: #fff;
  font-size: 18px;
  margin: 0;
}

.el-menu-vertical {
  border-right: none;
}

.el-menu-vertical:not(.el-menu--collapse) {
  width: 180px;
}

.right-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  width: calc(100% - 180px);
}

.header {
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  padding: 0 16px;
  height: 60px;
}

.header-left {
  display: flex;
  align-items: center;
}

.toggle-icon {
  font-size: 20px;
  cursor: pointer;
  margin-right: 16px;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-dropdown {
  cursor: pointer;
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #606266;
}

.main {
  background-color: #f0f2f5;
  padding: 12px;
  overflow-y: auto;
  flex: 1;
}

.content-container {
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

@media screen and (max-width: 1440px) {
  .content-container {
    max-width: 100%;
  }
}

@media screen and (min-width: 1920px) {
  .content-container {
    max-width: 1600px;
  }
}
</style> 