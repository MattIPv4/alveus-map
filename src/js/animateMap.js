const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const frame = () => new Promise(resolve => window.requestAnimationFrame(resolve));
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

export default async map => {
  // Get some initial values from the birds and map
  const birds = map.querySelector('#Birds');
  const opacity = Number(birds.getAttribute('opacity')) || Number(birds.style.opacity) || 1;
  const { x: baseX, y: baseY, width, height } = birds.getBBox();
  const { width: mapWidth, height: mapHeight } = map.getBBox();

  // Define some constants for the animation
  const totalTime = 5000;
  const fadeTime = 2500; // Must not exceed totalTime / 2
  const travelDistance = Math.min(200, mapWidth - width, mapHeight - height);

  // Ensure the birds are hidden
  birds.removeAttribute('opacity');
  birds.style.opacity = '0';
  birds.style.pointerEvents = 'none';
  birds.style.transform = `translate(${-baseX}px, ${-baseY}px)`;

  // Animate the birds
  const animate = async () => {
    const randX = random(travelDistance, mapWidth - width) - baseX;
    const randY = random(travelDistance, mapHeight - height) - baseY;

    birds.style.transform = `translate(${randX}px, ${randY}px)`;
    await frame();
    await frame();

    birds.style.transition = `transform ${totalTime}ms linear, opacity ${fadeTime}ms ease-in-out`;
    birds.style.opacity = opacity;
    birds.style.transform = `translate(${randX - travelDistance}px, ${randY - travelDistance}px)`;
    await sleep(totalTime - fadeTime);

    birds.style.opacity = '0';
    await sleep(fadeTime);

    birds.style.transition = '';
    await frame();
    await frame();
  };
  let active = false;
  const animateLoop = async () => {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      if (!active) break;
      await animate();
      await sleep(random(5000, 30000));
    }
  };

  // Track if we should run the animation
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  mediaQuery.addEventListener('change', () => {
    // Ignore if no change
    if (mediaQuery.matches === !active) return;

    // Toggle the animation
    active = !mediaQuery.matches;

    // If now active, start the loop
    if (active) animateLoop().then();
  });

  // Start the initial loop if active, but not immediately
  await sleep(random(1000, 5000));
  active = !mediaQuery.matches;
  if (active) animateLoop().then();
};
