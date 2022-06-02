import markdown from 'markdown-it';

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
            map.focus();

            setTimeout(() => {
                modal.style.display = 'none';
                modal.style.transition = '';
            }, 200);
        });
    });
};

export default (map, modal) => {
    // Track if we're panning the map
    let isMouseDown = false, isPanning = false;
    map.addEventListener('mousedown', () => { isMouseDown = true; isPanning = false; });
    map.addEventListener('mouseup', () => { isMouseDown = false; });
    map.addEventListener('beforePan', () => { if (isMouseDown) isPanning = true; });

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
