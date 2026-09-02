import os

from dotenv import load_dotenv

# Carrega o arquivo .env da raiz do projeto
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), os.pardir))
load_dotenv(os.path.join(BASE_DIR, ".env"))


class Config:
    """Configurações globais da aplicação."""

    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-change-me")
    DEBUG = os.getenv("DEBUG", "false").lower() in ("1", "true", "yes")
    PORT = int(os.getenv("PORT", "5000"))

    # Máximo de bytes enviados pelo formulário de contato
    MAX_CONTENT_LENGTH = 1 * 1024 * 1024