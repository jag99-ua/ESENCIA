/* Consultas y solicitudes de productos mediante Resend. Variables privadas en Vercel. */
const { createHash } = require("node:crypto");
const { Resend } = require("resend");
const catalogue = require("../js/data.js");
const TOPICS = new Set(["General", "Artistas / Bookings", "Colaboraciones", "Prensa", "Merchandising"]);
const attempts = new Map();
function allowRequest(req) {
  const ip = String(req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "unknown").split(",")[0].trim();
  const key = createHash("sha256").update(ip).digest("hex"), now = Date.now();
  for (const [id, value] of attempts) if (value.until < now) attempts.delete(id);
  let entry = attempts.get(key);
  if (!entry) {
    if (attempts.size >= 1000) return false;
    entry = { count: 0, until: now + 600000 }; attempts.set(key, entry);
  }
  return ++entry.count <= 6;
}
function orderItems(items) {
  if (!Array.isArray(items) || !items.length || items.length > 50) return null;
  const used = new Map(), lines = new Map();
  for (const item of items) {
    if (!item || typeof item !== "object" || Array.isArray(item)) return null;
    const product = catalogue.products.find(product => product.active !== false && product.id === item.productId);
    if (!product || !Number.isFinite(product.price) || product.price < 0 || !Number.isInteger(product.stock) || product.stock <= 0) return null;
    if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 99) return null;
    const size = typeof item.size === "string" ? item.size : "";
    if (product.requiresSize ? !product.sizes.includes(size) : size !== "") return null;
    const quantity = (used.get(product.id) || 0) + item.quantity;
    if (quantity > product.stock) return null;
    used.set(product.id, quantity);
    const key = JSON.stringify([product.id, size]);
    const line = lines.get(key) || { product, size, quantity: 0 };
    line.quantity += item.quantity; lines.set(key, line);
  }
  return [...lines.values()];
}
module.exports = async function contact(req, res) {
  res.setHeader("Cache-Control", "no-store");
  const fail = (status, error) => res.status(status).json({ ok: false, error });
  if (req.method !== "POST") { res.setHeader("Allow", "POST"); return fail(405, "Método no permitido."); }
  try { if (new URL(req.headers.origin).host !== req.headers.host) return fail(403, "Origen no permitido."); }
  catch { return fail(403, "Origen no permitido."); }
  if (!String(req.headers["content-type"] || "").toLowerCase().startsWith("application/json")) return fail(415, "Formato no permitido.");
  let body;
  try { body = req.body; if (typeof body === "string") body = JSON.parse(body); }
  catch { return fail(400, "Mensaje inválido."); }
  if (!body || typeof body !== "object" || Array.isArray(body)) return fail(400, "Mensaje inválido.");
  if (Buffer.byteLength(JSON.stringify(body), "utf8") > 14000) return fail(413, "El mensaje es demasiado largo.");
  const field = key => typeof body[key] === "string" ? body[key].trim() : "";
  const kind = field("kind") || "contact";
  if (!["contact", "order"].includes(kind)) return fail(400, "Solicitud inválida.");
  const name = field("name"), email = field("email"), phone = field("phone");
  const topic = kind === "order" ? "Merchandising" : field("topic"), message = field("message"), requestId = field("requestId");
  if (field("website")) return fail(400, "No se pudo enviar el mensaje.");
  if (!name || name.length > 100 || /[\r\n]/.test(name) || email.length > 200 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      phone.length > 30 || /[\r\n]/.test(phone) || !TOPICS.has(topic) || message.length > 3000 || (kind === "contact" && message.length < 10) ||
      !/^[a-f0-9-]{36}$/i.test(requestId)) return fail(400, "Revisa nombre, email y mensaje antes de enviarlo.");
  const items = kind === "order" ? orderItems(body.items) : null;
  if (kind === "order" && !items) return fail(400, "Revisa los productos, las tallas y las cantidades del carrito.");
  const token = process.env.RESEND_API_KEY, from = process.env.RESEND_FROM_EMAIL, destination = process.env.RESEND_TO_EMAIL;
  if (!token || !from || !destination || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(destination)) return fail(503, "El envío por email todavía no está disponible. Puedes contactar por WhatsApp.");
  if (!allowRequest(req)) { res.setHeader("Retry-After", "600"); return fail(429, "Has enviado varias consultas. Espera unos minutos o contacta por WhatsApp."); }
  const lines = [kind === "order" ? "Nueva solicitud de productos — ESENCIA" : "Nueva consulta desde ESENCIA", "", "Nombre: " + name, "Email: " + email];
  if (phone) lines.push("Teléfono: " + phone);
  lines.push("Asunto: " + topic);
  if (items) {
    const demo = catalogue.shop?.demoMode === true || items.some(item => item.product.demo);
    const money = cents => new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(cents / 100);
    if (demo) lines.push("", "CATÁLOGO DE MUESTRA — Productos, precios y disponibilidad pendientes de confirmar.");
    lines.push("", "Productos solicitados:");
    let total = 0;
    items.forEach(({ product, size, quantity }) => {
      const cents = Math.round(product.price * 100), subtotal = cents * quantity; total += subtotal;
      lines.push(product.name + (product.variant ? " / " + product.variant : "") + (size ? " / Talla " + size : "") +
        " / Cantidad: " + quantity + " / Precio unitario: " + money(cents) + " / Subtotal: " + money(subtotal));
    });
    lines.push("", (demo ? "Total orientativo: " : "Total de productos: ") + money(total),
      "Solicitud de contacto, sin pago ni reserva de stock. ESENCIA confirmará directamente con el cliente.");
  }
  if (message) lines.push("", "Mensaje:", message);
  try {
    const resend = new Resend(token);
    const { data, error } = await resend.emails.send({
      from, to: [destination], replyTo: email, subject: kind === "order" ? "ESENCIA / Solicitud de productos" : "ESENCIA / " + topic, text: lines.join("\n")
    }, { signal: AbortSignal.timeout(12000), idempotencyKey: "esencia-" + kind + "-" + requestId });
    if (error || !data?.id) return fail(502, "No se pudo confirmar el envío. Reintenta o contacta por WhatsApp.");
    return res.status(200).json({ ok: true });
  } catch { return fail(502, "No se pudo confirmar el envío. Reintenta o contacta por WhatsApp."); }
};
