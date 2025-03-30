const app = getApp();
const { request } = require('../../utils/request');
const cacheManager = require('../../utils/cache');
const tokenManager = require('../../utils/token');

Page({
  data: {
    projectId: '',
    projectInfo: null,
    nodes: [],
    loading: true,
    hasPrerequisite: false,
    hasResult: false
  },

  onLoad(options) {
    console.log('项目页面加载, options:', options);
    const { projectId } = options;
    
    if (!projectId) {
      console.log('缺少项目ID, 重定向到登录页面');
      wx.showToast({
        title: '缺少项目ID',
        icon: 'none'
      });
      wx.redirectTo({
        url: '/pages/index/index'
      });
      return;
    }
    
    console.log('设置项目ID:', projectId);
    this.setData({ projectId });
    this.loadProjectInfo();
  },
  
  onShow() {
    console.log('项目页面显示');
    // 每次显示页面时重新加载节点列表，但使用静默刷新
    if (this.data.projectId) {
      this.loadNodeList(true);
    }
  },
  
  loadProjectInfo() {
    console.log('加载项目信息');
    this.setData({ loading: true });
    
    // 生成缓存键
    const cacheKey = cacheManager.createProjectCacheKey(this.data.projectId, 'info');
    
    // 先尝试从本地获取
    const cachedInfo = cacheManager.getCache(cacheKey);
    const localProjectInfo = wx.getStorageSync('projectInfo');
    
    if (cachedInfo || (localProjectInfo && localProjectInfo.id === this.data.projectId)) {
      const projectInfo = cachedInfo || localProjectInfo;
      console.log('从本地获取项目信息:', projectInfo);
      
      this.setData({
        projectInfo,
        hasPrerequisite: !!projectInfo.deliverables,
        hasResult: !!(projectInfo.results && projectInfo.results.length > 0),
        loading: false
      });
      
      // 加载节点列表
      this.loadNodeList();
      
      // 静默刷新项目信息，更新缓存
      this.refreshProjectInfo(true);
      return;
    }
    
    // 本地没有缓存，请求服务器
    this.refreshProjectInfo(false);
  },
  
  // 刷新项目信息
  refreshProjectInfo(isSilent = false) {
    console.log('从服务器获取项目信息');
    
    if (!isSilent) {
      this.setData({ loading: true });
    }
    
    request({
      url: `/api/projects/${this.data.projectId}`,
      method: 'GET',
      showAuthDialog: !isSilent, // 静默请求不显示认证对话框
      silentRefresh: isSilent     // 静默刷新缓存
    })
    .then(projectInfo => {
      console.log('获取项目信息成功:', projectInfo);
      
      // 保存到本地缓存
      cacheManager.setCache(
        cacheManager.createProjectCacheKey(this.data.projectId, 'info'), 
        projectInfo
      );
      
      // 保存到本地存储（兼容旧代码）
      wx.setStorageSync('projectInfo', projectInfo);
      
      if (!isSilent) {
        this.setData({
          projectInfo,
          hasPrerequisite: !!projectInfo.deliverables,
          hasResult: !!(projectInfo.results && projectInfo.results.length > 0),
          loading: false
        });
        
        // 加载节点列表
        this.loadNodeList();
      }
    })
    .catch(error => {
      console.error('请求项目信息失败:', error);
      
      if (!isSilent) {
        if (localProjectInfo && localProjectInfo.id === this.data.projectId) {
          // 如果有本地存储，使用本地存储
          this.setData({ 
            loading: false,
            projectInfo: localProjectInfo,
            hasPrerequisite: !!localProjectInfo.deliverables,
            hasResult: !!(localProjectInfo.results && localProjectInfo.results.length > 0)
          });
          
          // 加载节点列表
          this.loadNodeList();
        } else {
          wx.showToast({
            title: '获取项目信息失败',
            icon: 'none'
          });
          
          this.setData({ loading: false });
          
          // 不再自动跳转回登录页，让用户自己决定是否退出
          // 而是提示用户重新登录
          wx.showModal({
            title: '认证失败',
            content: '获取项目信息失败，是否返回登录页面？',
            success: (res) => {
              if (res.confirm) {
                wx.redirectTo({
                  url: '/pages/index/index'
                });
              }
            }
          });
        }
      }
    });
  },
  
  loadNodeList(isSilent = false) {
    console.log('加载节点列表');
    
    if (!isSilent) {
      this.setData({ loading: true });
    }
    
    // 生成缓存键
    const cacheKey = cacheManager.createProjectCacheKey(this.data.projectId, 'nodes');
    
    // 先尝试从缓存获取
    const cachedNodes = cacheManager.getCache(cacheKey);
    if (cachedNodes) {
      console.log('从缓存加载节点列表:', cachedNodes);
      
      if (!isSilent) {
        this.setData({
          nodes: cachedNodes,
          loading: false
        });
      }
      
      // 从节点中提取成果数据
      this.extractAndSaveResults(cachedNodes);
      
      // 静默更新缓存
      this.refreshNodeList(true);
      return;
    }
    
    // 缓存不存在，请求新数据
    this.refreshNodeList(isSilent);
  },
  
  // 刷新节点列表
  refreshNodeList(isSilent = false) {
    if (!isSilent) {
      this.setData({ loading: true });
    }
    
    request({
      url: `/api/projects/${this.data.projectId}/nodes`,
      method: 'GET',
      showAuthDialog: !isSilent, // 静默请求不显示认证对话框
      silentRefresh: isSilent     // 静默刷新缓存
    })
    .then(nodes => {
      console.log('获取节点列表成功:', nodes);
      
      // 缓存节点数据
      cacheManager.setCache(
        cacheManager.createProjectCacheKey(this.data.projectId, 'nodes'),
        nodes
      );
      
      if (!isSilent) {
        this.setData({
          nodes,
          loading: false
        });
      }
      
      // 从节点中提取成果数据
      this.extractAndSaveResults(nodes);
    })
    .catch(error => {
      console.error('请求节点列表失败:', error);
      
      if (!isSilent) {
        wx.showToast({
          title: '获取节点列表失败',
          icon: 'none'
        });
        
        this.setData({ loading: false });
      }
    });
  },
  
  // 从节点中提取成果数据
  extractAndSaveResults(nodes) {
    if (!nodes || nodes.length === 0) return;
    
    // 从节点中查找关联的成果数据
    const results = [];
    nodes.forEach(node => {
      if (node.results && node.results.length > 0) {
        results.push(...node.results);
      }
    });
    
    if (results.length > 0) {
      console.log('从节点中提取的成果数据:', results);
      
      // 更新项目信息
      const projectInfo = wx.getStorageSync('projectInfo') || {};
      projectInfo.results = results;
      
      // 保存到本地存储
      wx.setStorageSync('projectInfo', projectInfo);
    }
  },
  
  // 格式化日期
  formatDate(date) {
    if (!date) return '';
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('zh-CN');
  },
  
  // 获取项目状态文本
  getProjectStatusText(status) {
    console.log('获取项目状态文本, status:', status);
    const statusMap = {
      0: '未开始',
      1: '进行中',
      2: '已完成',
      3: '已延期'
    };
    return statusMap[status] || '未知状态';
  },
  
  // 获取节点状态文本
  getNodeStatusText(status) {
    console.log('获取节点状态文本, status:', status);
    const statusMap = {
      'not_started': '未开始',
      'in_progress': '进行中',
      'completed': '已完成',
      'delayed': '已延期',
      'blocked': '已阻塞'
    };
    return statusMap[status] || '未知状态';
  },
  
  // 获取节点状态样式类
  getNodeStatusClass(status) {
    console.log('获取节点状态样式类, status:', status);
    const statusClassMap = {
      'not_started': '',
      'in_progress': 'in-progress',
      'completed': 'completed',
      'delayed': 'delayed'
    };
    return statusClassMap[status] || '';
  },
  
  // 跳转到前置条件详情页
  goToPrerequisiteDetail() {
    console.log('跳转到前置条件详情页');
    wx.navigateTo({
      url: `/pages/prerequisite/detail?projectId=${this.data.projectId}`
    });
  },
  
  // 跳转到节点详情页
  goToNodeDetail(e) {
    const nodeId = e.currentTarget.dataset.id;
    const type = e.currentTarget.dataset.type || 'node';
    console.log('跳转到节点详情页, nodeId:', nodeId, 'type:', type);
    
    // 根据类型跳转到不同的页面
    if (type === 'issue') {
      // 跳转到问题详情页
      wx.navigateTo({
        url: `/pages/problem/detail?nodeId=${nodeId}&projectId=${this.data.projectId}`
      });
    } else if (type === 'material') {
      // 跳转到材料详情页
      wx.navigateTo({
        url: `/pages/material/detail?nodeId=${nodeId}&projectId=${this.data.projectId}`
      });
    } else {
      // 跳转到节点详情页（包含交付内容）
      wx.navigateTo({
        url: `/pages/node/detail?nodeId=${nodeId}&projectId=${this.data.projectId}`
      });
    }
  },
  
  // 跳转到成果详情页
  goToResultDetail() {
    console.log('跳转到成果详情页');
    wx.navigateTo({
      url: `/pages/result/index?projectId=${this.data.projectId}`
    });
  },
  
  // 退出登录
  logout() {
    console.log('退出登录');
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          console.log('用户点击确定');
          // 清除本地存储的项目信息
          wx.removeStorageSync('projectInfo');
          
          // 清除token
          tokenManager.clearToken();
          
          // 清除项目相关缓存
          const cacheKeyPattern = `cache_project_${this.data.projectId}`;
          cacheManager.clearAllCache([cacheKeyPattern]);
          
          // 重置全局数据
          app.globalData.projectInfo = null;
          
          // 返回到首页
          wx.redirectTo({
            url: '/pages/index/index'
          });
        } else if (res.cancel) {
          console.log('用户点击取消');
        }
      }
    });
  }
}); 