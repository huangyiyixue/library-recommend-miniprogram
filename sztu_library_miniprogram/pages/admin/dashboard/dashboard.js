// pages/admin/dashboard/dashboard.js —— 管理员端：统计数据看板（接口占位 + 学院/年级筛选）
const api = require('../../../utils/api.js')
const mock = require('../../../utils/mock.js')

Page({
  data: {
    user: {},
    colleges: ['全部学院'].concat(mock.COLLEGES),
    grades: ['全部年级'].concat(mock.GRADES),
    collegeIndex: 0,
    gradeIndex: 0,
    stats: null
  },

  onLoad() {
    const app = getApp()
    // 非管理员不允许进入看板
    if (!app.globalData.user || app.globalData.user.role !== 'admin') {
      wx.showToast({ title: '仅管理员可访问', icon: 'none' })
      setTimeout(() => wx.reLaunch({ url: '/pages/login/login' }), 600)
      return
    }
    this.setData({ user: app.globalData.user })
    this.loadStats()
  },

  // 加载统计数据（api 占位，内部使用模拟数据）
  loadStats() {
    wx.showLoading({ title: '加载中...' })
    const college = this.data.colleges[this.data.collegeIndex]
    const grade = this.data.grades[this.data.gradeIndex]
    api.getAdminStats(college, grade).then(stats => {
      wx.hideLoading()
      // 条形图宽度归一化（在 JS 内计算，WXML 只做渲染）
      const maxCollege = Math.max.apply(null, stats.collegeBorrow.map(c => c.value)) || 1
      stats.collegeBorrow = stats.collegeBorrow.map(c => Object.assign({}, c, {
        width: Math.round(c.value / maxCollege * 100)
      }))
      this.setData({ stats: stats })
    })
  },

  onCollegeChange(e) {
    this.setData({ collegeIndex: Number(e.detail.value) }, this.loadStats)
  },
  onGradeChange(e) {
    this.setData({ gradeIndex: Number(e.detail.value) }, this.loadStats)
  },
  resetFilter() {
    this.setData({ collegeIndex: 0, gradeIndex: 0 }, this.loadStats)
    wx.showToast({ title: '已重置筛选', icon: 'none' })
  },

  logout() {
    wx.showModal({
      title: '退出登录',
      content: '确定退出管理员账号吗？',
      confirmColor: '#0B4DA2',
      success: res => {
        if (!res.confirm) return
        getApp().logout()
        wx.reLaunch({ url: '/pages/login/login' })
      }
    })
  }
})
