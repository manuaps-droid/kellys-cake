export const WIZARD_TOTAL_STEPS = 10;

export const WIZARD_TITLES = {
  celebration: {
    step: 1,
    title: "¿Qué celebración estás preparando?",
    description:
      "Selecciona la ocasión para comenzar a diseñar tu pastel.",
  },

  idea: {
    step: 2,
    title: "Cuéntanos cómo imaginas tu pastel",
    description:
      "Describe tu idea. Nosotros nos encargaremos del resto.",
  },

  inspiration: {
    step: 3,
    title: "Muéstranos tu inspiración",
    description:
      "Puedes subir hasta cuatro imágenes de referencia.",
  },

  people: {
    step: 4,
    title: "¿Para cuántas personas será?",
    description:
      "Esto nos ayudará a recomendarte el tamaño ideal.",
  },

  flavors: {
    step: 5,
    title: "¿Qué sabores te gustan?",
    description:
      "Puedes seleccionar uno o varios sabores.",
  },
} as const;