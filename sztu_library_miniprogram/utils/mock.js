// utils/mock.js —— 全量模拟静态数据（接口占位，前端本地使用，不调用任何外部 API）

// ---------------- 学院 / 年级 ----------------
const COLLEGES = [
  '计算机科学与技术学院',
  '机械与能源工程学院',
  '新材料与新能源学院',
  '商学院',
  '人文学院',
  '国际学院'
]

const GRADES = ['2022级', '2023级', '2024级', '2025级']

// ---------------- 阅读偏好可选项 ----------------
const PREF_OPTIONS = {
  types: ['科幻小说', '文学经典', '专业教材', '前沿技术', '人物传记', '艺术设计', '历史人文', '经济管理'],
  styles: ['轻松易读', '硬核深度', '图文并茂', '案例丰富', '短篇速读'],
  authors: ['刘慈欣', '余华', '周志华', '马尔克斯', '尤瓦尔·赫拉利', '唐纳德·诺曼', '曼昆', '黄仁宇'],
  purposes: ['休闲阅读', '专业课学习']
}

// ---------------- 模拟账号（仅本地校验，不对接学校统一认证） ----------------
const ACCOUNTS = {
  '2025001': {
    id: '2025001',
    password: '123456',
    name: '张同学',
    role: 'student',
    college: '计算机科学与技术学院',
    grade: '2025级',
    major: '计算机科学与技术'
  },
  'admin01': {
    id: 'admin01',
    password: 'admin123',
    name: '图书馆管理员',
    role: 'admin',
    college: '图书馆',
    grade: '—',
    major: '图书情报与数据运营'
  }
}

// ---------------- 分类 -> 封面色 ----------------
const CATEGORY_COLOR = {
  '计算机': '#2E7BF6',
  '工程制造': '#0B4DA2',
  '材料科学': '#1A9C58',
  '经济管理': '#D97008',
  '文学': '#7B5CD6',
  '艺术设计': '#D9367B',
  '外语': '#0E9AA7',
  '通识': '#6B7280'
}

// ---------------- 书库（24 本） ----------------
const BOOKS = [
  {
    id: 'B001', title: '三体（全集）', author: '刘慈欣', category: '文学',
    type: '科幻小说', style: '硬核深度', tags: ['科幻', '硬核', '中国科幻'],
    desc: '中国科幻里程碑之作，以宏大的宇宙尺度讨论文明、伦理与生存。',
    total: 12, available: 5, location: 'A区三层 · 文学书库',
    hot: 98, colleges: ['计算机科学与技术学院', '机械与能源工程学院']
  },
  {
    id: 'B002', title: '活着', author: '余华', category: '文学',
    type: '文学经典', style: '轻松易读', tags: ['小说', '当代文学'],
    desc: '以平实克制的笔触讲述普通人在时代洪流中的命运沉浮。',
    total: 10, available: 0, location: 'A区三层 · 文学书库',
    hot: 95, colleges: ['人文学院']
  },
  {
    id: 'B003', title: 'Python编程：从入门到实践', author: 'Eric Matthes', category: '计算机',
    type: '专业教材', style: '案例丰富', tags: ['Python', '编程入门', '实践'],
    desc: '面向零基础读者的 Python 入门书，配套三个完整项目实战。',
    total: 20, available: 8, location: 'C区二层 · 计算机书库',
    hot: 90, colleges: ['计算机科学与技术学院']
  },
  {
    id: 'B004', title: '算法导论', author: 'Cormen', category: '计算机',
    type: '专业教材', style: '硬核深度', tags: ['算法', '数据结构'],
    desc: '算法领域经典教材，系统讲解算法设计与复杂度分析。',
    total: 15, available: 2, location: 'C区二层 · 计算机书库',
    hot: 80, colleges: ['计算机科学与技术学院']
  },
  {
    id: 'B005', title: '深入理解计算机系统', author: 'Bryant', category: '计算机',
    type: '专业教材', style: '硬核深度', tags: ['计算机体系', '底层原理'],
    desc: '从程序员视角理解计算机系统的经典教材（CSAPP）。',
    total: 12, available: 4, location: 'C区二层 · 计算机书库',
    hot: 78, colleges: ['计算机科学与技术学院', '机械与能源工程学院']
  },
  {
    id: 'B006', title: '智能制造技术导论', author: '王田苗', category: '工程制造',
    type: '专业教材', style: '案例丰富', tags: ['智能制造', '工业机器人'],
    desc: '介绍智能制造体系架构、关键技术与典型应用场景。',
    total: 10, available: 3, location: 'B区四层 · 工程书库',
    hot: 70, colleges: ['机械与能源工程学院']
  },
  {
    id: 'B007', title: '材料科学基础', author: '潘金生', category: '材料科学',
    type: '专业教材', style: '硬核深度', tags: ['材料', '基础理论'],
    desc: '材料类专业的核心基础课教材，涵盖结构与性能关系。',
    total: 14, available: 6, location: 'B区三层 · 材料书库',
    hot: 66, colleges: ['新材料与新能源学院']
  },
  {
    id: 'B008', title: '经济学原理', author: '曼昆', category: '经济管理',
    type: '专业教材', style: '图文并茂', tags: ['经济学', '入门'],
    desc: '全球广泛使用的经济学入门教材，案例贴近现实生活。',
    total: 18, available: 9, location: 'D区二层 · 经管书库',
    hot: 88, colleges: ['商学院']
  },
  {
    id: 'B009', title: '人类简史', author: '尤瓦尔·赫拉利', category: '通识',
    type: '历史人文', style: '轻松易读', tags: ['历史', '人类学', '通识'],
    desc: '从认知革命到现代社会，重新讲述人类文明的演化历程。',
    total: 10, available: 0, location: 'A区四层 · 通识书库',
    hot: 92, colleges: ['人文学院', '国际学院']
  },
  {
    id: 'B010', title: '万历十五年', author: '黄仁宇', category: '通识',
    type: '历史人文', style: '轻松易读', tags: ['明史', '大历史观'],
    desc: '以一年为切面剖析明代制度困境，史学写作典范之作。',
    total: 8, available: 3, location: 'A区四层 · 通识书库',
    hot: 60, colleges: ['人文学院']
  },
  {
    id: 'B011', title: '百年孤独', author: '马尔克斯', category: '文学',
    type: '文学经典', style: '硬核深度', tags: ['魔幻现实主义', '拉美文学'],
    desc: '布恩迪亚家族七代人的兴衰，魔幻现实主义的巅峰之作。',
    total: 9, available: 2, location: 'A区三层 · 文学书库',
    hot: 85, colleges: ['人文学院']
  },
  {
    id: 'B012', title: '小王子', author: '圣埃克苏佩里', category: '文学',
    type: '文学经典', style: '短篇速读', tags: ['童话', '哲理'],
    desc: '写给大人的童话，用纯净语言讨论爱与责任。',
    total: 12, available: 7, location: 'A区三层 · 文学书库',
    hot: 89, colleges: ['人文学院', '国际学院']
  },
  {
    id: 'B013', title: '设计心理学', author: '唐纳德·诺曼', category: '艺术设计',
    type: '艺术设计', style: '图文并茂', tags: ['交互设计', '用户体验'],
    desc: '从认知心理出发解释好设计为何好用，设计入门必读。',
    total: 11, available: 4, location: 'E区二层 · 艺术设计书库',
    hot: 72, colleges: ['人文学院', '计算机科学与技术学院']
  },
  {
    id: 'B014', title: '机器学习', author: '周志华', category: '计算机',
    type: '前沿技术', style: '硬核深度', tags: ['机器学习', '人工智能', '西瓜书'],
    desc: '国内经典的机器学习教材，体系完整、推导清晰。',
    total: 16, available: 5, location: 'C区二层 · 计算机书库',
    hot: 86, colleges: ['计算机科学与技术学院']
  },
  {
    id: 'B015', title: '清洁能源材料导论', author: '李泓', category: '材料科学',
    type: '前沿技术', style: '案例丰富', tags: ['新能源', '储能材料'],
    desc: '介绍锂电池、氢能等清洁能源方向的材料研究进展。',
    total: 8, available: 2, location: 'B区三层 · 材料书库',
    hot: 58, colleges: ['新材料与新能源学院']
  },
  {
    id: 'B016', title: '管理学原理', author: '罗宾斯', category: '经济管理',
    type: '专业教材', style: '案例丰富', tags: ['管理学', '组织行为'],
    desc: '系统讲解计划、组织、领导与控制四大管理职能。',
    total: 14, available: 6, location: 'D区二层 · 经管书库',
    hot: 64, colleges: ['商学院']
  },
  {
    id: 'B017', title: '追风筝的人', author: '胡赛尼', category: '文学',
    type: '文学经典', style: '轻松易读', tags: ['小说', '成长'],
    desc: '关于友谊、背叛与救赎的动人故事。',
    total: 10, available: 4, location: 'A区三层 · 文学书库',
    hot: 83, colleges: ['人文学院', '国际学院']
  },
  {
    id: 'B018', title: '硅谷之火', author: '迈克尔·斯韦因', category: '通识',
    type: '人物传记', style: '轻松易读', tags: ['科技史', '创业'],
    desc: '记录个人计算机革命中一群技术理想主义者的故事。',
    total: 7, available: 3, location: 'A区四层 · 通识书库',
    hot: 55, colleges: ['计算机科学与技术学院', '商学院']
  },
  {
    id: 'B019', title: '英语学术论文写作', author: 'Anne Smith', category: '外语',
    type: '专业教材', style: '案例丰富', tags: ['学术写作', '英语'],
    desc: '面向高校学生的英文论文写作指南，含大量范文与句型。',
    total: 12, available: 5, location: 'D区四层 · 外文文献区',
    hot: 50, colleges: ['国际学院']
  },
  {
    id: 'B020', title: '电路分析基础', author: '邱关源', category: '工程制造',
    type: '专业教材', style: '硬核深度', tags: ['电路', '电子基础'],
    desc: '电子信息与电气类专业的基础课经典教材。',
    total: 16, available: 7, location: 'B区四层 · 工程书库',
    hot: 62, colleges: ['机械与能源工程学院']
  },
  {
    id: 'B021', title: '数据可视化实战', author: 'Scott Murray', category: '计算机',
    type: '前沿技术', style: '图文并茂', tags: ['可视化', '数据分析'],
    desc: '用大量实例讲解数据可视化方法与工具实践。',
    total: 9, available: 3, location: 'C区二层 · 计算机书库',
    hot: 57, colleges: ['计算机科学与技术学院', '商学院']
  },
  {
    id: 'B022', title: '周易与人生智慧', author: '张其成', category: '通识',
    type: '历史人文', style: '轻松易读', tags: ['国学', '哲学'],
    desc: '以现代视角解读《周易》中的处世智慧。',
    total: 6, available: 2, location: 'A区四层 · 通识书库',
    hot: 40, colleges: ['人文学院']
  },
  {
    id: 'B023', title: '机器人学导论', author: 'John Craig', category: '工程制造',
    type: '前沿技术', style: '硬核深度', tags: ['机器人', '运动学'],
    desc: '机器人建模与控制领域的权威入门教材。',
    total: 8, available: 1, location: 'B区四层 · 工程书库',
    hot: 53, colleges: ['机械与能源工程学院']
  },
  {
    id: 'B024', title: '用户体验设计指南', author: '李思远', category: '艺术设计',
    type: '艺术设计', style: '图文并茂', tags: ['用户体验', '产品设计'],
    desc: '覆盖用户研究、信息架构与界面设计的完整流程。',
    total: 10, available: 5, location: 'E区二层 · 艺术设计书库',
    hot: 47, colleges: ['人文学院', '计算机科学与技术学院']
  }
]

// 预处理：补充分颜色、封面首字、借阅状态
BOOKS.forEach(function (b) {
  b.color = CATEGORY_COLOR[b.category] || '#6B7280'
  b.coverText = b.title.charAt(0)
  b.status = b.available > 0 ? '可借' : '已借完'
})

// ---------------- 学生默认数据（模拟已有借阅记录） ----------------
const DEFAULT_BORROW_HISTORY = [
  { bookId: 'B003', date: '2025-09-12', status: '已归还' },
  { bookId: 'B001', date: '2025-10-03', status: '借阅中' },
  { bookId: 'B009', date: '2025-06-21', status: '已归还' },
  { bookId: 'B014', date: '2025-11-05', status: '已归还' }
]

// ---------------- 热门搜索词（学生搜索页 & 管理端热词） ----------------
const HOT_SEARCH = ['Python', '算法', '科幻', '机器学习', '经济学', '设计心理学', '人类简史']

// ---------------- 管理员看板：模拟统计数据 ----------------
const ADMIN_STATS = {
  overview: {
    totalBorrow: 12860,   // 本学期总借阅量
    activeReaders: 3268,  // 活跃读者数
    totalBooks: 48600,    // 馆藏总量
    availableRate: 63     // 可借率（%）
  },
  // 各学院借阅量（筛选前基准值）
  collegeBorrow: [
    { name: '计算机科学与技术学院', value: 3520 },
    { name: '机械与能源工程学院', value: 2410 },
    { name: '新材料与新能源学院', value: 1860 },
    { name: '商学院', value: 2180 },
    { name: '人文学院', value: 1620 },
    { name: '国际学院', value: 1270 }
  ],
  // 分类借阅占比（基准）
  categoryRatio: [
    { name: '计算机', value: 3200 },
    { name: '工程制造', value: 2150 },
    { name: '经济管理', value: 1980 },
    { name: '文学', value: 1740 },
    { name: '材料科学', value: 1420 },
    { name: '艺术设计', value: 980 },
    { name: '外语', value: 760 },
    { name: '通识', value: 630 }
  ],
  // 近 8 个月借阅趋势
  trend: [
    { month: '3月', value: 1180 },
    { month: '4月', value: 1520 },
    { month: '5月', value: 1310 },
    { month: '6月', value: 980 },
    { month: '9月', value: 1620 },
    { month: '10月', value: 1890 },
    { month: '11月', value: 1740 },
    { month: '12月', value: 2020 }
  ],
  hotSearchWords: [
    { word: 'Python', count: 428 },
    { word: '机器学习', count: 356 },
    { word: '算法导论', count: 312 },
    { word: '科幻小说', count: 287 },
    { word: '经济学原理', count: 246 },
    { word: '设计心理学', count: 203 }
  ],
  // 采购建议（模拟决策输出）
  purchaseAdvice: [
    { title: '算法导论', author: 'Cormen', reason: '计算机学院借阅量连续 3 月第一，可借余量仅 2 本', level: '高' },
    { title: '机器学习', author: '周志华', reason: '搜索量 Top2，预约排队人数较多', level: '高' },
    { title: '人类简史', author: '尤瓦尔·赫拉利', reason: '通识类长期满借，建议增购 5 册', level: '中' },
    { title: '机器人学导论', author: 'John Craig', reason: '机械学院专业课需求上升', level: '中' }
  ]
}

// 学院画像：用于按学院筛选时重算分类占比与总量系数
const COLLEGE_PROFILE = {
  '计算机科学与技术学院': { factor: 1.35, categories: { '计算机': 42, '工程制造': 12, '经济管理': 8, '文学': 12, '材料科学': 5, '艺术设计': 9, '外语': 6, '通识': 6 } },
  '机械与能源工程学院': { factor: 1.10, categories: { '计算机': 14, '工程制造': 40, '经济管理': 6, '文学': 10, '材料科学': 14, '艺术设计': 5, '外语': 4, '通识': 7 } },
  '新材料与新能源学院': { factor: 0.95, categories: { '计算机': 10, '工程制造': 18, '经济管理': 5, '文学': 11, '材料科学': 42, '艺术设计': 4, '外语': 4, '通识': 6 } },
  '商学院': { factor: 1.05, categories: { '计算机': 12, '工程制造': 6, '经济管理': 45, '文学': 15, '材料科学': 3, '艺术设计': 8, '外语': 8, '通识': 3 } },
  '人文学院': { factor: 0.90, categories: { '计算机': 6, '工程制造': 4, '经济管理': 10, '文学': 40, '材料科学': 2, '艺术设计': 20, '外语': 12, '通识': 6 } },
  '国际学院': { factor: 0.80, categories: { '计算机': 12, '工程制造': 5, '经济管理': 16, '文学': 22, '材料科学': 3, '艺术设计': 10, '外语': 28, '通识': 4 } }
}

// 年级系数：用于按年级筛选时缩放总量
const GRADE_PROFILE = {
  '2022级': 1.15,
  '2023级': 1.05,
  '2024级': 0.95,
  '2025级': 0.80
}

module.exports = {
  COLLEGES: COLLEGES,
  GRADES: GRADES,
  PREF_OPTIONS: PREF_OPTIONS,
  ACCOUNTS: ACCOUNTS,
  BOOKS: BOOKS,
  CATEGORY_COLOR: CATEGORY_COLOR,
  DEFAULT_BORROW_HISTORY: DEFAULT_BORROW_HISTORY,
  HOT_SEARCH: HOT_SEARCH,
  ADMIN_STATS: ADMIN_STATS,
  COLLEGE_PROFILE: COLLEGE_PROFILE,
  GRADE_PROFILE: GRADE_PROFILE
}
