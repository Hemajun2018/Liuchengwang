const app = getApp();

Page({
  data: {
    projectId: '',
    projectInfo: null,
    loading: true,
    debugInfo: '',
    formattedStartTime: '',  // 添加格式化后的开始时间
    formattedEndTime: '',    // 添加格式化后的结束时间
    statusText: ''           // 添加状态文本
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
  loadProjectInfo() {
    this.setData({ loading: true });
    
    // 先尝试从本地获取
    const projectInfo = wx.getStorageSync('projectInfo');
    
    if (projectInfo && projectInfo.id === this.data.projectId) {
      console.log('从本地获取的项目信息:', projectInfo);
      console.log('开始时间:', projectInfo.start_time, typeof projectInfo.start_time);
      console.log('结束时间:', projectInfo.end_time, typeof projectInfo.end_time);
      console.log('完成状态:', projectInfo.status, typeof projectInfo.status);
      
      // 确保数据格式正确
      const processedInfo = this.processProjectInfo(projectInfo);
      
      // 预先格式化时间和状态
      const formattedStartTime = this.formatDate(processedInfo.start_time);
      const formattedEndTime = this.formatDate(processedInfo.end_time);
      const statusText = this.getStatusText(processedInfo.status);
      
      console.log('预先格式化的开始时间:', formattedStartTime);
      console.log('预先格式化的结束时间:', formattedEndTime);
      console.log('预先格式化的状态文本:', statusText);
      
      // 添加调试信息
      const debugInfo = `
        开始时间: ${processedInfo.start_time} (${typeof processedInfo.start_time})
        结束时间: ${processedInfo.end_time} (${typeof processedInfo.end_time})
        完成状态: ${processedInfo.status} (${typeof processedInfo.status})
        完成天数: ${processedInfo.days_needed} (${typeof processedInfo.days_needed})
        格式化开始时间: ${formattedStartTime}
        格式化结束时间: ${formattedEndTime}
        状态文本: ${statusText}
      `;
      
      this.setData({ 
        projectInfo: processedInfo,
        formattedStartTime: formattedStartTime,
        formattedEndTime: formattedEndTime,
        statusText: statusText,
        debugInfo: debugInfo,
        loading: false
      });
      
      // 在设置数据后，再次检查数据是否正确设置
      setTimeout(() => {
        console.log('设置后的数据:', this.data.projectInfo);
        console.log('设置后的开始时间:', this.data.projectInfo.start_time);
        console.log('设置后的结束时间:', this.data.projectInfo.end_time);
        console.log('设置后的状态:', this.data.projectInfo.status);
        console.log('设置后的格式化开始时间:', this.data.formattedStartTime);
        console.log('设置后的格式化结束时间:', this.data.formattedEndTime);
        console.log('设置后的状态文本:', this.data.statusText);
        
        // 直接调用函数测试
        console.log('直接调用formatDate测试:', this.formatDate(this.data.projectInfo.start_time));
        console.log('直接调用getStatusText测试:', this.getStatusText(this.data.projectInfo.status));
      }, 100);
    } else {
      // 如果本地没有，则从服务器获取
      wx.request({
        url: `${app.globalData.baseUrl}/lcw-api/projects/${this.data.projectId}`,
        method: 'GET',
        success: (res) => {
          if (res.statusCode === 200) {
            const projectData = res.data;
            console.log('从服务器获取的项目信息:', projectData);
            console.log('开始时间:', projectData.start_time, typeof projectData.start_time);
            console.log('结束时间:', projectData.end_time, typeof projectData.end_time);
            console.log('完成状态:', projectData.status, typeof projectData.status);
            
            // 确保数据格式正确
            const processedInfo = this.processProjectInfo(projectData);
            
            // 预先格式化时间和状态
            const formattedStartTime = this.formatDate(processedInfo.start_time);
            const formattedEndTime = this.formatDate(processedInfo.end_time);
            const statusText = this.getStatusText(processedInfo.status);
            
            console.log('预先格式化的开始时间:', formattedStartTime);
            console.log('预先格式化的结束时间:', formattedEndTime);
            console.log('预先格式化的状态文本:', statusText);
            
            // 添加调试信息
            const debugInfo = `
              开始时间: ${processedInfo.start_time} (${typeof processedInfo.start_time})
              结束时间: ${processedInfo.end_time} (${typeof processedInfo.end_time})
              完成状态: ${processedInfo.status} (${typeof processedInfo.status})
              完成天数: ${processedInfo.days_needed} (${typeof processedInfo.days_needed})
              格式化开始时间: ${formattedStartTime}
              格式化结束时间: ${formattedEndTime}
              状态文本: ${statusText}
            `;
            
            this.setData({ 
              projectInfo: processedInfo,
              formattedStartTime: formattedStartTime,
              formattedEndTime: formattedEndTime,
              statusText: statusText,
              debugInfo: debugInfo,
              loading: false
            });
            
            // 在设置数据后，再次检查数据是否正确设置
            setTimeout(() => {
              console.log('设置后的数据:', this.data.projectInfo);
              console.log('设置后的开始时间:', this.data.projectInfo.start_time);
              console.log('设置后的结束时间:', this.data.projectInfo.end_time);
              console.log('设置后的状态:', this.data.projectInfo.status);
              console.log('设置后的格式化开始时间:', this.data.formattedStartTime);
              console.log('设置后的格式化结束时间:', this.data.formattedEndTime);
              console.log('设置后的状态文本:', this.data.statusText);
              
              // 直接调用函数测试
              console.log('直接调用formatDate测试:', this.formatDate(this.data.projectInfo.start_time));
              console.log('直接调用getStatusText测试:', this.getStatusText(this.data.projectInfo.status));
            }, 100);
          } else {
            wx.showToast({
              title: '获取项目信息失败',
              icon: 'none'
            });
            setTimeout(() => {
              wx.navigateBack();
            }, 1500);
          }
        },
        fail: (err) => {
          console.error('请求项目信息失败:', err);
          wx.showToast({
            title: '网络请求失败',
            icon: 'none'
          });
          this.setData({ loading: false });
        }
      });
    }
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
    const statusMap = {
      0: '未开始',
      1: '进行中',
      2: '已完成',
      3: '已延期'
    };
    const result = statusMap[status] || '未知状态';
    console.log('状态文本结果:', result);
    return result;
  },
  
  // 返回流程图
  goBack() {
    wx.navigateBack();
  }
}); 