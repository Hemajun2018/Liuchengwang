<template>
  <div class="user-list-container">
    <!-- 页面标题和操作按钮 -->
    <div class="page-header">
      <h2 class="page-title">用户管理</h2>
      <el-button type="primary" @click="handleCreate">
        <el-icon><Plus /></el-icon> 创建用户
      </el-button>
    </div>

    <!-- 搜索和筛选 -->
    <el-card class="filter-container">
      <el-form :inline="true" :model="filterForm">
        <el-form-item label="关键词">
          <el-input
            v-model="filterForm.keyword"
            placeholder="用户名/邮箱/手机"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="filterForm.role" placeholder="全部角色" clearable>
            <el-option label="超级管理员" :value="UserRole.SUPER_ADMIN" />
            <el-option label="项目管理员" :value="UserRole.PROJECT_ADMIN" />
            <el-option label="内容管理员" :value="UserRole.CONTENT_ADMIN" />
            <el-option label="普通用户" :value="UserRole.EMPLOYEE" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 用户列表 -->
    <el-card>
      <el-table
        v-loading="loading"
        :data="userList"
        style="width: 100%"
        border
      >
        <el-table-column prop="username" label="用户名" min-width="120" />
        <el-table-column prop="realName" label="真实姓名" min-width="120" />
        <el-table-column prop="email" label="邮箱" min-width="180" />
        <el-table-column prop="phone" label="手机号" width="120" />
        <el-table-column prop="role" label="角色" width="120">
          <template #default="{ row }">
            <role-tag :role="row.role" />
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">
            {{ new Date(row.createdAt).toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button
              link
              type="primary"
              size="small"
              @click="handleEdit(row)"
            >
              编辑
            </el-button>
            <el-button
              link
              type="primary"
              size="small"
              @click="handleChangePassword(row)"
            >
              修改密码
            </el-button>
            <el-button
              link
              type="danger"
              size="small"
              @click="handleDelete(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 编辑用户对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      :title="editingUser.id ? '编辑用户' : '创建用户'"
      width="500px"
    >
      <el-form
        ref="editFormRef"
        :model="editingUser"
        :rules="editRules"
        label-width="100px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="editingUser.username" :disabled="!!editingUser.id" />
        </el-form-item>
        <el-form-item label="真实姓名" prop="realName">
          <el-input v-model="editingUser.realName" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editingUser.email" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="editingUser.phone" />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="editingUser.role">
            <el-option label="超级管理员" :value="UserRole.SUPER_ADMIN" />
            <el-option label="项目管理员" :value="UserRole.PROJECT_ADMIN" />
            <el-option label="内容管理员" :value="UserRole.CONTENT_ADMIN" />
            <el-option label="普通用户" :value="UserRole.EMPLOYEE" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="!editingUser.id" label="密码" prop="password">
          <el-input v-model="editingUser.password" type="password" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 修改密码对话框 -->
    <el-dialog
      v-model="passwordDialogVisible"
      title="修改密码"
      width="500px"
    >
      <el-form
        ref="passwordFormRef"
        :model="passwordForm"
        :rules="passwordRules"
        label-width="100px"
      >
        <el-form-item label="旧密码" prop="oldPassword">
          <el-input v-model="passwordForm.oldPassword" type="password" />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="passwordForm.newPassword" type="password" />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="passwordForm.confirmPassword" type="password" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="passwordDialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          :loading="submitting"
          @click="handlePasswordSubmit"
        >
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import { getUserList, updateUser, deleteUser, updatePassword } from '@/api/user';
import { register } from '@/api/auth';
import type { User, RegisterParams } from '@/types/api';
import { UserRole } from '../../types/api';
import RoleTag from '../../components/RoleTag.vue';

// 加载状态
const loading = ref(false);
const submitting = ref(false);

// 表格数据
const userList = ref<User[]>([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);

// 筛选表单
const filterForm = reactive({
  keyword: '',
  role: ''
});

// 编辑对话框
const editDialogVisible = ref(false);
const editFormRef = ref<FormInstance>();
const editingUser = reactive<Partial<User> & { password?: string }>({});

// 密码对话框
const passwordDialogVisible = ref(false);
const passwordFormRef = ref<FormInstance>();
const passwordForm = reactive({
  userId: 0,
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
});

// 表单验证规则
const editRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  realName: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择用户角色', trigger: 'change' }
  ]
};

const passwordRules: FormRules = {
  oldPassword: [
    { required: true, message: '请输入旧密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (_, value, callback) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入密码不一致'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ]
};

// 初始化
onMounted(() => {
  fetchUserList();
});

// 获取用户列表
const fetchUserList = async () => {
  try {
    loading.value = true;
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value,
      ...filterForm
    };
    const { items, total: totalCount } = await getUserList(params);
    userList.value = items;
    total.value = totalCount;
  } catch (error) {
    console.error('获取用户列表失败:', error);
    ElMessage.error('获取用户列表失败');
  } finally {
    loading.value = false;
  }
};

// 搜索
const handleSearch = () => {
  currentPage.value = 1;
  fetchUserList();
};

// 重置筛选
const resetFilter = () => {
  filterForm.keyword = '';
  filterForm.role = '';
  handleSearch();
};

// 分页
const handleSizeChange = (val: number) => {
  pageSize.value = val;
  fetchUserList();
};

const handleCurrentChange = (val: number) => {
  currentPage.value = val;
  fetchUserList();
};

// 创建用户
const handleCreate = () => {
  Object.assign(editingUser, {
    id: undefined,
    username: '',
    password: '',
    role: UserRole.EMPLOYEE,
    realName: '',
    email: '',
    phone: ''
  });
  editDialogVisible.value = true;
};

// 编辑用户
const handleEdit = (row: User) => {
  if (!row || !row.id) {
    ElMessage.error('用户信息不完整，无法编辑');
    return;
  }
  
  Object.assign(editingUser, {
    ...row,
    password: undefined
  });
  editDialogVisible.value = true;
};

// 提交编辑
const handleSubmit = async () => {
  if (!editFormRef.value) return;
  
  await editFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        submitting.value = true;
        
        // 处理可选字段
        const userData = { ...editingUser };
        if (!userData.email) delete userData.email;
        if (!userData.phone) delete userData.phone;
        
        if (editingUser.id) {
          // 更新用户
          const { realName, email, phone, role } = userData;
          const updateData = {
            realName,
            role,
            ...(email ? { email } : {}),
            ...(phone ? { phone } : {})
          };
          await updateUser(editingUser.id, updateData);
          ElMessage.success('更新成功');
        } else {
          // 创建用户
          const { username, password, realName, email, phone, role } = userData;
          const registerData: RegisterParams = {
            username,
            password,
            realName,
            role: role as 'admin' | 'employee',
            ...(email ? { email } : {}),
            ...(phone ? { phone } : {})
          };
          await register(registerData);
          ElMessage.success('创建成功');
        }
        editDialogVisible.value = false;
        fetchUserList();
      } catch (error: any) {
        console.error('操作失败:', error);
        // 优先使用error.message，其次是API返回的错误信息
        const errorMsg = error.message || 
                        error.response?.data?.message || 
                        (Array.isArray(error.response?.data?.message) ? 
                         error.response?.data?.message[0] : 
                         '操作失败，请重试');
        ElMessage.error(errorMsg);
      } finally {
        submitting.value = false;
      }
    }
  });
};

// 删除用户
const handleDelete = async (row: User) => {
  if (!row || !row.id) {
    ElMessage.error('用户信息不完整，无法删除');
    return;
  }
  
  try {
    await ElMessageBox.confirm(
      '确定要删除该用户吗？此操作不可恢复',
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    
    await deleteUser(row.id);
    ElMessage.success('删除成功');
    fetchUserList();
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除失败:', error);
      ElMessage.error(error.message || '删除失败，请重试');
    }
  }
};

// 修改密码
const handleChangePassword = (row: User) => {
  if (!row || !row.id) {
    ElMessage.error('用户信息不完整，无法修改密码');
    return;
  }
  
  passwordForm.userId = row.id;
  passwordForm.oldPassword = '';
  passwordForm.newPassword = '';
  passwordForm.confirmPassword = '';
  passwordDialogVisible.value = true;
};

// 提交密码修改
const handlePasswordSubmit = async () => {
  if (!passwordFormRef.value) return;
  
  await passwordFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        submitting.value = true;
        await updatePassword(passwordForm.userId, {
          oldPassword: passwordForm.oldPassword,
          newPassword: passwordForm.newPassword
        });
        ElMessage.success('密码修改成功');
        passwordDialogVisible.value = false;
      } catch (error: any) {
        console.error('密码修改失败:', error);
        const errorMsg = error.message || 
                        error.response?.data?.message || 
                        '密码修改失败，请重试';
        ElMessage.error(errorMsg);
      } finally {
        submitting.value = false;
      }
    }
  });
};
</script>

<style scoped>
.user-list-container {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  margin: 0;
  font-size: 24px;
  font-weight: 500;
}

.filter-container {
  margin-bottom: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style> 