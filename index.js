
document.addEventListener('DOMContentLoaded', () => {

    // Año en el footer
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // Header con sombra al hacer scroll
    const header = document.getElementById('site-header');
    const onScroll = () => {
        header.classList.toggle('scrolled', window.scrollY > 12);
    };
    
    onScroll();
    window.addEventListener('scroll', onScroll);

    // Menú móvil
    const navToggle = document.getElementById('nav-toggle');
    const mainNav = document.getElementById('main-nav');

    navToggle.addEventListener('click', () => {
        const isOpen = mainNav.classList.toggle('open');
        navToggle.classList.toggle('open', isOpen);
        navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            mainNav.classList.remove('open');
            navToggle.classList.remove('open');
            navToggle.setAttribute('aria-expanded', 'false');
        });
    });

    // Resaltar el enlace activo según la sección visible
    const sections = document.querySelectorAll('main section[id]');
    const navObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
                });
            }
        });
    }, { rootMargin: '-45% 0px -50% 0px' });

    sections.forEach(section => navObserver.observe(section));

    // Animación de aparición al hacer scroll
    const revealEls = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    revealEls.forEach(el => revealObserver.observe(el));
});

(() => {
  'use strict';
  const canvas = document.createElement('canvas');
  canvas.id = 'terrain';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.prepend(canvas);
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const follower = document.createElement('div');
  follower.className = 'cursor-follower';
  follower.setAttribute('aria-hidden', 'true');
  document.body.append(follower);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  let width = 0, height = 0, frame = 0, time = 0, last = 0;
  const mouse = { x: -1000, y: -1000, active: false };
  const cursor = { x: 0, y: 0 };
  function resize() {
    width = innerWidth; height = innerHeight;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (reduced.matches) draw();
  }
  function draw() {
    ctx.clearRect(0, 0, width, height);
    const spacing = width < 700 ? 34 : 27;
    for (let row = -5; row < height / spacing + 6; row++) {
      ctx.beginPath();
      const base = row * spacing;
      for (let x = -20; x <= width + 20; x += 12) {
        const wave = Math.sin(x * .004 + row * .19 + time * .23) * 32
          + Math.sin(x * .0018 - row * .12 - time * .16) * 55;
        const distance = Math.hypot(x - mouse.x, base + wave - mouse.y);
        const influence = mouse.active && !reduced.matches ? Math.exp(-distance * distance / 55000) : 0;
        const y = base + wave + influence * Math.sin(x * .012 + row * .3 + time) * 30;
        if (x === -20) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = row % 5 === 0 ? 'rgba(169,73,67,0.24)' : 'rgba(157,150,145,0.085)';
      ctx.lineWidth = row % 5 === 0 ? 1 : .7;
      ctx.stroke();
    }
    if (mouse.active && !reduced.matches) {
      const glow = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 240);
      glow.addColorStop(0, 'rgba(169,73,67,0.07)'); glow.addColorStop(1, 'rgba(169,73,67,0)');
      ctx.fillStyle = glow; ctx.fillRect(0, 0, width, height);
    }
  }
  function tick(now) {
    frame = 0;
    if (document.hidden || reduced.matches) return;
    const delta = last ? Math.min((now - last) / 1000, .05) : 0;
    last = now; time += delta;
    const ease = 1 - Math.exp(-delta * 18);
    cursor.x += (mouse.x - cursor.x) * ease; cursor.y += (mouse.y - cursor.y) * ease;
    follower.style.transform = `translate3d(${cursor.x - follower.offsetWidth / 2}px, ${cursor.y - follower.offsetHeight / 2}px, 0)`;
    draw(); frame = requestAnimationFrame(tick);
  }
  function sync() {
    cancelAnimationFrame(frame); frame = 0; last = 0;
    if (reduced.matches || !fine.matches) leave();
    draw();
    if (!document.hidden && !reduced.matches) frame = requestAnimationFrame(tick);
  }
  function leave() { mouse.active = false; follower.classList.remove('visible', 'active'); }
  document.addEventListener('pointermove', event => {
    if (!fine.matches || reduced.matches || event.pointerType === 'touch') return;
    if (!mouse.active) { cursor.x = event.clientX; cursor.y = event.clientY; }
    mouse.x = event.clientX; mouse.y = event.clientY; mouse.active = true;
    follower.classList.add('visible');
    follower.classList.toggle('active', Boolean(event.target.closest('a, button, model-viewer')));
  }, { passive: true });
  document.documentElement.addEventListener('pointerleave', leave);
  window.addEventListener('blur', leave);
  window.addEventListener('resize', resize, { passive: true });
  document.addEventListener('visibilitychange', sync);
  reduced.addEventListener('change', sync); fine.addEventListener('change', sync);
  resize(); sync();
})();
