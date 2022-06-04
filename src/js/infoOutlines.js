import data from '../data/data.json';

const showMapInfoHandler = (outline, modal, name) => {
  const info = data[name.toLowerCase().replace(/\s/g, '_')];
  const title = info?.data?.title || name;
  const desc = info?.content || `Sorry, there is no information available about '${title}'`;

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
