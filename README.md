# 站点说明 · 关关 Guanguan 法务与支持页

三份公开文本的静态站点：**用户协议**、**隐私政策**、**支持**。零依赖、零构建、可直接托管。

```
站点/
├── index.html          入口（三个页面的导航卡）
├── terms.html          用户协议
├── privacy.html        隐私政策
├── support.html        支持
├── 404.html            未找到
├── robots.txt
├── .nojekyll           GitHub Pages 用（避免忽略下划线开头的文件）
└── assets/
    ├── site.css        设计系统（单文件，含深色模式与打印样式）
    ├── site.js         交互层（原生 JS，无依赖）
    ├── favicon.svg
    └── og.png          社交分享图 1200×630
```

---

## 一、本地预览

```bash
cd "站点" && python3 -m http.server 8123
# 打开 http://localhost:8123/
```

> 请用 http 服务预览，不要直接双击打开 `index.html`（`file://` 下剪贴板复制会不可用）。

---

## 二、上线前必须替换的两处

| 位置 | 现值 | 要改成 |
|---|---|---|
| 三个页面的联系邮箱 | `guanguan.baicun@foxmail.com` | 若要换邮箱，全局替换这一个字符串即可 |
| `robots.txt` 的 sitemap 行 | 已注释 | 确定域名后取消注释并写入域名 |

页面里的 `<link rel="canonical">` 用的是相对路径 `./xxx.html`，**支持任意域名或子目录部署**，一般不需要改。
如果托管在独立子域名下并希望 canonical 是绝对地址，可全局替换 `href="./` 为 `href="https://你的域名/`（仅限 canonical 与 og:image 两行）。

## 三、填写到 App Store Connect

- **支持网址** → `https://你的域名/support.html`
- **隐私政策网址** → `https://你的域名/privacy.html`
- **营销网址**（可选） → `https://你的域名/`

## 四、托管方式

**任意静态托管都可以**，目录整体上传即可。两种最省事的：

- **GitHub Pages**：把 `站点/` 目录推到仓库，Settings → Pages → 选分支与目录。`404.html` 会被自动识别；`.nojekyll` 已备好。
- **对象存储 / CDN**（COS、OSS、Cloudflare Pages 等）：把 `站点/` 内容作为站点根目录上传，开启 HTTPS，并把 404 错误页指向 `404.html`。

## 五、内容口径（改动前请先读）

- 隐私政策的所有事实性陈述都来自工程源码核验，**不是模板套话**。三条硬约束：
  1. 无网络请求、无账号、无第三方 SDK —— 若将来加入任何联网/统计能力，第 02、05、09 节必须同步改写，并且 App 侧 `PrivacyInfo.xcprivacy` 要补声明。
  2. 权限只有相机、麦克风、照片读写四项 —— 新增任何权限都要更新第 03 节。
  3. 用户协议第 12 节的 Apple 第三方受益条款是 App Store 分发的必要条款，不要删。
- 支持页第 07 节列出了 cinegrain2（MIT）与 FFmpeg `vf_vignette`（仅参考公式）。**若新增第三方组件，请同步补表**；仓库内的完整清单见根目录 `THIRD-PARTY-NOTICES.md`。
- 三页的「生效日期 / 版本号」需与页脚「最后更新」保持一致，改动时一并更新。

## 六、设计系统速查

| 维度 | 取值 |
|---|---|
| 字体 | 系统栈（`-apple-system` / PingFang SC），无外部字体请求 |
| 字号 | `clamp()` 流体标度，正文最大 68ch 行宽 |
| 色彩 | 纸白 `#FFFFFF` / 近黑 `#0A0A0B` / 单一信号红 `#FF3B30`，含深色模式 |
| 律动 | 8pt 基准，章节上下留白 40–64px |
| 动效 | 进入揭示（IntersectionObserver）、发丝进度尺、目录滑动指示条、邮箱复制反馈 |
| 无障碍 | 键盘可操作、`aria-expanded`/`aria-current`、跳转链接、`prefers-reduced-motion` 全量降级 |
| 打印 | 已单独适配（隐藏导航、展开全部 FAQ） |
