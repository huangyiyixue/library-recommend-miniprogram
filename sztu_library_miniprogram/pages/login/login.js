// pages/login/login.js —— 登录页逻辑（本地模拟校验，不请求任何真实接口）
const api = require('../../utils/api.js')

Page({
  data: {
    id: '',
    password: '',
    showPwd: false,
    agreed: true,
    canLogin: false
  },

  onLoad() {
    // 若已有登录会话，直接进入对应端首页（方便调试与演示）
    const app = getApp()
    if (app.globalData.user) {
      this.jumpByRole(app.globalData.user.role)
    }
  },

  onIdInput(e) { this.setData({ id: e.detail.value }, this.checkCanLogin) },
  onPwdInput(e) { this.setData({ password: e.detail.value }, this.checkCanLogin) },

  togglePwd() { this.setData({ showPwd: !this.data.showPwd }) },
  toggleAgree() { this.setData({ agreed: !this.data.agreed }, this.checkCanLogin) },

  // 简单的按钮可用态判断
  checkCanLogin() {
    const ok = !!this.data.id && !!this.data.password && this.data.agreed
    this.setData({ canLogin: ok })
  },

  // 演示：一键填入模拟账号
  fillStudent() {
    this.setData({ id: '2025001', password: '123456', agreed: true }, this.checkCanLogin)
    wx.showToast({ title: '已填入学生账号', icon: 'none' })
  },
  fillAdmin() {
    this.setData({ id: 'admin01', password: 'admin123', agreed: true }, this.checkCanLogin)
    wx.showToast({ title: '已填入管理员账号', icon: 'none' })
  },

  // 登录（接口占位：api.login）
  onLogin() {
    if (!this.data.canLogin) {
      wx.showToast({ title: '请输入学号和密码', icon: 'none' })
      return
    }
    wx.showLoading({ title: '登录中...' })
    api.login(this.data.id, this.data.password).then(res => {
      wx.hideLoading()
      if (!res.ok) {
        // 登录失败提示
        wx.showModal({
          title: '登录失败',
          content: res.msg + '（如忘记账号，可点击下方体验账号一键填充）',
          showCancel: false,
          confirmColor: '#0B4DA2'
        })
        return
      }
      wx.showToast({ title: res.role === 'admin' ? '管理员登录成功' : '登录成功', icon: 'success' })
      setTimeout(() => this.jumpByRole(res.role), 600)
    })
  },

  // 按角色跳转：学生 -> tabBar 首页；管理员 -> 数据看板（无 tabBar）
  jumpByRole(role) {
    if (role === 'admin') {
      wx.redirectTo({ url: '/pages/admin/dashboard/dashboard' })
    } else {
      wx.switchTab({ url: '/pages/student/home/home' })
    }
  }
})
