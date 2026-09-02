"""Rotas principais do site — todas as páginas públicas."""

import hmac
import re
import secrets
import time

from flask import (
    Blueprint,
    abort,
    current_app,
    flash,
    jsonify,
    redirect,
    render_template,
    request,
    session,
    url_for,
)

from app.bible_service import fetch_passage, random_verse, verse_of_day
from app.contact_service import dispatch_contact_message
from data.site_config import SITE_CONFIG, whatsapp_link

main_bp = Blueprint("main", __name__)

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
PHONE_RE = re.compile(r"^[0-9()+.\-\s]{8,20}$")


# ----------------------------------------------------------------------
# SEO por página
# ----------------------------------------------------------------------
PAGES = {
    "index": {
        "title": "Igreja Caminhar | Uma igreja para toda família",
        "description": (
            "Conheça a Igreja Caminhar. Um lugar para amar a Deus, "
            "construir relacionamentos e viver seu propósito."
        ),
    },
    "sobre": {
        "title": "Sobre nós | Igreja Caminhar",
        "description": (
            "Conheça a história, os valores e o propósito da Igreja "
            "Caminhar: amar a Deus, valorizar pessoas e caminhar juntos."
        ),
    },
    "ministerios": {
        "title": "Ministérios | Igreja Caminhar",
        "description": (
            "Conheça os ministérios da Igreja Caminhar: louvor, "
            "intercessão, kids, jovens, famílias e acolhimento."
        ),
    },
    "cultos": {
        "title": "Cultos e horários | Igreja Caminhar",
        "description": (
            "Confira os cultos e horários da Igreja Caminhar. "
            "Sua família é bem-vinda em todos os nossos encontros."
        ),
    },
    "eventos": {
        "title": "Eventos | Igreja Caminhar",
        "description": (
            "Acompanhe os próximos eventos da Igreja Caminhar: "
            "batismos, cultos especiais, encontros e muito mais."
        ),
    },
    "mensagens": {
        "title": "Mensagens | Igreja Caminhar",
        "description": (
            "Ouça e releia as mensagens pregadas na Igreja Caminhar. "
            "Palavra que fortalece, consola e direciona."
        ),
    },
    "contato": {
        "title": "Contato | Igreja Caminhar",
        "description": (
            "Fale com a Igreja Caminhar. Envie sua mensagem, tire "
            "dúvidas ou agende uma visita pelo WhatsApp."
        ),
    },
}


# ----------------------------------------------------------------------
# Contexto global para todos os templates
# ----------------------------------------------------------------------
@main_bp.app_context_processor
def inject_globals():
    return {
        "site": SITE_CONFIG,
        "whatsapp_url": whatsapp_link(),
        "page_info": PAGES,
    }


# ----------------------------------------------------------------------
# CSRF simples (baseado em sessão)
# ----------------------------------------------------------------------
def get_csrf_token():
    token = session.get("_csrf_token")
    if not token:
        token = secrets.token_hex(16)
        session["_csrf_token"] = token
    return token


def validate_csrf(token):
    expected = session.get("_csrf_token")
    return bool(expected) and hmac.compare_digest(str(expected), str(token))


# ----------------------------------------------------------------------
# Rota: Home
# ----------------------------------------------------------------------
@main_bp.route("/", methods=["GET"])
def index():
    return render_template(
        "index.html",
        page=url_for("main.index", _external=False),
    )


# ----------------------------------------------------------------------
# Rota: Sobre
# ----------------------------------------------------------------------
@main_bp.route("/sobre", methods=["GET"])
def sobre():
    return render_template("sobre.html")


# ----------------------------------------------------------------------
# Rota: Ministérios
# ----------------------------------------------------------------------
@main_bp.route("/ministerios", methods=["GET"])
def ministerios():
    return render_template("ministerios.html")


# ----------------------------------------------------------------------
# Rota: Cultos
# ----------------------------------------------------------------------
@main_bp.route("/cultos", methods=["GET"])
def cultos():
    return render_template("cultos.html")


# ----------------------------------------------------------------------
# Rota: Eventos
# ----------------------------------------------------------------------
@main_bp.route("/eventos", methods=["GET"])
def eventos():
    return render_template("eventos.html")


# ----------------------------------------------------------------------
# Rota: Mensagens (versículos vindos da API bíblica)
# ----------------------------------------------------------------------
MESSAGE_FETCH_BUDGET_SECONDS = 8.0


@main_bp.route("/mensagens", methods=["GET"])
def mensagens():
    daily = verse_of_day()

    verses = []
    deadline = time.monotonic() + MESSAGE_FETCH_BUDGET_SECONDS
    for message in SITE_CONFIG["messages"]:
        ref = message.get("reference", "")
        if not ref or time.monotonic() >= deadline:
            verses.append(None)
            continue
        verses.append(fetch_passage(ref))

    return render_template(
        "mensagens.html",
        daily_verse=daily,
        message_verses=verses,
    )


# ----------------------------------------------------------------------
# API: versículos (diário, aleatório ou por referência)
# ----------------------------------------------------------------------
@main_bp.route("/api/versiculo", methods=["GET"])
def api_versiculo():
    modo = request.args.get("modo", "")
    ref = (request.args.get("ref") or "").strip()

    if ref:
        data = fetch_passage(ref)
    elif modo == "aleatorio":
        daily = verse_of_day()
        data = random_verse(
            exclude=daily["reference"] if daily and daily.get("reference") else None
        )
    elif modo == "diario":
        data = verse_of_day()
    else:
        return jsonify({"ok": False, "error": "Parâmetros inválidos."}), 400

    if not data or not data.get("text"):
        return jsonify({"ok": False, "error": "Não foi possível buscar o versículo."}), 502

    return jsonify({"ok": True, "data": data})


# ----------------------------------------------------------------------
# Rota: Contato (GET exibe o formulário / POST valida e envia)
# ----------------------------------------------------------------------
@main_bp.route("/contato", methods=["GET", "POST"])
def contato():
    errors = {}
    form_data = {}
    csrf_token = get_csrf_token()

    if request.method == "GET":
        return render_template("contato.html", form_data={}, errors={}, csrf_token=csrf_token)

    # ----- validação no Python -----
    form_data = {
        "name": (request.form.get("name") or "").strip(),
        "phone": (request.form.get("phone") or "").strip(),
        "email": (request.form.get("email") or "").strip(),
        "message": (request.form.get("message") or "").strip(),
    }

    if not validate_csrf(request.form.get("csrf_token", "")):
        abort(400, description="Sessão expirada. Recarregue a página e tente novamente.")

    if not form_data["name"]:
        errors["name"] = "Informe seu nome."
    elif len(form_data["name"]) > 100:
        errors["name"] = "Nome muito longo (máx. 100 caracteres)."

    phone = re.sub(r"\s+", "", form_data["phone"])
    if not phone:
        errors["phone"] = "Informe seu telefone para contato."
    elif not PHONE_RE.match(phone):
        errors["phone"] = "Telefone inválido. Use apenas números (ex.: 31 99999-9999)."

    if not form_data["email"]:
        errors["email"] = "Informe seu e-mail."
    elif not EMAIL_RE.match(form_data["email"]):
        errors["email"] = "E-mail inválido. Confira o endereço digitado."

    if not form_data["message"]:
        errors["message"] = "Escreva sua mensagem."
    elif len(form_data["message"]) > 2000:
        errors["message"] = "Mensagem muito longa (máx. 2000 caracteres)."

    if errors:
        return render_template(
            "contato.html",
            form_data=form_data,
            errors=errors,
            csrf_token=csrf_token,
        ), 422

    dispatch_contact_message(
        name=form_data["name"],
        email=form_data["email"],
        phone=phone,
        message=form_data["message"],
    )
    flash(
        "Mensagem recebida com sucesso! Em breve retornaremos o seu contato.",
        "success",
    )
    return redirect(url_for("main.contato", form_sent=1) + "#form")


# ----------------------------------------------------------------------
# Rota: 404
# ----------------------------------------------------------------------
@main_bp.app_errorhandler(404)
def page_not_found(_error):
    return render_template("404.html"), 404