/* =========================================================
   SIGMA — LANDING PAGE
   Script principal: navegación, menú móvil y animaciones
   ========================================================= */

   document.addEventListener('DOMContentLoaded', () => {

    /* ---------------------------------------------------------
       1. AÑO ACTUAL EN EL FOOTER
       --------------------------------------------------------- */
    const anioActual = document.getElementById('anioActual');
    if (anioActual) {
      anioActual.textContent = new Date().getFullYear();
    }
  
    /* ---------------------------------------------------------
       2. MENÚ MÓVIL (HAMBURGUESA)
       --------------------------------------------------------- */
    const menuToggle = document.getElementById('menuToggle');
    const mainNav = document.getElementById('mainNav');
  
    if (menuToggle && mainNav) {
      menuToggle.addEventListener('click', () => {
        const isOpen = mainNav.classList.toggle('open');
        menuToggle.classList.toggle('open');
        menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      });
  
      // Cerrar el menú al hacer clic en un enlace (útil en móvil)
      const navLinks = mainNav.querySelectorAll('a');
      navLinks.forEach((link) => {
        link.addEventListener('click', () => {
          mainNav.classList.remove('open');
          menuToggle.classList.remove('open');
          menuToggle.setAttribute('aria-expanded', 'false');
        });
      });
    }
  
    /* ---------------------------------------------------------
       3. SCROLL SUAVE PARA ENLACES INTERNOS
       (soporte adicional además de scroll-behavior en CSS,
       útil para navegadores antiguos o casos especiales)
       --------------------------------------------------------- */
    const internalLinks = document.querySelectorAll('a[href^="#"]');
    internalLinks.forEach((link) => {
      link.addEventListener('click', (event) => {
        const targetId = link.getAttribute('href');
        if (targetId.length > 1) {
          const targetEl = document.querySelector(targetId);
          if (targetEl) {
            event.preventDefault();
            targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      });
    });
  
    /* ---------------------------------------------------------
       4. ANIMACIONES DE ENTRADA AL HACER SCROLL
       (Intersection Observer sobre elementos .fade-in)
       --------------------------------------------------------- */
    const fadeElements = document.querySelectorAll('.fade-in');
  
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible');
              obs.unobserve(entry.target); // Anima una sola vez
            }
          });
        },
        {
          threshold: 0.15,
          rootMargin: '0px 0px -40px 0px'
        }
      );
  
      fadeElements.forEach((el) => observer.observe(el));
    } else {
      // Fallback: si el navegador no soporta IntersectionObserver,
      // se muestran los elementos directamente.
      fadeElements.forEach((el) => el.classList.add('visible'));
    }
  
    /* ---------------------------------------------------------
       5. CONFIGURACIÓN DEL ENLACE DE COMPRA (PAYHIP)
       Reemplaza la URL en la variable LINK_COMPRA cuando
       tengas el enlace real de tu producto en Payhip.
       --------------------------------------------------------- */
    const LINK_COMPRA = '#'; // <-- Reemplazar por el enlace real de Payhip
  
    const botonesCompra = [
      document.getElementById('btnComprar'),
      document.getElementById('btnFinal')
    ];
  
    botonesCompra.forEach((boton) => {
      if (boton && LINK_COMPRA !== '#') {
        boton.setAttribute('href', LINK_COMPRA);
      }
    });
  
  });