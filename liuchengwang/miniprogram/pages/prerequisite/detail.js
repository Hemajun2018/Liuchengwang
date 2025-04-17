const app = getApp();
const { request } = require('../../utils/request');

Page({
  data: {
    projectId: '',
    prerequisiteId: '',
    projectName: '',
    deliverables: [],
    loading: true
  },

  onLoad(options) {
    const { projectId, prerequisiteId } = options;
    
    if (!projectId) {
      wx.showToast({
        title: '参数错误',
        icon: 'none'
      });
      wx.navigateBack();
      return;
    }
    
    this.setData({ 
      projectId,
      prerequisiteId: prerequisiteId || ''
    });
    
    // 加载项目信息
    this.loadProjectInfo();
    
    // 加载前置条件交付内容
    this.loadPrerequisiteDeliverables();
  },
  
  onShow() {
    // 每次显示页面时重新加载数据
    if (this.data.projectId) {
      this.loadPrerequisiteDeliverables();
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
      request({
        url: `/projects/${this.data.projectId}`,
        method: 'GET'
      })
      .then(data => {
        this.setData({ 
          projectName: data.name
        });
        
        // 缓存项目信息
        wx.setStorageSync('projectInfo', data);
      })
      .catch(err => {
        console.error('获取项目信息失败:', err);
      });
    }
  },
  
  // 加载前置条件交付内容
  loadPrerequisiteDeliverables() {
    this.setData({ loading: true });
    
    request({
      url: `/prerequisites/project/${this.data.projectId}`,
      method: 'GET'
    })
    .then(data => {
      // 确保prerequisites是数组
      const prerequisites = data || {};
      let processedDeliverables = [];
      
      // 检查prerequisites是否为数组
      if (Array.isArray(prerequisites)) {
        // 如果是数组，正常处理
        processedDeliverables = prerequisites.map(item => {
          return {
            id: item.id,
            content: item.content,
            startDate: this.formatDate(item.start_date),
            endDate: this.formatDate(item.expected_end_date),
            durationDays: item.duration_days || 0,
            status: item.status,
            statusText: this.getStatusText(item.status)
          };
        });
      } else if (prerequisites && typeof prerequisites === 'object') {
        // 如果是单个对象，将其转换为数组包装的单个元素
        if (prerequisites.id) {
          processedDeliverables = [{
            id: prerequisites.id,
            content: prerequisites.content,
            startDate: this.formatDate(prerequisites.start_date),
            endDate: this.formatDate(prerequisites.expected_end_date),
            durationDays: prerequisites.duration_days || 0,
            status: prerequisites.status,
            statusText: this.getStatusText(prerequisites.status)
          }];
        }
        console.log('前置条件数据不是数组，已进行转换:', processedDeliverables);
      }
      
      this.setData({
        deliverables: processedDeliverables,
        loading: false
      });
    })
    .catch(err => {
      console.error('请求前置条件失败:', err);
      wx.showToast({
        title: '获取前置条件失败',
        icon: 'none'
      });
      this.setData({ loading: false });
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
      'delayed': '已延期',
      'pending': '待处理'
    };
    return statusMap[status] || '未知状态';
  },
  
  // 返回上一页
  goBack() {
    wx.navigateBack();
  }
}); 