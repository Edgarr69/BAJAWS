// ─────────────────────────────────────────────────────────────────────────────
// Archivo centralizado de contenido — Baja Wastewater Solution
// Edita aquí para actualizar el contenido de todo el sitio.
// ─────────────────────────────────────────────────────────────────────────────

/** Año de inicio de operaciones — fuente única de verdad para los años de experiencia */
export const FOUNDING_YEAR = 2009;

/** Años completos de operación desde FOUNDING_YEAR hasta hoy */
export function getYearsExperience(): number {
  return new Date().getFullYear() - FOUNDING_YEAR;
}

export const siteContent = {
  company: {
    name: "Baja Wastewater Solution",
    tagline: "Empresa tratadora de aguas industriales residuales",
    domain: "bajaws.com.mx",
    foundingYear: FOUNDING_YEAR,
  },

  // ── Navegación ─────────────────────────────────────────────────────────────
  nav: {
    links: [
      { label: "Inicio",          href: "/" },
      { label: "Nosotros",        href: "/nosotros" },
      { label: "Servicios",       href: "/servicios" },
      { label: "Certificaciones", href: "/autorizaciones" },
      { label: "Contacto",        href: "/contacto" },
    ],
  },

  footer: {
    links: [
      { label: "Inicio",   href: "/" },
      { label: "Contacto", href: "/contacto" },
      { label: "Nosotros", href: "/nosotros" },
    ],
  },

  // ── Inicio ─────────────────────────────────────────────────────────────────
  home: {
    title: "UNA EMPRESA DE SOLUCIONES",
    description:
      "En Baja Wastewater Solution, creemos que cada gota de agua cuenta, por eso nos dedicamos a dar tratamiento a este vital líquido, buscando generar un impacto positivo duradero en el ecosistema, a través de la innovación, la tecnología de vanguardia y nuestro compromiso con el medio ambiente, trabajamos para ofrecer soluciones que no solo benefician a nuestros clientes, sino que también contribuyen al cuidado de nuestro planeta.",
    stats: [
      { value: "14+",  label: "Años de experiencia" },
      { value: "8",    label: "Autorizaciones vigentes" },
      { value: "3",    label: "Servicios especializados" },
      { value: "100%", label: "Compromiso ambiental" },
    ],
    ctas: [
      { label: "Solicitar cotización", href: "#cotizacion",   variant: "secondary"  as const },
      { label: "Nuestros servicios",   href: "/servicios",    variant: "secondary" as const },
    ],
    meta: {
      title: "Inicio | Baja Wastewater Solution",
      description:
        "Baja Wastewater Solution — empresa de soluciones para el tratamiento de aguas residuales industriales en Baja California.",
    },
  },

  // ── Servicios ──────────────────────────────────────────────────────────────
  services: {
    title: "SERVICIOS",
    intro:
      "Contamos con diversas soluciones en el manejo de residuos industriales tales como líquidos, solidos y semisólidos. Explora nuestras opciones y coméntanos.",
    question: "¿Como podemos trabajar juntos?",
    cta: "CONTÁCTANOS Y TRABAJEMOS JUNTOS",
    ctaHref: "/contacto",
    items: [
      {
        id:    "recoleccion",
        title: "RECOLECCIÓN Y TRANSPORTE",
        description:
          "Flotilla autorizada para recolectar y trasladar residuos peligrosos y de manejo especial a los destinos autorizados, brindando un servicio integral y tranquilidad a nuestros clientes.",
        icon: "truck" as const,
      },
      {
        id:    "tratamiento",
        title: "TRATAMIENTO DE AGUAS RESIDUALES",
        description:
          "Tratamos aguas residuales industriales como sitio de disposición final mediante procesos físico-químicos monitoreados con análisis de calidad, asegurando la eficiencia del servicio.",
        icon: "water" as const,
      },
      {
        id:    "acopio",
        title: "ACOPIO TEMPORAL",
        description:
          "Almacenes para acopio de grandes volúmenes de residuos peligrosos con estrategias de segregación hacia los distintos sitios de disposición, garantizando disponibilidad continua del servicio.",
        icon: "warehouse" as const,
      },
      {
        id:    "reciclaje",
        title: "RECICLAJE Y REVALORIZACIÓN",
        description:
          "Identificamos corrientes valorizables de residuos peligrosos para recuperar materiales y reducir la disposición final, minimizando el impacto ambiental de tu operación.",
        icon: "recycle" as const,
      },
      {
        id:    "remediacion",
        title: "SERVICIOS DE REMEDIACIÓN",
        description:
          "Diagnóstico, diseño y ejecución de proyectos de remediación de suelos y cuerpos de agua contaminados, apegados a normatividad vigente y con tecnologías probadas.",
        icon: "remediation" as const,
      },
      {
        id:    "residuos-especiales",
        title: "RESIDUOS DE MANEJO ESPECIAL",
        description:
          "Gestión responsable de residuos no peligrosos de origen industrial: chatarra, plásticos, lodos y otros materiales, en cumplimiento con la normatividad estatal aplicable.",
        icon: "special-waste" as const,
      },
    ],
    meta: {
      title: "Servicios | Baja Wastewater Solution",
      description:
        "Servicios de recolección y transporte, tratamiento de aguas residuales y acopio de residuos industriales en Baja California.",
    },
  },

  // ── Nosotros ───────────────────────────────────────────────────────────────
  nosotros: {
    title: "NOSOTROS",
    paragraphs: [
      "Baja Wastewater Solutions inicia sus operaciones en 2009 como una empresa dedicada a proveer soluciones en el manejo de residuos industriales bajo la modalidad de tratamiento de aguas residuales.",
      "Consolidamos nuestras operaciones incorporando la recolección controlada y el transporte local y foráneo de residuos industriales peligrosos y de manejo especial, tanto líquidos como sólidos y semisólidos, teniendo siempre presente el tratamiento de aguas residuales como proceso productivo principal, colaborando así para mantener el ciclo de vida de este vital líquido.",
      "Para nuestro equipo es bastante importante el compromiso en la prestación de nuestros servicios teniendo en cuenta que formamos parte del proceso productivo de nuestros clientes. Contamos con clientes de gran prestigio con relaciones que superan los 14 años.",
    ],
    mision: {
      title: "MISIÓN",
      text: "Proporcionar a nuestros clientes los métodos más eficaces de recuperación, tratamiento de reciclaje que existen en el mercado, para proteger y mejorar el medio ambiente, con los más altos estándares al precio más competitivo, en colaboración con los sitios de reciclaje de más alto prestigio en México.",
    },
    vision: {
      title: "VISIÓN",
      text: "Nuestra visión de proporcionar continuamente el servicio más eficaz en el tratamiento, reciclaje y recuperación de recursos, así como promover el cumplimiento puntual de la normatividad ambiental utilizando las mejores tecnologías que protejan y mejoren nuestro planeta tierra.",
    },
    meta: {
      title: "Nosotros | Baja Wastewater Solution",
      description:
        "Conoce la historia, misión y visión de Baja Wastewater Solution — más de 14 años de experiencia en tratamiento de residuos industriales en Baja California.",
    },
  },

  // ── Autorizaciones ─────────────────────────────────────────────────────────
  autorizaciones: {
    title: "AUTORIZACIONES",
    intro:
      "Contamos con las autorizaciones necesarias emitidas por autoridades locales, estatales y federales competentes, para llevar a cabo nuestros servicios de manejo de residuos de forma segura y confiable, siempre procurando cumplir cabalmente con las disposiciones establecidas en las normas, leyes y reglamentos que rigen en nuestro país.",
    columns: [
      "Clasificación",
      "Dependencia",
      "Modalidad",
      "Residuo",
      "No. Autorización",
      "Vigencia",
    ] as const,
    rows: [
      ["Peligrosos",      "SEMARNAT", "Transporte", "Residuos líquidos, sólidos y semisólidos CTI",          "02-004-PS-I-05-D-2015",           "26/10/2025"],
      ["Peligrosos",      "SEMARNAT", "Acopio",     "Residuos líquidos, sólidos y semisólidos CTI",          "02-004-PS-II-12-D-2009",          "25/02/2029"],
      ["Peligrosos",      "SEMARNAT", "Acopio",     "Residuos líquidos, sólidos y semisólidos CTI",          "02-004-PS-II-06-D-2014",          "26/06/2034"],
      ["Peligrosos",      "SEMARNAT", "Tratamiento","Residuos líquidos acuosos CT",                          "02-V-20-21 PRORROGA",             "28/07/2031"],
      ["Manejo especial", "SMADS BC", "Transporte", "Residuos líquidos, sólidos y semisólidos no peligrosos","PS/TIJ-256/19",                   "En renovación"],
      ["Aguas residuales","CESPT",    "Descarga",   "Aguas residuales tratadas",                             "TIJ-5-001/5/16",                  "21/03/2025"],
      ["General",         "SEMAR",    "Manejo",     "Residuos líquidos, sólidos y semisólidos CTI",          "UNICAPAM-MIYII-ENSE-003",         "24/06/2029"],
      ["General",         "SCT",      "Transporte", "Carga general líquida, sólida o semisólida",            "0202AALJ01092015230301000",       "Indefinido"],
    ] as string[][],
    meta: {
      title: "Autorizaciones | Baja Wastewater Solution",
      description:
        "Autorizaciones oficiales de Baja Wastewater Solution emitidas por SEMARNAT, CESPT, SEMAR y SCT para el manejo seguro de residuos industriales.",
    },
  },

  // ── Contacto ───────────────────────────────────────────────────────────────
  contacto: {
    title: "CONTACTO",
    intro:
      "En Baja Wastewater Solution, nos complace asistirte a través de nuestro formulario de contacto o cualquiera de nuestros canales tradicionales. Estamos aquí para responder a tus consultas y brindarte el mejor servicio posible.",
    info: {
      direccion: "Fray Junípero Serra No.17501, Garita de Otay, Tijuana B.C. 22430",
      telefono:  "(664) 647 5020",
      correo:    "damian@bajaws.com.mx",
      correo2:   "yperalta@bajaws.com.mx",
      horario:   "Lunes a Viernes 8:00 AM a 5:00 PM",
    },
    honeypotLabel: "Si eres humano, deja este campo en blanco.",
    meta: {
      title: "Contacto | Baja Wastewater Solution",
      description:
        "Contáctanos en Baja Wastewater Solution. Dirección: Fray Junípero Serra No.17501, Garita de Otay, Tijuana B.C. Teléfono: (664) 647 5020.",
    },
  },

  // ── Landing Page ───────────────────────────────────────────────────────────
  landing: {
    hero: {
      badge: "Empresa autorizada · SEMARNAT · CESPT · SEMAR · SCT",
      title: "Tratamiento de Aguas Residuales Industriales en Baja California",
      subtitle:
        "Cumplimiento normativo garantizado, procesos físico-químicos certificados y más de 14 años de experiencia respaldando la industria de Baja California.",
      cta:    "Solicitar Cotización",
      ctaHref:"#cotizacion",
    },
    problema: {
      title: "¿Tu empresa genera aguas residuales industriales?",
      items: [
        {
          titulo:     "Cumplimiento ambiental obligatorio",
          descripcion:"Las industrias en México están sujetas a estrictas normas ambientales (NOM-001-SEMARNAT, NOM-002-SEMARNAT). El incumplimiento puede resultar en multas millonarias y cierre de operaciones.",
        },
        {
          titulo:     "Manejo correcto de residuos líquidos",
          descripcion:"Los residuos líquidos industriales requieren tratamiento especializado antes de su disposición final. Un manejo inadecuado contamina suelo, agua subterránea y cuerpos de agua.",
        },
        {
          titulo:     "Riesgos del incumplimiento",
          descripcion:"Las sanciones por incumplimiento ambiental incluyen clausura temporal o definitiva, multas millonarias y responsabilidad penal para directivos.",
        },
      ],
    },
    solucion: {
      title:      "Nuestra Solución",
      description:"Nuestra solución principal se enfoca en el tratamiento de aguas residuales industriales como sitio de disposición final por medio de procesos físico-químicos, los cuales son monitoreados mediante análisis de calidad del agua como medida de control para asegurar la eficiencia de nuestro servicio.",
    },
    beneficios: {
      title: "¿Por qué elegirnos?",
      items: [
        {
          titulo:     "Cumplimiento normativo garantizado",
          descripcion:"Autorizaciones vigentes de SEMARNAT, CESPT, SEMAR y SCT. Operamos dentro del marco legal federal y estatal.",
        },
        {
          titulo:     "Monitoreo y análisis de calidad",
          descripcion:"Control continuo mediante análisis de agua para verificar la eficiencia del tratamiento en cada proceso.",
        },
        {
          titulo:     "Tecnología físico-química especializada",
          descripcion:"Procesos físico-químicos de vanguardia para el tratamiento efectivo de residuos líquidos industriales.",
        },
        {
          titulo:     "14+ años de experiencia",
          descripcion:"Desde 2009 brindando soluciones de manejo de residuos a industrias de gran prestigio en Baja California.",
        },
      ],
    },
    autorizaciones: {
      title: "Operamos con todas las autorizaciones vigentes",
      items: [
        { dependencia:"SEMARNAT", descripcion:"Transporte, Acopio y Tratamiento de residuos peligrosos" },
        { dependencia:"CESPT",    descripcion:"Descarga de aguas residuales tratadas" },
        { dependencia:"SEMAR",    descripcion:"Manejo de residuos líquidos, sólidos y semisólidos" },
        { dependencia:"SCT",      descripcion:"Transporte de carga general líquida, sólida o semisólida" },
      ],
    },
    formulario: {
      title:    "Solicita tu Asesoría Técnica",
      subtitle: "Nuestro equipo especializado analizará tu caso y te presentará la mejor solución para tu industria.",
      cta:      "Recibir Asesoría Técnica",
    },
    meta: {
      title:
        "Tratamiento de Aguas Residuales Industriales en Baja California | Baja Wastewater Solution",
      description:
        "Empresa certificada en tratamiento de aguas residuales industriales. Autorizaciones SEMARNAT, CESPT, SEMAR y SCT. Más de 14 años de experiencia. Solicita cotización.",
    },
  },
} as const;
