# Deploy na Hostinger (Node.js/Express + Conector Git)

> **Importante:** este site é **Node.js/Express**, **não Python**. Na
> Hostinger ele roda como uma **aplicação Node.js** (processo `node server.js`).
> O Conector apenas sincroniza os arquivos do GitHub; o servidor Node é
> quem sobe a aplicação.

Dois caminhos na Hostinger. Use o que se encaixa no seu plano.

---

## Opção A — Hospedagem Compartilhada (painel `Websites > Node.js`)

### 1. Criar a aplicação Node.js
No painel Hostinger, em **Websites → Node.js** (hPanel), clique em
**Create application** e preencha:

| Campo | Valor |
| --- | --- |
| Node.js version | `20.x` ou `22.x` (LTS) |
| Application root | `public_html` (ou a subpasta criada pelo conector, ex.: `public_html/caminharcomcristo`) |
| Application URL | seu domínio |
| Application startup file | `server.js` |
| **Static assets path** | `public_html/app/static` (importante p/ CSS/JS/imagens) |

### 2. Instalar dependências
A Hostinger executa o `npm install` automaticamente usando o
`package.json` quando a aplicação é criada/atualizada. Confirme nos
**Logs** que express, nunjucks, cookie-parser e dotenv foram instalados.

### 3. Configurar variáveis de ambiente
No painel Node.js, adicione:

| Variável | Valor |
| --- | --- |
| `PORT` | a porta que a Hostinger indicar para a aplicação |
| `DEBUG` | `false` |

> Em produção, é recomendado `NODE_ENV=production` para servir com
> cache de templates habilitado.

### 4. Conectar o GitHub (Conector)
Em **Websites → Git**, conecte o repositório
`Codely24-bot/caminharcomcristo` no branch `master`. A cada `git push`
a Hostinger sincroniza os arquivos automaticamente.

---

## Opção B — VPS (Ubuntu + Nginx) — recomendado para controle total

```bash
# 1. Instalar Node.js LTS + Nginx
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs nginx git

# 2. Clonar o projeto
cd /var/www
sudo git clone https://github.com/Codely24-bot/caminharcomcristo.git
cd caminharcomcristo

# 3. Instalar dependências
sudo npm ci --omit=dev

# 4. Variáveis de ambiente (produção)
#   Crie um arquivo .env na raiz com PORT=5000 e DEBUG=false
```

### Serviço systemd
Crie `/etc/systemd/system/caminhar.service`:

```ini
[Unit]
Description=Express - Igreja Caminhar
After=network.target

[Service]
User=www-data
WorkingDirectory=/var/www/caminharcomcristo
Environment=NODE_ENV=production
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10

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

- **`server.js`** — entrada da aplicação Express (lê `PORT` e `DEBUG` do `.env`).
- **`package.json`** — dependências e script `npm start` (`node server.js`).
- **`src/`** — rotas, configuração do site, serviço bíblico e templates Nunjucks.
- **Serviço bíblico** — usa a API pública `bible-api.com` (sem chave).
- **Estáticos** — servidos de `app/static` pela rota `/static`.

> Os arquivos Python antigos (`wsgi.py`, `requirements.txt`, `app.py`) e o
> `Procfile` foram removidos na migração para Node.

## Verificação pós-deploy

1. Abra o domínio e confira o site (home, sobre, cultos, eventos, mensagens).
2. Teste o `POST /contato` (o formulário deve validar e redirecionar com a mensagem de sucesso).
3. Confira o versículo do dia em `/mensagens` (chama a API bíblica).
4. Veja os logs da aplicação no painel se algo falhar.

## Observação: HTTPS/SSL

Ative o **SSL gratuito (Let's Encrypt)** no painel Hostinger ou via
`certbot` no VPS. Atualize `site.seo.site_url` em `src/config.js`
para `https://` depois.