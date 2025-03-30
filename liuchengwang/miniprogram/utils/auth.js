// 认证相关工具
const { request } = require('./request');

/**
 * 验证项目
 * @param {string} name - 项目名称
 * @param {string} password - 项目密码
 * @returns {Promise} Promise对象
 */
const verifyProject = (name, password) => {
  return request({
    url: '/api/auth/project/verify',
    method: 'POST',
    data: { name, password }
  });
};

/**
 * 检查是否已登录
 * @returns {boolean} 是否已登录
 */
const isLoggedIn = () => {
  const projectInfo = getApp().globalData.projectInfo;
  return !!projectInfo;
};

/**
 * 退出登录
 */
const logout = () => {
  // 清除全局状态
  getApp().globalData.projectInfo = null;
  
  // 跳转到登录页
  wx.navigateTo({
    url: '/pages/index/index'
  });
};

// 导出模块
module.exports = {
  verifyProject,
  isLoggedIn,
  logout
};