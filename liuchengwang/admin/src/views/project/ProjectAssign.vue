<template>
  <div class="project-assign-container">
    <div class="page-header">
      <h3 class="page-title">项目权限分配</h3>
    </div>

    <el-card v-loading="loading">
      <!-- 用户列表 -->
      <div class="filter-container">
        <el-input
          v-model="searchQuery"
          placeholder="搜索用户名/真实姓名"
          style="width: 200px;"
          class="filter-item"
          @keyup.enter="handleSearch"
        />
        <el-button type="primary" @click="handleSearch">搜索</el-button>
      </div>

      <el-table :data="users" border style="width: 100%; margin-top: 20px;">
        <el-table-column prop="username" label="用户名" min-width="120" />
        <el-table-column prop="realname" label="真实姓名" min-width="120" />
        <el-table-column prop="role" label="角色" min-width="120">
          <template #default="scope">
            <role-tag :role="scope.row.role" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="400" fixed="right">
          <template #default="scope">
            <div style="display: flex; gap: 10px;">
              <el-button 
                type="primary" 
                size="small" 
                @click="handleAssignProject(scope.row)"
              >
                分配项目
              </el-button>
              <el-button 
                type="info" 
                size="small" 
                @click="handleViewProjects(scope.row)"
              >
                查看已有项目
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 项目分配对话框 -->
    <el-dialog 
      v-model="dialogVisible" 
      title="分配项目" 
      width="600px"
    >
      <div v-loading="projectsLoading">
        <el-table
          ref="projectTableRef"
          :data="availableProjects"
          style="width: 100%"
          @selection-change="handleSelectionChange"
        >
          <el-table-column
            type="selection"
            width="55"
          />
          <el-table-column
            prop="name"
            label="项目名称"
            min-width="200"
          />
          <el-table-column
            prop="status"
            label="状态"
            width="100"
          >
            <template #default="scope">
              <el-tag :type="getProjectStatusType(scope.row.status)">
                {{ getProjectStatusName(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmAssign" :loading="assigning">
          确认
        </el-button>
      </template>
    </el-dialog>

    <!-- 查看用户项目对话框 -->
    <el-dialog 
      v-model="viewProjectsDialogVisible" 
      :title="currentUserProjects.username + ' 的项目列表'"
      width="800px"
    >
      <div v-loading="viewProjectsLoading">
        <el-empty v-if="!currentUserProjects.projects.length" description="暂无项目数据" />
        <el-table v-else :data="currentUserProjects.projects" border style="width: 100%">
          <el-table-column prop="name" label="项目名称" min-width="200" />
          <el-table-column prop="source" label="来源" width="150" align="center">
            <template #default="scope">
              <el-tag :type="scope.row.isCreator ? 'success' : 'info'">
                {{ scope.row.isCreator ? '自建' : '分配' }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, nextTick } from 'vue';
import { ElMessage } from 'element-plus';
import { searchUserList } from '@/api/user';
import { getProjectList } from '@/api/project';
import { addProjectUser, getProjectUsers, getMyProjects } from '@/api/projectUser';
import RoleTag from '@/components/RoleTag.vue';
import { hasPermission } from '@/utils/permissions';
import { UserRole } from '@/types/api';
import { getProjectStatusName, getProjectStatusType } from '@/types/project';

// 状态
const loading = ref(false);
const projectsLoading = ref(false);
const users = ref<any[]>([]);
const searchQuery = ref('');
const availableProjects = ref<any[]>([]);
const selectedProjects = ref<any[]>([]);
const dialogVisible = ref(false);
const assigning = ref(false);
const currentUserId = ref<number>(0);
const projectTableRef = ref();

// 查看项目相关的状态
const viewProjectsDialogVisible = ref(false);
const viewProjectsLoading = ref(false);
const currentUserProjects = ref<{
  username: string;
  projects: any[];
}>({
  username: '',
  projects: []
});

// 检查当前用户是否有权限分配项目
const canAssignProjects = computed(() => {
  return hasPermission([UserRole.SUPER_ADMIN, UserRole.PROJECT_ADMIN]);
});

// 加载用户列表
const loadUsers = async () => {
  if (!canAssignProjects.value) {
    ElMessage.warning('您没有权限分配项目');
    return;
  }

  loading.value = true;
  try {
    const res = await searchUserList(searchQuery.value);
    users.value = res.data;
  } catch (error) {
    console.error('加载用户列表失败:', error);
    ElMessage.error('加载用户列表失败');
  } finally {
    loading.value = false;
  }
};

// 加载项目列表和用户已分配的项目
const loadProjects = async (userId: number) => {
  projectsLoading.value = true;
  try {
    // 获取所有项目
    const projectsRes = await getProjectList();
    availableProjects.value = projectsRes.items;
    console.log('获取到所有项目:', availableProjects.value);

    // 获取用户已分配的项目
    const userProjects = await getProjectUsers(`${userId}`);
    console.log('获取到用户已分配的项目原始数据:', userProjects);
    
    if (!Array.isArray(userProjects)) {
      throw new Error('获取到的用户项目数据格式不正确');
    }
    
    // 设置已分配项目的选中状态
    const assignedProjectIds = userProjects.map(up => up.project_id);
    console.log('已分配的项目ID:', assignedProjectIds);
    
    // 等待表格渲染完成后设置选中状态
    await nextTick();
    
    // 确保表格实例存在
    if (!projectTableRef.value) {
      console.error('表格实例未找到');
      return;
    }

    // 清除所有选中状态
    projectTableRef.value.clearSelection();
    
    // 设置选中状态
    availableProjects.value.forEach(project => {
      console.log('检查项目:', project.id, '是否在已分配列表中:', assignedProjectIds.includes(project.id));
      if (assignedProjectIds.includes(project.id)) {
        projectTableRef.value.toggleRowSelection(project, true);
      }
    });
  } catch (error) {
    console.error('加载项目列表失败:', error);
    ElMessage.error('加载项目列表失败');
  } finally {
    projectsLoading.value = false;
  }
};

// 搜索用户
const handleSearch = () => {
  loadUsers();
};

// 打开分配项目对话框
const handleAssignProject = (user: any) => {
  currentUserId.value = user.id;
  dialogVisible.value = true;
  loadProjects(user.id);
};

// 处理项目选择变化
const handleSelectionChange = (selection: any[]) => {
  selectedProjects.value = selection;
};

// 确认分配项目
const handleConfirmAssign = async () => {
  if (selectedProjects.value.length === 0) {
    ElMessage.warning('请选择要分配的项目');
    return;
  }

  assigning.value = true;
  try {
    // 批量处理项目分配
    const promises = selectedProjects.value.map(project => 
      addProjectUser({
        projectId: project.id,
        userId: currentUserId.value,
        can_edit: false // 权限由角色决定
      })
    );
    
    await Promise.all(promises);
    ElMessage.success('项目分配成功');
    dialogVisible.value = false;
  } catch (error) {
    console.error('项目分配失败:', error);
    ElMessage.error('项目分配失败');
  } finally {
    assigning.value = false;
  }
};

// 处理查看项目
const handleViewProjects = async (user: any) => {
  viewProjectsDialogVisible.value = true;
  viewProjectsLoading.value = true;
  currentUserProjects.value.username = user.username;
  currentUserProjects.value.projects = [];
  
  try {
    // 获取用户的项目列表
    const userProjectsRes = await getProjectUsers(`${user.id}`);
    console.log('获取到用户项目列表原始数据:', userProjectsRes);

    if (!Array.isArray(userProjectsRes)) {
      throw new Error('获取到的项目数据格式不正确');
    }

    // 获取所有项目列表以获取项目详情
    const projectsRes = await getProjectList();
    console.log('获取到所有项目列表:', projectsRes);

    const projectsMap = new Map(
      projectsRes.items.map(p => [p.id, p])
    );

    // 处理项目数据
    currentUserProjects.value.projects = userProjectsRes
      .filter(up => {
        const project = projectsMap.get(up.project_id);
        if (!project) {
          console.warn(`未找到项目信息:`, up.project_id);
          return false;
        }
        return true;
      })
      .map(up => {
        const project = projectsMap.get(up.project_id)!;
        console.log('处理项目数据:', {
          projectId: up.project_id,
          project,
          userId: user.id,
          isCreator: project.created_by === user.id
        });
        return {
          id: up.project_id,
          name: project.name,
          isCreator: project.created_by === user.id
        };
      });

    console.log('处理后的项目列表:', currentUserProjects.value.projects);
  } catch (error) {
    console.error('获取用户项目列表失败:', error);
    ElMessage.error('获取用户项目列表失败');
  } finally {
    viewProjectsLoading.value = false;
  }
};

// 初始化
onMounted(() => {
  loadUsers();
});
</script>

<style scoped>
.project-assign-container {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.filter-container {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

.page-title {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
}
</style> 