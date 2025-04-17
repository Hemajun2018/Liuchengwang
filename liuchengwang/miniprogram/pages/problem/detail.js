const app = getApp();
const { request } = require('../../utils/request');

Page({
  data: {
    projectId: '',
    nodeId: '',
    projectName: '',
    nodeName: '',
    issues: [],
    loading: true,
    formattedIssues: [] // 添加格式化后的问题数据
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
    
    // 加载节点和问题信息
    this.loadNodeAndIssues();
  },
  
  onShow() {
    // 每次显示页面时重新加载数据
    if (this.data.nodeId) {
      this.loadNodeAndIssues();
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
      })
      .catch(err => {
        console.error('获取项目信息失败:', err);
      });
    }
  },
  
  // 加载节点和问题信息
  loadNodeAndIssues() {
    this.setData({ loading: true });
    
    request({
      url: `/projects/${this.data.projectId}/nodes/${this.data.nodeId}`,
      method: 'GET'
    })
    .then(data => {
      const nodeInfo = data;
      console.log('获取到的节点信息:', nodeInfo);
      
      // 处理问题数据，确保日期字段正确
      let processedIssues = [];
      if (nodeInfo.issues && nodeInfo.issues.length > 0) {
        processedIssues = nodeInfo.issues.map(issue => {
          // 检查并处理日期字段
          const processedIssue = {...issue};
          
          // 处理开始时间
          if (!processedIssue.start_date && processedIssue.startDate) {
            processedIssue.start_date = processedIssue.startDate;
          } else if (!processedIssue.start_date && processedIssue.startTime) {
            processedIssue.start_date = processedIssue.startTime;
          }
          
          // 处理结束时间
          if (!processedIssue.expected_end_date && processedIssue.expectedEndDate) {
            processedIssue.expected_end_date = processedIssue.expectedEndDate;
          } else if (!processedIssue.expected_end_date && processedIssue.endTime) {
            processedIssue.expected_end_date = processedIssue.endTime;
          }
          
          // 处理完成天数
          if (!processedIssue.duration_days && processedIssue.durationDays) {
            processedIssue.duration_days = processedIssue.durationDays;
          }
          
          // 预先格式化日期
          processedIssue.formattedStartDate = this.formatDate(processedIssue.start_date);
          processedIssue.formattedEndDate = this.formatDate(processedIssue.expected_end_date);
          
          // 测试：检查问题状态
          console.log('问题ID:', processedIssue.id, '状态值:', processedIssue.status, '类型:', typeof processedIssue.status);
          console.log('状态文本测试:', this.getIssueStatusText(processedIssue.status));
          
          // 预先计算状态文本并存储在问题对象中
          processedIssue.statusText = this.getIssueStatusText(processedIssue.status);
          console.log('预存的状态文本:', processedIssue.statusText);
          
          return processedIssue;
        });
        
        console.log('处理后的第一个问题数据:', processedIssues[0]);
      }
      
      this.setData({
        nodeName: nodeInfo.name || '',
        issues: processedIssues,
        loading: false
      });
    })
    .catch(err => {
      console.error('请求节点信息失败:', err);
      wx.showToast({
        title: '获取节点信息失败',
        icon: 'none'
      });
      this.setData({ loading: false });
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
  
  // 获取问题状态文本
  getIssueStatusText(status) {
    console.log('获取问题状态文本调用:', status, typeof status);
    
    // 测试: 打印完整的调用堆栈，帮助定位调用位置
    console.log('状态文本调用堆栈:', new Error().stack);
    
    // 如果状态是数字，转换为对应的状态码
    if (typeof status === 'number') {
      const numericStatusMap = {
        0: 'not_started',
        1: 'in_progress',
        2: 'completed',
        3: 'delayed'
      };
      status = numericStatusMap[status] || status;
      console.log('数字状态转换为:', status);
    }
    
    const statusMap = {
      'not_started': '未开始',
      'pending': '待处理',
      'resolved': '已解决',
      'in_progress': '进行中',
      'completed': '已完成',
      'delayed': '已延期'
    };
    
    // 测试: 检查statusMap中是否存在当前状态
    console.log('状态是否存在于映射中:', status in statusMap);
    
    const result = statusMap[status] || '未知状态';
    console.log('问题状态文本结果:', result);
    return result;
  },
  
  // 返回上一页
  goBack() {
    // 设置全局刷新标志，提示项目页面刷新数据
    getApp().globalData.needRefreshProject = true;
    wx.navigateBack();
  },
  
  // 处理项目信息，确保格式正确
  processProjectInfo(info) {
    // 创建一个新对象，避免修改原始对象
    const processedInfo = {...info};
    
    // 确保日期字段存在且格式正确
    if (processedInfo.start_time) {
      // 不需要转换为Date对象，直接使用字符串
      console.log('处理后的开始时间:', processedInfo.start_time);
    }
    
    if (processedInfo.end_time) {
      // 不需要转换为Date对象，直接使用字符串
      console.log('处理后的结束时间:', processedInfo.end_time);
    }
    
    // 确保状态是数字
    if (processedInfo.status !== undefined) {
      processedInfo.status = Number(processedInfo.status);
      console.log('处理后的状态:', processedInfo.status);
    }
    
    return processedInfo;
  }
}); 