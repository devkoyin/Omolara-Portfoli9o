/* CURSOR */
const dot = document.getElementById('cursorDot');
const ring = document.getElementById('cursorRing');

let mx = 0, my = 0, rx = 0, ry = 0;

document.addEventListener('mousemove', e => {
  mx = e.clientX;
  my = e.clientY;
});

(function animCursor() {
  rx += (mx - rx) * 0.18;
  ry += (my - ry) * 0.18;

  if (dot) {
    dot.style.left = mx + 'px';
    dot.style.top = my + 'px';
  }

  if (ring) {
    ring.style.left = rx + 'px';
    ring.style.top = ry + 'px';
  }

  requestAnimationFrame(animCursor);
})();

/* SCROLL REVEAL */
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

/* IMAGE LOADERS */
function loadImg(zoneId, imgId, input) {
  const file = input.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = e => {
    document.getElementById(imgId).src = e.target.result;
    document.getElementById(zoneId).classList.add('loaded');
  };
  reader.readAsDataURL(file);
}

function triggerFile(id) {
  document.getElementById(id).click();
}

function loadProjImg(zoneId, imgId, input) {
  const file = input.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = e => {
    document.getElementById(imgId).src = e.target.result;
    document.getElementById(zoneId).classList.add('loaded');
  };
  reader.readAsDataURL(file);
}

function loadArtCard(zoneId, imgId, input) {
  const file = input.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = e => {
    document.getElementById(imgId).src = e.target.result;
    document.getElementById(zoneId).classList.add('loaded');
  };
  reader.readAsDataURL(file);
}

/* URL SETTER */
function setHref(inputId, btnId) {
  const input = document.getElementById(inputId);
  const url = input.value.trim();
  if (!url) return;

  const btn = document.getElementById(btnId);
  btn.href = url;
  btn.style.display = 'inline-block';

  input.style.display = 'none';

  const wrap = input.closest('.link-input-group');
  const buttons = wrap.querySelectorAll('.url-set-btn');

  buttons.forEach(button => {
    if (button.getAttribute('onclick')?.includes(inputId)) {
      button.style.display = 'none';
    }
  });
}

/* VIDEO EMBED */
function embedVid(inputId, zoneId, frameId) {
  const raw = document.getElementById(inputId).value.trim();
  let src = '';

  const yt = raw.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]+)/);
  const vm = raw.match(/vimeo\.com\/(\d+)/);

  if (yt) {
    src = 'https://www.youtube.com/embed/' + yt[1] + '?rel=0';
  } else if (vm) {
    src = 'https://player.vimeo.com/video/' + vm[1];
  } else {
    alert('Paste a YouTube or Vimeo URL');
    return;
  }

  document.getElementById(frameId).src = src;
  document.getElementById(zoneId).classList.add('embedded');
}