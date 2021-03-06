import data from '../data/data.json';

const infoName = id => id.toLowerCase().replace(/ +\[outline]$/, '').replace(/\s/g, '_');

const setHash = hash => window.location.hash === (hash ? `#${hash}` : '')
  ? null
  : history?.pushState
    ? history.pushState(null, null, hash ? `#${hash}` : ' ')
    : window.location.hash = hash ? `#${hash}` : '';

const showMapInfoHandler = (outline, modal, id) => {
  const name = infoName(id);
  const info = data[name];
  const title = info?.data?.title || name;
  const desc = info?.content || `Sorry, there is no information available about '${title}'`;

  return e => new Promise(resolve => {
    e?.preventDefault();

    // Mark the outline as active
    outline.classList.add('active');
    setHash(name);

    // Inject the modal content
    modal.querySelector('#info-title').textContent = title;
    modal.querySelector('#info-desc').innerHTML = desc;

    // Inject the GitHub link
    modal.querySelector('#info-desc').appendChild(document.createElement('hr'));
    const github = document.createElement('p');
    github.appendChild(document.createTextNode('Want to improve this information? '));
    const githubLink = document.createElement('a');
    githubLink.href = `https://github.com/MattIPv4/alveus-map/edit/master/src/data/${info?.file || `${name}.md`}`;
    githubLink.textContent = 'Edit it on GitHub';
    githubLink.target = '_blank';
    githubLink.rel = 'noreferrer';
    github.appendChild(githubLink);
    modal.querySelector('#info-desc').appendChild(github);

    // Show the modal
    modal.style.display = 'flex';
    modal.style.transition = 'opacity 0.2s ease-in-out';
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        modal.style.opacity = '1';
        modal.setAttribute('aria-hidden', 'false');
        modal.focus();

        setTimeout(() => {
          modal.style.transition = '';
          resolve();
        }, 200);
      });
    });
  });
};

const hideMapInfoHandler = (map, modal, hash = true) => e => new Promise(resolve => {
  e?.preventDefault();

  // Clean up the active outline
  const active = map.querySelector('.active');
  if (active) active.classList.remove('active');
  if (hash) setHash('');

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
        resolve();
      }, 200);
    });
  });
});

const hashHandler = (map, modal, outlines) => async () => {
  const hash = window.location.hash.replace(/^#/, '');
  if (Object.prototype.hasOwnProperty.call(data, hash)) {
    const outline = outlines.find(elm => infoName(elm.getAttribute('id')) === (data[hash].data.outline || hash));
    if (outline) {
      outline.focus();
      if (modal.style.display !== 'none') await hideMapInfoHandler(map, modal, false)();
      await showMapInfoHandler(outline, modal, hash)();
    }
  }
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
    if (e.key === 'Enter' || e.key === ' ') closeHandler(e).then();
  });
  modal.addEventListener('click', e => {
    if (e.target === modal) closeHandler(e).then();
  });
  modal.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeHandler(e).then();
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
    const showHandler = showMapInfoHandler(outline, modal, outline.getAttribute('id'));
    outline.addEventListener('click', e => {
      if (!isPanning) showHandler(e).then();
    });
    outline.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') showHandler(e).then();
    });
  });

  // Hide the built-in info overlay on the map
  map.querySelector('#Overlay').style.display = 'none';

  // Check if we need to open a modal
  // We wait two frames to ensure the map panning/zooming has loaded
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      const handler = hashHandler(map, modal, outlines);
      window.addEventListener('hashchange', handler);
      handler().then();
    });
  });
};
