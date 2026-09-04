/* ============================================================
   IGREJA CAMINHAR — main.js
   Interações leves do interface: menu móvel, header no scroll,
   reveal por Intersection Observer, filtro de mensagens e
   detalhes do rodapé.
   ============================================================ */
(function () {
  "use strict";

  var doc = document;
  var header = doc.getElementById("site-header");
  var toggle = doc.getElementById("nav-toggle");
  var navLinks = doc.getElementById("nav-links");

  /* ---------- Ano do rodapé ---------- */
  var yearEl = doc.getElementById("year");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  /* ---------- Tema claro / escuro ---------- */
  var themeBtn = doc.getElementById("theme-toggle");
  var rootEl = doc.documentElement;

  function currentTheme() {
    return rootEl.getAttribute("data-theme") === "light" ? "light" : "dark";
  }

  function hasStoredTheme() {
    try {
      var t = localStorage.getItem("caminhar-theme");
      return t === "light" || t === "dark";
    } catch (e) {
      return false;
    }
  }

  function applyTheme(theme) {
    rootEl.setAttribute("data-theme", theme);
    if (themeBtn) {
      themeBtn.setAttribute("aria-pressed", theme === "light" ? "true" : "false");
      themeBtn.setAttribute(
        "aria-label",
        theme === "light"
          ? "Alternar para o tema escuro"
          : "Alternar para o tema claro"
      );
      themeBtn.setAttribute(
        "title",
        theme === "light" ? "Ativar tema escuro" : "Ativar tema claro"
      );
    }
  }

  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var next = currentTheme() === "light" ? "dark" : "light";
      applyTheme(next);
      try {
        localStorage.setItem("caminhar-theme", next);
      } catch (e) {}
    });

    if (!hasStoredTheme()) {
      try {
        var mq = window.matchMedia("(prefers-color-scheme: light)");
        var onChange = function (e) {
          if (hasStoredTheme()) return;
          applyTheme(e.matches ? "light" : "dark");
        };
        mq.addEventListener("change", onChange);
      } catch (e) {}
    }
  }
  applyTheme(currentTheme());

  /* ---------- Header ao rolar ---------- */
  function syncHeaderSpace() {
    if (!header) return;
    var h = header.offsetHeight;
    doc.body.style.paddingTop = h + "px";
    doc.body.style.setProperty("--header-total", h + "px");
  }

  function onScroll() {
    if (!header) return;
    if (window.scrollY > 10) {
      header.classList.add("is-scrolled");
    } else {
      header.classList.remove("is-scrolled");
    }
    syncHeaderSpace();
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", syncHeaderSpace);
  onScroll();

  /* ---------- Menu móvel ---------- */
  var backdrop = null;

  function closeMenu() {
    if (!navLinks || !toggle) return;
    navLinks.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Abrir menu");
    doc.documentElement.classList.remove("menu-open");
    if (backdrop) backdrop.classList.remove("is-visible");
  }

  function openMenu() {
    if (!navLinks || !toggle) return;
    if (!backdrop) {
      backdrop = doc.createElement("div");
      backdrop.className = "nav-backdrop";
      backdrop.setAttribute("aria-hidden", "true");
      doc.body.appendChild(backdrop);
      backdrop.addEventListener("click", closeMenu);
    }
    navLinks.classList.add("is-open");
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "Fechar menu");
    doc.documentElement.classList.add("menu-open");
    backdrop.classList.add("is-visible");
  }

  if (toggle && navLinks) {
    toggle.addEventListener("click", function () {
      var expanded = toggle.getAttribute("aria-expanded") === "true";
      expanded ? closeMenu() : openMenu();
    });

    navLinks.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });

    doc.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeMenu();
    });

    var mq = window.matchMedia("(min-width: 1120px)");
    mq.addEventListener("change", function (e) {
      if (e.matches) closeMenu();
    });
  }

  /* ---------- Reveal ao scroll (Intersection Observer) ---------- */
  var revealEls = doc.querySelectorAll("[data-reveal]");

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var delay = entry.target.getAttribute("data-delay");
            if (delay) {
              entry.target.style.transitionDelay = delay + "ms";
            }
            entry.target.classList.add("is-revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    revealEls.forEach(function (el) {
      io.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("is-revealed");
    });
  }

  /* ---------- Filtro de mensagens ---------- */
  var filterBtns = doc.querySelectorAll(".chip-btn[data-filter]");
  var messageCards = doc.querySelectorAll(".message-card[data-category]");

  if (filterBtns.length) {
    filterBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        filterBtns.forEach(function (b) {
          b.classList.remove("is-active");
        });
        btn.classList.add("is-active");

        var filter = btn.getAttribute("data-filter");
        messageCards.forEach(function (card) {
          var cat = card.getAttribute("data-category");
          var show = filter === "all" || cat === filter;
          card.classList.toggle("is-hidden", !show);
        });
      });
    });
  }

  /* ---------- Versículos (API bíblica) ---------- */
  function injectVerse(card, data) {
    var body = card.querySelector(".message-card__body");
    if (!body) return;
    var existing = card.querySelector("[data-verse-block]");
    if (existing) existing.remove();

    var block = doc.createElement("blockquote");
    block.className = "message-card__verse";
    block.setAttribute("data-verse-block", "");

    var quote = doc.createElement("i");
    quote.className = "fa-solid fa-quote-left";
    quote.setAttribute("aria-hidden", "true");

    var text = doc.createElement("span");
    text.className = "message-card__verse-text";
    text.textContent = data.text;

    var cite = doc.createElement("span");
    cite.className = "message-card__verse-ref";
    cite.textContent = "\u2014 " + data.reference;

    block.appendChild(quote);
    block.appendChild(text);
    block.appendChild(cite);
    body.appendChild(block);
    card.setAttribute("data-verse-ready", "true");
  }

  doc.querySelectorAll(".message-card[data-ref]").forEach(function (card) {
    if (card.getAttribute("data-verse-ready") === "true") return;
    var ref = card.getAttribute("data-ref");
    fetch("/api/versiculo?ref=" + encodeURIComponent(ref))
      .then(function (r) {
        return r.json();
      })
      .then(function (json) {
        if (json && json.ok && json.data) injectVerse(card, json.data);
      })
      .catch(function () {});
  });

  /* ---------- Auto-fechar avisos flash ---------- */
  var flashes = doc.querySelectorAll(".flash");
  if (flashes.length) {
    setTimeout(function () {
      flashes.forEach(function (f) {
        f.style.opacity = "0";
        f.style.transform = "translateX(20px)";
        setTimeout(function () {
          f.remove();
        }, 400);
      });
    }, 6000);
  }

  /* ---------- Splash de abertura (estilo app) ---------- */
  var splash = doc.getElementById("app-splash");
  if (splash) {
    var splashStart = Date.now();
    var reduceMotion = false;
    try {
      reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch (e) {}

    var hideSplash = function () {
      if (reduceMotion) {
        splash.remove();
        return;
      }
      var elapsed = Date.now() - splashStart;
      setTimeout(function () {
        splash.classList.add("is-hidden");
        setTimeout(function () {
          if (splash.parentNode) splash.parentNode.removeChild(splash);
        }, 450);
      }, Math.max(0, 650 - elapsed));
    };

    if (doc.readyState === "complete") hideSplash();
    else window.addEventListener("load", hideSplash);
    setTimeout(hideSplash, 2600);
  }

  /* ---------- Service Worker (PWA instalável) ---------- */
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("/sw.js").catch(function () {});
    });
  }
})();