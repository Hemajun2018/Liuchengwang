<script setup lang="ts">
import { ref, watch } from 'vue';
import type { FormInstance } from 'element-plus';
import { IssueStatus } from '@/api/node';

const props = defineProps<{
  initialData?: {
    content?: string;
    status?: IssueStatus;
    startDate?: string | null;
    endDate?: string | null;
    durationDays?: number | null;
  };
}>();

const emit = defineEmits<{
  (e: 'submit', data: {
    content: string;
    status: IssueStatus;
    start_date: string | null;
    expected_end_date: string | null;
    duration_days: number | null;
  }): void;
  (e: 'cancel'): void;
}>();

const formRef = ref<FormInstance>();
const form = ref({
  content: '',
  status: IssueStatus.PENDING,
  start_date: null as string | null,
  expected_end_date: null as string | null,
  duration_days: null as number | null
});

// 重置表单为初始状态或根据props更新表单
const resetForm = () => {
  if (!props.initialData) {
    form.value = {
      content: '',
      status: IssueStatus.PENDING,
      start_date: null,
      expected_end_date: null,
      duration_days: null
    };
  } else {
    form.value = {
      content: props.initialData.content || '',
      status: props.initialData.status || IssueStatus.PENDING,
      start_date: props.initialData.startDate || null,
      expected_end_date: props.initialData.endDate || null,
      duration_days: props.initialData.durationDays || null
    };
  }
};

// 初始化表单
resetForm();

// 监听props变化，重置表单
watch(() => props.initialData, (newVal) => {
  resetForm();
}, { deep: true });

// 表单验证规则
const rules = {
  content: [
    { required: true, message: '请输入问题描述', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择问题状态', trigger: 'change' }
  ],
  start_date: [
    { required: false, message: '请选择开始日期', trigger: 'change' }
  ],
  expected_end_date: [
    { required: false, message: '请选择预计结束日期', trigger: 'change' },
    {
      validator: (_: any, value: string, callback: Function) => {
        if (form.value.start_date && value) {
          const start = new Date(form.value.start_date);
          const end = new Date(value);
          if (end < start) {
            callback(new Error('结束日期不能早于开始日期'));
          } else {
            callback();
          }
        } else {
          callback();
        }
      },
      trigger: 'change'
    }
  ]
};

const statusOptions = [
  { value: IssueStatus.PENDING, label: '待处理' },
  { value: IssueStatus.RESOLVED, label: '已解决' }
];

// 监听日期变化，自动计算持续天数
watch(
  [() => form.value.start_date, () => form.value.expected_end_date],
  ([newStartDate, newEndDate]) => {
    if (newStartDate && newEndDate) {
      const start = new Date(newStartDate);
      const end = new Date(newEndDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      form.value.duration_days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } else {
      form.value.duration_days = null;
    }
  }
);

// 监听持续天数变化，自动计算结束日期
watch(() => form.value.duration_days, (newDuration) => {
  if (form.value.start_date && newDuration) {
    const start = new Date(form.value.start_date);
    const end = new Date(start);
    end.setDate(start.getDate() + newDuration);
    form.value.expected_end_date = end.toISOString().split('T')[0];
  }
});

const onSubmit = async () => {
  if (!formRef.value) return;
  
  try {
    await formRef.value.validate();
    emit('submit', {
      content: form.value.content,
      status: form.value.status,
      start_date: form.value.start_date,
      expected_end_date: form.value.expected_end_date,
      duration_days: form.value.duration_days
    });
  } catch (error) {
    console.error('表单验证失败:', error);
  }
};

const onCancel = () => {
  emit('cancel');
};

// 禁用早于开始日期的日期
const disableEndDateBefore = (time: Date) => {
  if (!form.value.start_date) return false;
  return time.getTime() < new Date(form.value.start_date).getTime();
};
</script>

<template>
  <el-form
    ref="formRef"
    :model="form"
    :rules="rules"
    label-width="100px"
  >
    <el-form-item label="问题描述" prop="content">
      <el-input
        v-model="form.content"
        type="textarea"
        :rows="3"
        placeholder="请输入问题描述"
      />
    </el-form-item>

    <el-form-item label="问题状态" prop="status">
      <el-select v-model="form.status" placeholder="请选择问题状态">
        <el-option
          v-for="item in statusOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </el-form-item>

    <el-form-item label="开始日期" prop="start_date">
      <el-date-picker
        v-model="form.start_date"
        type="date"
        placeholder="选择开始日期"
        format="YYYY-MM-DD"
        value-format="YYYY-MM-DD"
      />
    </el-form-item>

    <el-form-item label="结束日期" prop="expected_end_date">
      <el-date-picker
        v-model="form.expected_end_date"
        type="date"
        placeholder="选择结束日期"
        format="YYYY-MM-DD"
        value-format="YYYY-MM-DD"
        :disabled-date="disableEndDateBefore"
      />
    </el-form-item>

    <el-form-item label="持续天数" prop="duration_days">
      <el-input-number
        v-model="form.duration_days"
        :min="1"
        :disabled="!form.start_date"
        controls-position="right"
      />
    </el-form-item>

    <el-form-item>
      <el-button type="primary" @click="onSubmit">确定</el-button>
      <el-button @click="onCancel">取消</el-button>
    </el-form-item>
  </el-form>
</template> 