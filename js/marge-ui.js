/**
 * UI - Rendu DOM + bindings - Simulateur de marge IDEAL
 */

const MargeUI = (function() {
  const C = MargeCalcul;
  const Y = 'marge-input-yellow';
  const G = 'marge-input-gray';

  function inputYellow(attrs) {
    const a = Object.assign({ type: 'number', step: '0.01', min: '0', class: Y }, attrs);
    return '<input ' + Object.entries(a).map(([k, v]) => k + '="' + (v || '') + '"').join(' ') + '>';
  }

  function inputGray(val) {
    return '<input type="text" class="' + G + '" readonly value="' + (val || '') + '">';
  }

  function selectYellow(options, value, attrs) {
    const a = (attrs || {});
    const att = Object.entries(a).map(([k, v]) => k + '="' + (v || '') + '"').join(' ');
    const opts = options.map(o => '<option value="' + o.v + '"' + (o.v == value ? ' selected' : '') + '>' + o.l + '</option>').join('');
    return '<select class="' + Y + '" ' + att + '>' + opts + '</select>';
  }

  function renderLotTab(simulation, nbLots, onInput) {
    const lots = simulation.lots || [];
    let html = '<div id="margeDecisionBoxLots" class="decision-box-lots"></div>';
    for (let i = 0; i < nbLots; i++) {
      const n = i + 1;
      const lot = lots[i] || {};
      html += '<div class="marge-lot-block" data-lot="' + i + '">';
      html += '<h4>Lot ' + n + '</h4>';
      html += '<div class="marge-section"><strong>A) DESCRIPTIFS</strong>';
      html += '<div class="marge-row"><label>Prix achat :</label>' + inputYellow({ id: 'lot' + n + '_prixAchat', 'data-lot': i, 'data-f': 'prixAchat', value: lot.prixAchat }) + '</div>';
      html += '<div class="marge-row"><label>Surface (m²):</label>' + inputYellow({ id: 'lot' + n + '_surface', 'data-lot': i, 'data-f': 'surface', value: lot.surface }) + '</div>';
      html += '<div class="marge-row"><label>Prix m²</label><input type="text" class="' + G + '" id="lot' + n + '_prixM2" readonly></div>';
      html += '<div class="marge-row"><label>Type bien</label>' + selectYellow([{ v: 'Bâti', l: 'Bâti' }, { v: 'Terrain', l: 'Terrain' }], lot.typeBien || 'Bâti', { id: 'lot' + n + '_typeBien', 'data-lot': i, 'data-f': 'typeBien' }) + '</div>';
      html += '</div>';
      html += '<div class="marge-section"><strong>B) PARAMÈTRES</strong>';
      html += '<div class="marge-row"><label>Marge cible sur travaux (%):</label>' + inputYellow({ id: 'lot' + n + '_margeTrav', 'data-lot': i, 'data-f': 'margeCibleTravaux', value: lot.margeCibleTravaux ?? 15 }) + '</div>';
      html += '<div class="marge-row"><label>Marge cible sur bien (%):</label>' + inputYellow({ id: 'lot' + n + '_margeBien', 'data-lot': i, 'data-f': 'margeCibleBien', value: lot.margeCibleBien ?? 10 }) + '</div>';
      html += '<div class="marge-row"><label>Com AI</label>' + inputYellow({ id: 'lot' + n + '_comAI', 'data-lot': i, 'data-f': 'comAI', value: lot.comAI ?? 0 }) + '</div>';
      html += '<div class="marge-row"><label>TVA terrain</label><input type="text" class="' + G + '" id="lot' + n + '_tvaTerrain" readonly></div>';
      html += '</div>';
      html += '<div class="marge-section"><strong>C) PRIX DE VENTE</strong>';
      html += '<div class="marge-row"><label>PV du bien</label><input type="text" class="' + G + '" id="lot' + n + '_pvDuBien" readonly></div>';
      html += '<div class="marge-row"><label>Marge</label><input type="text" class="' + G + '" id="lot' + n + '_marge" readonly></div>';
      html += '<div class="marge-row"><label>PV IHP</label><input type="text" class="' + G + '" id="lot' + n + '_pvIHP" readonly></div>';
      html += '</div>';
      html += '<div class="marge-section"><strong>D) TRAVAUX</strong>';
      html += '<div class="marge-row"><label>Montant travaux facturés HT:</label>' + inputYellow({ id: 'lot' + n + '_travauxHT', 'data-lot': i, 'data-f': 'travauxHT', value: lot.travauxHT }) + '</div>';
      html += '<div class="marge-row"><label>TVA sur travaux</label><input type="text" class="' + G + '" id="lot' + n + '_tvaTravaux" readonly></div>';
      html += '<div class="marge-row"><label>Montant TTC: Facture client</label><input type="text" class="' + G + '" id="lot' + n + '_travauxTTC" readonly></div>';
      html += '</div>';
      html += '<div class="marge-section"><strong>E) MARGES IHP</strong>';
      html += '<div class="marge-row"><label>marge net</label><input type="text" class="' + G + '" id="lot' + n + '_margeNet" readonly></div>';
      html += '<div class="marge-row"><label>Marge TRV</label><input type="text" class="' + G + '" id="lot' + n + '_margeTRV" readonly></div>';
      html += '<div class="marge-row"><label>total</label><input type="text" class="' + G + '" id="lot' + n + '_totalMargeIHP" readonly></div>';
      html += '</div></div>';
    }
    const fd = simulation.fraisDivers || {};
    html += '<div class="marge-section marge-frais-divers"><strong>F) FRAIS DIVERS (PROJET)</strong>';
    html += '<div class="marge-row"><label>Prix d\'achat total (somme des lots)</label><input type="text" class="' + G + '" id="prix_achat_total" readonly></div>';
    html += '<div class="marge-row"><label>Taux notaire (%)</label>' + inputYellow({ id: 'notaire_pct', 'data-fd': 'notairePct', value: fd.notairePct ?? 3 }) + '</div>';
    html += '<div class="marge-row"><label>Frais de notaire (€)</label><input type="text" class="' + G + '" id="frais_notaire" readonly></div>';
    html += '<div class="marge-row"><label>Frais géomètre-expert (€)</label>' + inputYellow({ id: 'frais_geo', 'data-fd': 'fraisGeo', value: fd.fraisGeo }) + '</div>';
    html += '<div class="marge-row"><label>Diagnostics immobiliers (€)</label>' + inputYellow({ id: 'frais_diag', 'data-fd': 'fraisDiag', value: fd.fraisDiag }) + '</div>';
    html += '<div class="marge-row"><label>Frais architecte / juridique (€)</label>' + inputYellow({ id: 'frais_archi', 'data-fd': 'fraisArchiJuri', value: fd.fraisArchiJuri }) + '</div>';
    html += '<div class="marge-row"><label>Honoraires agents immobilier (€)</label>' + inputYellow({ id: 'honoraires_ai', 'data-fd': 'honorairesAI', value: fd.honorairesAI ?? simulation.honorairesAgentsImmo ?? 0 }) + '</div>';
    html += '<div class="marge-row"><label>Total frais divers (€)</label><input type="text" class="' + G + '" id="total_frais_divers" readonly></div>';
    html += '<div class="marge-row"><label>Coût total acquisition (€)</label><input type="text" class="' + G + '" id="cout_total_acquisition" readonly></div>';
    html += '</div>';
    return html;
  }

  function recapCols(nbLots) {
    const n = nbLots || 1;
    if (n <= 1) return 'marge-recap-cols2';
    return 'marge-recap-cols' + (n + 2);
  }

  function recapRow2(libelle, totalVal, nb, lotVals, negClass) {
    const nc = negClass || '';
    if (nb <= 1) return '<div class="marge-recap-row"><span>' + libelle + '</span><span class="marge-total' + nc + '">' + totalVal + '</span></div>';
    const lv = (lotVals || []).map(v => '<span>' + (v || '-') + '</span>').join('');
    return '<div class="marge-recap-row"><span>' + libelle + '</span>' + lv + '<span class="marge-total' + nc + '">' + totalVal + '</span></div>';
  }

  function renderRecapTab(result, nbLots, honorairesAgentsImmo, onHonorairesInput) {
    const { lotsCalc, recap, frais } = result || {};
    if (!recap || !frais) return '<p>Aucune donnée.</p>';
    const fmt = (n, pct) => pct ? C.formatPct(n) : C.formatEuro(n);
    const neg = (n) => n < 0 ? ' marge-neg' : '';
    const nb = nbLots || (lotsCalc ? lotsCalc.length : 1);
    const colsClass = recapCols(nb);
    const emptySpan = (n) => '<span></span>'.repeat(Math.max(0, n - 1));
    let html = '<h2>RÉCAPITULATIF SYNTHÈSE - PROJET MARCHAND DE BIENS</h2>';
    html += '<div class="marge-recap-block ' + colsClass + '"><strong>PROJET ACQUISITION</strong>';
    if (nb <= 1) {
      html += '<div class="marge-recap-row"><span>Type de bien</span><span class="marge-total">' + ((lotsCalc && lotsCalc[0]) ? (lotsCalc[0].typeBien || '-') : '-') + '</span></div>';
    } else {
      html += '<div class="marge-recap-row"><span>Type de bien</span>' + (lotsCalc || []).map((l) => '<span>' + (l.typeBien || '-') + '</span>').join('') + '<span class="marge-total">-</span></div>';
    }
    html += nb <= 1 ? '<div class="marge-recap-row"><span>Prix achat</span><span class="marge-total">' + fmt(frais.prixAchatTotal) + '</span></div>' : '<div class="marge-recap-row"><span>Prix achat</span>' + (lotsCalc || []).map(l => '<span>' + fmt(l.prixAchat) + '</span>').join('') + '<span class="marge-total">' + fmt(frais.prixAchatTotal) + '</span></div>';
    html += nb <= 1 ? '<div class="marge-recap-row"><span>Prix de vente</span><span class="marge-total">' + fmt(recap.prixVenteTotal) + '</span></div>' : '<div class="marge-recap-row"><span>Prix de vente</span>' + (lotsCalc || []).map(l => '<span>' + fmt(l.pvIHP) + '</span>').join('') + '<span class="marge-total">' + fmt(recap.prixVenteTotal) + '</span></div>';
    html += nb <= 1 ? '<div class="marge-recap-row"><span>Prix au m2</span><span class="marge-total">' + ((lotsCalc && lotsCalc[0]) ? fmt(lotsCalc[0].prixM2) : '-') + '</span></div>' : '<div class="marge-recap-row"><span>Prix au m2</span>' + (lotsCalc || []).map(l => '<span>' + fmt(l.prixM2) + '</span>').join('') + '<span class="marge-total">-</span></div>';
    html += nb <= 1 ? '<div class="marge-recap-row"><span>Frais de notaire géo (global)</span><span class="marge-total">' + fmt(frais.totalFraisDivers) + '</span></div>' : '<div class="marge-recap-row"><span>Frais de notaire géo (global)</span>' + emptySpan(nb) + '<span class="marge-total">' + fmt(frais.totalFraisDivers) + '</span></div>';
    html += nb <= 1 ? '<div class="marge-recap-row"><span>Sous-total acquisition</span><span class="marge-total">' + fmt(recap.sousTotalAcquisition) + '</span></div>' : '<div class="marge-recap-row"><span>Sous-total acquisition</span>' + emptySpan(nb) + '<span class="marge-total">' + fmt(recap.sousTotalAcquisition) + '</span></div>';
    html += '</div>';
    html += '<div class="marge-recap-block ' + colsClass + '"><strong>HONORAIRES ET TVA TERRAIN</strong>';
    html += recapRow2('Honoraires agents immobilier', C.formatEuro(honorairesAgentsImmo || 0), nb, [], '');
    html += recapRow2('TVA Terrain (si applicable)', (lotsCalc && lotsCalc[0] && lotsCalc[0].tvaTerrainPct) ? fmt(lotsCalc[0].tvaTerrainPct, true) : '-', nb, (lotsCalc || []).map(l => l.tvaTerrainPct ? fmt(l.tvaTerrainPct, true) : '-'), '');
    html += '</div>';
    html += '<div class="marge-recap-block ' + colsClass + '"><strong>RENTABILITE SANS TRAVAUX</strong>';
    html += recapRow2('MONTANT', fmt(recap.prixVenteTotal), nb, [], '');
    html += recapRow2('MARGE BRUTE TOTAL', fmt(recap.margeBruteTotalSansTravaux), nb, [], neg(recap.margeBruteTotalSansTravaux));
    html += recapRow2('MARGE NETTE', fmt(recap.margeNetteSansTravaux), nb, [], neg(recap.margeNetteSansTravaux));
    html += '</div>';
    html += '<div class="marge-recap-block ' + colsClass + '"><strong>🔨 TRAVAUX FACTURE CLIENT PAR PRESTA</strong>';
    html += recapRow2('Travaux (HT)', fmt(recap.travauxHTTotal), nb, (lotsCalc || []).map(l => fmt(l.travauxHT)), '');
    html += recapRow2('TVA sur travaux (10% SI renov ancien)', fmt(recap.tvaTravauxTotal), nb, (lotsCalc || []).map(l => fmt(l.tvaTravaux)), '');
    html += recapRow2('Sous-total travaux TTC + MARGE IHP', fmt(recap.sousTotalTravauxTTCPlusMargeIHP), nb, (lotsCalc || []).map(l => fmt(l.travauxTTC + l.margeTRV)), '');
    html += recapRow2('Prix au m2', fmt(recap.prixM2Moyen), nb, [], '');
    html += '</div>';
    html += '<div class="marge-recap-block ' + colsClass + '"><strong>TRANSACTION AVEC TRAVAUX (et com)</strong>';
    html += recapRow2('💵 Prix de vente avec travaux et com', fmt(recap.prixVenteAvecTravauxEtCom), nb, [], '');
    html += '</div>';
    html += '<div class="marge-recap-block ' + colsClass + '"><strong>MARGES TRAVAUX</strong>';
    html += recapRow2('Commission IHP sur travaux', fmt(recap.commissionIHPTravaux), nb, [], '');
    html += '</div>';
    html += '<div class="marge-recap-block ' + colsClass + '"><strong>🔷 STRUCTURE DES MARGES SUR PROJET TOTAL</strong>';
    html += recapRow2('Commission IHP sur bien', fmt(recap.commissionIHPBien), nb, [], '');
    html += recapRow2('Commission IHP sur travaux', fmt(recap.commissionIHPTravaux), nb, [], '');
    html += recapRow2('TOTAL', fmt(recap.totalCommissionIHP), nb, [], '');
    html += '</div>';
    html += '<div class="marge-recap-block ' + colsClass + '"><strong>CALCUL TVA SUR MARGE (COM et TRV)</strong>';
    html += recapRow2('Marge HT sur travaux (= com incluses)', fmt(recap.commissionIHPTravaux), nb, [], '');
    html += recapRow2('TVA à payer sur marge travaux (20%)', fmt(recap.tvaSurMargeTravaux), nb, [], '');
    html += recapRow2('Marge nette NETTE sur TRV', fmt(recap.margeNetteNetteTRV), nb, [], neg(recap.margeNetteNetteTRV));
    html += recapRow2('Marge nette sur nette (après TVA)', '-', nb, [], '');
    html += recapRow2('TVA à payer sur marge bien (20%)', fmt(recap.tvaSurMargeBien), nb, [], '');
    html += recapRow2('Marge nette NETTE sur bien', fmt(recap.margeNetteNetteBien), nb, [], neg(recap.margeNetteNetteBien));
    html += '</div>';
    html += '<div class="marge-recap-block ' + colsClass + '"><strong>CALCUL NETTE NETTE (APRES TVA SUR MARGE)</strong>';
    html += recapRow2('Marge nette NETTE sur TRV', fmt(recap.margeNetteNetteTRV), nb, [], '');
    html += recapRow2('Marge nette NETTE sur bien', fmt(recap.margeNetteNetteBien), nb, [], '');
    html += recapRow2('TOTAL MARGE NETTE APRES TVA SUR MARGE', fmt(recap.totalMargeNetteApresTVASurMarge), nb, [], neg(recap.totalMargeNetteApresTVASurMarge));
    html += '</div>';
    html += '<div class="marge-recap-block ' + colsClass + '"><strong>🔷 7. INDICATEURS DE PERFORMANCE</strong>';
    html += recapRow2('RENTABILITÉ PAR LOT CA', '-', nb, [], '');
    html += recapRow2('ROI en %', fmt(recap.ROIProjetTotal, true), nb, [], '');
    html += recapRow2('performance X 2 X3 X 4', '-', nb, [], '');
    html += '</div>';
    const d = recap.decision || {};
    html += '<div class="marge-decision-zone">';
    html += '<div class="marge-decision-box ' + (d.classe || '') + '">' + (d.code || '') + '</div>';
    html += '<div class="marge-kpi-row"><span>💰 Marge Nette Projet</span><span>' + fmt(recap.margeNetteProjet) + '</span></div>';
    html += '<div class="marge-kpi-row"><span>📈 ROI Projet Total</span><span>' + fmt(recap.ROIProjetTotal, true) + '</span></div>';
    html += '<div class="marge-kpi-row"><span>📊 Ratio Marge/CA</span><span>' + fmt(recap.ratioMargeCA, true) + '</span></div>';
    html += '<div class="marge-criteres">🔴 NO GO &lt; 10 000 €<br>🟠 RÉFLEXION 10 000 € – 30 000 €<br>🟢 GO &gt; 30 000 €</div>';
    html += '</div>';
    return html;
  }

  function updateLotOutputs(lotsCalc) {
    (lotsCalc || []).forEach((l, i) => {
      const n = i + 1;
      setVal('lot' + n + '_prixM2', l.surface > 0 ? C.formatEuro(l.prixM2) : '');
      setVal('lot' + n + '_tvaTerrain', l.tvaTerrainPct ? C.formatPct(l.tvaTerrainPct) : '-');
      setVal('lot' + n + '_pvDuBien', C.formatEuro(l.pvDuBien));
      setVal('lot' + n + '_marge', C.formatEuro(l.margeBien));
      setVal('lot' + n + '_pvIHP', C.formatEuro(l.pvIHP));
      setVal('lot' + n + '_tvaTravaux', C.formatEuro(l.tvaTravaux));
      setVal('lot' + n + '_travauxTTC', C.formatEuro(l.travauxTTC));
      setVal('lot' + n + '_margeNet', C.formatEuro(l.margeBien));
      setVal('lot' + n + '_margeTRV', C.formatEuro(l.margeTRV));
      setVal('lot' + n + '_totalMargeIHP', C.formatEuro(l.totalMargeIHP));
    });
  }

  function setVal(id, val) {
    const el = document.getElementById(id);
    if (el) el.value = val || '';
  }

  function updateFraisOutputs(frais) {
    if (!frais) return;
    setVal('prix_achat_total', C.formatEuro(frais.prixAchatTotal));
    setVal('frais_notaire', C.formatEuro(frais.fraisNotaire));
    setVal('total_frais_divers', C.formatEuro(frais.totalFraisDivers));
    setVal('cout_total_acquisition', C.formatEuro(frais.coutTotalAcquisition));
  }

  function bindLotInputs(container, simulation, onChange) {
    container.querySelectorAll('.marge-lot-block input.' + Y + ', .marge-lot-block select.' + Y).forEach(inp => {
      inp.addEventListener('input', onChange);
      inp.addEventListener('change', onChange);
    });
  }

  function bindFraisInputs(container, simulation, onChange) {
    container.querySelectorAll('input[data-fd], select[data-fd]').forEach(inp => {
      inp.addEventListener('input', onChange);
      inp.addEventListener('change', onChange);
    });
  }

  function updateDecisionBoxLots(result) {
    const el = document.getElementById('margeDecisionBoxLots');
    if (!el || !result || !result.recap) return;
    const r = result.recap;
    const d = r.decision || {};
    const fmt = (n, pct) => pct ? C.formatPct(n) : C.formatEuro(n);
    el.innerHTML = '<div class="decision-box"><div class="decision-box-header">🚦 DÉCISION</div>' +
      '<div class="decision-box-kpis"><div class="decision-kpi"><span class="label">💰 Marge Nette Projet</span><span class="value">' + fmt(r.margeNetteProjet) + '</span></div>' +
      '<div class="decision-kpi"><span class="label">📈 ROI Projet Total</span><span class="value">' + fmt(r.ROIProjetTotal, true) + '</span></div>' +
      '<span class="decision-badge ' + (d.classe || '') + '">' + (d.code || '') + '</span></div>' +
      '<div class="decision-criteres">🔴 NO GO &lt; 10 000 €<br>🟠 RÉFLEXION 10 000 € – 30 000 €<br>🟢 GO &gt; 30 000 €</div></div>';
  }

  return {
    renderLotTab,
    renderRecapTab,
    updateLotOutputs,
    updateFraisOutputs,
    updateDecisionBoxLots,
    bindLotInputs,
    bindFraisInputs,
  };
})();
