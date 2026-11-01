// utils/recommend.js —— 个性化推荐算法（本地模拟打分，接口占位）
/**
 * 打分维度（模拟真实推荐逻辑）：
 *   1. 阅读偏好：书籍类型 / 风格 / 喜爱作家 / 阅读用途 / 喜欢的书籍
 *   2. 用户画像：专业（college、major）、年级
 *   3. 行为数据：历史借阅、收藏、搜索记录
 *   4. 负反馈：被点"不感兴趣"的同类标签降权
 *   5. 兜底：无任何命中时按热门度排序（hot_books 思路）
 */
const mock = require('./mock.js')

// 单本书打分：返回 { score, reason, reasonTag }
function scoreBook(book, user, prefs, behaviors) {
  let score = 0
  let reason = ''
  let reasonTag = ''

  // 1) 喜爱作家（权重最高）
  if (prefs && prefs.authors && prefs.authors.indexOf(book.author) >= 0) {
    score += 40
    reason = '你喜爱的作家：' + book.author
    reasonTag = '作家偏好'
  }

  // 2) 喜欢的书籍 -> 同类（同类型/同分类）
  if (prefs && prefs.favoriteBooks && prefs.favoriteBooks.length) {
    const hit = prefs.favoriteBooks.filter(function (t) {
      return matchBook(mock.BOOKS, t, book)
    })
    if (hit.length && score < 35) {
      score += 32
      reason = '与你喜欢的《' + hit[0] + '》同类'
      reasonTag = '同类推荐'
    }
  }

  // 3) 书籍类型偏好
  if (prefs && prefs.types && prefs.types.indexOf(book.type) >= 0) {
    score += 26
    if (!reason) { reason = '匹配你的阅读偏好：' + book.type; reasonTag = '偏好匹配' }
  }

  // 4) 风格偏好
  if (prefs && prefs.styles && prefs.styles.indexOf(book.style) >= 0) {
    score += 14
    if (!reason) { reason = '符合你喜欢的风格：' + book.style; reasonTag = '风格匹配' }
  }

  // 5) 阅读用途：专业课学习 -> 专业教材/前沿技术加权；休闲阅读 -> 文学/通识加权
  if (prefs && prefs.purpose === '专业课学习' && (book.type === '专业教材' || book.type === '前沿技术')) {
    score += 18
    if (!reason) { reason = '匹配你的阅读用途：专业课学习'; reasonTag = '用途匹配' }
  }
  if (prefs && prefs.purpose === '休闲阅读' && (book.category === '文学' || book.category === '通识' || book.category === '艺术设计')) {
    score += 16
    if (!reason) { reason = '匹配你的阅读用途：休闲阅读'; reasonTag = '用途匹配' }
  }

  // 6) 专业相关（书籍适用学院包含用户学院）
  if (user && user.college && book.colleges && book.colleges.indexOf(user.college) >= 0) {
    score += 22
    if (!reason) { reason = '与你的专业（' + (user.major || user.college) + '）相关'; reasonTag = '专业匹配' }
  }

  // 7) 历史借阅同类（同分类）
  if (behaviors.borrowedCategories && behaviors.borrowedCategories.indexOf(book.category) >= 0) {
    score += 12
    if (!reason) { reason = '与你借阅过的同类书籍相关'; reasonTag = '借阅关联' }
  }

  // 8) 收藏同类（同分类）
  if (behaviors.favoritedCategories && behaviors.favoritedCategories.indexOf(book.category) >= 0) {
    score += 10
    if (!reason) { reason = '与你收藏过的同类书籍相关'; reasonTag = '收藏关联' }
  }

  // 9) 历史搜索词命中书名 / 作者 / 标签
  if (behaviors.searchWords && behaviors.searchWords.length) {
    const kw = behaviors.searchWords.find(function (w) {
      return book.title.indexOf(w) >= 0 || book.author.indexOf(w) >= 0 ||
        book.tags.join(',').indexOf(w) >= 0 || book.category.indexOf(w) >= 0
    })
    if (kw) {
      score += 15
      if (!reason) { reason = '匹配你的搜索记录：' + kw; reasonTag = '搜索关联' }
    }
  }

  // 10) 负反馈降权：命中"不感兴趣"的标签/类型/分类（权重较大，确保同类下沉）
  let negative = false
  if (behaviors.dislikedTags && behaviors.dislikedTags.length) {
    const penaltyKeys = [book.type, book.category, book.author].concat(book.tags)
    const hit = behaviors.dislikedTags.filter(function (t) { return penaltyKeys.indexOf(t) >= 0 })
    if (hit.length) {
      score -= 60 * hit.length
      negative = true
      reason = '同类书籍已为你减少推荐'
      reasonTag = '已降权'
    }
  }

  // 11) 热门度作为基础分（0.1 系数，保证兜底排序稳定）
  score += book.hot * 0.1

  // 12) 已借完的书轻微降权（体验优化）
  if (book.available === 0) score -= 5

  if (!reason) { reason = '大家都在看 · 热门图书'; reasonTag = '热门' }

  return { score: score, reason: reason, reasonTag: reasonTag, negative: negative }
}

// 判断两本书是否同类（同分类 或 同类型 或 有共同标签）
function matchBook(books, title, book) {
  const target = books.filter(function (b) { return b.title === title })[0]
  if (!target) return false
  if (target.id === book.id) return false
  if (target.category === book.category) return true
  if (target.type === book.type) return true
  return target.tags.some(function (t) { return book.tags.indexOf(t) >= 0 })
}

/**
 * 生成推荐书单
 * @param {Object} user   当前用户
 * @param {Object} data   用户业务数据（preferences / favorites / borrowHistory / searchHistory / dislikedTags）
 * @param {Object} opts   { limit, offset } 支持"换一批"
 * @returns {Array} 带 score / reason / reasonTag 的书籍列表
 */
function recommend(user, data, opts) {
  opts = opts || {}
  const limit = opts.limit || 6
  const offset = opts.offset || 0
  const books = mock.BOOKS
  const prefs = data && data.preferences ? data.preferences : null

  // 汇总用户行为特征
  const behaviors = {
    borrowedCategories: [],
    favoritedCategories: [],
    searchWords: (data && data.searchHistory) ? data.searchHistory.slice(0, 8) : [],
    dislikedTags: (data && data.dislikedTags) ? data.dislikedTags : []
  }
  if (data && data.borrowHistory) {
    data.borrowHistory.forEach(function (r) {
      const b = books.filter(function (x) { return x.id === r.bookId })[0]
      if (b && behaviors.borrowedCategories.indexOf(b.category) < 0) behaviors.borrowedCategories.push(b.category)
    })
  }
  if (data && data.favorites) {
    data.favorites.forEach(function (id) {
      const b = books.filter(function (x) { return x.id === id })[0]
      if (b && behaviors.favoritedCategories.indexOf(b.category) < 0) behaviors.favoritedCategories.push(b.category)
    })
  }

  // 打分 + 排序（同分时保持书库原顺序，结果稳定）
  const scored = books.map(function (b, idx) {
    const r = scoreBook(b, user, prefs, behaviors)
    return Object.assign({}, b, {
      score: r.score, reason: r.reason, reasonTag: r.reasonTag, negative: r.negative, _idx: idx
    })
  }).sort(function (a, b) {
    if (b.score !== a.score) return b.score - a.score
    return a._idx - b._idx
  })

  // 过滤：分数大于 0 且未被标记为"不感兴趣"同类
  const positive = scored.filter(function (b) { return b.score > 0 && !b.negative })
  // 兜底：命中太少时优先取未被负反馈降权的书，仍不足则退回全量热门
  const notNegative = scored.filter(function (b) { return !b.negative })
  const fallback = notNegative.length >= 3 ? notNegative : scored
  const list = positive.length >= 3 ? positive : fallback.slice(0, 8)
  return list.slice(offset, offset + limit)
}

// 热门榜单（兜底书单思路：无偏好时按 hot 排序）
function hotBooks(limit) {
  return mock.BOOKS.slice().sort(function (a, b) { return b.hot - a.hot }).slice(0, limit || 5)
}

// 模糊搜索：书名 / 作者 / 分类 / 标签（忽略英文大小写）
function search(keyword) {
  const kw = (keyword || '').trim().toLowerCase()
  if (!kw) return []
  return mock.BOOKS.filter(function (b) {
    const hay = (b.title + b.author + b.category + b.type + b.tags.join(',')).toLowerCase()
    return hay.indexOf(kw) >= 0
  })
}

module.exports = {
  recommend: recommend,
  hotBooks: hotBooks,
  search: search
}
