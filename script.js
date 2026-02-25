import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";

// ── TYPEWRITER TITLE ─────────────────────────────────────────────────────────

function initTypewriter() {
  const textEl = document.querySelector(".typewriter-text");
  const cursor = document.querySelector(".typewriter-cursor"); 
  if (!textEl || !cursor) return;

  const FULL_TEXT = "Caio Andrade";
  const CHAR_DELAY = 80;   // ms per character
  const START_DELAY = 600; // ms before starting

  let i = 0;

  function type() {
    if (i <= FULL_TEXT.length) {
      textEl.textContent = FULL_TEXT.slice(0, i);
      i++;
      setTimeout(type, CHAR_DELAY);
    } else {
      // Blink cursor a few times then fade it out
      cursor.classList.add("typewriter-cursor--done");
    }
  }

  setTimeout(type, START_DELAY);
}

// ── SUBTLE BACKGROUND PARTICLES ─────────────────────────────────────────────

function initBackgroundParticles() {
  const wrap = document.getElementById("canvas-wrap");
  if (!wrap) return;

  const W = window.innerWidth;
  const H = window.innerHeight;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(W, H);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  wrap.appendChild(renderer.domElement);
  renderer.domElement.style.position = "absolute";
  renderer.domElement.style.inset = "0";

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 200);
  camera.position.z = 80;

  const COUNT = 120;
  const pos = new Float32Array(COUNT * 3);
  for (let i = 0; i < COUNT; i++) {
    pos[i * 3 + 0] = (Math.random() - 0.5) * 160;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 90;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 60;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));

  const mat = new THREE.PointsMaterial({
    color: 0xc8a96e,
    size: 0.35,
    transparent: true,
    opacity: 0.25,
  });

  scene.add(new THREE.Points(geo, mat));

  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    scene.rotation.y = t * 0.02;
    scene.rotation.x = Math.sin(t * 0.015) * 0.1;
    renderer.render(scene, camera);
  }

  animate();

  window.addEventListener("resize", () => {
    const nW = window.innerWidth;
    const nH = window.innerHeight;
    camera.aspect = nW / nH;
    camera.updateProjectionMatrix();
    renderer.setSize(nW, nH);
  });
}

// ── COPY EMAIL ───────────────────────────────────────────────────────────────

function initCopyEmail() {
  document.querySelectorAll("[data-copy-email]").forEach((btn) => {
    const defaultText = btn.textContent;
    btn.addEventListener("click", () => {
      const email = btn.dataset.copyEmail;
      const copy = navigator.clipboard?.writeText
        ? navigator.clipboard.writeText(email)
        : new Promise((res, rej) => {
            const ta = Object.assign(document.createElement("textarea"), {
              value: email,
              style: "position:fixed;opacity:0",
            });
            document.body.appendChild(ta);
            ta.select();
            document.execCommand("copy") ? res() : rej();
            ta.remove();
          });

      copy
        .then(() => {
          btn.classList.add("copied");
          btn.textContent = "Copiado! ✓";
          setTimeout(() => {
            btn.classList.remove("copied");
            btn.textContent = defaultText;
          }, 2000);
        })
        .catch(() => {
          btn.textContent = "Erro ao copiar";
          setTimeout(() => (btn.textContent = defaultText), 2000);
        });
    });
  });
}

// ── MEDIUM ARTICLES ──────────────────────────────────────────────────────────

function formatDate(str) {
  if (!str) return "";
  const d = new Date(str);
  if (isNaN(d)) return "";
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

function createArticleCard(article) {
  const a = document.createElement("a");
  a.className = "article-card";
  a.href = article.url;
  a.target = "_blank";
  a.rel = "noreferrer";

  const cover = document.createElement("div");
  cover.className = "article-card__cover";
  if (article.coverImage) {
    cover.style.backgroundImage = `url('${article.coverImage}')`;
  }
  const date = document.createElement("span");
  date.className = "article-card__date";
  date.textContent = formatDate(article.publishedAt);
  cover.appendChild(date);

  const body = document.createElement("div");
  body.className = "article-card__body";

  const title = document.createElement("h3");
  title.className = "article-card__title";
  title.textContent = article.title;

  const excerpt = document.createElement("p");
  excerpt.className = "article-card__excerpt";
  excerpt.textContent = article.excerpt;

  const cta = document.createElement("span");
  cta.className = "article-card__cta";
  cta.textContent = "Ler no Medium →";

  body.append(title, excerpt, cta);
  a.append(cover, body);
  return a;
}

function initMedium() {
  const root = document.querySelector("[data-medium-list]");
  if (!root) return;

  fetch("data/medium.json")
    .then((r) => {
      if (!r.ok) throw new Error();
      return r.json();
    })
    .then((articles) => {
      root.innerHTML = "";
      articles.forEach((a) => root.appendChild(createArticleCard(a)));
    })
    .catch(() => {
      root.innerHTML = '<p class="articles__loading">Erro ao carregar artigos.</p>';
    });
}

// ── SCROLL REVEAL ────────────────────────────────────────────────────────────

function initScrollReveal() {
  const els = document.querySelectorAll(".about__text, .stat, .contact__title, .contact__sub");
  els.forEach((el) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(24px)";
    el.style.transition = "opacity 0.7s ease, transform 0.7s ease";
  });

  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.style.opacity = "1";
          e.target.style.transform = "translateY(0)";
          obs.unobserve(e.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  els.forEach((el) => obs.observe(el));
}

// ── INIT ─────────────────────────────────────────────────────────────────────

initBackgroundParticles();
initTypewriter();
initCopyEmail();
initMedium();
initScrollReveal();
