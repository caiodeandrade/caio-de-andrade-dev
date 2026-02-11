import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  50,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.set(0, 0, 4);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.querySelector(".canvas-wrap").appendChild(renderer.domElement);

const mainLight = new THREE.PointLight(0x64bdfb, 1.6, 12);
mainLight.position.set(2, 2, 3);
scene.add(mainLight);

const fillLight = new THREE.PointLight(0x1f2240, 0.7, 10);
fillLight.position.set(-3, -2, 2);
scene.add(fillLight);

scene.add(new THREE.AmbientLight(0xffffff, 1));

const particleCount = 200;
const positions = new Float32Array(particleCount * 3);
for (let i = 0; i < particleCount; i++) {
  const radius = 1.5 + Math.random() * 1.2;
  const angle = Math.random() * Math.PI * 2;
  const height = (Math.random() - 0.5) * 0.6;
  positions[i * 3 + 0] = Math.cos(angle) * radius;
  positions[i * 3 + 1] = height;
  positions[i * 3 + 2] = Math.sin(angle) * radius;
}

const particleGeometry = new THREE.BufferGeometry();
particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
const particleMaterial = new THREE.PointsMaterial({
  color: 0x79bdfd,
  size: 0.02,
  transparent: true,
  opacity: 0.8,
});
const particleField = new THREE.Points(particleGeometry, particleMaterial);
scene.add(particleField);

const orbGroup = new THREE.Group();
const ringMaterial = new THREE.MeshStandardMaterial({
  color: 0x64bdfb,
  emissive: 0x0e1f41,
  transparent: true,
  opacity: 0.65,
});

for (let i = 0; i < 3; i++) {
  const torus = new THREE.Mesh(
    new THREE.TorusGeometry(1.2 + i * 0.25, 0.014, 12, 120),
    ringMaterial
  );
  torus.rotation.x = Math.PI / 2;
  torus.rotation.y = (Math.PI / 6) * i;
  orbGroup.add(torus);
}

scene.add(orbGroup);

const coreMaterial = new THREE.MeshStandardMaterial({
  color: 0x101426,
  emissive: 0x64bdfb,
  emissiveIntensity: 0.4,
  metalness: 0.3,
  roughness: 0.35,
});
const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.6, 2), coreMaterial);
scene.add(core);

const glowMaterial = new THREE.MeshBasicMaterial({
  color: 0x64bdfb,
  transparent: true,
  opacity: 0.2,
});
const glow = new THREE.Mesh(new THREE.IcosahedronGeometry(0.95, 1), glowMaterial);
scene.add(glow);

const pointer = new THREE.Vector2();
window.addEventListener("pointermove", (event) => {
  pointer.x = (event.clientX / window.innerWidth - 0.5) * 2;
  pointer.y = -(event.clientY / window.innerHeight - 0.5) * 2;
});

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const time = clock.getElapsedTime();

  orbGroup.rotation.x = time * 0.2;
  orbGroup.rotation.y = time * 0.3;

  particleField.rotation.y = time * 0.05;
  particleField.rotation.x = Math.sin(time * 0.2) * 0.1;

  core.rotation.y = time * 0.4;
  glow.rotation.y = time * 0.4;

  core.position.x += (pointer.x * 0.2 - core.position.x) * 0.08;
  core.position.y += (pointer.y * 0.15 - core.position.y) * 0.08;
  glow.position.copy(core.position);

  particleField.position.x = Math.sin(time * 0.15) * 0.15;

  mainLight.position.x = pointer.x * 2;
  mainLight.position.y = pointer.y * 2 + 1;

  renderer.render(scene, camera);
}

animate();

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

const copyText = (value) => {
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(value);
  }

  return new Promise((resolve, reject) => {
    const textarea = document.createElement("textarea");
    textarea.value = value;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    textarea.setAttribute("readonly", "");
    document.body.appendChild(textarea);
    textarea.select();
    textarea.setSelectionRange(0, value.length);
    const successful = document.execCommand("copy");
    document.body.removeChild(textarea);
    successful ? resolve() : reject(new Error("copy failed"));
  });
};

document.querySelectorAll("[data-copy-email]").forEach((button) => {
  const defaultText = button.textContent;
  button.addEventListener("click", () => {
    const email = button.dataset.copyEmail;
    copyText(email)
      .then(() => {
        button.classList.add("copied");
        button.textContent = "Copiado!";
        setTimeout(() => {
          button.classList.remove("copied");
          button.textContent = defaultText;
        }, 1800);
      })
      .catch(() => {
        button.textContent = "Erro ao copiar";
        setTimeout(() => (button.textContent = defaultText), 1800);
      });
  });
});

const mediumRoot = document.querySelector("[data-medium-list]");
if (mediumRoot) {
  fetch("data/medium.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Falha no carregamento");
      }
      return response.json();
    })
    .then((articles) => {
      mediumRoot.innerHTML = "";
      articles.forEach((article, index) => {
        mediumRoot.appendChild(createMediumCard(article, index));
      });
    })
    .catch(() => {
      mediumRoot.innerHTML = '<div class="medium-grid__loading">Erro ao carregar artigos.</div>';
    });
}

function createMediumCard(article, index) {
  const card = document.createElement("article");
  card.className = "medium-card";
  card.style.animationDelay = `${index * 80}ms`;

  const cover = document.createElement("div");
  cover.className = "medium-card__cover";
  if (article.coverImage) {
    cover.style.backgroundImage = `linear-gradient(180deg, rgba(3, 3, 9, 0.1), rgba(3, 3, 9, 0.8)), url('${article.coverImage}')`;
  }
  const badge = document.createElement("span");
  badge.className = "medium-card__badge";
  badge.textContent = formatDateBadge(article.publishedAt);
  cover.appendChild(badge);

  const body = document.createElement("div");
  body.className = "medium-card__body";

  const title = document.createElement("h3");
  title.className = "medium-card__title";
  const titleLink = document.createElement("a");
  titleLink.href = article.url;
  titleLink.target = "_blank";
  titleLink.rel = "noreferrer";
  titleLink.textContent = article.title;
  title.appendChild(titleLink);

  const excerpt = document.createElement("p");
  excerpt.className = "medium-card__excerpt";
  excerpt.textContent = article.excerpt;

  const readMore = document.createElement("a");
  readMore.className = "medium-card__link";
  readMore.href = article.url;
  readMore.target = "_blank";
  readMore.rel = "noreferrer";
  readMore.textContent = "Ler no Medium →";

  body.append(title, excerpt, readMore);
  card.append(cover, body);
  return card;
}

function formatDateBadge(dateString) {
  if (!dateString) return "Medium";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "Medium";
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}
