/* Envío privado de consultas a través del SDK oficial de Resend.
 * Configurar RESEND_API_KEY y RESEND_FROM_EMAIL en Vercel.
 */
const { createHash } = require("node:crypto");
const { Resend } = require("resend");
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
module.exports = async function contact(req, res) {
  res.setHeader("Cache-Control", "no-store");
  const fail = (status, error) => res.status(status).json({ ok: false, error });
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST"); return fail(405, "Método no permitido.");
  }
  try {
    if (new URL(req.headers.origin).host !== req.headers.host) return fail(403, "Origen no permitido.");
  } catch { return fail(403, "Origen no permitido."); }
  if (!String(req.headers["content-type"] || "").toLowerCase().startsWith("application/json")) return fail(415, "Formato no permitido.");
  let body;
  try { body = req.body; if (typeof body === "string") body = JSON.parse(body); }
  catch { return fail(400, "Mensaje inválido."); }
  if (!body || typeof body !== "object" || Array.isArray(body)) return fail(400, "Mensaje inválido.");
  if (Buffer.byteLength(JSON.stringify(body), "utf8") > 14000) return fail(413, "El mensaje es demasiado largo.");
  const field = key => typeof body[key] === "string" ? body[key].trim() : "";
  const name = field("name"), email = field("email"), phone = field("phone");
  const topic = field("topic"), message = field("message"), requestId = field("requestId");
  if (field("website")) return fail(400, "No se pudo enviar el mensaje.");
  if (!name || name.length > 100 || /[\r\n]/.test(name) ||
      email.length > 200 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      phone.length > 30 || /[\r\n]/.test(phone) || !TOPICS.has(topic) ||
      message.length < 10 || message.length > 3000 || !/^[a-f0-9-]{36}$/i.test(requestId)) {
    return fail(400, "Revisa nombre, email y mensaje antes de enviarlo.");
  }
  const token = process.env.RESEND_API_KEY, from = process.env.RESEND_FROM_EMAIL;
  const destination = process.env.RESEND_TO_EMAIL;
  if (!token || !from || !destination || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(destination)) return fail(503, "El envío por email todavía no está disponible. Puedes contactar por WhatsApp.");
  if (!allowRequest(req)) {
    res.setHeader("Retry-After", "600"); return fail(429, "Has enviado varias consultas. Espera unos minutos o contacta por WhatsApp.");
  }
  const text = ["Nueva consulta desde ESENCIA", "", "Nombre: " + name, "Email: " + email,
    phone ? "Teléfono: " + phone : "", "Asunto: " + topic, "", message].join("\n");
  try {
    const resend = new Resend(token);
    const { data, error } = await resend.emails.send({
      from, to: [destination], replyTo: email, subject: "ESENCIA / " + topic, text
    }, { signal: AbortSignal.timeout(12000), idempotencyKey: "esencia-contact-" + requestId });
    if (error || !data?.id) return fail(502, "No se pudo confirmar el envío. Reintenta o contacta por WhatsApp.");
    // Aceptado por el proveedor; no confirma entrega ni lectura.
    return res.status(200).json({ ok: true });
  } catch { return fail(502, "No se pudo confirmar el envío. Reintenta o contacta por WhatsApp."); }
};
