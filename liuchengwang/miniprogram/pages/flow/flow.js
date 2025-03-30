// 流程页面逻辑
const { request } = require('../../utils/request');
const { isLoggedIn } = require('../../utils/auth');

Page({
  data: {
    projectInfo: null,
    precondition: null,
    problems: [],
    materials: [],
    nodes: [],
    result: null,
    loading: true,
    errorMessage: '',
    isNavigating: false, // 添加导航状态标记
    lastRefreshTime: 0 // 添加上次刷新时间戳
  },

  onLoad() {
    // 检查是否已登录
    if (!isLoggedIn()) {
      wx.redirectTo({
        url: '/pages/index/index'
      });
      return;
    }
    
    // 获取项目信息
    const projectInfo = getApp().globalData.projectInfo;
    this.setData({ projectInfo });
    
    // 加载流程数据
    this.loadFlowData();
  },
  
  // 页面显示时的生命周期函数
  onShow() {
    // 检查是否需要强制刷新
    if (app.globalData.needRefreshFlow) {
      console.log('检测到需要刷新流程图的标记，执行刷新');
      app.globalData.needRefreshFlow = false; // 重置标记
      this.loadFlowData(); // 强制刷新
      return;
    }
    
    // 检查距离上次刷新是否已超过2秒，避免频繁刷新
    const now = Date.now();
    if (now - this.data.lastRefreshTime > 2000) {
      console.log('页面重新显示，刷新流程数据');
      // 静默刷新数据，不显示加载中状态
      this.refreshDataSilently();
      this.setData({ lastRefreshTime: now });
    }
  },
  
  // 静默刷新数据（不显示加载状态）
  refreshDataSilently() {
    if (!this.data.projectInfo || !this.data.projectInfo.id) {
      console.log('项目信息不存在，无法刷新');
      return;
    }
    
    const projectId = this.data.projectInfo.id;
    
    // 获取项目元素
    request({
      url: `/api/projects/${projectId}/elements`,
      method: 'GET'
    })
      .then(res => {
        // 处理元素数据
        const elements = res.data || [];
        
        // 按类型分类元素
        const precondition = elements.find(item => item.type_id === 1) || {};
        const problems = elements.filter(item => item.type_id === 2) || [];
        const materials = elements.filter(item => item.type_id === 3) || [];
        const nodes = elements.filter(item => item.type_id === 4) || [];
        const result = elements.find(item => item.type_id === 5) || {};
        
        // 填充数据但保持显示格式
        this.setData({
          precondition: this.ensureElementData(precondition, this.data.precondition, 1, '前置条件'),
          problems: this.ensureElementsArray(problems, this.data.problems, 2, '问题'),
          materials: this.ensureElementsArray(materials, this.data.materials, 3, '材料'),
          nodes: this.ensureElementsArray(nodes, this.data.nodes, 4, '节点'),
          result: this.ensureElementData(result, this.data.result, 5, '成果')
        });
        
        // 保存到全局状态
        getApp().globalData.elements = elements;
      })
      .catch(err => {
        console.error('静默刷新流程数据失败', err);
        // 静默刷新失败不显示错误
      });
  },
  
  // 确保单个元素数据的方法
  ensureElementData(newData, oldData, typeId, defaultName) {
    if (newData && newData.id) {
      return newData;
    }
    
    return oldData || {
      id: `${defaultName.toLowerCase()}-1`,
      type_id: typeId,
      name: defaultName,
      status: 'pending'
    };
  },
  
  // 确保元素数组数据的方法
  ensureElementsArray(newArray, oldArray, typeId, baseName) {
    if (newArray && newArray.length > 0) {
      return newArray;
    }
    
    // 如果没有新数据，保留旧数据
    if (oldArray && oldArray.length > 0) {
      return oldArray;
    }
    
    // 默认创建3个元素
    const result = [];
    for (let i = 1; i <= 3; i++) {
      result.push({
        id: `${baseName.toLowerCase()}-${i}`,
        type_id: typeId,
        name: `${baseName}${i}`,
        status: 'pending'
      });
    }
    return result;
  },
  
  // 加载流程数据
  loadFlowData() {
    this.setData({ loading: true, errorMessage: '' });
    
    const projectId = this.data.projectInfo.id;
    
    // 获取项目元素
    request({
      url: `/api/projects/${projectId}/elements`,
      method: 'GET'
    })
      .then(res => {
        // 处理元素数据
        const elements = res.data || [];
        
        // 按类型分类元素
        const precondition = elements.find(item => item.type_id === 1) || {};
        const problems = elements.filter(item => item.type_id === 2) || [];
        const materials = elements.filter(item => item.type_id === 3) || [];
        const nodes = elements.filter(item => item.type_id === 4) || [];
        const result = elements.find(item => item.type_id === 5) || {};
        
        // 确保至少有3个问题、材料和2个节点（用于展示）
        while (problems.length < 3) {
          problems.push({
            id: `problem-${problems.length + 1}`,
            type_id: 2,
            name: `问题${problems.length + 1}`,
            status: 'pending'
          });
        }
        
        while (materials.length < 3) {
          materials.push({
            id: `material-${materials.length + 1}`,
            type_id: 3,
            name: `材料${materials.length + 1}`,
            status: 'pending'
          });
        }
        
        while (nodes.length < 2) {
          nodes.push({
            id: `node-${nodes.length + 1}`,
            type_id: 4,
            name: `节点${nodes.length + 1}`,
            status: 'pending'
          });
        }
        
        // 如果没有前置条件或成果，创建默认的
        if (!precondition.id) {
          precondition.id = 'precondition-1';
          precondition.type_id = 1;
          precondition.name = '前置条件';
          precondition.status = 'pending';
        }
        
        if (!result.id) {
          result.id = 'result-1';
          result.type_id = 5;
          result.name = '成果';
          result.status = 'pending';
        }
        
        this.setData({
          precondition,
          problems,
          materials,
          nodes,
          result,
          loading: false,
          lastRefreshTime: Date.now() // 更新刷新时间戳
        });
        
        // 保存到全局状态
        getApp().globalData.elements = elements;
      })
      .catch(err => {
        this.setData({
          loading: false,
          errorMessage: err.message || '加载流程数据失败'
        });
        
        // 创建模拟数据以便展示
        this.createMockData();
      });
      
    // 获取元素关系
    request({
      url: `/api/projects/${projectId}/relations`,
      method: 'GET'
    })
      .then(res => {
        // 保存到全局状态
        getApp().globalData.relations = res.data || [];
      })
      .catch(err => {
        console.error('加载关系数据失败', err);
      });
  },
  
  // 创建模拟数据（当API请求失败时）
  createMockData() {
    const precondition = {
      id: 'precondition-1',
      type_id: 1,
      name: '前置条件',
      status: 'completed'
    };
    
    const problems = [
      { id: 'problem-1', type_id: 2, name: '问题1', status: 'completed' },
      { id: 'problem-2', type_id: 2, name: '问题2', status: 'completed' },
      { id: 'problem-3', type_id: 2, name: '问题3', status: 'pending' }
    ];
    
    const materials = [
      { id: 'material-1', type_id: 3, name: '材料1', status: 'completed' },
      { id: 'material-2', type_id: 3, name: '材料2', status: 'completed' },
      { id: 'material-3', type_id: 3, name: '材料3', status: 'pending' }
    ];
    
    const nodes = [
      { id: 'node-1', type_id: 4, name: '节点1', status: 'completed' },
      { id: 'node-2', type_id: 4, name: '节点2', status: 'pending' }
    ];
    
    const result = {
      id: 'result-1',
      type_id: 5,
      name: '成果',
      status: 'pending'
    };
    
    this.setData({
      precondition,
      problems,
      materials,
      nodes,
      result,
      loading: false,
      lastRefreshTime: Date.now() // 更新刷新时间戳
    });
    
    // 保存到全局状态
    getApp().globalData.elements = [
      precondition,
      ...problems,
      ...materials,
      ...nodes,
      result
    ];
  },
  
  // 元素点击事件
  onElementTap(e) {
    const { type, id } = e.currentTarget.dataset;
    console.log('点击元素:', type, id);
    
    // 防止重复点击
    if (this.data.isNavigating) {
      return;
    }
    
    this.setData({ isNavigating: true });
    
    // 根据元素类型跳转到不同页面
    let url = '';
    switch (type) {
      case 'precondition':
        url = `/pages/precondition/precondition?id=${id}`;
        break;
      case 'problem':
        url = `/pages/problem/problem?id=${id}`;
        break;
      case 'material':
        url = `/pages/material/material?id=${id}`;
        break;
      case 'node':
        url = `/pages/node/node?id=${id}`;
        break;
      case 'result':
        url = `/pages/result/result?id=${id}`;
        break;
    }
    
    if (url) {
      wx.navigateTo({
        url,
        success: () => {
          console.log('页面跳转成功:', url);
        },
        fail: (err) => {
          console.error('页面跳转失败:', err);
          wx.showToast({
            title: '页面跳转失败',
            icon: 'none'
          });
        },
        complete: () => {
          // 重置导航状态
          setTimeout(() => {
            this.setData({ isNavigating: false });
          }, 500);
        }
      });
    } else {
      this.setData({ isNavigating: false });
    }
  },
  
  // 下拉刷新
  onPullDownRefresh() {
    this.loadFlowData();
    wx.stopPullDownRefresh();
  }
});