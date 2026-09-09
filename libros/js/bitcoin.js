/* =========================================================
   INVERTIR EN BITCOIN O ESCLAVITUD - LANDING PAGE
   JavaScript vanilla: menu responsive, scroll suave,
   animaciones al hacer scroll (Intersection Observer),
   boton volver arriba.
   ========================================================= */

   document.addEventListener('DOMContentLoaded', function () {

    /* ===== MENU RESPONSIVE ===== */
    var navToggle = document.getElementById('nav-toggle');
    var mainNav = document.getElementById('main-nav');

    if (navToggle && mainNav) {
        navToggle.addEventListener('click', function () {
            var isOpen = mainNav.classList.toggle('open');
            navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });

        // Cierra el menu al hacer clic en un enlace (util en mobile)
        var navLinks = mainNav.querySelectorAll('a');
        navLinks.forEach(function (link) {
            link.addEventListener('click', function () {
                mainNav.classList.remove('open');
                navToggle.setAttribute('aria-expanded', 'false');
            });
        });
    }

    /* ===== SCROLL SUAVE (fallback para navegadores sin scroll-behavior) ===== */
    var internalLinks = document.querySelectorAll('a[href^="#"]');
    internalLinks.forEach(function (link) {
        link.addEventListener('click', function (e) {
            var targetId = this.getAttribute('href');
            if (targetId.length > 1) {
                var target = document.querySelector(targetId);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        });
    });

    /* ===== ANIMACION AL HACER SCROLL (Intersection Observer) ===== */
    var fadeElements = document.querySelectorAll('.fade-in');

    if ('IntersectionObserver' in window) {
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });

        fadeElements.forEach(function (el) {
            observer.observe(el);
        });
    } else {
        // Fallback: mostrar todo directamente si no hay soporte
        fadeElements.forEach(function (el) {
            el.classList.add('visible');
        });
    }

    /* ===== BOTON VOLVER ARRIBA ===== */
    var backToTopBtn = document.getElementById('back-to-top');

    if (backToTopBtn) {
        window.addEventListener('scroll', function () {
            if (window.scrollY > 500) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        });

        backToTopBtn.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

});
