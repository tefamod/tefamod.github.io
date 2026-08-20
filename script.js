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
