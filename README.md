# 斯托克波特郡中文球迷站

Vite 多页静态站。首页包含比赛中心、积分榜、新闻、球队历史、核心人物和官方商店入口。

## 本地运行

```powershell
npm.cmd install
npm.cmd run dev
```

使用终端实际显示的本地地址，保持服务器运行。

```powershell
npm.cmd run build
npm.cmd run preview
```

构建自动生成新闻、人物和历史独立 HTML，发布目录为 `dist/`。

## GitHub Pages 发布

网站代码位于 `master` 分支。推送到该分支后，`.github/workflows/deploy-pages.yml` 会安装锁定依赖、生成页面、检查人物资料，再发布 `dist/`。仓库 Settings > Pages 的发布来源应为 GitHub Actions。

免费访问地址为 `https://gggaiii.github.io/scfc_CN/`。资源使用相对路径，兼容项目子目录和后续自定义域名。不要将 `stockportcounty-china.xxxx` 这样的占位名称配置成真实域名；购买并验证完整域名后，再配置 Pages 和 DNS。

## 内容与交互

- 比赛中心：未来赛程、最近赛果、主客场与赛事筛选、详情、开球倒计时及日历下载。
- 阵容：中文名、英文名与号码搜索，位置和外租筛选，快速资料及本机收藏。
- 新闻：置顶与最新、分类、搜索、分批加载、阅读进度、目录和相关推荐。
- 历史：年代筛选、可展开故事及人物入口。
- 球衣：官方商品照片，跳转官方商品页完成购买。

编辑源数据后重新生成。请勿直接修改生成的详情 HTML；它们会在下次构建时覆盖。

内容入口：`data/news.js`、`data/squad.js`、`data/history.js`。交互模块位于 `modules/`，全站交互样式位于 `experience.css`。

人物中文介绍集中在 `data/player-profiles.js`，以个人页文件名为键。`shortIntro` 是阵容卡片导语，`detailSections` 是个人页分段长文，`profileSources` 记录来源。欣奇利夫和诺伍德保留的原有长文位于 `data/squad.js`，由 `preserveDetailSections` 合并；修改后运行 `npm.cmd run build` 同步独立 HTML。

`data/official-player-profiles.json` 与 `data/profile-news-sources.json` 为核对履历的官方原始快照，不直接用于前端渲染。`node tools/verify-player-profiles.mjs` 检查全员介绍覆盖、来源、短长文区分及生成页面。

详见 [交互与内容维护](INTERACTION-GUIDE.md) 和 [官方图片维护](OFFICIAL-MEDIA.md)。新闻为中文编辑摘要，原文来源保留在文章页面中。本项目为非官方中文球迷站。
