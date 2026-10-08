(() => {
  "use strict";
  const config = window.ESENCIA_MEDIA;
  const section = document.querySelector("[data-watch]");
  if (!config || !section) return;
  const items = config.items.filter(item => ["session", "interview"].includes(item.type) && /^[A-Za-z0-9_-]{11}$/.test(item.youtubeId));
  if (!items.length) { section.hidden = true; return; }
  const node = (tag, className, text) => {
    const result = document.createElement(tag);
    if (className) result.className = className;
    if (text) result.textContent = text;
    return result;
  };
  const count = type => String(items.filter(item => item.type === type).length).padStart(3, "0");
  const label = item => item.type === "session" ? "ESENCIA SESSIONS / " + item.number : "Entrevista completa";
  const screen = section.querySelector("[data-watch-screen]");
  const catalogue = section.querySelector("[data-watch-list]");
  const filters = section.querySelector("[data-watch-filters]");
  const close = section.querySelector("[data-watch-close]");
  const status = section.querySelector("[data-watch-status]");
  let selected = items.find(item => item.featured) || items[0];
  let filter = "all";
  let playing = false;

  document.querySelectorAll("[data-youtube-channel]").forEach(link => {
    try {
      const url = new URL(config.channelUrl);
      if (url.protocol === "https:" && ["youtube.com", "www.youtube.com"].includes(url.hostname)) link.href = url.href;
    } catch { /* Mantener el enlace oficial del HTML si la configuración no es válida. */ }
  });
  section.querySelector("[data-session-count]").textContent = "Sessions — " + count("session");
  section.querySelector("[data-interview-count]").textContent = "Interviews — " + count("interview");

  function thumbnail(item) {
    const img = node("img", "watch-thumbnail");
    img.alt = ""; img.width = 1280; img.height = 720;
    img.loading = "lazy"; img.decoding = "async";
    const resolutions = ["maxresdefault", "hqdefault", "mqdefault"];
    let index = 0;
    const url = () => "https://img.youtube.com/vi/" + item.youtubeId + "/" + resolutions[index] + ".jpg";
    const fallback = () => {
      if (index < resolutions.length - 1) { index += 1; img.src = url(); }
      else img.hidden = true;
    };
    img.addEventListener("error", fallback);
    // YouTube puede devolver una imagen de 120px cuando maxres no está disponible.
    img.addEventListener("load", () => { if (index === 0 && img.naturalWidth <= 120) fallback(); });
    img.src = url();
    return img;
  }

  function play() {
    if (playing) return;
    const iframe = node("iframe");
    iframe.title = selected.title;
    iframe.src = "https://www.youtube-nocookie.com/embed/" + selected.youtubeId + "?autoplay=1&playsinline=1&rel=0";
    iframe.allow = "autoplay; encrypted-media; fullscreen; picture-in-picture";
    iframe.allowFullscreen = true;
    iframe.referrerPolicy = "strict-origin-when-cross-origin";
    // El iframe se crea exclusivamente después del gesto PLAY, nunca en la carga inicial.
    screen.replaceChildren(iframe);
    screen.classList.add("is-playing");
    close.hidden = false;
    playing = true;
    status.textContent = "Reproductor de YouTube abierto: " + selected.title;
    iframe.focus();
  }

  function resetScreen() {
    playing = false;
    close.hidden = true;
    screen.classList.remove("is-playing");
    const button = node("button", "watch-play");
    button.type = "button";
    button.setAttribute("aria-label", "Reproducir " + selected.title);
    button.append(node("span", "watch-play-label", "▶ PLAY"));
    button.addEventListener("click", play);
    screen.replaceChildren(thumbnail(selected), button);
  }

  function renderSelection() {
    section.querySelector("[data-watch-label]").textContent = label(selected);
    section.querySelector("[data-watch-artist]").textContent = selected.artist;
    section.querySelector("[data-watch-title]").textContent = selected.title;
    status.textContent = "Seleccionado: " + selected.title;
    resetScreen();
  }

  function choose(item) {
    if (selected.id !== item.id) { selected = item; renderSelection(); }
    catalogue.querySelectorAll("button").forEach(button => button.setAttribute("aria-pressed", String(button.dataset.mediaId === selected.id)));
  }

  function renderCatalogue() {
    catalogue.replaceChildren();
    items.filter(item => filter === "all" || item.type === filter).forEach(item => {
      const button = node("button", "watch-row");
      button.type = "button";
      button.dataset.mediaId = item.id;
      button.setAttribute("aria-pressed", String(selected.id === item.id));
      button.setAttribute("aria-controls", screen.id);
      button.setAttribute("aria-label", "Seleccionar " + item.title);
      button.append(node("span", "watch-row-label meta", item.type === "session" ? "Session " + item.number : "Interview"));
      const copy = node("span");
      copy.append(node("span", "watch-row-artist", item.artist), node("span", "watch-row-title", item.title));
      const arrow = node("span", "watch-row-arrow", "↗");
      arrow.setAttribute("aria-hidden", "true");
      button.append(copy, arrow);
      button.addEventListener("click", () => {
        choose(item);
        const rect = screen.getBoundingClientRect();
        if (rect.top < 0 || rect.bottom > innerHeight) {
          screen.scrollIntoView({ block: "center", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
        }
      });
      catalogue.append(button);
    });
  }

  function setFilter(value) {
    filter = value;
    filters.querySelectorAll("button").forEach(button => button.setAttribute("aria-pressed", String(button.dataset.filter === value)));
    const visible = items.filter(item => filter === "all" || item.type === filter);
    if (visible.length && !visible.some(item => item.id === selected.id)) { selected = visible[0]; renderSelection(); }
    renderCatalogue();
  }

  filters.replaceChildren();
  [["all", "Todo"], ["session", "Sesiones / " + count("session")], ["interview", "Entrevistas / " + count("interview")]].forEach(([value, text]) => {
    const button = node("button", "watch-filter", text);
    button.type = "button"; button.dataset.filter = value;
    button.setAttribute("aria-pressed", String(value === filter));
    button.setAttribute("aria-controls", catalogue.id);
    button.addEventListener("click", () => setFilter(value));
    filters.append(button);
  });
  close.addEventListener("click", () => {
    resetScreen();
    status.textContent = "Vídeo cerrado.";
    screen.querySelector("button").focus();
  });
  section.querySelector("[data-see-sessions]").addEventListener("click", () => setFilter("session"));
  renderSelection();
  renderCatalogue();
})();
