<template>
  <el-tag :type="tagType" size="small">{{ roleName }}</el-tag>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { UserRole } from '../types/api';
import { getRoleName, getRoleTagType } from '../utils/permissions';

const props = defineProps<{
  role: UserRole;
}>();

const roleName = computed(() => getRoleName(props.role));
const tagType = computed(() => getRoleTagType(props.role));
</script> 