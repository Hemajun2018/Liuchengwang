<template>
  <div class="dashboard-container">
    <el-row :gutter="16">
      <!-- 统计卡片 -->
      <el-col :xs="12" :sm="12" :md="8" :lg="8" v-for="(item, index) in statisticsData" :key="index">
        <el-card class="statistics-card" :body-style="{ padding: '16px' }">
          <div class="card-content">
            <div class="card-icon" :style="{ backgroundColor: item.color }">
              <el-icon><component :is="item.icon" /></el-icon>
            </div>
            <div class="card-info">
              <div class="card-title">{{ item.title }}</div>
              <div class="card-value">
                <el-skeleton v-if="loading" :rows="1" animated />
                <template v-else>{{ item.value }}</template>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getProjectList } from '@/api/project';
import { ElMessage } from 'element-plus';

const router = useRouter();
const loading = ref(true);

// 统计数据
const statisticsData = ref([
  {
    title: '总项目数',
    value: 0,
    icon: 'Folder',
    color: '#409EFF'
  },
  {
    title: '进行中项目',
    value: 0,
    icon: 'Loading',
    color: '#67C23A'
  },
  {
    title: '已完成项目',
    value: 0,
    icon: 'Check',
    color: '#E6A23C'
  }
]);

// 获取项目数据
const fetchProjectData = async () => {
  try {
    loading.value = true;
    const response = await getProjectList();
    
    // 判断响应数据是否符合预期
    if (response && response.items && Array.isArray(response.items)) {
      const projects = response.items;
      
      // 更新统计数据
      statisticsData.value[0].value = projects.length; // 总项目数
      
      // 计算进行中的项目数量（状态为1表示进行中）
      const inProgressProjects = projects.filter(project => project.status === 1);
      statisticsData.value[1].value = inProgressProjects.length;
      
      // 计算已完成的项目数量（状态为2表示已完成）
      const completedProjects = projects.filter(project => project.status === 2);
      statisticsData.value[2].value = completedProjects.length;
    } else {
      console.error('项目数据格式不符合预期:', response);
    }
  } catch (error) {
    console.error('获取项目数据失败:', error);
    // 发生错误时显示错误消息
    ElMessage.error('获取项目数据失败，请刷新页面重试');
  } finally {
    // 无论成功或失败，都关闭加载状态
    loading.value = false;
  }
};

// 页面加载时获取数据
onMounted(() => {
  fetchProjectData();
});
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
}

.statistics-card {
  margin-bottom: 20px;
  height: 100%;
}

.card-content {
  display: flex;
  align-items: center;
}

.card-icon {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 15px;
}

.card-icon .el-icon {
  font-size: 30px;
  color: #fff;
}

.card-info {
  flex: 1;
}

.card-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.card-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}
</style> 