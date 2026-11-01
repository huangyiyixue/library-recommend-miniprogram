// utils/store.js —— 本地存储封装（模拟"服务端用户数据"，接口占位时的持久化方案）
const SESSION_KEY = 'sztu_lib_session'          // 当前登录会话
const DATA_PREFIX = 'sztu_lib_data_'            // 按用户 id 存储的业务数据

function getSession() {
  try { return wx.getStorageSync(SESSION_KEY) || null } catch (e) { return null }
}

function setSession(user) {
  try { wx.setStorageSync(SESSION_KEY, user) } catch (e) {}
}

function clearSession() {
  try { wx.removeStorageSync(SESSION_KEY) } catch (e) {}
}

function getData(userId) {
  try { return wx.getStorageSync(DATA_PREFIX + userId) || null } catch (e) { return null }
}

function setData(userId, data) {
  try { wx.setStorageSync(DATA_PREFIX + userId, data) } catch (e) {}
}

/**
 * 生成用户的默认业务数据
 * preferences 为 null 表示"新用户，尚未填写阅读偏好"
 */
function defaultData(user) {
  const mock = require('./mock.js')
  const isStudent = user && user.role === 'student'
  return {
    preferences: null,                 // 阅读偏好：{ types, styles, authors, purpose, favoriteBooks }
    favorites: isStudent ? ['B001'] : [],              // 收藏书 id（默认预置一本，便于演示）
    searchHistory: isStudent ? ['Python', '科幻'] : [], // 历史搜索词
    borrowHistory: isStudent ? mock.DEFAULT_BORROW_HISTORY.slice() : [],
    dislikedTags: []                   // 被标记"不感兴趣"的标签（降权用）
  }
}

module.exports = {
  getSession: getSession,
  setSession: setSession,
  clearSession: clearSession,
  getData: getData,
  setData: setData,
  defaultData: defaultData
}
