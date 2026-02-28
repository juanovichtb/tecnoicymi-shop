/**
 * TECNOICYMI - Main JavaScript
 * Maneja la carga dinámica de componentes y la navegación inteligente.
 */

document.addEventListener("DOMContentLoaded", function () {

    /**
     * Función para determinar cuántos niveles debemos retroceder
     * para encontrar la raíz del proyecto.
     */
    function getRootPath() {
        const path = window.location.pathname;

        // Nivel 3: software/sistemas-operativos/archivo.html
        if (path.includes('/sistemas-operativos/') ||
            path.includes('/ofimatica/') ||
            path.includes('/multimedia/')) {
            return '../../../';
        }

        // Nivel 2: recursos/software/index.html
        if (path.includes('/recursos/software/')) {
            return '../../';
        }

        // Nivel 1: recursos/index.html o soporte/index.html
        if (path.includes('/recursos/') || path.includes('/soporte/') || path.includes('/productos/') ) {
            return '../';
        }

        // Nivel 0: index.html (Raíz)
        return '';
    }

    const root = getRootPath();

    // 1. Cargar el Header
    const headerPlaceholder = document.getElementById('header-placeholder');
    if (headerPlaceholder) {
        fetch(`${root}assets/partials/header.html`)
            .then(response => {
                if (!response.ok) throw new Error('Error al cargar header');
                return response.text();
            })
            .then(data => {
                headerPlaceholder.innerHTML = data;
                // Opcional: Aquí puedes añadir lógica para resaltar el link activo
            })
            .catch(err => console.error(err));
    }

    // 2. Cargar el Footer
    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (footerPlaceholder) {
        fetch(`${root}assets/partials/footer.html`)
            .then(response => {
                if (!response.ok) throw new Error('Error al cargar footer');
                return response.text();
            })
            .then(data => {
                footerPlaceholder.innerHTML = data;
            })
            .catch(err => console.error(err));
    }

    /*FILTRO BUSQEUDAS*/
    // --- LÓGICA DE BÚSQUEDA Y FILTRADO ---
    const searchInput = document.getElementById('softwareSearch');
    const loadMoreBtn = document.getElementById('loadMoreBtn');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const value = e.target.value.toLowerCase();
            const categories = document.querySelectorAll('.category-block');

            categories.forEach(block => {
                const items = block.querySelectorAll('.software-item');
                let hasVisibleItems = false;

                items.forEach(item => {
                    const text = item.textContent.toLowerCase();
                    if (text.includes(value)) {
                        item.classList.remove('hidden');
                        hasVisibleItems = true;
                    } else {
                        item.classList.add('hidden');
                    }
                });

                // Si la categoría no tiene items visibles, se oculta el bloque completo
                if (hasVisibleItems) {
                    block.classList.remove('hidden');
                } else {
                    block.classList.add('hidden');
                }
            });

            // Ocultar botón "Cargar más" mientras se busca
            if (value.length > 0) {
                loadMoreBtn.classList.add('hidden');
            } else {
                loadMoreBtn.classList.remove('hidden');
                // Aquí podrías reiniciar la paginación si quieres
            }
        });
    }

    // --- LÓGICA CARGAR MÁS (SIMULADA) ---
    // Supongamos que inicialmente solo mostramos 2 bloques de categorías
    let visibleCategories = 2;
    const allCategories = document.querySelectorAll('.category-block');

    function initPaginacion() {
        allCategories.forEach((cat, index) => {
            if (index >= visibleCategories) cat.classList.add('hidden');
        });
    }

    loadMoreBtn?.addEventListener('click', () => {
        visibleCategories += 2; // Mostramos 2 más cada vez
        allCategories.forEach((cat, index) => {
            if (index < visibleCategories) cat.classList.remove('hidden');
        });

        if (visibleCategories >= allCategories.length) {
            loadMoreBtn.classList.add('hidden');
        }
    });

    // Arrancar paginación
    if (allCategories.length > visibleCategories) {
        initPaginacion();
    } else {
        loadMoreBtn?.classList.add('hidden');
    }

    // Movimiento suave del fondo (Blob)
    document.addEventListener('mousemove', (e) => {
        const blob = document.querySelector('.blob');
        if (blob) {
            // Usamos una pequeña fórmula para que el movimiento sea fluido
            const x = e.clientX;
            const y = e.clientY;

            blob.style.transform = `translate(${x - 200}px, ${y - 200}px)`;
        }
    });

    // Lógica de Filtrado de Productos
    document.querySelectorAll('.filter-btn').forEach(button => {
        button.addEventListener('click', () => {
            // Quitar clase active de todos y ponerla al clicado
            document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const filter = button.getAttribute('data-filter');

            document.querySelectorAll('.product-item').forEach(item => {
                if (filter === 'all' || item.getAttribute('data-category') === filter) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });

    ///HISTORIAS

   
});