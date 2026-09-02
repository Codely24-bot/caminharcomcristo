"""Configuração central do site.

Todos os dados exibidos no site (contatos, horários, ministérios,
eventos, mensagens, redes sociais) devem ser editados aqui.

As páginas recebem este conteúdo via contexto Flask/Jinja2. Nunca
colocar telefone, endereço ou links fixos diretamente nos templates.
"""

SITE_CONFIG = {
    # ------------------------------------------------------------------
    # Identidade
    # ------------------------------------------------------------------
    "church_name": "Igreja Caminhar",
    "short_name": "Caminhar",
    "tagline": (
        "Uma igreja que ama a Deus, valoriza pessoas e caminha junto "
        "para transformar vidas."
    ),
    "description": (
        "Conheça a Igreja Caminhar. Um lugar para amar a Deus, "
        "construir relacionamentos e viver seu propósito."
    ),
    "founded": "2018",
    "followers_label": "+850 pessoas caminhando conosco",

    # ------------------------------------------------------------------
    # Contato
    # ------------------------------------------------------------------
    "whatsapp": "5531999999999",  # somente números, com DDI
    "phone": "(31) 99999-9999",
    "email": "contato@igrejacaminhar.com.br",
    "address": "Rua Marmelinho, 61 – Bairro Barreirinho – Ibirité/MG",
    "google_maps": "https://www.google.com/maps?q=-20.0282577,-44.0342789",
    "office_hours": "Terça a sexta, das 9h às 17h",

    # ------------------------------------------------------------------
    # Redes sociais
    # ------------------------------------------------------------------
    "social": {
        "instagram": "https://www.instagram.com",
        "youtube": "https://www.youtube.com",
        "facebook": "https://www.facebook.com",
    },

    # ------------------------------------------------------------------
    # SEO
    # ------------------------------------------------------------------
    "seo": {
        "site_url": "https://www.igrejacaminhar.com.br",
        "default_title": "Igreja Caminhar | Uma igreja para toda família",
        "default_description": (
            "Conheça a Igreja Caminhar. Um lugar para amar a Deus, "
            "construir relacionamentos e viver seu propósito."
        ),
        "keywords": (
            "igreja, ibirité, região metropolitana, igreja evangélica, célula, culto, "
            "adoração, proposito, Deus"
        ),
        "og_image": "/static/images/og-cover.png",
        "og_type": "website",
        "locale": "pt_BR",
    },

    # ------------------------------------------------------------------
    # Horários — renderizados na home, cultos e rodapé
    # ------------------------------------------------------------------
    "services": [
        {
            "name": "Culto de Celebração",
            "day": "Domingo",
            "time": "19:00",
            "icon": "fa-solid fa-church",
            "description": (
                "O encontro principal da família, com adoração, "
                "Palavra e edificação para todas as idades."
            ),
        },
        {
            "name": "Culto de Quarta",
            "day": "Quarta-feira",
            "time": "19:30",
            "icon": "fa-solid fa-hands-praying",
            "description": (
                "Uma noite de entrega, oração e avivamento no meio "
                "da semana."
            ),
        },
        {
            "name": "Encontro de Oração",
            "day": "Sábado",
            "time": "08:00",
            "icon": "fa-solid fa-person-praying",
            "description": (
                "Clamamos juntos pela cidade, pelas famílias e pelo "
                "propósito do Reino."
            ),
        },
    ],

    # ------------------------------------------------------------------
    # Ministérios
    # ------------------------------------------------------------------
    "ministries": [
        {
            "name": "Louvor e Adoração",
            "icon": "fa-solid fa-music",
            "slug": "louvor",
            "summary": (
                "Equipe que conduz a igreja em adoração, preparando "
                "ambientes de encontro com Deus."
            ),
        },
        {
            "name": "Intercessão",
            "icon": "fa-solid fa-hands-praying",
            "slug": "intercessao",
            "summary": (
                "Homens e mulheres que se dedicam a orar pela igreja, "
                "pela cidade e pelas nações."
            ),
        },
        {
            "name": "Geração Kids",
            "icon": "fa-solid fa-child-reaching",
            "slug": "kids",
            "summary": (
                "Ensino bíblico lúdico e seguro para o crescimento "
                "espiritual das nossas crianças."
            ),
        },
        {
            "name": "Jovens Caminhar",
            "icon": "fa-solid fa-fire-flame-curved",
            "slug": "jovens",
            "summary": (
                "Uma geração com fogo no coração do Pai, propósito e "
                "amizades que edificam."
            ),
        },
        {
            "name": "Casais e Famílias",
            "icon": "fa-solid fa-people-roof",
            "slug": "familias",
            "summary": (
                "Rotas, encontros e aconselhamento que fortalecem o "
                "casamento e a vida familiar."
            ),
        },
        {
            "name": "Acolhimento",
            "icon": "fa-solid fa-handshake-angle",
            "slug": "acolhimento",
            "summary": (
                "A primeira porta da casa: recebemos cada visitante "
                "com o amor de Cristo."
            ),
        },
    ],

    # ------------------------------------------------------------------
    # Eventos próximos
    # ------------------------------------------------------------------
    "events": [
        {
            "name": "Batismo nas Águas",
            "day": "20",
            "month": "Set",
            "time": "16:00",
            "place": "Piscina da Igreja",
            "tag": "Testemunho",
            "image": "/static/images/eventos/batismo.svg",
            "description": (
                "Um dia para celebrar a vida dos que decidiram seguir "
                "a Jesus no batismo."
            ),
        },
        {
            "name": "Café com as Famílias",
            "day": "27",
            "month": "Set",
            "time": "08:30",
            "place": "Salão de Convivência",
            "tag": "Família",
            "image": "/static/images/eventos/cafe-familias.svg",
            "description": (
                "Manhã de confraternização, integração e um café da "
                "manhã especial para toda a família."
            ),
        },
        {
            "name": "Culto de Gratidão",
            "day": "04",
            "month": "Out",
            "time": "19:00",
            "place": "Templo Central",
            "tag": "Celebração",
            "image": "/static/images/eventos/culto-gratidao.svg",
            "description": (
                "Um culto marcado por testemunhos e gratidão pelo que "
                "Deus tem feito entre nós."
            ),
        },
    ],

    # ------------------------------------------------------------------
    # Mensagens recentes (podem virar podcasts/vídeos depois)
    # ------------------------------------------------------------------
    "messages": [
        {
            "title": "Caminhos que Afloram no Deserto",
            "date": "25/08/2026",
            "speaker": "Pr. Davi Santos",
            "reference": "Isaías 43.19",
            "duration": "42 min",
            "tag": "Palavra",
            "icon": "fa-solid fa-music",
        },
        {
            "title": "O Poder de uma Vida em Comunhão",
            "date": "18/08/2026",
            "speaker": "Pr. Débora Rocha",
            "reference": "Atos 2.42-47",
            "duration": "38 min",
            "tag": "Comunhão",
            "icon": "fa-solid fa-people-group",
        },
        {
            "title": "Adorar no Meio da Luta",
            "date": "11/08/2026",
            "speaker": "Pr. Davi Santos",
            "reference": "Salmos 34.1-4",
            "duration": "45 min",
            "tag": "Adoração",
            "icon": "fa-solid fa-star-and-crescent",
        },
        {
            "title": "Construindo Famílias que Permanecem",
            "date": "04/08/2026",
            "speaker": "Pra. Larissa Andrade",
            "reference": "Josué 24.15",
            "duration": "40 min",
            "tag": "Família",
            "icon": "fa-solid fa-people-roof",
        },
        {
            "title": "Quando o Sonho Parece Demorar",
            "date": "28/07/2026",
            "speaker": "Pr. Davi Santos",
            "reference": "Gênesis 39.19-23",
            "duration": "36 min",
            "tag": "Esperança",
            "icon": "fa-solid fa-hourglass-half",
        },
    ],

    # ------------------------------------------------------------------
    # Números de impacto (home)
    # ------------------------------------------------------------------
    "stats": [
        {"value": "+850", "label": "Frequentadores", "icon": "fa-solid fa-users"},
        {"value": "6", "label": "Ministérios ativos", "icon": "fa-solid fa-hands-holding-child"},
        {"value": "12", "label": "Células em BH", "icon": "fa-solid fa-house-chimney"},
        {"value": "7", "label": "Anos de caminhada", "icon": "fa-solid fa-route"},
    ],

    # ------------------------------------------------------------------
    # Perguntas frequentes (contato)
    # ------------------------------------------------------------------
    "faq": [
        {
            "question": "Como chego à Igreja Caminhar?",
            "answer": (
                "Estamos localizados na " + "Rua Exemplo, 123 – Centro, "
                "Belo Horizonte/MG. Há estacionamento no local e vaga "
                "facilitada para pessoas com mobilidade reduzida."
            ),
        },
        {
            "question": "Há programação para crianças?",
            "answer": (
                "Sim! Durante todos os cultos, a Geração Kids recebe "
                "as crianças com atividades e ensino apropriado para "
                "cada faixa etária, em ambiente seguro."
            ),
        },
        {
            "question": "Preciso confirmar presença para visitar?",
            "answer": (
                "Não. Você é bem-vindo(a) sem avisar. Se quiser, pode "
                "entrar em contato para recebermos você como se deve."
            ),
        },
        {
            "question": "Como participo de uma célula?",
            "answer": (
                "É simples: fale conosco pelo WhatsApp ou ao final de "
                "qualquer culto. Apontaremos a célula mais próxima da "
                "sua casa para você começar a caminhar."
            ),
        },
    ],
}


# Men­sagem padrão dos botões de WhatsApp
WHATSAPP_MESSAGE = "Olá! Vim pelo site da Igreja Caminhar e gostaria de mais informações."


def whatsapp_link(message: str = None, wa_number: str = None):
    """Monta o link wa.me codificando a mensagem na URL."""
    from urllib.parse import quote

    number = wa_number or SITE_CONFIG["whatsapp"]
    base = "https://wa.me/{}".format(number)
    text = message or WHATSAPP_MESSAGE
    return "{}?text={}".format(base, quote(text))