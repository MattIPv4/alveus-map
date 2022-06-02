import hammer from 'hammerjs';
import svgPanZoom from 'svg-pan-zoom';

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

export default svg => {
    const minZoom = 0.5;
    const maxZoom = 5;

    // Start up basic panning and zooming
    const panZoom = svgPanZoom(svg, {
        zoomScaleSensitivity: 0.5,
        minZoom,
        maxZoom,
        customEventsHandler: mobileEventsHandler(),
        beforePan(oldPan, newPan) {
            // Let other logic know we're panning
            svg.dispatchEvent(new CustomEvent('beforePan', { detail: { oldPan, newPan } }));

            // Ensure the user doesn't pan the svg off the screen
            return clampPosition(this, newPan);
        },
    });
    svg.getElementsByClassName('svg-pan-zoom_viewport')[0].style.willChange = 'transform';

    // Allow other logic to pan the svg
    svg.addEventListener('panBy', e => { panZoom.panBy(e.detail); });

    // Allow keyboard navigation
    svg.setAttribute('tabindex', '-1');
    svg.focus();
    svg.addEventListener('click', () => { svg.focus(); });
    svg.addEventListener('keydown', e => {
        // If the user is holding down shift, allow faster panning
        const mult = e.shiftKey ? 10 : 1;

        // Determine pan direction
        let pan;
        if (e.key === 'ArrowUp') pan = { x: 0, y: 20 * mult };
        else if (e.key === 'ArrowDown') pan = { x: 0, y: -20 * mult };
        else if (e.key === 'ArrowLeft') pan = { x: 20 * mult, y: 0 };
        else if (e.key === 'ArrowRight') pan = { x: -20 * mult, y: 0 };

        // If key was a pan direction, pan the svg
        if (pan) {
            e.preventDefault();
            panZoom.panBy(pan);
        }
    });

    // Ensure the minimum zoom remains based on the screen size
    computeMinZoom(panZoom, minZoom, maxZoom, true);
    window.addEventListener('resize', () => {
        computeMinZoom(panZoom, minZoom, maxZoom);
        panZoom.pan(clampPosition(panZoom, panZoom.getPan()));
    });
};
