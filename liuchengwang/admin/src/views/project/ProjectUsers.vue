<template>
  <div class="project-users-container">
    <div class="page-header">
      <h3 class="page-title">项目用户管理</h3>
      <el-button type="primary" @click="handleAddUser" :disabled="!canManageUsers">
        添加用户
      </el-button>
    </div>

    <el-card v-loading="loading">
      <el-empty v-if="projectUsers.length === 0" description="暂无用户数据"></el-empty>
      
      <el-table v-else :data="projectUsers" border style="width: 100%">
        <el-table-column prop="user.username" label="用户名" min-width="120" />
        <el-table-column prop="user.realname" label="真实姓名" min-width="120" />
        <el-table-column prop="user.role" label="系统角色" min-width="120">
          <template #default="scope">
            <role-tag :role="scope.row.user.role" />
          </template>
        </el-table-column>
        <el-table-column prop="can_edit" label="项目权限" min-width="120">
          <template #default="scope">
            <el-tag :type="scope.row.can_edit ? 'warning' : 'info'">
              {{ scope.row.can_edit ? '可编辑' : '仅查看' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="添加时间" min-width="180">
          <template #default="scope">
            {{ formatDate(scope.row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button 
              type="primary" 
              size="small" 
              @click="handleEditPermission(scope.row)"
              :disabled="!canManageUsers || isSelf(scope.row)"
            >
              编辑权限
            </el-button>
            <el-button 
              type="danger" 
              size="small" 
              @click="handleDelete(scope.row)"
              :disabled="!canManageUsers || isSelf(scope.row)"
            >
              移除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加用户对话框 -->
    <el-dialog
      v-model="addUserDialog.visible"
      title="添加项目用户"
      width="500px"
      destroy-on-close
    >
      <el-form ref="addFormRef" :model="addUserDialog.form" :rules="formRules" label-width="100px">
        <el-form-item label="选择用户" prop="userId">
          <el-select
            v-model="addUserDialog.form.userId"
            filterable
            remote
            placeholder="请输入关键词搜索用户"
            :remote-method="searchUsers"
            :loading="addUserDialog.loading"
            style="width: 100%"
          >
            <el-option
              v-for="user in availableUsers"
              :key="user.id"
              :label="`${user.realname} (${user.username})`"
              :value="user.id"
            >
              <div class="user-option">
                <span>{{ user.realname }}</span>
                <span class="user-username">{{ user.username }}</span>
                <role-tag :role="user.role" />
              </div>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="项目权限" prop="can_edit">
          <el-switch
            v-model="addUserDialog.form.can_edit"
            active-text="可编辑"
            inactive-text="仅查看"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addUserDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="confirmAddUser" :loading="addUserDialog.submitting">
          确认添加
        </el-button>
      </template>
    </el-dialog>

    <!-- 编辑权限对话框 -->
    <el-dialog
      v-model="editPermissionDialog.visible"
      title="编辑项目权限"
      width="500px"
      destroy-on-close
    >
      <el-form ref="editFormRef" :model="editPermissionDialog.form" :rules="formRules" label-width="100px">
        <el-form-item label="用户">
          <span>{{ editPermissionDialog.username }}</span>
        </el-form-item>
        <el-form-item label="项目权限" prop="can_edit">
          <el-switch
            v-model="editPermissionDialog.form.can_edit"
            active-text="可编辑"
            inactive-text="仅查看"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editPermissionDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="confirmUpdatePermission" :loading="editPermissionDialog.submitting">
          保存
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import { format } from 'date-fns';
import { getProjectUsers, addProjectUser, updateProjectUserRole, removeProjectUser } from '@/api/projectUser';
import { searchUserList } from '@/api/user';
import { hasPermission } from '@/utils/permissions';
import { UserRole } from '@/types/api';
import RoleTag from '@/components/RoleTag.vue';

const route = useRoute();
const projectId = computed(() => route.params.id as string);
const projectUsers = ref<any[]>([]);
const availableUsers = ref<any[]>([]);
const loading = ref(false);

// 临时用户存储模拟
const userStore = {
  userInfo: {
    id: 1,
    role: UserRole.SUPER_ADMIN
  }
};

// 当前用户ID
const currentUserId = computed(() => userStore.userInfo?.id);

// 检查是否有权限管理用户
const canManageUsers = computed(() => {
  const currentUserRole = userStore.userInfo?.role;
  return hasPermission([UserRole.SUPER_ADMIN, UserRole.PROJECT_ADMIN], currentUserRole);
});

// 添加用户对话框
const addUserDialog = reactive({
  visible: false,
  loading: false,
  submitting: false,
  form: {
    userId: undefined as number | undefined,
    can_edit: false
  }
});

// 编辑权限对话框
const editPermissionDialog = reactive({
  visible: false,
  submitting: false,
  userId: 0,
  username: '',
  form: {
    can_edit: false
  }
});

// 表单引用
const addFormRef = ref<FormInstance>();
const editFormRef = ref<FormInstance>();

// 表单验证规则
const formRules = reactive<FormRules>({
  userId: [
    { required: true, message: '请选择用户', trigger: 'change' }
  ]
});

// 日期格式化
const formatDate = (date: string) => {
  if (!date) return '';
  try {
    return format(new Date(date), 'yyyy-MM-dd HH:mm');
  } catch {
    return date;
  }
};

// 检查是否为当前用户
const isSelf = (projectUser: any) => {
  return projectUser.user.id === currentUserId.value;
};

// 加载项目用户列表
const loadProjectUsers = async () => {
  loading.value = true;
  try {
    const res = await getProjectUsers(projectId.value);
    projectUsers.value = res;
  } catch (error) {
    ElMessage.error('加载项目用户列表失败');
    console.error('加载项目用户列表失败:', error);
  } finally {
    loading.value = false;
  }
};

// 搜索用户
const searchUsers = async (query: string) => {
  if (query.length < 1) {
    availableUsers.value = [];
    return;
  }
  
  addUserDialog.loading = true;
  try {
    const res = await searchUserList(query);
    // 过滤掉已经在项目中的用户
    const existingUserIds = projectUsers.value.map(pu => pu.user.id);
    availableUsers.value = res.data.filter((user: any) => !existingUserIds.includes(user.id));
  } catch (error) {
    ElMessage.error('搜索用户失败');
    console.error('搜索用户失败:', error);
  } finally {
    addUserDialog.loading = false;
  }
};

// 处理添加用户
const handleAddUser = () => {
  addUserDialog.form.userId = undefined;
  addUserDialog.form.can_edit = false;
  addUserDialog.visible = true;
};

// 确认添加用户
const confirmAddUser = async () => {
  if (!addFormRef.value) return;
  
  await addFormRef.value.validate(async (valid: boolean) => {
    if (!valid || !addUserDialog.form.userId) {
      return;
    }
    
    addUserDialog.submitting = true;
    try {
      await addProjectUser({
        projectId: projectId.value,
        userId: addUserDialog.form.userId,
        can_edit: addUserDialog.form.can_edit
      });
      
      ElMessage.success('添加用户成功');
      addUserDialog.visible = false;
      loadProjectUsers();
    } catch (error) {
      ElMessage.error('添加用户失败');
      console.error('添加用户失败:', error);
    } finally {
      addUserDialog.submitting = false;
    }
  });
};

// 处理编辑权限
const handleEditPermission = (projectUser: any) => {
  editPermissionDialog.userId = projectUser.id;
  editPermissionDialog.username = `${projectUser.user.realname} (${projectUser.user.username})`;
  editPermissionDialog.form.can_edit = projectUser.can_edit;
  editPermissionDialog.visible = true;
};

// 确认更新权限
const confirmUpdatePermission = async () => {
  if (!editFormRef.value) return;
  
  editPermissionDialog.submitting = true;
  try {
    await updateProjectUserRole(editPermissionDialog.userId, editPermissionDialog.form.can_edit);
    
    ElMessage.success('更新用户权限成功');
    editPermissionDialog.visible = false;
    loadProjectUsers();
  } catch (error) {
    ElMessage.error('更新用户权限失败');
    console.error('更新用户权限失败:', error);
  } finally {
    editPermissionDialog.submitting = false;
  }
};

// 处理删除用户
const handleDelete = (projectUser: any) => {
  ElMessageBox.confirm(
    `确定要将用户 "${projectUser.user.realname}" 从项目中移除吗？`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
    .then(() => {
      removeUser(projectUser.id);
    })
    .catch(() => {
      // 用户取消操作
    });
};

// 移除用户
const removeUser = async (projectUserId: number) => {
  try {
    await removeProjectUser(projectUserId);
    ElMessage.success('移除用户成功');
    loadProjectUsers();
  } catch (error) {
    ElMessage.error('移除用户失败');
    console.error('移除用户失败:', error);
  }
};

onMounted(() => {
  loadProjectUsers();
});

// 监听路由变化，重新加载数据
watch(() => route.params.id, (newId) => {
  if (newId) {
    loadProjectUsers();
  }
});
</script>

<style scoped>
.project-users-container {
  margin-bottom: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
}

.user-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-username {
  color: #909399;
  margin-left: 8px;
}
</style> 