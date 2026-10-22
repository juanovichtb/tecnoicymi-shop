
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
        if (
            path.includes('/sistemas-operativos/') ||
            path.includes('/ofimatica/') ||
            path.includes('/multimedia/')
        ) {
            return '../../../';
        }

        // Nivel 2: recursos/software/index.html,
        // recursos/guias/index.html o recursos/historias/
        if (
            path.includes('/recursos/software/') ||
            path.includes('/recursos/guias/') ||
            path.includes('/recursos/historias/')
        ) {
            return '../../';
        }

        // Nivel 1: recursos/index.html, soporte/index.html
        // o productos/index.html
        if (
            path.includes('/recursos/') ||
            path.includes('/soporte/') ||
            path.includes('/productos/')
        ) {
            return '../';
        }

        // Nivel 0: index.html (raíz)
        return '';
    }

    const root = getRootPath();

    // =========================================
    // 1. CARGAR HEADER
    // =========================================

    const headerPlaceholder = document.getElementById('header-placeholder');

    if (headerPlaceholder) {
        fetch(`${root}assets/partials/header.html`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error al cargar header');
                }

                return response.text();
            })
            .then(data => {
                headerPlaceholder.innerHTML = data;

                // Aquí se puede añadir lógica para resaltar
                // el enlace activo de navegación.
            })
            .catch(err => console.error(err));
    }

    // =========================================
    // 2. CARGAR FOOTER
    // =========================================

    const footerPlaceholder = document.getElementById('footer-placeholder');

    if (footerPlaceholder) {
        fetch(`${root}assets/partials/footer.html`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error al cargar footer');
                }

                return response.text();
            })
            .then(data => {
                footerPlaceholder.innerHTML = data;
            })
            .catch(err => console.error(err));
    }

    // =========================================
    // 3. BÚSQUEDA Y FILTRADO DE SOFTWARE
    // =========================================

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

                // Ocultar categorías sin resultados.
                if (hasVisibleItems) {
                    block.classList.remove('hidden');
                } else {
                    block.classList.add('hidden');
                }
            });

            // Ocultar o mostrar "Cargar más" si existe.
            if (loadMoreBtn) {
                if (value.length > 0) {
                    loadMoreBtn.classList.add('hidden');
                } else {
                    loadMoreBtn.classList.remove('hidden');
                }
            }
        });
    }

    // =========================================
    // 4. PAGINACIÓN DE CATEGORÍAS
    // =========================================

    // Mostrar inicialmente dos categorías.
    let visibleCategories = 2;

    const allCategories = document.querySelectorAll('.category-block');

    function initPaginacion() {
        allCategories.forEach((category, index) => {
            if (index >= visibleCategories) {
                category.classList.add('hidden');
            }
        });
    }

    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
            visibleCategories += 2;

            allCategories.forEach((category, index) => {
                if (index < visibleCategories) {
                    category.classList.remove('hidden');
                }
            });

            if (visibleCategories >= allCategories.length) {
                loadMoreBtn.classList.add('hidden');
            }
        });
    }

    // Iniciar paginación solo si hay categorías.
    if (allCategories.length > visibleCategories) {
        initPaginacion();
    } else if (loadMoreBtn) {
        loadMoreBtn.classList.add('hidden');
    }

    // =========================================
    // 5. MOVIMIENTO DEL FONDO (BLOB)
    // =========================================

    document.addEventListener('mousemove', (e) => {
        const blob = document.querySelector('.blob');

        if (blob) {
            const x = e.clientX;
            const y = e.clientY;

            blob.style.transform = `translate(${x - 200}px, ${y - 200}px)`;
        }
    });

    // =========================================
    // 6. FILTRADO DE PRODUCTOS
    // =========================================

    document.querySelectorAll('.filter-btn').forEach(button => {
        button.addEventListener('click', () => {

            // Actualizar el botón activo.
            document.querySelectorAll('.filter-btn').forEach(btn => {
                btn.classList.remove('active');
            });

            button.classList.add('active');

            const filter = button.getAttribute('data-filter');

            // Mostrar u ocultar productos según la categoría.
            document.querySelectorAll('.product-item').forEach(item => {
                if (
                    filter === 'all' ||
                    item.getAttribute('data-category') === filter
                ) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });

    // =========================================
    // 7. SIGNIFICADO DE TECNOICYMI
    // =========================================

    const secretToggle = document.getElementById('secretToggle');
    const secretText = document.getElementById('secretText');

    if (secretToggle && secretText) {
        secretToggle.addEventListener('click', () => {

            const isExpanded =
                secretToggle.getAttribute('aria-expanded') === 'true';

            // Mostrar u ocultar el significado.
            secretText.hidden = isExpanded;

            // Actualizar el estado accesible del botón.
            secretToggle.setAttribute(
                'aria-expanded',
                String(!isExpanded)
            );

            // Actualizar el texto del botón.
            secretToggle.textContent = isExpanded
                ? 'Descubre el significado →'
                : 'Ocultar significado ↑';
        });
    }

    // =========================================
    // 8. HISTORIAS
    // =========================================

});
