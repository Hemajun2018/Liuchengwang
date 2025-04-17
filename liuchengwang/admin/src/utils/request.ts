import axios from 'axios';
import { ElMessage } from 'element-plus';
import router from '../router';

console.log('初始化API请求工具');

// 创建axios实例
const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://www.bllcw.vip/lcw-api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 从localStorage获取token
    const token = localStorage.getItem('token');
    
    // 如果有token则添加到请求头
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
      console.log('添加认证头:', config.headers['Authorization']);
    } else {
      console.log('未找到token，请求未添加认证头');
    }
    
    // 处理日期类型
    if (config.data) {
      // 检查POST请求中的问题数据
      if (config.method === 'post' && config.url?.includes('/issues') && !config.data.content) {
        console.error('警告: POST请求到issues接口缺少content字段:', config.data);
      }
      
      config.data = JSON.parse(JSON.stringify(config.data), (_, value) => {
        if (value instanceof Date) {
          return value.toISOString();
        }
        return value;
      });
    }
    
    console.log('发送请求:', {
      method: config.method,
      url: config.url,
      baseURL: config.baseURL,
      data: config.data
    });
    
    return config;
  },
  (error) => {
    console.error('请求配置错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    // 处理日期类型
    const data = JSON.parse(JSON.stringify(response.data), (_, value) => {
      if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(value)) {
        return new Date(value);
      }
      return value;
    });
    
    response.data = data;
    return response;
  },
  (error) => {
    // 处理错误响应
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          // 处理请求参数错误
          console.error('请求参数错误:', data);
          // 使用普通对象作为配置，而不是直接传递错误信息对象
          ElMessage({
            message: Array.isArray(data.message) ? data.message[0] : (data.message || '请求参数错误'),
            type: 'error'
          });
          break;
          
        case 401:
          // 处理未授权错误
          console.error('未授权:', data);
          localStorage.removeItem('token');
          localStorage.removeItem('userInfo');
          
          if (router.currentRoute.value.path !== '/login') {
            router.push('/login');
            ElMessage({
              message: '登录已过期，请重新登录',
              type: 'error'
            });
          } else {
            ElMessage({
              message: data.message || '用户名或密码错误',
              type: 'error'
            });
          }
          break;
          
        case 403:
          // 处理权限不足错误
          console.error('权限不足:', data);
          ElMessage({
            message: '您没有权限执行此操作',
            type: 'error'
          });
          break;
          
        case 404:
          // 处理资源不存在错误
          console.error('资源不存在:', error.config.url);
          ElMessage({
            message: '请求的资源不存在',
            type: 'error'
          });
          break;
          
        case 500:
          // 处理服务器错误
          console.error('服务器错误:', data);
          ElMessage({
            message: '服务器内部错误，请稍后重试',
            type: 'error'
          });
          break;
          
        default:
          // 处理其他错误
          console.error('请求失败:', data);
          const errorMsg = data.message || '请求失败';
          ElMessage({
            message: Array.isArray(errorMsg) ? errorMsg[0] : errorMsg,
            type: 'error'
          });
      }
    } else if (error.request) {
      // 请求已发出但没有收到响应
      console.error('服务器无响应:', error.request);
      ElMessage({
        message: '服务器无响应，请检查网络连接',
        type: 'error'
      });
    } else {
      // 请求配置出错
      console.error('请求配置错误:', error.message);
      ElMessage({
        message: '请求配置错误',
        type: 'error'
      });
    }
    
    return Promise.reject(error);
  }
);

export default request; 