// pages/student/home/home.js —— 学生端首页：个性化推荐 + 热门榜单 + 首次登录偏好弹窗
const api = require('../../../utils/api.js')
const mock = require('../../../utils/mock.js')

Page({
  data: {
    user: {},
    recommendations: [],
    hotList: [],
    loadingRec: true,
    hasPreference: false,
    offset: 0,

    // 偏好弹窗
    showPrefModal: false,
    prefChecked: false,     // 本次会话是否已提示过，避免重复弹窗
    chipTypes: [],
    chipStyles: [],
    chipAuthors: [],
    chipPurposes: [],
    formFavoriteBooks: [],
    bookInput: ''
  },

  onLoad() {
    const app = getApp()
    // 未登录（异常进入）时退回登录页
    if (!app.globalData.user) {
      wx.reLaunch({ url: '/pages/login/login' })
      return
    }
    this.setData({ user: app.globalData.user })
    this.initChips()
    this.loadHot()
  },

  onShow() {
    const app = getApp()
    if (!app.globalData.user) return
    this.setData({ user: app.globalData.user })
    this.loadRecommend()

    // 新用户（未填写阅读偏好）首次登录弹出偏好弹窗，可跳过
    if (!this.data.prefChecked && !app.hasPreference()) {
      this.setData({ showPrefModal: true, prefChecked: true })
    }
  },

  // ---------------- 推荐书单 ----------------
  loadRecommend() {
    const app = getApp()
    this.setData({ loadingRec: true, hasPreference: app.hasPreference() })
    api.getRecommendations(app.globalData.user, app.globalData.data, { limit: 6, offset: this.data.offset })
      .then(list => {
        const favs = app.globalData.data.favorites || []
        const mapped = list.map(b => Object.assign({}, b, { isFav: favs.indexOf(b.id) >= 0 }))
        this.setData({ recommendations: mapped, loadingRec: false })
      })
  },

  // 下拉刷新：重新计算推荐
  onPullDownRefresh() {
    this.loadHot()
    this.loadRecommend()
    setTimeout(() => wx.stopPullDownRefresh(), 500)
  },

  // 换一批：滚动偏移，循环取书
  refreshRec() {
    this.setData({ offset: this.data.offset + 6 })
    this.loadRecommend()
    wx.showToast({ title: '已换一批', icon: 'none' })
  },

  // 热门榜单
  loadHot() {
    api.getHotBooks(5).then(list => this.setData({ hotList: list }))
  },

  // 不感兴趣：把该书的类型/分类/标签加入降权集合，重新计算推荐
  dislike(e) {
    const app = getApp()
    const id = e.currentTarget.dataset.id
    const book = mock.BOOKS.filter(b => b.id === id)[0]
    if (!book) return
    const data = app.globalData.data
    const keys = [book.type, book.category, book.author].concat(book.tags)
    keys.forEach(k => {
      if (data.dislikedTags.indexOf(k) < 0) data.dislikedTags.push(k)
    })
    app.saveData()
    wx.showToast({ title: '已减少同类推荐', icon: 'none' })
    this.loadRecommend()
  },

  // 收藏 / 取消收藏
  toggleFav(e) {
    const app = getApp()
    const id = e.currentTarget.dataset.id
    const favs = app.globalData.data.favorites
    const idx = favs.indexOf(id)
    if (idx >= 0) {
      favs.splice(idx, 1)
      wx.showToast({ title: '已取消收藏', icon: 'none' })
    } else {
      favs.push(id)
      wx.showToast({ title: '已收藏', icon: 'success' })
    }
    app.saveData()
    this.loadRecommend()
  },

  // 跳转书籍详情
  goDetail(e) {
    wx.navigateTo({ url: '/pages/student/detail/detail?id=' + e.currentTarget.dataset.id })
  },

  // ---------------- 偏好弹窗 ----------------
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
    this.setData({ showPrefModal: true, prefChecked: true })
  },

  // 多选 / 单选（阅读用途为单选）
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
    if (this.data.formFavoriteBooks.indexOf(v) >= 0) {
      this.setData({ bookInput: '' })
      return
    }
    this.setData({
      formFavoriteBooks: this.data.formFavoriteBooks.concat(v),
      bookInput: ''
    })
  },

  removeFavBook(e) {
    const v = e.currentTarget.dataset.value
    this.setData({
      formFavoriteBooks: this.data.formFavoriteBooks.filter(x => x !== v)
    })
  },

  // 收集弹窗表单结果
  collectForm() {
    const pick = arr => arr.filter(x => x.selected).map(x => x.name)
    const purposeArr = pick(this.data.chipPurposes)
    return {
      types: pick(this.data.chipTypes),
      styles: pick(this.data.chipStyles),
      authors: pick(this.data.chipAuthors),
      purpose: purposeArr.length ? purposeArr[0] : '',
      favoriteBooks: this.data.formFavoriteBooks.slice()
    }
  },

  savePref() {
    const app = getApp()
    const form = this.collectForm()
    if (!form.types.length && !form.styles.length && !form.authors.length &&
        !form.purpose && !form.favoriteBooks.length) {
      wx.showToast({ title: '请至少选择一项偏好', icon: 'none' })
      return
    }
    app.globalData.data.preferences = form
    app.saveData()
    this.setData({ showPrefModal: false })
    wx.showToast({ title: '偏好已保存', icon: 'success' })
    this.loadRecommend()
  },

  skipPref() {
    this.setData({ showPrefModal: false })
    wx.showToast({ title: '已跳过，可在"我的"中补充', icon: 'none' })
  },

  noop() {}
})
