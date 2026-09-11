document.addEventListener('DOMContentLoaded', () => {
    const triggers = document.querySelectorAll('.accordion-trigger');
  
    triggers.forEach((trigger) => {
      trigger.addEventListener('click', () => {
        const panel = trigger.nextElementSibling;
        const isOpen = trigger.getAttribute('aria-expanded') === 'true';
  
        triggers.forEach((otherTrigger) => {
          if (otherTrigger !== trigger) {
            otherTrigger.setAttribute('aria-expanded', 'false');
            otherTrigger.nextElementSibling.style.maxHeight = null;
          }
        });
  
        trigger.setAttribute('aria-expanded', String(!isOpen));
        panel.style.maxHeight = isOpen ? null : panel.scrollHeight + 'px';
      });
    });
  });