/* Utilidades compartidas por SHOP, producto, carrito y contacto. */
(() => {
  const root = new URL("../", document.currentScript.src);
  const data = window.ESENCIA_DATA;
  const node = (tag, className, text) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text) element.textContent = text;
    return element;
  };
  const url = path => {
    if (typeof path !== "string" || !path.trim()) return "";
    try { const result = new URL(path, root); return ["http:", "https:", "file:"].includes(result.protocol) ? result.href : ""; }
    catch { return ""; }
  };
  const money = value => new Intl.NumberFormat("es-ES", {style:"currency", currency:"EUR"}).format(value);
  const products = () => data.products.filter(product => product.active !== false);
  const product = id => products().find(item => item.id === id);
  const ready = item => item && Number.isFinite(item.price) && item.price >= 0 && Number.isInteger(item.stock) && item.stock > 0 && (!item.requiresSize || item.sizes.length > 0);
  const demo = () => data.shop?.demoMode === true;
  const productUrl = id => new URL("products/product.html?id=" + encodeURIComponent(id), root).href;
  const visual = item => {
    const frame = node("div", "product-visual");
    const image = Array.isArray(item.images) ? url(item.images[0]) : "";
    if (image) {
      const img = node("img", "product-photo"); img.src = image; img.alt = item.name; img.loading = "lazy"; frame.append(img);
    } else if (item.demo) {
      const kind = ["tee", "hoodie", "cap"].includes(item.kind) ? item.kind : "tee";
      frame.dataset.kind = kind;
      const garment = node("img", "demo-garment");
      garment.src = url("assets/merch/demo-" + kind + ".svg"); garment.alt = ""; garment.loading = "lazy";
      const logo = node("img", "demo-print");
      logo.src = url(kind === "hoodie" ? data.logos.bomb : data.logos.wordmark); logo.alt = "";
      frame.append(garment, logo, node("span", "visual-caption meta", "Visual de muestra"));
    } else { frame.append(node("p", "muted", "Fotografía pendiente")); }
    return frame;
  };
  window.ESENCIA_STORE = { root, data, node, url, money, products, product, ready, demo, productUrl, visual };
})();
