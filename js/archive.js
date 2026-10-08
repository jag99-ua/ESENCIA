(() => {
  "use strict";
  const utils = window.ESENCIA_EVENT_UTILS;
  if (!utils) return;
  const { node, date, all, detailUrl, applyTheme, poster } = utils;
  document.querySelectorAll("[data-event-archive]").forEach(container => {
    const list = container.querySelector("[data-event-list]");
    const panel = container.querySelector("[data-event-preview]");
    const full = all(), limit = Number(container.dataset.limit);
    const events = limit > 0 ? full.slice(-limit) : full;
    const initial = events.find(item => item.poster || item.posterDesktop || item.posterMobile) || null;
    const compact = matchMedia("(max-width: 1000px)");
    const rows = [];
    let selected = null;

    function show(event) {
      applyTheme(container, event);
      panel.hidden = !event;
      rows.forEach(({ button, item }) => {
        const active = event?.id === item.id;
        button.setAttribute("aria-pressed", String(active));
        if (compact.matches) button.setAttribute("aria-expanded", String(active));
        else button.removeAttribute("aria-expanded");
        button.closest(".event-row").classList.toggle("is-selected", active);
      });
      if (compact.matches && event) {
        // Se mueve después del click, nunca al recibir foco o pointerdown.
        rows.find(row => row.item.id === event.id).button.closest(".event-row").after(panel);
      } else if (!compact.matches) {
        container.append(panel);
      }
      panel.replaceChildren();
      if (!event) return;
      panel.append(node("p", "meta", "Edición " + event.number), node("h3", "event-preview-title", event.displayName), date(event.date));
      if (event.location) panel.append(node("p", "meta", event.location));
      if (event.type) panel.append(node("p", "event-type", event.type));
      const artwork = poster(event);
      if (artwork) panel.append(artwork);
      const link = node("a", "text-link", "Ver ficha →");
      link.href = detailUrl(event.id); panel.append(link);
    }

    list.replaceChildren();
    events.forEach(item => {
      const row = node("article", "event-row");
      row.dataset.event = item.id;
      const button = node("button", "event-select");
      button.type = "button";
      button.setAttribute("aria-label", "Explorar " + item.displayName + ", edición " + item.number);
      button.setAttribute("aria-controls", panel.id);
      button.append(node("span", "event-number meta", item.number), node("span", "event-name", item.name), date(item.date));
      const metadata = [item.type, item.location].filter(Boolean).join(" / ");
      if (metadata) button.append(node("span", "event-row-meta meta", metadata));
      button.addEventListener("click", () => {
        selected = selected?.id === item.id ? null : item;
        show(selected || (compact.matches ? null : initial));
      });
      button.addEventListener("focus", () => {
        // iOS puede dar foco antes de completar el tap: no alterar el layout móvil.
        if (!compact.matches) show(item);
      });
      row.addEventListener("pointerenter", event => {
        if (!compact.matches && event.pointerType === "mouse") show(item);
      });
      button.addEventListener("keydown", event => {
        if (event.key === "Escape") { selected = null; show(compact.matches ? null : initial); }
      });
      const link = node("a", "event-detail-link", "↗");
      link.href = detailUrl(item.id);
      link.setAttribute("aria-label", "Ficha de " + item.displayName + ", " + item.date.slice(0, 4));
      row.append(button, link); rows.push({ button, item }); list.append(row);
    });
    container.addEventListener("pointerleave", () => { if (!compact.matches) show(selected || initial); });
    container.addEventListener("focusout", event => {
      if (!compact.matches && !container.contains(event.relatedTarget)) show(selected || initial);
    });
    compact.addEventListener("change", () => show(selected || (compact.matches ? null : initial)));
    show(compact.matches ? null : initial);
  });
})();
