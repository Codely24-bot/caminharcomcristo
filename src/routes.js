"use strict";

const crypto = require("crypto");

const { SITE_CONFIG, whatsappLink } = require("./config");
const { fetchPassage, randomVerse, verseOfDay } = require("./bible");
const { dispatchContactMessage } = require("./contact");

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const PHONE_RE = /^[0-9()+.\-\s]{8,20}$/;

// ----------------------------------------------------------------------
// SEO por página
// ----------------------------------------------------------------------
const PAGES = {
  index: {
    title: "Igreja Caminhar | Uma igreja para toda família",
    description:
      "Conheça a Igreja Caminhar. Um lugar para amar a Deus, construir relacionamentos e viver seu propósito.",
  },
  sobre: {
    title: "Sobre nós | Igreja Caminhar",
    description:
      "Conheça a história, os valores e o propósito da Igreja Caminhar: amar a Deus, valorizar pessoas e caminhar juntos.",
  },
  ministerios: {
    title: "Ministérios | Igreja Caminhar",
    description:
      "Conheça os ministérios da Igreja Caminhar: louvor, intercessão, kids, jovens, famílias e acolhimento.",
  },
  cultos: {
    title: "Cultos e horários | Igreja Caminhar",
    description:
      "Confira os cultos e horários da Igreja Caminhar. Sua família é bem-vinda em todos os nossos encontros.",
  },
  eventos: {
    title: "Eventos | Igreja Caminhar",
    description:
      "Acompanhe os próximos eventos da Igreja Caminhar: batismos, cultos especiais, encontros e muito mais.",
  },
  csc: {
    title: "CSC – Centro Social Caminhar | Igreja Caminhar",
    description:
      "Conheça o Centro Social Caminhar (CSC): a ação social da Igreja Caminhar servindo as famílias com amor, dignidade e propósito.",
  },
  "nova-caminhar": {
    title: "Nova Caminhar | Igreja Caminhar",
    description:
      "Acompanhe a evolução da obra de expansão da Igreja Caminhar e veja como vai ficar o nosso novo espaço.",
  },
  mensagens: {
    title: "Mensagens | Igreja Caminhar",
    description:
      "Ouça e releia as mensagens pregadas na Igreja Caminhar. Palavra que fortalece, consola e direciona.",
  },
  contato: {
    title: "Contato | Igreja Caminhar",
    description:
      "Fale com a Igreja Caminhar. Envie sua mensagem, tire dúvidas ou agende uma visita pelo WhatsApp.",
  },
};

// ----------------------------------------------------------------------
// CSRF simples (cookie + token no formulário — double submit)
// ----------------------------------------------------------------------
const CSRF_COOKIE = "caminhar_csrf";
const CSRF_MAXAGE = 12 * 3600 * 1000; // 12 horas

function csrfMiddleware(req, res, next) {
  let token = req.cookies && req.cookies[CSRF_COOKIE];
  if (!token) {
    token = crypto.randomBytes(16).toString("hex");
    res.cookie(CSRF_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: CSRF_MAXAGE,
      path: "/",
    });
  }
  req.csrfToken = token;
  next();
}

function getCsrfToken(req) {
  return req.csrfToken;
}

function validateCsrf(req, token) {
  const expected = req.csrfToken;
  if (!expected) return false;
  const a = Buffer.from(String(expected), "utf8");
  const b = Buffer.from(String(token || ""), "utf8");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

// ----------------------------------------------------------------------
// Flash messages (sobrevivem ao redirect via cookie -> store em memória)
// ----------------------------------------------------------------------
const flashStore = new Map();
const FLASH_COOKIE = "caminhar_flash";
const FLASH_TTL_MS = 5 * 60 * 1000;

function setFlash(res, category, message) {
  const token = crypto.randomBytes(8).toString("hex");
  flashStore.set(token, { category, message, at: Date.now() });
  res.cookie(FLASH_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: FLASH_TTL_MS,
    path: "/",
  });
}

function takeFlash(req, res) {
  const token = req.cookies && req.cookies[FLASH_COOKIE];
  if (!token) return null;
  const item = flashStore.get(token);
  flashStore.delete(token);
  res.clearCookie(FLASH_COOKIE, { path: "/" });
  if (!item || Date.now() - item.at > FLASH_TTL_MS) return null;
  return item;
}

// ----------------------------------------------------------------------
// Contexto global injetado em todos os templates
// ----------------------------------------------------------------------
function globalContext(req, res) {
  const currentPath = (req.path || "/").replace(/^\/+/, "").replace(/\/+$/, "") || "index";
  const flash = takeFlash(req, res);
  return {
    site: SITE_CONFIG,
    whatsapp_url: whatsappLink(),
    page_info: PAGES,
    currentPath,
    fromUrl: currentPath,
    flashes: flash
      ? [{ category: flash.category, message: flash.message }]
      : [],
  };
}

const MESSAGE_FETCH_BUDGET_SECONDS = 8.0;

async function loadMessagesVerses() {
  const verses = [];
  const deadline = Date.now() + MESSAGE_FETCH_BUDGET_SECONDS * 1000;
  for (const message of SITE_CONFIG.messages) {
    const ref = (message && message.reference) || "";
    if (!ref || Date.now() >= deadline) {
      verses.push(null);
      continue;
    }
    verses.push(await fetchPassage(ref));
  }
  return verses;
}

function installRoutes(app) {
  // CSRF para todos os requests (necessário antes de renderizar o form)
  app.use(csrfMiddleware);

  // ------------------------------------------------------------------
  // Páginas
  // ------------------------------------------------------------------
  app.get("/", (req, res) => {
    res.render("index.html");
  });

  app.get("/sobre", (_req, res) => {
    res.render("sobre.html");
  });

  app.get("/csc", (_req, res) => {
    res.render("csc.html");
  });

  app.get("/nova-caminhar", (_req, res) => {
    res.render("nova-caminhar.html");
  });

  app.get("/ministerios", (_req, res) => {
    res.render("ministerios.html");
  });

  app.get("/ministerios/:slug", (req, res) => {
    const slug = (req.params.slug || "").toLowerCase();
    const ministry = SITE_CONFIG.ministries.find((m) => m.slug === slug);
    if (!ministry) {
      return res.status(404).render("404.html");
    }
    res.render("ministerio.html", {
      ministry,
      other_ministries: SITE_CONFIG.ministries.filter((m) => m.slug !== slug),
      seo_title: `${ministry.name} | Igreja Caminhar`,
      seo_description: ministry.summary,
      whatsapp_url: whatsappLink(
        `Olá! Vim pelo site e gostaria de mais informações sobre o ministério de ${ministry.name}.`
      ),
    });
  });

  app.get("/cultos", (_req, res) => {
    res.render("cultos.html");
  });

  app.get("/eventos", (_req, res) => {
    res.render("eventos.html");
  });

  app.get("/mensagens", async (_req, res) => {
    const [daily, verses] = await Promise.all([
      verseOfDay(),
      loadMessagesVerses(),
    ]);
    res.render("mensagens.html", { dailyVerse: daily, messageVerses: verses });
  });

  // ------------------------------------------------------------------
  // API: versículos (diário, aleatório ou por referência)
  // ------------------------------------------------------------------
  app.get("/api/versiculo", async (req, res) => {
    const modo = (req.query.modo || "").toString();
    const ref = (req.query.ref || "").toString().trim();

    let data;
    try {
      if (ref) {
        data = await fetchPassage(ref);
      } else if (modo === "aleatorio") {
        const daily = await verseOfDay();
        data = await randomVerse(
          null,
          daily && daily.reference ? daily.reference : null
        );
      } else if (modo === "diario") {
        data = await verseOfDay();
      } else {
        return res
          .status(400)
          .json({ ok: false, error: "Parâmetros inválidos." });
      }
    } catch {
      data = null;
    }

    if (!data || !data.text) {
      return res
        .status(502)
        .json({ ok: false, error: "Não foi possível buscar o versículo." });
    }

    res.json({ ok: true, data });
  });

  // ------------------------------------------------------------------
  // Contato (GET exibe o formulário / POST valida e envia)
  // ------------------------------------------------------------------
  app.get("/contato", (req, res) => {
    res.render("contato.html", {
      formData: {},
      errors: {},
      csrfToken: getCsrfToken(req),
    });
  });

  app.post("/contato", async (req, res) => {
    const errors = {};
    const csrfToken = getCsrfToken(req);
    const body = req.body || {};

    const formData = {
      name: (body.name || "").toString().trim(),
      phone: (body.phone || "").toString().trim(),
      email: (body.email || "").toString().trim(),
      message: (body.message || "").toString().trim(),
    };

    if (!validateCsrf(req, (body.csrf_token || "").toString())) {
      return res
        .status(400)
        .render("contato.html", { formData, errors, csrfToken });
    }

    if (!formData.name) {
      errors.name = "Informe seu nome.";
    } else if (formData.name.length > 100) {
      errors.name = "Nome muito longo (máx. 100 caracteres).";
    }

    const phone = formData.phone.replace(/\s+/g, "");
    if (!phone) {
      errors.phone = "Informe seu telefone para contato.";
    } else if (!PHONE_RE.test(phone)) {
      errors.phone = "Telefone inválido. Use apenas números (ex.: 31 99999-9999).";
    }

    if (!formData.email) {
      errors.email = "Informe seu e-mail.";
    } else if (!EMAIL_RE.test(formData.email)) {
      errors.email = "E-mail inválido. Confira o endereço digitado.";
    }

    if (!formData.message) {
      errors.message = "Escreva sua mensagem.";
    } else if (formData.message.length > 2000) {
      errors.message = "Mensagem muito longa (máx. 2000 caracteres).";
    }

    if (Object.keys(errors).length) {
      return res
        .status(422)
        .render("contato.html", { formData, errors, csrfToken });
    }

    dispatchContactMessage({
      name: formData.name,
      email: formData.email,
      phone,
      message: formData.message,
    });

    setFlash(
      res,
      "success",
      "Mensagem recebida com sucesso! Em breve retornaremos o seu contato."
    );
    return res.redirect("/contato?form_sent=1#form");
  });

  // ------------------------------------------------------------------
  // 404
  // ------------------------------------------------------------------
  app.use((req, res) => {
    res.status(404).render("404.html");
  });
}

module.exports = { PAGES, installRoutes, globalContext };