// H5 同结构备用版：视图切换与业务编排（数据与算法由 data.js / recommend.js 提供）
// 对应小程序 app.js + 6 个页面 js 的行为；无框架、无构建、无网络请求。
(function () {
  const DATA = window.LIB_DATA
  const REC = window.LIB_RECOMMEND
  const STORE = window.LIB_STORE
  const API = window.LIB_API

  const NAV_TITLE = {
    login: '统一身份认证', home: '个性化推荐', search: '书籍搜索',
    detail: '书籍详情', mine: '我的', dashboard: '数据看板（管理员）'
  }
  const TAB_VIEWS = ['home', 'search', 'mine']

  const state = {
    user: null, data: null, isNewUser: false,
    view: 'login', prevView: 'home', detailId: null,
    offset: 0, prefChecked: false, prefFrom: 'home',
    mineTab: 'fav', searched: false, results: []
  }

  const $ = id => document.getElementById(id)
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))

  // ---------- 小程序 wx.* 的等价物 ----------
  let toastTimer = null
  function toast(msg) {
    const el = $('toast')
    el.textContent = msg
    el.classList.remove('hidden')
    clearTimeout(toastTimer)
    toastTimer = setTimeout(() => el.classList.add('hidden'), 1600)
  }
  function loading(msg, hide) {
    $('loading-text').textContent = msg || '加载中...'
    $('loading').classList.toggle('hidden', !!hide)
  }
  function modal(title, content, cb, opt) {
    opt = opt || {}
    $('modal-title').textContent = title
    $('modal-content').textContent = content
    $('modal-cancel').classList.toggle('hidden', opt.showCancel === false)
    $('modal-ok').style.background = opt.confirmColor || ''
    $('modal').classList.remove('hidden')
    const close = () => { $('modal').classList.add('hidden'); $('modal-ok').onclick = null; $('modal-cancel').onclick = null }
    $('modal-ok').onclick = () => { close(); if (cb) cb(true) }
    $('modal-cancel').onclick = () => { close(); if (cb) cb(false) }
  }

  // ---------- 全局对象（api.js 中 getApp() 指向它） ----------
  const LIB_APP = {
    globalData: state,
    login(id, pwd) {
      const acc = DATA.ACCOUNTS[id]
      if (!acc || acc.password !== pwd) return { ok: false, msg: '学号或密码错误，请重试（模拟校验）' }
      const user = { id: acc.id, name: acc.name, role: acc.role, college: acc.college, grade: acc.grade, major: acc.major }
      let data = STORE.getData(user.id)
      if (!data) data = STORE.defaultData(user)
      state.user = user; state.data = data; state.isNewUser = !data.preferences
      STORE.setSession(user); STORE.setData(user.id, data)
      return { ok: true, role: user.role }
    },
    saveData() { if (state.user) STORE.setData(state.user.id, state.data) },
    logout() { LIB_APP.saveData(); STORE.clearSession(); state.user = null; state.data = null; state.isNewUser = false },
    hasPreference() {
      const d = state.data
      return !!(d && d.preferences && Object.keys(d.preferences).length > 0)
    }
  }
  window.LIB_APP = LIB_APP

  // ---------- 视图切换 ----------
  function go(view, opt) {
    opt = opt || {}
    if (view !== 'login' && !state.user) view = 'login'
    if (view !== state.view) state.prevView = state.view
    state.view = view
    document.querySelectorAll('.view').forEach(el => el.classList.remove('active'))
    $('view-' + view).classList.add('active')
    $('nav-title').textContent = NAV_TITLE[view] || '深技大图书馆'
    $('tabbar').classList.toggle('hidden', TAB_VIEWS.indexOf(view) < 0)
    document.querySelectorAll('.tabbar-item').forEach(b => b.classList.toggle('active', b.dataset.view === view))
    window.scrollTo(0, 0)
    if (view === 'login') renderLogin()
    if (view === 'home') renderHome()
    if (view === 'search') renderSearch()
    if (view === 'mine') renderMine()
    if (view === 'detail') renderDetail(opt.id)
    if (view === 'dashboard') renderDashboard()
  }

  // ---------- 书籍卡片 ----------
  function bookCard(b, opt) {
    opt = opt || {}
    const favOn = state.data && (state.data.favorites || []).indexOf(b.id) >= 0
    const reasonRow = opt.showReason
      ? '<div class="reason-row"><span class="tag tag-green">' + esc(b.reasonTag || '热门') + '</span><span class="reason-text">' + esc(b.reason || '大家都在看 · 热门图书') + '</span></div>'
      : ''
    const desc = opt.showDesc ? '<div class="book-desc ellipsis">' + esc(b.desc) + '</div>' : ''
    const fav = opt.showFav ? '<span class="fav ' + (favOn ? 'fav-on' : '') + '" data-act="fav" data-id="' + esc(b.id) + '">♥</span>' : ''
    const dis = opt.showDislike ? '<span class="tag tag-gray" data-act="dislike" data-id="' + esc(b.id) + '">不感兴趣 ×</span>' : ''
    const stock = opt.showStock
      ? '<div class="row-between"><span class="tag ' + (b.available > 0 ? 'tag-green' : 'tag-red') + '">' + esc(b.status) + '</span><span class="muted">馆藏 ' + b.total + ' 册 · 可借 ' + b.available + ' 册</span></div>' + dis
      : ''
    return '<div class="book-item" data-act="detail" data-id="' + esc(b.id) + '">' +
      '<div class="cover" style="background:' + esc(b.color) + '">' + esc(b.coverText) + '</div>' +
      '<div class="book-main"><div class="book-title"><span class="ellipsis">' + esc(b.title) + '</span>' + fav + '</div>' +
      '<div class="book-meta">' + esc(b.author) + ' · ' + esc(b.category) + ' · ' + esc(b.type) + '</div>' + desc + reasonRow + stock + '</div></div>'
  }

  // ---------- 登录 ----------
  function renderLogin() {
    if (LIB_APP.globalData.user) { jumpByRole(LIB_APP.globalData.user.role); return }
    $('login-id').value = ''; $('login-pwd').value = ''
    $('login-agree').checked = true
    $('login-submit').classList.remove('btn-disabled')
  }
  function jumpByRole(role) {
    if (role === 'admin') { state.prefChecked = true; go('dashboard') } else { state.prefChecked = false; go('home') }
  }
  function bindLogin() {
    $('toggle-pwd').onclick = () => {
      const p = $('login-pwd'); p.type = p.type === 'password' ? 'text' : 'password'
      $('toggle-pwd').textContent = p.type === 'password' ? '👁' : '🙈'
    }
    document.querySelectorAll('[data-fill]').forEach(btn => btn.onclick = () => {
      const acc = DATA.ACCOUNTS[btn.dataset.fill === 'student' ? '2025001' : 'admin01']
      $('login-id').value = acc.id; $('login-pwd').value = acc.password
      $('login-agree').checked = true; $('login-submit').classList.remove('btn-disabled')
      toast(btn.dataset.fill === 'student' ? '已填入学生账号' : '已填入管理员账号')
    })
    $('login-submit').onclick = () => {
      const id = $('login-id').value.trim(), pwd = $('login-pwd').value
      if (!id || !pwd || !$('login-agree').checked) { toast('请输入学号和密码'); return }
      loading('登录中...')
      API.login(id, pwd).then(res => {
        loading('', true)
        if (!res.ok) {
          modal('登录失败', res.msg + '（如忘记账号，可点击下方体验账号一键填充）', null, { showCancel: false, confirmColor: '#0B4DA2' })
          return
        }
        toast(res.role === 'admin' ? '管理员登录成功' : '登录成功')
        state.offset = 0; state.prefChecked = false
        setTimeout(() => jumpByRole(res.role), 300)
      })
    }
  }

  // ---------- 首页 ----------
  function renderHome() {
    if (!state.user) { go('login'); return }
    $('home-username').textContent = state.user.name
    $('home-usermeta').textContent = state.user.college + ' · ' + state.user.grade + ' · ' + state.user.major
    $('home-hint').textContent = LIB_APP.hasPreference()
      ? '已结合你的偏好、专业、借阅与搜索记录生成'
      : '你还未设置阅读偏好，当前以热门与专业相关度推荐'
    loadHot(); loadRecommend()
    if (!state.prefChecked && !LIB_APP.hasPreference()) { state.prefChecked = true; openPref('home') }
  }
  function loadRecommend() {
    API.getRecommendations(state.user, state.data, { limit: 6, offset: state.offset }).then(list => {
      $('home-recs').innerHTML = list.length
        ? list.map(b => bookCard(b, { showReason: true, showFav: true, showDislike: true })).join('')
        : '<div class="empty">已经看完啦，点「换一批」回到开头</div>'
    })
  }
  function loadHot() {
    API.getHotBooks(5).then(list => {
      $('hot-count').textContent = '共 ' + list.length + ' 本'
      $('home-hot').innerHTML = list.map((b, i) =>
        '<div class="book-item" data-act="detail" data-id="' + esc(b.id) + '">' +
        '<div class="cover" style="background:' + esc(b.color) + '">' + (i + 1) + '</div>' +
        '<div class="book-main"><div class="book-title">' + esc(b.title) + '</div>' +
        '<div class="book-meta">' + esc(b.author) + ' · ' + esc(b.category) + '</div>' +
        '<div class="row-between"><span class="muted">热度 ' + b.hot + '</span><span class="tag tag-orange">热门</span></div></div></div>').join('')
    })
  }

  // ---------- 偏好弹窗（home 有校验+跳过；mine 无校验+取消） ----------
  let chipState = {}
  function initChips() {
    const p = state.data.preferences || {}
    chipState = {
      types: DATA.PREF_OPTIONS.types.map(n => ({ name: n, selected: (p.types || []).indexOf(n) >= 0 })),
      styles: DATA.PREF_OPTIONS.styles.map(n => ({ name: n, selected: (p.styles || []).indexOf(n) >= 0 })),
      authors: DATA.PREF_OPTIONS.authors.map(n => ({ name: n, selected: (p.authors || []).indexOf(n) >= 0 })),
      purposes: DATA.PREF_OPTIONS.purposes.map(n => ({ name: n, selected: p.purpose === n })),
      favoriteBooks: (p.favoriteBooks || []).slice()
    }
  }
  function openPref(from) {
    state.prefFrom = from; initChips()
    $('pref-title').textContent = from === 'home' ? '完善阅读偏好' : '修改阅读偏好'
    $('pref-subtitle').textContent = from === 'home'
      ? '帮助我们更懂你的阅读口味（可跳过，之后在"我的"里修改）'
      : '修改后将立即影响首页推荐结果'
    $('pref-cancel').textContent = from === 'home' ? '跳过' : '取消'
    $('pref-save').textContent = from === 'home' ? '保存偏好' : '保存'
    drawPrefChips(); $('pref-mask').classList.remove('hidden')
  }
  function drawPrefChips() {
    const blocks = [
      ['types', '喜欢的书籍类型'], ['styles', '喜欢的风格'], ['authors', '喜爱的作家'], ['purposes', '阅读用途']
    ]
    let html = blocks.map(([key, label]) =>
      '<div class="form-block"><h4>' + label + '</h4><div class="chips">' +
      chipState[key].map((c, i) => '<button class="chip ' + (c.selected ? 'selected' : '') + '" data-chip="' + key + '" data-i="' + i + '">' + esc(c.name) + '</button>').join('') +
      '</div></div>').join('')
    html += '<div class="form-block"><h4>喜欢的书籍（输入书名后回车添加，点击标签删除）</h4>' +
      '<input id="favbook-input" class="favbook-input" placeholder="例如：三体（全集）">' +
      '<div class="favbook-tags">' + chipState.favoriteBooks.map((n, i) =>
        '<span class="chip selected" data-rmbook="' + i + '">' + esc(n) + ' ×</span>').join('') + '</div></div>'
    $('pref-chips').innerHTML = html
    $('pref-chips').querySelectorAll('[data-chip]').forEach(btn => btn.onclick = () => {
      const key = btn.dataset.chip, i = Number(btn.dataset.i)
      if (key === 'purposes') chipState.purposes.forEach((c, j) => { c.selected = j === i })
      else chipState[key][i].selected = !chipState[key][i].selected
      drawPrefChips()
    })
    $('pref-chips').querySelectorAll('[data-rmbook]').forEach(el => el.onclick = () => {
      chipState.favoriteBooks.splice(Number(el.dataset.rmbook), 1); drawPrefChips()
    })
    $('favbook-input').onkeydown = e => {
      if (e.key !== 'Enter') return
      const v = e.target.value.trim()
      if (!v) return
      if (chipState.favoriteBooks.indexOf(v) < 0) chipState.favoriteBooks.push(v)
      e.target.value = ''; drawPrefChips()
      $('favbook-input').focus()
    }
  }
  function collectPref() {
    const sel = k => chipState[k].filter(c => c.selected).map(c => c.name)
    return { types: sel('types'), styles: sel('styles'), authors: sel('authors'),
      purpose: sel('purposes')[0] || '', favoriteBooks: chipState.favoriteBooks.slice() }
  }
  function savePref() {
    const form = collectPref()
    const empty = !form.types.length && !form.styles.length && !form.authors.length && !form.purpose && !form.favoriteBooks.length
    if (state.prefFrom === 'home' && empty) { toast('请至少选择一项偏好'); return }
    state.data.preferences = form; LIB_APP.saveData(); $('pref-mask').classList.add('hidden')
    toast(state.prefFrom === 'home' ? '偏好已保存' : '偏好已更新')
    if (state.prefFrom === 'home') { state.offset = 0; loadRecommend(); renderHomeHeader() } else renderMine()
  }
  function renderHomeHeader() {
    $('home-hint').textContent = LIB_APP.hasPreference()
      ? '已结合你的偏好、专业、借阅与搜索记录生成' : '你还未设置阅读偏好，当前以热门与专业相关度推荐'
  }

  // ---------- 搜索 ----------
  function renderSearch() {
    $('search-history').innerHTML = (state.data.searchHistory || []).length
      ? state.data.searchHistory.map(w => '<span class="chip-static" data-word="' + esc(w) + '">' + esc(w) + '</span>').join('')
      : '<span class="muted">暂无搜索记录</span>'
    $('search-hotwords').innerHTML = DATA.HOT_SEARCH.map(w => '<span class="chip-static" data-word="' + esc(w) + '">' + esc(w) + '</span>').join('')
    if (state.searched) drawSearchResults()
  }
  function saveHistory(kw) {
    const h = (state.data.searchHistory || []).filter(w => w !== kw)
    h.unshift(kw); state.data.searchHistory = h.slice(0, 10); LIB_APP.saveData()
  }
  function doSearch(kw) {
    kw = (kw || '').trim()
    if (!kw) { toast('请输入搜索关键词'); return }
    $('search-input').value = kw; saveHistory(kw)
    loading('搜索中...')
    API.searchBooks(kw).then(list => {
      loading('', true); state.results = list; state.searched = true
      renderSearch(); drawSearchResults()
    })
  }
  function drawSearchResults() {
    $('search-result-head').classList.remove('hidden')
    $('search-count').textContent = '共 ' + state.results.length + ' 本'
    $('search-results').innerHTML = state.results.map(b => bookCard(b, { showDesc: true, showStock: true })).join('')
    $('search-empty').classList.toggle('hidden', state.results.length > 0)
  }

  // ---------- 详情 ----------
  function renderDetail(id) {
    if (id) state.detailId = id
    if (!state.detailId) { toast('缺少书籍 id'); return }
    API.getBookDetail(state.detailId).then(b => {
      if (!b) { toast('未找到该书籍'); return }
      $('nav-title').textContent = b.title
      const fav = (state.data.favorites || []).indexOf(b.id) >= 0
      const related = DATA.BOOKS.filter(x => x.id !== b.id && (x.category === b.category || x.type === b.type)).slice(0, 3)
      $('detail-body').innerHTML = '<div class="detail-card"><div class="detail-head">' +
        '<div class="cover" style="background:' + esc(b.color) + '">' + esc(b.coverText) + '</div>' +
        '<div><div class="detail-title">' + esc(b.title) + '</div><div class="detail-meta">' +
        esc(b.author) + '<br>' + esc(b.category) + ' · ' + esc(b.type) + ' · ' + esc(b.style) +
        '<br>' + esc(b.status) + ' · 热度 ' + b.hot + '</div></div></div>' +
        '<div class="divider"></div><h4>书籍简介</h4><div class="book-desc">' + esc(b.desc) + '</div>' +
        '<div class="detail-meta">标签：' + esc(b.tags.join(' / ')) + '<br>适用学院：' + esc(b.colleges.join('、')) + '</div>' +
        '<div class="divider"></div><h4>馆藏信息</h4><div class="detail-meta">馆藏地点：' + esc(b.location) +
        '<br>馆藏总量：' + b.total + ' 册　可借数量：' + b.available + ' 册<br>借阅状态：' +
        (b.available > 0 ? '可借（模拟数据）' : '已借完（模拟数据）') + '</div>' +
        '<p class="muted">提示：馆藏与借阅状态均为模拟数据，原型不实现真实借阅流程。</p></div>' +
        '<div class="related"><div class="section-header"><div class="section-title">同类书籍推荐</div></div>' +
        '<div class="book-list">' + related.map(x => '<div class="book-item" data-related="' + esc(x.id) + '">' +
          '<div class="cover" style="background:' + esc(x.color) + '">' + esc(x.coverText) + '</div>' +
          '<div class="book-main"><div class="book-title">' + esc(x.title) + '</div>' +
          '<div class="book-meta">' + esc(x.author) + ' · ' + esc(x.category) + '</div></div></div>').join('') + '</div></div>'
      $('detail-fav').textContent = fav ? '已收藏' : '收藏'
      $('detail-fav').classList.toggle('bar-fav-on', fav)
      $('detail-fav').onclick = () => toggleFav(b.id, () => renderDetail(b.id))
      $('detail-body').querySelectorAll('[data-related]').forEach(el => el.onclick = () => {
        state.detailId = el.dataset.related; renderDetail() // 同类书用 redirectTo 语义：替换当前详情
      })
    })
  }

  // ---------- 我的 ----------
  function renderMine() {
    if (!state.user) { go('login'); return }
    $('mine-avatar').textContent = (state.user.name || '学').charAt(0)
    $('mine-name').textContent = state.user.name + '（' + (state.user.role === 'admin' ? '管理员' : '学生') + '）'
    $('mine-meta').textContent = state.user.id + ' · ' + state.user.college + ' · ' + state.user.grade + ' · ' + state.user.major
    const favs = (state.data.favorites || []).map(id => DATA.BOOKS.filter(b => b.id === id)[0]).filter(Boolean)
    const borrows = (state.data.borrowHistory || []).map(r => {
      const b = DATA.BOOKS.filter(x => x.id === r.bookId)[0] || {}
      return { bookId: r.bookId, title: b.title || '未知书籍', author: b.author || '', category: b.category || '', date: r.date, status: r.status }
    })
    $('fav-count').textContent = favs.length; $('borrow-count').textContent = borrows.length
    $('mine-fav').innerHTML = favs.length ? favs.map(b => bookCard(b, { showFav: false })).join('')
      : '<div class="empty">还没有收藏书籍，去首页看看推荐吧～</div>'
    $('mine-borrow').innerHTML = borrows.length ? borrows.map(r =>
      '<div class="borrow-item"><div class="book-title">' + esc(r.title) + '</div>' +
      '<div class="book-meta">' + esc(r.author) + ' · ' + esc(r.category) + ' · ' + esc(r.date) + '</div>' +
      '<span class="tag ' + (r.status === '借阅中' ? 'tag-orange' : 'tag-gray') + '">' + esc(r.status) + '</span></div>').join('')
      : '<div class="empty">暂无借阅记录（模拟数据）</div>'
    $('mine-fav').classList.toggle('hidden', state.mineTab !== 'fav')
    $('mine-borrow').classList.toggle('hidden', state.mineTab !== 'borrow')
    document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab === state.mineTab))
    const p = state.data.preferences
    $('mine-pref').innerHTML = p
      ? ['书籍类型：' + (p.types || []).join('、'), '风格：' + (p.styles || []).join('、'),
         '作家：' + (p.authors || []).join('、'), '阅读用途：' + (p.purpose || '—'),
         '喜欢的书：' + (p.favoriteBooks || []).join('、')].join('<br>')
      : '尚未设置阅读偏好，点击"修改"完善推荐画像'
    $('mine-history').innerHTML = (state.data.searchHistory || []).length
      ? state.data.searchHistory.map(w => '<span class="chip-static">' + esc(w) + '</span>').join('')
      : '<span class="muted">暂无搜索记录</span>'
    $('mine-fav').querySelectorAll('[data-act="detail"]').forEach(el => el.onclick = () => go('detail', { id: el.dataset.id }))
  }

  // ---------- 管理端 ----------
  function renderDashboard() {
    if (!state.user || state.user.role !== 'admin') {
      toast('仅管理员可访问'); setTimeout(() => go('login'), 600); return
    }
    $('dash-user').textContent = state.user.name
    if (!$('dash-college').options.length) {
      $('dash-college').innerHTML = ['全部学院'].concat(DATA.COLLEGES).map(x => '<option>' + esc(x) + '</option>').join('')
      $('dash-grade').innerHTML = ['全部年级'].concat(DATA.GRADES).map(x => '<option>' + esc(x) + '</option>').join('')
    }
    loadStats()
  }
  function loadStats() {
    const college = $('dash-college').value, grade = $('dash-grade').value
    $('dash-current').textContent = '当前筛选：' + college + ' · ' + grade
    loading('加载中...')
    API.getAdminStats(college, grade).then(s => {
      loading('', true)
      const maxCollege = Math.max.apply(null, s.collegeBorrow.map(c => c.value)) || 1
      const barSection = (title, rows) => '<div class="card"><div class="section-title">' + title + '</div>' +
        rows.map(r => '<div class="bar-row"><div>' + esc(r.name) + ' <span class="muted">' + r.value + '</span></div>' +
          '<div class="bar-track"><div class="bar-fill" style="width:' + r.width + '%"></div></div></div>').join('') + '</div>'
      $('dash-body').innerHTML =
        '<div class="stat-grid">' +
        [['总借阅量', s.overview.totalBorrow], ['活跃读者', s.overview.activeReaders],
         ['馆藏总量', s.overview.totalBooks], ['可借率', s.overview.availableRate + '%']]
          .map(([l, v]) => '<div class="stat-box"><div class="stat-num">' + v + '</div><div class="stat-label">' + l + '</div></div>').join('') + '</div>' +
        barSection('各学院借阅量', s.collegeBorrow.map(c => ({ name: c.name, value: c.value,
          width: Math.round(c.value / maxCollege * 100) }))) +
        barSection('分类借阅占比', s.categoryRatio.map(c => ({ name: c.name + '（' + c.percent + '%）', value: c.value, width: c.width }))) +
        '<div class="card"><div class="section-title">借阅趋势（近 8 个月）</div><div class="trend">' +
        s.trend.map(t => '<div class="trend-col"><span class="muted">' + t.value + '</span>' +
          '<div class="trend-bar" style="height:' + t.height + '%"></div><span class="trend-label">' + esc(t.month) + '</span></div>').join('') + '</div></div>' +
        '<div class="card"><div class="section-title">搜索热词 Top6</div>' +
        s.hotSearchWords.map((w, i) => '<div class="bar-row">' + (i + 1) + '. ' + esc(w.word) + ' <span class="muted">' + w.count + ' 次</span></div>').join('') + '</div>' +
        '<div class="card"><div class="section-title">📌 采购建议</div>' +
        s.purchaseAdvice.map(a => '<div class="bar-row"><span class="tag ' + (a.level === '高' ? 'tag-red' : 'tag-orange') + '">优先级' + esc(a.level) + '</span> ' +
          esc(a.title) + ' / ' + esc(a.author) + '<div class="muted">' + esc(a.reason) + '</div></div>').join('') + '</div>'
    })
  }

  // ---------- 收藏 / 不感兴趣 ----------
  function toggleFav(id, cb) {
    const favs = state.data.favorites || []
    const i = favs.indexOf(id)
    if (i >= 0) { favs.splice(i, 1); toast('已取消收藏') } else { favs.push(id); toast('已收藏') }
    state.data.favorites = favs; LIB_APP.saveData(); if (cb) cb()
  }
  function dislike(id) {
    const b = DATA.BOOKS.filter(x => x.id === id)[0]
    if (!b) return
    const tags = [b.type, b.category, b.author].concat(b.tags)
    tags.forEach(t => { if (t && state.data.dislikedTags.indexOf(t) < 0) state.data.dislikedTags.push(t) })
    LIB_APP.saveData(); toast('已减少同类推荐'); state.offset = 0; loadRecommend()
  }

  // ---------- 事件绑定 ----------
  function bindGlobal() {
    document.querySelectorAll('.tabbar-item').forEach(b => b.onclick = () => go(b.dataset.view))
    $('nav-title').onclick = null

    // 首页
    $('refresh-rec').onclick = () => { state.offset += 6; loadRecommend(); toast('已换一批') }
    $('open-pref').onclick = () => { state.prefChecked = true; openPref('home') }
    $('home-recs').addEventListener('click', e => {
      const fav = e.target.closest('[data-act="fav"]'), dis = e.target.closest('[data-act="dislike"]'), card = e.target.closest('[data-act="detail"]')
      if (fav) { e.stopPropagation(); toggleFav(fav.dataset.id, loadRecommend); return }
      if (dis) { e.stopPropagation(); dislike(dis.dataset.id); return }
      if (card) go('detail', { id: card.dataset.id })
    })
    $('home-hot').addEventListener('click', e => {
      const card = e.target.closest('[data-act="detail"]'); if (card) go('detail', { id: card.dataset.id })
    })

    // 偏好弹窗
    $('pref-mask').addEventListener('click', e => { if (e.target.id === 'pref-mask') { /* 与小程序一致：点遮罩不关闭 */ } })
    $('pref-cancel').onclick = () => {
      $('pref-mask').classList.add('hidden')
      if (state.prefFrom === 'home') toast('已跳过，可在"我的"中补充')
    }
    $('pref-save').onclick = savePref

    // 搜索
    $('search-submit').onclick = () => doSearch($('search-input').value)
    $('search-input').onkeydown = e => { if (e.key === 'Enter') doSearch(e.target.value) }
    $('search-history').addEventListener('click', e => { if (e.target.dataset.word) doSearch(e.target.dataset.word) })
    $('search-hotwords').addEventListener('click', e => { if (e.target.dataset.word) doSearch(e.target.dataset.word) })
    $('search-results').addEventListener('click', e => {
      const card = e.target.closest('[data-act="detail"]'); if (card) go('detail', { id: card.dataset.id })
    })
    $('clear-history').onclick = () => modal('清空搜索记录', '确定要清空全部历史搜索记录吗？', ok => {
      if (!ok) return
      state.data.searchHistory = []; LIB_APP.saveData(); state.searched = false; state.results = []
      $('search-results').innerHTML = ''; $('search-result-head').classList.add('hidden'); $('search-empty').classList.add('hidden')
      renderSearch(); toast('已清空')
    })

    // 详情
    $('detail-back').onclick = () => go(state.prevView === 'detail' ? 'home' : state.prevView)

    // 我的
    document.querySelectorAll('.tab').forEach(t => t.onclick = () => { state.mineTab = t.dataset.tab; renderMine() })
    $('mine-edit-pref').onclick = () => openPref('mine')
    $('mine-reset-pref').onclick = () => modal('重置阅读偏好', '将清空你的偏好标签与"不感兴趣"记录，推荐结果回到默认热门。', ok => {
      if (!ok) return
      state.data.preferences = null; state.data.dislikedTags = []; LIB_APP.saveData(); renderMine(); toast('已重置')
    }, { confirmColor: '#D93636' })
    $('mine-clear-history').onclick = () => modal('清空搜索记录', '确定清空全部历史搜索记录吗？', ok => {
      if (!ok) return
      state.data.searchHistory = []; LIB_APP.saveData(); renderMine(); toast('已清空')
    })
    $('mine-logout').onclick = () => modal('退出登录', '确定要退出当前账号吗？', ok => {
      if (!ok) return
      LIB_APP.logout(); go('login')
    })

    // 管理端
    $('dash-college').onchange = loadStats
    $('dash-grade').onchange = loadStats
    $('dash-reset').onclick = () => { $('dash-college').selectedIndex = 0; $('dash-grade').selectedIndex = 0; loadStats(); toast('已重置筛选') }
    $('dash-logout').onclick = () => modal('退出登录', '确定退出管理员账号吗？', ok => {
      if (!ok) return
      LIB_APP.logout(); go('login')
    })
  }

  // ---------- 启动 ----------
  function boot() {
    bindLogin(); bindGlobal()
    const session = STORE.getSession()
    if (session) {
      state.user = session
      state.data = STORE.getData(session.id) || STORE.defaultData(session)
      state.isNewUser = !state.data.preferences
      state.prefChecked = false
      jumpByRole(session.role)
    } else {
      go('login')
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot)
  else boot()
})();
