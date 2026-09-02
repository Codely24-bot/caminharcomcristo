# Igreja Caminhar — Site Institucional

Site institucional da **Igreja Caminhar**, desenvolvido em **Python 3.12+** com
**Flask** e **Jinja2**. Interface sob medida: HTML semântico, CSS moderno
(Grid/Flexbox, variáveis, `clamp()`, `backdrop-filter`), animações discretas com
Intersection Observer e muito SEO.

## Tecnologias

- Python 3.12+
- Flask + Jinja2
- HTML5 / CSS3 / JavaScript (vanilla)
- python-dotenv
- gunicorn (produção)

## Como rodar

```bash
pip install -r requirements.txt
python app.py
```

Acesse <http://127.0.0.1:5000>.

> Para alterar os dados do site (horários, ministérios, contatos, eventos,
> mensagens, redes sociais), edite apenas o arquivo **`data/site_config.py`**.
> Nada de telefone/endereço espalhado nos templates.

## Variáveis de ambiente

Copie `.env.example` para `.env` e ajuste:

| Variável     | Descrição                                   |
| ------------ | ------------------------------------------- |
| `SECRET_KEY` | Chave de sessões/CSRF. **Mude em produção.** |
| `PORT`       | Porta local (padrão 5000).                  |
| `DEBUG`      | `true` em desenvolvimento, `false` em produção. |

## Estrutura

```
├── app.py                 # entrada (python app.py)
├── requirements.txt
├── .env / .env.example
├── data/
│   └── site_config.py     # TODO o conteúdo do site
└── app/
    ├── __init__.py        # create_app()
    ├── config.py          # config via .env
    ├── routes.py          # rotas + formulário de contato + SEO
    ├── contact_service.py # preparado para SMTP/Resend/SendGrid/WhatsApp API
    ├── templates/         # base.html, páginas e componentes
    └── static/            # css / js / images
```

## WhatsApp

O link `wa.me` é gerado automaticamente a partir de
`data/site_config.py` (chave `whatsapp`, somente números com DDI) com a
mensagem pré-preenchida e codificada na URL.

## Formulário de contato

`POST /contato` valida **nome, telefone, e-mail e mensagem** no Python (com
proteção CSRF). Hoje a mensagem é registrada nos logs; o arquivo
`app/contact_service.py` já está estruturado para integrar **SMTP, Resend,
SendGrid ou WhatsApp Business API** no futuro.

## SEO

Título, meta description, canonical, Open Graph, og:image, favicon, `alt` em
imagens e HTML semântico são gerados por página via Jinja2 (ver
`app/routes.py` → `PAGES` e `app/templates/base.html`).

## Deploy

### Render (ou Railway)

- **Build command:** `pip install -r requirements.txt`
- **Start command:** `gunicorn app:app`
- Crie uma variável `SECRET_KEY` (valor aleatório).

### PythonAnywhere

1. Faça upload do projeto.
2. Crie um virtualenv e rode `pip install -r requirements.txt`.
3. WSGI configuration file:
   ```python
   import sys
   sys.path.insert(0, "/home/<seu-usuario>/caminhar")
   from app import create_app
   application = create_app()
   ```

### VPS / Docker

```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
ENV DEBUG=false
EXPOSE 8000
CMD ["gunicorn", "-b", "0.0.0.0:8000", "app:app"]
```

## Performance e responsividade

- Imagens em SVG leve, `loading="lazy"` fora do primeiro viewport e
  `fetchpriority="high"` no hero.
- Mobile-first, sem scroll horizontal, testado de 360px a 1920px.
- Animações respeitam `prefers-reduced-motion`.