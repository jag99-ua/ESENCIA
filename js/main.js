(() => {
  "use strict";
  const data = window.ESENCIA_DATA;
  if (!data) return;

  // Se permiten rutas locales y URLs HTTP(S), nunca javascript: ni contenido HTML.
  function safeUrl(value) {
    if (typeof value !== "string" || !value.trim()) return "";
    try {
      const url = new URL(value, document.baseURI);
      return ["http:", "https:", "file:"].includes(url.protocol) ? url.href : "";
    } catch { return ""; }
  }
  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }
  function imageAsset(slot, source, alt) {
    const src = safeUrl(source);
    if (!src || !slot) return;
    const img = new Image();
    img.alt = alt;
    img.addEventListener("load", () => { slot.replaceChildren(img); slot.classList.add("has-asset"); });
    // Un archivo inexistente mantiene el placeholder visible.
    img.src = src;
  }
  imageAsset(document.querySelector("[data-wordmark]"), data.logos.wordmark, "ESENCIA");
  imageAsset(document.querySelector("[data-bomb]"), data.logos.bomb, "Símbolo de ESENCIA");

  // Navegación compartida en navigation.js; archivo compartido en archive.js.
  function validDate(value) {
    return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value + "T12:00:00Z"));
  }
  function readableDate(value) {
    return new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Madrid" }).format(new Date(value + "T12:00:00Z"));
  }
  const next = data.nextEvent;
  if (next.active && next.name && validDate(next.date)) {
    const slot = document.querySelector("[data-next-event]");
    const title = element("h2", "display", next.name);
    title.id = "next-title";
    const date = element("time", "transmission", readableDate(next.date));
    date.dateTime = next.date;
    slot.replaceChildren(title, date);
    if (next.venue) slot.append(element("p", "lead", next.venue));
    if (Array.isArray(next.lineup) && next.lineup.length) slot.append(element("p", "muted", next.lineup.join(" / ")));
    const artwork = safeUrl(next.artwork);
    if (artwork) { const img = element("img"); img.src = artwork; img.alt = "Cartel de " + next.name; img.loading = "lazy"; slot.append(img); }
    const tickets = safeUrl(next.tickets);
    if (tickets) { const link = element("a", "contact-links", "Entradas ↗"); link.href = tickets; slot.append(link); }
  }

  const photos = Array.isArray(data.gallery) ? data.gallery.filter(photo => safeUrl(photo.src) && photo.alt) : [];
  if (photos.length) {
    const wall = document.querySelector("[data-gallery]");
    wall.replaceChildren();
    photos.forEach(photo => {
      const figure = element("figure", "memory-photo");
      const img = element("img");
      img.src = safeUrl(photo.src); img.alt = photo.alt; img.loading = "lazy"; img.decoding = "async";
      if (photo.width > 0 && photo.height > 0) { img.width = photo.width; img.height = photo.height; }
      figure.append(img);
      if (photo.caption) figure.append(element("figcaption", "meta", photo.caption));
      wall.append(figure);
    });
    document.querySelector("[data-gallery-note]")?.remove();
  }

  const links = [];
  const contact = data.contacts;
  if (/^\d{8,15}$/.test(contact.whatsapp)) links.push(["WhatsApp", "https://wa.me/" + contact.whatsapp, "whatsapp.jpg"]);
  ["instagram", "tiktok"].forEach(key => {
    const url = safeUrl(contact[key]);
    if (url) links.push([key === "instagram" ? "Instagram" : "TikTok", url, key + ".jpg"]);
  });
  links.push(["YouTube", "https://www.youtube.com/@EsenciaEvents", "youtube.png"]);
  const contactSlot = document.querySelector("[data-contact]");
  if (links.length && contactSlot) {
    contactSlot.replaceChildren();
    links.forEach(([label, href, file]) => {
      const link = element("a", "social-icon-link");
      link.href = href;
      link.setAttribute("aria-label", label);
      link.title = label;
      const img = element("img");
      img.src = "assets/logos/" + file;
      img.alt = "";
      img.width = file.endsWith(".png") ? 512 : 1408;
      img.height = file.endsWith(".png") ? 512 : 768;
      img.loading = "lazy";
      img.decoding = "async";
      link.append(img);
      contactSlot.append(link);
    });
  }
  if (/^https?:\/\//.test(data.site.url)) {
    const url = safeUrl(data.site.url);
    if (url) {
      const canonical = element("link"); canonical.rel = "canonical"; canonical.href = url; document.head.append(canonical);
      const og = element("meta"); og.setAttribute("property", "og:url"); og.content = url; document.head.append(og);
    }
  }
})();
