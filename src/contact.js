"use strict";

// ----------------------------------------------------------------------
// Modelo de envio de mensagens de contato.
//
// Hoje a função apenas registra a mensagem nos logs, para que o fluxo
// do site funcione sem depender de serviço pago. Estrutura preparada
// para integrar futuramente: SMTP (nodemailer), Resend, SendGrid,
// WhatsApp Business API.
// ----------------------------------------------------------------------

function dispatchContactMessage({ name, email, phone, message }) {
  const oneLine = (message || "").replace(/\s+/g, " ").slice(0, 200);
  console.log(`[CONTATO] ${name} | ${email} | ${phone} | ${oneLine}`);

  // ------------------------------------------------------------------
  // Exemplo futuro com SMTP — basta configurar as variáveis no .env
  // e instalar o nodemailer:
  //
  // const nodemailer = require("nodemailer");
  // const transporter = nodemailer.createTransport({
  //   host: process.env.MAIL_HOST,
  //   port: Number(process.env.MAIL_PORT || 587),
  //   secure: false,
  //   auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS },
  // });
  // await transporter.sendMail({
  //   from: process.env.MAIL_FROM,
  //   to: process.env.MAIL_TO,
  //   subject: `Novo contato pelo site — ${name}`,
  //   text: `Nome: ${name}\nE-mail: ${email}\nTelefone: ${phone}\n\n${message}`,
  // });
  // ------------------------------------------------------------------

  return true;
}

module.exports = { dispatchContactMessage };