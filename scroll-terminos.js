document.addEventListener('DOMContentLoaded', () => {
    const slider = document.getElementById('contenedor-terminos');
    let isDown = false;
    let startY;
    let scrollTop;

    // ==========================================
    // EVENTOS PARA ESCRITORIO (RATÓN)
    // ==========================================
    slider.addEventListener('mousedown', (e) => {
        isDown = true;
        slider.style.cursor = 'grabbing'; // Feedback visual
        // Guardamos la posición inicial del clic y del scroll
        startY = e.pageY - slider.offsetTop;
        scrollTop = slider.scrollTop;
    });

    slider.addEventListener('mouseleave', () => {
        isDown = false;
        slider.style.cursor = 'grab';
    });

    slider.addEventListener('mouseup', () => {
        isDown = false;
        slider.style.cursor = 'grab';
    });

    slider.addEventListener('mousemove', (e) => {
        if (!isDown) return; 
        e.preventDefault(); // Evita selecciones de texto raras
        const y = e.pageY - slider.offsetTop;
        const walk = (y - startY) * 1.5; // Multiplicador de velocidad de arrastre
        slider.scrollTop = scrollTop - walk;
    });

    // ==========================================
    // EVENTOS PARA DISPOSITIVOS MÓVILES (TÁCTIL)
    // ==========================================
    slider.addEventListener('touchstart', (e) => {
        isDown = true;
        startY = e.touches[0].pageY - slider.offsetTop;
        scrollTop = slider.scrollTop;
    }, { passive: true });

    slider.addEventListener('touchend', () => {
        isDown = false;
    });

    slider.addEventListener('touchmove', (e) => {
        if (!isDown) return;
        const y = e.touches[0].pageY - slider.offsetTop;
        const walk = (y - startY) * 1.5; // Multiplicador de velocidad de arrastre
        slider.scrollTop = scrollTop - walk;
    }, { passive: true });
});