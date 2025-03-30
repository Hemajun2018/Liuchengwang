/**
 * token管理工具
 * 负责token的存储、获取、验证和刷新
 */

/**
 * 保存token和过期时间
 * @param {string} token - JWT token
 * @param {number} expiresIn - 过期时间（秒），默认23小时
 */
const saveToken = (token, expiresIn = 23 * 60 * 60) => {
  if (!token) return false;
  
  // 计算过期时间
  const expireTime = Date.now() + expiresIn * 1000;
  
  // 保存token和过期时间
  wx.setStorageSync('token', token);
  wx.setStorageSync('tokenExpireTime', expireTime);
  
  console.log('Token已保存，将在', new Date(expireTime).toLocaleString(), '过期');
  return true;
};

/**
 * 获取token
 * @param {boolean} checkValidity - 是否检查有效性
 * @returns {string|null} token或null（如果不存在或已过期）
 */
const getToken = (checkValidity = true) => {
  const token = wx.getStorageSync('token');
  
  // 如果不检查有效性或者没有token，直接返回
  if (!checkValidity || !token) {
    return token || null;
  }
  
  // 检查是否过期
  const expireTime = wx.getStorageSync('tokenExpireTime');
  if (!expireTime || Date.now() >= expireTime) {
    console.log('Token已过期');
    return null;
  }
  
  return token;
};

/**
 * 检查token是否有效
 * @returns {boolean} 是否有效
 */
const isTokenValid = () => {
  return getToken() !== null;
};

/**
 * 清除token
 */
const clearToken = () => {
  wx.removeStorageSync('token');
  wx.removeStorageSync('tokenExpireTime');
  console.log('Token已清除');
};

/**
 * 处理token过期情况
 * @param {boolean} redirectToLogin - 是否重定向到登录页面
 */
const handleTokenExpired = (redirectToLogin = true) => {
  clearToken();
  
  if (redirectToLogin) {
    wx.showModal({
      title: '登录已过期',
      content: '您的登录信息已过期，请重新登录',
      showCancel: false,
      success: () => {
        wx.navigateTo({
          url: '/pages/index/index'
        });
      }
    });
  }
};

// 导出模块
module.exports = {
  saveToken,
  getToken,
  isTokenValid,
  clearToken,
  handleTokenExpired
};