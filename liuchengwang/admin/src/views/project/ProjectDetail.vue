<template>
  <div class="project-detail-container">
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">{{ projectData.name || '项目详情' }}</h2>
        <el-tag v-if="projectData.status" :type="getProjectStatusType(projectData.status)">
          {{ getProjectStatusName(projectData.status) }}
        </el-tag>
      </div>
      <div class="header-actions">
        <el-button @click="backToProjects" icon="el-icon-back">返回项目列表</el-button>
      </div>
    </div>

    <el-tabs v-model="activeTab" class="project-tabs" @tab-click="handleTabClick">
      <el-tab-pane label="项目概览" name="overview"></el-tab-pane>
      <el-tab-pane label="节点管理" name="nodes"></el-tab-pane>
      <el-tab-pane label="用户管理" name="users" v-if="canManageUsers"></el-tab-pane>
    </el-tabs>

    <router-view></router-view>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { getProject, adaptProjectToProjectDetail } from '@/api/project';
import { getProjectStatusName, getProjectStatusType } from '@/types/project';
import { hasPermission } from '@/utils/permissions';
import type { ProjectDetail } from '@/types/project';
import { UserRole } from '@/types/api';

const router = useRouter();
const route = useRoute();
const projectId = computed(() => route.params.id as string);
const activeTab = ref('overview');
const projectData = ref<ProjectDetail>({} as ProjectDetail);
const loading = ref(false);

// 检查当前用户是否有权限管理用户
const canManageUsers = computed(() => {
  return hasPermission([UserRole.SUPER_ADMIN, UserRole.PROJECT_ADMIN]);
});

// 加载项目详情
const loadProjectData = async () => {
  loading.value = true;
  try {
    const res = await getProject(projectId.value);
    projectData.value = adaptProjectToProjectDetail(res);
  } catch (error) {
    ElMessage.error('加载项目信息失败');
    console.error('加载项目信息失败:', error);
  } finally {
    loading.value = false;
  }
};

// 监听路由变化，更新当前激活的Tab
watch(
  () => route.path,
  (path) => {
    if (path.includes('/overview')) {
      activeTab.value = 'overview';
    } else if (path.includes('/nodes')) {
      activeTab.value = 'nodes';
    } else if (path.includes('/users')) {
      activeTab.value = 'users';
    }
  }
);

// Tab点击处理
const handleTabClick = () => {
  router.push(`/project/${projectId.value}/${activeTab.value}`);
};

// 返回项目列表
const backToProjects = () => {
  router.push('/projects');
};

onMounted(() => {
  loadProjectData();
  // 根据当前路由设置默认激活的Tab
  const currentPath = route.path;
  if (currentPath.includes('/overview')) {
    activeTab.value = 'overview';
  } else if (currentPath.includes('/nodes')) {
    activeTab.value = 'nodes';
  } else if (currentPath.includes('/users')) {
    activeTab.value = 'users';
  }
});
</script>

<style scoped>
.project-detail-container {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-left {
  display: flex;
  align-items: center;
}

.page-title {
  margin: 0;
  margin-right: 12px;
  font-size: 22px;
}

.project-tabs {
  margin-bottom: 20px;
}
</style> 