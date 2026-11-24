// 由小程序 sztu_library_miniprogram/utils/store.js 机械适配：仅替换模块导出与运行环境，数据与算法未改动
(function () {
// utils/store.js —— 本地存储封装（模拟"服务端用户数据"，接口占位时的持久化方案）
const SESSION_KEY = 'sztu_lib_session'          // 当前登录会话
const DATA_PREFIX = 'sztu_lib_data_'            // 按用户 id 存储的业务数据

function getSession() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null') || null } catch (e) { return null }
}

function setSession(user) {
  try { localStorage.setItem(SESSION_KEY, JSON.stringify(user)) } catch (e) {}
}

function clearSession() {
  try { localStorage.removeItem(SESSION_KEY) } catch (e) {}
}

function getData(userId) {
  try { return JSON.parse(localStorage.getItem(DATA_PREFIX + userId) || 'null') || null } catch (e) { return null }
}

function setData(userId, data) {
  try { localStorage.setItem(DATA_PREFIX + userId, JSON.stringify(data)) } catch (e) {}
}

/**
 * 生成用户的默认业务数据
 * preferences 为 null 表示"新用户，尚未填写阅读偏好"
 */
function defaultData(user) {
  const mock = window.LIB_DATA
  const isStudent = user && user.role === 'student'
  return {
    preferences: null,                 // 阅读偏好：{ types, styles, authors, purpose, favoriteBooks }
    favorites: isStudent ? ['B001'] : [],              // 收藏书 id（默认预置一本，便于演示）
    searchHistory: isStudent ? ['Python', '科幻'] : [], // 历史搜索词
    borrowHistory: isStudent ? mock.DEFAULT_BORROW_HISTORY.slice() : [],
    dislikedTags: []                   // 被标记"不感兴趣"的标签（降权用）
  }
}

window.LIB_STORE = {
  getSession: getSession,
  setSession: setSession,
  clearSession: clearSession,
  getData: getData,
  setData: setData,
  defaultData: defaultData
}

})();
