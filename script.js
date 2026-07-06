/* ============================================================
   Routinee — Interactions & Animations
   ============================================================ */

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- Mobile menu ---------- */
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");

if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("is-open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });

  document.addEventListener("click", (e) => {
    if (!navLinks.classList.contains("is-open")) return;
    if (navLinks.contains(e.target) || menuToggle.contains(e.target)) return;
    navLinks.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
  });
}

/* ---------- Active nav link ---------- */
(() => {
  const path = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a").forEach((a) => {
    const href = a.getAttribute("href");
    if (href === path || (path === "" && href === "index.html")) {
      a.classList.add("is-active");
    }
  });
})();

/* ---------- Header scroll state + progress bar ---------- */
const header = document.querySelector(".site-header");
const progressBar = document.querySelector(".scroll-progress");

const onScroll = () => {
  if (header) header.classList.toggle("is-scrolled", window.scrollY > 12);
  if (progressBar) {
    const doc = document.documentElement;
    const max = doc.scrollHeight - doc.clientHeight;
    const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
    progressBar.style.width = pct + "%";
  }
};
document.addEventListener("scroll", onScroll, { passive: true });
onScroll();

/* ---------- Scroll reveal ---------- */
const revealTargets = document.querySelectorAll(".reveal, .reveal-scale");
if (revealTargets.length) {
  revealTargets.forEach((el, i) => {
    if (!el.style.getPropertyValue("--delay")) {
      el.style.setProperty("--delay", `${(i % 6) * 70}ms`);
    }
  });

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0, rootMargin: "0px 0px -40px 0px" }
  );
  revealTargets.forEach((item) => revealObserver.observe(item));
}

/* ---------- Cursor glow ---------- */
if (!prefersReducedMotion && matchMedia("(hover: hover)").matches) {
  const glow = document.createElement("div");
  glow.className = "cursor-glow";
  document.body.appendChild(glow);
  let raf = null;
  window.addEventListener("pointermove", (e) => {
    glow.classList.add("is-active");
    if (raf) return;
    raf = requestAnimationFrame(() => {
      glow.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
      raf = null;
    });
  });
  document.addEventListener("mouseleave", () => glow.classList.remove("is-active"));
}

/* ---------- Phone tilt (mousemove parallax) ---------- */
if (!prefersReducedMotion) {
  document.querySelectorAll(".phone-wrap").forEach((wrap) => {
    const phone = wrap.querySelector(".phone");
    if (!phone) return;
    wrap.addEventListener("pointermove", (e) => {
      const rect = wrap.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      phone.style.transform = `rotateY(${x * -18}deg) rotateX(${y * 14}deg)`;
    });
    wrap.addEventListener("pointerleave", () => {
      phone.style.transform = "";
    });
  });
}

/* ---------- Animated counters ---------- */
const counters = document.querySelectorAll("[data-count-to]");
if (counters.length) {
  const countObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseFloat(el.dataset.countTo);
        const suffix = el.dataset.suffix || "";
        const duration = 1400;
        const start = performance.now();
        const decimals = el.dataset.countTo.includes(".") ? 1 : 0;

        const tick = (now) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          const value = target * eased;
          el.textContent = value.toFixed(decimals) + suffix;
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        countObserver.unobserve(el);
      });
    },
    { threshold: 0.4 }
  );
  counters.forEach((c) => countObserver.observe(c));
}

/* ---------- FAQ accordion ---------- */
document.querySelectorAll(".acc-item").forEach((item) => {
  const head = item.querySelector(".acc-head");
  const panel = item.querySelector(".acc-panel");
  if (!head || !panel) return;
  head.addEventListener("click", () => {
    const isOpen = item.classList.contains("is-open");
    item.closest(".accordion")?.querySelectorAll(".acc-item.is-open").forEach((openItem) => {
      if (openItem !== item) {
        openItem.classList.remove("is-open");
        openItem.querySelector(".acc-panel").style.maxHeight = null;
      }
    });
    item.classList.toggle("is-open", !isOpen);
    panel.style.maxHeight = !isOpen ? panel.scrollHeight + "px" : null;
  });
});

/* ---------- FAQ category filter ---------- */
const faqFilterButtons = document.querySelectorAll(".faq-filter button");
if (faqFilterButtons.length) {
  const faqItems = document.querySelectorAll(".acc-item");
  faqFilterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      faqFilterButtons.forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      const cat = btn.dataset.filter;
      faqItems.forEach((item) => {
        const match = cat === "all" || item.dataset.category === cat;
        item.style.display = match ? "" : "none";
      });
    });
  });
}

/* ---------- Help center search filter ---------- */
const helpSearch = document.querySelector("#helpSearch");
if (helpSearch) {
  helpSearch.addEventListener("input", () => {
    const q = helpSearch.value.trim().toLowerCase();
    document.querySelectorAll(".help-list a").forEach((a) => {
      const text = a.textContent.toLowerCase();
      a.style.display = text.includes(q) ? "" : "none";
    });
  });
}
