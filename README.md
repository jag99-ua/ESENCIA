# ESENCIA
Primera fase de la web oficial: HOME estática en HTML, CSS y JavaScript sin frameworks, dependencias ni proceso de compilación. Fuente de verdad: Project_Context.md.

## Estructura
- index.html: contenido y estructura de la HOME; funciona también sin JavaScript.
- css/reset.css: base; variables.css: colores, tipografía y espaciados; style.css: diseño; responsive.css: adaptaciones.
- js/data.js: logos, contactos, géneros, próximo evento y futuros catálogos.
- js/events.js: única fuente de datos de las ediciones confirmadas.
- js/media.js: canal oficial, sesiones, entrevistas y contenido destacado.
- js/watch.js y css/watch.css: catálogo audiovisual y reproductor bajo demanda.
- js/archive.js y css/events.css: archivo, selección de universos y estilos compartidos.
- js/navigation.js: menú compartido por todas las páginas.
- events/index.html: cronología completa; events/event.html?id=ID: ficha reutilizable.
- js/main.js: logos, contacto y próximo evento de la HOME.
- assets/logos, assets/images/home, assets/images/gallery, assets/events/rebirth, assets/merch, assets/video, assets/icons: material original.
- shop.html: catálogo; products/product.html?id=ID: ficha; cart.html: carrito; contact.html: consultas.
- js/store.js, cart.js, commerce.js y contact.js: productos, carrito persistente y mensajes manuales.
- css/commerce.css y assets/merch/demo-*.svg: estilos y visuales de muestra.
- docs/CONTENT_CHECKLIST.md: contenido pendiente.
- vercel.json: despliegue estático y bloqueo del briefing/documentación en la web pública.

## Abrir localmente
Puedes abrir index.html directamente en el navegador. Para probar como una web servida, desde esta carpeta ejecuta:
```sh
python -m http.server 8000
```
Abre http://localhost:8000. Detén el servidor con Ctrl+C.

## Editar textos e imágenes
Los textos editoriales están en index.html. Mantén actualizados sus fallbacks si cambias datos que también aparecen en js/data.js.
Los dos logos originales ya están en assets/logos y configurados en js/data.js. El wordmark negro se muestra en blanco mediante filter: invert(1) en CSS, sin modificar el PNG. La bomba conserva el fondo blanco del JPG. Para sustituirlos, actualiza sus rutas en js/data.js y en las imágenes de index.html (fallback sin JavaScript); adapta también width/height y la inversión CSS si cambia el color del wordmark.
Para añadir fotos usa gallery con src, alt, caption, width y height. Usa imágenes optimizadas WebP/AVIF, comprueba su autorización y aporta créditos reales. No incluyas vídeos enormes en reproducción automática.
Colores y fuentes del sistema se cambian en css/variables.css. No hay fuentes externas ni licencias comerciales.

## Eventos
La ampliación del briefing confirma 10 ediciones, de GÉNESIS (001) a REBIRTH (010). Están en js/events.js, ordenadas por fecha. Los IDs de XPLOSION distinguen 2025 y 2026.
La HOME muestra todas las ediciones en «Lo que hemos vivido», después del próximo evento. El próximo evento aparece justo después de 01 / El colectivo. El archivo completo contiene también todas las ediciones activas. Para limitar una vista en el futuro, añade data-limit="N" al contenedor data-event-archive. Cada ficha se abre con events/event.html?id=ID y permite ir al evento anterior/siguiente sin navegación circular.
Para añadir una edición, copia un objeto en js/events.js y completa id único, número oficial, name/displayName, fecha ISO, colores conceptuales y los datos confirmados. active:false permite ocultarla. No hay límite fijo de 10.
Los campos ausentes usan null o arrays vacíos: no se muestran módulos de sala, lineup, fotos, vídeo o créditos si no hay datos.
Los carteles pueden configurarse en poster, posterDesktop y posterMobile. Las rutas se resuelven desde la raíz del proyecto. La galería usa objetos src, alt, caption, width y height.
colors/colorLabels describen las paletas confirmadas. accent y secondary siguen null: introduce colores CSS únicamente después de aprobar una paleta digital o recibir los artworks. El archivo empieza neutral, y permite hover, teclado y tap. En móvil el panel aparece junto a la edición explorada.
Para anunciar el siguiente evento rellena nextEvent en js/data.js y pon active:true. Sin anuncio usa active:false. Las ediciones históricas no son anuncios futuros.
El archivo y las fichas utilizan JavaScript para leer esa fuente centralizada; muestran un aviso si está desactivado. Sus títulos y descripciones por edición se actualizan en el navegador. Para SEO individual completo en una futura fase se pueden generar páginas estáticas desde la misma fuente, sin añadir un framework.
## Contacto y WhatsApp
Completa contacts.email, instagram, tiktok y whatsapp. WhatsApp se configura solo con dígitos, código de país incluido y sin + ni espacios. Vacío significa que el enlace no se muestra.
Las consultas se envían mediante api/contact.js (Vercel + Resend). WhatsApp, teléfono y email directo están disponibles.

## Contenido audiovisual / WATCH
La HOME incluye las sesiones de PerikoStyle, RDR y Thom y la entrevista completa con XAVISTYLE. El canal oficial es https://www.youtube.com/@EsenciaEvents.
Edita js/media.js: cada objeto necesita id único, type (session/interview), title, artist, youtubeId, youtubeUrl y number si existe un número confirmado.
featured:true decide el contenido inicial sin tocar el HTML; inicialmente está marcada la sesión 003 de Thom. Si marcas varios se usa el primero; si no marcas ninguno se usa el primer contenido. Los contadores se calculan automáticamente.
La pantalla muestra una miniatura oficial remota de YouTube. Si maxresdefault falla o devuelve una imagen de 120px, pasa a hqdefault y después mqdefault. No se descargan copias al repositorio.
Antes de PLAY no existe ningún iframe. Al pulsarlo se crea un único reproductor youtube-nocookie.com con controles nativos y reproducción inline. Cambiar de contenido o cerrar el vídeo elimina el reproductor anterior. El enlace directo permanece disponible.
Para probar reproducción local, usa python -m http.server 8000 y abre http://localhost:8000; abrir index.html con file:// puede impedir la reproducción por falta de HTTP Referer (Error 153). En Vercel se sirve por HTTPS. No se usan claves, API de datos ni bibliotecas.
No hay fechas, duraciones ni timestamps inventados. WATCH se mantiene independiente de las ediciones históricas, porque no se ha confirmado una vinculación con eventos concretos.
Referencia oficial del reproductor y modo de privacidad mejorada: https://developers.google.com/youtube/player_parameters y https://support.google.com/youtube/answer/171780?hl=es.
## Productos, precios y carrito
El propietario ha autorizado un catálogo simulado: camiseta (25 €), sudadera (55 €) y gorra (18 €). Productos, diseños, precios, tallas y stock son ficticios y están señalados como muestra en la web.
Edita products en js/data.js. Cada producto necesita id único, name, description, price numérico en euros, category, variant, images, sizes, requiresSize y stock. active:false lo oculta.
Los visuales SVG son esquemas de muestra, no fotografías ni diseños aprobados para producir. Para sustituirlos añade rutas reales en images, relativas a la raíz del proyecto.
shop.demoMode:true marca la tienda como simulación; demo:true identifica cada producto ficticio. El carrito de muestra funciona, pero no permite enviar pedidos.
Para activar pedidos reales, sustituye los datos ficticios por catálogo confirmado, pon shop.demoMode:false y demo:false únicamente en productos aprobados, y configura email o WhatsApp oficial. Retira noindex de las páginas de tienda después de validar el catálogo.
La ficha valida talla y cantidad; el stock se controla también entre distintas tallas del mismo producto.
El carrito se guarda en localStorage (esencia-cart-v1), persiste entre páginas y recarga, permite cambiar cantidades, quitar productos y vaciarlo. El total se recalcula desde los precios del catálogo, sin confiar en los precios guardados.
El pedido es manual: prepara un resumen revisable. No hay pagos online ni envío de datos al servidor.
Si localStorage está bloqueado, el carrito funciona durante la visita y avisa al intentar guardarlo.

## Formulario de contacto
contact.html permite elegir General, Artistas/Bookings, Colaboraciones, Prensa o Merchandising.
Enviar mensaje llama a api/contact.js. Si falla, permite copiar el texto o enviarlo desde WhatsApp/email.
Destino confirmado: marcos.blayapicazo@gmail.com. El servidor requiere RESEND_API_KEY y RESEND_FROM_EMAIL en Vercel. Instrucciones en docs/CONTACT_SETUP.md.
Los datos personales del formulario no se guardan en localStorage. El carrito almacena únicamente productos, tallas y cantidades.
## GitHub
Repositorio: https://github.com/jag99-ua/ESENCIA. Para una copia nueva:
```sh
git init
git add .
git commit -m "Base estática y HOME de ESENCIA"
```
Crea un repositorio en GitHub, conecta su URL con git remote add origin URL y sube tu rama con git push -u origin main (ajusta el nombre de tu rama).
No publiques contraseñas, claves o archivos .env.

## Vercel
Importa el repositorio de GitHub en Vercel. Selecciona Other como framework, raíz del proyecto esta carpeta, sin comando de build ni instalación, y directorio de salida raíz (.).
Las páginas son estáticas, sin frameworks. El formulario de contacto usa una función Node de Vercel en api/contact.js.
Después, cada push a la rama de producción conectada puede desplegar las actualizaciones automáticamente.
Cuando exista dominio oficial, añade canonical y og:url estáticos en index.html. Configura imagen social oficial, favicon, robots.txt y sitemap.xml con ese dominio; no uses un dominio inventado. La configuración site está preparada, pero los metadatos estáticos son preferibles para crawlers que no ejecutan JavaScript.
Antes del lanzamiento revisa privacidad, derechos de imagen y cualquier política necesaria para los servicios que finalmente se activen.

## Verificar cambios
Comprueba HOME en móvil, tablet y escritorio; menú con teclado y Escape; botones de géneros por tap; anchors; ausencia de errores de consola; imágenes y enlaces oficiales. Comprueba reduced motion. Al activar la tienda, añade pruebas de tallas, carrito y persistencia.

Configuración comprobada con la documentación oficial: https://vercel.com/docs/builds/configure-a-build y https://vercel.com/docs/project-configuration/vercel-json. Las rutas impiden servir el briefing (contiene conceptos aún no anunciados) y la documentación en Vercel; un repositorio GitHub público sí expone sus archivos.
## Dirección visual y animación de los logos
La web combina las referencias DESIGN (1).md y DESIGN.md con la identidad de ESENCIA. css/art-direction.css contiene los ajustes compartidos: negro, plata, titulares de peso regular, espacios abiertos y controles redondeados.
La HOME usa js/logo-sculpture.js para convertir las siluetas de los dos logos originales en un volumen de partículas. El inicio muestra solo la bomba, que gira 360° sobre un eje inclinado cada 12 segundos. El wordmark se reutiliza en el footer con onda en profundidad y balanceo en X/Z. Un control de pausa afecta a ambas piezas, sin selectores de forma. CONFIG controla velocidad, inclinación, densidad, profundidad y resolución.
No hay librerías, modelos externos ni fuentes comerciales. La animación se detiene fuera de pantalla y al ocultar la pestaña; reduced motion muestra una vista estática. Si falla Canvas permanece el logo original.
Consulta docs/DESIGN_DIRECTION.md para el criterio de mezcla y los ajustes. Prueba con servidor HTTP local.


El texto «Colectivo de música electrónica» está en 01 / El colectivo. --section-space en css/art-direction.css controla la separación compacta (2–4 rem).
Teléfono confirmado: +34 611434780, editable en contacts.phone de js/data.js y en los enlaces de fallback HTML. HOME y Contacto permiten llamar. El botón HOME dice «Contacta con nosotros». Email, WhatsApp e Instagram/TikTok ya están confirmados y configurados; el catálogo continúa como simulación.



## Envío real de consultas
Configura RESEND_API_KEY y RESEND_FROM_EMAIL como variables privadas en Vercel y redepliega. El destinatario es marcos.blayapicazo@gmail.com; WhatsApp/teléfono usan +34 611434780. Pasos en docs/CONTACT_SETUP.md. Las claves no van en GitHub. Instagram y TikTok oficiales están en contacts de js/data.js y los fallbacks de los footers.
