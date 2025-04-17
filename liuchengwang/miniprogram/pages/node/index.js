const app = getApp();

Page({
  data: {
    nodeId: '',
    projectId: '',
    nodeName: '',
    nodeDescription: '',
    nodeStatus: '',
    startDate: null,
    endDate: null,
    durationDays: null,
    issues: [],
    materials: [],
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
    
    this.loadNodeInfo();
  },
  
  onShow() {
    // 每次显示页面时重新加载数据
    if (this.data.nodeId) {
      this.loadNodeInfo();
    }
  },
  
  // 加载节点信息
  loadNodeInfo() {
    this.setData({ loading: true });
    
    wx.request({
      url: `${app.globalData.baseUrl}/lcw-api/projects/${this.data.projectId}/nodes/${this.data.nodeId}`,
      method: 'GET',
      success: (res) => {
        if (res.statusCode === 200) {
          const nodeInfo = res.data;
          this.setData({
            nodeName: nodeInfo.name,
            nodeDescription: nodeInfo.description,
            nodeStatus: nodeInfo.status,
            startDate: nodeInfo.startTime ? new Date(nodeInfo.startTime).toLocaleDateString() : null,
            endDate: nodeInfo.endTime ? new Date(nodeInfo.endTime).toLocaleDateString() : null,
            durationDays: nodeInfo.daysNeeded
          });
          
          // 加载问题和材料列表
          this.loadIssues();
          this.loadMaterials();
        } else {
          wx.showToast({
            title: '获取节点信息失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('请求节点信息失败:', err);
        wx.showToast({
          title: '网络请求失败',
          icon: 'none'
        });
      },
      complete: () => {
        this.setData({ loading: false });
      }
    });
  },
  
  // 加载问题列表
  loadIssues() {
    wx.request({
      url: `${app.globalData.baseUrl}/lcw-api/projects/${this.data.projectId}/nodes/${this.data.nodeId}/issues`,
      method: 'GET',
      success: (res) => {
        if (res.statusCode === 200) {
          this.setData({ issues: res.data });
        } else {
          console.error('获取问题列表失败');
        }
      },
      fail: (err) => {
        console.error('请求问题列表失败:', err);
      }
    });
  },
  
  // 加载材料列表
  loadMaterials() {
    wx.request({
      url: `${app.globalData.baseUrl}/lcw-api/projects/${this.data.projectId}/nodes/${this.data.nodeId}/materials`,
      method: 'GET',
      success: (res) => {
        if (res.statusCode === 200) {
          this.setData({ materials: res.data });
        } else {
          console.error('获取材料列表失败');
        }
      },
      fail: (err) => {
        console.error('请求材料列表失败:', err);
      }
    });
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
  
  // 获取问题状态文本
  getIssueStatusText(status) {
    const statusMap = {
      'pending': '待处理',
      'resolved': '已解决'
    };
    return statusMap[status] || '未知状态';
  },
  
  // 获取材料状态文本
  getMaterialStatusText(status) {
    return this.getStatusText(status);
  }
}); 