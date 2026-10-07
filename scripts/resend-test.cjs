/* Ejemplo oficial: solo ejecutar manualmente desde el servidor o terminal. */
const { Resend } = require("resend");
(async () => {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.RESEND_TO_EMAIL;
  if (!key || key === "re_xxxxxxxxx" || !to) {
    console.error("Configura una clave nueva en RESEND_API_KEY y el destinatario en RESEND_TO_EMAIL.");
    process.exitCode = 1; return;
  }
  const resend = new Resend(key);
  const { data, error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
    to: [to],
    subject: "Hello World",
    html: "<p>Congrats on sending your <strong>first email</strong>!</p>"
  }, { signal: AbortSignal.timeout(12000) });
  if (error || !data?.id) {
    console.error("Resend no ha aceptado el correo. Revisa la configuración y el registro del proveedor.");
    process.exitCode = 1; return;
  }
  console.log("Correo de prueba aceptado por Resend.");
})();
