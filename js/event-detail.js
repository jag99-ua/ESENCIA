(() => {
  "use strict";
  const utils = window.ESENCIA_EVENT_UTILS;
  if (!utils) return;
  const { node, all, detailUrl, assetUrl, date, applyTheme, poster } = utils;
  const events = all();
  const id = new URLSearchParams(location.search).get("id");
  const index = events.findIndex(event => event.id === id);
  const main = document.querySelector("[data-event-detail]");
  const nav = document.querySelector("[data-event-navigation]");
  const event = events[index];
  if (!event) {
    document.title = "Edición no encontrada — ESENCIA";
    document.querySelector('meta[name="robots"]').content = "noindex, follow";
    const title = node("h1", "display", "Edición no encontrada.");
    const link = node("a", "text-link", "Explorar el archivo →");
    link.href = new URL("events/index.html", utils.root).href;
    main.replaceChildren(title, link);
    return;
  }
  document.body.dataset.event = event.theme;
  applyTheme(document.body, event);
  document.title = event.displayName + " — " + event.date.slice(0, 4) + " — ESENCIA";
  document.querySelector('meta[name="description"]').content = event.displayName + ". " + event.date.split("-").reverse().join(".") + ". " + event.concept;
  document.querySelector('meta[property="og:title"]').content = document.title;
  document.querySelector('meta[property="og:description"]').content = event.concept;
  main.replaceChildren();
  const label = node("div", "section-label meta");
  label.append(node("span", "", "Archivo ESENCIA / " + event.number));
  if (event.type) label.append(node("span", "", event.type));
  main.append(label, node("h1", "display event-title", event.displayName));
  const metadata = node("div", "event-metadata");
  metadata.append(date(event.date));
  if (event.location) metadata.append(node("p", "meta", event.location));
  if (event.venue) metadata.append(node("p", "meta", event.venue));
  main.append(metadata);
  const artwork = poster(event);
  if (artwork) main.append(artwork);
  const concept = node("section", "event-section");
  concept.append(node("h2", "meta", "El universo de esta edición"));
  if (event.concept) concept.append(node("p", "lead", event.concept));
  if (event.colorLabels.length) concept.append(node("p", "event-palette", event.colorLabels.join(" / ")));
  main.append(concept);
  if (event.lineup.length) {
    const section = node("section", "event-section");
    const list = node("ul", "lineup");
    section.append(node("h2", "meta", "Lineup"));
    event.lineup.forEach(artist => list.append(node("li", "", artist)));
    section.append(list); main.append(section);
  }
  const photos = event.gallery.filter(photo => assetUrl(photo.src) && photo.alt);
  if (photos.length) {
    const section = node("section", "event-section");
    const wall = node("div", "memory-wall");
    section.append(node("h2", "meta", "Memoria de esta edición"));
    photos.forEach(photo => {
      const figure = node("figure", "memory-photo");
      const img = node("img");
      img.src = assetUrl(photo.src); img.alt = photo.alt;
      img.loading = "lazy"; img.decoding = "async";
      if (photo.width > 0 && photo.height > 0) { img.width = photo.width; img.height = photo.height; }
      figure.append(img);
      if (photo.caption) figure.append(node("figcaption", "meta", photo.caption));
      wall.append(figure);
    });
    section.append(wall); main.append(section);
  }
  ["video", "aftermovie"].forEach(key => {
    const src = assetUrl(event[key]);
    if (!src) return;
    const link = node("a", "text-link", key === "video" ? "Ver vídeo ↗" : "Ver aftermovie ↗");
    link.href = src;
    main.append(link);
  });
  if (event.credits.length) {
    const section = node("section", "event-section");
    section.append(node("h2", "meta", "Créditos"));
    event.credits.forEach(credit => section.append(node("p", "muted", credit)));
    main.append(section);
  }
  // Navegación cronológica: el último no vuelve al primero.
  [events[index - 1], events[index + 1]].forEach((item, position) => {
    if (!item) return;
    const link = node("a", "event-neighbour");
    link.href = detailUrl(item.id);
    link.append(node("span", "meta", position === 0 ? "← Edición anterior" : "Edición siguiente →"));
    link.append(node("span", "", item.number + " / " + item.name));
    nav.append(link);
  });
})();
