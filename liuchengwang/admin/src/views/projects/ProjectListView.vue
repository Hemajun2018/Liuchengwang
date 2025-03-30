<template>
  <div class="project-list-container">
    <!-- 页面标题和操作按钮 -->
    <div class="page-header">
      <h2 class="page-title">项目管理</h2>
      <el-button type="primary" @click="createProject">
        <el-icon><Plus /></el-icon> 创建项目
      </el-button>
    </div>

    <!-- 搜索和筛选 -->
    <el-card class="filter-container" :body-style="{ padding: '16px' }">
      <el-form :inline="true" :model="filterForm" class="filter-form" label-width="70px">
        <el-form-item label="项目名称">
          <el-input
            v-model="filterForm.name"
            placeholder="请输入项目名称"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filterForm.status" placeholder="全部状态" clearable>
            <el-option label="未开始" :value="0" />
            <el-option label="进行中" :value="1" />
            <el-option label="已完成" :value="2" />
            <el-option label="已延期" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="filterForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 项目列表 -->
    <el-card class="project-table-container">
      <el-table
        v-loading="loading"
        :data="projectList"
        style="width: 100%"
        border
      >
        <el-table-column prop="name" label="项目名称" min-width="180">
          <template #default="scope">
            <span>{{ scope.row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="项目进展" width="150">
          <template #default="scope">
            <el-select 
              v-model="scope.row.status" 
              placeholder="选择状态"
              size="small"
              @change="updateProjectStatus(scope.row)"
            >
              <el-option :value="0" label="未开始" />
              <el-option :value="1" label="进行中" />
              <el-option :value="2" label="已完成" />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="创建人" width="120">
          <template #default="scope">
            <span>{{ getCreatorName(scope.row.created_by) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="创建日期" width="150">
          <template #default="scope">
            <span>{{ formatDate(scope.row.created_at) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="300" fixed="right">
          <template #default="scope">
            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
              <el-button
                link
                type="primary"
                size="small"
                @click="editProject(scope.row)"
              >
                编辑
              </el-button>
              <el-button
                link
                type="primary"
                size="small"
                @click="manageNodes(scope.row.id)"
              >
                节点管理
              </el-button>
              <el-button
                link
                type="primary"
                size="small"
                @click="handleCopyProject(scope.row)"
              >
                复制
              </el-button>
              <el-button
                link
                type="danger"
                size="small"
                @click="handleDeleteProject(scope.row.id)"
              >
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 项目编辑对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑项目"
      width="500px"
    >
      <el-form
        ref="editFormRef"
        :model="editForm"
        :rules="editRules"
        label-width="80px"
        status-icon
      >
        <el-form-item label="项目名称" prop="name">
          <el-input v-model="editForm.name" placeholder="请输入项目名称" />
        </el-form-item>
        <el-form-item label="项目密码" prop="password">
          <el-input 
            v-model="editForm.password" 
            placeholder="请输入项目密码" 
            type="password" 
            show-password
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSaveEdit" :loading="saveLoading">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getProjectList, deleteProject, updateProject, copyProject, cloneProject } from '@/api/project';
import { NodeStatus } from '@/api/node';
import { format } from 'date-fns';
import { useUserStore } from '@/stores/user';

const router = useRouter();
const loading = ref(false);

// 筛选表单
const filterForm = reactive({
  name: '',
  status: '',
  dateRange: []
});

// 分页
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

// 项目列表数据
const projectList = ref<any[]>([]);

// 编辑对话框
const editDialogVisible = ref(false);
const editFormRef = ref();
const saveLoading = ref(false);
const editForm = reactive({
  id: '',
  name: '',
  password: ''
});

// 编辑表单验证规则
const editRules = reactive({
  name: [
    { required: true, message: '请输入项目名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度应为2-50个字符', trigger: 'blur' }
  ],
  password: [
    { min: 6, max: 20, message: '密码长度应为6-20个字符', trigger: 'blur' }
  ]
});

// 获取用户信息的store
const userStore = useUserStore();

// 格式化日期
const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  try {
    return format(new Date(dateString), 'yyyy-MM-dd HH:mm');
  } catch (error) {
    return dateString;
  }
};

// 获取创建者名称
const getCreatorName = (creatorId: number) => {
  // 如果项目创建者是当前用户
  if (userStore.userInfo && creatorId === userStore.userInfo.id) {
    return userStore.userInfo.realName || userStore.userInfo.username || '我';
  }
  
  // 否则显示默认值
  return `用户${creatorId}`;
};

// 初始化
onMounted(() => {
  fetchProjects();
});

// 获取项目列表
const fetchProjects = async () => {
  loading.value = true;
  
  try {
    const response = await getProjectList({
      page: currentPage.value,
      page_size: pageSize.value,
      keyword: filterForm.name,
      status: filterForm.status ? filterForm.status as NodeStatus : undefined
    });
    
    projectList.value = response.items;
    total.value = response.total;
  } catch (error) {
    console.error('获取项目列表失败:', error);
    // 错误处理已经在request.ts的响应拦截器中处理
  } finally {
    loading.value = false;
  }
};

// 搜索
const handleSearch = () => {
  currentPage.value = 1;
  fetchProjects();
};

// 重置筛选
const resetFilter = () => {
  filterForm.name = '';
  filterForm.status = '';
  filterForm.dateRange = [];
  handleSearch();
};

// 分页大小变化
const handleSizeChange = (val: number) => {
  pageSize.value = val;
  fetchProjects();
};

// 当前页变化
const handleCurrentChange = (val: number) => {
  currentPage.value = val;
  fetchProjects();
};

// 创建项目
const createProject = () => {
  router.push('/projects/create');
};

// 管理节点
const manageNodes = (id: string) => {
  router.push(`/projects/${id}/nodes`);
};

// 删除项目
const handleDeleteProject = (id: string) => {
  ElMessageBox.confirm(
    '确定要删除该项目吗？删除后将无法恢复。',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
    .then(async () => {
      try {
        await deleteProject(id);
        ElMessage.success('删除成功');
        fetchProjects();
      } catch (error) {
        console.error('删除项目失败:', error);
        // 错误处理已经在request.ts的响应拦截器中处理
      }
    })
    .catch(() => {
      // 取消删除
    });
};

// 更新项目状态
const updateProjectStatus = async (project: any) => {
  try {
    await updateProject(project.id, { status: project.status });
    ElMessage.success('状态更新成功');
  } catch (error) {
    console.error('更新项目状态失败:', error);
    // 错误处理已经在request.ts的响应拦截器中处理
  }
};

// 打开编辑对话框
const editProject = (project: any) => {
  editForm.id = project.id;
  editForm.name = project.name;
  editForm.password = project.password || ''; // 如果没有密码字段,默认为空字符串
  editDialogVisible.value = true;
};

// 保存编辑
const handleSaveEdit = async () => {
  if (!editFormRef.value) return;
  
  await editFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        saveLoading.value = true;
        
        // 调用更新项目API
        await updateProject(editForm.id, {
          name: editForm.name,
          password: editForm.password
        });
        
        // 关闭对话框
        editDialogVisible.value = false;
        
        // 刷新项目列表
        await fetchProjects();
        
        ElMessage.success('项目更新成功');
      } catch (error) {
        console.error('更新项目失败:', error);
        // 错误处理已经在request.ts的响应拦截器中处理
      } finally {
        saveLoading.value = false;
      }
    }
  });
};

// 复制项目
const handleCopyProject = async (project: any) => {
  try {
    const { value: newProjectName } = await ElMessageBox.prompt(
      '请输入新项目名称',
      '复制项目',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputValue: `${project.name}的副本`,
        inputValidator: (value) => {
          if (!value) {
            return '项目名称不能为空';
          }
          return true;
        }
      }
    );

    if (newProjectName) {
      // 尝试新的克隆接口
      try {
        await cloneProject(project.id, newProjectName);
        ElMessage.success('项目复制成功');
        fetchProjects(); // 刷新项目列表
      } catch (error: any) {
        // 如果新接口失败，尝试旧接口
        console.error('使用clone接口失败，尝试使用copy接口:', error);
        await copyProject(project.id, newProjectName);
        ElMessage.success('项目复制成功');
        fetchProjects();
      }
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '项目复制失败');
    }
  }
};
</script>

<style scoped>
.project-list-container {
  width: 100%;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
}

.filter-container {
  margin-bottom: 16px;
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.project-table-container {
  margin-bottom: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style> 