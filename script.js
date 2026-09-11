const works = [
  {
    title: "花のコラージュ",
    image: "/images/works-01.jpg",
    alt: "黒とピンクの幾何学形状を組み合わせたポスターデザイン",
    intent: "カフェに飾れるものを意識し、複数の花の素材を組み合わせて制作しました。このコラージュを横目にゆったりと食事を楽しんでほしいという思いを込めています。",
    size: "small",
    category: "Flower Collage",
    year: "2026",
    tools: ["Photoshop", "Illustrator"]
  },
  {
    title: "Cherry Cute",
    image: "/images/works-02.jpg",
    alt: "ピンクのボトルと果実、植物を組み合わせた広告ビジュアル",
    intent: "フルーツのグラフィックアートというテーマで制作しました。かわいらしい作品に仕上げることを重点に置き、余白を取ることで主役引き立たせることを意識して製作しています。",
    size: "wide",
    category: "Graphic Design",
    year: "2026",
    tools: ["Illustrator"]
  },
  {
    title: "ドーナツショップ",
    image: "/images/works-03.jpg",
    alt: "ドーナツショップのショップカード",
    intent: "架空のドーナツショップ、「ドーナツスパイラル」のショップカードというテーマで制作しました。店名のスパイラル(らせん状)をデザインに取り入れ、ポップで楽しさを感じられるブランドイメージを表現しています。シンプルにすることで見た人に覚えてもらいやすいということも意識しています。",
    size: "small",
    category: "Shop Card",
    year: "2026",
    tools: ["Illustrator"]
  },
  {
    title: "Green Light",
    image: "/images/works-04.jpg",
    alt: "腕に青信号",
    intent: "「止まれない、止まらない毎日」をテーマとして制作しました。信号機を腕時計に見立て、それを表現しています。「Ça ne s'arrêtera pas」はフランス語で止まらないを意味します。",
    size: "small",
    category: "Illustration",
    year: "2026",
    tools: ["Photoshop", "Illustrator"]
  }
];

works.forEach((work) => {
  work.image = work.image.replace(/^\/images\//, "images/");
});

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const mobileQuery = window.matchMedia("(max-width: 767px)");
const compactDesktopQuery = window.matchMedia(
  "(max-width: 767px) and (any-hover: hover) and (any-pointer: fine)"
);
const precisePointer = window.matchMedia("(any-hover: hover) and (any-pointer: fine)");

const hero = document.querySelector(".hero");
const heroCopy = document.querySelector(".hero-copy");
const heroVisual = document.querySelector(".hero-visual");
const track = document.querySelector("#works-track");
const viewport = document.querySelector(".works-viewport");
const worksSection = document.querySelector(".works");
const progressBar = document.querySelector("#works-progress-bar");
const workCursor = document.querySelector(".work-cursor");

let frameRequested = false;
let cardObserver;

function usesNativeWorksScroll() {
  return mobileQuery.matches && !compactDesktopQuery.matches;
}

function renderWorks() {
  const fragment = document.createDocumentFragment();

  works.forEach((work, index) => {
    const number = String(index + 1).padStart(2, "0");
    const article = document.createElement("article");
    article.className = `work-card size-${work.size}`;
    article.innerHTML = `
      <button
        class="work-button"
        type="button"
        data-work-index="${index}"
        aria-label="${work.title}の詳細を見る"
      >
        <span class="work-number">${number}</span>
        <span class="work-image-wrap">
          <img src="${work.image}" alt="${work.alt}" loading="lazy">
          <span class="work-hover-info" aria-hidden="true">
            <strong>${work.title}</strong>
            <span>${work.category} / ${work.year}</span>
          </span>
        </span>
        <span class="work-info">
          <span class="work-title">${work.title}</span>
          <span class="work-meta">${work.category}<br>${work.year}</span>
        </span>
      </button>`;
    fragment.appendChild(article);
  });

  track.appendChild(fragment);
}

function getWorksProgress() {
  const rect = worksSection.getBoundingClientRect();
  const scrollable = worksSection.offsetHeight - window.innerHeight;
  if (scrollable <= 0) return 0;
  return Math.min(1, Math.max(0, -rect.top / scrollable));
}

// 横スクロール
function syncWorksScrollHeight() {
  if (usesNativeWorksScroll() || prefersReducedMotion.matches) {
    worksSection.style.removeProperty("--works-scroll-height");
    return;
  }

  const maxTranslate = Math.max(0, track.scrollWidth - viewport.clientWidth);
  const scrollDistance = Math.max(window.innerHeight * 1.25, maxTranslate * 1.15);
  worksSection.style.setProperty(
    "--works-scroll-height",
    `${Math.ceil(window.innerHeight + scrollDistance)}px`
  );
}

function updateHeroParallax() {
  if (mobileQuery.matches || prefersReducedMotion.matches) {
    heroCopy.style.transform = "";
    heroVisual.style.transform = "";
    return;
  }

  const rect = hero.getBoundingClientRect();
  const progress = Math.min(1, Math.max(0, -rect.top / window.innerHeight));
  heroCopy.style.transform = `translate3d(0, ${progress * -48}px, 0)`;
  heroVisual.style.transform = `translate3d(0, ${progress * -24}px, 0) rotate(${progress * 1.8}deg)`;
}

function updateHorizontalGallery() {
  if (usesNativeWorksScroll() || prefersReducedMotion.matches) return;

  const progress = getWorksProgress();
  const maxTranslate = Math.max(0, track.scrollWidth - viewport.clientWidth);
  track.style.transform = `translate3d(${-maxTranslate * progress}px, 0, 0)`;
  progressBar.style.transform = `scaleX(${progress})`;

  document.querySelectorAll(".work-card").forEach((card, index) => {
    const cardCenter = card.getBoundingClientRect().left + card.offsetWidth / 2;
    const distance = (cardCenter - window.innerWidth / 2) / window.innerWidth;
    const direction = index % 2 === 0 ? 1 : -1;
    const rotation = Math.max(-1.5, Math.min(1.5, distance * direction * 1.5));
    card.style.setProperty("--card-rotation", `${rotation.toFixed(2)}deg`);
  });
}

function updateFrame() {
  frameRequested = false;
  updateHeroParallax();
  updateHorizontalGallery();
}

function requestFrameUpdate() {
  if (frameRequested) return;
  frameRequested = true;
  requestAnimationFrame(updateFrame);
}

function updateTouchProgress() {
  if (!usesNativeWorksScroll() && !prefersReducedMotion.matches) return;
  const maxScroll = viewport.scrollWidth - viewport.clientWidth;
  const progress = maxScroll > 0 ? viewport.scrollLeft / maxScroll : 0;
  progressBar.style.transform = `scaleX(${progress})`;
}

// モーダル
const modal = document.querySelector("#work-modal");
const modalImage = document.querySelector("#modal-image");
const modalTitle = document.querySelector("#modal-title");
const modalMeta = document.querySelector("#modal-meta");
const modalTools = document.querySelector("#modal-tools");
const modalIntent = document.querySelector("#modal-intent");
const modalNumber = document.querySelector("#modal-number");
let lastFocusedElement = null;

function renderModalTitle(title) {
  const parts = title.split("の");
  const fragment = document.createDocumentFragment();

  parts.forEach((part, index) => {
    const hasFollowingPart = index < parts.length - 1;
    fragment.append(document.createTextNode(`${part}${hasFollowingPart ? "の" : ""}`));
    if (hasFollowingPart) fragment.append(document.createElement("wbr"));
  });

  modalTitle.replaceChildren(fragment);
}

function openModal(index) {
  const work = works[index];
  if (!work) return;

  lastFocusedElement = document.activeElement;
  modalImage.src = work.image;
  modalImage.alt = work.alt;
  renderModalTitle(work.title);
  modalMeta.textContent = `${work.category} / ${work.year}`;
  modalTools.textContent = work.tools.join(" / ");
  modalIntent.textContent = work.intent;
  modalNumber.textContent = `${String(index + 1).padStart(2, "0")} / ${String(works.length).padStart(2, "0")}`;
  modal.hidden = false;
  document.body.classList.add("is-modal-open");
  modal.querySelector(".modal-close").focus();
}

function closeModal() {
  if (modal.hidden) return;
  modal.hidden = true;
  document.body.classList.remove("is-modal-open");
  if (lastFocusedElement) lastFocusedElement.focus();
}

track.addEventListener("click", (event) => {
  const button = event.target.closest("[data-work-index]");
  if (button) openModal(Number(button.dataset.workIndex));
});

modal.addEventListener("click", (event) => {
  if (event.target.closest("[data-close-modal]")) closeModal();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !modal.hidden) closeModal();

  if (event.key === "Tab" && !modal.hidden) {
    const focusable = [...modal.querySelectorAll("button, [href], [tabindex]:not([tabindex='-1'])")]
      .filter((element) => !element.disabled);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
});

function setupObservers() {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.14 });

  document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

  cardObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { root: usesNativeWorksScroll() ? viewport : null, threshold: 0.16 });

  document.querySelectorAll(".work-card").forEach((card, index) => {
    card.style.transitionDelay = `${Math.min(index * 45, 180)}ms`;
    cardObserver.observe(card);
  });

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      document.querySelectorAll(".nav-link").forEach((link) => {
        link.classList.toggle("is-active", link.dataset.section === entry.target.id);
      });
    });
  }, { rootMargin: "-42% 0px -48%", threshold: 0 });

  document.querySelectorAll("#top, #profile, #works").forEach((section) => {
    sectionObserver.observe(section);
  });
}

// 作品専用viewカーソル
let pointerX = -100;
let pointerY = -100;
let cursorX = -100;
let cursorY = -100;
let cursorAnimationId = null;

function animateCursor() {
  const easing = prefersReducedMotion.matches ? 1 : 0.16;
  cursorX += (pointerX - cursorX) * easing;
  cursorY += (pointerY - cursorY) * easing;
  workCursor.style.transform = `translate3d(${cursorX - 34}px, ${cursorY - 34}px, 0)`;

  if (workCursor.classList.contains("is-active") && !prefersReducedMotion.matches) {
    cursorAnimationId = requestAnimationFrame(animateCursor);
  } else {
    cursorAnimationId = null;
  }
}

function setupCustomCursor() {
  track.addEventListener("pointermove", (event) => {
    if (!precisePointer.matches) return;
    pointerX = event.clientX;
    pointerY = event.clientY;
    if (prefersReducedMotion.matches) {
      cursorX = pointerX;
      cursorY = pointerY;
      workCursor.style.transform = `translate3d(${cursorX - 34}px, ${cursorY - 34}px, 0)`;
    }
  });

  track.addEventListener("pointerover", (event) => {
    if (!precisePointer.matches || !event.target.closest(".work-button")) return;
    workCursor.classList.add("is-active");
    if (!cursorAnimationId) cursorAnimationId = requestAnimationFrame(animateCursor);
  });

  track.addEventListener("pointerout", (event) => {
    if (!event.target.closest(".work-button")) return;
    const nextCard = event.relatedTarget?.closest?.(".work-button");
    if (nextCard) return;
    workCursor.classList.remove("is-active");
    if (cursorAnimationId) cancelAnimationFrame(cursorAnimationId);
    cursorAnimationId = null;
  });
}

function resetMotionState() {
  heroCopy.style.transform = "";
  heroVisual.style.transform = "";
  track.style.transform = "";
  document.querySelectorAll(".work-card").forEach((card) => {
    card.style.removeProperty("--card-rotation");
  });
  if (!usesNativeWorksScroll()) viewport.scrollLeft = 0;
  syncWorksScrollHeight();
  requestFrameUpdate();
}

function handleResize() {
  syncWorksScrollHeight();
  requestFrameUpdate();
}

renderWorks();
syncWorksScrollHeight();
setupObservers();
setupCustomCursor();

window.addEventListener("scroll", requestFrameUpdate, { passive: true });
window.addEventListener("resize", handleResize);
window.addEventListener("load", handleResize, { once: true });
viewport.addEventListener("scroll", updateTouchProgress, { passive: true });
mobileQuery.addEventListener("change", resetMotionState);
compactDesktopQuery.addEventListener("change", resetMotionState);
prefersReducedMotion.addEventListener("change", resetMotionState);

document.addEventListener("contextmenu", (event) => {
  if (event.target.closest(".hero-art, .work-image-wrap, .modal-media")) {
    event.preventDefault();
  }
});

document.addEventListener("dragstart", (event) => {
  if (event.target.matches("img")) event.preventDefault();
});

requestFrameUpdate();
