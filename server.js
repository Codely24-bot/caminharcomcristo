"use strict";

require("dotenv").config();

const path = require("path");
const express = require("express");
const nunjucks = require("nunjucks");
const cookieParser = require("cookie-parser");

const { installRoutes, globalContext } = require("./src/routes");

const app = express();
const PORT = Number(process.env.PORT || 3000);
const DEBUG = String(process.env.DEBUG || "false").toLowerCase() === "true";
const PROD = process.env.NODE_ENV === "production";
const STATIC_MAXAGE = PROD ? "7d" : 0;

app.disable("x-powered-by");
app.set("trust proxy", 1);
app.set("json spaces", DEBUG ? 2 : 0);

// ----------------------------------------------------------------------
// Body parsing (máx. 1 MB, como no Flask) + cookies
// ----------------------------------------------------------------------
app.use(express.urlencoded({ extended: false, limit: "1mb" }));
app.use(cookieParser());

// ----------------------------------------------------------------------
// Estáticos — reutiliza a pasta app/static existente
// ----------------------------------------------------------------------
app.use(
  "/static",
  express.static(path.join(__dirname, "app", "static"), {
    index: false,
    maxAge: STATIC_MAXAGE,
  })
);

// ----------------------------------------------------------------------
// Manifest e Service Worker na raiz (escopo do PWA)
// ----------------------------------------------------------------------
app.get("/manifest.webmanifest", (req, res) => {
  res
    .status(200)
    .type("application/manifest+json")
    .set("Cache-Control", "public, max-age=3600")
    .sendFile(path.join(__dirname, "app", "static", "manifest.webmanifest"));
});

app.get("/sw.js", (req, res) => {
  res
    .status(200)
    .type("application/javascript")
    .set("Cache-Control", "no-cache")
    .sendFile(path.join(__dirname, "app", "static", "sw.js"));
});

// ----------------------------------------------------------------------
// Nunjucks (clone do Jinja2 para Node)
// ----------------------------------------------------------------------
const viewsDir = path.join(__dirname, "src", "templates");
const env = nunjucks.configure(viewsDir, {
  autoescape: true,
  trimBlocks: true,
  lstripBlocks: true,
  noCache: !PROD,
  throwOnUndefined: false,
});

// rotas internas usadas em url('main.xxx')
const PAGE_ROUTES = {
  "main.index": "/",
  "main.sobre": "/sobre",
  "main.ministerios": "/ministerios",
  "main.cultos": "/cultos",
  "main.eventos": "/eventos",
  "main.mensagens": "/mensagens",
  "main.contato": "/contato",
};

env.addGlobal("url", (name) => PAGE_ROUTES[name] || "/");
env.addGlobal("static", (filename) => "/static/" + filename);

// Filtros Jinja2 que o Nunjucks não traz por padrão
env.addFilter("unique", (arr) => {
  if (!Array.isArray(arr)) return arr;
  return [...new Set(arr)];
});
env.addFilter("mapAttr", (arr, attr) => {
  if (!Array.isArray(arr)) return arr;
  return arr.map((item) => (item && typeof item === "object" ? item[attr] : undefined));
});
env.addFilter("limit", (arr, n) => (Array.isArray(arr) ? arr.slice(0, n) : arr));

app.engine("html", env.render.bind(env));
app.set("view engine", "html");
app.set("views", viewsDir);

// ----------------------------------------------------------------------
// Contexto global (site, whatsapp, seo, flash, rota atual)
// ----------------------------------------------------------------------
app.use((req, res, next) => {
  Object.assign(res.locals, globalContext(req, res));
  next();
});

// ----------------------------------------------------------------------
// Rotas
// ----------------------------------------------------------------------
installRoutes(app);

app.listen(PORT, () => {
  const mode = PROD ? "production" : DEBUG ? "development" : "node";
  console.log(`Igreja Caminhar (Node/Express) rodando em http://localhost:${PORT} [${mode}]`);
});