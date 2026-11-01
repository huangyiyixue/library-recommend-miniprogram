// pages/student/mine/mine.js —— 个人主页：收藏 / 借阅 / 偏好管理 / 搜索记录
const mock = require('../../../utils/mock.js')

Page({
  data: {
    user: {},
    tab: 'fav',                 // fav | borrow
    favorites: [],              // 收藏书籍详情
    borrows: [],                // 借阅记录（含书名）
    searchHistory: [],
    hasPreference: false,
    pref: {},

    // 偏好弹窗
    showPrefModal: false,
    chipTypes: [],
    chipStyles: [],
    chipAuthors: [],
    chipPurposes: [],
    formFavoriteBooks: [],
    bookInput: ''
  },

  onLoad() {
    const app = getApp()
    if (!app.globalData.user) {
      wx.reLaunch({ url: '/pages/login/login' })
      return
    }
    this.setData({ user: Object.assign({}, app.globalData.user) }, () => this.setAvatar())
    this.refreshAll()
  },

  // 从首页/详情返回时刷新数据
  onShow() {
    const app = getApp()
    if (!app.globalData.user) return
    this.setData({ user: Object.assign({}, app.globalData.user) }, () => this.setAvatar())
    this.refreshAll()
  },

  // 头像首字（WXML 不支持函数调用，需在 JS 内预处理）
  setAvatar() {
    const name = this.data.user.name || '学'
    this.setData({ 'user.avatarText': name.charAt(0) })
  },

  refreshAll() {
    const app = getApp()
    const d = app.globalData.data
    const bookOf = id => mock.BOOKS.filter(b => b.id === id)[0]

    // 收藏
    const favorites = (d.favorites || []).map(bookOf).filter(Boolean)

    // 借阅记录：补充书名等信息
    const borrows = (d.borrowHistory || []).map(r => {
      const b = bookOf(r.bookId) || {}
      return {
        bookId: r.bookId,
        title: b.title || '未知书籍',
        author: b.author || '',
        category: b.category || '',
        date: r.date,
        status: r.status
      }
    })

    this.setData({
      favorites: favorites,
      borrows: borrows,
      searchHistory: (d.searchHistory || []).slice(),
      hasPreference: app.hasPreference(),
      pref: (d.preferences && Object.assign({}, d.preferences)) || {}
    })
  },

  switchTab(e) { this.setData({ tab: e.currentTarget.dataset.tab }) },

  // 取消收藏（红心）
  unfav(e) {
    const app = getApp()
    const id = e.currentTarget.dataset.id
    const favs = app.globalData.data.favorites
    const idx = favs.indexOf(id)
    if (idx >= 0) favs.splice(idx, 1)
    app.saveData()
    wx.showToast({ title: '已取消收藏', icon: 'none' })
    this.refreshAll()
  },

  // ---------------- 阅读偏好 ----------------
  initChips() {
    const app = getApp()
    const p = (app.globalData.data && app.globalData.data.preferences) || {}
    const opt = mock.PREF_OPTIONS
    const build = (arr, selected) => arr.map(name => ({
      name: name,
      selected: Array.isArray(selected) ? selected.indexOf(name) >= 0 : selected === name
    }))
    this.setData({
      chipTypes: build(opt.types, p.types || []),
      chipStyles: build(opt.styles, p.styles || []),
      chipAuthors: build(opt.authors, p.authors || []),
      chipPurposes: build(opt.purposes, p.purpose || ''),
      formFavoriteBooks: (p.favoriteBooks || []).slice(),
      bookInput: ''
    })
  },

  openPrefModal() {
    this.initChips()
    this.setData({ showPrefModal: true })
  },
  closePref() { this.setData({ showPrefModal: false }) },
  noop() {},

  toggleChip(e) {
    const field = e.currentTarget.dataset.field
    const value = e.currentTarget.dataset.value
    const map = { types: 'chipTypes', styles: 'chipStyles', authors: 'chipAuthors', purpose: 'chipPurposes' }
    const key = map[field]
    const arr = this.data[key].slice()
    if (field === 'purpose') {
      arr.forEach(item => { item.selected = item.name === value })
    } else {
      arr.forEach(item => { if (item.name === value) item.selected = !item.selected })
    }
    this.setData({ [key]: arr })
  },

  onBookInput(e) { this.setData({ bookInput: e.detail.value }) },

  addFavBook() {
    const v = (this.data.bookInput || '').trim()
    if (!v) return
    if (this.data.formFavoriteBooks.indexOf(v) >= 0) { this.setData({ bookInput: '' }); return }
    this.setData({ formFavoriteBooks: this.data.formFavoriteBooks.concat(v), bookInput: '' })
  },

  removeFavBook(e) {
    const v = e.currentTarget.dataset.value
    this.setData({ formFavoriteBooks: this.data.formFavoriteBooks.filter(x => x !== v) })
  },

  savePref() {
    const app = getApp()
    const pick = arr => arr.filter(x => x.selected).map(x => x.name)
    const purposeArr = pick(this.data.chipPurposes)
    app.globalData.data.preferences = {
      types: pick(this.data.chipTypes),
      styles: pick(this.data.chipStyles),
      authors: pick(this.data.chipAuthors),
      purpose: purposeArr.length ? purposeArr[0] : '',
      favoriteBooks: this.data.formFavoriteBooks.slice()
    }
    app.saveData()
    this.setData({ showPrefModal: false })
    wx.showToast({ title: '偏好已更新', icon: 'success' })
    this.refreshAll()
  },

  // 重置偏好：清空偏好与负反馈标签
  resetPref() {
    const app = getApp()
    wx.showModal({
      title: '重置阅读偏好',
      content: '将清空你的偏好标签与"不感兴趣"记录，推荐结果回到默认热门。',
      confirmColor: '#D93636',
      success: res => {
        if (!res.confirm) return
        app.globalData.data.preferences = null
        app.globalData.data.dislikedTags = []
        app.saveData()
        wx.showToast({ title: '已重置', icon: 'success' })
        this.refreshAll()
      }
    })
  },

  // ---------------- 搜索记录 ----------------
  clearHistory() {
    const app = getApp()
    wx.showModal({
      title: '清空搜索记录',
      content: '确定清空全部历史搜索记录吗？',
      confirmColor: '#0B4DA2',
      success: res => {
        if (!res.confirm) return
        app.globalData.data.searchHistory = []
        app.saveData()
        this.setData({ searchHistory: [] })
        wx.showToast({ title: '已清空', icon: 'success' })
      }
    })
  },

  // ---------------- 其他 ----------------
  goDetail(e) {
    wx.navigateTo({ url: '/pages/student/detail/detail?id=' + e.currentTarget.dataset.id })
  },

  logout() {
    wx.showModal({
      title: '退出登录',
      content: '确定要退出当前账号吗？',
      confirmColor: '#0B4DA2',
      success: res => {
        if (!res.confirm) return
        getApp().logout()
        wx.reLaunch({ url: '/pages/login/login' })
      }
    })
  }
})
