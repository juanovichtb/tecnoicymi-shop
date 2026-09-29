/* =====================================================
   CONFIGURACIÓN PRINCIPAL
   -----------------------------------------------------
   Reemplaza esta URL por tu enlace de pago real
   (Stripe Payment Link, Gumroad, Hotmart, LemonSqueezy, etc.)
   ===================================================== */
   const URL_PAGO = "https://tu-enlace-de-pago.com/checkout";

   document.addEventListener("DOMContentLoaded", () => {
     initMobileMenu();
     initGallery();
     initAccordion();
     initCTAs();
     initCart();
     setFooterYear();
   });
   
   /* =====================================================
      MENÚ MÓVIL
      ===================================================== */
   function initMobileMenu() {
     const menuToggle = document.getElementById("menuToggle");
     const menuClose = document.getElementById("menuClose");
     const mobileMenu = document.getElementById("mobileMenu");
     const mobileOverlay = document.getElementById("mobileOverlay");
   
     function openMenu() {
       mobileMenu.classList.add("active");
       mobileOverlay.classList.add("active");
       menuToggle.setAttribute("aria-expanded", "true");
       document.body.style.overflow = "hidden";
     }
   
     function closeMenu() {
       mobileMenu.classList.remove("active");
       mobileOverlay.classList.remove("active");
       menuToggle.setAttribute("aria-expanded", "false");
       document.body.style.overflow = "";
     }
   
     menuToggle?.addEventListener("click", openMenu);
     menuClose?.addEventListener("click", closeMenu);
     mobileOverlay?.addEventListener("click", closeMenu);
   
     document.querySelectorAll(".mobile-nav a").forEach((link) => {
       link.addEventListener("click", closeMenu);
     });
   
     document.addEventListener("keydown", (e) => {
       if (e.key === "Escape") closeMenu();
     });
   }
   
   /* =====================================================
      GALERÍA DE IMÁGENES DEL PRODUCTO
      ===================================================== */
   function initGallery() {
     const mainImage = document.getElementById("mainImage");
     const thumbs = Array.from(document.querySelectorAll(".thumb"));
     const dotsWrap = document.getElementById("galDots");
     const prevBtn = document.getElementById("galPrev");
     const nextBtn = document.getElementById("galNext");
   
     if (!mainImage || thumbs.length === 0) return;
   
     let currentIndex = 0;
   
     thumbs.forEach((thumb, index) => {
       const dot = document.createElement("button");
       dot.className = "dot" + (index === 0 ? " active" : "");
       dot.setAttribute("aria-label", `Ir a imagen ${index + 1}`);
       dot.addEventListener("click", () => setActiveImage(index));
       dotsWrap.appendChild(dot);
     });
   
     const dots = Array.from(dotsWrap.querySelectorAll(".dot"));
   
     function setActiveImage(index) {
       currentIndex = (index + thumbs.length) % thumbs.length;
       const target = thumbs[currentIndex];
       const newSrc = target.getAttribute("data-img");
   
       mainImage.style.opacity = "0";
       setTimeout(() => {
         mainImage.src = newSrc;
         mainImage.alt = target.querySelector("img")?.alt || mainImage.alt;
         mainImage.style.opacity = "1";
       }, 120);
   
       thumbs.forEach((t, i) => {
         t.classList.toggle("active", i === currentIndex);
         t.setAttribute("aria-pressed", i === currentIndex ? "true" : "false");
       });
       dots.forEach((d, i) => d.classList.toggle("active", i === currentIndex));
     }
   
     thumbs.forEach((thumb, index) => {
       thumb.addEventListener("click", () => setActiveImage(index));
     });
   
     prevBtn?.addEventListener("click", () => setActiveImage(currentIndex - 1));
     nextBtn?.addEventListener("click", () => setActiveImage(currentIndex + 1));
   
     mainImage.style.transition = "opacity 0.15s ease";
   }
   
   /* =====================================================
      ACORDEÓN DE PREGUNTAS FRECUENTES
      ===================================================== */
   function initAccordion() {
     const items = document.querySelectorAll(".accordion-item");
   
     items.forEach((item) => {
       const header = item.querySelector(".accordion-header");
       const panel = item.querySelector(".accordion-panel");
   
       header.addEventListener("click", () => {
         const isOpen = header.getAttribute("aria-expanded") === "true";
   
         items.forEach((otherItem) => {
           const otherHeader = otherItem.querySelector(".accordion-header");
           const otherPanel = otherItem.querySelector(".accordion-panel");
           otherHeader.setAttribute("aria-expanded", "false");
           otherPanel.style.maxHeight = null;
         });
   
         if (!isOpen) {
           header.setAttribute("aria-expanded", "true");
           panel.style.maxHeight = panel.scrollHeight + "px";
         }
       });
     });
   }
   
   /* =====================================================
      BOTONES DE COMPRA (CTA) → ENLACE DE PAGO
      ===================================================== */
   function initCTAs() {
     const buyButtons = document.querySelectorAll('[data-cta="comprar"]');
   
     buyButtons.forEach((btn) => {
       btn.setAttribute("href", "https://payhip.com/b/WPAlG");
       btn.setAttribute("target", "_blank");
       btn.setAttribute("rel", "noopener noreferrer");
     });
   
     const checkoutBtn = document.getElementById("checkoutBtn");
     if (checkoutBtn) {
       checkoutBtn.setAttribute("href", "https://payhip.com/b/WPAlG");
       checkoutBtn.setAttribute("target", "_blank");
       checkoutBtn.setAttribute("rel", "noopener noreferrer");
     }
   }
   
   /* =====================================================
      CARRITO LATERAL (simulado, sin backend)
      ===================================================== */
   function initCart() {
     const cartOpenBtn = document.getElementById("cartOpenBtn");
     const cartCloseBtn = document.getElementById("cartCloseBtn");
     const cartDrawer = document.getElementById("cartDrawer");
     const cartOverlay = document.getElementById("cartOverlay");
     const cartCount = document.getElementById("cartCount");
     const cartBody = document.getElementById("cartBody");
     const cartFooter = document.getElementById("cartFooter");
     const continueShoppingBtn = document.getElementById("continueShoppingBtn");
     const addToCartButtons = document.querySelectorAll('[data-add-to-cart], [data-cta="carrito"]');
   
     let cartItems = [];
   
     function openCart() {
       cartDrawer.classList.add("active");
       cartOverlay.classList.add("active");
       cartDrawer.focus();
       document.body.style.overflow = "hidden";
     }
   
     function closeCart() {
       cartDrawer.classList.remove("active");
       cartOverlay.classList.remove("active");
       document.body.style.overflow = "";
     }
   
     function renderCart() {
       cartCount.textContent = cartItems.length;
   
       if (cartItems.length === 0) {
         cartBody.innerHTML = `
           <div class="cart-empty">
             <span class="cart-empty-icon" aria-hidden="true">🛒</span>
             <p class="cart-empty-title">Tu carrito está vacío</p>
             <p class="cart-empty-text">Añade libros para comenzar</p>
             <button class="btn btn-outline" id="continueShoppingBtn2">Seguir comprando</button>
           </div>`;
         cartFooter.hidden = true;
         document.getElementById("continueShoppingBtn2")?.addEventListener("click", closeCart);
         return;
       }
   
       cartFooter.hidden = false;
       cartBody.innerHTML = cartItems
         .map(
           (item, index) => `
           <div class="cart-item">
             <img src="${item.img}" alt="${item.title}">
             <div class="cart-item-info">
               <h4>${item.title}</h4>
               <p>${item.price}</p>
               <button class="cart-item-remove" data-remove-index="${index}">Eliminar</button>
             </div>
           </div>`
         )
         .join("");
   
       cartBody.querySelectorAll("[data-remove-index]").forEach((btn) => {
         btn.addEventListener("click", (e) => {
           const idx = Number(e.currentTarget.getAttribute("data-remove-index"));
           cartItems.splice(idx, 1);
           renderCart();
         });
       });
     }
   
     addToCartButtons.forEach((btn) => {
       btn.addEventListener("click", (e) => {
         e.preventDefault();
         const card = btn.closest(".product-info, .related-card");
         const title =
           card?.querySelector(".product-title, h3")?.textContent.trim() ||
           "Producto";
         const price =
           card?.querySelector(".price, .related-price")?.textContent.trim() ||
           "";
         const img =
           document.getElementById("mainImage")?.getAttribute("src") ||
           card?.querySelector("img")?.getAttribute("src") ||
           "/img/portada.jpg";
   
         cartItems.push({ title, price, img });
         renderCart();
         openCart();
         showToast(`"${title}" añadido al carrito`);
       });
     });
   
     cartOpenBtn?.addEventListener("click", openCart);
     cartCloseBtn?.addEventListener("click", closeCart);
     cartOverlay?.addEventListener("click", closeCart);
     continueShoppingBtn?.addEventListener("click", closeCart);
   
     document.addEventListener("keydown", (e) => {
       if (e.key === "Escape") closeCart();
     });
   
     renderCart();
   }
   
   /* =====================================================
      TOAST DE CONFIRMACIÓN
      ===================================================== */
   function showToast(message) {
     let toast = document.querySelector(".toast");
     if (!toast) {
       toast = document.createElement("div");
       toast.className = "toast";
       document.body.appendChild(toast);
     }
     toast.textContent = message;
     toast.classList.add("active");
   
     clearTimeout(toast._timeout);
     toast._timeout = setTimeout(() => {
       toast.classList.remove("active");
     }, 2500);
   }
   
   /* =====================================================
      AÑO DINÁMICO EN EL FOOTER
      ===================================================== */
   function setFooterYear() {
     const yearEl = document.getElementById("year");
     if (yearEl) yearEl.textContent = new Date().getFullYear();
   }
   