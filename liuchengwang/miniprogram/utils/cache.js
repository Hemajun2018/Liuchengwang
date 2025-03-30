/**
 * cache.js - 缓存管理工具
 * 提供缓存的读取、设置和清理功能
 */

/**
 * 创建项目特定的缓存键
 * @param {string} projectId - 项目ID
 * @param {string} dataType - 数据类型
 * @returns {string} 格式化的缓存键
 */
function createProjectCacheKey(projectId, dataType) {
  return `cache_project_${projectId}_${dataType}`;
}

/**
 * 设置缓存数据
 * @param {string} key - 缓存键
 * @param {any} data - 要缓存的数据
 * @param {number} [expireTime=3600] - 过期时间（秒），默认1小时
 */
function setCache(key, data, expireTime = 3600) {
  try {
    // 添加过期时间戳
    const expireAt = Date.now() + expireTime * 1000;
    const cacheData = {
      data: data,
      expireAt: expireAt
    };
    
    wx.setStorageSync(key, cacheData);
    console.log(`缓存已设置: ${key}`);
  } catch (e) {
    console.error(`设置缓存失败: ${key}`, e);
  }
}

/**
 * 获取缓存数据
 * @param {string} key - 缓存键
 * @param {boolean} [checkExpire=true] - 是否检查过期时间
 * @returns {any|null} 缓存的数据，如果不存在或已过期则返回null
 */
function getCache(key, checkExpire = true) {
  try {
    const cacheData = wx.getStorageSync(key);
    
    if (!cacheData) {
      return null;
    }
    
    // 检查是否过期
    if (checkExpire && cacheData.expireAt && Date.now() > cacheData.expireAt) {
      console.log(`缓存已过期: ${key}`);
      wx.removeStorageSync(key);
      return null;
    }
    
    return cacheData.data;
  } catch (e) {
    console.error(`获取缓存失败: ${key}`, e);
    return null;
  }
}

/**
 * 清除特定缓存
 * @param {string} key - 缓存键
 */
function clearCache(key) {
  try {
    wx.removeStorageSync(key);
    console.log(`缓存已清除: ${key}`);
  } catch (e) {
    console.error(`清除缓存失败: ${key}`, e);
  }
}

/**
 * 清除所有匹配模式的缓存
 * @param {string[]} patterns - 匹配模式数组
 */
function clearAllCache(patterns = []) {
  try {
    // 如果没有指定模式，清除所有缓存
    if (!patterns || patterns.length === 0) {
      wx.clearStorageSync();
      console.log('所有缓存已清除');
      return;
    }
    
    // 获取所有Storage的key
    const keys = wx.getStorageInfoSync().keys;
    
    // 遍历所有key，检查是否匹配任一模式
    keys.forEach(key => {
      const shouldClear = patterns.some(pattern => 
        key.includes(pattern)
      );
      
      if (shouldClear) {
        wx.removeStorageSync(key);
        console.log(`匹配模式的缓存已清除: ${key}`);
      }
    });
  } catch (e) {
    console.error('清除缓存失败', e);
  }
}

module.exports = {
  createProjectCacheKey,
  setCache,
  getCache,
  clearCache,
  clearAllCache
}; 