// app.js —— 全局逻辑：登录态管理 + 用户业务数据（全部本地模拟，无真实接口）
const store = require('./utils/store.js')
const mock = require('./utils/mock.js')

App({
  globalData: {
    user: null,        // 当前登录用户 { id, name, role, college, grade, major }
    data: null,        // 用户业务数据 { preferences, favorites, searchHistory, borrowHistory, dislikedTags }
    isNewUser: false   // 是否新用户（未填写阅读偏好）
  },

  // 小程序启动：尝试恢复上次登录会话（模拟，不做真实鉴权）
  onLaunch() {
    const session = store.getSession()
    if (session) {
      this.globalData.user = session
      this.globalData.data = store.getData(session.id) || store.defaultData(session)
      this.globalData.isNewUser = !this.globalData.data.preferences
    }
  },

  /**
   * 模拟登录：仅在本地 mock 账号表中校验
   * @param {string} id  学号/工号
   * @param {string} pwd 密码
   * @returns {{ok:boolean, role?:string, msg?:string}}
   */
  login(id, pwd) {
    const acc = mock.ACCOUNTS[id]
    if (!acc || acc.password !== pwd) {
      return { ok: false, msg: '学号或密码错误，请重试（模拟校验）' }
    }
    const user = {
      id: acc.id,
      name: acc.name,
      role: acc.role,
      college: acc.college,
      grade: acc.grade,
      major: acc.major
    }
    let data = store.getData(user.id)
    if (!data) data = store.defaultData(user) // 首次登录生成默认数据（含模拟借阅记录）
    this.globalData.user = user
    this.globalData.data = data
    this.globalData.isNewUser = !data.preferences
    store.setSession(user)
    store.setData(user.id, data)
    return { ok: true, role: user.role }
  },

  // 持久化当前用户数据到本地存储
  saveData() {
    const user = this.globalData.user
    if (user) store.setData(user.id, this.globalData.data)
  },

  // 退出登录：先落盘数据，再清除会话
  logout() {
    this.saveData()
    store.clearSession()
    this.globalData.user = null
    this.globalData.data = null
    this.globalData.isNewUser = false
  },

  // 是否已填写阅读偏好
  hasPreference() {
    const d = this.globalData.data
    return !!(d && d.preferences && Object.keys(d.preferences).length > 0)
  }
})
