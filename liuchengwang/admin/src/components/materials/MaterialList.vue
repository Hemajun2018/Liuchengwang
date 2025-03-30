<template>
  <div class="material-list">
    <div v-if="materials.length === 0" class="empty-tip">
      暂无材料
    </div>
    <el-card v-for="material in materials" :key="material.id" class="material-item">
      <template #header>
        <div class="material-header">
          <h3 class="material-title">{{ material.name }}</h3>
          <div class="material-status">
            <el-tag :type="getStatusType(material.status)">
              {{ getStatusLabel(material.status) }}
            </el-tag>
          </div>
        </div>
      </template>
      <div class="material-content">
        <div class="material-description">
          {{ material.description }}
        </div>
        <div class="material-dates" v-if="material.start_date || material.expected_end_date">
          <p v-if="material.start_date">
            <span class="date-label">开始日期：</span>
            <span class="date-value">{{ formatDate(material.start_date) }}</span>
          </p>
          <p v-if="material.expected_end_date">
            <span class="date-label">预计结束日期：</span>
            <span class="date-value">{{ formatDate(material.expected_end_date) }}</span>
          </p>
          <p v-if="material.duration_days">
            <span class="date-label">持续天数：</span>
            <span class="date-value">{{ material.duration_days }} 天</span>
          </p>
        </div>
      </div>
      <div class="material-actions">
        <el-button size="small" type="primary" @click="handleEdit(material)">编辑</el-button>
        <el-button size="small" type="danger" @click="handleDelete(material.id)">删除</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { NodeStatus } from '@/api/node';
import type { Material } from '@/api/node';

const props = defineProps<{
  materials: Material[];
}>();

const emit = defineEmits<{
  (e: 'edit', material: Material): void;
  (e: 'delete', id: number): void;
}>();

// 格式化日期
const formatDate = (date: string | Date) => {
  if (!date) return '';
  const dateObj = new Date(date);
  return dateObj.toLocaleDateString('zh-CN');
};

// 根据状态获取标签类型
const getStatusType = (status: NodeStatus) => {
  switch (status) {
    case NodeStatus.NOT_STARTED:
      return 'info';
    case NodeStatus.IN_PROGRESS:
      return 'warning';
    case NodeStatus.COMPLETED:
      return 'success';
    case NodeStatus.DELAYED:
      return 'danger';
    default:
      return 'info';
  }
};

// 根据状态获取标签文本
const getStatusLabel = (status: NodeStatus) => {
  switch (status) {
    case NodeStatus.NOT_STARTED:
      return '未开始';
    case NodeStatus.IN_PROGRESS:
      return '进行中';
    case NodeStatus.COMPLETED:
      return '已完成';
    case NodeStatus.DELAYED:
      return '已延期';
    default:
      return '未知状态';
  }
};

// 处理编辑事件
const handleEdit = (material: Material) => {
  emit('edit', material);
};

// 处理删除事件
const handleDelete = (id: number) => {
  emit('delete', id);
};
</script>

<style scoped>
.material-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.empty-tip {
  text-align: center;
  color: #999;
  padding: 20px 0;
}

.material-item {
  margin-bottom: 15px;
}

.material-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.material-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.material-content {
  margin-bottom: 15px;
}

.material-description {
  margin-bottom: 10px;
  line-height: 1.5;
}

.material-dates {
  color: #666;
  font-size: 14px;
}

.material-dates p {
  margin: 5px 0;
}

.date-label {
  font-weight: 500;
}

.material-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style> 