import svgPanZoom from 'svg-pan-zoom';
import hammer from 'hammerjs';
import markdown from 'markdown-it';

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
        beforePan(oldPan, newPan) {
            svg.dispatchEvent(new CustomEvent('beforePan', { detail: { oldPan, newPan } }));
            return clampPosition(this, newPan);
        },
    });
    svg.getElementsByClassName('svg-pan-zoom_viewport')[0].style.willChange = 'transform';
    svg.addEventListener('panBy', e => { panZoom.panBy(e.detail); });

    computeMinZoom(panZoom, minZoom, maxZoom, true);
    window.addEventListener('resize', () => {
        computeMinZoom(panZoom, minZoom, maxZoom);
        panZoom.pan(clampPosition(panZoom, panZoom.getPan()));
    });
};

const mapInfo = {
    Pasture: {
        title: 'Pasture',
        desc: `The pasture is a large expanse of dirt, grass and trees located near the entrance of the property.
At the top end of pasture is the barn, where food for the animals in the pasture is kept, as well as a stall for Winnie and an open stall used to feed some of the animals.
There is a vehicle gate on the left side of the pasture at the top end, and a smaller gate near the barn.
        
Here you can find:
- Stompy _(Emu)_
- Winne _(Cow)_
- Acero _(Horse)_
- Serrano _(Donkey)_
- Jalapeño _(Donkey)_`,
    },
    Parrots: {
        title: 'Parrot Aviary',
        desc: `The parrot aviary is large mesh building with a wooden shelter on the side, home to the parrots.
It is located on the other side of the main road from the top end of the pasture, next to the chickens.

Here you can find:
- Tico _(Blue and Gold Macaw)_
- Miley _(Catalina Macaw)_
- Mia _(African Grey)_
- Siren _(Blue-fronted Amazon)_`,
    },
    Chickens: {
        title: 'Chicken Coop',
        desc: `The chickens have a large wooden coop with multiple nesting boxes, and an even larger run with mesh siding and shade cloth.
The coop is located right next to the parrot aviary, just off the entrance road opposite the pasture.

Here you'll find:
- Oliver _(Olive Egger Chicken)_
- Nugget _(Ameraucana Chicken)_`,
    },
    'Training Center': {
        title: 'Training Center',
        desc: `The training center is a large metal building with a main grass area, as well as some sheltered stalls on one side.
It can be used for a variety of things, from animal exercise to hosting events.`,
    },
    'Car Shelter': {
        title: 'Car Shelter',
        desc: 'Yup, just a shelter for cars. You\'ll probably want to park here if visiting the property.',
    },
    Goats: {
        title: 'Goats',
        desc: `The goat pen is located under the balcony of Ella's house, and is a fenced in area for the goats to live in.

Here you can find:
- Beetle
- Oatmeal`,
    },
    House: {
        title: 'Ella\'s House',
        desc: 'Just a house on the property that Ella happens to live in. Ella is a part time staff member at Alveus.'
    },
    Dogs: {
        title: 'Dog Area + Mural',
        desc: `Attached to the side of the house is a small garden area where dogs can be kept.
On the side of the fence facing toward the training center and pasture, you'll also find a hand-painted mural for Alveus.`,
    },
    Well: {
        title: 'Well Outbuilding',
        desc: `A small outbuilding that contains a well _(or, at least I think it does -- don't quote me on that)_.
An old, shed snake skin was found in here early on in the creation of Alveus.`,
    },
};

const showMapInfoHandler = (outline, modal, name) => {
    const info = mapInfo[name];
    const title = info?.title || name;
    const desc = markdown({ typographer: true })
        .render(info?.desc || `Sorry, there is no information available about '${title}'`);

    return e => {
        e.preventDefault();

        // Mark the outline as active
        outline.classList.add('active');

        // Show the modal
        modal.querySelector('#info-title').textContent = title;
        modal.querySelector('#info-desc').innerHTML = desc;
        modal.style.display = 'flex';
        modal.style.transition = 'opacity 0.2s ease-in-out';
        window.requestAnimationFrame(() => {
            window.requestAnimationFrame(() => {
                modal.style.opacity = '1';
                modal.setAttribute('aria-hidden', 'false');
                modal.focus();

                setTimeout(() => {
                    modal.style.transition = '';
                }, 200);
            });
        });
    };
};

const hideMapInfoHandler = (map, modal) => e => {
    e.preventDefault();

    // Clean up the active outline
    const active = map.querySelector('.active');
    if (active) active.classList.remove('active');

    // Hide the modal
    modal.style.transition = 'opacity 0.2s ease-in-out';
    window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
            modal.style.opacity = '0';
            modal.setAttribute('aria-hidden', 'true');
            document.documentElement.focus();

            setTimeout(() => {
                modal.style.display = 'none';
                modal.style.transition = '';
            }, 200);
        });
    });
};

const startInfoHandling = (map, modal) => {
    // Track if we're panning the map
    let isMouseDown = false, isPanning = false;
    map.addEventListener('mousedown', () => { isMouseDown = true; isPanning = false; });
    map.addEventListener('mouseup', () => { isMouseDown = false; });
    map.addEventListener('beforePan', () => { if (isMouseDown) isPanning = true; });

    // Allow keyboard navigation
    map.setAttribute('tabindex', '-1');
    map.focus();
    map.addEventListener('keydown', e => {
        // If the user is holding down shift, allow faster panning
        const mult = e.shiftKey ? 10 : 1;

        // Determine pan direction
        let pan;
        if (e.key === 'ArrowUp') pan = { x: 0, y: 20 * mult };
        else if (e.key === 'ArrowDown') pan = { x: 0, y: -20 * mult };
        else if (e.key === 'ArrowLeft') pan = { x: 20 * mult, y: 0 };
        else if (e.key === 'ArrowRight') pan = { x: -20 * mult, y: 0 };

        // If key was a pan direction, pan the map
        if (pan) {
            e.preventDefault();
            map.dispatchEvent(new CustomEvent('panBy', { detail: pan }));
        }
    });

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

    const outlines = [ ...map.querySelectorAll('[id$=" [outline]"]') ];
    outlines.forEach(outline => {
        // Allow the user to tab between outlines
        outline.setAttribute('tabindex', '0');
        outline.addEventListener('focus', () => {
            // Determine how much is visible already
            const rect = outline.getBoundingClientRect();
            const mapRect = map.getBoundingClientRect();
            const top = Math.max(rect.top, mapRect.top);
            const left = Math.max(rect.left, mapRect.left);
            const bottom = Math.min(rect.bottom, mapRect.bottom);
            const right = Math.min(rect.right, mapRect.right);
            const areaFull = rect.width * rect.height;
            const areaVisible = Math.max(right - left, 0) * Math.max(bottom - top, 0);

            // Pan into view (centered) if not visible enough
            if (areaVisible / areaFull < 0.25) {
                map.dispatchEvent(new CustomEvent('panBy', { detail: {
                    x: -(rect.left + (rect.width / 2) - (mapRect.width / 2)),
                    y: -(rect.top + (rect.height / 2) - (mapRect.height / 2)),
                } }));
            }
        });

        // Allow each outline to open the modal
        const showHandler = showMapInfoHandler(outline, modal, outline.getAttribute('id').replace(/ +\[outline]$/, ''));
        outline.addEventListener('click', e => {
            if (!isPanning) showHandler(e);
        });
        outline.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') showHandler(e);
        });
    });
};

document.addEventListener('DOMContentLoaded', () => {
    const map = document.getElementsByTagName('svg')[0];
    const info = document.getElementById('info');
    startInfoHandling(map, info);
    startPanZoom(map);
});
