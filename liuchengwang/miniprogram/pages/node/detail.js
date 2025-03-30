const app = getApp();
const { request } = require('../../utils/request');
const { isLoggedIn } = require('../../utils/auth');
const cacheManager = require('../../utils/cache');

Page({
  data: {
    projectId: '',
    nodeId: '',
    projectName: '',
    nodeName: '',
    nodeStatus: 'not_started',
    nodeStatusText: '未开始',
    deliverables: [],
    loading: true,
    error: null,
    loadingFailed: false,  // 标记API请求是否失败
    lastRefreshTime: 0     // 添加上次刷新时间戳
  },

  onLoad(options) {
    console.log('节点详情页面加载, options:', options);
    const { nodeId, projectId } = options;
    
    // 检查参数有效性
    if (!nodeId || !projectId) {
      wx.showToast({
        title: '参数错误',
        icon: 'none'
      });
      wx.navigateBack();
      return;
    }
    
    this.setData({ 
      nodeId,
      projectId,
      loading: true,
      error: null,
      lastRefreshTime: Date.now() // 初始化刷新时间
    });
    
    // 获取项目和节点信息
    this.initPageData();
  },
  
  onShow() {
    if (this.data.nodeId) {
      const now = Date.now();
      // 每次页面显示都刷新交付内容，确保实时性
      console.log('节点详情页显示，刷新交付内容');
      
      // 如果距离上次刷新超过1.5秒，则刷新全部数据
      if (now - this.data.lastRefreshTime > 1500) {
        this.silentRefreshAll();
        this.setData({ lastRefreshTime: now });
      } else {
        // 否则只刷新交付内容
        this.loadDeliverables(true);
      }
    }
  },
  
  // 静默刷新所有数据
  silentRefreshAll() {
    console.log('静默刷新所有节点数据');
    
    // 1. 从全局数据更新节点信息
    this.checkGlobalNodesUpdate();
    
    // 2. 刷新交付内容
    this.loadDeliverables(true);
    
    // 3. 尝试从API刷新节点信息（优先级较低）
    this.refreshNodeFromApi(true);
  },
  
  // 检查全局数据中是否有更新的节点信息
  checkGlobalNodesUpdate() {
    const allNodes = app.globalData.elements || [];
    const freshNode = allNodes.find(item => item.id == this.data.nodeId);
    
    if (freshNode) {
      console.log('从全局数据获取到更新的节点信息:', freshNode);
      const statusText = this.getStatusText(freshNode.status);
      this.setData({
        nodeName: freshNode.name || '',
        nodeStatus: freshNode.status || 'not_started',
        nodeStatusText: statusText
      });
      
      // 缓存节点信息
      const cacheKey = cacheManager.createProjectCacheKey(
        this.data.projectId, 
        'node', 
        this.data.nodeId
      );
      cacheManager.setCache(cacheKey, freshNode);
    }
  },
  
  // 从API刷新节点信息
  refreshNodeFromApi(isSilent = false) {
    console.log('从API刷新节点信息');
    
    request({
      url: `/api/projects/${this.data.projectId}/nodes/${this.data.nodeId}`,
      method: 'GET'
    })
    .then(nodeInfo => {
      console.log('成功刷新节点信息:', nodeInfo);
      
      const statusText = this.getStatusText(nodeInfo.status);
      
      this.setData({
        nodeName: nodeInfo.name || '',
        nodeStatus: nodeInfo.status || 'not_started',
        nodeStatusText: statusText,
        error: null
      });
      
      // 缓存节点信息
      const cacheKey = cacheManager.createProjectCacheKey(
        this.data.projectId, 
        'node', 
        this.data.nodeId
      );
      cacheManager.setCache(cacheKey, nodeInfo);
    })
    .catch(error => {
      console.error('刷新节点信息失败:', error);
      if (!isSilent) {
        // 非静默模式才显示错误
        this.setData({
          error: '刷新节点信息失败'
        });
      }
    });
  },
  
  // 初始化页面数据
  initPageData() {
    console.log('初始化页面数据');
    this.setData({ loading: true, error: null });
    
    // 1. 获取项目名称
    this.loadProjectInfo();
    
    // 2. 获取节点信息
    this.loadNodeInfo();
    
    // 3. 获取交付内容
    this.loadDeliverables();
  },
  
  // 加载项目信息
  loadProjectInfo() {
    // 优先尝试从全局数据和本地存储获取项目信息
    const globalProjectInfo = app.globalData.projectInfo;
    const localProjectInfo = wx.getStorageSync('projectInfo');
    
    if (globalProjectInfo && globalProjectInfo.id === this.data.projectId) {
      console.log('从全局数据获取项目信息:', globalProjectInfo.name);
      this.setData({ 
        projectName: globalProjectInfo.name || '未知项目'
      });
      return;
    }
    
    if (localProjectInfo && localProjectInfo.id === this.data.projectId) {
      console.log('从本地存储获取项目信息:', localProjectInfo.name);
      this.setData({ 
        projectName: localProjectInfo.name || '未知项目'
      });
      return;
    }
    
    // 如果本地没有项目信息，则使用节点名称
    const allNodes = app.globalData.elements || [];
    const node = allNodes.find(item => item.id == this.data.nodeId);
    if (node) {
      this.setData({ 
        projectName: '项目详情'
      });
      return;
    }
    
    // 最后使用默认名称
    this.setData({ 
      projectName: '项目详情'
    });
  },
  
  // 加载节点信息
  loadNodeInfo() {
    // 1. 优先从全局数据中获取节点
    const allNodes = app.globalData.elements || [];
    const node = allNodes.find(item => item.id == this.data.nodeId);
    
    if (node) {
      console.log('从全局数据获取节点信息:', node);
      const statusText = this.getStatusText(node.status);
      this.setData({
        nodeName: node.name || '',
        nodeStatus: node.status || 'not_started',
        nodeStatusText: statusText,
        loading: false
      });
      return;
    }
    
    // 2. 尝试从缓存中获取
    const cacheKey = cacheManager.createProjectCacheKey(
      this.data.projectId, 
      'node', 
      this.data.nodeId
    );
    
    const cachedNode = cacheManager.getCache(cacheKey);
    if (cachedNode) {
      console.log('从缓存获取节点信息:', cachedNode);
      const statusText = this.getStatusText(cachedNode.status);
      this.setData({
        nodeName: cachedNode.name || '',
        nodeStatus: cachedNode.status || 'not_started',
        nodeStatusText: statusText,
        loading: false
      });
      return;
    }
    
    // 3. 尝试从API获取（可能会失败）
    this.fetchNodeFromApi();
  },
  
  // 从API获取节点信息
  fetchNodeFromApi() {
    console.log('从API获取节点信息');
    // 避免重复请求
    if (this.data.loadingFailed) {
      this.setData({
        nodeName: `节点${this.data.nodeId}`,
        nodeStatus: 'not_started',
        nodeStatusText: '未知状态',
        loading: false,
        error: '无法获取节点信息，请检查网络连接或联系管理员'
      });
      return;
    }
    
    request({
      url: `/api/projects/${this.data.projectId}/nodes/${this.data.nodeId}`,
      method: 'GET'
    })
    .then(nodeInfo => {
      console.log('获取节点信息成功:', nodeInfo);
      
      const statusText = this.getStatusText(nodeInfo.status);
      
      this.setData({
        nodeName: nodeInfo.name || '',
        nodeStatus: nodeInfo.status || 'not_started',
        nodeStatusText: statusText,
        loading: false
      });
      
      // 缓存节点信息
      const cacheKey = cacheManager.createProjectCacheKey(
        this.data.projectId, 
        'node', 
        this.data.nodeId
      );
      cacheManager.setCache(cacheKey, nodeInfo);
    })
    .catch(error => {
      console.error('获取节点信息失败:', error);
      
      this.setData({
        nodeName: `节点${this.data.nodeId}`,
        nodeStatus: 'not_started',
        nodeStatusText: '未知状态',
        loadingFailed: true,
        loading: false,
        error: '无法获取节点信息，请检查网络连接或联系管理员'
      });
    });
  },
  
  // 加载交付内容
  loadDeliverables(isSilent = false) {
    if (!isSilent) {
      this.setData({ loading: true });
    }
    
    // 避免重复请求
    if (this.data.loadingFailed && !isSilent) {
      this.setData({
        deliverables: [],
        loading: false,
        error: this.data.error || '无法获取交付内容，请检查网络连接或联系管理员'
      });
      return;
    }
    
    // 尝试从缓存获取
    const cacheKey = cacheManager.createProjectCacheKey(
      this.data.projectId, 
      'deliverables', 
      this.data.nodeId
    );
    
    const cachedDeliverables = cacheManager.getCache(cacheKey);
    if (cachedDeliverables) {
      console.log('从缓存获取交付内容:', cachedDeliverables);
      
      this.setData({
        deliverables: cachedDeliverables,
        loading: false
      });
      
      // 静默更新缓存
      this.fetchDeliverablesFromApi(true);
      return;
    }
    
    // 从API获取
    this.fetchDeliverablesFromApi(isSilent);
  },
  
  // 从API获取交付内容
  fetchDeliverablesFromApi(isSilent = false) {
    console.log('从API获取交付内容');
    
    request({
      url: `/api/projects/${this.data.projectId}/nodes/${this.data.nodeId}/deliverables`,
      method: 'GET'
    })
    .then(deliverables => {
      console.log('获取交付内容成功:', deliverables);
      
      // 处理每个交付内容以确保状态文本
      const processedDeliverables = deliverables.map(item => ({
        ...item,
        status_text: item.status_text || this.getStatusText(item.status)
      }));
      
      this.setData({
        deliverables: processedDeliverables,
        loading: false
      });
      
      // 缓存交付内容
      const cacheKey = cacheManager.createProjectCacheKey(
        this.data.projectId, 
        'deliverables', 
        this.data.nodeId
      );
      cacheManager.setCache(cacheKey, processedDeliverables);
    })
    .catch(error => {
      console.error('获取交付内容失败:', error);
      
      if (!isSilent) {
        this.setData({
          deliverables: [],
          loadingFailed: true,
          loading: false,
          error: '无法获取交付内容，请检查网络连接或联系管理员'
        });
      } else {
        // 静默请求失败则不更新UI
        this.setData({ loading: false });
      }
    });
  },

  // 获取状态文本
  getStatusText(status) {
    // 如果状态是数字，转换为对应的状态码
    if (typeof status === 'number') {
      const numericStatusMap = {
        0: 'not_started',
        1: 'in_progress',
        2: 'completed',
        3: 'blocked'
      };
      status = numericStatusMap[status] || status;
    }
    
    const statusMap = {
      'not_started': '未开始',
      'in_progress': '进行中',
      'completed': '已完成',
      'blocked': '已阻塞',
      'pending': '待处理',
      'delayed': '延期'
    };
    return statusMap[status] || '未知状态';
  },
  
  // 返回上一页
  goBack() {
    wx.navigateBack();
  },

  // 预览附件
  previewAttachment(e) {
    const { url } = e.currentTarget.dataset;
    if (!url) {
      wx.showToast({
        title: '附件地址无效',
        icon: 'none'
      });
      return;
    }

    // 根据文件类型处理预览
    const fileType = this.getFileType(url);
    
    if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'pdf'].includes(fileType)) {
      // 使用文档预览
      wx.showLoading({
        title: '打开文档中...'
      });
      
      wx.downloadFile({
        url,
        success: (res) => {
          wx.hideLoading();
          if (res.statusCode === 200) {
            wx.openDocument({
              filePath: res.tempFilePath,
              success: () => {
                console.log('打开文档成功');
              },
              fail: (error) => {
                console.error('打开文档失败:', error);
                wx.showToast({
                  title: '打开文档失败',
                  icon: 'none'
                });
              }
            });
          }
        },
        fail: (error) => {
          wx.hideLoading();
          console.error('下载文件失败:', error);
          wx.showToast({
            title: '下载文件失败',
            icon: 'none'
          });
        }
      });
    } else if (['jpg', 'jpeg', 'png', 'gif'].includes(fileType)) {
      // 图片预览
      wx.previewImage({
        urls: [url],
        fail: (error) => {
          console.error('预览图片失败:', error);
          wx.showToast({
            title: '预览图片失败',
            icon: 'none'
          });
        }
      });
    } else {
      // 其他类型文件,提示下载
      wx.showModal({
        title: '提示',
        content: '该类型文件暂不支持预览,是否下载?',
        success: (res) => {
          if (res.confirm) {
            wx.downloadFile({
              url,
              success: (res) => {
                if (res.statusCode === 200) {
                  wx.saveFile({
                    tempFilePath: res.tempFilePath,
                    success: (res) => {
                      wx.showToast({
                        title: '文件已保存',
                        icon: 'success'
                      });
                    },
                    fail: (error) => {
                      console.error('保存文件失败:', error);
                      wx.showToast({
                        title: '保存文件失败',
                        icon: 'none'
                      });
                    }
                  });
                }
              },
              fail: (error) => {
                console.error('下载文件失败:', error);
                wx.showToast({
                  title: '下载文件失败',
                  icon: 'none'
                });
              }
            });
          }
        }
      });
    }
  },

  // 获取文件类型
  getFileType(url) {
    if (!url) return '';
    const match = url.match(/\.([^.]+)$/);
    return match ? match[1].toLowerCase() : '';
  }
}); 