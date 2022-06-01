import svgPanZoom from 'svg-pan-zoom';
import hammer from 'hammerjs';

const clampPosition = (pz, pos) => {
    // Ensure all the edges remain pinned to the viewport edges
    // Or, ensure we're pinned to the center if smaller than the viewport
    const sizes = pz.getSizes();
    const width = sizes.viewBox.width * sizes.realZoom;
    const height = sizes.viewBox.height * sizes.realZoom;
    const extraWidth = Math.max(sizes.width - width, 0) / 2;
    const extraHeight = Math.max(sizes.height - height, 0) / 2;

    // min(x, val) = how far pulled to the right from the left edge
    // max(x, val) = how far pulled to the left from the right edge, offset by the width minus the viewport width
    // min(y, val) = how far pulled to the bottom from the top edge
    // max(y, val) = how far pulled to the top from the bottom edge, offset by the height minus the viewport height
    return {
        x: Math.max(Math.min(pos.x, extraWidth), -(extraWidth + width - sizes.width)),
        y: Math.max(Math.min(pos.y, extraHeight), -(extraHeight + height - sizes.height)),
    };
};

const computeMinZoom = (pz, minZoom, maxZoom, applyBase = false) => {
    // Trigger panZoom to update the viewBox
    pz.resize();

    // Ensure the minimum zoom fills the screen
    const currentSizes = pz.getSizes();
    const actualWidth = currentSizes.viewBox.width * currentSizes.realZoom;
    const widthRatio = currentSizes.width / actualWidth;
    const actualHeight = currentSizes.viewBox.height * currentSizes.realZoom;
    const heightRatio = currentSizes.height / actualHeight;
    const baseZoom = Math.max(widthRatio, heightRatio) * pz.getZoom();

    // Apply the new minimum zoom
    const newMinZoom = baseZoom * minZoom;
    pz.setMinZoom(newMinZoom);
    if (pz.getZoom() < newMinZoom) {
        pz.zoom(newMinZoom);
        pz.pan(clampPosition(pz, pz.getPan()));
    }

    // Apply the new maximum zoom
    const newMaxZoom = baseZoom * maxZoom;
    pz.setMaxZoom(newMaxZoom);
    if (pz.getZoom() > newMaxZoom) {
        pz.zoom(newMaxZoom);
        pz.pan(clampPosition(pz, pz.getPan()));
    }

    // Apply the base zoom if requested
    if (applyBase) {
        pz.zoom(baseZoom);
        pz.center();
        pz.pan(clampPosition(pz, pz.getPan()));
    }
};

const mobileEventsHandler = () => ({
    haltEventListeners: [ 'touchstart', 'touchend', 'touchmove', 'touchleave', 'touchcancel' ],
    init(options) {
        const { instance } = options;
        let initialScale = 1, pannedX = 0, pannedY = 0;

        // Init Hammer
        // Listen only for pointer and touch events
        this.hammer = hammer(options.svgElement, {
            inputClass: hammer.SUPPORT_POINTER_EVENTS ? hammer.PointerEventInput : hammer.TouchInput
        });

        // Enable pinch
        this.hammer.get('pinch').set({ enable: true });

        // Handle double tap
        this.hammer.on('doubletap', () => instance.zoomIn());

        // Handle pan
        this.hammer.on('panstart panmove', ev => {
            // On pan start reset panned variables
            if (ev.type === 'panstart') {
                pannedX = 0;
                pannedY = 0;
            }

            // Pan only the difference
            instance.panBy({ x: ev.deltaX - pannedX, y: ev.deltaY - pannedY });
            pannedX = ev.deltaX;
            pannedY = ev.deltaY;
        });

        // Handle pinch
        this.hammer.on('pinchstart pinchmove', ev => {
            // On pinch start remember initial zoom
            if (ev.type === 'pinchstart') {
                initialScale = instance.getZoom();
                instance.zoomAtPoint(initialScale * ev.scale, { x: ev.center.x, y: ev.center.y });
            }

            instance.zoomAtPoint(initialScale * ev.scale, { x: ev.center.x, y: ev.center.y });
        });

        // Prevent moving the page on some devices when panning over SVG
        options.svgElement.addEventListener('touchmove', e => e.preventDefault());
    },
    destroy() {
        this.hammer.destroy();
    },
});

const startPanZoom = svg => {
    const minZoom = 0.5;
    const maxZoom = 5;

    const panZoom = svgPanZoom(svg, {
        zoomScaleSensitivity: 0.5,
        minZoom,
        maxZoom,
        customEventsHandler: mobileEventsHandler(),
        beforePan(_, newPan) { return clampPosition(this, newPan); },
    });
    svg.getElementsByClassName('svg-pan-zoom_viewport')[0].style.willChange = 'transform';

    computeMinZoom(panZoom, minZoom, maxZoom, true);
    window.addEventListener('resize', () => {
        computeMinZoom(panZoom, minZoom, maxZoom);
        panZoom.pan(clampPosition(panZoom, panZoom.getPan()));
    });
};

const mapInfo = {
    Pasture: {
        title: 'Pasture',
        desc: 'The pasture is a large expanse of dirt, grass and trees. Here you can find Stompy, Acero, Serrano and Jalapeño.'
    },
    Parrots: {
        title: 'Parrot Aviary',
        desc: 'The parrot aviary is large mesh building with a wooden shelter on the side, home to the parrots. Here you can find Tico, Miley, Mia and Siren.'
    },
    Chickens: {
        title: 'Chicken Coop',
        desc: 'The chickens have a large coop and an even larger run with mesh and shade cloth. Here you\'ll find both Oliver and Nugget.'
    },
};

const showMapInfoHandler = (outline, modal, name) => {
    const info = mapInfo[name];
    return e => {
        e.preventDefault();

        // Mark the outline as active
        outline.classList.add('active');

        // Show the modal
        // TODO: Markdown support for desc
        modal.querySelector('#info-title').textContent = info?.title || name;
        modal.querySelector('#info-desc').textContent = info?.desc || `Sorry, there is no information available about '${name}'`;
        modal.style.display = 'flex';
        modal.setAttribute('aria-hidden', 'false');
        modal.focus();
    };
};

const hideMapInfoHandler = (map, modal) => e => {
    e.preventDefault();

    // Clean up the active outline
    const active = map.querySelector('.active');
    if (active) active.classList.remove('active');

    // Hide the modal
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
    document.documentElement.focus();
};

const startClickHandling = (map, modal) => {
    // Ensure the modal can be closed
    const closeHandler = hideMapInfoHandler(map, modal);
    modal.querySelector('button[aria-label="Close"]').addEventListener('click', closeHandler);
    modal.querySelector('button[aria-label="Close"]').addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') closeHandler(e);
    });
    modal.addEventListener('click', e => {
        if (e.target === modal) closeHandler(e);
    });
    modal.addEventListener('keydown', e => {
        if (e.key === 'Escape') closeHandler(e);
    });

    // Allow each outline to open the modal
    const outlines = [ ...map.querySelectorAll('[id$=" [outline]"]') ];
    outlines.forEach(outline => {
        const name = outline.getAttribute('id').replace(/ +\[outline]$/, '');
        outline.setAttribute('tabindex', '0');
        const showHandler = showMapInfoHandler(outline, modal, name);
        // TODO: This seems to run if you drag and end up over an outline, it shouldn't
        outline.addEventListener('click', showHandler);
        outline.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') showHandler(e);
        });
    });
};

document.addEventListener('DOMContentLoaded', () => {
    const map = document.getElementsByTagName('svg')[0];
    const info = document.getElementById('info');
    startPanZoom(map);
    startClickHandling(map, info);
});
