/**
 * Modèle de données - Simulateur de marge IDEAL
 * Structure fidèle à l'Excel
 */

const MargeModel = (function() {
  function createDefaultLot() {
    return {
      prixAchat: '',
      surface: '',
      typeBien: 'Bâti',
      margeCibleTravaux: 15,
      margeCibleBien: 10,
      comAI: 0,
      travauxHT: '',
    };
  }

  function createDefaultFraisDivers() {
    return {
      notairePct: 3,
      fraisGeo: 0,
      fraisDiag: 0,
      fraisArchiJuri: 0,
      honorairesAI: 0,
    };
  }

  function createSimulation(nbLots) {
    const n = Math.min(5, Math.max(1, parseInt(nbLots, 10) || 1));
    const lots = [];
    for (let i = 0; i < n; i++) {
      lots.push(createDefaultLot());
    }
    return {
      meta: {
        id: 's_' + Date.now(),
        nom: '',
        ville: '',
        auteur: '',
        nbLots: n,
        timestamp: Date.now(),
      },
      lots,
      fraisDivers: createDefaultFraisDivers(),
      honorairesAgentsImmo: 0,
    };
  }

  return {
    createDefaultLot,
    createDefaultFraisDivers,
    createSimulation,
  };
})();
