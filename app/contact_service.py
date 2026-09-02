"""Modelo de envio de mensagens de contato.

Estrutura preparada para integrar futuramente:
- SMTP (smtplib)
- Resend
- SendGrid
- WhatsApp Business API

Hoje a função apenas registra a mensagem nos logs, para que o
fluxo do site funcione sem depender de serviço pago.
"""

from flask import current_app


def dispatch_contact_message(name, email, phone, message):
    """Recebe um contato do site e dispara o canal configurado."""
    current_app.logger.info(
        "[CONTATO] %s | %s | %s | %s",
        name,
        email,
        phone,
        message.replace("\n", " ")[:200],
    )
    # ------------------------------------------------------------------
    # Exemplo futuro com SMTP — basta configurar as variáveis no .env
    #
    # import smtplib
    # from email.message import EmailMessage
    # msg = EmailMessage()
    # msg["Subject"] = f"Novo contato pelo site — {name}"
    # msg["From"] = current_app.config["MAIL_FROM"]
    # msg["To"] = current_app.config["MAIL_TO"]
    # msg.set_content(f"Nome: {name}\nE-mail: {email}\nTelefone: {phone}\n\n{message}")
    # with smtplib.SMTP(host, port) as server:
    #     server.starttls()
    #     server.login(user, password)
    #     server.send_message(msg)
    # ------------------------------------------------------------------
    return True