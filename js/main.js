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
    const nav = scaler.querySelector('.nav');
    const html = htmlList.join('\n');
    if (nav) {
      nav.insertAdjacentHTML('beforebegin', html);
    } else {
      scaler.insertAdjacentHTML('beforeend', html);
    }

    slides = Array.from(scaler.querySelectorAll(':scope > .slide'));
    totalSlides = slides.length;
    if (totalSlides > 0) {
      slides.forEach((s) => s.classList.remove('active'));
      slides[0].classList.add('active');
      cur = 0;
      updateNavDisplay();
    }
  }

  function showLoadError(err) {
    const nav = scaler.querySelector('.nav');
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
    if (nav) {
      nav.insertAdjacentElement('beforebegin', fallback);
    } else {
      scaler.appendChild(fallback);
    }
    slides = [fallback];
    totalSlides = 1;
  }

  /* ==================================================
     1. 等比缩放适配
     ================================================== */
  function resize() {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const safeMargin = 24;
    const availW = Math.max(vw - safeMargin, 320);
    const availH = Math.max(vh - safeMargin, 240);
    const scale = Math.min(availW / DESIGN_W, availH / DESIGN_H);
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
    const pageDisplay = document.getElementById('page-display');
    const chapterDisplay = document.getElementById('chapter-display');
    
    if (pageDisplay) {
      pageDisplay.textContent = `${pageNum} / ${totalSlides}`;
    }
    if (chapterDisplay) {
      chapterDisplay.textContent = chapterName;
    }

    // 更新导航按钮的活跃状态
    updateNavButtons();
  }

  // 更新导航按钮的活跃状态
  function updateNavButtons() {
    const navButtons = document.querySelectorAll('.nav button[onclick^="goTo"]');
    navButtons.forEach(btn => {
      btn.classList.remove('nav-btn-active');
      // 解析 onclick 属性中的页码
      const match = btn.getAttribute('onclick').match(/goTo\((\d+)\)/);
      if (match) {
        const btnPageIdx = parseInt(match[1], 10);
        if (btnPageIdx === cur) {
          btn.classList.add('nav-btn-active');
        }
      }
    });
  }

  /* 对外暴露，供 HTML 按钮的 onclick 调用 */
  window.next = function () { show(cur + 1); };
  window.prev = function () { show(cur - 1); };
  // 按页跳转（0-based）
  window.goTo = function (n) { show(n); };

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
