# Deploy na Hostinger (Python + Conector Git)

> **Importante:** este site é **Python/Flask**, **não Node.js**. Na
> Hostinger ele roda como uma **aplicação Python (WSGI)** servida por
> **gunicorn**. O Conector apenas sincroniza os arquivos do GitHub; o
> servidor Python é quem sobe a aplicação.

Existem dois caminhos na Hostinger. Use o que se encaixa no seu plano.

---

## Opção A — Hospedagem Compartilhada (painel `Websites > Python`)

### 1. Criar a aplicação Python
No painel Hostinger, em **Websites → Python** (hPanel), clique em
**Create application** e preencha:

| Campo | Valor |
| --- | --- |
| Python version | `3.12` (ou a mais recente disponível) |
| Application root | `public_html` (ou usa a pasta criada pelo conector) |
| Application URL | seu domínio |
| Application startup file | `wsgi.py` |
| Application entry point | `application` |
| **Static assets path** | `public_html/app/static` (importante p/ CSS/JS/imagens) |

> Com o **Conector Git**, os arquivos chegam na pasta do projeto. Se o
> conector criar uma subpasta (ex.: `public_html/caminharcomcristo`),
> ajuste o *Application root* para essa subpasta.

### 2. Instalar dependências
A Hostinger instala o `requirements.txt` automaticamente quando a
aplicação Python é criada/atualizada. Confirme em **Logs** que Flask,
python-dotenv e gunicorn foram instalados.

### 3. Configurar variáveis de ambiente
No painel Python, adicione (pelo menos):

| Variável | Valor |
| --- | --- |
| `SECRET_KEY` | uma string longa e aleatória |
| `DEBUG` | `false` |
| `PORT` | `5000` (ou a porta que a Hostinger indicar) |

> O app lê `SECRET_KEY`, `DEBUG` e `PORT` de `.env` ou das variáveis do
> painel (via `os.getenv` em `app/config.py`).

### 4. Conectar o GitHub (Conector)
Em **Websites → Git**, conecte o repositório
`Codely24-bot/caminharcomcristo` no branch `master`. A cada `git push`
a Hostinger sincroniza os arquivos automaticamente.

---

## Opção B — VPS (Ubuntu + Nginx) — recomendado para controle total

```bash
# 1. Atualizar e instalar Python + Nginx
sudo apt update && sudo apt install -y python3 python3-venv python3-pip nginx git

# 2. Clonar o projeto
cd /var/www
sudo git clone https://github.com/Codely24-bot/caminharcomcristo.git
cd caminharcomcristo

# 3. Ambiente virtual + dependências
sudo python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

# 4. Variáveis de ambiente (produção)
#   Crie um arquivo .env na raiz com SECRET_KEY forte e DEBUG=false
```

### Serviço systemd (gunicorn)
Crie `/etc/systemd/system/caminhar.service`:

```ini
[Unit]
Description=Gunicorn - Igreja Caminhar
After=network.target

[Service]
User=www-data
WorkingDirectory=/var/www/caminharcomcristo
ExecStart=/var/www/caminharcomcristo/venv/bin/gunicorn --bind 0.0.0.0:5000 --timeout 120 --workers 3 wsgi:application
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable caminhar
sudo systemctl start caminhar
```

### Nginx (proxy reverso)
Crie `/etc/nginx/sites-available/caminhar`:

```nginx
server {
    listen 80;
    server_name seu-dominio.com.br;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /static/ {
        alias /var/www/caminharcomcristo/app/static/;
        expires 30d;
        add_header Cache-Control "public";
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/caminhar /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## Arquivos usados em produção

- **`wsgi.py`** — entry point (variável `application` para gunicorn).
- **`Procfile`** — documenta o comando gunicorn (convenção de build).
- **`requirements.txt`** — Flask, python-dotenv, gunicorn.
- **`app/config.py`** — lê `SECRET_KEY`, `DEBUG`, `PORT` do ambiente.

## Verificação pós-deploy

1. Abra o domínio e confira o site (home, sobre, cultos, eventos, mensagens).
2. Teste o `POST /contato` (o formulário deve validar e redirecionar).
3. Confira o versículo do dia em `/mensagens` (chama a API bíblica).
4. Veja os logs da aplicação no painel se algo falhar.

## Observação: HTTPS/SSL

Ative o **SSL gratuito (Let's Encrypt)** no painel Hostinger ou via
`certbot` no VPS. Atualize `site.seo.site_url` no `data/site_config.py`
para `https://` depois.
