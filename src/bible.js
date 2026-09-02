"use strict";

// ----------------------------------------------------------------------
// Serviço de versículos bíblicos — usa a API pública bible-api.com.
// Sem chave. Tradução fixa: João Ferreira de Almeida (almeida).
//
// fetchPassage(ref)   -> texto de uma referência (com cache em memória)
// verseOfDay()        -> versículo do dia, determinístico por data
// randomVerse()       -> versículo aleatório do acervo interno
//
// Se a API estiver indisponível, retorna null com segurança.
// ----------------------------------------------------------------------

const API_BASE = "https://bible-api.com/";
const API_TRANSLATION = "almeida";
const REQUEST_TIMEOUT_MS = 5000;

const PASSAGE_TTL = 7 * 24 * 3600 * 1000; // 7 dias
const VOTD_TTL = 12 * 3600 * 1000; // 12 horas

const cache = new Map();

const DEFAULT_PASSAGES = [
  "João 3.16",
  "Isaías 43.2",
  "Salmos 23.1",
  "Provérbios 3.5-6",
  "Filipenses 4.13",
  "Jeremias 29.11",
  "Romanos 8.28",
  "Mateus 11.28",
  "Salmos 121.1-2",
  "Isaías 40.31",
  "Josué 1.9",
  "Hebreus 11.1",
  "1 Coríntios 13.4-7",
  "Gálatas 5.22-23",
  "Efésios 2.8-9",
  "2 Coríntios 5.17",
  "Colossenses 3.23",
  "1 Pedro 5.7",
  "Mateus 6.33",
  "Salmos 46.1",
  "Lamentações 3.22-23",
  "Filipenses 1.6",
  "Salmos 27.1",
  "Romanos 12.2",
  "Tiago 1.5",
  "Provérbios 18.10",
  "Salmos 91.1",
];

// Deacentua e normaliza para o formato aceito pela API.
function deaccent(text) {
  return (text || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[–—]/g, "-")
    .toLowerCase()
    .trim();
}

const BOOK_SPLIT_RE = /^([a-z0-9\s-]+?)\s+([\d.:,\-–]+)$/;
const REF_RE = /^[a-z0-9\s:,-]{2,60}$/;

// Converte "Salmos 34.1-4" -> "salmos 34:1-4".
function normalizeReference(ref) {
  const clean = deaccent(ref).replace(/\s+/g, " ").trim();
  const match = BOOK_SPLIT_RE.exec(clean);
  if (!match) return null;
  let book = match[1];
  let digits = match[2].replace(/\s*,\s*/g, ",");
  digits = digits.replace(/(\d)\.(\d)/g, "$1:$2");
  const candidate = `${book} ${digits}`;
  if (!REF_RE.test(candidate)) return null;
  return candidate;
}

async function httpJson(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const resp = await fetch(url, {
      headers: {
        "User-Agent": "IgrejaCaminhar/1.0 (+palavra da igreja)",
        Accept: "application/json",
      },
      signal: controller.signal,
    });
    if (!resp.ok) return null;
    return await resp.text();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function cacheGet(key) {
  const item = cache.get(key);
  if (item === undefined) return undefined; // cache miss
  const [ts, payload] = item;
  const ttl = key.startsWith("votd:") ? VOTD_TTL : PASSAGE_TTL;
  if (Date.now() - ts > ttl) {
    cache.delete(key);
    return undefined;
  }
  return payload; // may be null (falha anterior em cache)
}

function cacheSet(key, payload) {
  cache.set(key, [Date.now(), payload]);
}

// Retorna a data local (Brasil) em ISO — usada para o versículo do dia.
function todayLocal() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

// Mesma base do date.toordinal() do Python (1970-01-01 == ordinal 719163).
function toOrdinal(isoDate) {
  const ms = Date.parse(isoDate + "T00:00:00Z");
  return Math.floor(ms / 86400000) + 719163;
}

async function fetchPassage(ref) {
  const normalized = normalizeReference(ref);
  if (!normalized) {
    return { reference: ref || "", text: null, translation: null };
  }

  const cacheKey = "passage:" + normalized;
  const cached = cacheGet(cacheKey);
  if (cached !== undefined) return cached; // may be null (cached failure)

  const url =
    API_BASE + encodeURIComponent(normalized) + "?translation=" + API_TRANSLATION;
  let payload = null;
  try {
    const body = await httpJson(url);
    if (body) {
      const data = JSON.parse(body);
      const text = (data.text || "").replace(/\u00a0/g, " ").trim();
      if (data.reference && text) {
        payload = {
          reference: data.reference,
          text,
          translation: data.translation_name || "João Ferreira de Almeida",
        };
      }
    }
  } catch {
    payload = null;
  }

  cacheSet(cacheKey, payload);
  return payload;
}

async function verseOfDay(pool) {
  const passages = pool || DEFAULT_PASSAGES;
  if (!passages.length) return null;

  const key = "votd:" + todayLocal();
  const cached = cacheGet(key);
  if (cached !== undefined) return cached; // may be null

  const iso = todayLocal();
  const index = toOrdinal(iso) % passages.length;
  const payload = await fetchPassage(passages[index]);
  cacheSet(key, payload);
  return payload;
}

async function randomVerse(pool, exclude) {
  const exNorm = exclude ? normalizeReference(exclude) : null;
  let passages = (pool || DEFAULT_PASSAGES).filter(
    (p) => normalizeReference(p) !== exNorm
  );
  if (!passages.length) passages = [...(pool || DEFAULT_PASSAGES)];
  if (!passages.length) return null;

  const now = Date.now();
  const index = (now ^ 0x5bf03635) % passages.length;
  return fetchPassage(passages[index]);
}

module.exports = {
  DEFAULT_PASSAGES,
  fetchPassage,
  verseOfDay,
  randomVerse,
  normalizeReference,
};
