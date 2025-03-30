// index.js
const app = getApp();
const tokenManager = require('../../utils/token');
const cacheManager = require('../../utils/cache');

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
    
    // 发送登录请求
    wx.request({
      url: `${app.globalData.baseUrl}/projects/verify`,
      method: 'POST',
      data: {
        name: projectId,
        password: password
      },
      success: (res) => {
        console.log('登录响应数据:', res.data);
        
        if (res.statusCode === 200 || res.statusCode === 201) {
          // 登录成功，保存项目信息
          wx.setStorageSync('projectInfo', res.data);
          
          // 保存token，如果后端返回了token字段
          if (res.data.token) {
            // 使用token管理工具保存token
            tokenManager.saveToken(res.data.token);
            console.log('已保存登录令牌');
          } else {
            // 为了确保授权机制正常工作，我们创建一个临时token
            const tempToken = `project_${res.data.id}_${new Date().getTime()}`;
            tokenManager.saveToken(tempToken, 12 * 60 * 60); // 临时token有效期12小时
            console.log('已创建临时令牌');
          }
          
          // 预加载项目相关数据
          this.preloadProjectData(res.data.id);
          
          // 跳转到项目页面
          wx.redirectTo({
            url: `/pages/project/index?projectId=${res.data.id}`
          });
        } else {
          // 登录失败
          wx.showToast({
            title: res.data.message || '登录失败，请检查项目ID和密码',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('登录请求失败:', err);
        wx.showToast({
          title: '网络请求失败',
          icon: 'none'
        });
      },
      complete: () => {
        console.log('登录请求完成');
        this.setData({ loading: false });
      }
    });
  },
  
  // 预加载项目相关数据
  preloadProjectData(projectId) {
    console.log('预加载项目数据, 项目ID:', projectId);
    
    // 清除可能存在的旧缓存数据
    const cacheKeyPattern = `cache_project_${projectId}`;
    cacheManager.clearAllCache([cacheKeyPattern]);
    
    // 加载项目节点数据
    wx.request({
      url: `${app.globalData.baseUrl}/projects/${projectId}/nodes`,
      method: 'GET',
      header: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenManager.getToken(false)}` // 不验证token有效性
      },
      success: (res) => {
        if (res.statusCode === 200) {
          console.log('预加载节点数据成功:', res.data);
          const nodes = res.data;
          
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
        } else {
          console.error('预加载节点数据失败:', res);
        }
      },
      fail: (err) => {
        console.error('预加载节点数据请求失败:', err);
      }
    });
  }
});
