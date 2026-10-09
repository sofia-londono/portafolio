// Catálogo de proyectos. Para agregar uno, agrega un objeto aquí: el diseño no
// se toca. Regla: si un campo no tiene dato real, se omite (no se inventa); la
// ficha no dibuja los campos vacíos.
import type { CoverKind } from "@/art/covers"
import kartsCover from "@/assets/karts-cover.webp"
import kartsMenu from "@/assets/karts-menu.webp"
import kartsPoster from "@/assets/karts-poster.webp"

export interface WorkLink {
  label: string
  href: string
  note?: string
}

export interface Work {
  id: string
  title: string
  /** Descripción breve: va al lado de la imagen. */
  summary: string
  year?: string
  /** Stack. */
  technique?: string
  /** Tiempo que tomó. */
  dimensions?: string
  /** Para quién o en qué contexto. */
  collection?: string
  role?: string
  problem?: string
  decision?: string
  result?: string
  /** Estado si no está terminado ("MVP", "En curso"). */
  status?: string
  /** Punto amarillo: desplegado, funciona hoy fuera de mi computador. */
  deployed?: boolean
  links?: WorkLink[]
  /** Portada generada en código (ver src/art/covers.tsx). */
  cover: CoverKind
  /** Captura real: si existe, reemplaza la portada generada. Ej: "/capturas/datamind.webp" */
  image?: string
  /** Video corto (mp4) que se reproduce en la ficha. Ej: "/karts.mp4" */
  video?: string
  /** Imagen fija del video (se muestra antes de cargarlo y con reduced-motion). */
  poster?: string
  /** Capturas adicionales que van en la ficha. */
  gallery?: { src: string; alt: string; caption?: string }[]
  /** Si la portada es una recreación ilustrativa (datos de ejemplo). */
  recreation?: boolean
  hidden?: boolean
}

export const WORKS: Work[] = [
  {
    id: "bancoldex",
    title: "Agente RAG de preclasificación de hojas de vida",
    summary: "Agente de IA que recibe las hojas de vida que llegan al correo, las anonimiza y las preclasifica contra el perfil de cada cargo.",
    year: "2026",
    technique: "Python, FastAPI, LlamaIndex, PostgreSQL + pgvector, Presidio, Docker, AWS",
    dimensions: "15 días",
    collection: "Bancoldex, Gestión del Talento Humano", // ← confirmar si se puede nombrar
    role: "Diseño y construcción, sola",
    problem: "Las hojas de vida llegan por correo y alguien tiene que leerlas una por una contra el perfil de cada cargo.",
    decision: "Anonimizar antes de que el texto llegue al modelo (Presidio con reconocedores para cédula y municipios colombianos), y guardar vectores y datos relacionales en la misma base con PostgreSQL + pgvector.",
    result: "Desplegado en AWS, con captura automática desde el correo.",
    deployed: true,
    cover: "bancoldex",
    recreation: true,
  },
  {
    id: "datamind",
    title: "DataMind",
    summary: "Análisis inteligente para un comercio eficaz: evalúa proveedores B2B con datos públicos de SECOP y Supersociedades y los muestra en un dashboard.",
    year: "2024",
    technique: "Python, scraping (SECOP, Supersociedades), Streamlit",
    collection: "Hackathon TalentoTECH · finalista",
    role: "Programación, en un equipo de 3",
    problem: "Elegir proveedores B2B confiables exige revisar fuentes públicas dispersas.",
    decision: "Evaluar a cada proveedor con datos de fuentes oficiales (SECOP y Supersociedades): salud financiera, experiencia y sostenibilidad.",
    result: "Finalista del hackathon, con un prototipo desplegado y un dashboard de análisis.",
    deployed: true,
    links: [
      { label: "Ficha del proyecto", href: "https://p4s.co/datamind" },
    ],
    cover: "datamind",
  },
  {
    id: "mundial",
    title: "Predicciones del Mundial 2026",
    summary: "Plataforma para predecir los resultados del Mundial 2026: microservicios en FastAPI y un frontend en React con TypeScript.",
    year: "2026",
    technique: "FastAPI (microservicios), React, TypeScript",
    collection: "Curso de Arquitectura de Software, U. Sergio Arboleda",
    role: "Diseño y desarrollo",
    decision: "Planear un día completo antes de escribir código (con Gemini) y construir en tres con Claude Code.",
    result: "MVP funcional.",
    status: "MVP",
    cover: "mundial",
  },
  {
    id: "debtmap",
    title: "DebtMap",
    summary: "Diagnóstico financiero automático para jóvenes en Colombia: reúne sus deudas en un solo lugar y les muestra su situación real.",
    collection: "Idea propia, desarrollada en equipo",
    problem: "Un joven con varias deudas no tiene una forma simple de ver su situación completa.",
    // rol / estado / resultado: pendientes de confirmar con Sofía
    cover: "debtmap",
    recreation: true,
  },
  {
    id: "karts",
    title: "Juego de karts inspirado en Sugar Rush",
    summary: "Juego de carreras de karts en Unity, de fans y sin fines de lucro, inspirado en la pista de dulces de Sugar Rush.",
    technique: "Unity, C#",
    collection: "Proyecto de entretenimiento personal, de fans y sin fines de lucro",
    decision: "Publicarlo en Vercel para jugarlo desde el navegador, también en el celular con controles táctiles.",
    result: "Menú con modo individual, 2 jugadores en la misma pantalla, juego en línea y selección de personaje.",
    video: "/karts.mp4",
    poster: kartsPoster,
    image: kartsCover,
    gallery: [{ src: kartsMenu, alt: "Menú principal del juego: Jugar, Jugar en línea, 2 jugadores, Elegir personaje y Opciones, sobre la pista de dulces", caption: "Menú principal." }],
    cover: "karts",
  },
  {
    id: "quimica",
    title: "Auditoría RAG sobre documentos de seguridad química",
    summary: "Sistema RAG para consultar por chat fichas de seguridad química y auditar sus respuestas, sobre AWS SageMaker y Bedrock.",
    technique: "AWS SageMaker, Amazon Bedrock, RAG",
    cover: "quimica",
    recreation: true,
  },
  {
    id: "musica",
    title: "Clasificador de géneros musicales",
    summary: "Escucha una canción y dice a cuál de 10 géneros pertenece (blues, clásica, country, disco, hip hop, jazz, metal, pop, reggae o rock). Convierte el audio en espectrogramas y compara tres modelos: una CNN que los lee como imagen, una LSTM que los lee como secuencia en el tiempo y un híbrido que combina ambas.",
    technique: "Python, CNN, LSTM, CNN + LSTM · dataset GTZAN extendido",
    decision: "Comparar tres arquitecturas (CNN, LSTM e híbrida) sobre los mismos datos para ver cuál clasifica mejor.",
    cover: "musica",
    recreation: true,
  },
  {
    id: "pieza-30x",
    title: "Pieza para 30X",
    summary: "",
    cover: "frame",
    hidden: true, // se muestra cuando esté lista
  },
]
