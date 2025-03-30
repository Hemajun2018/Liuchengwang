const app = getApp();
const { request } = require('../../utils/request');

Page({
  data: {
    projectId: '',
    projectInfo: null,
    loading: true
  },

  onLoad(options) {
    const { projectId } = options;
    
    if (!projectId) {
      wx.navigateBack();
      return;
    }
    
    this.setData({ projectId });
    this.loadProjectInfo();
  },
  
  // 加载项目信息
  async loadProjectInfo() {
    this.setData({ loading: true });
    
    try {
      // 使用封装的request方法获取项目信息
      const projectData = await request({
        url: `/projects/${this.data.projectId}`,
        method: 'GET'
      });
      
      console.log('从服务器获取的项目信息:', projectData);
      
      // 确保数据格式正确
      const processedInfo = this.processProjectInfo(projectData);
      
      // 更新本地存储
      wx.setStorageSync('projectInfo', processedInfo);
      
      this.setData({ 
        projectInfo: processedInfo,
        loading: false
      });
    } catch (err) {
      console.error('请求项目信息失败:', err);
      wx.showToast({
        title: '获取项目信息失败',
        icon: 'none'
      });
      this.setData({ loading: false });
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
    wx.request({
      url: `${app.globalData.baseUrl}/projects/${this.data.projectId}/results`,
      method: 'GET',
      success: (res) => {
        if (res.statusCode === 200) {
          const results = res.data || [];
          console.log('从服务器获取的成果列表:', results);
          
          // 更新项目信息中的成果列表
          const updatedProjectInfo = { ...this.data.projectInfo, results };
          
          this.setData({ 
            projectInfo: updatedProjectInfo
          });
          
          // 更新本地存储
          wx.setStorageSync('projectInfo', updatedProjectInfo);
        } else {
          console.error('获取成果列表失败:', res);
        }
      },
      fail: (err) => {
        console.error('请求成果列表失败:', err);
      }
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
        url: `/projects/${this.data.projectId}`,
        method: 'PATCH',
        data: {
          results: updatedResults
        }
      });
      
      // 更新项目信息
      const updatedProjectInfo = { ...this.data.projectInfo, results: updatedResults };
      
      // 更新页面数据
      this.setData({ 
        projectInfo: updatedProjectInfo
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
    this.loadProjectInfo();
  }
}); 