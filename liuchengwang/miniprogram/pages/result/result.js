// 成果详情页面逻辑
const { request } = require('../../utils/request');
const { isLoggedIn } = require('../../utils/auth');

Page({
  data: {
    projectInfo: null,
    element: null,
    files: [],
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
    this.setData({ projectInfo });
    
    // 获取元素ID
    const id = options.id;
    
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
      
      // 加载相关文件
      this.loadFiles(id);
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
          
          // 加载相关文件
          this.loadFiles(id);
        })
        .catch(err => {
          this.setData({
            loading: false,
            errorMessage: err.message || '加载详情失败'
          });
        });
    }
  },
  
  // 加载相关文件
  loadFiles(elementId) {
    request({
      url: `/api/elements/${elementId}/files`,
      method: 'GET'
    })
      .then(res => {
        // 处理文件大小显示
        const files = (res.data || []).map(file => {
          file.size_text = this.formatFileSize(file.size);
          return file;
        });
        
        this.setData({ files });
      })
      .catch(err => {
        console.error('加载文件失败', err);
      });
  },
  
  // 格式化文件大小
  formatFileSize(size) {
    if (size < 1024) {
      return size + 'B';
    } else if (size < 1024 * 1024) {
      return (size / 1024).toFixed(2) + 'KB';
    } else if (size < 1024 * 1024 * 1024) {
      return (size / (1024 * 1024)).toFixed(2) + 'MB';
    } else {
      return (size / (1024 * 1024 * 1024)).toFixed(2) + 'GB';
    }
  },
  
  // 下载文件
  downloadFile(e) {
    const fileId = e.currentTarget.dataset.id;
    const file = this.data.files.find(item => item.id === fileId);
    
    if (!file) {
      wx.showToast({
        title: '文件不存在',
        icon: 'none'
      });
      return;
    }
    
    // 在模拟模式下，只显示提示信息
    wx.showToast({
      title: '模拟模式：文件下载功能不可用',
      icon: 'none',
      duration: 2000
    });
  },
  
  // 返回上一页
  onBack() {
    wx.navigateBack();
  }
});