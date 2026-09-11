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

    var mq = window.matchMedia("(min-width: 1280px)");
    mq.addEventListener("change", function (e) {
      if (e.matches) closeMenu();
    });
  }

  /* ---------- Hero em loop (crossfade) ---------- */
  (function () {
    var slides = [].slice.call(doc.querySelectorAll(".hero__slide"));
    if (slides.length < 2) return;

    var index = 0;
    var interval = 6000;
    var reduceMotion = false;
    try {
      reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch (e) {}

    function goTo(n) {
      index = (n + slides.length) % slides.length;
      slides.forEach(function (s, i) {
        s.classList.toggle("is-active", i === index);
      });
    }

    if (reduceMotion) {
      return; // mostra apenas a primeira foto
    }

    var timer = setInterval(function () {
      goTo(index + 1);
    }, interval);

    // pausa quando a aba está oculta
    doc.addEventListener("visibilitychange", function () {
      if (doc.hidden) {
        clearInterval(timer);
        timer = null;
      } else if (!timer) {
        timer = setInterval(function () {
          goTo(index + 1);
        }, interval);
      }
    });
  })();

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

  /* ---------- Compartilhar versículo do dia (imagem com logo) ---------- */
  (function () {
    var shareBtn = doc.getElementById("share-verse");
    var verseText = doc.getElementById("verse-of-day-text");
    var verseRef = doc.getElementById("verse-of-day-ref");
    if (!shareBtn || !verseText || !verseRef) return;

    var IMG_W = 1080;
    var IMG_H = 1350;
    var PAD = 90;
    var LOGO_PATH = "/static/images/logo-caminhar-white.png";
    var LOGO_SIZE = 150;
    var FONT = "Roboto, 'Segoe UI', system-ui, sans-serif";

    function wrapLines(ctx, text, maxWidth) {
      var words = text.split(/\s+/);
      var lines = [];
      var current = "";
      for (var i = 0; i < words.length; i++) {
        var candidate = current ? current + " " + words[i] : words[i];
        if (ctx.measureText(candidate).width <= maxWidth || !current) {
          current = candidate;
        } else {
          lines.push(current);
          current = words[i];
        }
      }
      if (current) lines.push(current);
      return lines;
    }

    function loadLogo() {
      return new Promise(function (resolve, reject) {
        var img = new Image();
        img.onload = function () {
          resolve(img);
        };
        img.onerror = reject;
        img.src = LOGO_PATH;
      });
    }

    function buildImage(text, reference, logoImg) {
      var canvas = doc.createElement("canvas");
      canvas.width = IMG_W;
      canvas.height = IMG_H;
      var ctx = canvas.getContext("2d");
      var cx = IMG_W / 2;

      // fundo em gradiente (identidade escura da marca)
      var bg = ctx.createLinearGradient(0, 0, IMG_W, IMG_H);
      bg.addColorStop(0, "#0a0a0c");
      bg.addColorStop(1, "#1b1b20");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, IMG_W, IMG_H);

      // brilho suave no topo
      var glow = ctx.createRadialGradient(cx, -80, 0, cx, 0, 900);
      glow.addColorStop(0, "rgba(233, 234, 236, 0.10)");
      glow.addColorStop(1, "rgba(233, 234, 236, 0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, IMG_W, IMG_H);

      // moldura interna
      ctx.strokeStyle = "rgba(255, 255, 255, 0.14)";
      ctx.lineWidth = 3;
      ctx.strokeRect(
        PAD - 24,
        PAD - 24,
        IMG_W - (PAD - 24) * 2,
        IMG_H - (PAD - 24) * 2
      );

      // logo
      ctx.drawImage(logoImg, cx - LOGO_SIZE / 2, 150, LOGO_SIZE, LOGO_SIZE);

      // nome da igreja
      ctx.textAlign = "center";
      ctx.textBaseline = "alphabetic";
      ctx.fillStyle = "#e9eaec";
      ctx.font = "700 56px " + FONT;
      ctx.letterSpacing = "14px";
      ctx.fillText("IGREJA CAMINHAR", cx, 360);
      ctx.letterSpacing = "0px";

      // slogan
      ctx.fillStyle = "#a6a8ae";
      ctx.font = "500 28px " + FONT;
      ctx.fillText("Andando juntos com propósito", cx, 404);

      // divisor
      ctx.strokeStyle = "rgba(233, 234, 236, 0.25)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx - 60, 480);
      ctx.lineTo(cx + 60, 480);
      ctx.stroke();

      // rótulo
      ctx.fillStyle = "#7a7c84";
      ctx.font = "700 32px " + FONT;
      ctx.letterSpacing = "9px";
      ctx.fillText("VERSÍCULO DO DIA", cx, 560);
      ctx.letterSpacing = "0px";

      // texto do versículo (com quebra de linha)
      var maxTextWidth = IMG_W - PAD * 2;
      var fontSize = text.length > 190 ? 40 : 46;
      var lineHeight = Math.round(fontSize * 1.6);
      ctx.fillStyle = "#f2f2f4";
      ctx.font = "500 " + fontSize + "px " + FONT;
      var lines = wrapLines(ctx, text, maxTextWidth);
      if (lines.length > 9) {
        lines = lines.slice(0, 9);
        lines[lines.length - 1] = lines[lines.length - 1] + "...";
      }
      var y = 650;
      for (var i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i], cx, y);
        y += lineHeight;
      }
      y += 40;

      // referência
      ctx.fillStyle = "#e9eaec";
      ctx.font = "700 42px " + FONT;
      ctx.fillText("\u2014 " + reference, cx, y);

      // rodapé
      ctx.fillStyle = "#7a7c84";
      ctx.font = "500 26px " + FONT;
      ctx.fillText("Igreja Caminhar · Versículo do dia", cx, IMG_H - 70);

      return canvas;
    }

    function canvasToBlob(canvas) {
      return new Promise(function (resolve, reject) {
        canvas.toBlob(function (blob) {
          if (blob) resolve(blob);
          else reject(new Error("Não foi possível gerar a imagem."));
        }, "image/png");
      });
    }

    function triggerDownload(blob) {
      var url = URL.createObjectURL(blob);
      var a = doc.createElement("a");
      a.href = url;
      a.download = "versiculo-do-dia.png";
      doc.body.appendChild(a);
      a.click();
      doc.body.removeChild(a);
      setTimeout(function () {
        URL.revokeObjectURL(url);
      }, 1000);
    }

    function fallbackShare(text, reference) {
      var shareText =
        "\u201C" + text + "\u201D \u2014 " + reference + " · Igreja Caminhar";
      if (navigator.share) {
        return navigator
          .share({ title: "Versículo do dia — Igreja Caminhar", text: shareText })
          .catch(function () {});
      }
      if (navigator.clipboard) {
        navigator.clipboard.writeText(shareText).catch(function () {});
      }
      return Promise.resolve();
    }

    shareBtn.addEventListener("click", function () {
      var text = verseText.textContent.trim();
      var reference = verseRef.textContent.trim();
      if (!text) return;

      shareBtn.disabled = true;

      var fontsReady =
        doc.fonts && doc.fonts.ready ? doc.fonts.ready : Promise.resolve();

      fontsReady
        .catch(function () {
          return null;
        })
        .then(function () {
          return loadLogo();
        })
        .then(function (logoImg) {
          return canvasToBlob(buildImage(text, reference, logoImg));
        })
        .then(function (blob) {
          var file = new File([blob], "versiculo-do-dia.png", {
            type: "image/png",
          });
          var canShareFiles = false;
          try {
            canShareFiles =
              navigator.canShare && navigator.canShare({ files: [file] });
          } catch (e) {}
          if (canShareFiles && navigator.share) {
            return navigator.share({
              title: "Versículo do dia — Igreja Caminhar",
              text: "\u201C" + text + "\u201D \u2014 " + reference,
              files: [file],
            });
          }
          triggerDownload(blob);
          return null;
        })
        .catch(function (err) {
          if (err && err.name === "AbortError") return; // usuário cancelou
          return fallbackShare(text, reference);
        })
        .then(function () {
          shareBtn.disabled = false;
        });
    });
  })();

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

  /* ---------- Notificações push (lembretes de cultos e eventos) ---------- */
  (function () {
    var modal = doc.getElementById("notify-modal");
    if (!modal) return; // componente não presente na página

    var statusEl = doc.getElementById("notify-status");
    var activateBtn = doc.getElementById("notify-activate");
    var disableBtn = doc.getElementById("notify-disable");
    var servicesCheck = doc.getElementById("notify-services");
    var eventsCheck = doc.getElementById("notify-events");
    var upcomingEl = doc.getElementById("notify-upcoming");
    var openTriggers = doc.querySelectorAll("[data-notify-open]");

    var vapidKey = null;
    var swReg = null;
    var isSubscribed = false;
    var promptEvent = null;
    var isInstalled = false;
    try {
      isInstalled = localStorage.getItem("caminhar-app-installed") === "1";
    } catch (e) {}
    if (!isInstalled) {
      try {
        isInstalled =
          window.matchMedia && window.matchMedia("(display-mode: standalone)").matches;
      } catch (e2) {}
    }

    function setStatus(text, ok) {
      if (!statusEl) return;
      statusEl.textContent = text || "";
      statusEl.classList.toggle("is-ok", !!ok);
      statusEl.classList.toggle("is-error", text && !ok);
    }

    function urlBase64ToUint8Array(base64String) {
      var padding = "=".repeat((4 - (base64String.length % 4)) % 4);
      var base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
      var raw = window.atob(base64);
      var output = new Uint8Array(raw.length);
      for (var i = 0; i < raw.length; i++) {
        output[i] = raw.charCodeAt(i);
      }
      return output;
    }

    function loadConfig() {
      return fetch("/api/notifications/config", { cache: "no-store" })
        .then(function (r) {
          return r.json();
        })
        .catch(function () {
          return null;
        });
    }

    function renderUpcoming(list) {
      if (!upcomingEl || !list || !list.length) return;
      upcomingEl.innerHTML = "";
      list.forEach(function (item) {
        var li = doc.createElement("li");
        var when = new Date(item.when);
        var label =
          when.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short" }) +
          " às " +
          when.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
        li.textContent = item.title + " — " + label;
        upcomingEl.appendChild(li);
      });
    }

    function showModal() {
      modal.hidden = false;
      setStatus("");
      if (!("Notification" in window)) {
        setStatus("Seu navegador não suporta notificações.", false);
        return;
      }
      if (Notification.permission === "granted") {
        setStatus("Você já autorizou as notificações. Aperte o botão para confirmar os lembretes.", true);
      } else if (Notification.permission === "denied") {
        setStatus("As notificações estão bloqueadas no navegador. Libere nas configurações do site.", false);
      }
    }

    function closeModal() {
      modal.hidden = true;
    }

    function getSubscriptions(reg) {
      return reg.pushManager.getSubscription();
    }

    function persistState() {
      try {
        localStorage.setItem("caminhar-notif-enabled", isSubscribed ? "1" : "0");
      } catch (e) {}
    }

    function refreshButtons() {
      if (activateBtn) activateBtn.hidden = isSubscribed;
      if (disableBtn) disableBtn.hidden = !isSubscribed;
    }

    function sendTest() {
      if (!isSubscribed) {
        setStatus("Ative primeiro as notificações para enviar o teste.", false);
        return;
      }
      setStatus("Enviando notificação de teste...");
      fetch("/api/notifications/test", { method: "POST" })
        .then(function (r) {
          return r.json().then(function (json) {
            return { ok: r.ok, json: json };
          });
        })
        .then(function (res) {
          if (res.ok) {
            setStatus("Teste enviado! Confira a notificação no seu dispositivo.", true);
          } else {
            setStatus(res.json.error || "Falha ao enviar o teste.", false);
          }
        })
        .catch(function () {
          setStatus("Não foi possível enviar o teste.", false);
        });
    }

    function subscribe() {
      setStatus("");
      if (!("Notification" in window)) {
        setStatus("Seu navegador não suporta notificações.", false);
        return;
      }
      if (vapidKey) {
        // grava a chave pública para o SW usar em caso de nova inscrição
        try {
          sessionStorage.setItem("caminhar-vapid", vapidKey);
        } catch (e) {}
      }
      void activateNotifications();
    }

    function activateNotifications() {
      return Notification.requestPermission()
        .then(function (permission) {
          if (permission !== "granted") {
            setStatus("Permissão negada. Não será possível enviar lembretes.", false);
            return;
          }
          return navigator.serviceWorker.ready
            .then(function (reg) {
              swReg = reg;
              return reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(vapidKey),
              });
            })
            .then(function (sub) {
              var reminders = {
                services: servicesCheck ? servicesCheck.checked : true,
                events: eventsCheck ? eventsCheck.checked : true,
              };
              return fetch("/api/notifications/subscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  subscription: sub.toJSON(),
                  reminders: reminders,
                }),
              });
            })
            .then(function (r) {
              if (!r.ok) throw new Error("subscribe-failed");
              isSubscribed = true;
              persistState();
              refreshButtons();
              setStatus(
                isInstalled
                  ? "Notificações ativadas! Enviando um teste agora para você..."
                  : "Pronto! Você receberá lembretes dos cultos e eventos.",
                true
              );
              // Envia um teste automático apenas para quem instalou o webapp
              if (isInstalled) {
                setTimeout(function () {
                  sendTest();
                }, 700);
              }
              return null;
            });
        })
        .catch(function () {
          setStatus("Não foi possível ativar as notificações agora. Tente novamente.", false);
        });
    }

    function unsubscribe() {
      return getSubscriptions(swReg)
        .then(function (sub) {
          if (!sub) return;
          return fetch("/api/notifications/unsubscribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ endpoint: sub.endpoint }),
          });
        })
        .then(function () {
          return swReg.pushManager.getSubscription().then(function (sub) {
            return sub ? sub.unsubscribe() : null;
          });
        })
        .then(function () {
          isSubscribed = false;
          persistState();
          refreshButtons();
          setStatus("Lembretes desativados.", true);
        })
        .catch(function () {
          setStatus("Não foi possível desativar os lembretes.", false);
        });
    }

    function setup() {
      loadConfig().then(function (cfg) {
        if (!cfg) return; // servidor sem suporte a push
        if (cfg.enabled) {
          vapidKey = cfg.public_key;
          renderUpcoming(cfg.upcoming);
        }
      });

      // Estado já inscrito?
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.ready
          .then(getSubscriptions)
          .then(function (sub) {
            isSubscribed = !!sub;
            persistState();
            refreshButtons();
            return null;
          })
          .catch(function () {});
      }

      if (openTriggers.length) {
        openTriggers.forEach(function (el) {
          el.addEventListener("click", function (e) {
            e.preventDefault();
            showModal();
          });
        });
      }

      var closeBtn = doc.getElementById("notify-close");
      if (closeBtn) closeBtn.addEventListener("click", closeModal);

      modal.addEventListener("click", function (e) {
        if (e.target === modal) closeModal();
      });

      doc.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && !modal.hidden) closeModal();
      });

      if (activateBtn) activateBtn.addEventListener("click", subscribe);
      if (disableBtn) disableBtn.addEventListener("click", unsubscribe);

      // Fluxo de instalação do PWA: ao instalar, oferece as notificações
      window.addEventListener("beforeinstallprompt", function (e) {
        e.preventDefault();
        promptEvent = e;
      });

      window.addEventListener("appinstalled", function () {
        if (promptEvent) promptEvent = null;
        isInstalled = true;
        try {
          localStorage.setItem("caminhar-app-installed", "1");
        } catch (e) {}
        setTimeout(function () {
          if ("Notification" in window && !isSubscribed && Notification.permission === "default") {
            showModal();
          }
        }, 1200);
      });
    }

    setup();
  })();

  /* ---------- Service Worker (PWA instalável) ---------- */
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("/sw.js").catch(function () {});
    });
  }
})();