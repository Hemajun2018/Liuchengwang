// app.js
const tokenManager = require('./utils/token');

App({
  onLaunch() {
    // 启动时的初始化逻辑
    console.log('小程序启动');
    
    // 检查是否有缓存的项目信息
    const projectInfo = wx.getStorageSync('projectInfo');
    if (projectInfo) {
      console.log('从缓存加载项目信息:', projectInfo);
      this.globalData.projectInfo = projectInfo;
    }
    
    // 获取token
    const token = tokenManager.getToken();
    if (token) {
      console.log('从缓存加载token');
      // 设置全局token
      this.globalData.token = token;
    } else {
      // 如果token无效但有项目信息，尝试创建临时token
      if (projectInfo && projectInfo.id) {
        const tempToken = `project_${projectInfo.id}_${new Date().getTime()}`;
        tokenManager.saveToken(tempToken, 12 * 60 * 60); // 临时token有效期12小时
        this.globalData.token = tempToken;
        console.log('创建临时token');
      }
    }
    
    // 初始化全局数据
    console.log('初始化全局数据');
    // 确保elements数组存在
    if (!this.globalData.elements) {
      this.globalData.elements = [];
    }
    // 确保relations数组存在
    if (!this.globalData.relations) {
      this.globalData.relations = [];
    }
  },
  
  globalData: {
    // API基础地址，开发环境使用本地地址
    // 由于在微信开发者工具中已勾选"不校验合法域名"，可以直接使用http
    baseUrl: 'http://localhost:3000/api',
    
    // 用户和项目信息
    projectInfo: null,
    token: null,
    
    // 元素和关系数据
    elements: [],
    relations: []
  }
});
