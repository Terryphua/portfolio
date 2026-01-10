// script.js
// - Navigation: smooth scroll with sticky-nav offset + mobile dropdown
// - UI: theme picker + scroll reveal + hero word reveal
// - Background: animated network canvas
// Tip: search for 'EDIT HERE' comments to customize.

// NOTE: You hit “Unexpected token }” because a leftover event-listener fragment introduced an extra brace.
// This script is rewritten cleanly (same features), with balanced braces.

const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const root = document.documentElement;

// Footer year
const yearEl = document.getElementById('y');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// --- Mobile nav toggle ---
const siteNav = document.getElementById('siteNav');

// Make sticky nav more visible after a tiny scroll (prevents "nav disappears" on light sections)
function updateNavChrome(){
  if (!siteNav) return;
  siteNav.classList.toggle('scrolled', window.scrollY > 8);
}
window.addEventListener('scroll', updateNavChrome, { passive:true });
updateNavChrome();

// --- Smooth scroll with sticky-nav offset (fixes Experience not landing correctly) ---
function scrollToHash(hash){
  const id = (hash || '').replace('#','');
  const target = document.getElementById(id);
  if (!target) return;
  const navH = siteNav ? siteNav.getBoundingClientRect().height : 0;
  const y = target.getBoundingClientRect().top + window.pageYOffset - navH - 12;
  window.scrollTo({ top: y, behavior: prefersReduced ? 'auto' : 'smooth' });
}

// Intercept in-page nav clicks so all sections land correctly.
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', (e) => {
    const href = a.getAttribute('href');
    if (!href || href === '#') return;
    // Only handle same-page anchors
    if (href.startsWith('#')){
      const exists = document.getElementById(href.slice(1));
      if (exists){
        e.preventDefault();
        scrollToHash(href);
      }
    }
  });
});
const navToggle = document.querySelector('.nav-toggle');
const primaryNav = document.getElementById('primaryNav');

if (navToggle && siteNav && primaryNav){
  navToggle.addEventListener('click', () => {
    const open = siteNav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(open));
  });

  // Close menu when clicking a link
  primaryNav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      siteNav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!siteNav.contains(e.target)){
      siteNav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });
}

// --- Accent palettes ---
// EDIT HERE: theme palette colors
const palettes = {
  forest: { accent:'#0f766e' },
  ink:    { accent:'#111827' },
  indigo: { accent:'#4f46e5' },
  clay:   { accent:'#b45309' },
};

function applyTheme(key){
  const p = palettes[key] || palettes.forest;
  root.style.setProperty('--accent', p.accent);
  document.querySelectorAll('.palette-btn .swatch').forEach(s => s.style.background = p.accent);

  // quick visual feedback
  document.querySelector('.palette-btn')?.classList.add('active');
  setTimeout(() => document.querySelector('.palette-btn')?.classList.remove('active'), 450);

  localStorage.setItem('portfolio_theme', key);
}

const savedTheme = localStorage.getItem('portfolio_theme');
if (savedTheme) applyTheme(savedTheme);
else applyTheme('indigo');

const pop = document.querySelector('.palette-pop');
const paletteBtn = document.querySelector('.palette-btn');

if (paletteBtn && pop){
  paletteBtn.addEventListener('click', () => {
    const open = pop.classList.toggle('open');
    paletteBtn.setAttribute('aria-expanded', String(open));
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.palette')){
      pop.classList.remove('open');
      paletteBtn.setAttribute('aria-expanded', 'false');
    }
  });

  pop.querySelectorAll('[data-theme]').forEach(b => {
    b.addEventListener('click', () => {
      applyTheme(b.getAttribute('data-theme'));
      pop.classList.remove('open');
      paletteBtn.setAttribute('aria-expanded', 'false');
    });
  });
}

// --- Hero word animation ---
function setupHeroWordReveal(){
  const el = document.getElementById('heroTitle');
  if (!el || prefersReduced) return;

  // Extract words while keeping <br>
  const tokens = [];
  for (const node of Array.from(el.childNodes)){
    if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'BR') tokens.push({br:true});
    if (node.nodeType === Node.TEXT_NODE){
      node.textContent.split(' ').filter(Boolean).forEach(t => tokens.push({text:t}));
    }
  }

  const spans = [];
  el.innerHTML = '';
  const frag = document.createDocumentFragment();

  for (const t of tokens){
    if (t.br){ frag.appendChild(document.createElement('br')); continue; }
    const s = document.createElement('span');
    s.className = 'word';
    s.textContent = t.text + ' ';
    spans.push(s);
    frag.appendChild(s);
  }

  el.appendChild(frag);

  const stagger = 70;
  spans.forEach((s, i) => s.style.transitionDelay = (i * stagger) + 'ms');

  const kick = () => {
    if (el.dataset.wordsPlayed === '1') return;
    el.dataset.wordsPlayed = '1';
    requestAnimationFrame(() => setTimeout(() => spans.forEach(s => s.classList.add('show')), 40));
  };

  if ('IntersectionObserver' in window){
    const io = new IntersectionObserver((entries) => {
      if (entries.some(e => e.isIntersecting)){
        kick();
        io.disconnect();
      }
    }, { threshold: 0.35 });
    io.observe(el);
  }

  // fallback
  setTimeout(kick, 350);
}
setupHeroWordReveal();

// --- Scroll reveal ---
if (!prefersReduced && 'IntersectionObserver' in window){
  const els = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    for (const e of entries){
      if (e.isIntersecting){
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    }
  }, { threshold: 0.12, rootMargin: '0px 0px -10% 0px' });

  els.forEach(el => io.observe(el));
} else {
  document.querySelectorAll('.reveal').forEach(el => el.classList.add('in'));
}

// --- Active nav highlight (robust scrollspy) ---
const navLinks = Array.from(document.querySelectorAll('[data-nav]'));
const spySections = navLinks
  .map(a => document.getElementById(a.getAttribute('href').slice(1)))
  .filter(Boolean);

function setActive(id){
  navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${id}`));
}

let spyTick = false;
function updateScrollSpy(){
  if (!siteNav || spySections.length === 0) return;

  // If we're near the bottom of the page, always mark the last section as active (fixes Contact).
  const doc = document.documentElement;
  const nearBottom = (window.scrollY + window.innerHeight) >= (doc.scrollHeight - 8);
  if (nearBottom){
    setActive(spySections[spySections.length - 1].id);
    return;
  }

  const navH = siteNav.getBoundingClientRect().height;
  const marker = navH + 60; // a little below the sticky nav

  // Find the last section whose top is above the marker.
  let current = spySections[0].id;
  for (const sec of spySections){
    const top = sec.getBoundingClientRect().top;
    if (top <= marker) current = sec.id;
  }
  setActive(current);
}

window.addEventListener('scroll', () => {
  if (spyTick) return;
  spyTick = true;
  requestAnimationFrame(() => {
    updateScrollSpy();
    spyTick = false;
  });
}, { passive:true });
window.addEventListener('resize', updateScrollSpy);
updateScrollSpy();

// --- Controlled parallax (hero-only feel) ---
let parallaxTick = false;
function clamp(n, min, max){ return Math.max(min, Math.min(max, n)); }
function parallaxUpdate(){
  const y = window.scrollY;
  const fade = clamp(1 - (y / 900), 0, 1);

  document.querySelectorAll('[data-parallax]').forEach(el => {
    const speed = parseFloat(el.getAttribute('data-parallax') || '0');
    const r = el.getBoundingClientRect();
    const inRange = r.top < window.innerHeight * 0.55;

    const maxShift = 18;
    const raw = (-y * speed) * fade;
    const shift = inRange ? clamp(raw, -maxShift, maxShift) : 0;

    el.style.transform = `translateY(${shift.toFixed(2)}px)`;
  });
}

window.addEventListener('scroll', () => {
  if (parallaxTick) return;
  parallaxTick = true;
  requestAnimationFrame(() => {
    parallaxUpdate();
    parallaxTick = false;
  });
}, { passive:true });

// --- Back to top ---
const toTop = document.getElementById('toTop');
if (toTop){
  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) toTop.classList.add('show');
    else toTop.classList.remove('show');
  }, { passive:true });

  toTop.addEventListener('click', () => {
    window.scrollTo({ top:0, behavior:'smooth' });
  });
}

// --- Network background (canvas) ---
const canvas = document.getElementById('net');
const ctx = canvas.getContext('2d', { alpha:true });
let w=0, h=0, dpr=1;
let points=[];
let mouse={x:0, y:0, active:false};
let lastT=0;

// EDIT HERE: background network settings
const net = {
  density: 0.00009,
  maxDist: 150,
  speed: 0.28,
  dot: 1.1,
  line: 0.9,
};

function resize(){
  dpr = Math.min(2, window.devicePixelRatio || 1);
  w = canvas.width  = Math.floor(window.innerWidth * dpr);
  h = canvas.height = Math.floor(window.innerHeight * dpr);
  canvas.style.width = window.innerWidth + 'px';
  canvas.style.height = window.innerHeight + 'px';

  const count = Math.max(50, Math.floor((window.innerWidth * window.innerHeight) * net.density));
  points = Array.from({length:count}, () => ({
    x: Math.random()*w,
    y: Math.random()*h,
    vx: (Math.random()*2-1) * net.speed * dpr,
    vy: (Math.random()*2-1) * net.speed * dpr,
  }));
}

function getAccentRGBA(alpha){
  const c = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#0f766e';
  const hex = c.replace('#','');
  const v = hex.length === 3 ? hex.split('').map(s=>s+s).join('') : hex;
  const r = parseInt(v.slice(0,2),16);
  const g = parseInt(v.slice(2,4),16);
  const b = parseInt(v.slice(4,6),16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function draw(t){
  if (prefersReduced){ ctx.clearRect(0,0,w,h); return; }
  lastT = t;
  ctx.clearRect(0,0,w,h);

  // subtle scroll-driven drift
  const doc = document.documentElement;
  const max = (doc.scrollHeight - doc.clientHeight) || 1;
  const s = Math.min(1, Math.max(0, window.scrollY / max));
  const scrollDx = Math.sin(s*Math.PI*2) * 0.22 * dpr;
  const scrollDy = (s-0.5) * 0.40 * dpr;

  for (const p of points){
    p.x += p.vx + scrollDx;
    p.y += p.vy + scrollDy;
    if (p.x < -20*dpr) p.x = w + 20*dpr;
    if (p.x > w + 20*dpr) p.x = -20*dpr;
    if (p.y < -20*dpr) p.y = h + 20*dpr;
    if (p.y > h + 20*dpr) p.y = -20*dpr;
  }

  ctx.lineWidth = net.line * dpr;
  for (let i=0; i<points.length; i++){
    const a = points[i];
    for (let j=i+1; j<points.length; j++){
      const b = points[j];
      const dist = Math.hypot(a.x-b.x, a.y-b.y);
      if (dist < net.maxDist*dpr){
        const alpha = 1 - (dist/(net.maxDist*dpr));
        ctx.strokeStyle = getAccentRGBA(0.18 * alpha);
        ctx.beginPath();
        ctx.moveTo(a.x,a.y);
        ctx.lineTo(b.x,b.y);
        ctx.stroke();
      }
    }

    if (mouse.active){
      const dist = Math.hypot(a.x - mouse.x*dpr, a.y - mouse.y*dpr);
      if (dist < (net.maxDist*1.2)*dpr){
        const alpha = 1 - dist/((net.maxDist*1.2)*dpr);
        ctx.strokeStyle = getAccentRGBA(0.22 * alpha);
        ctx.beginPath();
        ctx.moveTo(a.x,a.y);
        ctx.lineTo(mouse.x*dpr, mouse.y*dpr);
        ctx.stroke();
      }
    }
  }

  ctx.fillStyle = getAccentRGBA(0.35);
  for (const p of points){
    ctx.beginPath();
    ctx.arc(p.x, p.y, net.dot*dpr, 0, Math.PI*2);
    ctx.fill();
  }

  // soft darken layer
  ctx.fillStyle = 'rgba(15,23,42,0.06)';
  ctx.globalCompositeOperation = 'multiply';
  ctx.fillRect(0,0,w,h);
  ctx.globalCompositeOperation = 'source-over';

  requestAnimationFrame(draw);
}

window.addEventListener('pointermove', (e) => {
  mouse.x = e.clientX; mouse.y = e.clientY; mouse.active = true;
}, { passive:true });
window.addEventListener('pointerleave', () => { mouse.active = false; }, { passive:true });

resize();
window.addEventListener('resize', resize);
parallaxUpdate();
requestAnimationFrame(draw);