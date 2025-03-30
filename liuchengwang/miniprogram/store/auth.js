// 认证状态管理
const { observable, action } = require('mobx-miniprogram');

module.exports = observable({
  // 状态
  projectInfo: null,
  isLoggedIn: false,
  
  // 动作
  login: action(function(projectInfo) {
    this.projectInfo = projectInfo;
    this.isLoggedIn = true;
    
    // 保存到全局状态
    getApp().globalData.projectInfo = projectInfo;
  }),
  
  logout: action(function() {
    this.projectInfo = null;
    this.isLoggedIn = false;
    
    // 清除全局状态
    getApp().globalData.projectInfo = null;
    getApp().globalData.elements = null;
    getApp().globalData.relations = null;
  })
});