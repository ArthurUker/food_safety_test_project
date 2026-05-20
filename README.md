# 学校食品安全快速检测实验室管理制度体系

本仓库存放针对学校（食堂）场景的“食品安全快速检测实验室管理制度体系”演示幻灯片与配套说明，依据《市场监管总局关于规范食品快速检测使用的意见》（国市监食检规〔2023〕1号）制定。

主要内容：
- `slides/`：每页幻灯片的 HTML 片段（20 页），用于生成演示
- `index.html`：演示主页面（动态加载 `slides/` 中内容）
- `css/`、`js/`：样式与前端脚本
- `docs/slides_guidelines_v2.md`：新版幻灯片开发与制度说明（依据政策要求）

说明与注意事项：
- 本仓库中快检定位为“风险筛查与处置参考”，不替代具有资质的食品检验机构的实验室确证检验。请遵循相关法律法规与本制度流程。
- 本仓库为演示/文档用途，**本地脚本与开发环境文件默认不被上传**（见 `.gitignore`）。如果你需要将 `scripts/` 中脚本加入版本控制，请先移除 `.gitignore` 的对应规则。

快速开始（本地预览）：
1. 在浏览器中打开 `index.html` 查看幻灯片演示。
2. 若需重新生成或批量更新幻灯片，可以运行（本机需安装 Python 3）：

```
python3 scripts/gen_slides.py
```

Git 提交流程示例：

```
git add README.md .gitignore index.html slides/ docs/slides_guidelines_v2.md
git commit -m "chore(docs): add README and .gitignore; update slides for lab management"
git push origin main
```

如果推送时需要认证，请确保已配置 SSH key 或 Git 凭据。

如需删除本地不必要文件（示例）：

```
rm -rf .venv
```

作者：项目组
日期：2026-05-20
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
