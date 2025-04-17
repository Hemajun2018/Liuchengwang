const app = getApp();
const { request } = require('../../utils/request');

Page({
  data: {
    projectId: '',
    nodeId: '',
    projectName: '',
    nodeName: '',
    materials: [],
    loading: true,
    formattedMaterials: [] // 添加格式化后的材料数据
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
    
    // 加载节点和材料信息
    this.loadNodeAndMaterials();
  },
  
  onShow() {
    // 每次显示页面时重新加载数据
    if (this.data.nodeId) {
      this.loadNodeAndMaterials();
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
  
  // 加载节点和材料信息
  loadNodeAndMaterials() {
    this.setData({ loading: true });
    
    request({
      url: `/projects/${this.data.projectId}/nodes/${this.data.nodeId}`,
      method: 'GET'
    })
    .then(data => {
      const nodeInfo = data;
      console.log('获取到的节点信息:', nodeInfo);
      
      // 处理材料数据，确保日期字段正确
      let processedMaterials = [];
      if (nodeInfo.materials && nodeInfo.materials.length > 0) {
        processedMaterials = nodeInfo.materials.map(material => {
          // 检查并处理日期字段
          const processedMaterial = {...material};
          
          // 处理开始时间
          if (!processedMaterial.start_date && processedMaterial.startDate) {
            processedMaterial.start_date = processedMaterial.startDate;
          } else if (!processedMaterial.start_date && processedMaterial.startTime) {
            processedMaterial.start_date = processedMaterial.startTime;
          }
          
          // 处理结束时间
          if (!processedMaterial.expected_end_date && processedMaterial.expectedEndDate) {
            processedMaterial.expected_end_date = processedMaterial.expectedEndDate;
          } else if (!processedMaterial.expected_end_date && processedMaterial.endTime) {
            processedMaterial.expected_end_date = processedMaterial.endTime;
          }
          
          // 处理完成天数
          if (!processedMaterial.duration_days && processedMaterial.durationDays) {
            processedMaterial.duration_days = processedMaterial.durationDays;
          }
          
          // 预先格式化日期
          processedMaterial.formattedStartDate = this.formatDate(processedMaterial.start_date);
          processedMaterial.formattedEndDate = this.formatDate(processedMaterial.expected_end_date);
          
          // 测试：检查材料状态
          console.log('材料ID:', processedMaterial.id, '状态值:', processedMaterial.status, '类型:', typeof processedMaterial.status);
          console.log('状态文本测试:', this.getMaterialStatusText(processedMaterial.status));
          
          // 预先计算状态文本并存储在材料对象中
          processedMaterial.statusText = this.getMaterialStatusText(processedMaterial.status);
          console.log('预存的状态文本:', processedMaterial.statusText);
          
          return processedMaterial;
        });
        
        console.log('处理后的第一个材料数据:', processedMaterials[0]);
      }
      
      this.setData({
        nodeName: nodeInfo.name || '',
        materials: processedMaterials,
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
  
  // 获取材料状态文本
  getMaterialStatusText(status) {
    console.log('获取材料状态文本调用:', status, typeof status);
    
    // 如果状态是数字，转换为对应的状态码
    if (typeof status === 'number') {
      const numericStatusMap = {
        0: 'not_started',
        1: 'in_progress',
        2: 'completed',
        3: 'delayed',
        4: 'not_submitted',
        5: 'submitted'
      };
      status = numericStatusMap[status] || status;
    }
    
    const statusMap = {
      'not_started': '未开始',
      'in_progress': '进行中',
      'completed': '已完成',
      'delayed': '已延期',
      'not_submitted': '未提交',
      'submitted': '已提交'
    };
    
    const result = statusMap[status] || '未知状态';
    console.log('材料状态文本结果:', result);
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