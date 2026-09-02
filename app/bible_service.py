"""Serviço de versículos bíblicos — usa a API pública bible-api.com.

Sem chave e sem dependências extras (apenas urllib do stdlib).
Tradução fixa: João Ferreira de Almeida (almeida).

Lógica:
  - `fetch_passage(ref)`  -> texto de uma referência (com cache em memória).
  - `verse_of_day()`      -> versículo do dia, determinístico por data.
  - `random_verse()`      -> versículo aleatório do acervo interno.

Se a API estiver indisponível, as funções retornam `None` com segurança
(o site continua funcionando, apenas sem o texto do versículo).
"""

import re
import threading
import time
import unicodedata
import urllib.parse
import urllib.request
from datetime import date

API_BASE = "https://bible-api.com/"
API_TRANSLATION = "almeida"
REQUEST_TIMEOUT = 5.0

# Cache em memória: ref -> (timestamp, payload ou None)
_cache = {}
_cache_lock = threading.Lock()
_PASSAGE_TTL = 7 * 24 * 3600  # 7 dias
_VOTD_TTL = 12 * 3600  # 12 horas (renova no mesmo dia)

# Referências do acervo interno (separador com ponto, como no site)
DEFAULT_PASSAGES = [
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
]

_REF_RE = re.compile(r"^[a-z0-9\s:,-]{2,60}$")
_BOOK_SPLIT_RE = re.compile(r"^([a-z0-9\s-]+?)\s+([\d.:,\-–]+)$")


def _deaccent(text):
    """Remove acentos e normaliza para o formato aceito pela API."""
    text = unicodedata.normalize("NFD", text)
    text = "".join(c for c in text if unicodedata.category(c) != "Mn")
    text = text.replace("–", "-").replace("—", "-")
    return text.lower().strip()


def _normalize_reference(ref):
    """Converte 'Salmos 34.1-4' -> 'salmos 34:1-4'."""
    ref = _deaccent(ref or "")
    ref = re.sub(r"\s+", " ", ref.strip())
    match = _BOOK_SPLIT_RE.match(ref)
    if not match:
        return None
    book, digits = match.group(1), match.group(2)
    digits = re.sub(r"\s*,\s*", ",", digits)
    digits = re.sub(r"(\d)\.(\d)", r"\1:\2", digits)
    candidate = f"{book} {digits}"
    if not _REF_RE.match(candidate):
        return None
    return candidate


def _http_json(url):
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": "IgrejaCaminhar/1.0 (+palavra da igreja)",
            "Accept": "application/json",
        },
    )
    with urllib.request.urlopen(req, timeout=REQUEST_TIMEOUT) as resp:
        if resp.status != 200:
            return None
        body = resp.read().decode("utf-8")
    return body


def _cache_get(key):
    with _cache_lock:
        item = _cache.get(key)
        if not item:
            return None
        ts, payload = item
        ttl = _VOTD_TTL if key.startswith("votd:") else _PASSAGE_TTL
        if time.time() - ts > ttl:
            _cache.pop(key, None)
            return None
        return payload


def _cache_set(key, payload):
    with _cache_lock:
        _cache[key] = (time.time(), payload)


def fetch_passage(ref):
    """Busca o texto de uma referência na tradução Almeida. Devolve None se falhar."""
    normalized = _normalize_reference(ref)
    if not normalized:
        return {"reference": ref or "", "text": None, "translation": None}

    cached = _cache_get("passage:" + normalized)
    if cached is not None:
        return cached

    url = API_BASE + urllib.parse.quote(normalized) + "?translation=" + API_TRANSLATION
    payload = None
    try:
        body = _http_json(url)
        import json

        if body:
            data = json.loads(body)
            text = (data.get("text") or "").replace("\u00a0", " ").strip()
            if data.get("reference") and text:
                payload = {
                    "reference": data.get("reference"),
                    "text": text,
                    "translation": data.get("translation_name") or "João Ferreira de Almeida",
                }
    except Exception:
        payload = None

    _cache_set("passage:" + normalized, payload)
    return payload


def verse_of_day(pool=None):
    """Versículo do dia — determinístico pela data (dia corrente no Brasil)."""
    passages = pool or DEFAULT_PASSAGES
    if not passages:
        return None

    key = "votd:" + date.today().isoformat()
    cached = _cache_get(key)
    if cached is not None:
        return cached

    index = date.today().toordinal() % len(passages)
    payload = fetch_passage(passages[index])
    _cache_set(key, payload)
    return payload


def random_verse(pool=None, exclude=None):
    """Versículo aleatório do acervo interno (para o botão 'Outro versículo')."""
    ex_norm = _normalize_reference(exclude) if exclude else None
    passages = [
        p for p in (pool or DEFAULT_PASSAGES) if _normalize_reference(p) != ex_norm
    ]
    if not passages:
        passages = list(pool or DEFAULT_PASSAGES)
    if not passages:
        return None

    now_ms = int(time.time() * 1000)
    index = (now_ms ^ 0x5BF03635) % len(passages)
    return fetch_passage(passages[index])