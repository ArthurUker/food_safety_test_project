/* =====================================================
   食源性病原体微流控核酸快筛推广方案 · 交互脚本
   最后更新：2026-05-14
   ===================================================== */

(function () {

  /* ── 常量 ── */
  const DESIGN_W = 1600;
  const DESIGN_H = 900;
  const TOTAL_SLIDES = 28;
  const SWIPE_THRESHOLD = 50; // 触屏滑动触发阈值（px）

  /* ── 章节名称映射 ── */
  const chapterNames = [
    '封面', '建设背景', '基本条件', '人员培训', '设备管理', 
    '试剂管理', '采样规程', '检测规程', '质量控制', '记录制度',
    '阳性处置', '信息公示', '复检流程', '生物安全', '检测项目',
    '留样管理', '数据管理', '年度计划', '考核改进', '制度总览',
    '供应商管理', '人员健康', '功能分区', '方法确认', '不符合项',
    '内部审核', '事件响应', '文件管理'
  ];

  /* ── DOM 引用 ── */
  const scaler = document.getElementById('scaler');
  const slideContainer = document.getElementById('slide-container');
  let slides = [];
  let totalSlides = 0;

  /* ── 当前页索引 ── */
  let cur = 0;

  async function loadSlides() {
    const slidePromises = Array.from({ length: TOTAL_SLIDES }, (_, idx) => idx + 1).map(async (num) => {
      const resp = await fetch(`slides/slide${num}.html`, { cache: 'no-store' });
      if (!resp.ok) {
        throw new Error(`Slide ${num} load failed: ${resp.status}`);
      }
      return resp.text();
    });

    const htmlList = await Promise.all(slidePromises);
    const html = htmlList.join('\n');
    if (!slideContainer) throw new Error('Slide container not found');
    slideContainer.innerHTML = html;

    slides = Array.from(slideContainer.querySelectorAll(':scope > .slide'));
    totalSlides = slides.length;
    // update total pages display
    const totalPagesEl = document.getElementById('total-pages');
    if (totalPagesEl) totalPagesEl.textContent = String(totalSlides);

    if (totalSlides > 0) {
      slides.forEach((s) => s.classList.remove('active'));
      slides[0].classList.add('active');
      cur = 0;
      updateNavDisplay();
    }
  }

  function showLoadError(err) {
    const fallback = document.createElement('div');
    fallback.className = 'slide active';
    fallback.innerHTML = `
      <div class="kicker">加载失败</div>
      <div class="cover-body">
        <div class="slide-title sm">分页内容未能加载</div>
        <p>请确认通过本地 HTTP 服务访问页面，并检查 <strong>slides/</strong> 目录下分页文件是否完整。</p>
        <p style="font-size:14px;color:#6b8398">${String(err && err.message ? err.message : err)}</p>
      </div>
    `;
    if (slideContainer) slideContainer.appendChild(fallback);
    slides = [fallback];
    totalSlides = 1;
    const totalPagesEl = document.getElementById('total-pages');
    if (totalPagesEl) totalPagesEl.textContent = '1';
  }

  /* ==================================================
     1. 等比缩放适配
     ================================================== */
  function resize() {
    const shell = document.querySelector('.ppt-shell');
    const safeMargin = 24;
    const availW = Math.max(window.innerWidth - safeMargin * 2, 320);
    const availH = Math.max(window.innerHeight - safeMargin * 2, 240);
    const scale = Math.min(availW / DESIGN_W, availH / DESIGN_H);
    // .scaler 是固定的设计尺寸，使用 transform 缩放整个舞台
    scaler.style.transform = `translate(-50%, -50%) scale(${scale})`;
  }

  window.addEventListener('resize', resize);

  /* ==================================================
     2. 幻灯片切换
     ================================================== */
  function show(n) {
    if (totalSlides === 0) return;

    // 边界保护
    if (n < 0) n = 0;
    if (n >= totalSlides) n = totalSlides - 1;

    slides[cur].classList.remove('active');
    cur = n;
    slides[cur].classList.add('active');

    // 更新页码和章节显示
    updateNavDisplay();
  }

  // 更新导航栏的页码和章节显示
  function updateNavDisplay() {
    const pageNum = cur + 1;
    const chapterName = chapterNames[cur] || '未知章节';
    const currentPageEl = document.getElementById('current-page');
    const totalPagesEl = document.getElementById('total-pages');
    const chapterDisplay = document.getElementById('chapter-display');
    const miniProgress = document.getElementById('mini-progress');

    if (currentPageEl) currentPageEl.textContent = String(pageNum);
    if (totalPagesEl) totalPagesEl.textContent = String(totalSlides);
    if (chapterDisplay) chapterDisplay.textContent = chapterName;
    if (miniProgress) {
      const pct = Math.round((pageNum / Math.max(totalSlides, 1)) * 100);
      miniProgress.style.width = `${pct}%`;
    }

    // 渲染章节气泡并更新激活状态
    if (typeof renderChapters === 'function') renderChapters();
    updateNavButtons();
  }

  // 简单的 HTML 转义，防止章节名中有特殊字符
  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  // 渲染章节气泡（可被多次调用以更新激活状态）
  function renderChapters() {
    const container = document.getElementById('chapters-container');
    if (!container) return;
    // 如果尚未渲染，填充所有章节气泡
    if (!container.dataset.rendered) {
      container.innerHTML = '';
      for (let i = 0; i < totalSlides; i++) {
        const name = chapterNames[i] || `第${i + 1}页`;
        const short = name.length > 2 ? name.slice(0, 2) : name;
        const el = document.createElement('button');
        el.className = 'chapter-bubble';
        el.type = 'button';
        el.dataset.index = i;
        el.title = name;
        el.innerHTML = `${escapeHtml(short)}`;
        el.addEventListener('click', () => show(i));
        el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { show(i); e.preventDefault(); } });
        container.appendChild(el);
      }
      container.dataset.rendered = '1';
    }
    // 更新激活态
    const items = container.querySelectorAll('.chapter-bubble');
    items.forEach(it => {
      const idx = parseInt(it.dataset.index, 10);
      if (idx === cur) {
        it.classList.add('active');
        try { it.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' }); } catch (e) {}
      } else {
        it.classList.remove('active');
      }
    });
  }

  // 更新翻页按钮可用态与章节高亮（兼容旧与新）
  function updateNavButtons() {
    // 更新 prev/next 按钮禁用状态
    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');
    if (btnPrev) btnPrev.disabled = (cur <= 0);
    if (btnNext) btnNext.disabled = (cur >= totalSlides - 1);

    // 更新 legacy 按钮（如果存在）
    const legacy = document.querySelectorAll('.nav button[onclick^="goTo"]');
    legacy.forEach(btn => {
      btn.classList.remove('nav-btn-active');
      const onclick = btn.getAttribute('onclick') || '';
      const match = onclick.match(/goTo\((\d+)\)/);
      if (match) {
        const btnPageIdx = parseInt(match[1], 10);
        if (btnPageIdx === cur) btn.classList.add('nav-btn-active');
      }
    });
  }

  /* 对外暴露，供 HTML 按钮的 onclick 调用 */
  window.next = function () { show(cur + 1); };
  window.prev = function () { show(cur - 1); };
  // 按页跳转（0-based）
  window.goTo = function (n) { show(n); };

  // 绑定底部 prev/next 按钮
  document.addEventListener('click', function (e) {
    const t = e.target.closest && e.target.closest('#btn-prev');
    if (t) { window.prev(); return; }
    const t2 = e.target.closest && e.target.closest('#btn-next');
    if (t2) { window.next(); return; }
  });

  /* ==================================================
     3. 键盘快捷键
     ================================================== */
  document.addEventListener('keydown', function (e) {
    switch (true) {
      // 下一页
      case ['ArrowRight', 'PageDown', ' '].includes(e.key):
        e.preventDefault();
        window.next();
        break;
      // 上一页
      case ['ArrowLeft', 'PageUp'].includes(e.key):
        e.preventDefault();
        window.prev();
        break;
      // 跳转首页
      case e.key === 'Home':
        show(0);
        break;
      // 跳转末页
      case e.key === 'End':
        show(totalSlides - 1);
        break;
      // 数字键直接跳页（1–9）
      case /^[1-9]$/.test(e.key):
        show(parseInt(e.key, 10) - 1);
        break;
      // F 键切换全屏
      case e.key.toLowerCase() === 'f':
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
        } else {
          document.exitFullscreen();
        }
        break;
    }
  });

  /* ==================================================
     4. 触屏滑动
     ================================================== */
  let touchStartX = 0;

  document.addEventListener('touchstart', function (e) {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  document.addEventListener('touchend', function (e) {
    const dx = e.changedTouches[0].screenX - touchStartX;
    if (dx < -SWIPE_THRESHOLD) window.next(); // 左滑 → 下一页
    if (dx >  SWIPE_THRESHOLD) window.prev(); // 右滑 → 上一页
  }, { passive: true });

  (async function init() {
    try {
      await loadSlides();
    } catch (err) {
      showLoadError(err);
    }
    resize();
  })();

})();
