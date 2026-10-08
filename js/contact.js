/* Solicitudes del carrito por API: sin pagos ni datos personales en localStorage. */
(() => {
  const form = document.querySelector("[data-order-form]");
  const cart = window.ESENCIA_CART;
  if (!form || !cart) return;
  const status = document.querySelector("[data-order-status]");
  const submit = form.querySelector('[type="submit"]');
  const confirmation = document.querySelector("[data-order-confirmation]");
  confirmation?.querySelector("[data-close-confirmation]")?.addEventListener("click", () => confirmation.close());
  let busy = false, sent = false, requestId = "";
  const selection = () => cart.getCart().map(item => ({ productId: item.productId, size: item.size, quantity: item.quantity }));
  const reset = () => { if (!busy) { sent = false; requestId = ""; status.textContent = ""; } };
  form.addEventListener("input", reset);
  window.addEventListener("esencia:cart", reset);
  form.addEventListener("submit", async event => {
    event.preventDefault();
    if (busy || !form.reportValidity()) return;
    if (sent) { status.textContent = "Esta solicitud ya se ha enviado. ESENCIA se pondrá en contacto contigo."; return; }
    const items = selection();
    if (!items.length) { status.textContent = "Añade productos al carrito antes de enviar la solicitud."; return; }
    requestId ||= crypto.randomUUID();
    const snapshot = JSON.stringify(items);
    const fields = new FormData(form);
    const payload = { kind: "order", requestId, items };
    ["name", "email", "phone", "message", "website"].forEach(key => { payload[key] = String(fields.get(key) || "").trim(); });
    const controls = [...form.elements, ...document.querySelectorAll("[data-cart-items] input,[data-cart-items] button,[data-clear-cart]")].filter(control => !control.disabled);
    busy = true; controls.forEach(control => { control.disabled = true; });
    form.setAttribute("aria-busy", "true"); submit.textContent = "Enviando…"; status.textContent = "Enviando tu solicitud…";
    const controller = new AbortController(), timer = setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload), signal: controller.signal });
      const result = await response.json().catch(() => null);
      if (!response.ok || result?.ok !== true) throw Error(result?.error || "No se ha podido enviar. Inténtalo de nuevo.");
      sent = true; status.textContent = "Solicitud enviada. Nos pondremos en contacto contigo para confirmar los productos y su disponibilidad.";
      if (confirmation && !confirmation.open) confirmation.showModal();
    } catch (error) {
      status.textContent = error.name === "AbortError" ? "No se pudo confirmar el envío. Puedes volver a intentarlo." : error.message;
    } finally {
      clearTimeout(timer); busy = false; controls.forEach(control => { control.disabled = false; });
      form.removeAttribute("aria-busy"); submit.textContent = "Enviar solicitud";
      if (JSON.stringify(selection()) !== snapshot) { sent = false; requestId = ""; }
    }
  });
})();
