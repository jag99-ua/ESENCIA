(() => {
  "use strict";
  const utils = window.ESENCIA_EVENT_UTILS;
  if (!utils) return;
  const { node, date, all, detailUrl, applyTheme, poster } = utils;
  document.querySelectorAll("[data-event-archive]").forEach(container => {
    const list = container.querySelector("[data-event-list]");
    const panel = container.querySelector("[data-event-preview]");
    const full = all();
    const limit = Number(container.dataset.limit);
    const events = limit > 0 ? full.slice(-limit) : full;
    const rows = [];
    let pinned = null;
    let hovered = null;
    let focused = null;
    const compact = window.matchMedia('(max-width: 1000px)');

    function show(event) {
      applyTheme(container, event);
      rows.forEach(({ button, item }) => {
        const selected = event?.id === item.id;
        button.setAttribute("aria-pressed", String(selected));
        button.closest(".event-row").classList.toggle("is-selected", selected);
      });
      if (compact.matches && event) {
        const selectedRow = rows.find(row => row.item.id === event.id);
        if (selectedRow) selectedRow.button.closest(".event-row").after(panel);
      } else { container.append(panel); }
      panel.replaceChildren();
      if (!event) {
        panel.append(node("p", "meta", "Universos ESENCIA"));
        panel.append(node("p", "event-preview-title", "Selecciona una edición."));
        panel.append(node("p", "muted", "Del origen a REBIRTH. " + full.length + " ediciones confirmadas."));
        return;
      }
      panel.append(node("p", "meta", "Edición " + event.number));
      panel.append(node("h3", "event-preview-title", event.displayName));
      panel.append(date(event.date));
      if (event.location) panel.append(node("p", "meta", event.location));
      if (event.type) panel.append(node("p", "event-type", event.type));
      const artwork = poster(event);
      if (artwork) panel.append(artwork);
      if (event.concept) panel.append(node("p", "event-concept", event.concept));
      if (event.colorLabels.length) {
        panel.append(node("p", "meta palette-label", "Universo cromático"));
        panel.append(node("p", "event-palette", event.colorLabels.join(" / ")));
      }
      const link = node("a", "text-link", "Ver ficha →");
      link.href = detailUrl(event.id);
      panel.append(link);
    }
    const restore = () => show(pinned || focused || hovered);
    list.replaceChildren();
    events.forEach(item => {
      const row = node("article", "event-row");
      row.dataset.event = item.id;
      const button = node("button", "event-select");
      button.type = "button";
      button.setAttribute("aria-label", "Explorar " + item.displayName + ", edición " + item.number);
      button.setAttribute("aria-pressed", "false");
      button.setAttribute("aria-controls", panel.id);
      button.append(node("span", "event-number meta", item.number));
      const title = node("span", "event-name", item.name);
      button.append(title, date(item.date));
      const meta = [item.type, item.location].filter(Boolean).join(" / ");
      if (meta) button.append(node("span", "event-row-meta meta", meta));
      button.addEventListener("click", () => {
        pinned = pinned?.id === item.id ? null : item;
        if (!pinned) { focused = null; hovered = null; }
        restore();
      });
      button.addEventListener("focus", () => { focused = item; restore(); });

      row.addEventListener("pointerenter", event => {
        if (event.pointerType === "mouse") { hovered = item; show(item); }
      });

      button.addEventListener("keydown", event => {
        if (event.key === "Escape") { pinned = null; focused = null; hovered = null; show(null); }
      });
      const link = node("a", "event-detail-link", "↗");
      link.href = detailUrl(item.id);
      link.setAttribute("aria-label", "Ficha de " + item.displayName + ", " + item.date.slice(0, 4));
      row.append(button, link);
      rows.push({button, item});
      list.append(row);
    });
    container.addEventListener("focusout", event => {
      if (!container.contains(event.relatedTarget)) { focused = null; restore(); }
    });
    compact.addEventListener("change", restore);
    container.addEventListener("pointerleave", () => { hovered = null; restore(); });
    show(null);
  });
})();
