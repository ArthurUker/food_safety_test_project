# 食源性病原体微流控核酸快筛推广方案

静态演示站 / 幻灯片系统，用于向监管与客户展示“食源性病原体微流控核酸快速筛查解决方案”。

仓库内容说明：
- `index.html` — 主入口，运行时会按序加载 `slides/slide1.html` … `slide16.html`。
- `css/`、`js/`、`assets/` — 静态资源（样式、脚本、图片）。
- `slides/` — 每页独立的分页 HTML 片段，便于单页编辑。
- `docs/` — 开发与参考文档（政策、指导等）。

快速预览（本地）：
1. 在项目根目录启动简单静态服务器（推荐 Python）：

```bash
python3 -m http.server 8000
# 或者：
# python -m http.server 8000
```

2. 在浏览器打开 `http://localhost:8000/` 即可预览。

部署到 GitHub Pages：
- 我已添加一个 GitHub Actions 工作流（`.github/workflows/pages.yml`），会在每次 `main` 分支推送时把静态站点内容（`index.html`, `css/`, `js/`, `assets/`, `slides/`）打包并部署到 GitHub Pages。推送后，Actions 会自动运行并将页面发布到 Pages（URL 形如 `https://<用户名>.github.io/food_safety_test_project`）。

注意事项：
- 若需自定义域名或 Pages 设置，请在仓库 Settings → Pages 中配置。若希望排除某些 `docs/` 文件不发布，可在工作流里调整 `cp` 的复制规则。

贡献 & 许可证
- 贡献请提交 PR；如需更改许可证，请联系仓库所有者。
