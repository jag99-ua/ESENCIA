/* Fuente de verdad editorial: Project_Context.md.
 * Completar solo con información validada por ESENCIA.
 * Este archivo es público: nunca incluir secretos.
 */
const ESENCIA_DATA = {
  // Assets originales de ESENCIA. El wordmark negro se muestra blanco mediante CSS.
  logos: { wordmark: "assets/logos/54556e34-e6f0-4224-a22b-40b828f6fcf9.png", bomb: "assets/logos/978d7eee-0ed3-4bf8-a2be-967ae82970fa.jpg" },
  site: { url: "", socialImage: "" },
  contacts: { phone: "+34 611434780", email: "marcos.blayapicazo@gmail.com", whatsapp: "34611434780", instagram: "https://www.instagram.com/esenc1a_events/", tiktok: "https://www.tiktok.com/@esenc1a_events?lang=es" },
  genres: ["Mákina", "Hardcore", "Hardhouse", "Newstyle", "Hardtrance", "Trance", "Bakalao", "Poky", "Cantaditas", "Remember", "Coreano", "Industrial"],
  // active:true solo después de confirmar un anuncio. REBIRTH ya es pasado.
  nextEvent: { active: false, name: "", date: "", venue: "", lineup: [], artwork: "", tickets: "" },
  // La cronología confirmada está en js/events.js.
  // Fotos autorizadas: { src: "assets/images/gallery/foto.webp", alt: "...", caption: "...", width: 1200, height: 800 }
  gallery: [
  {
    "src": "assets/images/home/pista.jpeg",
    "alt": "Vista desde la cabina del DJ hacia el público de ESENCIA.",
    "caption": "Pista.",
    "width": 567,
    "height": 423
  },
  {
    "src": "assets/images/home/amigos.jpeg",
    "alt": "Grupo de amigos posando juntos en un evento de ESENCIA.",
    "caption": "Amigos.",
    "width": 567,
    "height": 423
  },
  {
    "src": "assets/images/home/movimiento.jpeg",
    "alt": "Manos mezclando música en una mesa de DJ iluminada en verde.",
    "caption": "Movimiento.",
    "width": 567,
    "height": 423
  }
],
  team: [],
  manifesto: { approved: false, lines: [] },
  // Catálogo simulado autorizado por el propietario. Mantener demo:true hasta aprobar productos reales.
  // { id, name, description, price, images: [], sizes: [], stock, requiresSize }
  shop: { demoMode: true },
  products: [
  {
    "id": "demo-tee-001",
    "name": "ESENCIA TEE 001",
    "description": "Camiseta de muestra con el wordmark de ESENCIA. Diseño, materiales y producción pendientes de definir.",
    "price": 25,
    "category": "Ropa",
    "kind": "tee",
    "variant": "Negro",
    "images": [],
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "requiresSize": true,
    "stock": 30,
    "demo": true,
    "active": true
  },
  {
    "id": "demo-hoodie-001",
    "name": "ESENCIA HOODIE 001",
    "description": "Sudadera de muestra con la bomba de ESENCIA. Diseño, materiales y producción pendientes de definir.",
    "price": 55,
    "category": "Ropa",
    "kind": "hoodie",
    "variant": "Negro",
    "images": [],
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "requiresSize": true,
    "stock": 20,
    "demo": true,
    "active": true
  },
  {
    "id": "demo-cap-001",
    "name": "ESENCIA CAP 001",
    "description": "Gorra de muestra con el wordmark de ESENCIA. Diseño, materiales y producción pendientes de definir.",
    "price": 18,
    "category": "Accesorios",
    "kind": "cap",
    "variant": "Negro",
    "images": [],
    "sizes": [],
    "requiresSize": false,
    "stock": 15,
    "demo": true,
    "active": true
  }
]
};

// El servidor y el navegador comparten el catálogo; aquí nunca van claves privadas.
if (typeof module === "object" && module.exports) module.exports = ESENCIA_DATA;
else window.ESENCIA_DATA = ESENCIA_DATA;
