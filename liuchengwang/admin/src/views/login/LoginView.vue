<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <h1>流程王</h1>
        <h2>管理系统</h2>
      </div>
      
      <el-form 
        ref="loginFormRef" 
        :model="loginForm" 
        :rules="loginRules" 
        class="login-form"
      >
        <el-form-item prop="username">
          <el-input 
            v-model="loginForm.username" 
            placeholder="用户名" 
            prefix-icon="User"
          />
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input 
            v-model="loginForm.password" 
            type="password" 
            placeholder="密码" 
            prefix-icon="Lock"
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        
        <el-form-item>
          <el-button 
            type="primary" 
            :loading="loading" 
            class="login-button" 
            @click="handleLogin"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import { login } from '../../api/auth';

const router = useRouter();
const loading = ref(false);
const loginFormRef = ref<FormInstance>();

// 登录表单数据
const loginForm = reactive({
  username: '',
  password: ''
});

// 表单验证规则
const loginRules = reactive<FormRules>({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度应为3-20个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度应为6-20个字符', trigger: 'blur' }
  ]
});

// 处理登录
const handleLogin = async () => {
  if (!loginFormRef.value) return;
  
  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        loading.value = true;
        
        // 调用登录API
        const response = await login(loginForm);
        console.log('登录成功，获取到的数据:', response);
        
        if (response && response.token) {
          // 存储token和用户信息
          localStorage.setItem('token', response.token);
          localStorage.setItem('userInfo', JSON.stringify(response.user));
          
          // 跳转到首页
          router.push('/');
          
          // 显示成功消息
          ElMessage.success('登录成功');
        } else {
          throw new Error('登录响应数据格式错误');
        }
      } catch (error: any) {
        console.error('登录失败:', error);
        // 错误处理已经在request.ts的响应拦截器中处理
      } finally {
        loading.value = false;
      }
    }
  });
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f0f2f5;
  background: linear-gradient(135deg, #3A7BFF 0%, #6AA1FF 100%);
}

.login-box {
  width: 400px;
  padding: 40px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.login-header h1 {
  font-size: 36px;
  color: #3A7BFF;
  margin: 0;
  margin-bottom: 10px;
}

.login-header h2 {
  font-size: 24px;
  color: #303133;
  margin: 0;
}

.login-form {
  margin-top: 30px;
}

.login-button {
  width: 100%;
}
</style> 