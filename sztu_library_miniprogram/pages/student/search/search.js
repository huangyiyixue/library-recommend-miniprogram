// pages/student/search/search.js —— 书籍搜索：模糊匹配 + 记录搜索历史
const api = require('../../../utils/api.js')
const mock = require('../../../utils/mock.js')

Page({
  data: {
    keyword: '',
    results: [],
    searched: false,
    history: [],
    hotWords: mock.HOT_SEARCH
  },

  onShow() {
    // 每次进入同步最新搜索历史（个人主页清空后即时生效）
    const app = getApp()
    this.setData({ history: (app.globalData.data && app.globalData.data.searchHistory) || [] })
  },

  onKeywordInput(e) { this.setData({ keyword: e.detail.value }) },

  clearKeyword() {
    this.setData({ keyword: '', results: [], searched: false })
  },

  doSearch() {
    const kw = (this.data.keyword || '').trim()
    if (!kw) {
      wx.showToast({ title: '请输入搜索关键词', icon: 'none' })
      return
    }
    this.saveHistory(kw)
    wx.showLoading({ title: '搜索中...' })
    api.searchBooks(kw).then(list => {
      wx.hideLoading()
      this.setData({ results: list, searched: true })
    })
  },

  // 点击历史 / 热搜词直接搜索
  tapHistory(e) {
    const word = e.currentTarget.dataset.word
    this.setData({ keyword: word }, this.doSearch)
  },

  // 记录搜索历史（去重，最新在前，最多保留 10 条）
  saveHistory(kw) {
    const app = getApp()
    const h = app.globalData.data.searchHistory || []
    const idx = h.indexOf(kw)
    if (idx >= 0) h.splice(idx, 1)
    h.unshift(kw)
    app.globalData.data.searchHistory = h.slice(0, 10)
    app.saveData()
    this.setData({ history: app.globalData.data.searchHistory })
  },

  clearHistory() {
    const app = getApp()
    wx.showModal({
      title: '清空搜索记录',
      content: '确定要清空全部历史搜索记录吗？',
      confirmColor: '#0B4DA2',
      success: res => {
        if (!res.confirm) return
        app.globalData.data.searchHistory = []
        app.saveData()
        this.setData({ history: [] })
        wx.showToast({ title: '已清空', icon: 'success' })
      }
    })
  },

  goDetail(e) {
    wx.navigateTo({ url: '/pages/student/detail/detail?id=' + e.currentTarget.dataset.id })
  }
})
