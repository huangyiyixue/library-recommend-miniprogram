\# 项目进度存档（PROGRESS.md）



\## 项目

图书馆个性化书籍推荐微信小程序（sztu\_library\_miniprogram），对应 Python 算法 library\_recommend.py



\## 当前进度（截至 11/1）

\- \[x] GitHub 仓库已建：huangyiyixue/library-recommend-miniprogram（私有）

\- \[x] Git 已装，小程序源码已 push 上库，.gitignore 生效

\- \[x] library\_recommend.py 已找回并提交到本地（WSL 跑通 3/3 自测）

\- \[ ] .py 的 commit 还没 push 成功（卡在 WSL 要密码）——需回 Windows cmd 跑 `git push`

\- \[ ] PROJECT\_RULES.md 未建

\- \[ ] 报告02 未写（截止 11/5）

\- \[ ] 联调 api.js→recommend.js 未做（差距高优项，加分）

\- \[ ] 真机预览 / H5 备用 未做



\## 关键约定（避免再踩坑）

\- git 命令统一在 WINDOWS 的 cmd 里跑（WSL 推不上去，GitHub 不接受密码）

\- 运行算法自测：`WSL` 里 `cd /mnt/c/Users/Lenovo/Desktop/library\_recommend\_project` 后 `python3 library\_recommend.py`

\- 改完代码日常三连：git add . → git commit -m "..." → git push

\- 联调边界（写进 PROJECT\_RULES.md）：只改 utils/api.js 内部，其余页面调用代码一行不动；字段契约 {id,title,author,type,style,tags,score,reason}



\## 假实现（报告02必须标“临时假实现”）

1\. 首页推荐数据源是 api.js 的本地 mock，未接 recommend.js 真算法

2\. 角色权限靠硬编码账号判断，门禁未开发

3\. 真机未测试；通知提醒选做未开始



\## 明天起计划

\- 先：Windows cmd 里 `git push` 传 .py；建 PROJECT\_RULES.md 并提交

\- 11/2：报告02 组成部分表+工作流程前半

\- 11/3：工作流程+任务说明对比；尝试联调

\- 11/4：复现与差距+红线自查+纯净zip

\- 11/5：提交报告02



