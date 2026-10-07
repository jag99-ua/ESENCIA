/* Flechas SVG: misma forma en iOS, Windows y Android, sin glifos emoji. */
(() => {
  const ns = "http://www.w3.org/2000/svg";
  function replace(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const texts = [];
    while (walker.nextNode()) {
      const text = walker.currentNode;
      if (text.data.includes("↗") && !text.parentElement?.closest("script,style,textarea,svg")) texts.push(text);
    }
    texts.forEach(text => {
      const fragment = document.createDocumentFragment();
      const parts = text.data.split("↗");
      parts.forEach((part, index) => {
        fragment.append(document.createTextNode(part.replace(/^[\uFE0E\uFE0F]/, "")));
        if (index === parts.length - 1) return;
        const svg = document.createElementNS(ns, "svg");
        svg.setAttribute("viewBox", "0 0 24 24");
        svg.setAttribute("class", "ui-arrow");
        svg.setAttribute("aria-hidden", "true");
        svg.setAttribute("focusable", "false");
        const path = document.createElementNS(ns, "path");
        path.setAttribute("d", "M5 19 19 5M5 5h14v14");
        path.setAttribute("fill", "none");
        path.setAttribute("stroke", "currentColor");
        path.setAttribute("stroke-width", "1.6");
        svg.append(path); fragment.append(svg);
      });
      text.replaceWith(fragment);
    });
  }
  replace(document.body);
  new MutationObserver(records => {
    const roots = new Set();
    records.forEach(record => {
      if (record.type === "characterData") roots.add(record.target.parentElement);
      else record.addedNodes.forEach(node => roots.add(node.nodeType === Node.TEXT_NODE ? node.parentElement : node));
    });
    roots.forEach(root => { if (root?.isConnected) replace(root); });
  }).observe(document.body, { childList: true, subtree: true, characterData: true });
})();
