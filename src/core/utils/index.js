// Only these utilities are exposed to field modules as window.farmOS.utils
import { mergeGeometries, removeGeometry, isNearby } from './geometry';
import parseNotes from './parseNotes';
import daysAway from './daysAway';

export default {
  mergeGeometries,
  removeGeometry,
  isNearby,
  parseNotes,
  daysAway,
};
