# Activar el correo de ESENCIA
Destinatario fijo de las consultas: marcos.blayapicazo@gmail.com.
Contacto telefónico y WhatsApp: +34 611434780.

## GitHub y Vercel
Importa https://github.com/jag99-ua/ESENCIA en Vercel con preset Other, raíz del proyecto, sin build y output directory ".". Las páginas siguen estáticas; api/contact.js es una función Node de Vercel independiente, con el SDK oficial de Resend.
Cada push a main actualiza el despliegue conectado.
No se sirven las variables privadas al navegador.

## Resend
1. Crea una cuenta en https://resend.com y verifica un dominio que controles: https://resend.com/docs/dashboard/domains/introduction.
2. Crea una clave con permiso de envío.
3. En Vercel → proyecto → Settings → Environment Variables configura:
   - RESEND_API_KEY: tu clave privada.
   - RESEND_FROM_EMAIL: dirección de envío autorizada. Para la prueba actual: ESENCIA <onboarding@resend.dev>.
   - RESEND_TO_EMAIL: destinatario fijo. En modo prueba debe coincidir con el email de registro de Resend.
4. Selecciona Production (y Preview solo si quieres probar allí). Guarda y haz Redeploy.
No uses la dirección Gmail como remitente sin un servicio que la autorice. El buzón receptor no autoriza por sí mismo un dominio de envío.
Para pruebas, Resend permite su remitente de prueba bajo las restricciones de su cuenta; no es un sustituto del dominio verificado para producción.
No pongas las claves en js/data.js, GitHub ni en este chat.

## Cómo comprobarlo
En el despliegue envía una consulta de prueba desde contact.html. Debe llegar al buzón configurado en RESEND_TO_EMAIL, con Reply-To del visitante. Comprueba también spam y los registros de Resend. La confirmación de la web indica aceptación por el servicio, no lectura ni garantía de entrega a bandeja de entrada.
Sin claves devuelve 503 y ofrece WhatsApp/email como alternativa. No se muestra éxito falso.
Un servidor python/http.server permite revisar la web, pero no ejecuta api/contact.js. Usa Vercel para probar envío real.

## Funcionamiento y límites
Validación en navegador y servidor, destinatario fijo, contenido en texto plano, control de origen, campo antispam y clave de idempotencia por consulta.
Límite de 6 solicitudes por 10 minutos por huella de IP en cada instancia. Es protección básica en memoria, no límite distribuido entre instancias; para tráfico abusivo usa el firewall de Vercel o una protección compartida.
No guarda consultas ni datos personales en localStorage. El proveedor procesa el correo enviado.
Los pedidos del catálogo demo no se envían por API ni WhatsApp: continúan siendo una simulación.
Documentación: https://resend.com/docs/api-reference/emails/send-email y https://vercel.com/docs/functions/runtimes/node-js.

## Modo de prueba actual
Se ha elegido recibir las consultas en el correo de registro de Resend, con onboarding@resend.dev como remitente. Esto permite probar sin dominio propio; no permite enviar a otro destinatario. El destino y el remitente se han configurado en Vercel Production. Falta guardar una clave nueva en RESEND_API_KEY. Revoca cualquier clave compartida en un chat.
Sustituye re_xxxxxxxxx por la clave real exclusivamente en una variable privada de Vercel, o .env.local para pruebas locales; nunca en código ni Git.
El ejemplo Hello World está en scripts/resend-test.cjs. Para ejecutarlo localmente: npm ci, configura las tres variables privadas y ejecuta npm run email:test. Es un envío real manual. El formulario usa /api/contact y envía nombre, email, tema y mensaje en texto plano.
