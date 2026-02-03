/**
 * Moteur de calcul - Simulateur de marge IDEAL
 * Objectif: reproduction Excel V5.2 (LOTS + Récap + Acquisition globale) à l'euro/centime près.
 *
 * Références attendues sur l'exemple 1 lot:
 * - LOTS: PV IHP 220k, TVA 8k, TTC 88k, marge TRV 12k, total 32k, ROI lot 36,36% [Source](https://www.genspark.ai/api/files/s/vbFgFjWr)
 * - RÉCAP: frais notaire 6k, sous-total acquisition 226k, marge brute 14k, PV avec travaux 320k, marge nette projet 26k [Source](https://www.genspark.ai/api/files/s/vI1thJLn)
 * - Acquisition globale: 200k + 3% = 6k -> 206k [Source](https://www.genspark.ai/api/files/s/ZKvSeBXO)
 * - Décision/KPI: Marge Nette Projet 26k + légende décision [Source](https://www.genspark.ai/api/files/s/HSErlS1e)
 */

const MargeCalcul = (function() {
  // -------------------------
  // Helpers
  // -------------------------
  function toNum(val) {
    if (val === '' || val === null || val === undefined) return 0;
    const n = parseFloat(String(val).replace(',', '.').replace(/\s/g, ''));
    return isNaN(n) ? 0 : n;
  }

  function round2(n) { return Math.round(toNum(n) * 100) / 100; }

  function clamp0(n) {
    n = toNum(n);
    return n < 0 ? 0 : n;
  }

  function pctToRate(pct) { return toNum(pct) / 100; } // UI: 15 => 0.15

  function formatEuro(n) {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(toNum(n) || 0);
  }

  function formatPct(n) {
    return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      .format(toNum(n) || 0) + ' %';
  }

  // -------------------------
  // Excel-like: Acquisition globale (Vue d'ensemble)
  // -------------------------
  function calcAcquisition(prixAchatTotal, fraisDivers) {
    const notairePct = pctToRate(fraisDivers?.notairePct ?? 3);
    const fraisGeo = clamp0(fraisDivers?.fraisGeo);
    const fraisDiag = clamp0(fraisDivers?.fraisDiag);
    const fraisArchiJuri = clamp0(fraisDivers?.fraisArchiJuri);

    const fraisNotaire = round2(prixAchatTotal * notairePct);
    const totalFraisDivers = round2(fraisNotaire + fraisGeo + fraisDiag + fraisArchiJuri);
    const coutTotalAcquisition = round2(prixAchatTotal + totalFraisDivers);

    return {
      prixAchatTotal: round2(prixAchatTotal),
      notairePct: round2(notairePct * 100),
      fraisNotaire,
      fraisGeo,
      fraisDiag,
      fraisArchiJuri,
      totalFraisDivers,
      coutTotalAcquisition,
    };
  }

  // -------------------------
  // Excel-like: Calcul par lot (onglet LOTS)
  // -------------------------
  function calcLot(lot) {
    const prixAchat = clamp0(lot?.prixAchat);
    const surface = clamp0(lot?.surface);
    const typeBien = (lot?.typeBien || 'Bâti').toString();

    // Inputs % (UI saisit 15 pour 15)
    const margeTravRate = pctToRate(lot?.margeCibleTravaux ?? 0);
    const margeBienRate = pctToRate(lot?.margeCibleBien ?? 0);

    // IMPORTANT: Com AI est un % appliqué sur PV IHP (montant calculé)
    const comAIRate = pctToRate(lot?.comAI ?? 0);

    // TVA terrain % (si applicable) — dans ton Excel lot 1 = 0%
    const tvaTerrainRate = pctToRate(lot?.tvaTerrainPct ?? 0);

    // TVA travaux % par lot (10/20). Si pas fourni par l'UI => 10 par défaut (comme sur ton exemple)
    const tvaTravauxRate = pctToRate(lot?.tvaTravauxPct ?? 10);

    const travauxHT = clamp0(lot?.travauxHT);

    // PRIX D'ACHAT
    const prixM2 = surface > 0 ? round2(prixAchat / surface) : 0;

    // PRIX DE VENTE
    const pvDuBien = round2(prixAchat);
    const margeBien = round2(pvDuBien * margeBienRate);
    const pvIHP = round2(pvDuBien + margeBien);

    // TRAVAUX
    const tvaTravaux = round2(travauxHT * tvaTravauxRate);
    const travauxTTC = round2(travauxHT + tvaTravaux);

    // MARGES IHP
    const margeTRV = round2(travauxHT * margeTravRate);
    const totalMargeIHP = round2(margeBien + margeTRV);

    // CALCUL POUR RENTA (bloc TVA/COM dans LOTS)
    const comAIMontant = round2(pvIHP * comAIRate);
    const tvaTerrainMontant = round2(pvIHP * tvaTerrainRate);

    const tvaCollectee = tvaTravaux;
    // Conformément à ton exemple Excel : TVA déductible = 20% de la marge bien (20k -> 4k) [Source](https://www.genspark.ai/api/files/s/vbFgFjWr)
    const tvaDeductible = round2(margeBien * 0.20);
    // Dans l'exemple : TVA à payer = TVA collectée + TVA déductible (8k + 4k = 12k)
    const tvaAPayer = round2(tvaCollectee + tvaDeductible);

    // ROI lot (dans ton LOTS): ROI = total marge / coûts totaux (TTC facture) [Source](https://www.genspark.ai/api/files/s/vbFgFjWr)
    const coutsTotauxRenta = travauxTTC;
    const roiLotPct = coutsTotauxRenta > 0 ? round2((totalMargeIHP / coutsTotauxRenta) * 100) : 0;

    return {
      // Inputs normalisés
      prixAchat,
      surface,
      typeBien,
      travauxHT,

      margeCibleTravaux: round2(margeTravRate * 100),
      margeCibleBien: round2(margeBienRate * 100),
      comAIPct: round2(comAIRate * 100),
      tvaTerrainPct: round2(tvaTerrainRate * 100),
      tvaTravauxPct: round2(tvaTravauxRate * 100),

      // Outputs lot (gris)
      prixM2,
      pvDuBien,
      margeBien,
      pvIHP,
      tvaTravaux,
      travauxTTC,
      margeTRV,
      totalMargeIHP,

      // Outputs complémentaires
      comAIMontant,
      tvaTerrainMontant,
      tvaCollectee,
      tvaDeductible,
      tvaAPayer,
      coutsTotauxRenta,
      roiLotPct,
    };
  }

  // -------------------------
  // Décision - Seuils mis à jour
  // -------------------------
  function getDecisionExcelV52(margeNetteProjet) {
    const m = toNum(margeNetteProjet);
    if (m < 10000) return { code: '🔴 NO GO', seuil: '< 10 000 €', classe: 'no-go' };
    if (m <= 25000) return { code: '🟠 RÉFLEXION', seuil: '10 000 € – 25 000 €', classe: 'reflexion' };
    return { code: '🟢 GO', seuil: '≥ 25 001 €', classe: 'go' };
  }

  // -------------------------
  // Excel-like: Récap total (Récapitulatif Synthèse Pro)
  // -------------------------
  function calcRecap(simulation) {
    const lotsCalc = (simulation?.lots || []).slice(0, 5).map(l => calcLot(l));
    if (lotsCalc.length === 0) return { lotsCalc, recap: null, frais: null };

    // Totaux lots
    const prixAchatTotal = round2(lotsCalc.reduce((s, l) => s + l.prixAchat, 0));
    const prixVenteTotal = round2(lotsCalc.reduce((s, l) => s + l.pvIHP, 0));

    // Acquisition globale
    const frais = calcAcquisition(prixAchatTotal, simulation?.fraisDivers || {});
    const fraisNotaireGlobal = frais.fraisNotaire;

    // RÉCAP (capture): Sous-total acquisition = prix de vente + frais notaire (ex: 220k + 6k = 226k) [Source](https://www.genspark.ai/api/files/s/vI1thJLn)
    const sousTotalAcquisition = round2(prixVenteTotal + fraisNotaireGlobal);

    // Honoraires agents immo (si utilisé) — dans ton exemple = 0
    const honorairesAgentsImmo = clamp0(simulation?.fraisDivers?.honorairesAI ?? simulation?.honorairesAgentsImmo ?? 0);

    // Rentabilité sans travaux (capture): 220k - 200k - 6k = 14k [Source](https://www.genspark.ai/api/files/s/vI1thJLn)
    const margeBruteTotalSansTravaux = round2(prixVenteTotal - prixAchatTotal - fraisNotaireGlobal);
    const margeNetteSansTravaux = round2(margeBruteTotalSansTravaux - honorairesAgentsImmo);

    // Travaux
    const travauxHTTotal = round2(lotsCalc.reduce((s, l) => s + l.travauxHT, 0));
    const tvaTravauxTotal = round2(lotsCalc.reduce((s, l) => s + l.tvaTravaux, 0));

    // Commission IHP sur travaux = somme margeTRV (capture: 12k) [Source](https://www.genspark.ai/api/files/s/vI1thJLn)
    const commissionIHPTravaux = round2(lotsCalc.reduce((s, l) => s + l.margeTRV, 0));

    // Sous-total travaux TTC + marge IHP (capture: 80k + 8k + 12k = 100k) [Source](https://www.genspark.ai/api/files/s/vI1thJLn)
    const sousTotalTravauxTTCPlusMargeIHP = round2(travauxHTTotal + tvaTravauxTotal + commissionIHPTravaux);

    // Com AI total (montant calculé = PV_IHP * %)
    const comAITotal = round2(lotsCalc.reduce((s, l) => s + l.comAIMontant, 0));

    // Prix de vente avec travaux et com (capture: 320k) [Source](https://www.genspark.ai/api/files/s/vI1thJLn)
    const prixVenteAvecTravauxEtCom = round2(
      prixVenteTotal + travauxHTTotal + tvaTravauxTotal + commissionIHPTravaux + comAITotal
    );

    // Structure des marges
    const commissionIHPBien = round2(lotsCalc.reduce((s, l) => s + l.margeBien, 0));
    const totalCommissionIHP = round2(commissionIHPBien + commissionIHPTravaux);

    // TVA sur marge (20%) → marges nettes nettes (capture: 12k -> 10k, 20k -> 16k, total 26k) [Source](https://www.genspark.ai/api/files/s/HSErlS1e)
    const tvaSurMargeTravaux = round2(commissionIHPTravaux * 0.20);
    const margeNetteNetteTRV = round2(commissionIHPTravaux - tvaSurMargeTravaux);

    const tvaSurMargeBien = round2(commissionIHPBien * 0.20);
    const margeNetteNetteBien = round2(commissionIHPBien - tvaSurMargeBien);

    const margeNetteProjet = round2(margeNetteNetteTRV + margeNetteNetteBien); // 26k sur ton exemple [Source](https://www.genspark.ai/api/files/s/HSErlS1e)

    // ROI Projet Total : ton Excel affiche 11,43% dans la capture [Source](https://www.genspark.ai/api/files/s/HSErlS1e)
    // Pour être EXACT à 11,43%, il faut la formule Excel exacte de sa base.
    // Ici on met une base cohérente par défaut : coût total acquisition + honoraires.
    const investissementTotalPourROI = round2(frais.coutTotalAcquisition + honorairesAgentsImmo);
    const ROIProjetTotal = investissementTotalPourROI > 0 ? round2((margeNetteProjet / investissementTotalPourROI) * 100) : 0;

    const decision = getDecisionExcelV52(margeNetteProjet);

    const recap = {
      // Acquisition / projet
      prixAchatTotal,
      prixVenteTotal,
      fraisNotaireGlobal,
      sousTotalAcquisition,

      // Honoraires
      honorairesAgentsImmo: honorairesAgentsImmo,

      // Rentabilité sans travaux
      margeBruteTotalSansTravaux,
      margeNetteSansTravaux,

      // Travaux
      travauxHTTotal,
      tvaTravauxTotal,
      sousTotalTravauxTTCPlusMargeIHP,

      // Transaction avec travaux (et com)
      comAITotal,
      prixVenteAvecTravauxEtCom,

      // Structure marges
      commissionIHPBien,
      commissionIHPTravaux,
      totalCommissionIHP,

      // TVA sur marge
      tvaSurMargeTravaux,
      margeNetteNetteTRV,
      tvaSurMargeBien,
      margeNetteNetteBien,

      // Total projet
      margeNetteProjet,

      // KPI
      investissementTotalPourROI,
      ROIProjetTotal,

      // Décision
      decision,
    };

    return { lotsCalc, recap, frais };
  }

  // -------------------------
  // DOM helpers
  // -------------------------
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

  // -------------------------
  // Compute + sync
  // -------------------------
  function compute(simulation) {
    return calcRecap(simulation);
  }

  function recalc(simulation) {
    if (!simulation) return;
    syncSimulationFromDOM(simulation);
    return compute(simulation);
  }

  function syncSimulationFromDOM(simulation) {
    const nb = simulation.meta?.nbLots || simulation.lots?.length || 1;
    simulation.lots = simulation.lots || [];

    for (let i = 0; i < nb; i++) {
      const n = i + 1;
      simulation.lots[i] = simulation.lots[i] || {};

      simulation.lots[i].prixAchat = getNumber('lot' + n + '_prixAchat');
      simulation.lots[i].surface = getNumber('lot' + n + '_surface');

      const typeEl = document.getElementById('lot' + n + '_typeBien');
      simulation.lots[i].typeBien = typeEl ? typeEl.value : 'Bâti';

      simulation.lots[i].margeCibleTravaux = getNumber('lot' + n + '_margeTrav') || 15;
      simulation.lots[i].margeCibleBien = getNumber('lot' + n + '_margeBien') || 10;

      // Com AI: % (ex 6 => 6%)
      simulation.lots[i].comAI = getNumber('lot' + n + '_comAI');

      // TVA terrain: % (si tu as un champ; sinon 0)
      // Si ton HTML a déjà un champ, tu peux le nommer lot{n}_tvaTerrainPct, sinon ça reste 0.
      simulation.lots[i].tvaTerrainPct = getNumber('lot' + n + '_tvaTerrainPct') || 0;

      // TVA travaux: % par lot (10/20). Si le champ n'existe pas => 10
      simulation.lots[i].tvaTravauxPct = getNumber('lot' + n + '_tvaTravauxPct') || 10;

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
    // helpers
    toNum,
    round2,
    formatEuro,
    formatPct,

    // core
    calcAcquisition,
    calcLot,
    calcRecap,
    compute,

    // dom helpers
    getNumber,
    setMoney,
    setPercent,
    setNumber,

    // sync/recalc
    recalc,
    syncSimulationFromDOM,

    // decision exposed (Excel V5.2)
    getDecisionExcelV52,
  };
})();
