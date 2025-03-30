const app = getApp();
const { request } = require('../../utils/request');
const cacheManager = require('../../utils/cache');

Page({
  data: {
    projectId: '',
    projectInfo: null,
    loading: true,
    loadingFailed: false, // 新增：标记API请求是否失败
    error: null
  },

  onLoad(options) {
    console.log('成果页面加载, options:', options);
    const { projectId } = options;
    
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
      loading: true,
      error: null
    });
    
    this.loadProjectInfo();
  },
  
  // 加载项目信息
  async loadProjectInfo() {
    console.log('加载项目信息');
    this.setData({ loading: true, error: null });
    
    // 1. 优先从全局数据中获取项目信息
    const globalProjectInfo = app.globalData.projectInfo;
    if (globalProjectInfo && globalProjectInfo.id === this.data.projectId) {
      console.log('从全局数据获取项目信息:', globalProjectInfo);
      this.setData({
        projectInfo: this.processProjectInfo(globalProjectInfo),
        loading: false
      });
      
      // 静默刷新
      this.silentRefreshFromApi();
      return;
    }
    
    // 2. 从本地存储中获取
    const cachedProjectInfo = wx.getStorageSync('projectInfo');
    if (cachedProjectInfo && cachedProjectInfo.id === this.data.projectId) {
      console.log('从本地缓存获取项目信息:', cachedProjectInfo);
      this.setData({
        projectInfo: this.processProjectInfo(cachedProjectInfo),
        loading: false
      });
      
      // 静默刷新
      this.silentRefreshFromApi();
      return;
    }
    
    // 3. 从API中获取
    this.fetchProjectFromApi();
  },
  
  // 从API获取项目信息
  async fetchProjectFromApi() {
    console.log('从API获取项目信息');
    
    // 避免重复请求
    if (this.data.loadingFailed) {
      this.setData({
        loading: false,
        error: '无法获取项目信息，请检查网络连接或联系管理员'
      });
      return;
    }
    
    try {
      // 使用封装的request方法获取项目信息，注意这里修复了API路径
      const projectData = await request({
        url: `/api/projects/${this.data.projectId}`,
        method: 'GET'
      });
      
      console.log('从服务器获取的项目信息:', projectData);
      
      // 确保数据格式正确
      const processedInfo = this.processProjectInfo(projectData);
      
      // 更新本地存储
      wx.setStorageSync('projectInfo', processedInfo);
      
      this.setData({ 
        projectInfo: processedInfo,
        loading: false,
        error: null
      });
      
      // 尝试加载成果列表
      this.loadResultsList(processedInfo);
    } catch (err) {
      console.error('请求项目信息失败:', err);
      
      this.setData({ 
        loading: false,
        loadingFailed: true,
        error: '获取项目信息失败，显示缓存数据'
      });
      
      // 尝试使用全局节点数据显示成果
      this.tryUseGlobalElements();
    }
  },
  
  // 静默刷新API数据
  async silentRefreshFromApi() {
    console.log('静默刷新项目信息');
    
    try {
      const projectData = await request({
        url: `/api/projects/${this.data.projectId}`,
        method: 'GET'
      });
      
      // 更新本地存储和缓存
      const processedInfo = this.processProjectInfo(projectData);
      wx.setStorageSync('projectInfo', processedInfo);
      
      // 尝试加载成果列表
      this.loadResultsList(processedInfo);
      
      // 静默更新UI
      this.setData({ 
        projectInfo: processedInfo,
        error: null
      });
    } catch (err) {
      console.error('静默刷新项目信息失败:', err);
      // 静默模式不更新错误状态
    }
  },
  
  // 尝试使用全局元素数据
  tryUseGlobalElements() {
    console.log('尝试使用全局元素数据显示成果');
    
    const elements = app.globalData.elements || [];
    // 过滤出类型为"成果"的元素
    const results = elements.filter(item => item.type_id === 5 || item.type === 'result');
    
    if (results.length > 0) {
      console.log('找到成果元素:', results);
      
      const simulatedProject = {
        id: this.data.projectId,
        name: '项目详情',
        results: results.map(item => ({
          id: item.id,
          name: item.name,
          description: item.content,
          status: item.status,
          created_at: item.date_content
        }))
      };
      
      this.setData({
        projectInfo: simulatedProject,
        loading: false,
        error: '使用缓存数据显示成果'
      });
    }
  },
  
  // 加载成果列表
  loadResultsList(projectInfo) {
    // 检查项目信息中是否已包含成果列表
    if (projectInfo.results && projectInfo.results.length > 0) {
      console.log('项目信息中已包含成果列表:', projectInfo.results);
      return;
    }
    
    // 尝试从服务器获取成果列表
    console.log('尝试从服务器获取成果列表...');
    
    // 使用正确的API路径
    request({
      url: `/api/projects/${this.data.projectId}/results`,
      method: 'GET'
    })
    .then(results => {
      console.log('从服务器获取的成果列表:', results);
      
      // 更新项目信息中的成果列表
      const updatedProjectInfo = { ...this.data.projectInfo, results };
      
      this.setData({ 
        projectInfo: updatedProjectInfo,
        error: null
      });
      
      // 更新本地存储
      wx.setStorageSync('projectInfo', updatedProjectInfo);
    })
    .catch(err => {
      console.error('获取成果列表失败:', err);
      // 不显示错误，因为成果列表可能为空
    });
  },
  
  // 格式化日期
  formatDate(date) {
    console.log('格式化日期调用:', date, typeof date);
    if (!date) {
      console.log('日期为空，返回未设置');
      return '未设置';
    }
    
    // 如果已经是格式化的日期字符串（如YYYY-MM-DD），直接返回
    if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
      console.log('日期已是正确格式，直接返回:', date);
      return date;
    }
    
    try {
      // 确保date是Date对象
      const dateObj = date instanceof Date ? date : new Date(date);
      console.log('转换为Date对象:', dateObj);
      
      // 检查日期是否有效
      if (isNaN(dateObj.getTime())) {
        console.error('无效的日期:', date);
        return '日期格式错误';
      }
      
      // 格式化为YYYY-MM-DD
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      
      const formattedDate = `${year}-${month}-${day}`;
      console.log('格式化后的日期:', formattedDate);
      return formattedDate;
    } catch (error) {
      console.error('日期格式化错误:', error);
      return '日期格式错误';
    }
  },
  
  // 获取状态文本
  getStatusText(status) {
    console.log('获取状态文本调用:', status, typeof status);
    
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
      'delayed': '已延期'
    };
    
    const result = statusMap[status] || '未知状态';
    console.log('状态文本结果:', result);
    return result;
  },
  
  // 返回流程图
  goBack() {
    wx.navigateBack();
  },
  
  // 处理项目信息，确保格式正确
  processProjectInfo(info) {
    // 创建一个新对象，避免修改原始对象
    const processedInfo = {...info};
    
    // 确保日期字段存在且格式正确
    if (processedInfo.start_time) {
      console.log('处理后的开始时间:', processedInfo.start_time);
    }
    
    if (processedInfo.end_time) {
      console.log('处理后的结束时间:', processedInfo.end_time);
    }
    
    // 确保状态是数字
    if (processedInfo.status !== undefined) {
      processedInfo.status = Number(processedInfo.status);
      console.log('处理后的状态:', processedInfo.status);
    }
    
    // 确保results字段存在
    if (!processedInfo.results) {
      processedInfo.results = [];
    }
    
    return processedInfo;
  },
  
  // 添加新成果
  async addNewResult() {
    // 获取当前时间
    const now = new Date();
    const dateStr = this.formatDate(now);
    
    // 创建新成果对象
    const newResult = {
      description: `新增成果项 ${dateStr}`,
      created_at: dateStr
    };
    
    try {
      // 获取当前成果列表
      const currentResults = this.data.projectInfo.results || [];
      
      // 将新成果添加到列表中
      const updatedResults = [...currentResults, newResult];
      
      // 调用后端API更新项目成果
      await request({
        url: `/api/projects/${this.data.projectId}`,
        method: 'PATCH',
        data: {
          results: updatedResults
        }
      });
      
      // 更新项目信息
      const updatedProjectInfo = { ...this.data.projectInfo, results: updatedResults };
      
      // 更新页面数据
      this.setData({ 
        projectInfo: updatedProjectInfo,
        error: null
      });
      
      // 更新本地存储
      wx.setStorageSync('projectInfo', updatedProjectInfo);
      
      // 显示成功提示
      wx.showToast({
        title: '成果添加成功',
        icon: 'success'
      });
    } catch (err) {
      console.error('添加成果失败:', err);
      wx.showToast({
        title: '添加成果失败',
        icon: 'none'
      });
    }
  },
  
  // 刷新成果列表
  refreshResults() {
    wx.showLoading({
      title: '刷新中...',
    });
    
    // 重新加载项目信息
    this.loadProjectInfo().finally(() => {
      wx.hideLoading();
    });
  },
  
  // 页面相关生命周期函数
  onPullDownRefresh() {
    // 下拉刷新
    this.refreshResults();
    wx.stopPullDownRefresh();
  },
  
  onShow() {
    // 页面显示时刷新数据
    if (this.data.projectId) {
      this.loadProjectInfo();
    }
  }
}); 