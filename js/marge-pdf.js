/**
 * Export PDF - Simulateur de marge IDEAL
 * html2pdf.js — STRICTEMENT 1 PAGE A4
 */

const MargePDF = (function() {
  function fE(n) {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n || 0);
  }
  function fP(n) {
    return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0) + '%';
  }

  function badgeCss(cls) {
    if (cls === 'no-go') return 'background:#fecaca;color:#991b1b;border:2px solid #dc2626;';
    if (cls === 'reflexion' || cls === 'reflexion2' || cls === 'orange') return 'background:#fef3c7;color:#92400e;border:2px solid #d97706;';
    if (cls === 'go') return 'background:#bbf7d0;color:#166534;border:2px solid #16a34a;';
    return 'background:#f3f4f6;color:#374151;border:1px solid #d1d5db;';
  }

  function exportPdf(simulation) {
    if (typeof html2pdf === 'undefined') { console.error('html2pdf non chargé'); return false; }

    var meta = simulation.meta || {};
    var recap = simulation.recap || {};
    var lots = simulation.lotsCalc || [];
    var frais = simulation.frais || {};
    var nom = meta.nom || 'Sans nom';
    var ville = meta.ville || '';
    var auteur = meta.auteur || '';
    var nbLots = meta.nbLots || 1;
    var dateStr = meta.timestamp ? new Date(meta.timestamp).toLocaleDateString('fr-FR') : new Date().toLocaleDateString('fr-FR');
    var d = recap.decision || {};

    // ── CSS ultra-compact pour tenir sur 1 page A4 ──
    var s = '<style>' +
      '*{margin:0;padding:0;box-sizing:border-box}' +
      '.p{font-family:Helvetica,Arial,sans-serif;color:#1e293b;padding:14px 18px;font-size:8.5px;line-height:1.35;background:#fff}' +

      // Header
      '.hd{display:flex;justify-content:space-between;align-items:center;padding-bottom:8px;margin-bottom:8px;border-bottom:2.5px solid #6D071A}' +
      '.br{font-size:16px;font-weight:800;color:#6D071A}' +
      '.pn{font-size:12px;font-weight:600;color:#334155;margin-top:2px}' +
      '.mt{text-align:right;font-size:8px;color:#64748b;line-height:1.5}' +
      '.mt b{color:#1e293b}' +

      // Badge centré
      '.bd{text-align:center;margin:10px 0}' +
      '.bg{display:inline-block;padding:10px 40px;border-radius:10px;font-size:20px;font-weight:800;letter-spacing:1px}' +

      // KPIs en ligne
      '.ks{display:flex;gap:6px;margin-bottom:8px}' +
      '.ki{flex:1;background:#f8fafc;border:1px solid #e2e8f0;border-radius:5px;padding:5px 8px}' +
      '.kl{font-size:7px;color:#64748b;font-weight:700;text-transform:uppercase;letter-spacing:.3px}' +
      '.kv{font-size:12px;font-weight:700;color:#1e293b}' +

      // Titres sections
      '.st{font-size:9px;font-weight:700;color:#6D071A;margin:8px 0 3px;padding-bottom:2px;border-bottom:1px solid #e5e7eb;text-transform:uppercase;letter-spacing:.3px}' +

      // Tables
      'table{width:100%;border-collapse:collapse;margin-bottom:6px;font-size:8px}' +
      'th{padding:3px 6px;text-align:left;font-weight:700;font-size:7.5px;text-transform:uppercase;letter-spacing:.3px}' +
      'td{padding:3px 6px;border-bottom:1px solid #f1f5f9}' +
      'tr:nth-child(even) td{background:#fafbfc}' +
      '.th1 th{background:#6D071A;color:#fff}' +
      '.th2 th{background:#f1f5f9;color:#374151;border-bottom:1.5px solid #e2e8f0}' +
      '.tt td{font-weight:700;border-top:1.5px solid #6D071A;background:#fff8f8}' +

      // 2 colonnes
      '.cols{display:flex;gap:12px}' +
      '.col{flex:1}' +

      // Footer seuils
      '.sf{font-size:7px;color:#94a3b8;text-align:center;margin-top:6px;padding-top:5px;border-top:1px solid #e5e7eb}' +
    '</style>';

    // ── HTML compact ──
    var h = '<div id="pdf" class="p">';

    // HEADER
    h += '<div class="hd"><div><div class="br">IDEAL — Rentabilité</div><div class="pn">' + nom + (ville ? ' — ' + ville : '') + '</div></div>';
    h += '<div class="mt"><b>Date :</b> ' + dateStr + ' · <b>Auteur :</b> ' + (auteur || '-') + ' · <b>Lots :</b> ' + nbLots + '</div></div>';

    // BADGE
    h += '<div class="bd"><div class="bg" style="' + badgeCss(d.classe) + '">' + (d.code || '-') + '</div></div>';

    // KPIs
    h += '<div class="ks">';
    h += '<div class="ki"><div class="kl">Marge Nette Projet</div><div class="kv">' + fE(recap.margeNetteProjet) + '</div></div>';
    h += '<div class="ki"><div class="kl">ROI Projet</div><div class="kv">' + fP(recap.ROIProjetTotal) + '</div></div>';
    h += '<div class="ki"><div class="kl">Investissement</div><div class="kv">' + fE(recap.investissementTotalPourROI) + '</div></div>';
    h += '<div class="ki"><div class="kl">PV + Travaux</div><div class="kv">' + fE(recap.prixVenteAvecTravauxEtCom) + '</div></div>';
    h += '</div>';

    // 2 COLONNES
    h += '<div class="cols">';

    // Col gauche : Lots + Frais
    h += '<div class="col">';
    h += '<div class="st">Détail des lots</div>';
    h += '<table><tr class="th1"><th>Lot</th><th>Achat</th><th>m²</th><th>Trav. HT</th><th>PV IHP</th><th>Marge</th></tr>';
    lots.forEach(function(l, i) {
      h += '<tr><td>' + (i+1) + '</td><td>' + fE(l.prixAchat) + '</td><td>' + (l.surface||0) + '</td><td>' + fE(l.travauxHT) + '</td><td>' + fE(l.pvIHP) + '</td><td>' + fE((l.margeBien||0)+(l.margeTRV||0)) + '</td></tr>';
    });
    if (nbLots > 1) {
      var tA = lots.reduce(function(s,l){return s+(l.prixAchat||0)},0);
      var tT = lots.reduce(function(s,l){return s+(l.travauxHT||0)},0);
      var tP = lots.reduce(function(s,l){return s+(l.pvIHP||0)},0);
      var tM = lots.reduce(function(s,l){return s+(l.margeBien||0)+(l.margeTRV||0)},0);
      h += '<tr class="tt"><td>Total</td><td>'+fE(tA)+'</td><td>-</td><td>'+fE(tT)+'</td><td>'+fE(tP)+'</td><td>'+fE(tM)+'</td></tr>';
    }
    h += '</table>';

    h += '<div class="st">Frais divers</div>';
    h += '<table><tr class="th2"><th>Poste</th><th>Montant</th></tr>';
    h += '<tr><td>Prix achat total</td><td>'+fE(frais.prixAchatTotal)+'</td></tr>';
    h += '<tr><td>Frais notaire</td><td>'+fE(frais.fraisNotaire)+'</td></tr>';
    h += '<tr><td>Total frais divers</td><td>'+fE(frais.totalFraisDivers)+'</td></tr>';
    h += '<tr class="tt"><td>Coût total acquisition</td><td>'+fE(frais.coutTotalAcquisition)+'</td></tr>';
    h += '</table>';

    h += '<div class="st">Rentabilité sans travaux</div>';
    h += '<table><tr class="th2"><th>Poste</th><th>Montant</th></tr>';
    h += '<tr><td>Marge brute</td><td>'+fE(recap.margeBruteTotalSansTravaux)+'</td></tr>';
    h += '<tr><td>Marge nette</td><td>'+fE(recap.margeNetteSansTravaux)+'</td></tr>';
    h += '</table>';
    h += '</div>';

    // Col droite : Marges + TVA
    h += '<div class="col">';
    h += '<div class="st">Structure des marges</div>';
    h += '<table><tr class="th2"><th>Poste</th><th>Montant</th></tr>';
    h += '<tr><td>Commission IHP bien</td><td>'+fE(recap.commissionIHPBien)+'</td></tr>';
    h += '<tr><td>Commission IHP travaux</td><td>'+fE(recap.commissionIHPTravaux)+'</td></tr>';
    h += '<tr class="tt"><td>Total commissions</td><td>'+fE(recap.totalCommissionIHP)+'</td></tr>';
    h += '</table>';

    h += '<div class="st">TVA sur marge</div>';
    h += '<table><tr class="th2"><th>Poste</th><th>Montant</th></tr>';
    h += '<tr><td>TVA marge travaux (20%)</td><td>'+fE(recap.tvaSurMargeTravaux)+'</td></tr>';
    h += '<tr><td>Marge nette nette TRV</td><td>'+fE(recap.margeNetteNetteTRV)+'</td></tr>';
    h += '<tr><td>TVA marge bien (20%)</td><td>'+fE(recap.tvaSurMargeBien)+'</td></tr>';
    h += '<tr><td>Marge nette nette bien</td><td>'+fE(recap.margeNetteNetteBien)+'</td></tr>';
    h += '<tr class="tt"><td>Total marge nette après TVA</td><td>'+fE(recap.totalMargeNetteApresTVASurMarge)+'</td></tr>';
    h += '</table>';

    h += '<div class="st">Transaction avec travaux</div>';
    h += '<table><tr class="th2"><th>Poste</th><th>Montant</th></tr>';
    h += '<tr><td>PV total (lots)</td><td>'+fE(recap.prixVenteTotal)+'</td></tr>';
    h += '<tr><td>Travaux HT total</td><td>'+fE(recap.travauxHTTotal)+'</td></tr>';
    h += '<tr><td>TVA travaux total</td><td>'+fE(recap.tvaTravauxTotal)+'</td></tr>';
    h += '<tr><td>Sous-total TTC + marge IHP</td><td>'+fE(recap.sousTotalTravauxTTCPlusMargeIHP)+'</td></tr>';
    h += '<tr class="tt"><td>PV avec travaux et com</td><td>'+fE(recap.prixVenteAvecTravauxEtCom)+'</td></tr>';
    h += '</table>';
    h += '</div>';

    h += '</div>'; // fin cols

    // Seuils
    h += '<div class="sf">🔴 NO GO &lt; 10 000 €  ·  🟠 RÉFLEXION 10 000 € – 25 000 €  ·  🟢 GO ≥ 25 001 €</div>';
    h += '</div>';

    // ── Rendu PDF ──
    var wrap = document.createElement('div');
    wrap.style.cssText = 'position:fixed;left:-9999px;top:0;z-index:-100;width:210mm;background:#fff;';
    wrap.innerHTML = s + h;
    document.body.appendChild(wrap);
    var el = wrap.querySelector('#pdf');

    var opt = {
      margin: [5, 6, 5, 6],
      filename: 'Rentabilite - ' + (nom||'projet').replace(/[^\w\s\-àâäéèêëïîôùûüç]/gi,'') + ' - ' + (ville||'ville').replace(/[^\w\s\-àâäéèêëïîôùûüç]/gi,'') + '.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false, letterRendering: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all'] }
    };

    setTimeout(function() {
      html2pdf().set(opt).from(el).save().then(function() {
        document.body.removeChild(wrap);
      }).catch(function() {
        document.body.removeChild(wrap);
      });
    }, 500);
    return true;
  }

  return { exportPdf: exportPdf };
})();
