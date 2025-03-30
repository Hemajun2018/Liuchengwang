<template>
  <div class="project-nodes-container">
    <div class="page-actions">
      <el-button type="primary" @click="showAddNodeDialog" :disabled="!canManageNodes">
        添加节点
      </el-button>
    </div>

    <el-card v-loading="loading">
      <el-empty v-if="nodes.length === 0" description="暂无节点数据"></el-empty>
      
      <div v-else class="node-list">
        <div v-for="(node, index) in nodes" :key="node.id" class="node-item">
          <div class="node-index">{{ index + 1 }}</div>
          <div class="node-content">
            <div class="node-header">
              <h3 class="node-name">{{ node.name }}</h3>
              <div class="node-status">
                <el-tag :type="getNodeStatusType(node.status)">
                  {{ getNodeStatusName(node.status) }}
                </el-tag>
              </div>
            </div>
            
            <div class="node-description">{{ node.description }}</div>
            
            <div class="node-meta">
              <div class="meta-item">
                <span class="meta-label">开始时间:</span>
                <span class="meta-value">{{ node.start_date || '未设置' }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">结束时间:</span>
                <span class="meta-value">{{ node.end_date || '未设置' }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">预计天数:</span>
                <span class="meta-value">{{ node.days || '未设置' }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">负责人:</span>
                <span class="meta-value">{{ node.owner || '未指定' }}</span>
              </div>
            </div>
            
            <div class="node-actions" v-if="canManageNodes">
              <el-button type="primary" size="small" plain @click="editNode(node)">
                编辑
              </el-button>
              <el-button type="danger" size="small" plain @click="confirmDeleteNode(node)">
                删除
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 添加/编辑节点对话框 -->
    <el-dialog
      v-model="nodeDialog.visible"
      :title="nodeDialog.isEdit ? '编辑节点' : '添加节点'"
      width="600px"
      destroy-on-close
    >
      <el-form
        ref="nodeFormRef"
        :model="nodeForm"
        :rules="nodeRules"
        label-width="100px"
      >
        <el-form-item label="节点名称" prop="name">
          <el-input v-model="nodeForm.name" placeholder="请输入节点名称" />
        </el-form-item>
        
        <el-form-item label="节点描述" prop="description">
          <el-input
            v-model="nodeForm.description"
            type="textarea"
            rows="3"
            placeholder="请输入节点描述"
          />
        </el-form-item>
        
        <el-form-item label="节点状态" prop="status">
          <el-select v-model="nodeForm.status" placeholder="请选择状态">
            <el-option
              v-for="status in nodeStatusOptions"
              :key="status.value"
              :label="status.label"
              :value="status.value"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="开始时间" prop="start_date">
          <el-date-picker
            v-model="nodeForm.start_date"
            type="date"
            placeholder="选择开始日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            @change="calculateDuration"
          />
        </el-form-item>
        
        <el-form-item label="结束时间" prop="end_date">
          <el-date-picker
            v-model="nodeForm.end_date"
            type="date"
            placeholder="选择结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            @change="calculateDuration"
          />
        </el-form-item>
        
        <el-form-item label="预计天数" prop="days">
          <el-input v-model.number="nodeForm.days" type="number" placeholder="预计完成天数" />
        </el-form-item>
        
        <el-form-item label="负责人" prop="owner">
          <el-input v-model="nodeForm.owner" placeholder="请输入负责人" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="nodeDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="saveNode" :loading="saving">
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
import { hasPermission } from '@/utils/permissions';
import { UserRole } from '@/types/api';
import { differenceInDays, parseISO } from 'date-fns';

// 模拟节点数据接口，实际项目中应该从后端获取
interface Node {
  id: number;
  name: string;
  description: string;
  status: string;
  start_date?: string;
  end_date?: string;
  days?: number;
  owner?: string;
}

const route = useRoute();
const nodes = ref<Node[]>([]);
const loading = ref(false);
const saving = ref(false);
const nodeFormRef = ref<FormInstance>();

// 节点表单
const nodeForm = reactive<Partial<Node>>({
  name: '',
  description: '',
  status: 'pending',
  start_date: undefined,
  end_date: undefined,
  days: undefined,
  owner: ''
});

// 节点表单验证规则
const nodeRules = reactive<FormRules>({
  name: [
    { required: true, message: '请输入节点名称', trigger: 'blur' },
    { min: 2, max: 50, message: '节点名称长度应在2-50个字符之间', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入节点描述', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择节点状态', trigger: 'change' }
  ]
});

// 节点状态选项
const nodeStatusOptions = [
  { value: 'pending', label: '未开始' },
  { value: 'in_progress', label: '进行中' },
  { value: 'completed', label: '已完成' },
  { value: 'delayed', label: '已延期' }
];

// 对话框状态
const nodeDialog = reactive({
  visible: false,
  isEdit: false,
  currentId: null as number | null
});

// 检查是否有权限管理节点
const canManageNodes = computed(() => {
  return hasPermission([UserRole.SUPER_ADMIN, UserRole.PROJECT_ADMIN, UserRole.CONTENT_ADMIN]);
});

// 获取节点状态类型
const getNodeStatusType = (status: string): 'success' | 'warning' | 'info' | 'danger' => {
  switch (status) {
    case 'completed':
      return 'success';
    case 'in_progress':
      return 'warning';
    case 'delayed':
      return 'danger';
    default:
      return 'info';
  }
};

// 获取节点状态名称
const getNodeStatusName = (status: string): string => {
  switch (status) {
    case 'completed':
      return '已完成';
    case 'in_progress':
      return '进行中';
    case 'delayed':
      return '已延期';
    case 'pending':
    default:
      return '未开始';
  }
};

// 计算预计天数
const calculateDuration = () => {
  if (nodeForm.start_date && nodeForm.end_date) {
    const startDate = parseISO(nodeForm.start_date);
    const endDate = parseISO(nodeForm.end_date);
    nodeForm.days = differenceInDays(endDate, startDate) + 1; // 包含结束日
  }
};

// 加载节点数据
const loadNodes = async () => {
  loading.value = true;
  try {
    // 这里应该调用实际的API
    // const res = await getProjectNodes(projectId.value);
    // nodes.value = res.data;
    
    // 模拟数据，实际项目应删除
    setTimeout(() => {
      nodes.value = [
        {
          id: 1,
          name: '需求分析',
          description: '收集和分析项目需求，确定项目范围和目标',
          status: 'completed',
          start_date: '2023-11-01',
          end_date: '2023-11-10',
          days: 10,
          owner: '张三'
        },
        {
          id: 2,
          name: '系统设计',
          description: '根据需求进行系统架构设计和数据库设计',
          status: 'in_progress',
          start_date: '2023-11-11',
          end_date: '2023-11-25',
          days: 15,
          owner: '李四'
        },
        {
          id: 3,
          name: '开发阶段',
          description: '进行代码开发和单元测试',
          status: 'pending',
          start_date: '2023-11-26',
          end_date: '2023-12-15',
          days: 20,
          owner: '王五'
        }
      ];
      loading.value = false;
    }, 500);
  } catch (error) {
    ElMessage.error('加载节点数据失败');
    console.error('加载节点数据失败:', error);
    loading.value = false;
  }
};

// 显示添加节点对话框
const showAddNodeDialog = () => {
  nodeDialog.isEdit = false;
  nodeDialog.currentId = null;
  Object.assign(nodeForm, {
    name: '',
    description: '',
    status: 'pending',
    start_date: undefined,
    end_date: undefined,
    days: undefined,
    owner: ''
  });
  nodeDialog.visible = true;
};

// 编辑节点
const editNode = (node: Node) => {
  nodeDialog.isEdit = true;
  nodeDialog.currentId = node.id;
  Object.assign(nodeForm, JSON.parse(JSON.stringify(node)));
  nodeDialog.visible = true;
};

// 确认删除节点
const confirmDeleteNode = (node: Node) => {
  ElMessageBox.confirm(
    `确定要删除节点 "${node.name}" 吗？`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
    .then(() => {
      deleteNode(node.id);
    })
    .catch(() => {
      // 用户取消操作
    });
};

// 删除节点
const deleteNode = async (id: number) => {
  try {
    // 实际项目中应该调用API
    // await deleteProjectNode(projectId.value, id);
    
    // 模拟删除操作
    nodes.value = nodes.value.filter(node => node.id !== id);
    ElMessage.success('删除成功');
  } catch (error) {
    ElMessage.error('删除节点失败');
    console.error('删除节点失败:', error);
  }
};

// 保存节点
const saveNode = async () => {
  if (!nodeFormRef.value) return;
  
  await nodeFormRef.value.validate(async (valid: boolean) => {
    if (!valid) {
      return;
    }
    
    saving.value = true;
    try {
      // 实际项目中应调用相应API
      if (nodeDialog.isEdit && nodeDialog.currentId) {
        // await updateProjectNode(projectId.value, nodeDialog.currentId, nodeForm);
        // 模拟更新
        const index = nodes.value.findIndex(n => n.id === nodeDialog.currentId);
        if (index !== -1) {
          nodes.value[index] = {
            ...nodes.value[index],
            ...nodeForm,
            id: nodeDialog.currentId
          } as Node;
        }
      } else {
        // await createProjectNode(projectId.value, nodeForm);
        // 模拟添加
        const newNode: Node = {
          id: Math.floor(Math.random() * 1000) + 10, // 随机生成ID，实际项目应由后端生成
          ...nodeForm as any
        };
        nodes.value.push(newNode);
      }
      
      ElMessage.success(nodeDialog.isEdit ? '更新成功' : '添加成功');
      nodeDialog.visible = false;
    } catch (error) {
      ElMessage.error(nodeDialog.isEdit ? '更新节点失败' : '添加节点失败');
      console.error('保存节点失败:', error);
    } finally {
      saving.value = false;
    }
  });
};

onMounted(() => {
  loadNodes();
});

// 监听路由变化，重新加载数据
watch(() => route.params.id, (newId) => {
  if (newId) {
    loadNodes();
  }
});
</script>

<style scoped>
.project-nodes-container {
  margin-bottom: 20px;
}

.page-actions {
  margin-bottom: 20px;
  display: flex;
  justify-content: flex-end;
}

.node-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.node-item {
  display: flex;
  background-color: #f5f7fa;
  border-radius: 8px;
  overflow: hidden;
}

.node-index {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  background-color: #409eff;
  color: white;
  font-weight: bold;
  font-size: 18px;
}

.node-content {
  flex: 1;
  padding: 16px;
}

.node-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.node-name {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.node-description {
  color: #606266;
  margin-bottom: 12px;
  line-height: 1.5;
}

.node-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 12px;
}

.meta-item {
  display: flex;
  align-items: center;
}

.meta-label {
  color: #909399;
  margin-right: 8px;
}

.meta-value {
  color: #606266;
  font-weight: 500;
}

.node-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}
</style> 