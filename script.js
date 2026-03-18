/* =====================================================
   STORAGE — text and links only (no images)
===================================================== */
const NS = 'oam_portfolio_';
function save(key, val) { try { localStorage.setItem(NS + key, val); } catch(e) {} }
function load(key)      { try { return localStorage.getItem(NS + key); } catch(e) { return null; } }

/* =====================================================
   CURSOR
===================================================== */
const dot  = document.getElementById('cursorDot');
const ring = document.getElementById('cursorRing');
let mx = 0, my = 0, rx = 0, ry = 0;
document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
(function animCursor() {
  rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
  dot.style.left  = mx + 'px'; dot.style.top  = my + 'px';
  ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
  requestAnimationFrame(animCursor);
})();

/* =====================================================
   SCROLL REVEAL
===================================================== */
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

/* =====================================================
   TOAST
===================================================== */
let toastTimer;
function showToast(msg) {
  let t = document.getElementById('save-toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'save-toast';
    t.style.cssText = 'position:fixed;bottom:28px;left:50%;transform:translateX(-50%);background:var(--gold);color:var(--black);font-size:11px;letter-spacing:.12em;text-transform:uppercase;font-weight:600;padding:10px 24px;z-index:9999;font-family:DM Sans,sans-serif;pointer-events:none;transition:opacity .4s;opacity:0;';
    document.body.appendChild(t);
  }
  t.textContent = msg || 'Saved';
  t.style.opacity = '1';
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.style.opacity = '0'; }, 2200);
}

/* =====================================================
   TEXT — save on blur, restore on load
===================================================== */
function initTextSave() {
  document.querySelectorAll('[contenteditable]').forEach(el => {
    const key = 'text_' + (el.id || (el.closest('[id]')?.id + '_' + Array.from(el.parentElement.children).indexOf(el)));
    const saved = load(key);
    if (saved !== null) el.innerHTML = saved;
    el.addEventListener('blur', () => {
      save(key, el.innerHTML);
      showToast('Text saved');
    });
  });
}

/* =====================================================
   IMAGES — load into DOM only
   Images are baked into the export via downloadPortfolio()
===================================================== */
function applyImage(zoneId, imgId, dataUrl) {
  const img  = document.getElementById(imgId);
  const zone = document.getElementById(zoneId);
  if (!img || !zone) return;
  img.src = dataUrl;
  zone.classList.add('loaded');
}

function loadImg(zoneId, imgId, input) {
  const file = input.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    applyImage(zoneId, imgId, e.target.result);
    showToast('Photo added — click Download to save');
  };
  reader.readAsDataURL(file);
}

function loadProjImg(zoneId, imgId, input) { loadImg(zoneId, imgId, input); }
function loadArtCard(zoneId, imgId, input) { loadImg(zoneId, imgId, input); }
function triggerFile(id) { document.getElementById(id).click(); }

/* =====================================================
   LINKS — save & restore
===================================================== */
function applyHref(inputId, btnId, url) {
  const btn   = document.getElementById(btnId);
  const input = document.getElementById(inputId);
  if (!btn || !url) return;
  btn.href = url;
  btn.style.display = 'inline-block';
  if (input) {
    input.style.display = 'none';
    const setBtn = input.closest('.link-input-group')?.querySelector('.url-set-btn');
    if (setBtn) setBtn.style.display = 'none';
  }
}

function setHref(inputId, btnId) {
  const url = document.getElementById(inputId)?.value.trim();
  if (!url) return;
  applyHref(inputId, btnId, url);
  save('link_' + btnId, url);
  showToast('Link saved');
}

/* =====================================================
   VIDEO REEL
===================================================== */
function loadReel(input) {
  const file = input.files[0]; if (!file) return;
  const player  = document.getElementById('vreel-player');
  const empty   = document.getElementById('vreel-empty');
  const overlay = document.getElementById('vreel-overlay');
  player.src = URL.createObjectURL(file);
  player.style.display = 'block';
  if (empty)   empty.style.display = 'none';
  if (overlay) overlay.style.display = 'flex';
  player.play().catch(() => {});
  showToast('Video loaded');
}

/* =====================================================
   RESTORE — text and links only
===================================================== */
function restoreAll() {
  const linkMap = {
    'p1live-btn': 'p1live-in',
    'c1-btn':     'c1-url',
  };
  Object.entries(linkMap).forEach(([btnId, inputId]) => {
    const url = load('link_' + btnId);
    if (url) applyHref(inputId, btnId, url);
  });
}

/* =====================================================
   DOWNLOAD — reads images directly from live DOM
   No base64 bloat — images come from what is currently
   displayed on screen
===================================================== */
function downloadPortfolio() {
  const clone = document.documentElement.cloneNode(true);

  // Ensure loaded zones with real images stay visible
  clone.querySelectorAll('img').forEach(img => {
    if (img.src && img.src.startsWith('data:')) {
      const zone = img.closest('.about-image-zone, .proj-img-zone, .art-card, [id]');
      if (zone) zone.classList.add('loaded');
    }
  });

  // Remove toolbar and toast from export
  clone.querySelector('#export-toolbar')?.remove();
  clone.querySelector('#save-toast')?.remove();

  const html = '<!DOCTYPE html>\n' + clone.outerHTML;
  const blob = new Blob([html], { type: 'text/html' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'Omolara_Portfolio.html';
  a.click();
  URL.revokeObjectURL(a.href);
  showToast('Downloaded!');
}

/* =====================================================
   CLEAR ALL
===================================================== */
function clearAll() {
  if (!confirm('Clear all saved text and links? This cannot be undone.')) return;
  try {
    Object.keys(localStorage).filter(k => k.startsWith(NS)).forEach(k => localStorage.removeItem(k));
  } catch(e) {}
  location.reload();
}

/* =====================================================
   INIT
===================================================== */
document.addEventListener('DOMContentLoaded', () => {
  restoreAll();
  initTextSave();
});