// Reveal system cards as they scroll into view
const cards = document.querySelectorAll('.sys-card');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (reduceMotion) {
  cards.forEach(c => c.classList.add('in-view'));
} else if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  cards.forEach(c => io.observe(c));
} else {
  cards.forEach(c => c.classList.add('in-view'));
}

// Footer "last deployed" date — set to today, edit or automate via CI if desired
const deployDate = document.getElementById('deployDate');
if (deployDate) {
  const d = new Date();
  const formatted = d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  deployDate.textContent = formatted;
  deployDate.setAttribute('datetime', d.toISOString().slice(0, 10));
}
/* ============ Lightbox / Auto-rotating gallery ============ */
(function(){
  // build overlay once
  const overlay = document.createElement('div');
  overlay.className = 'lb-overlay';
  overlay.innerHTML = `
    <div class="lb-stage">
      <img src="" alt="">
      <button class="lb-close" aria-label="Close">✕</button>
      <button class="lb-prev" aria-label="Previous">‹</button>
      <button class="lb-next" aria-label="Next">›</button>
      <div class="lb-bottom">
        <button class="lb-play" aria-label="Autoplay">
          <i></i><span>auto</span>
        </button>
        <span class="lb-counter"></span>
        <div class="lb-dots"></div>
      </div>
    </div>`;
  document.body.appendChild(overlay);

  const stageImg   = overlay.querySelector('.lb-stage img');
  const btnClose   = overlay.querySelector('.lb-close');
  const btnPrev    = overlay.querySelector('.lb-prev');
  const btnNext    = overlay.querySelector('.lb-next');
  const btnPlay    = overlay.querySelector('.lb-play');
  const counterEl  = overlay.querySelector('.lb-counter');
  const dotsEl     = overlay.querySelector('.lb-dots');

  let images = [];
  let index = 0;
  let timer = null;
  const AUTOPLAY_MS = 2500;

  function renderDots(){
    dotsEl.innerHTML = '';
    images.forEach((_, i) => {
      const d = document.createElement('button');
      d.className = 'lb-dot' + (i === index ? ' active' : '');
      d.setAttribute('aria-label', 'Go to image ' + (i + 1));
      d.addEventListener('click', () => show(i));
      dotsEl.appendChild(d);
    });
  }

  function show(i){
    index = (i + images.length) % images.length;
    stageImg.src = images[index].src;
    stageImg.alt = images[index].alt || '';
    counterEl.textContent = (index + 1) + ' / ' + images.length;
    [...dotsEl.children].forEach((d, di) => d.classList.toggle('active', di === index));
  }

  function open(imgList, startIndex){
    images = imgList;
    show(startIndex);
    renderDots();
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function close(){
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    stopAutoplay();
  }

  function next(){ show(index + 1); }
  function prev(){ show(index - 1); }

  function startAutoplay(){
    if (images.length < 2) return;
    timer = setInterval(next, AUTOPLAY_MS);
    btnPlay.classList.add('active');
  }
  function stopAutoplay(){
    clearInterval(timer);
    timer = null;
    btnPlay.classList.remove('active');
  }
  function toggleAutoplay(){
    timer ? stopAutoplay() : startAutoplay();
  }

  btnClose.addEventListener('click', close);
  btnNext.addEventListener('click', () => { stopAutoplay(); next(); });
  btnPrev.addEventListener('click', () => { stopAutoplay(); prev(); });
  btnPlay.addEventListener('click', toggleAutoplay);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

  document.addEventListener('keydown', (e) => {
    if (!overlay.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowRight') { stopAutoplay(); next(); }
    if (e.key === 'ArrowLeft')  { stopAutoplay(); prev(); }
  });

  // hook up every gallery grid + single sys-media images
  document.querySelectorAll('.sys-media-grid, .sys-media').forEach(container => {
    const imgs = [...container.querySelectorAll('img')];
    if (!imgs.length) return;
    imgs.forEach((img, i) => {
      img.style.cursor = 'zoom-in';
      img.addEventListener('click', () => open(imgs, i));
    });
  });
})();
