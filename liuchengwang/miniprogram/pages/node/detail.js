const app = getApp();
const { request } = require('../../utils/request');
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
    loading: true
  },

  onLoad(options) {
    const { nodeId, projectId } = options;
    
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
      projectId
    });
    
    this.loadNodeDetail();
  },
  
  onShow() {
    // 每次显示页面时重新加载数据
    if (this.data.nodeId) {
      this.loadNodeDetail();
    }
  },
  
  // 加载节点详情
  loadNodeDetail() {
    this.setData({ loading: true });
    
    // 使用Promise.all并行加载项目信息和节点信息
    Promise.all([
      this.loadProjectInfo(),
      this.loadNodeInfo(),
      this.loadDeliverables()
    ])
    .catch(error => {
      console.error('加载节点详情失败:', error);
    })
    .finally(() => {
      this.setData({ loading: false });
    });
  },
  
  // 加载项目信息
  loadProjectInfo() {
    // 生成缓存键
    const cacheKey = cacheManager.createProjectCacheKey(this.data.projectId, 'info');
    
    // 先尝试从缓存获取
    const cachedInfo = cacheManager.getCache(cacheKey);
    if (cachedInfo) {
      console.log('从缓存加载项目信息:', cachedInfo);
      this.setData({
        projectName: cachedInfo.name || '未知项目'
      });
      
      // 静默更新缓存
      this.requestProjectInfo(true);
      return Promise.resolve(cachedInfo);
    }
    
    // 缓存不存在，请求新数据
    return this.requestProjectInfo();
  },
  
  // 请求项目信息
  requestProjectInfo(isSilent = false) {
    if (!isSilent) {
      this.setData({ loading: true });
    }
    
    return request({
      url: `/api/projects/${this.data.projectId}`,
      method: 'GET',
      showAuthDialog: !isSilent // 静默请求不显示认证对话框
    })
    .then(projectInfo => {
      // 设置项目名称
      this.setData({
        projectName: projectInfo.name || '未知项目'
      });
      
      // 缓存项目信息
      const cacheKey = cacheManager.createProjectCacheKey(this.data.projectId, 'info');
      cacheManager.setCache(cacheKey, projectInfo);
      
      return projectInfo;
    })
    .catch(error => {
      console.error('请求项目信息失败:', error);
      
      // 如果不是静默请求，则显示错误提示
      if (!isSilent) {
        // 尝试从全局数据或本地存储获取名称
        const projectInfo = wx.getStorageSync('projectInfo');
        if (projectInfo && projectInfo.id === this.data.projectId) {
          this.setData({
            projectName: projectInfo.name || '未知项目'
          });
        } else {
          wx.showToast({
            title: '获取项目信息失败',
            icon: 'none'
          });
        }
      }
      
      return Promise.reject(error);
    });
  },
  
  // 加载节点信息
  loadNodeInfo() {
    // 生成缓存键
    const cacheKey = cacheManager.createProjectCacheKey(
      this.data.projectId, 
      'node', 
      this.data.nodeId
    );
    
    // 先尝试从缓存获取
    const cachedNode = cacheManager.getCache(cacheKey);
    if (cachedNode) {
      console.log('从缓存加载节点信息:', cachedNode);
      
      // 获取状态文本
      const statusText = this.getStatusText(cachedNode.status);
      
      this.setData({
        nodeName: cachedNode.name || '',
        nodeStatus: cachedNode.status || 'not_started',
        nodeStatusText: statusText
      });
      
      // 静默更新缓存
      this.requestNodeInfo(true);
      return Promise.resolve(cachedNode);
    }
    
    // 缓存不存在，请求新数据
    return this.requestNodeInfo();
  },
  
  // 请求节点信息
  requestNodeInfo(isSilent = false) {
    if (!isSilent) {
      this.setData({ loading: true });
    }
    
    return request({
      url: `/api/projects/${this.data.projectId}/nodes/${this.data.nodeId}`,
      method: 'GET',
      showAuthDialog: !isSilent // 静默请求不显示认证对话框
    })
    .then(nodeInfo => {
      console.log('获取到的节点信息:', nodeInfo);
      
      // 获取状态文本
      const statusText = this.getStatusText(nodeInfo.status);
      
      this.setData({
        nodeName: nodeInfo.name || '',
        nodeStatus: nodeInfo.status || 'not_started',
        nodeStatusText: statusText
      });
      
      // 缓存节点信息
      const cacheKey = cacheManager.createProjectCacheKey(
        this.data.projectId, 
        'node', 
        this.data.nodeId
      );
      cacheManager.setCache(cacheKey, nodeInfo);
      
      return nodeInfo;
    })
    .catch(error => {
      console.error('请求节点信息失败:', error);
      
      // 如果不是静默请求，则显示错误提示
      if (!isSilent) {
        wx.showToast({
          title: '获取节点详情失败',
          icon: 'none'
        });
      }
      
      return Promise.reject(error);
    });
  },
  
  // 加载交付内容
  loadDeliverables() {
    // 生成缓存键
    const cacheKey = cacheManager.createProjectCacheKey(
      this.data.projectId, 
      'deliverables', 
      this.data.nodeId
    );
    
    // 先尝试从缓存获取
    const cachedDeliverables = cacheManager.getCache(cacheKey);
    if (cachedDeliverables) {
      console.log('从缓存加载交付内容:', cachedDeliverables);
      
      // 处理交付内容数据
      const processedDeliverables = cachedDeliverables.map(deliverable => ({
        ...deliverable,
        formattedStartDate: this.formatDate(deliverable.start_date),
        formattedEndDate: this.formatDate(deliverable.expected_end_date),
        statusText: this.getStatusText(deliverable.status)
      }));
      
      this.setData({
        deliverables: processedDeliverables
      });
      
      // 静默更新缓存
      this.requestDeliverables(true);
      return Promise.resolve(cachedDeliverables);
    }
    
    // 缓存不存在，请求新数据
    return this.requestDeliverables();
  },
  
  // 请求交付内容
  requestDeliverables(isSilent = false) {
    if (!isSilent) {
      this.setData({ loading: true });
    }
    
    return request({
      url: `/api/projects/${this.data.projectId}/nodes/${this.data.nodeId}/deliverables`,
      method: 'GET',
      showAuthDialog: !isSilent // 静默请求不显示认证对话框
    })
    .then(deliverables => {
      console.log('获取到的交付内容:', deliverables);
      
      // 处理交付内容数据
      const processedDeliverables = deliverables.map(deliverable => ({
        ...deliverable,
        formattedStartDate: this.formatDate(deliverable.start_date),
        formattedEndDate: this.formatDate(deliverable.expected_end_date),
        statusText: this.getStatusText(deliverable.status)
      }));
      
      this.setData({
        deliverables: processedDeliverables
      });
      
      // 缓存交付内容
      const cacheKey = cacheManager.createProjectCacheKey(
        this.data.projectId, 
        'deliverables', 
        this.data.nodeId
      );
      cacheManager.setCache(cacheKey, deliverables);
      
      return deliverables;
    })
    .catch(error => {
      console.error('请求交付内容失败:', error);
      
      // 如果不是静默请求，则显示错误提示
      if (!isSilent) {
        wx.showToast({
          title: '获取交付内容失败',
          icon: 'none'
        });
      }
      
      return Promise.reject(error);
    });
  },
  
  // 格式化日期
  formatDate(date) {
    if (!date) {
      return '';
    }
    
    try {
      // 确保date是Date对象
      const dateObj = date instanceof Date ? date : new Date(date);
      
      // 检查日期是否有效
      if (isNaN(dateObj.getTime())) {
        return '';
      }
      
      // 格式化为YYYY-MM-DD
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error('日期格式化错误:', error);
      return '';
    }
  },
  
  // 获取状态文本
  getStatusText(status) {
    // 如果状态是数字，转换为对应的状态码
    if (typeof status === 'number') {
      const numericStatusMap = {
        0: 'not_started',
        1: 'in_progress',
        2: 'completed',
        3: 'delayed'
      };
      status = numericStatusMap[status] || status;
    }
    
    const statusMap = {
      'not_started': '未开始',
      'in_progress': '进行中',
      'completed': '已完成',
      'delayed': '已延期',
      'blocked': '已阻塞',
      'pending': '待处理',
      'resolved': '已解决'
    };
    
    return statusMap[status] || '未知状态';
  },
  
  // 返回流程图
  goBack() {
    wx.navigateBack();
  }
}); 