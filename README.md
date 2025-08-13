# 🍥 Astro 主题 vhAstro-Theme

## 🚀 vhAstro-Theme：一款基于 Astro 构建的优雅的响应式博客主题

**「当极简主义遇上工程之美」**

在线演示 ➡️ [https://www.vvhan.com](https://www.vvhan.com)

官方文档 ➡️ [vhAstro-Theme](https://www.vvhan.com/article/astro-theme-vhastro-theme)

![Astro主题 vhAstro-Theme](https://i0.wp.com/uxiaohan.github.io/v2/2025/04/1743737394560.webp)

## ✨ 功能特性

- [x] 简洁的响应式设计
- [x] 流畅的动画和页面过渡
- [x] 丝滑的阻尼滚动效果
- [x] 顶部Banner
- [x] 两列布局
- [x] 阅读时间
- [x] 字数统计
- [x] 代码块
- [x] 语法高亮
- [x] 图片懒加载
- [x] 图片灯箱
- [x] LivePhoto
- [x] LaTex 数学公式
- [x] 赞赏功能
- [x] 评论 - 内置【Twikoo、Waline】
- [x] 本地搜索
- [x] 公告
- [x] 标签
- [x] 分类
- [x] 归档
- [x] 动态
- [x] 圈子
- [x] 关于
- [x] 留言板
- [x] 友情链接
- [x] 推荐文章
- [x] 置顶文章
- [x] 谷歌广告
- [x] 侧边栏选择性展示
- [x] 内置 404 页面
- [x] Sitemap 支持
- [x] RSS 支持
- [x] 活跃的社区支持
- [x] 广泛的现代框架兼容性
- [x] 高效的性能优化
- [x] 优秀的开发体验

## 🚀 使用方法

### 使用 Github 模板

- 使用此模板 [生成新仓库或 Fork 此仓库](https://github.com/new?template_name=vhAstro-Theme&template_owner=uxiaohan)
- 进行本地开发，Clone 新的仓库，执行 `pnpm install` 以安装依赖
- 若未安装 [pnpm](https://pnpm.io)，执行 `yarn install -g pnpm`
- 通过配置文件 `src/config.ts` 自定义博客
- 执行 pnpm newpost '文章标题' 创建新文章，并在 src/content/posts/ 目录中编辑
- 参考官方指南将博客部署至 Vercel, Netlify,Cloudflare Pages, GitHub Pages 等

### Vercel 自动部署

[![vhAstro-Theme](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/uxiaohan/vhAstro-Theme)

### Cloudflare Pages 自动部署

[![vhAstro-Theme](https://deploy.workers.cloudflare.com/button)](https://dash.cloudflare.com/?to=/:account/workers-and-pages/create/deploy-to-workers&repository=https://github.com/uxiaohan/vhAstro-Theme)

### 使用命令拉取模板

```bash
# 使用 pnpm
pnpm create astro@latest --template uxiaohan/vhAstro-Theme astro-blog
# 或者 yarn
yarn create astro --template uxiaohan/vhAstro-Theme astro-blog
# 或者 yarn
yarn create astro@latest -- --template uxiaohan/vhAstro-Theme astro-blog
# 进入项目目录
cd astro-blog
```

### 本地开发

```bash
# 安装依赖
pnpm install
# 本地开发
pnpm dev
# 构建静态文件
pnpm build
# 创建新文章
pnpm newpost '文章标题'
```

### ⚠️ Hexo 迁移 Astro 方法

> 将 `Hexo` 博客的 `src/_posts/` 目录下的文章文件，复制到 `Astro` 的 `src/content/blog/` 目录下即可，然后自定义 `src/config.ts` 配置文件去自定义博客。<br>⚠️ `Hexo` 的部署、使用、自动化部署等方法 完全适用于 `Astro` 博客！<br>🎉 此时，你已成功迁移 Hexo 博客至 Astro 博客！

## 🍬 特色页面

### 友情链接

```js
// 配置文件 src/page_data/Link.ts
export default {
	// API 接口请求优先，数据格式保持和 data 一致
	api: "",
	// api 为空则使用 data 静态数据
	data: [
		{
			name: "韩小韩博客",
			link: "https://www.vvhan.com",
			avatar: "https://q1.qlogo.cn/g?b=qq&nk=1655466387&s=640",
			descr: "运气是计划之外的东西."
		},
		{
			name: "韩小韩API",
			link: "https://api.vvhan.com",
			avatar: "https://api.vvhan.com/static/images/logo.webp",
			descr: "免费Web API数据接口调用服务平台."
		}
	]
};
```

### 说说动态

```js
// 配置文件 src/page_data/Talking.ts
export default {
	// API 接口请求优先，数据格式保持和 data 一致
	api: "",
	// api 为空则使用 data 静态数据
	// 注意：图片请用 vh-img-flex 类包裹
	data: [
		{
			date: "2025-02-12 19:36:16",
			tags: ["树", "夕阳"],
			content: '好美🌲<p class="vh-img-flex"><img src="https://i0.wp.com/shp.qpic.cn/collector/1655466387/937ec070-8448-4c7b-9c8b-abd41ce892cb/0"></p>'
		},
		{
			date: "2024-10-05 16:16:06",
			tags: ["日常"],
			content: "记录第一条说说"
		}
	]
};
```

### 圈子（需部署 FreshRSS）

```js
// 配置文件 src/page_data/Friends.ts
export default {
	// API 接口请求优先，数据格式保持和 data 一致
	api: "",
	// api 为空则使用 data 静态数据
	data: [
		{
			title: "Astro 中使用 Lenis 增加鼠标滚动阻尼感",
			auther: "韩小韩博客",
			date: "2025-03-06",
			link: "https://www.vvhan.com/article/Lenis-in-Astro",
			content: "在移动端触控交互中，惯性滚动带来的丝滑体验已成为标配，但鼠标滚轮受限于机械结构，滚动时难免产生生硬的段落感。如何让传统滚轮操作也能获得如触控板般的阻尼反馈？Lenis库通过JavaScript模拟惯性算法，成功将”物理惯性”引入网页滚动，本文将解析其实现原理与实战应用。"
		},
		{
			title: "Astro 添加 Twikoo 评论组件",
			auther: "韩小韩博客",
			date: "2025-03-03",
			link: "https://www.vvhan.com/article/astro-twikoo",
			content: "Astro在使用视图过渡路由时，在跳转路由时，会导致JS文件只有在第一次进入页面时生效，所以Astro在使用视图过渡路由下Twikoo时无法正常使用的，我是单独写了一个评论组件，对Twikoo进行动态加载，然后在需要评论的页面引入的。"
		},
		{
			title: "Astro主题-优雅的vhAstro-Theme【使用文档】",
			auther: "韩小韩博客",
			date: "2025-03-02",
			link: "https://www.vvhan.com/article/astro-theme-vhastro-theme",
			content: "🥝从Z-Blog到Emlog，从Typecho到Hexo，从动态博客到静态博客，作为一个前端，我深入了解了多种SSG工具，如Hexo、Vitepress、Hugo等，并最终锁定了Astro作为重构博客的选择。🍇Astro活跃的社区支持、广泛的现代框架兼容性、高效的性能优化、优秀的开发体验。"
		}
	]
};
```

## 📄 文章格式

```md
---
title: 标题
categories: 分类
tags:
  - 标签1
  - 标签2
id: 文章ID
date: 文章创建日期
updated: 文章更新日期
cover: "封面图URL (为空默认随机内置封面 /public/assets/images/banner)"
recommend: false # 是否推荐文章
top: false # 是否置顶文章
hide: false # 是否隐藏文章
<!-- 页面独有 -->
type: "links" # 页面类型
comment: false # 关闭页面评论（默认开启）
---
```

## ✅ Lighthouse

![vhAstro-Theme-Lighthouse](https://uxiaohan.github.io/v2/2025/03/1742543844078.svg)

## 🌈 项目结构

```t
.
├── public              => 静态资源
├── script              => 命令
├── src
│   ├── components      => 组件
│   ├── content
│   │   └── blog        => 博客文章数据
│   ├── layouts         => Layout 布局
│   ├── page_data       => 页面数据
│   ├── pages
│   │   ├── about                        => 关于页面
│   │   ├── archives                     => 归档页面
│   │   ├── article                      => 文章页面
│   │   ├── categories                   => 分类页面
│   │   ├── friends                      => 圈子页面
│   │   ├── links                        => 友链页面
│   │   ├── message                      => 留言页面
│   │   ├── tag                          => 标签页面
│   │   ├── talking                      => 动态页面
│   │   ├── [...page].astro              => 首页分页
│   │   ├── 404.astro                    => 404页面
│   │   ├── robots.txt.ts                => 爬虫文件
│   │   └── rss.xml.ts                   => RSS文件
│   ├── plugins             => 插件
│   ├── scripts             => 脚本
│   ├── styles              => 样式
│   ├── type                => 类型
│   ├── utils               => 工具
│   ├── content.config.ts   => 内容配置
│   ├── config.ts           => 配置
├── tsconfig.json       => Typescript 配置
├── astro.config.mjs    => Astro 配置
├── package.json        => 依赖管理
└── pnpm-lock.yaml      => 依赖锁定文件
```

## ⚙️ 项目配置
```js
export default {
  Title: '韩小韩博客',
  Site: 'https://www.vvhan.com',
  Subtitle: '不曾与你分享的时间,我在进步.',
  Description: '韩小韩博客 专注于前开发与相关技术的实战分享，涵盖Vue框架、Node.js、Serverless等，并涉及Node、Python、Linux、Docker等领域。同时，博客也分享作者的生活、音乐和旅行的热爱。',
  Author: '.𝙃𝙖𝙣',
  Motto: '运气是计划之外的东西.',
  Avatar: 'https://q1.qlogo.cn/g?b=qq&nk=1655466387&s=640',
  // Cover 网站缩略图
  Cover: '/assets/images/banner/072c12ec85d2d3b5.webp',
  // 网站创建时间
  CreateTime: '2021-09-01',
  // 首页打字机文案列表
  TypeWriteList: [
    '不曾与你分享的时间,我在进步.',
    "I am making progress in the time I haven't shared with you.",
  ],
  // 顶部 Banner 配置
  HomeBanner: {
    enable: true,
    cover: '/assets/images/home-banner.webp'
  },
  // 博客主题配置
  Theme: {
    // 颜色请用 16 进制颜色码
    // 主题颜色
    "--vh-main-color": "#01C4B6",
    // 字体颜色
    "--vh-font-color": "#34495e",
    // 侧边栏宽度
    "--vh-aside-width": "318px",
    // 全局圆角
    "--vh-main-radius": "0.88rem",
    // 主体内容宽度
    "--vh-main-max-width": "1458px",
  },
  // 导航栏 (新窗口打开 newWindow: true)
  Navs: [
    // 仅支持 SVG 且 SVG 需放在 public/assets/images/svg/ 目录下，填入文件名即可（封装了 SVG 组件 为了极致压缩 SVG）
    // 建议使用 https://tabler.io/icons 直接下载 SVG
    { text: '朋友', link: '/links', icon: 'Nav_friends' },
    { text: '圈子', link: '/friends', icon: 'Nav_rss' },
    { text: '动态', link: '/talking', icon: 'Nav_talking' },
    { text: '昔日', link: '/archives', icon: 'Nav_archives' },
    { text: '留言', link: '/message', icon: 'Nav_message' },
    { text: '关于', link: '/about', icon: 'Nav_about' },
    { text: 'API', link: 'https://api.vvhan.com/', target: true, icon: 'Nav_link' },
  ],
  // 侧边栏个人网站
  WebSites: [
    // 仅支持 SVG 且 SVG 需放在 public/assets/images/svg/ 目录下，填入文件名即可（封装了 SVG 组件 为了极致压缩 SVG）
    // 建议使用 https://tabler.io/icons 直接下载 SVG
    { text: 'Github', link: 'https://github.com/uxiaohan', icon: 'WebSite_github' },
    { text: '韩小韩API', link: 'https://api.vvhan.com', icon: 'WebSite_api' },
    { text: '每日热榜', link: 'https://hot.vvhan.com', icon: 'WebSite_hot' },
    { text: '骤雨重山图床', link: 'https://wp-cdn.4ce.cn', icon: 'WebSite_img' },
    { text: 'HanAnalytics', link: 'https://analytics.vvhan.com', icon: 'WebSite_analytics' },
  ],
  // 侧边栏展示
  AsideShow: {
    // 是否展示个人网站
    WebSitesShow: true,
    // 是否展示分类
    CategoriesShow: true,
    // 是否展示个人标签
    TagsShow: true,
    // 是否展示推荐文章
    recommendArticleShow: true
  },
  // DNS预解析地址
  DNSOptimization: [
    'https://i0.wp.com',
    'https://analytics.vvhan.com',
    'https://vh-api.4ce.cn',
    'https://registry.npmmirror.com',
    'https://pagead2.googlesyndication.com'
  ],
  // 博客音乐组件解析接口
  vhMusicApi: 'https://vh-api.4ce.cn/blog/meting',
  // 评论组件（只允许同时开启一个）
  Comment: {
    // Twikoo 评论
    Twikoo: {
      enable: false,
      envId: ''
    },
    // Waline 评论
    Waline: {
      enable: false,
      serverURL: ''
    }
  },
  // Han Analytics 统计（https://github.com/uxiaohan/HanAnalytics）
  HanAnalytics: { enable: true, server: 'https://analytics.vvhan.com', siteId: 'Hello-HanHexoBlog' },
  // Google 广告
  GoogleAds: {
    ad_Client: 'ca-pub-xxxxxxxxxx',
    // 侧边栏广告(不填不开启)
    asideAD_Slot: `<ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-xxxxxxxxxx" data-ad-slot="xxxxxx" data-ad-format="auto" data-full-width-responsive="true"></ins>`,
    // 文章页广告(不填不开启)
    articleAD_Slot: `<ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-xxxxxxxxxx" data-ad-slot="xxxxxx" data-ad-format="auto" data-full-width-responsive="true"></ins>`
  },
  // 文章内赞赏码
  Reward: {
    // 支付宝收款码
    AliPay: '/assets/images/alipay.webp',
    // 微信收款码
    WeChat: '/assets/images/wechat.webp'
  }
}
```

## ✨ 反馈和建议

如果您有任何建议/反馈，您可以通过我的 [电子邮件](mailto:1655466387@qq.com) 联系我。或者，如果您发现错误或想要请求新功能，请随时打开问题。

## Stargazers over time

![Stargazers over time](https://starchart.cc/uxiaohan/vhAstro-Theme.svg?variant=adaptive)
