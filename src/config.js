"use strict";

// ----------------------------------------------------------------------
// Configuração central do site.
// Todos os dados exibidos (contatos, horários, ministérios, eventos,
// mensagens, redes sociais) devem ser editados aqui.
// ----------------------------------------------------------------------

const SITE_CONFIG = {
  church_name: "Igreja Caminhar",
  short_name: "Caminhar",
  tagline:
    "Uma igreja que ama a Deus, valoriza pessoas e caminha junto para transformar vidas.",
  description:
    "Conheça a Igreja Caminhar. Um lugar para amar a Deus, construir relacionamentos e viver seu propósito.",
  founded: "2018",
  followers_label: "+850 pessoas caminhando conosco",

  whatsapp: "5531999999999",
  phone: "(31) 99999-9999",
  email: "contato@igrejacaminhar.com.br",
  address: "Rua Marmelinho, 61 – Bairro Barreirinho – Ibirité/MG",
  google_maps: "https://www.google.com/maps?q=-20.0282577,-44.0342789",
  office_hours: "Terça a sexta, das 9h às 17h",

  social: [
    { name: "instagram", url: "https://www.instagram.com" },
    { name: "youtube", url: "https://www.youtube.com" },
    { name: "facebook", url: "https://www.facebook.com" },
  ],

  seo: {
    site_url: "https://www.igrejacaminhar.com.br",
    default_title: "Igreja Caminhar | Uma igreja para toda família",
    default_description:
      "Conheça a Igreja Caminhar. Um lugar para amar a Deus, construir relacionamentos e viver seu propósito.",
    keywords:
      "igreja, ibirité, região metropolitana, igreja evangélica, célula, culto, adoração, proposito, Deus",
    og_image: "/static/images/og-cover.png",
    og_type: "website",
    locale: "pt_BR",
  },

  services: [
    {
      name: "Culto de Celebração",
      day: "Domingo",
      time: "19:00",
      icon: "fa-solid fa-church",
      description:
        "O encontro principal da família, com adoração, Palavra e edificação para todas as idades.",
    },
    {
      name: "Culto de Quarta",
      day: "Quarta-feira",
      time: "19:30",
      icon: "fa-solid fa-hands-praying",
      description: "Uma noite de entrega, oração e avivamento no meio da semana.",
    },
    {
      name: "Encontro de Oração",
      day: "Sábado",
      time: "08:00",
      icon: "fa-solid fa-person-praying",
      description:
        "Clamamos juntos pela cidade, pelas famílias e pelo propósito do Reino.",
    },
  ],

  ministries: [
    {
      name: "Louvor e Adoração",
      icon: "fa-solid fa-music",
      slug: "louvor",
      summary:
        "Equipe que conduz a igreja em adoração, preparando ambientes de encontro com Deus.",
      description:
        "O nosso ministério de louvor existe para conduzir cada culto como um encontro real com Deus. Músicos, cantores e técnicos que se preparam com excelência, unidade e um coração adorador, para que a igreja entre na presença e cante a grandeza do Senhor.",
      points: [
        "Vocais, teclado, violão, guitarra, baixo e bateria",
        "Operação de som, mídia e projeção",
        "Ensaios semanais e crescimento musical",
        "Ambiente de adoração em todos os cultos",
      ],
      verse: {
        text: "Louvai ao Senhor, porque ele é bom, porque a sua benignidade dura para sempre.",
        ref: "Salmos 106.1",
      },
      schedule: "Ensaios aos sábados, às 16h",
      image: "",
    },
    {
      name: "Intercessão",
      icon: "fa-solid fa-hands-praying",
      slug: "intercessao",
      summary:
        "Homens e mulheres que se dedicam a orar pela igreja, pela cidade e pelas nações.",
      description:
        "A Intercessão é o coração da nossa casa. Homens e mulheres que se colocam diante de Deus em oração pela igreja, pelas famílias, pela cidade e pelas nações. São os que sustentam cada reunião, cada decisão e cada pessoa que chega ao Caminhar.",
      points: [
        "Escala semanal de oração",
        "Vigílias e madrugadas de oração",
        "Intercessão por todos os cultos",
        "Oração pelos pedidos da igreja",
      ],
      verse: {
        text: "Invoca-me, e te responderei; e anunciar-te-ei coisas grandes e firmes, que não sabes.",
        ref: "Jeremias 33.3",
      },
      schedule: "Encontro de oração aos sábados, às 8h",
      image: "",
    },
    {
      name: "Geração Kids",
      icon: "fa-solid fa-child-reaching",
      slug: "kids",
      summary:
        "Ensino bíblico lúdico e seguro para o crescimento espiritual das nossas crianças.",
      description:
        "A Geração Kids recebe as crianças com amor, segurança e ensino bíblico criativo em todos os cultos. Aqui elas aprendem, brincam e descobrem, desde cedo, o quanto Deus é bom — enquanto os pais participam do culto com o coração tranquilo.",
      points: [
        "Berçário e turmas por faixa etária",
        "Ensino bíblico lúdico e seguro",
        "Músicas, histórias e brincadeiras",
        "Professores capacitados e voluntários",
      ],
      verse: {
        text: "Ensina a criança no caminho em que deve andar, e, ainda quando for velho, não se desviará dele.",
        ref: "Provérbios 22.6",
      },
      schedule: "Durante todos os cultos",
      image: "",
    },
    {
      name: "Jovens Caminhar",
      icon: "fa-solid fa-fire-flame-curved",
      slug: "jovens",
      summary:
        "Uma geração com fogo no coração do Pai, propósito e amizades que edificam.",
      description:
        "O Jovens Caminhar é uma geração com fogo no coração do Pai. Encontros que misturam adoração, Palavra, propósito e amizades que edificam. Um lugar para você ser visto, crescer e impactar a sua geração para Jesus.",
      points: [
        "Encontros semanais da juventude",
        "Cultos e conferências de jovens",
        "Discipulado e mentoria",
        "Missões, ações sociais e evangelismo",
      ],
      verse: {
        text: "Não temas, porque eu sou contigo; não te assombres, porque eu sou o teu Deus; eu te fortaleço, e te ajudo, e te sustento com a destra da minha justiça.",
        ref: "Isaías 41.10",
      },
      schedule: "Encontros aos sábados, às 19h",
      image: "",
    },
    {
      name: "Casais e Famílias",
      icon: "fa-solid fa-people-roof",
      slug: "familias",
      summary:
        "Rotas, encontros e aconselhamento que fortalecem o casamento e a vida familiar.",
      description:
        "O ministério de Casais e Famílias caminha ao lado de cada lar. Vivemos encontros, rotas e aconselhamento que fortalecem o casamento, a criação dos filhos e a vida em família, ajudando cada casa a ser um pedacinho do Reino aqui na terra.",
      points: [
        "Encontros de casais e celebrações",
        "Rotas de casais e famílias",
        "Aconselhamento e discipulado familiar",
        "Estudos sobre criação de filhos",
      ],
      verse: {
        text: "Eu e a minha casa serviremos ao Senhor.",
        ref: "Josué 24.15",
      },
      schedule: "Reunião mensal e rotas contínuas",
      image: "",
    },
    {
      name: "Acolhimento",
      icon: "fa-solid fa-handshake-angle",
      slug: "acolhimento",
      summary:
        "A primeira porta da casa: recebemos cada visitante com o amor de Cristo.",
      description:
        "O Acolhimento é a primeira porta da nossa casa. Somos recepção, sorriso, abraço e orientação — para que todo visitante se sinta esperado, cuidado e com vontade de voltar. É gente que ama receber pessoas da mesma forma que Deus nos recebe.",
      points: [
        "Recepção na entrada dos cultos",
        "Boas-vindas e orientação a visitantes",
        "Café e espaço de convivência",
        "Acompanhamento de novos frequentadores",
      ],
      verse: {
        text: "Portanto, recebei-vos uns aos outros, como também Cristo nos recebeu, para glória de Deus.",
        ref: "Romanos 15.7",
      },
      schedule: "Todos os cultos, 30 minutos antes",
      image: "images/ministerios/Voluntarios.jpeg",
    },
  ],

  events: [
    {
      name: "Batismo nas Águas",
      day: "20",
      month: "Set",
      time: "16:00",
      place: "Piscina da Igreja",
      tag: "Testemunho",
      image: "/static/images/eventos/batismo.svg",
      description: "Um dia para celebrar a vida dos que decidiram seguir a Jesus no batismo.",
    },
    {
      name: "Café com as Famílias",
      day: "27",
      month: "Set",
      time: "08:30",
      place: "Salão de Convivência",
      tag: "Família",
      image: "/static/images/eventos/cafe-familias.svg",
      description:
        "Manhã de confraternização, integração e um café da manhã especial para toda a família.",
    },
    {
      name: "Culto de Gratidão",
      day: "04",
      month: "Out",
      time: "19:00",
      place: "Templo Central",
      tag: "Celebração",
      image: "/static/images/eventos/culto-gratidao.svg",
      description:
        "Um culto marcado por testemunhos e gratidão pelo que Deus tem feito entre nós.",
    },
  ],

  messages: [
    {
      title: "Caminhos que Afloram no Deserto",
      date: "25/08/2026",
      speaker: "Pr. Davi Santos",
      reference: "Isaías 43.19",
      duration: "42 min",
      tag: "Palavra",
      icon: "fa-solid fa-music",
    },
    {
      title: "O Poder de uma Vida em Comunhão",
      date: "18/08/2026",
      speaker: "Pr. Débora Rocha",
      reference: "Atos 2.42-47",
      duration: "38 min",
      tag: "Comunhão",
      icon: "fa-solid fa-people-group",
    },
    {
      title: "Adorar no Meio da Luta",
      date: "11/08/2026",
      speaker: "Pr. Davi Santos",
      reference: "Salmos 34.1-4",
      duration: "45 min",
      tag: "Adoração",
      icon: "fa-solid fa-star-and-crescent",
    },
    {
      title: "Construindo Famílias que Permanecem",
      date: "04/08/2026",
      speaker: "Pra. Larissa Andrade",
      reference: "Josué 24.15",
      duration: "40 min",
      tag: "Família",
      icon: "fa-solid fa-people-roof",
    },
    {
      title: "Quando o Sonho Parece Demorar",
      date: "28/07/2026",
      speaker: "Pr. Davi Santos",
      reference: "Gênesis 39.19-23",
      duration: "36 min",
      tag: "Esperança",
      icon: "fa-solid fa-hourglass-half",
    },
  ],

  stats: [
    { value: "+850", label: "Frequentadores", icon: "fa-solid fa-users" },
    { value: "6", label: "Ministérios ativos", icon: "fa-solid fa-hands-holding-child" },
    { value: "12", label: "Células em BH", icon: "fa-solid fa-house-chimney" },
    { value: "7", label: "Anos de caminhada", icon: "fa-solid fa-route" },
  ],

  faq: [
    {
      question: "Como chego à Igreja Caminhar?",
      answer:
        "Estamos localizados na Rua Marmelinho, 61 – Bairro Barreirinho – Ibirité/MG. Há estacionamento no local e vaga facilitada para pessoas com mobilidade reduzida.",
    },
    {
      question: "Há programação para crianças?",
      answer:
        "Sim! Durante todos os cultos, a Geração Kids recebe as crianças com atividades e ensino apropriado para cada faixa etária, em ambiente seguro.",
    },
    {
      question: "Preciso confirmar presença para visitar?",
      answer:
        "Não. Você é bem-vindo(a) sem avisar. Se quiser, pode entrar em contato para recebermos você como se deve.",
    },
    {
      question: "Como participo de uma célula?",
      answer:
        "É simples: fale conosco pelo WhatsApp ou ao final de qualquer culto. Apontaremos a célula mais próxima da sua casa para você começar a caminhar.",
    },
  ],
};

const WHATSAPP_MESSAGE =
  "Olá! Vim pelo site da Igreja Caminhar e gostaria de mais informações.";

function whatsappLink(message, waNumber) {
  const number = waNumber || SITE_CONFIG.whatsapp;
  const text = message || WHATSAPP_MESSAGE;
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

module.exports = { SITE_CONFIG, WHATSAPP_MESSAGE, whatsappLink };
