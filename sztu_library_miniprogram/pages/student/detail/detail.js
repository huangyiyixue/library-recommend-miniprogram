// pages/student/detail/detail.js —— 书籍详情：简介 / 馆藏 / 状态 / 红心收藏
const api = require('../../../utils/api.js')
const mock = require('../../../utils/mock.js')

Page({
  data: {
    book: null,
    isFav: false,
    related: []
  },

  onLoad(options) {
    const id = options.id
    if (!id) {
      wx.showToast({ title: '缺少书籍 id', icon: 'none' })
      return
    }
    api.getBookDetail(id).then(book => {
      if (!book) {
        wx.showToast({ title: '未找到该书籍', icon: 'none' })
        return
      }
      // 预处理展示字段（WXML 不支持复杂表达式）
      book.tagText = book.tags.join(' / ')
      book.collegeText = book.colleges.join('、')
      this.setData({ book: book })
      wx.setNavigationBarTitle({ title: book.title })
      this.loadFavState(id)
      this.loadRelated(book)
    })
  },

  // 同类书籍：同分类或同类型，最多 3 本
  loadRelated(book) {
    const related = mock.BOOKS.filter(b => {
      return b.id !== book.id && (b.category === book.category || b.type === book.type)
    }).slice(0, 3)
    this.setData({ related: related })
  },

  loadFavState(id) {
    const app = getApp()
    const favs = (app.globalData.data && app.globalData.data.favorites) || []
    this.setData({ isFav: favs.indexOf(id) >= 0 })
  },

  // 红心收藏 / 取消收藏
  toggleFav() {
    const app = getApp()
    const id = this.data.book.id
    const favs = app.globalData.data.favorites
    const idx = favs.indexOf(id)
    if (idx >= 0) {
      favs.splice(idx, 1)
      this.setData({ isFav: false })
      wx.showToast({ title: '已取消收藏', icon: 'none' })
    } else {
      favs.push(id)
      this.setData({ isFav: true })
      wx.showToast({ title: '已加入收藏', icon: 'success' })
    }
    app.saveData()
  },

  goDetail(e) {
    wx.redirectTo({ url: '/pages/student/detail/detail?id=' + e.currentTarget.dataset.id })
  },

  goBack() {
    wx.navigateBack()
  }
})
