/* Carrito local. Los precios y el stock se leen siempre del catálogo actual. */
(() => {
  const store = window.ESENCIA_STORE;
  if (!store) return;
  const storageKey = "esencia-cart-v1";
  let memory = [];
  let persistent = true;
  const key = item => JSON.stringify([item.productId, item.size || "", item.variant || ""]);
  function normalize(raw) {
    const result = [];
    if (!Array.isArray(raw)) return result;
    raw.slice(0, 200).forEach(saved => {
      if (!saved || typeof saved !== "object") return;
      const product = store.product(saved.productId);
      if (!store.ready(product)) return;
      const size = product.requiresSize ? String(saved.size || "") : "";
      if (product.requiresSize && !product.sizes.includes(size)) return;
      const requested = Number(saved.quantity);
      if (!Number.isInteger(requested) || requested < 1) return;
      const used = result.filter(row => row.productId === product.id).reduce((sum, row) => sum + row.quantity, 0);
      const quantity = Math.min(requested, 99, product.stock - used);
      if (quantity < 1) return;
      const item = { productId: product.id, name: product.name, variant: product.variant || "", size, quantity, price: product.price, image: product.images[0] || "", demo: product.demo === true };
      const existing = result.find(row => key(row) === key(item));
      if (existing) existing.quantity += quantity;
      else result.push(item);
    });
    return result;
  }
  function read() {
    try { memory = normalize(JSON.parse(localStorage.getItem(storageKey) || "[]")); }
    catch { memory = []; }
  }
  function save() {
    try { localStorage.setItem(storageKey, JSON.stringify(memory)); persistent = true; }
    catch { persistent = false; }
    window.dispatchEvent(new CustomEvent("esencia:cart"));
  }
  function getCart() { memory = normalize(memory); return memory.map(item => ({...item, key:key(item)})); }
  function addToCart(id, size, quantity) {
    const product = store.product(id);
    if (!store.ready(product)) return {ok:false, message:"Este producto no está disponible."};
    if (product.requiresSize && !product.sizes.includes(size)) return {ok:false, message:"Selecciona una talla."};
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) return {ok:false, message:"Elige una cantidad entre 1 y 99."};
    const cart = getCart();
    const used = cart.filter(row => row.productId === id).reduce((sum,row)=>sum+row.quantity,0);
    if (used + quantity > product.stock) return {ok:false, message:"La cantidad supera el stock disponible" + (product.demo ? " de muestra." : ".")};
    const item = {productId:id, size:product.requiresSize ? size : "", variant:product.variant || "", quantity};
    const existing = memory.find(row => key(row) === key(item));
    if (existing) existing.quantity += quantity;
    else memory.push(item);
    memory = normalize(memory); save();
    return {ok:true, message:"Añadido al carrito."};
  }
  function removeFromCart(itemKey) { memory = getCart().filter(item => item.key !== itemKey); save(); }
  function updateQuantity(itemKey, quantity) {
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) return false;
    const cart = getCart(); const row = cart.find(item=>item.key===itemKey);
    if (!row) return false;
    const other = cart.filter(item=>item.productId===row.productId && item.key!==itemKey).reduce((sum,item)=>sum+item.quantity,0);
    if (quantity + other > store.product(row.productId).stock) return false;
    memory = cart.map(item=>item.key===itemKey ? {...item,quantity} : item); save(); return true;
  }
  function clearCart() { memory=[]; save(); }
  function calculateTotal() { return getCart().reduce((sum,item)=>sum+Math.round(item.price*100)*item.quantity,0)/100; }
  const api = {getCart,addToCart,removeFromCart,updateQuantity,calculateTotal,clearCart,hasPersistence:()=>persistent};
  window.ESENCIA_CART = api;
  function updateCounters() {
    const count = getCart().reduce((sum,item)=>sum+item.quantity,0);
    document.querySelectorAll("[data-cart-count]").forEach(node=>node.textContent=String(count));
  }
  read(); updateCounters();
  window.addEventListener("esencia:cart",updateCounters);
  window.addEventListener("storage",event=>{if(event.key===storageKey || event.key===null){read(); window.dispatchEvent(new CustomEvent("esencia:cart"));}});
})();
