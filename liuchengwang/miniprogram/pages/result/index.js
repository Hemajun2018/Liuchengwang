const app = getApp();
const { request } = require('../../utils/request');
const cacheManager = require('../../utils/cache');

Page({
  data: {
    projectId: '',
    projectInfo: null,
    loading: true,
    loadingFailed: false, // 标记API请求是否失败
    error: null,
    lastRefreshTime: 0 // 添加上次刷新时间戳
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
      error: null,
      lastRefreshTime: Date.now() // 初始化刷新时间
    });
    
    this.loadProjectInfo();
  },
  
  // 页面显示时频繁刷新数据
  onShow() {
    if (this.data.projectId) {
      const now = Date.now();
      console.log('成果页面显示，刷新数据');
      
      // 如果距离上次刷新超过2秒，则尝试刷新数据
      if (now - this.data.lastRefreshTime > 2000) {
        this.checkDataUpdates();
        this.setData({ lastRefreshTime: now });
      }
    }
  },
  
  // 检查数据更新 (不发送API请求)
  checkDataUpdates() {
    console.log('检查数据更新');
    
    // 1. 从全局数据提取成果信息
    this.extractFromGlobalElements();
    
    // 2. 如果流程页已经加载过元素数据，我们可以直接使用
    const hasElements = app.globalData.elements && app.globalData.elements.length > 0;
    if (!hasElements) {
      // 在流程页面没有加载时，不主动请求API
      console.log('没有找到全局元素数据，等待流程页加载');
    }
  },
  
  // 从全局元素数据中提取成果信息
  extractFromGlobalElements() {
    console.log('从全局元素数据中提取成果信息');
    
    const elements = app.globalData.elements || [];
    // 过滤出类型为"成果"的元素
    const results = elements.filter(item => item.type_id === 5 || item.type === 'result');
    
    if (results.length > 0) {
      console.log('从全局数据找到成果元素:', results);
      
      if (this.data.projectInfo) {
        // 构建新的项目信息对象，包含成果数据
        const updatedProjectInfo = {
          ...this.data.projectInfo,
          results: results.map(item => ({
            id: item.id,
            name: item.name || '成果',
            description: item.content || '',
            status: item.status || 'pending',
            created_at: item.date_content || ''
          }))
        };
        
        this.setData({
          projectInfo: updatedProjectInfo,
          error: null
        });
        
        // 更新本地存储
        wx.setStorageSync('projectInfo', updatedProjectInfo);
      }
    }
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
      
      // 从全局元素中提取成果
      this.extractFromGlobalElements();
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
      
      // 从全局元素中提取成果
      this.extractFromGlobalElements();
      return;
    }
    
    // 3. 如果没有项目信息，直接从全局元素创建模拟项目
    if (this.tryUseGlobalElements()) {
      return;
    }
    
    // 4. 最后尝试从API获取
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
      // 使用封装的request方法获取项目信息
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
      
      // 从全局元素中提取成果
      this.extractFromGlobalElements();
    } catch (err) {
      console.error('请求项目信息失败:', err);
      
      this.setData({ 
        loading: false,
        loadingFailed: true,
        error: '获取项目信息失败，显示缓存数据'
      });
      
      // 尝试使用全局元素数据显示成果
      this.tryUseGlobalElements();
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
          name: item.name || '成果',
          description: item.content || '',
          status: item.status || 'pending',
          created_at: item.date_content || ''
        }))
      };
      
      this.setData({
        projectInfo: simulatedProject,
        loading: false,
        error: null
      });
      
      // 返回true表示已成功使用全局元素数据
      return true;
    }
    
    // 返回false表示未找到全局元素数据
    return false;
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
    wx.navigateBack({
      // 返回上一页后刷新流程图数据
      success: () => {
        // 调度一个事件，通知流程图页面刷新数据
        if (app.globalData.needRefreshFlow === undefined) {
          app.globalData.needRefreshFlow = true;
        }
      }
    });
  },
  
  // 添加新成果
  async addNewResult() {
    // 获取当前时间
    const now = new Date();
    const dateStr = this.formatDate(now);
    
    // 创建新成果对象
    const newResult = {
      name: `新成果 ${dateStr}`,
      description: `新增成果项描述 ${dateStr}`,
      created_at: dateStr,
      status: 'not_started'
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
      
      // 标记需要刷新流程页
      app.globalData.needRefreshFlow = true;
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
    
    // 检查跟新全局数据
    this.checkDataUpdates();
    
    // 返回到流程页面，重新加载数据后再回来
    wx.navigateBack({
      success: () => {
        // 标记需要刷新
        app.globalData.needRefreshFlow = true;
        
        setTimeout(() => {
          // 延迟导航回本页面
          wx.navigateTo({
            url: `/pages/result/result?id=${this.data.projectInfo.id || this.data.projectId}`,
            complete: () => {
              wx.hideLoading();
            }
          });
        }, 500);
      },
      fail: () => {
        wx.hideLoading();
      }
    });
  },
  
  // 页面相关生命周期函数
  onPullDownRefresh() {
    // 下拉刷新
    this.refreshResults();
    wx.stopPullDownRefresh();
  }
}); 