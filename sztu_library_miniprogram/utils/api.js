// utils/api.js —— 接口占位层
// 说明：本项目为课程原型，全部使用本地模拟数据。
// 真实环境只需把每个方法内部替换为 wx.request({ url: '/api/xxx' }) 即可，调用方无需改动。

const mock = require('./mock.js')
const recommend = require('./recommend.js')

// 模拟网络延迟，让 loading 效果更真实
function delay(ms) {
  return new Promise(function (resolve) { setTimeout(resolve, ms || 300) })
}

/**
 * 【占位】登录接口 -> 未来：POST /api/auth/login
 * @returns Promise<{ok, role, msg}>
 */
function login(id, password) {
  return delay(400).then(function () {
    const app = getApp()
    return app.login(id, password)
  })
}

/**
 * 【占位】获取个性化推荐书单 -> 未来：GET /api/recommend
 */
function getRecommendations(user, data, opts) {
  return delay(350).then(function () {
    return recommend.recommend(user, data, opts)
  })
}

/**
 * 【占位】获取热门榜单 -> 未来：GET /api/books/hot
 */
function getHotBooks(limit) {
  return delay(200).then(function () {
    return recommend.hotBooks(limit)
  })
}

/**
 * 【占位】书籍模糊搜索 -> 未来：GET /api/books/search?keyword=
 */
function searchBooks(keyword) {
  return delay(300).then(function () {
    return recommend.search(keyword)
  })
}

/**
 * 【占位】书籍详情 -> 未来：GET /api/books/:id
 */
function getBookDetail(id) {
  return delay(200).then(function () {
    return mock.BOOKS.filter(function (b) { return b.id === id })[0] || null
  })
}

/**
 * 【占位】管理员统计数据（支持学院 / 年级筛选）-> 未来：GET /api/admin/stats
 */
function getAdminStats(college, grade) {
  return delay(400).then(function () {
    const base = mock.ADMIN_STATS
    const cf = college && college !== '全部学院' ? (mock.COLLEGE_PROFILE[college] || { factor: 1 }) : { factor: 1 }
    const gf = grade && grade !== '全部年级' ? (mock.GRADE_PROFILE[grade] || 1) : 1
    const k = cf.factor * gf

    // 总览：按筛选系数缩放
    const overview = {
      totalBorrow: Math.round(base.overview.totalBorrow * k),
      activeReaders: Math.round(base.overview.activeReaders * k),
      totalBooks: base.overview.totalBooks,
      availableRate: base.overview.availableRate
    }

    // 各学院借阅量：选中某学院时突出该学院，其余轻微缩放
    const collegeBorrow = base.collegeBorrow.map(function (c) {
      const v = (college === '全部学院' || !college) ? c.value
        : (c.name === college ? c.value : Math.round(c.value * 0.6))
      return { name: c.name, value: Math.round(v * gf), active: c.name === college }
    })

    // 分类占比：选中学院时用该学院画像重算，否则用基准
    let categoryRatio
    if (cf.categories) {
      categoryRatio = Object.keys(cf.categories).map(function (name) {
        return { name: name, value: cf.categories[name] }
      }).sort(function (a, b) { return b.value - a.value })
    } else {
      categoryRatio = base.categoryRatio.map(function (c) { return { name: c.name, value: c.value } })
    }
    const catSum = categoryRatio.reduce(function (s, c) { return s + c.value }, 0)
    const maxCat = categoryRatio[0].value || 1
    categoryRatio = categoryRatio.map(function (c) {
      return {
        name: c.name,
        value: c.value,
        percent: Math.round(c.value / catSum * 1000) / 10,
        width: Math.round(c.value / maxCat * 100)
      }
    })

    // 借阅趋势：按系数缩放
    const trend = base.trend.map(function (t) {
      return { month: t.month, value: Math.round(t.value * k), height: Math.round(t.value / 2200 * 100) }
    })

    return {
      overview: overview,
      collegeBorrow: collegeBorrow,
      categoryRatio: categoryRatio,
      trend: trend,
      hotSearchWords: base.hotSearchWords,
      purchaseAdvice: base.purchaseAdvice
    }
  })
}

module.exports = {
  login: login,
  getRecommendations: getRecommendations,
  getHotBooks: getHotBooks,
  searchBooks: searchBooks,
  getBookDetail: getBookDetail,
  getAdminStats: getAdminStats
}
