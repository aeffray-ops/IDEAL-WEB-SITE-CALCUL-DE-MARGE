/**
 * Stockage localStorage - Historique simulations marge
 * Clé : margeSimulations_v1
 */

const MargeStorage = (function() {
  const KEY = 'margeSimulations_v1';

  function list() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return [];
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : [];
    } catch (e) {
      return [];
    }
  }

  function save(simulation) {
    const arr = list();
    const id = simulation.meta?.id || 's_' + Date.now();
    const meta = {
      ...simulation.meta,
      id,
      timestamp: Date.now(),
      decision: (simulation.recap && simulation.recap.decision) ? simulation.recap.decision.code : '',
    };
    const item = {
      meta,
      lots: JSON.parse(JSON.stringify(simulation.lots || [])),
      fraisDivers: JSON.parse(JSON.stringify(simulation.fraisDivers || {})),
      honorairesAgentsImmo: simulation.honorairesAgentsImmo ?? 0,
      recap: null,
    };
    const idx = arr.findIndex(x => x.meta?.id === id);
    if (idx >= 0) arr[idx] = item;
    else arr.unshift(item);
    try {
      localStorage.setItem(KEY, JSON.stringify(arr));
      return id;
    } catch (e) {
      return null;
    }
  }

  function load(id) {
    const arr = list();
    return arr.find(x => x.meta?.id === id) || null;
  }

  function remove(id) {
    const arr = list().filter(x => x.meta?.id !== id);
    try {
      localStorage.setItem(KEY, JSON.stringify(arr));
      return true;
    } catch (e) {
      return false;
    }
  }

  function duplicate(id) {
    const item = load(id);
    if (!item) return null;
    const clone = {
      meta: {
        ...item.meta,
        id: 's_' + Date.now(),
        nom: (item.meta?.nom || 'Sans nom') + ' (copie)',
        timestamp: Date.now(),
      },
      lots: JSON.parse(JSON.stringify(item.lots || [])),
      fraisDivers: JSON.parse(JSON.stringify(item.fraisDivers || {})),
      honorairesAgentsImmo: item.honorairesAgentsImmo ?? 0,
      recap: null,
    };
    return save(clone);
  }

  return { list, save, load, remove, duplicate, KEY };
})();
