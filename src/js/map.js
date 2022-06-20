import animateMap from './animateMap';
import infoOutlines from './infoOutlines';
import panZoom from './panZoom';

document.addEventListener('DOMContentLoaded', () => {
  const map = document.getElementsByTagName('svg')[0];
  const info = document.getElementById('info');
  infoOutlines(map, info);
  animateMap(map);
  panZoom(map);
});
