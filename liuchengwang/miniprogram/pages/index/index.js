// index.js
const app = getApp();
const tokenManager = require('../../utils/token');
const cacheManager = require('../../utils/cache');
const { request } = require('../../utils/request');

Page({
  data: {
    projectId: '',
    password: '',
    loading: false
  },

  // 生命周期函数
  onLoad() {
    console.log('登录页面加载');
    console.log('API地址:', app.globalData.baseUrl);
    
    // 检查是否有缓存的登录信息
    const projectInfo = wx.getStorageSync('projectInfo');
    if (projectInfo && projectInfo.id) {
      // 如果有缓存的项目信息，直接跳转到项目页面
      wx.redirectTo({
        url: `/pages/project/index?projectId=${projectInfo.id}`
      });
    }
  },
  
  onShow() {
    // 检查网络连接
    wx.getNetworkType({
      success: (res) => {
        console.log('当前网络类型:', res.networkType);
      }
    });
  },

  // 项目ID输入事件
  onProjectIdInput(e) {
    this.setData({
      projectId: e.detail.value
    });
  },

  // 密码输入事件
  onPasswordInput(e) {
    this.setData({
      password: e.detail.value
    });
  },

  // 处理登录
  handleLogin() {
    const { projectId, password } = this.data;
    
    // 验证输入
    if (!projectId.trim()) {
      wx.showToast({
        title: '请输入项目ID',
        icon: 'none'
      });
      return;
    }
    
    if (!password.trim()) {
      wx.showToast({
        title: '请输入密码',
        icon: 'none'
      });
      return;
    }
    
    this.setData({ loading: true });
    
    // 使用统一的request方法发送登录请求
    request({
      url: '/projects/verify',  // 移除重复的lcw-api前缀
      method: 'POST',
      data: {
        name: projectId,
        password: password
      }
    })
    .then(data => {
      console.log('登录响应数据:', data);
      
      // 登录成功，保存项目信息
      wx.setStorageSync('projectInfo', data);
      
      // 保存token，如果后端返回了token字段
      if (data.token) {
        // 使用token管理工具保存token
        tokenManager.saveToken(data.token);
        console.log('已保存后端返回的登录令牌');
      } else {
        console.log('后端未返回token，请检查API响应');
        wx.showToast({
          title: '登录异常，请联系管理员',
          icon: 'none'
        });
        return;
      }
      
      // 预加载项目相关数据
      this.preloadProjectData(data.id);
      
      // 跳转到项目页面
      wx.redirectTo({
        url: `/pages/project/index?projectId=${data.id}`
      });
    })
    .catch(err => {
      console.error('登录请求失败:', err);
      wx.showToast({
        title: err.message || '登录失败，请检查项目ID和密码',
        icon: 'none'
      });
    })
    .finally(() => {
      console.log('登录请求完成');
      this.setData({ loading: false });
    });
  },
  
  // 预加载项目相关数据
  preloadProjectData(projectId) {
    console.log('预加载项目数据, 项目ID:', projectId);
    
    // 清除可能存在的旧缓存数据
    const cacheKeyPattern = `cache_project_${projectId}`;
    cacheManager.clearAllCache([cacheKeyPattern]);
    
    // 使用统一的request方法加载项目节点数据
    request({
      url: `/projects/${projectId}/nodes`,  // 移除重复的lcw-api前缀
      method: 'GET'
    })
    .then(data => {
      console.log('预加载节点数据成功:', data);
      const nodes = data;
      
      // 从节点中提取成果数据
      const results = [];
      nodes.forEach(node => {
        if (node.results && node.results.length > 0) {
          results.push(...node.results);
        }
      });
      
      // 缓存节点数据
      const nodesCacheKey = cacheManager.createProjectCacheKey(projectId, 'nodes');
      cacheManager.setCache(nodesCacheKey, nodes);
      
      if (results.length > 0) {
        console.log('从节点中提取的成果数据:', results);
        
        // 更新项目信息
        const projectInfo = wx.getStorageSync('projectInfo') || {};
        projectInfo.results = results;
        
        // 保存到本地存储
        wx.setStorageSync('projectInfo', projectInfo);
        
        // 缓存成果数据
        const resultsCacheKey = cacheManager.createProjectCacheKey(projectId, 'results');
        cacheManager.setCache(resultsCacheKey, results);
      }
    })
    .catch(err => {
      console.error('预加载节点数据失败:', err);
    });
  }
});
