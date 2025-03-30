// 节点详情页面逻辑
const { request } = require('../../utils/request');
const { isLoggedIn } = require('../../utils/auth');

Page({
  data: {
    projectInfo: null,
    element: null,
    loading: true,
    errorMessage: ''
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
    
    this.setData({ projectInfo });
    
    // 加载元素详情
    this.loadElementDetail(id);
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