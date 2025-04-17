const app = getApp();

Page({
  data: {
    projectId: '',
    nodeId: '',
    projectName: '',
    nodeName: '',
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
    
    // 加载项目信息
    this.loadProjectInfo();
    
    // 加载节点和交付内容信息
    this.loadNodeAndDeliverables();
  },
  
  onShow() {
    // 每次显示页面时重新加载数据
    if (this.data.nodeId) {
      this.loadNodeAndDeliverables();
    }
  },
  
  // 加载项目信息
  loadProjectInfo() {
    const projectInfo = wx.getStorageSync('projectInfo');
    
    if (projectInfo && projectInfo.id === this.data.projectId) {
      this.setData({ 
        projectName: projectInfo.name
      });
    } else {
      wx.request({
        url: `${app.globalData.baseUrl}/lcw-api/projects/${this.data.projectId}`,
        method: 'GET',
        success: (res) => {
          if (res.statusCode === 200) {
            this.setData({ 
              projectName: res.data.name
            });
            
            // 缓存项目信息
            wx.setStorageSync('projectInfo', res.data);
          }
        }
      });
    }
  },
  
  // 加载节点和交付内容信息
  loadNodeAndDeliverables() {
    this.setData({ loading: true });
    
    wx.request({
      url: `${app.globalData.baseUrl}/lcw-api/projects/${this.data.projectId}/nodes/${this.data.nodeId}`,
      method: 'GET',
      success: (res) => {
        if (res.statusCode === 200) {
          const nodeInfo = res.data;
          console.log('获取到的节点信息:', nodeInfo);
          
          // 处理交付内容数据
          let processedDeliverables = [];
          if (nodeInfo.deliverables && nodeInfo.deliverables.length > 0) {
            processedDeliverables = nodeInfo.deliverables.map(deliverable => {
              // 处理日期和状态
              return {
                id: deliverable.id,
                description: deliverable.description,
                startDate: this.formatDate(deliverable.start_date),
                endDate: this.formatDate(deliverable.expected_end_date),
                durationDays: deliverable.duration_days || 0,
                status: deliverable.status,
                statusText: this.getStatusText(deliverable.status)
              };
            });
          }
          
          this.setData({
            nodeName: nodeInfo.name || '',
            deliverables: processedDeliverables,
            loading: false
          });
        } else {
          wx.showToast({
            title: '获取节点信息失败',
            icon: 'none'
          });
          this.setData({ loading: false });
        }
      },
      fail: (err) => {
        console.error('请求节点信息失败:', err);
        wx.showToast({
          title: '网络请求失败',
          icon: 'none'
        });
        this.setData({ loading: false });
      }
    });
  },
  
  // 格式化日期
  formatDate(date) {
    if (!date) return '未设置';
    const dateObj = new Date(date);
    return `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
  },
  
  // 获取状态文本
  getStatusText(status) {
    const statusMap = {
      'not_started': '未开始',
      'in_progress': '进行中',
      'completed': '已完成',
      'delayed': '已延期'
    };
    return statusMap[status] || '未知状态';
  },
  
  // 返回上一页
  goBack() {
    // 设置全局刷新标志，提示项目页面刷新数据
    getApp().globalData.needRefreshProject = true;
    wx.navigateBack();
  }
}); 