document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('year').textContent = new Date().getFullYear();
    const toggle = document.getElementById('nav-toggle');
    const nav = document.getElementById('main-nav');
    const links = [...nav.querySelectorAll('a')];
    const setMenu = open => {
        nav.classList.toggle('open', open);
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    };
    toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
    links.forEach(link => link.addEventListener('click', () => setMenu(false)));
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
            setMenu(false);
            toggle.focus();
        }
    });
    document.addEventListener('click', event => {
        if (!document.getElementById('site-header').contains(event.target)) setMenu(false);
    });
    const desktop = matchMedia('(min-width: 801px)');
    desktop.addEventListener('change', () => setMenu(false));
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                links.forEach(link => {
                    const active = link.hash === '#' + entry.target.id;
                    link.classList.toggle('active', active);
                    if (active) link.setAttribute('aria-current', 'location');
                    else link.removeAttribute('aria-current');
                });
            });
        }, { rootMargin: '-20% 0px -60% 0px' });
        document.querySelectorAll('main section[id]').forEach(section => observer.observe(section));
    }
    // Content remains visible if JavaScript or observers are unavailable.
    if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const revealObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                entry.target.classList.remove('reveal-pending');
                entry.target.classList.add('is-visible');
                revealObserver.unobserve(entry.target);
            });
        }, { threshold: 0.1 });
        document.querySelectorAll('.reveal').forEach(element => {
            element.classList.add('reveal-pending');
            revealObserver.observe(element);
        });
    }
    const model = document.getElementById('drill-model');
    const rotate = document.getElementById('rotate-toggle');
    const reset = document.getElementById('reset-view');
    const status = document.getElementById('model-status');
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    const setRotation = enabled => {
        model.autoRotate = enabled;
        model.toggleAttribute('auto-rotate', enabled);
        rotate.setAttribute('aria-pressed', String(enabled));
        rotate.textContent = enabled ? 'Pausar giro' : 'Activar giro';
    };
    setRotation(!reducedMotion.matches);
    reducedMotion.addEventListener('change', () => setRotation(!reducedMotion.matches));
    rotate.disabled = reset.disabled = true;
    model.addEventListener('load', () => {
        status.textContent = 'Modelo listo para explorar.';
        rotate.disabled = reset.disabled = false;
    });
    model.addEventListener('error', () => {
        status.textContent = 'No se pudo cargar el modelo. Puedes descargarlo para verlo en un visor compatible.';
        rotate.disabled = reset.disabled = true;
    });
    rotate.addEventListener('click', () => setRotation(!model.autoRotate));
    reset.addEventListener('click', () => {
        model.cameraOrbit = '45deg 65deg auto';
        model.cameraTarget = 'auto auto auto';
        model.fieldOfView = '30deg';
    });
    customElements.whenDefined('model-viewer').then(() => {
        if (model.loaded) {
            status.textContent = 'Modelo listo para explorar.';
            rotate.disabled = reset.disabled = false;
        }
    });
    window.addEventListener('load', () => {
        if (!customElements.get('model-viewer')) {
            status.textContent = 'El visor no está disponible. Puedes descargar el modelo para explorarlo.';
        }
    });
});
