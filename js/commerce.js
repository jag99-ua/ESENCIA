(() => {
  const store = window.ESENCIA_STORE;
  const cart = window.ESENCIA_CART;
  if (!store || !cart) return;
  const {node,money,products,product,ready,demo,productUrl,visual} = store;
  function card(item) {
    const article = node("article","product-card");
    const link = node("a","product-card-link");
    link.href = productUrl(item.id); link.append(visual(item),node("h3","product-card-name",item.name));
    article.append(link);
    const meta = node("div","product-card-meta");
    meta.append(node("span","meta",item.category || "Merch"),node("span","product-price",Number.isFinite(item.price) ? money(item.price) : "Precio pendiente"));
    article.append(meta);
    article.append(node("p","muted",item.demo ? "Producto y precio simulados" : item.stock === 0 ? "Agotado" : ready(item) ? "Disponible" : "Disponibilidad pendiente"));
    return article;
  }
  document.querySelectorAll("[data-products]").forEach(container => {
    const limit = Number(container.dataset.limit);
    const filters = document.querySelector("[data-product-filters]");
    function render(category="Todo") {
      container.replaceChildren();
      let entries = products().filter(item=>category==="Todo" || item.category===category);
      if(limit>0) entries=entries.slice(0,limit);
      entries.forEach(item=>container.append(card(item)));
      if(!entries.length) container.append(node("p","muted","El catálogo todavía no está publicado."));
    }
    if(filters){
      ["Todo",...new Set(products().map(item=>item.category).filter(Boolean))].forEach(category=>{
        const button=node("button","catalogue-filter",category); button.type="button";
        button.setAttribute("aria-pressed",String(category==="Todo"));
        button.addEventListener("click",()=>{
          filters.querySelectorAll("button").forEach(item=>item.setAttribute("aria-pressed",String(item===button)));
          render(category);
        }); filters.append(button);
      });
    }
    render();
  });

  const detail=document.querySelector("[data-product-detail]");
  if(detail){
    const item=product(new URLSearchParams(location.search).get("id"));
    if(!item){
      detail.replaceChildren(node("h1","display","Producto no encontrado."));
      const link=node("a","text-link","Volver a SHOP →");link.href=store.url("shop.html");detail.append(link);
      document.title="Producto no encontrado — ESENCIA";
    }else{
      document.title=item.name+" — ESENCIA";
      detail.replaceChildren();
      const info=node("div","product-info");
      info.append(node("p","meta",item.demo?"Producto de muestra":item.category || "Merch"),node("h1","display product-title",item.name),node("p","product-detail-price",money(item.price)),node("p","product-description",item.description));
      if(item.variant)info.append(node("p","meta","Variante / "+item.variant));
      if(item.demo)info.append(node("p","demo-note","Diseño, precio y stock de muestra. Confirmaremos contigo los detalles al recibir tu solicitud."));
      const form=node("form","product-options");
      const status=node("p","form-status");status.setAttribute("role","status");
      let size=null;
      if(item.requiresSize){
        const label=node("label","field","Talla");
        size=node("select");size.required=true;size.name="size";size.id="product-size";
        const placeholder=node("option","","Selecciona una talla");placeholder.value="";size.append(placeholder);
        item.sizes.forEach(value=>{const option=node("option","",value);option.value=value;size.append(option);});
        label.append(size);form.append(label);
      }
      const label=node("label","field","Cantidad");
      const quantity=node("input");quantity.type="number";quantity.min="1";quantity.max=String(Math.min(item.stock || 1,99));quantity.value="1";quantity.name="quantity";quantity.required=true;
      label.append(quantity);form.append(label);
      const add=node("button","primary-button","Añadir al carrito");add.type="submit";add.disabled=!ready(item);form.append(add,status);
      form.addEventListener("submit",event=>{
        event.preventDefault(); if(!form.reportValidity())return;
        const result=cart.addToCart(item.id,size?.value || "",Number(quantity.value));
        status.textContent=result.message;
        if(result.ok){const link=node("a","text-link","Ver carrito →");link.href=store.url("cart.html");status.append(document.createTextNode(" "),link);}
      });
      const cartLink=node("a","secondary-button cart-cta","Ver carrito →");cartLink.href=store.url("cart.html");
      info.append(form,cartLink);
      detail.append(visual(item),info);
    }
  }

  const list=document.querySelector("[data-cart-items]");
  if(list){
    const total=document.querySelector("[data-cart-total]");
    const checkout=document.querySelector("[data-checkout-section]");
    const status=document.querySelector("[data-cart-status]");
    function renderCart(){
      const items=cart.getCart();list.replaceChildren();total.textContent=money(cart.calculateTotal());
      checkout.hidden=!items.length;
      document.querySelector("[data-clear-cart]").hidden=!items.length;
      if(!items.length){list.append(node("p","lead","Tu carrito está vacío."));const link=node("a","text-link","Explorar SHOP →");link.href=store.url("shop.html");list.append(link);return;}
      items.forEach(item=>{
        const row=node("article","cart-row");
        const copy=node("div");
        const link=node("a","cart-item-name",item.name);link.href=productUrl(item.productId);
        copy.append(link,node("p","meta",[item.variant,item.size ? "Talla "+item.size:""].filter(Boolean).join(" / ")));
        if(item.demo)copy.append(node("p","muted","Producto de muestra"));
        const label=node("label","field quantity-field","Cantidad");
        const quantity=node("input");quantity.type="number";quantity.min="1";quantity.max=String(Math.min(store.product(item.productId).stock,99));quantity.value=String(item.quantity);
        quantity.setAttribute("aria-label","Cantidad de "+item.name+(item.size ? ", talla "+item.size:""));
        quantity.addEventListener("change",()=>{
          if(!cart.updateQuantity(item.key,Number(quantity.value))){quantity.value=String(item.quantity);status.textContent="Cantidad no disponible. Revisa el stock.";}
        });
        label.append(quantity);
        const remove=node("button","secondary-button","Quitar");remove.type="button";remove.setAttribute("aria-label","Quitar "+item.name+(item.size?", talla "+item.size:""));remove.addEventListener("click",()=>{cart.removeFromCart(item.key);status.textContent="Producto retirado.";});
        row.append(copy,label,node("p","cart-line-total",money(item.price*item.quantity)),remove);list.append(row);
      });
      if(!cart.hasPersistence())status.textContent="El navegador no permite guardar el carrito. Se conserva durante esta visita.";
    }
    document.querySelector("[data-clear-cart]").addEventListener("click",()=>{cart.clearCart();status.textContent="Carrito vaciado.";});
    window.addEventListener("esencia:cart",renderCart);
    renderCart();
  }
  document.querySelectorAll("[data-demo-banner]").forEach(element=>element.hidden=!demo());
})();
