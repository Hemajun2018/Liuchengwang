// 节点详情页面逻辑
const { request } = require('../../utils/request');
const { isLoggedIn } = require('../../utils/auth');

Page({
  data: {
    projectInfo: null,
    element: null,
    loading: true,
    errorMessage: '',
    lastLoadTime: 0 // 添加上次加载时间戳
  },

  onLoad(options) {
    // 检查是否已登录
    if (!isLoggedIn()) {
      wx.redirectTo({
        url: '/pages/index/index'
      });
      return;
    }
    
    // 获取项目信息
    const projectInfo = getApp().globalData.projectInfo;
    
    // 获取元素ID
    const id = options.id;
    
    // 如果有项目ID和节点ID，跳转到详情页面
    if (id && projectInfo && projectInfo.id) {
      console.log('跳转到节点详情页', id, projectInfo.id);
      wx.redirectTo({
        url: `/pages/node/detail?nodeId=${id}&projectId=${projectInfo.id}`
      });
      return;
    }
    
    // 如果只有节点ID但没有项目ID，从本地存储获取项目ID
    if (id && !projectInfo) {
      const cachedProject = wx.getStorageSync('projectInfo');
      if (cachedProject && cachedProject.id) {
        console.log('从缓存获取项目信息，跳转到节点详情页', id, cachedProject.id);
        wx.redirectTo({
          url: `/pages/node/detail?nodeId=${id}&projectId=${cachedProject.id}`
        });
        return;
      }
    }
    
    this.setData({ 
      projectInfo,
      lastLoadTime: Date.now() // 记录加载时间
    });
    
    // 加载元素详情
    this.loadElementDetail(id);
  },
  
  // 页面显示时刷新数据
  onShow() {
    // 如果有元素ID并且距离上次加载超过3秒
    if (this.data.element && this.data.element.id) {
      const now = Date.now();
      if (now - this.data.lastLoadTime > 3000) {
        console.log('页面重新显示，静默刷新数据');
        this.refreshDataSilently(this.data.element.id);
        this.setData({ lastLoadTime: now });
      }
    }
  },
  
  // 静默刷新数据
  refreshDataSilently(id) {
    // 从全局状态获取最新元素
    const elements = getApp().globalData.elements || [];
    const freshElement = elements.find(item => item.id == id);
    
    if (freshElement) {
      console.log('从全局状态获取到更新的元素数据:', freshElement);
      this.setData({
        element: freshElement
      });
      return;
    }
    
    // 如果全局状态中没有，尝试从API静默获取
    request({
      url: `/api/elements/${id}`,
      method: 'GET'
    })
      .then(res => {
        console.log('API获取到更新的元素数据:', res.data);
        this.setData({
          element: res.data
        });
      })
      .catch(err => {
        console.error('静默刷新数据失败:', err);
        // 失败时不更新UI也不显示错误
      });
  },
  
  // 加载元素详情
  loadElementDetail(id) {
    this.setData({ loading: true, errorMessage: '' });
    
    // 从全局状态获取元素
    const elements = getApp().globalData.elements || [];
    const element = elements.find(item => item.id == id);
    
    if (element) {
      this.setData({
        element,
        loading: false
      });
    } else {
      // 如果全局状态中没有，则从API获取
      request({
        url: `/api/elements/${id}`,
        method: 'GET'
      })
        .then(res => {
          const element = res.data;
          
          this.setData({
            element,
            loading: false
          });
        })
        .catch(err => {
          this.setData({
            loading: false,
            errorMessage: err.message || '加载详情失败'
          });
        });
    }
  },
  
  // 返回上一页
  onBack() {
    wx.navigateBack();
  }
});