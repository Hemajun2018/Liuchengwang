<template>
  <div class="project-overview-container">
    <el-card class="overview-card">
      <template #header>
        <div class="card-header">
          <h3>基本信息</h3>
          <el-button v-if="canEditProject" type="primary" size="small" @click="toggleEditMode">
            {{ isEditing ? '取消编辑' : '编辑项目' }}
          </el-button>
        </div>
      </template>

      <el-form v-if="isEditing" ref="formRef" :model="editForm" :rules="formRules" label-width="120px">
        <el-form-item label="项目名称" prop="name">
          <el-input v-model="editForm.name" placeholder="请输入项目名称" />
        </el-form-item>
        
        <el-form-item label="项目密码" prop="password">
          <el-input v-model="editForm.password" placeholder="请输入项目密码" show-password />
          <div class="form-tip">用户查询项目进度时需要输入的密码</div>
        </el-form-item>
        
        <el-form-item label="项目状态" prop="status">
          <el-select v-model="editForm.status">
            <el-option 
              v-for="status in projectStatusOptions" 
              :key="status.value" 
              :label="status.label" 
              :value="status.value" 
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="开始时间" prop="start_time">
          <el-date-picker 
            v-model="editForm.start_time" 
            type="date" 
            placeholder="选择开始日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        
        <el-form-item label="结束时间" prop="end_time">
          <el-date-picker 
            v-model="editForm.end_time" 
            type="date" 
            placeholder="选择结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        
        <el-form-item label="预计天数" prop="days_needed">
          <el-input v-model.number="editForm.days_needed" type="number" placeholder="预计完成天数" />
        </el-form-item>
        
        <el-form-item label="交付物" prop="deliverables">
          <el-input 
            v-model="editForm.deliverables" 
            type="textarea" 
            rows="4" 
            placeholder="请输入项目交付物说明"
          />
        </el-form-item>
        
        <el-form-item label="项目成果" prop="results">
          <el-input 
            v-model="editForm.results" 
            type="textarea" 
            rows="4" 
            placeholder="请输入项目成果说明"
          />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="saveProject" :loading="saving">保存</el-button>
          <el-button @click="toggleEditMode">取消</el-button>
        </el-form-item>
      </el-form>

      <div v-else class="info-display">
        <div class="info-item">
          <span class="info-label">项目名称：</span>
          <span class="info-value">{{ projectData.name }}</span>
        </div>

        <div class="info-item">
          <span class="info-label">项目状态：</span>
          <span class="info-value">
            <el-tag :type="getProjectStatusType(projectData.status)">
              {{ getProjectStatusName(projectData.status) }}
            </el-tag>
          </span>
        </div>

        <div class="info-item">
          <span class="info-label">项目密码：</span>
          <span class="info-value password-value">******</span>
        </div>

        <div class="info-item">
          <span class="info-label">开始时间：</span>
          <span class="info-value">{{ projectData.start_time || '未设置' }}</span>
        </div>

        <div class="info-item">
          <span class="info-label">预计结束：</span>
          <span class="info-value">{{ projectData.end_time || '未设置' }}</span>
        </div>

        <div class="info-item">
          <span class="info-label">预计天数：</span>
          <span class="info-value">{{ projectData.days_needed || '未设置' }}</span>
        </div>

        <div class="info-item full-width">
          <span class="info-label">交付物：</span>
          <div class="info-value content-block">{{ projectData.deliverables || '无' }}</div>
        </div>

        <div class="info-item full-width">
          <span class="info-label">项目成果：</span>
          <div class="info-value content-block">{{ projectData.results || '无' }}</div>
        </div>
      </div>
    </el-card>

    <!-- 项目进度统计 -->
    <el-card class="overview-card">
      <template #header>
        <div class="card-header">
          <h3>进度统计</h3>
        </div>
      </template>

      <div class="progress-stats">
        <div class="stat-item">
          <div class="stat-label">节点总数</div>
          <div class="stat-value">{{ nodeStats.total }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">已完成</div>
          <div class="stat-value completed">{{ nodeStats.completed }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">进行中</div>
          <div class="stat-value in-progress">{{ nodeStats.inProgress }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">未开始</div>
          <div class="stat-value not-started">{{ nodeStats.notStarted }}</div>
        </div>
      </div>

      <el-progress 
        :percentage="completionPercentage" 
        :status="getProgressStatus(completionPercentage)"
        :stroke-width="20"
        class="project-progress"
      >
        <span class="progress-text">完成度：{{ completionPercentage }}%</span>
      </el-progress>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import { getProject, updateProject, adaptProjectToProjectDetail } from '@/api/project';
import { ProjectStatus, getProjectStatusName, getProjectStatusType, type ProjectDetail } from '@/types/project';
import { hasPermission } from '@/utils/permissions';
import { UserRole } from '@/types/api';

const route = useRoute();
const projectId = computed(() => parseInt(route.params.id as string));
const projectData = ref<ProjectDetail>({} as ProjectDetail);
const loading = ref(false);
const isEditing = ref(false);
const saving = ref(false);
const formRef = ref<FormInstance>();

// 节点统计信息
const nodeStats = reactive({
  total: 0,
  completed: 0,
  inProgress: 0,
  notStarted: 0
});

// 编辑表单
const editForm = reactive<ProjectDetail>({} as ProjectDetail);

// 表单验证规则
const formRules = reactive<FormRules>({
  name: [
    { required: true, message: '请输入项目名称', trigger: 'blur' },
    { min: 2, max: 50, message: '项目名称长度应在2-50个字符之间', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入项目密码', trigger: 'blur' },
    { min: 4, max: 20, message: '密码长度应在4-20个字符之间', trigger: 'blur' }
  ]
});

// 项目状态选项
const projectStatusOptions = [
  { value: ProjectStatus.NOT_STARTED, label: '未开始' },
  { value: ProjectStatus.IN_PROGRESS, label: '进行中' },
  { value: ProjectStatus.COMPLETED, label: '已完成' },
  { value: ProjectStatus.DELAYED, label: '已延期' }
];

// 检查用户是否有权限编辑项目
const canEditProject = computed(() => {
  return hasPermission([UserRole.SUPER_ADMIN, UserRole.PROJECT_ADMIN]);
});

// 计算项目完成百分比
const completionPercentage = computed(() => {
  if (nodeStats.total === 0) return 0;
  return Math.round((nodeStats.completed / nodeStats.total) * 100);
});

// 获取进度条状态
const getProgressStatus = (percentage: number): '' | 'success' | 'exception' | 'warning' => {
  if (percentage === 100) return 'success';
  if (percentage < 30) return 'exception';
  return 'warning';
};

// 加载项目数据
const loadProjectData = async () => {
  loading.value = true;
  try {
    const res = await getProject(projectId.value);
    projectData.value = adaptProjectToProjectDetail(res);
    
    // 模拟节点统计数据获取
    // 实际项目中应当从API获取或计算
    loadNodeStats();
  } catch (error) {
    ElMessage.error('加载项目信息失败');
    console.error('加载项目信息失败:', error);
  } finally {
    loading.value = false;
  }
};

// 加载节点统计数据
const loadNodeStats = () => {
  // 模拟节点统计数据
  // 在实际项目中，应该从 API 获取或者根据节点数据计算
  nodeStats.total = 10;
  nodeStats.completed = 4;
  nodeStats.inProgress = 3;
  nodeStats.notStarted = 3;
};

// 切换编辑模式
const toggleEditMode = () => {
  if (isEditing.value) {
    isEditing.value = false;
  } else {
    // 复制当前项目数据到编辑表单
    Object.assign(editForm, JSON.parse(JSON.stringify(projectData.value)));
    isEditing.value = true;
  }
};

// 保存项目
const saveProject = async () => {
  if (!formRef.value) return;
  
  await formRef.value.validate(async (valid: boolean) => {
    if (!valid) {
      return;
    }
    
    saving.value = true;
    try {
      await updateProject(projectId.value, editForm);
      ElMessage.success('保存成功');
      isEditing.value = false;
      await loadProjectData(); // 重新加载项目数据
    } catch (error) {
      ElMessage.error('保存失败');
      console.error('保存项目失败:', error);
    } finally {
      saving.value = false;
    }
  });
};

onMounted(() => {
  loadProjectData();
});

// 监听路由变化，重新加载数据
watch(() => route.params.id, (newId) => {
  if (newId) {
    loadProjectData();
  }
});
</script>

<style scoped>
.project-overview-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.overview-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
}

.info-display {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.info-item {
  width: calc(33.33% - 11px);
  display: flex;
  margin-bottom: 12px;
}

.info-item.full-width {
  width: 100%;
  flex-direction: column;
  gap: 8px;
}

.info-label {
  font-weight: 500;
  color: #606266;
  min-width: 80px;
}

.content-block {
  margin-top: 8px;
  white-space: pre-line;
  line-height: 1.5;
  background-color: #f8f8f8;
  padding: 12px;
  border-radius: 4px;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.progress-stats {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.stat-item {
  text-align: center;
  padding: 12px;
  background-color: #f8f8f8;
  border-radius: 4px;
  flex: 1;
  margin: 0 8px;
}

.stat-item:first-child {
  margin-left: 0;
}

.stat-item:last-child {
  margin-right: 0;
}

.stat-label {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.stat-value.completed {
  color: #67c23a;
}

.stat-value.in-progress {
  color: #e6a23c;
}

.stat-value.not-started {
  color: #909399;
}

.project-progress {
  margin-top: 24px;
}

.progress-text {
  font-size: 14px;
  font-weight: 500;
}
</style> 