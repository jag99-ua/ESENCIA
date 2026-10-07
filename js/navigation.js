(() => {
  const menu = document.querySelector(".menu-toggle");
  const nav = document.getElementById("navigation");
  const header = document.querySelector(".header");
  if (!menu || !nav || !header) return;
  menu.hidden = false;
  header.classList.add("menu-ready");
  function closeMenu() {
    menu.setAttribute("aria-expanded", "false");
    menu.textContent = "Menú +";
    nav.classList.remove("is-open");
  }
  menu.addEventListener("click", () => {
    const open = menu.getAttribute("aria-expanded") !== "true";
    menu.setAttribute("aria-expanded", String(open));
    menu.textContent = open ? "Cerrar −" : "Menú +";
    nav.classList.toggle("is-open", open);
  });
  nav.addEventListener("click", event => { if (event.target.closest("a")) closeMenu(); });
  header.addEventListener("keydown", event => {
    if (event.key === "Escape") { closeMenu(); menu.focus(); }
  });
  window.matchMedia("(max-width: 600px)").addEventListener("change", closeMenu);
})();
