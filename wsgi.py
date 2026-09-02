"""Ponto de entrada WSGI para produção (Hostinger / gunicorn).

A Hostinger, ao configurar uma aplicação Python (Flask), aponta o
"Entry point" para este arquivo, expondo a variável `application`.

Comando de referência (usado pela própria Hostinger):
    gunicorn --bind 0.0.0.0 --timeout 120 wsgi:application
"""

from app import create_app

application = create_app()
