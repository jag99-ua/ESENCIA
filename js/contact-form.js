/* El formulario envía por API; solo confirma éxito cuando Resend acepta el correo. */
(() => {
  const form = document.querySelector("[data-contact-form]");
  if (!form) return;
  const status = document.querySelector("[data-form-status]");
  const submit = form.querySelector('[type="submit"]');
  let busy = false, sent = false, requestId = "";
  form.addEventListener("input", () => {
    if (!busy) { sent = false; requestId = ""; status.textContent = ""; }
  });
  form.addEventListener("submit", async event => {
    event.preventDefault();
    if (busy || !form.reportValidity()) return;
    if (sent) { status.textContent = "Tu mensaje ya se ha enviado. Cambia el texto para enviar otra consulta."; return; }
    const fields = new FormData(form);
    requestId ||= crypto.randomUUID();
    const payload = { requestId };
    ["name", "email", "topic", "message", "website"].forEach(key => { payload[key] = String(fields.get(key) || "").trim(); });
    busy = true;
    const controls = [...form.elements].filter(control => !control.disabled);
    controls.forEach(control => { control.disabled = true; });
    form.setAttribute("aria-busy", "true");
    submit.textContent = "Enviando…";
    status.textContent = "Enviando tu mensaje…";
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch("/api/contact", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload), signal: controller.signal
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || result?.ok !== true) throw Error(result?.error || "No se ha podido enviar. Inténtalo de nuevo o contacta por WhatsApp.");
      sent = true;
      status.textContent = "Mensaje enviado. Gracias por contactar con ESENCIA.";
    } catch (error) {
      status.textContent = error.name === "AbortError" ? "No se pudo confirmar el envío. Inténtalo de nuevo." : error.message;
    } finally {
      clearTimeout(timer); busy = false;
      controls.forEach(control => { control.disabled = false; });
      form.removeAttribute("aria-busy"); submit.textContent = "Enviar mensaje";
    }
  });
})();
