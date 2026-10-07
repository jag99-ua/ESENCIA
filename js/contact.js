/* Consultas por API privada de Vercel; pedidos demo solo generan un resumen. */
(() => {
  const store=window.ESENCIA_STORE;
  if(!store)return;
  const {node,data,money}=store;
  const contacts=data.contacts;
  const email=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contacts.email)?contacts.email:"";
  const whatsapp=/^\d{8,15}$/.test(contacts.whatsapp)?contacts.whatsapp:"";
  const phone=(contacts.phone||"").replace(/\s/g,"");
  function destinations(container,message){
    container.replaceChildren();
    if(email){const link=node("a","primary-button","Abrir email ↗");link.href="mailto:"+email+"?subject="+encodeURIComponent("Contacto ESENCIA")+"&body="+encodeURIComponent(message);container.append(link);}
    if(whatsapp){const link=node("a","primary-button","Abrir WhatsApp ↗");link.href="https://wa.me/"+whatsapp+"?text="+encodeURIComponent(message);container.append(link);}
  }
  document.querySelectorAll("[data-direct-contact]").forEach(container=>{
    destinations(container,"Hola ESENCIA.");
    if(/^\+?\d{8,15}$/.test(phone)){const link=node("a","text-link contact-phone",contacts.phone+" ↗");link.href="tel:"+phone;container.append(link);}
    ["instagram","tiktok"].forEach(key=>{
      const url=store.url(contacts[key]);if(!url)return;
      const link=node("a","text-link",key==="instagram"?"Instagram ↗":"TikTok ↗");link.href=url;container.append(link);
    });
    if(!container.childElementCount)container.append(node("p","muted","El canal directo de contacto estará disponible cuando se configure el email o WhatsApp oficial. Puedes preparar y copiar tu mensaje abajo."));
  });
  document.querySelectorAll("[data-message-form]").forEach(form=>{
    const output=form.parentElement.querySelector("[data-message-output]");
    const text=output.querySelector("textarea");
    const send=output.querySelector("[data-message-destinations]");
    const status=output.querySelector("[data-message-status]");
    const order=form.dataset.kind==="order";
    const submit=form.querySelector('[type="submit"]');
    const formStatus=form.parentElement.querySelector("[data-form-status]");
    let busy=false, requestId="", sent=false;
    form.addEventListener("input",()=>{requestId="";sent=false;if(formStatus)formStatus.textContent="";});
    form.addEventListener("submit",async event=>{
      event.preventDefault();if(busy||!form.reportValidity())return;
      const fields=new FormData(form);
      const name=String(fields.get("name")||"").trim();
      const reply=String(fields.get("email")||"").trim();
      const phone=String(fields.get("phone")||"").trim();
      const topic=String(fields.get("topic")||"General");
      const message=String(fields.get("message")||"").trim();
      const cart=window.ESENCIA_CART?.getCart() || [];
      if(order&&!cart.length)return;
      const simulation=order&&(store.demo()||cart.some(item=>item.demo));
      const lines=[simulation?"SIMULACIÓN — NO ES UN PEDIDO REAL":order?"Hola ESENCIA, quiero consultar este pedido.":"Hola ESENCIA.",order?"":"Consulta: "+topic,"","Nombre: "+name,"Email de respuesta: "+reply];
      if(phone)lines.push("Teléfono: "+phone);
      if(order){
        lines.push("","Resumen:");
        cart.forEach(item=>lines.push(item.name+(item.variant?" / "+item.variant:"")+(item.size?" / Talla "+item.size:"")+" / "+item.quantity+" × "+money(item.price)));
        lines.push("","Total "+(simulation?"simulado":"de productos")+": "+money(window.ESENCIA_CART.calculateTotal()));
        const instagram=String(fields.get("instagram")||"").trim();if(instagram)lines.push("Instagram: "+instagram);
      }
      if(message)lines.push("","Mensaje: "+message);
      text.value=lines.filter(line=>line!=="Consulta: ").join("\n");
      if(!order) {
        if(sent){formStatus.textContent="Esta consulta ya se ha enviado. Cambia el mensaje para enviar otra.";return;}
        destinations(send,text.value);output.hidden=true;
        requestId=requestId||crypto.randomUUID();
        busy=true;submit.disabled=true;submit.textContent="Enviando…";
        form.setAttribute("aria-busy","true");formStatus.textContent="Enviando tu mensaje…";
        const controller=new AbortController();
        const timeout=setTimeout(()=>controller.abort(),20000);
        try {
          const response=await fetch(new URL("api/contact",store.root),{
            method:"POST",headers:{"Content-Type":"application/json"},signal:controller.signal,
            body:JSON.stringify({name,email:reply,phone,topic,message,requestId,website:String(fields.get("website")||"")})
          });
          const result=await response.json().catch(()=>null);
          if(!response.ok||result?.ok!==true)throw Error(result?.error||"El envío no está disponible. Puedes contactar por WhatsApp o email.");
          sent=true;formStatus.textContent="Mensaje enviado. Gracias por contactar con ESENCIA.";
          status.textContent="También puedes conservar una copia de tu mensaje.";
        } catch(error) {
          formStatus.textContent=error.name==="AbortError"?"No se pudo confirmar el envío. Reintenta o contacta por WhatsApp.":error.message;
          status.textContent="Puedes copiar el mensaje o enviarlo desde WhatsApp o tu aplicación de email.";
          output.hidden=false;
        } finally {
          clearTimeout(timeout);busy=false;submit.disabled=false;submit.textContent="Enviar mensaje";
          form.removeAttribute("aria-busy");
        }
        return;
      }
      output.hidden=false;
      if(simulation){send.replaceChildren();status.textContent="Resumen de muestra preparado. El envío de pedidos está desactivado durante la simulación.";}
      else if(email||whatsapp){destinations(send,text.value);status.textContent="Mensaje preparado. Elige email o WhatsApp para enviarlo desde tu aplicación.";}
      else{send.replaceChildren();status.textContent="Mensaje preparado. Puedes copiarlo; el envío directo se activará cuando haya un canal oficial configurado.";}
    });
    output.querySelector("[data-copy-message]").addEventListener("click",async()=>{
      try{
        if(!navigator.clipboard?.writeText)throw Error("Clipboard unavailable");
        await navigator.clipboard.writeText(text.value);
        status.textContent="Mensaje copiado.";
      }catch{
        text.focus();text.select();status.textContent="Texto seleccionado. Cópialo con el menú del dispositivo o Ctrl+C.";
      }
    });
    if(order)window.addEventListener("esencia:cart",()=>{output.hidden=true;send.replaceChildren();text.value="";});
  });
})();
