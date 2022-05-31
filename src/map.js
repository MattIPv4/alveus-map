import svgPanZoom from 'svg-pan-zoom';

document.addEventListener('DOMContentLoaded', () => {
    const map = document.getElementsByTagName('svg')[0];
    const maxZoomMult = 15;

    const clampPosition = (pz, pos) => {
        // Ensure all the edges remain pinned to the viewport edges
        const sizes = pz.getSizes();
        const maxWidth = (sizes.viewBox.width * sizes.realZoom) - sizes.width;
        const maxHeight = (sizes.viewBox.height * sizes.realZoom) - sizes.height;
        return {
            x: Math.max(Math.min(pos.x, 0), -maxWidth),
            y: Math.max(Math.min(pos.y, 0), -maxHeight),
        };
    };

    const computeMinZoom = pz => {
        // Trigger panZoom to update the viewBox
        pz.resize();

        // Ensure the minimum zoom fills the screen
        const currentZoom = pz.getZoom();
        const currentSizes = pz.getSizes();
        const actualWidth = currentSizes.viewBox.width * currentSizes.realZoom;
        const widthRatio = currentSizes.width / actualWidth;
        const actualHeight = currentSizes.viewBox.height * currentSizes.realZoom;
        const heightRatio = currentSizes.height / actualHeight;

        // Apply the new minimum zoom
        const minZoom = Math.max(widthRatio, heightRatio) * currentZoom;
        pz.setMinZoom(minZoom);
        if (pz.getZoom() < minZoom) {
            pz.zoom(minZoom);
            pz.pan(clampPosition(pz, pz.getPan()));
        }

        // Apply the new maximum zoom
        const maxZoom = minZoom * maxZoomMult;
        pz.setMaxZoom(maxZoom);
        if (pz.getZoom() > maxZoom) {
            pz.zoom(maxZoom);
            pz.pan(clampPosition(pz, pz.getPan()));
        }
    };

    const panZoom = svgPanZoom(map, {
        center: true,
        zoomScaleSensitivity: 0.5,
        minZoom: 1,
        maxZoom: maxZoomMult,
        beforePan(_, newPan) { return clampPosition(this, newPan); },
    });

    computeMinZoom(panZoom);
    window.addEventListener('resize', () => {
        computeMinZoom(panZoom);
        panZoom.pan(clampPosition(panZoom, panZoom.getPan()));
    });
});
