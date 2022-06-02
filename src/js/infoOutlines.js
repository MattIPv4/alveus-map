import markdown from 'markdown-it';
import markdownLinkAttributes from 'markdown-it-link-attributes';

const md = markdown({ typographer: true });
md.use(markdownLinkAttributes, {
  attrs: {
    target: '_blank',
    rel: 'noreferrer',
  },
});

const mapInfo = {
  Pasture: {
    title: 'Pasture',
    desc: `The pasture is a large expanse of dirt, grass and trees located near the entrance of the property.
At the top end of pasture is the barn, where food for the animals in the pasture is kept, as well as a stall for Winnie and an open stall used to feed some of the animals.
There is a vehicle gate on the left side of the pasture at the top end, and a smaller gate near the barn.

Here you can find:
- Stompy _(Emu)_
- Winnie _(Cow)_
- Acero _(Horse)_
- Serrano _(Donkey)_
- Jalapeño _(Donkey)_`,
  },
  Parrots: {
    title: 'Parrot Aviary',
    desc: `The parrot aviary is large metal-mesh building with a wooden shelter on the side, home to the parrots.
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
    desc: 'Just a house on the property that Ella happens to live in. Ella is a part time staff member at Alveus.',
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
  'Critter Cave': {
    title: 'Critter Cave',
    desc: `Located within the studio, the Critter Cave is the home to many of Alveus' critters.
It is comprised of two rooms, with the larger room containing a wall-to-wall terrarium for Noodle as well as a terrarium for Georgie, and a smaller room off to the side with homes for all the smaller critters.

Here you'll be able to find:
- Noodle _(Carpet Python)_
- Georgie _(African Bullfrog)_
- Pickles _(Vinegaroon)_
- Hank _(Smoky Ghost Millipede)_
- Marty(s) _(Zebra Isopods)_
- Barbra(s) & Baked Bean(s) _(Madagascan Hissing Cockroaches)_
- Powder Orange Isopods
- Rubber Ducky Isopods`,
  },
  'The Studio': {
    title: 'The Studio',
    desc: `The Studio is the main office and broadcast space for Alveus, located at the center of the property.
Many of Alveus' streams happen from the studio, including Animal Quest and the P.O. box unboxings.`,
  },
  'Nutrition House': {
    title: 'Nutrition House',
    desc: `The nutrition house is where, as the name suggests, food is stored prepped for all the animals.
A small kitchen is present in this building, with a sink, fridge & freezer available, as well as a microwave.
You'll also find lots of other resources for the animals here, including enrichment items, cleaning producst, etc.
A few ambassadors also live in this building, in terrariums or cages.
_There's also a toilet in this building if you need it._

Here you can find:
- Patchy _(Ball Python)_
- Snork _(Chinchilla)_
- Moomin _(Chinchilla)_`,
  },
  Barn: {
    title: 'Storage Barn',
    desc: `The storage barn is located just above the core buildings of the property, and is used as a workshop for Alveus as well as storage for assorted things.
On the side of the barn, you'll find an enclosure where Orion currently lives, until his full aviary is built.

Here you'll find:
- Orion _(Prairie x Peregrine Falcon)_`,
  },
  Crows: {
    title: 'Crow Enclosure',
    desc: `Further up the main road through the property, beyond the barn, is the crow enclosure.
Similar in construction to the parrot aviary, it is a large metal-mesh building that houses the crows.

This enclosure was sponsored by [PointCrow](https://www.twitch.tv/pointcrow).

Here you'll find:
- Abbott _(American Crow)_
- Coconut _(American Crow)_`,
  },
  Orion: {
    title: 'Falcon Enclosure',
    desc: `Almost opposite the crow enclosure is the new falcon enclosure, another large metal-mesh building.
This enclosure is currently under construction, and will be Orion's home once built.`,
  },
  Foxes: {
    title: 'Fox Enclosure',
    desc: `Right at the top end of the property is the new fox enclosure, which is also currently under construction.
The enclosure is of a similar construction to the enclosures, a large metal-mesh building, but is longer than the other enclosures.
Attached to the side of the enclosure at one end is a wooden house for the foxes to sleep in, and a dome-shaped port-hole window for the foxes to look out from.

This enclosure was sponsored by [QTCinderalla](https://www.twitch.tv/qtcinderella).`,
  },
};

const showMapInfoHandler = (outline, modal, name) => {
  const info = mapInfo[name];
  const title = info?.title || name;
  const desc = md.render(info?.desc || `Sorry, there is no information available about '${title}'`);

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
  map.addEventListener('mousedown', () => {
    isMouseDown = true;
    isPanning = false;
  });
  map.addEventListener('mouseup', () => {
    isMouseDown = false;
  });
  map.addEventListener('beforePan', () => {
    if (isMouseDown) isPanning = true;
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
        map.dispatchEvent(new CustomEvent('panBy', {
          detail: {
            x: -(rect.left + (rect.width / 2) - (mapRect.width / 2)),
            y: -(rect.top + (rect.height / 2) - (mapRect.height / 2)),
          },
        }));
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
