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

const startPanZoom = svg => {
    const minZoom = 0.5;
    const maxZoom = 5;

    const panZoom = svgPanZoom(svg, {
        zoomScaleSensitivity: 0.5,
        minZoom,
        maxZoom,
        beforePan(_, newPan) { return clampPosition(this, newPan); },
    });

    computeMinZoom(panZoom, minZoom, maxZoom, true);
    window.addEventListener('resize', () => {
        computeMinZoom(panZoom, minZoom, maxZoom);
        panZoom.pan(clampPosition(panZoom, panZoom.getPan()));
    });
};

document.addEventListener('DOMContentLoaded', () => {
    const map = document.getElementsByTagName('svg')[0];
    startPanZoom(map);
});
