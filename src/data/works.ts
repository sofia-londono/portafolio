// Catálogo de proyectos. Para agregar uno, agrega un objeto aquí: el diseño no
// se toca. Regla: si un campo no tiene dato real, se omite (no se inventa); la
// ficha no dibuja los campos vacíos.
import type { CoverKind } from "@/art/covers"
import kartsCover from "@/assets/karts-cover.webp"
import kartsPoster from "@/assets/karts-poster.webp"

export interface Work {
  id: string
  title: string
  /** Descripción breve: va al lado de la imagen. */
  summary: string
  /** Stack. */
  technique?: string
  /** Para quién o en qué contexto. */
  collection?: string
  problem?: string
  decision?: string
  result?: string
  /** Estado si no está terminado ("MVP", "En curso"). */
  status?: string
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
    technique: "Python, FastAPI, LlamaIndex, PostgreSQL + pgvector, Presidio, Docker, AWS",
    collection: "Bancoldex, Gestión del Talento Humano", // ← confirmar si se puede nombrar
    problem: "Las hojas de vida llegan por correo y alguien tiene que leerlas una por una contra el perfil de cada cargo.",
    decision: "Anonimizar antes de que el texto llegue al modelo (Presidio con reconocedores para cédula y municipios colombianos), y guardar vectores y datos relacionales en la misma base con PostgreSQL + pgvector.",
    result: "Desplegado en AWS, con captura automática desde el correo.",
    cover: "bancoldex",
    recreation: true,
  },
  {
    id: "datamind",
    title: "DataMind",
    summary: "Análisis inteligente para un comercio eficaz: evalúa proveedores B2B con datos públicos de SECOP y Supersociedades y los muestra en un dashboard.",
    technique: "Python, scraping (SECOP, Supersociedades), Streamlit",
    collection: "Hackathon TalentoTECH · finalista",
    problem: "Elegir proveedores B2B confiables exige revisar fuentes públicas dispersas.",
    decision: "Evaluar a cada proveedor con datos de fuentes oficiales (SECOP y Supersociedades): salud financiera, experiencia y sostenibilidad.",
    result: "Finalista del hackathon, con un prototipo desplegado y un dashboard de análisis.",
    cover: "datamind",
  },
  {
    id: "mundial",
    title: "Predicciones del Mundial 2026",
    summary: "Plataforma para predecir los resultados del Mundial 2026: microservicios en FastAPI y un frontend en React con TypeScript.",
    technique: "FastAPI (microservicios), React, TypeScript",
    collection: "Curso de Arquitectura de Software",
    decision: "Planear la arquitectura con Gemini antes de escribir código y construir con Claude Code.",
    result: "MVP funcional.",
    cover: "mundial",
  },
  {
    id: "debtmap",
    title: "DebtMap",
    summary: "Diagnóstico financiero automático para jóvenes en Colombia: reúne sus deudas en un solo lugar y les muestra su situación real.",
    problem: "Un joven con varias deudas no tiene una forma simple de ver su situación completa.",
    // Solo información técnica, tomada del código del proyecto (Endeudados).
    decision: "Una pantalla por funcionalidad, cada una con su HTML, CSS y JS, sobre un cliente de Supabase compartido y datos protegidos con RLS. Las deudas se priorizan con el método avalancha: el excedente del mes va a la de mayor tasa.",
    technique: "HTML, CSS, JavaScript vanilla · Supabase (autenticación y PostgreSQL con RLS) · Vercel",
    cover: "debtmap",
    recreation: true,
  },
  {
    id: "karts",
    title: "Juego de karts inspirado en Sugar Rush",
    summary: "Juego de carreras de karts en Unity, inspirado en la pista de dulces de Sugar Rush. Se juega en el navegador y en el celular.",
    technique: "Unity 6, C#, WebGL · Vercel",
    decision: "Exportarlo desde Unity 6 como build WebGL, comprimido con Brotli, y publicarlo en Vercel para jugarlo en el navegador sin instalar nada, con controles táctiles para el celular.",
    result: "Terminado: modo individual, 2 jugadores en la misma pantalla, juego en línea y selección de personaje.",
    video: "/karts.mp4",
    poster: kartsPoster,
    image: kartsCover,
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
