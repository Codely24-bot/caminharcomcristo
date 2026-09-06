"use strict";

// ----------------------------------------------------------------------
// Notificações push (Web Push / VAPID).
// Guarda as inscrições dos usuários, agenda lembretes para cultos e
// eventos (a partir do SITE_CONFIG) e envia notificações push.
// Se as chaves VAPID não estiverem configuradas no .env, o módulo
// é desativado sem quebrar o restante da aplicação.
// ----------------------------------------------------------------------

const fs = require("fs");
const path = require("path");
const webpush = require("web-push");

const { SITE_CONFIG } = require("./config");

const PUBLIC_KEY = String(process.env.VAPID_PUBLIC_KEY || "");
const PRIVATE_KEY = String(process.env.VAPID_PRIVATE_KEY || "");
const SUBJECT = String(process.env.VAPID_SUBJECT || "mailto:contato@igrejacaminhar.com.br");
const MINUTES_BEFORE = Math.max(
  0,
  Number.parseInt(process.env.NOTIFY_MINUTES_BEFORE || "60", 10)
);

const STORE_FILE = path.join(__dirname, "..", "data", "notifications.json");

const enabled = Boolean(PUBLIC_KEY && PRIVATE_KEY);
const TEST_ENABLED = enabled && String(process.env.NODE_ENV || "").toLowerCase() !== "production";

if (enabled) {
  webpush.setVapidDetails(SUBJECT, PUBLIC_KEY, PRIVATE_KEY);
} else {
  console.warn(
    "[notifications] Web Push desativado. Configure VAPID_PUBLIC_KEY e VAPID_PRIVATE_KEY no .env."
  );
}

// ----------------------------------------------------------------------
// Persistência simples em arquivo JSON (data/notifications.json)
// ----------------------------------------------------------------------
const subscriptions = new Map(); // endpoint -> { subscription, reminders, at }

function loadStore() {
  try {
    if (!fs.existsSync(STORE_FILE)) return;
    const data = JSON.parse(fs.readFileSync(STORE_FILE, "utf8"));
    if (Array.isArray(data)) {
      data.forEach((item) => {
        if (item && item.subscription && item.subscription.endpoint) {
          subscriptions.set(item.subscription.endpoint, {
            subscription: item.subscription,
            reminders: { services: !!item.reminders?.services, events: !!item.reminders?.events },
            at: item.at || Date.now(),
          });
        }
      });
    }
  } catch (err) {
    console.warn("[notifications] Falha ao carregar inscrições:", err.message);
  }
}

function saveStore() {
  try {
    const data = Array.from(subscriptions.values()).map((item) => ({
      subscription: item.subscription,
      reminders: item.reminders,
      at: item.at,
    }));
    fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.warn("[notifications] Falha ao salvar inscrições:", err.message);
  }
}

// ----------------------------------------------------------------------
// Datas: próxima ocorrência de culto e de evento
// ----------------------------------------------------------------------
const WEEKDAYS = {
  domingo: 0,
  segunda: 1,
  terc: 2,
  quarta: 3,
  quinta: 4,
  sexta: 5,
  sabado: 6,
};

const MONTHS = {
  jan: 0, fev: 1, mar: 2, abr: 3, mai: 4, jun: 5,
  jul: 6, ago: 7, set: 8, out: 9, nov: 10, dez: 11,
};

function parseDayIndex(day) {
  const key = String(day || "").toLowerCase().trim().slice(0, 6);
  return WEEKDAYS[key] === undefined ? null : WEEKDAYS[key];
}

function parseTime(time) {
  const parts = String(time || "").split(":");
  const h = Number.parseInt(parts[0], 10);
  const m = Number.parseInt(parts[1], 10);
  return Number.isFinite(h) && Number.isFinite(m) ? { h, m } : null;
}

function startOfDay(d) {
  const out = new Date(d);
  out.setHours(0, 0, 0, 0);
  return out;
}

function nextService(service, from) {
  const dayIdx = parseDayIndex(service.day);
  const t = parseTime(service.time);
  if (dayIdx === null || !t) return null;
  const base = startOfDay(from);
  let diff = dayIdx - base.getDay();
  if (diff < 0) diff += 7;
  let d = new Date(base);
  d.setDate(base.getDate() + diff);
  d.setHours(t.h, t.m, 0, 0);
  if (d <= from) d.setDate(d.getDate() + 7); // mesmo dia já passou
  return d;
}

function nextEvent(event, from) {
  const m = MONTHS[String(event.month || "").toLowerCase().slice(0, 3)];
  const day = Number.parseInt(event.day, 10);
  const t = parseTime(event.time);
  if (m === undefined || !day || !t) return null;
  const year = from.getFullYear();
  let d = new Date(year, m, day, t.h, t.m, 0, 0);
  if (d <= from) d = new Date(year + 1, m, day, t.h, t.m, 0, 0);
  return d;
}

// ----------------------------------------------------------------------
// Próximos lembretes (para informar ao cliente)
// ----------------------------------------------------------------------
function upcomingReminders(limit = 5) {
  if (!enabled) return [];
  const from = new Date();
  const items = [];

  SITE_CONFIG.services.forEach((service) => {
    const when = nextService(service, from);
    if (when) {
      items.push({
        kind: "service",
        title: service.name,
        when: when.toISOString(),
      });
    }
  });

  SITE_CONFIG.events.forEach((event) => {
    const when = nextEvent(event, from);
    if (when) {
      items.push({
        kind: "event",
        title: event.name,
        when: when.toISOString(),
      });
    }
  });

  items.sort((a, b) => new Date(a.when) - new Date(b.when));
  return items.slice(0, limit);
}

// ----------------------------------------------------------------------
// Envio e agenda de lembretes
// ----------------------------------------------------------------------
let scheduleTimer = null;

function sendPayload(subs, item) {
  if (!enabled) return;
  const payload = JSON.stringify({
    title: item.title,
    body: item.body,
    url: item.url,
  });
  Array.from(subs).forEach(({ subscription }) => {
    webpush
      .sendNotification(subscription, payload)
      .catch((err) => {
        const code = err && err.statusCode;
        if (code === 404 || code === 410) {
          // inscrição antiga/removida
          subscriptions.delete(subscription.endpoint);
          saveStore();
        }
      });
  });
}

function fire(item, kind) {
  const subs = Array.from(subscriptions.values()).filter((s) => s.reminders[kind]);
  if (subs.length) {
    sendPayload(subs, {
      title: item.title,
      body: item.body,
      url: item.url,
    });
  }
  scheduleNext();
}

function sendTestNotification() {
  if (!enabled || !subscriptions.size) {
    return { sent: 0, total: 0 };
  }
  const subs = Array.from(subscriptions.values());
  sendPayload(subs, {
    title: "Notificação de teste",
    body: "Você está recebendo os lembretes da Igreja Caminhar. Funcionou!",
    url: "/",
  });
  return { sent: subs.length, total: subscriptions.size };
}

function scheduleNext() {
  if (!enabled || scheduleTimer) return;

  const from = new Date();
  const candidates = [];

  SITE_CONFIG.services.forEach((service) => {
    const when = nextService(service, from);
    if (when) {
      candidates.push({
        at: new Date(when.getTime() - MINUTES_BEFORE * 60000),
        kind: "services",
        item: {
          title: `Culto: ${service.name}`,
          body: `Lembrete! ${service.name} começa hoje às ${service.time}. Te esperamos!`,
          url: "/cultos",
        },
      });
    }
  });

  SITE_CONFIG.events.forEach((event) => {
    const when = nextEvent(event, from);
    if (when) {
      candidates.push({
        at: new Date(when.getTime() - MINUTES_BEFORE * 60000),
        kind: "events",
        item: {
          title: `Evento: ${event.name}`,
          body: `Lembrete! ${event.name} começa ${formatWhen(when)}. Não perca!`,
          url: "/eventos",
        },
      });
    }
  });

  candidates.sort((a, b) => a.at - b.at);
  const next = candidates[0];
  if (!next) return;

  const delay = Math.max(0, next.at.getTime() - Date.now());
  scheduleTimer = setTimeout(() => {
    scheduleTimer = null;
    fire(next.item, next.kind);
  }, delay);
}

function formatWhen(date) {
  return date
    .toLocaleString("pt-BR", {
      day: "2-digit",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
    })
    .replace(/\s+/g, " ")
    .replace(/^0(\d)/, "$1");
}

// ----------------------------------------------------------------------
// Endpoints
// ----------------------------------------------------------------------
function installNotifications(app) {
  // Config pública (apenas informações de anúncio + chave VAPID pública)
  app.get("/api/notifications/config", (_req, res) => {
    res.json({
      ok: true,
      enabled,
      test_enabled: TEST_ENABLED,
      public_key: PUBLIC_KEY,
      minutes_before: MINUTES_BEFORE,
      upcoming: upcomingReminders(5),
    });
  });

  // Enviar notificação de teste (apenas em desenvolvimento)
  app.post("/api/notifications/test", (_req, res) => {
    if (!TEST_ENABLED) {
      return res.status(404).json({ ok: false, error: "Não disponível." });
    }
    const result = sendTestNotification();
    if (!result.sent) {
      return res.status(400).json({
        ok: false,
        error: "Nenhum dispositivo inscrito ainda. Ative os lembretes pelo rodapé da página.",
      });
    }
    res.json({ ok: true, sent: result.sent });
  });

  // Inscrever um dispositivo
  app.post("/api/notifications/subscribe", (req, res) => {
    if (!enabled) {
      return res.status(503).json({ ok: false, error: "Notificações indisponíveis." });
    }

    const body = req.body || {};
    const subscription = body.subscription || null;

    if (
      !subscription ||
      typeof subscription !== "object" ||
      typeof subscription.endpoint !== "string"
    ) {
      return res.status(400).json({ ok: false, error: "Inscrição inválida." });
    }

    const reminders = {
      services: body.reminders && body.reminders.services === true,
      events: body.reminders && body.reminders.events === true,
    };

    if (!reminders.services && !reminders.events) {
      return res.status(400).json({ ok: false, error: "Escolha ao menos um tipo de lembrete." });
    }

    subscriptions.set(subscription.endpoint, {
      subscription,
      reminders,
      at: Date.now(),
    });
    saveStore();

    scheduleNext();

    res.json({ ok: true });
  });

  // Desinscrever um dispositivo
  app.post("/api/notifications/unsubscribe", (req, res) => {
    const endpoint = req.body && req.body.endpoint;
    if (endpoint) {
      subscriptions.delete(endpoint);
      saveStore();
    }
    res.json({ ok: true });
  });
}

loadStore();

if (enabled && subscriptions.size) {
  scheduleNext();
}

setInterval(() => {
  // re-agenda caso o processo fique aberto por muito tempo sem novos eventos
  if (enabled && !scheduleTimer && subscriptions.size) {
    scheduleNext();
  }
}, 60 * 60 * 1000);

module.exports = { installNotifications, enabled, upcomingReminders, sendTestNotification };