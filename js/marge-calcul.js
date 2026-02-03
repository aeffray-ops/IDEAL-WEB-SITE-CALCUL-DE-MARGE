/**
 * Moteur de calcul - Simulateur de marge IDEAL
 * Formules fidèles à l'Excel
 */

const MargeCalcul = (function() {
  function toNum(val) {
    if (val === '' || val === null || val === undefined) return 0;
    const n = parseFloat(String(val).replace(',', '.').replace(/\s/g, ''));
    return isNaN(n) ? 0 : n;
  }

  function round2(n) { return Math.round(n * 100) / 100; }

  function formatEuro(n) {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0);
  }

  function formatPct(n) {
    return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0) + ' %';
  }

  /** Calcul par lot */
  function calcLot(lot) {
    const prixAchat = toNum(lot.prixAchat);
    const surface = toNum(lot.surface);
    const typeBien = (lot.typeBien || 'Bâti').toString();
    const margeCibleTravaux = toNum(lot.margeCibleTravaux) / 100;
    const margeCibleBien = toNum(lot.margeCibleBien) / 100;
    const comAI = toNum(lot.comAI);
    const travauxHT = toNum(lot.travauxHT);

    const prixM2 = surface > 0 ? round2(prixAchat / surface) : 0;
    const tvaTerrainPct = (typeBien === 'Terrain') ? 20 : 0;

    const pvDuBien = round2(prixAchat);
    const margeBien = round2(pvDuBien * margeCibleBien);
    const pvIHP = round2(pvDuBien + margeBien);

    const tvaTravaux = round2(travauxHT * 0.10);
    const travauxTTC = round2(travauxHT + tvaTravaux);
    const margeTRV = round2(travauxHT * margeCibleTravaux);
    const totalMargeIHP = round2(margeBien + margeTRV);

    return {
      prixAchat,
      surface,
      typeBien,
      margeCibleTravaux: toNum(lot.margeCibleTravaux),
      margeCibleBien: toNum(lot.margeCibleBien),
      comAI: toNum(lot.comAI),
      tvaTerrainPct,
      travauxHT,
      prixM2,
      pvDuBien,
      margeBien,
      pvIHP,
      tvaTravaux,
      travauxTTC,
      margeTRV,
      totalMargeIHP,
    };
  }

  /** Frais divers projet */
  function calcFraisDivers(prixAchatTotal, fraisDivers) {
    const notairePct = toNum(fraisDivers.notairePct) / 100;
    const fraisGeo = toNum(fraisDivers.fraisGeo);
    const fraisDiag = toNum(fraisDivers.fraisDiag);
    const fraisArchiJuri = toNum(fraisDivers.fraisArchiJuri);
    const fraisNotaire = round2(prixAchatTotal * notairePct);
    const totalFraisDivers = round2(fraisNotaire + fraisGeo + fraisDiag + fraisArchiJuri);
    const coutTotalAcquisition = round2(prixAchatTotal + totalFraisDivers);
    return {
      prixAchatTotal,
      notairePct: toNum(fraisDivers.notairePct),
      fraisNotaire,
      fraisGeo,
      fraisDiag,
      fraisArchiJuri,
      totalFraisDivers,
      coutTotalAcquisition,
    };
  }

  /** Récap total */
  function calcRecap(simulation) {
    const lotsCalc = (simulation.lots || []).map(l => calcLot(l));
    const lots = lotsCalc.length;
    if (lots === 0) return { lotsCalc, recap: null, frais: null };

    const prixAchatTotal = round2(lotsCalc.reduce((s, l) => s + l.prixAchat, 0));
    const frais = calcFraisDivers(prixAchatTotal, simulation.fraisDivers || {});
    const honorairesAgentsImmo = toNum(simulation.fraisDivers?.honorairesAI) || toNum(simulation.honorairesAgentsImmo);

    const prixVenteTotal = round2(lotsCalc.reduce((s, l) => s + l.pvIHP, 0));
    const sousTotalAcquisition = round2(prixVenteTotal + frais.totalFraisDivers);

    const comAITotal = round2(lotsCalc.reduce((s, l) => s + l.comAI, 0));

    const margeBruteTotalSansTravaux = round2(prixVenteTotal - prixAchatTotal - frais.totalFraisDivers);
    const margeNetteSansTravaux = round2(margeBruteTotalSansTravaux - honorairesAgentsImmo);

    const travauxHTTotal = round2(lotsCalc.reduce((s, l) => s + l.travauxHT, 0));
    const tvaTravauxTotal = round2(lotsCalc.reduce((s, l) => s + l.tvaTravaux, 0));
    const sousTotalTravauxTTCPlusMargeIHP = round2(lotsCalc.reduce((s, l) => s + l.travauxTTC + l.margeTRV, 0));
    const surfaceTotal = lotsCalc.reduce((s, l) => s + l.surface, 0);
    const prixM2Moyen = surfaceTotal > 0 ? round2((prixVenteTotal + travauxHTTotal + tvaTravauxTotal) / surfaceTotal) : 0;

    const sommeMargeTRV = round2(lotsCalc.reduce((s, l) => s + l.margeTRV, 0));
    const prixVenteAvecTravauxEtCom = round2(prixVenteTotal + travauxHTTotal + tvaTravauxTotal + sommeMargeTRV);

    const commissionIHPBien = round2(lotsCalc.reduce((s, l) => s + l.margeBien, 0));
    const commissionIHPTravaux = round2(lotsCalc.reduce((s, l) => s + l.margeTRV, 0));
    const totalCommissionIHP = round2(commissionIHPBien + commissionIHPTravaux);

    const tvaSurMargeTravaux = round2(commissionIHPTravaux * 0.20);
    const margeNetteNetteTRV = round2(commissionIHPTravaux - tvaSurMargeTravaux);
    const tvaSurMargeBien = round2(commissionIHPBien * 0.20);
    const margeNetteNetteBien = round2(commissionIHPBien - tvaSurMargeBien);
    const totalMargeNetteApresTVASurMarge = round2(margeNetteNetteTRV + margeNetteNetteBien);

    const margeNetteProjet = round2(totalMargeNetteApresTVASurMarge - comAITotal - frais.totalFraisDivers - honorairesAgentsImmo);

    const investissementTotalPourROI = round2(frais.coutTotalAcquisition + honorairesAgentsImmo);
    const ROIProjetTotal = investissementTotalPourROI > 0 ? round2((margeNetteProjet / investissementTotalPourROI) * 100) : 0;
    const ratioMargeCA = prixVenteAvecTravauxEtCom > 0 ? round2((margeNetteProjet / prixVenteAvecTravauxEtCom) * 100) : 0;

    const decision = getDecision(margeNetteProjet);

    const recap = {
      prixVenteTotal,
      sousTotalAcquisition,
      honorairesAgentsImmo,
      margeNetteProjet,
      comAITotal,
      margeBruteTotalSansTravaux,
      margeNetteSansTravaux,
      travauxHTTotal,
      tvaTravauxTotal,
      sousTotalTravauxTTCPlusMargeIHP,
      prixM2Moyen,
      surfaceTotal,
      prixVenteAvecTravauxEtCom,
      commissionIHPBien,
      commissionIHPTravaux,
      totalCommissionIHP,
      tvaSurMargeTravaux,
      margeNetteNetteTRV,
      tvaSurMargeBien,
      margeNetteNetteBien,
      totalMargeNetteApresTVASurMarge,
      investissementTotalPourROI,
      ROIProjetTotal,
      ratioMargeCA,
      decision,
    };

    return { lotsCalc, recap, frais };
  }

  function getDecision(margeNetteProjet) {
    const m = toNum(margeNetteProjet);
    if (m < 10000) return { code: '🔴 NO GO', seuil: '< 10 000 €', classe: 'no-go' };
    if (m <= 30000) return { code: '🟠 RÉFLEXION', seuil: '10 000 € - 30 000 €', classe: 'reflexion' };
    return { code: '🟢 GO', seuil: '> 30 000 €', classe: 'go' };
  }

  function compute(simulation) {
    return calcRecap(simulation);
  }

  function getNumber(id) {
    const el = document.getElementById(id);
    if (!el) return 0;
    const v = (el.value || '').toString().replace(',', '.').replace(/\s/g, '');
    const n = parseFloat(v);
    return isNaN(n) ? 0 : n;
  }

  function setMoney(id, value) {
    const el = document.getElementById(id);
    if (el) el.value = formatEuro(value || 0);
  }

  function setPercent(id, value) {
    const el = document.getElementById(id);
    if (el) el.value = formatPct(value || 0);
  }

  function setNumber(id, value) {
    const el = document.getElementById(id);
    if (el) el.value = (value != null && value !== '') ? String(value) : '';
  }

  function recalc(simulation) {
    if (!simulation) return;
    syncSimulationFromDOM(simulation);
    const result = compute(simulation);
    return result;
  }

  function syncSimulationFromDOM(simulation) {
    const nb = simulation.meta?.nbLots || simulation.lots?.length || 1;
    for (let i = 0; i < nb; i++) {
      const n = i + 1;
      simulation.lots[i] = simulation.lots[i] || {};
      simulation.lots[i].prixAchat = getNumber('lot' + n + '_prixAchat');
      simulation.lots[i].surface = getNumber('lot' + n + '_surface');
      const typeEl = document.getElementById('lot' + n + '_typeBien');
      simulation.lots[i].typeBien = typeEl ? typeEl.value : 'Bâti';
      simulation.lots[i].margeCibleTravaux = getNumber('lot' + n + '_margeTrav') || 15;
      simulation.lots[i].margeCibleBien = getNumber('lot' + n + '_margeBien') || 10;
      simulation.lots[i].comAI = getNumber('lot' + n + '_comAI');
      simulation.lots[i].travauxHT = getNumber('lot' + n + '_travauxHT');
    }
    simulation.fraisDivers = simulation.fraisDivers || {};
    simulation.fraisDivers.notairePct = getNumber('notaire_pct') || 3;
    simulation.fraisDivers.fraisGeo = getNumber('frais_geo');
    simulation.fraisDivers.fraisDiag = getNumber('frais_diag');
    simulation.fraisDivers.fraisArchiJuri = getNumber('frais_archi');
    simulation.fraisDivers.honorairesAI = getNumber('honoraires_ai');
    simulation.honorairesAgentsImmo = simulation.fraisDivers.honorairesAI;
  }

  return {
    toNum,
    round2,
    calcLot,
    calcFraisDivers,
    calcRecap,
    compute,
    getDecision,
    formatEuro,
    formatPct,
    getNumber,
    setMoney,
    setPercent,
    setNumber,
    recalc,
    syncSimulationFromDOM,
  };
})();
