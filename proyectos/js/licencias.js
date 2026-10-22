/* ==========================================================================
   TECNOICYMI - Licencias Microsoft
   Interacciones: menú móvil, FAQ acordeón, scroll reveal, header sticky
   ========================================================================== */

   document.addEventListener('DOMContentLoaded', function () {

    /* ---------------- MENÚ MÓVIL ---------------- */
    var toggle = document.getElementById('header-toggle');
    var nav = document.getElementById('header-nav');
  
    if (toggle && nav) {
      toggle.addEventListener('click', function () {
        var isOpen = nav.classList.toggle('open');
        toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        toggle.classList.toggle('is-active', isOpen);
      });
  
      nav.querySelectorAll('.header__link').forEach(function (link) {
        link.addEventListener('click', function () {
          nav.classList.remove('open');
          toggle.setAttribute('aria-expanded', 'false');
          toggle.classList.remove('is-active');
        });
      });
  
      document.addEventListener('click', function (e) {
        if (!nav.contains(e.target) && !toggle.contains(e.target)) {
          nav.classList.remove('open');
          toggle.setAttribute('aria-expanded', 'false');
        }
      });
    }
  
    /* ---------------- FAQ ACORDEÓN ---------------- */
    var faqItems = document.querySelectorAll('.faq__item');
  
    faqItems.forEach(function (item) {
      var question = item.querySelector('.faq__question');
      var answer = item.querySelector('.faq__answer');
  
      question.addEventListener('click', function () {
        var isActive = item.classList.contains('active');
  
        faqItems.forEach(function (other) {
          other.classList.remove('active');
          other.querySelector('.faq__question').setAttribute('aria-expanded', 'false');
          other.querySelector('.faq__answer').style.maxHeight = null;
        });
  
        if (!isActive) {
          item.classList.add('active');
          question.setAttribute('aria-expanded', 'true');
          answer.style.maxHeight = answer.scrollHeight + 'px';
        }
      });
    });
  
    /* ---------------- SCROLL REVEAL (Intersection Observer) ---------------- */
    var animatedEls = document.querySelectorAll('[data-animate]');
  
    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px'
      });
  
      animatedEls.forEach(function (el) {
        observer.observe(el);
      });
    } else {
      animatedEls.forEach(function (el) {
        el.classList.add('visible');
      });
    }
  
    /* ---------------- HEADER: SOMBRA AL HACER SCROLL ---------------- */
    var header = document.getElementById('header');
    var lastScrollY = window.scrollY;
  
    function handleHeaderScroll() {
      if (!header) return;
      if (window.scrollY > 12) {
        header.classList.add('is-scrolled');
      } else {
        header.classList.remove('is-scrolled');
      }
      lastScrollY = window.scrollY;
    }
  
    window.addEventListener('scroll', handleHeaderScroll, { passive: true });
    handleHeaderScroll();
  
    /* ---------------- SMOOTH SCROLL CON OFFSET DE HEADER ---------------- */
    var headerHeight = header ? header.offsetHeight : 0;
  
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        var targetId = this.getAttribute('href');
        if (targetId.length < 2) return;
        var target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          var top = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 12;
          window.scrollTo({ top: top, behavior: 'smooth' });
        }
      });
    });
  
    /* ---------------- RECALCULAR FAQ AL REDIMENSIONAR ---------------- */
    window.addEventListener('resize', function () {
      var activeItem = document.querySelector('.faq__item.active');
      if (activeItem) {
        var answer = activeItem.querySelector('.faq__answer');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  
  });
  