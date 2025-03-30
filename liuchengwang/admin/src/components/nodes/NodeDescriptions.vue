<template>
  <div class="node-descriptions-wrapper">
    <div v-for="(desc, index) in descriptions" :key="index" class="description-item-container">
      <el-input
        v-model="descriptions[index]"
        type="textarea"
        :rows="2"
        :placeholder="`请输入描述${index + 1}`"
        class="description-textarea"
      />
      <el-button 
        type="danger" 
        circle 
        size="small" 
        @click="removeDescription(index)"
        class="remove-description-btn"
      >
        <el-icon><Delete /></el-icon>
      </el-button>
    </div>
    <div class="add-btn-container">
      <el-button 
        type="primary" 
        size="small" 
        @click="addDescription"
        class="add-description-btn"
      >
        <el-icon><Plus /></el-icon> 添加描述
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { Plus, Delete } from '@element-plus/icons-vue';

const props = defineProps<{
  modelValue: string[];
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string[]): void;
}>();

const descriptions = ref<string[]>([...props.modelValue]);

// 确保至少有一个描述
if (descriptions.value.length === 0) {
  descriptions.value.push('');
}

// 添加描述
const addDescription = () => {
  descriptions.value.push('');
  emit('update:modelValue', [...descriptions.value]);
};

// 删除描述
const removeDescription = (index: number) => {
  descriptions.value.splice(index, 1);
  // 确保至少有一个描述
  if (descriptions.value.length === 0) {
    descriptions.value.push('');
  }
  emit('update:modelValue', [...descriptions.value]);
};

// 监听描述变化
watch(descriptions, (newVal) => {
  emit('update:modelValue', [...newVal]);
}, { deep: true });

// 监听props变化
watch(() => props.modelValue, (newVal) => {
  if (JSON.stringify(newVal) !== JSON.stringify(descriptions.value)) {
    descriptions.value = [...newVal];
  }
}, { deep: true });
</script>

<style scoped>
.node-descriptions-wrapper {
  width: 100%;
  display: block !important;
}

.description-item-container {
  width: 100%;
  display: grid !important;
  grid-template-columns: 1fr auto !important;
  grid-gap: 10px !important;
  margin-bottom: 15px !important;
}

.description-textarea {
  width: 100% !important;
  display: block !important;
}

.remove-description-btn {
  align-self: flex-start;
  margin-top: 5px;
}

.add-btn-container {
  width: 100%;
  display: block !important;
  margin-top: 10px;
}
</style> 