# 接口约定（docs/api.md）

> 本小程序为课程原型，全部本地 mock 数据，无真实网络请求（PROJECT_RULES.md 第 15 条：禁止真实网络请求、真实学号密码、公网后端）。
> `utils/api.js` 为**接口占位层**：当前每个方法内部 `delay` 后调用本地 `recommend.js` / `mock.js`；后续阶段接真实后端时，**仅替换方法内部为 `wx.request`**，页面调用方（`pages/*`）一行不动（PROJECT_RULES.md §3 改动边界）。

---

## 字段契约（AI 绝不可改）
书籍 / 推荐对象固定字段：`{id, title, author, type, style, tags, hot, score, reason}`

- `score`：推荐算法计算（recommend.js）
- `reason`：推荐理由展示
- 新增字段须同时改 `utils/api.js` 返回构造与对应 `.wxml` 绑定

---

## 接口一：登录（主路径最关键一步，含真实失败）

**当前调用**：`app.login(id, pwd)`

- 参数：
  - `id`：学号 / 工号，字符串，必填
  - `pwd`：口令，字符串，必填（口令：见本地配置，不写真实 / 测试密码）
- **未来对应**：`POST /api/auth/login`，请求体 `{id, password}`

**成功（约定 HTTP 200）**：

- 返回 `{ok:true, role:"student"|"admin"}`
- 示例：
  ```json
  { "ok": true, "role": "student" }
  ```

**失败（约定 HTTP 401，当前本地用 `ok:false` 表达）**：

- 触发条件：`id` 不在账号表，或 `pwd` 与账号不符
- 返回：
  ```json
  { "ok": false, "msg": "学号或密码错误，请重试（模拟校验）" }
  ```
- 给使用者的提示：登录页弹窗直接显示该 `msg`
- 说明：失败为本课题真实会发生的情况（“找不到账号 / 无权限”），即报告 03 要求的“失败须符合本组课题”

---

## 接口二：个性化推荐（价值步骤，记成功契约）

**当前调用**：`api.getRecommendations(user, data, {limit:6, offset})`

- 参数：
  - `user`：当前用户对象（含 `college` / `major`，用于专业匹配）
  - `data`：用户业务数据（`preferences` / `favorites` / `searchHistory` / `borrowHistory` / `dislikedTags`）
  - `opts`：`{limit, offset}`，支持“换一批”
- **未来对应**：`GET /api/recommend`

**成功（约定 HTTP 200）**：

- 返回 ≤ 6 本带打分与理由的书，每本含字段 `{id, title, author, type, style, tags, hot, score, reason, reasonTag}`
- 示例（摘一本）：
  ```json
  {
    "id": "B001",
    "title": "三体（全集）",
    "author": "刘慈欣",
    "type": "科幻小说",
    "style": "硬核深度",
    "tags": ["科幻", "硬核", "中国科幻"],
    "hot": 98,
    "score": 68.8,
    "reason": "与你的专业（计算机科学与技术）相关",
    "reasonTag": "专业匹配"
  }
  ```
  > 注：`score` 为 recommend.js 按权重实时计算，示例数值随权重而定，非写死。

- 说明：推荐由 `recommend.js` 真实打分产生（偏好匹配 / 用户画像 / 行为数据 / 负反馈降权 / 热门兜底等多维），**非固定列表**。

**兜底（非失败，不抛硬错）**：

- 无匹配 / 无偏好时回退热门书单（`hotBooks`），仍返回 200。
- 本接口不报“找不到”类硬错；真实的硬错误以**登录接口**为准。

---

## 假实现标注 ⚠️

- `api.js` 六个方法均为 ⚠️ **占位**：内部 `delay` 后读本地 mock / recommend，未发真实网络请求。课程规则允许；后续阶段接真实后端时仅替换方法内部为 `wx.request`。
- 管理端 `ADMIN_STATS`（总借阅量 / 各学院占比 / 借阅趋势等）为 ⚠️ **静态假数据**，无真实统计逻辑；后续阶段接真实统计接口替换。
- 登录校验为硬编码演示账号表（无真实鉴权），属课程允许的 mock 校验（课程禁止对接学校统一认证）。

---

## 约定变更记录

- 本报告期（后续阶段）：补建本 `docs/api.md`，将散落在 `api.js` 注释与 `app.js` 的接口约定集中归档；闭合报告 02 第七节标 ⚠️ 的“必做 7 前端与推荐算法真实接口联调”（代码侧 `api.js` 已调用 `recommend.js`）。
- 字段契约由 PROJECT_RULES.md §2 统一定义，本文件不新增字段。
