/**
 * Export PDF - Simulateur de marge IDEAL
 * FORCE STRICTE 1 PAGE A4
 */

const MargePDF = (function() {
  function fE(n) { return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n || 0); }
  function fP(n) { return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0) + '%'; }

  function badgeInline(d) {
    var c = d.classe || '';
    if (c === 'no-go') return 'border-color:#dc2626;background:#fef2f2;color:#991b1b;';
    if (c === 'reflexion' || c === 'reflexion2' || c === 'orange') return 'border-color:#d97706;background:#fffbeb;color:#92400e;';
    if (c === 'go') return 'border-color:#16a34a;background:#f0fdf4;color:#166534;';
    return '';
  }

  function exportPdf(simulation) {
    if (typeof html2pdf === 'undefined') { alert("Erreur : Bibliothèque non chargée."); return false; }

    var meta = simulation.meta || {};
    var recap = simulation.recap || {};
    var frais = simulation.frais || {};
    var lots = simulation.lotsCalc || [];
    var d = recap.decision || {};
    var nbLots = meta.nbLots || 1;
    var dateStr = meta.timestamp ? new Date(meta.timestamp).toLocaleDateString('fr-FR') : new Date().toLocaleDateString('fr-FR');

    var h = '\
    <style>\
      #pdf-render {\
        font-family: Helvetica, Arial, sans-serif;\
        color: #1e293b;\
        padding: 15px 20px;\
        background: white;\
        width: 210mm;\
        height: 296mm;\
        overflow: hidden;\
        box-sizing: border-box;\
        display: flex;\
        flex-direction: column;\
        page-break-after: avoid !important;\
      }\
      .header {\
        display: flex;\
        justify-content: space-between;\
        align-items: center;\
        border-bottom: 3px solid #6D071A;\
        padding-bottom: 6px;\
        margin-bottom: 8px;\
      }\
      .logo-area { width: 80px; flex-shrink: 0; }\
      .logo-area img { max-width: 100%; height: auto; display: block; }\
      .title-area { flex-grow: 1; margin-left: 16px; }\
      .title-area h1 { color: #6D071A; font-size: 16px; margin: 0; font-weight: 800; }\
      .project-name { font-size: 11px; font-weight: 600; color: #475569; }\
      .meta-info { text-align: right; font-size: 8px; color: #64748b; line-height: 1.5; }\
      .meta-info b { color: #1e293b; }\
      \
      .badge-container { text-align: center; margin: 6px 0; }\
      .badge {\
        display: inline-block;\
        padding: 8px 40px;\
        border-radius: 10px;\
        font-size: 20px;\
        font-weight: 800;\
        letter-spacing: 1px;\
        border: 2px solid #d97706;\
        background: #fffbeb;\
        color: #92400e;\
      }\
      \
      .kpis { display: flex; gap: 8px; margin-bottom: 8px; }\
      .kpi-card {\
        flex: 1;\
        border: 1px solid #e2e8f0;\
        border-radius: 6px;\
        padding: 5px 8px;\
        background: #f8fafc;\
      }\
      .kpi-label { font-size: 7px; text-transform: uppercase; color: #64748b; font-weight: 700; }\
      .kpi-value { font-size: 12px; font-weight: 800; color: #1e293b; }\
      \
      .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; flex-grow: 1; }\
      h2 {\
        font-size: 8.5px;\
        color: #6D071A;\
        border-bottom: 1px solid #f1f5f9;\
        padding-bottom: 2px;\
        text-transform: uppercase;\
        margin-top: 7px;\
        margin-bottom: 3px;\
        letter-spacing: 0.3px;\
      }\
      \
      table { width: 100%; border-collapse: collapse; font-size: 8.5px; }\
      th { text-align: left; padding: 2.5px 4px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; font-size: 7.5px; text-transform: uppercase; }\
      td { padding: 2.5px 4px; border-bottom: 1px solid #f1f5f9; }\
      .total-row { font-weight: 700; background: #fff8f8; color: #6D071A; }\
      \
      .footer-note {\
        margin-top: auto;\
        font-size: 7px;\
        color: #94a3b8;\
        text-align: center;\
        padding-top: 6px;\
        border-top: 1px solid #f1f5f9;\
      }\
    </style>\
    \
    <div id="pdf-render">\
      <div class="header">\
        <div class="logo-area">\
          <img src="assets/logo.png" alt="Logo" onerror="this.style.display=\'none\'">\
        </div>\
        <div class="title-area">\
          <h1>IDEAL — Rentabilité</h1>\
          <div class="project-name">' + (meta.nom || 'Projet') + ' — ' + (meta.ville || 'Ville') + '</div>\
        </div>\
        <div class="meta-info">\
          Date : <b>' + dateStr + '</b><br>\
          Auteur : <b>' + (meta.auteur || '-') + '</b><br>\
          Lots : <b>' + nbLots + '</b>\
        </div>\
      </div>\
      \
      <div class="badge-container">\
        <div class="badge" style="' + badgeInline(d) + '">' + (d.code || 'À ANALYSER') + '</div>\
      </div>\
      \
      <div class="kpis">\
        <div class="kpi-card"><div class="kpi-label">Marge Nette Projet</div><div class="kpi-value">' + fE(recap.margeNetteProjet) + '</div></div>\
        <div class="kpi-card"><div class="kpi-label">ROI Projet</div><div class="kpi-value">' + fP(recap.ROIProjetTotal) + '</div></div>\
        <div class="kpi-card"><div class="kpi-label">Investissement</div><div class="kpi-value">' + fE(recap.investissementTotalPourROI) + '</div></div>\
        <div class="kpi-card"><div class="kpi-label">PV + Travaux</div><div class="kpi-value">' + fE(recap.prixVenteAvecTravauxEtCom) + '</div></div>\
      </div>\
      \
      <div class="grid">\
        <div class="left-col">\
          <h2>Détail des lots</h2>\
          <table>\
            <thead><tr><th>Lot</th><th>Achat</th><th>m²</th><th>Trav. HT</th><th>PV IHP</th><th>Marge</th></tr></thead>\
            <tbody>' + lots.map(function(l, i) {
              return '<tr><td>' + (i+1) + '</td><td>' + fE(l.prixAchat) + '</td><td>' + (l.surface||0) + '</td><td>' + fE(l.travauxHT) + '</td><td>' + fE(l.pvIHP) + '</td><td>' + fE((l.margeBien||0)+(l.margeTRV||0)) + '</td></tr>';
            }).join('') + '\
              <tr class="total-row"><td>TOTAL</td><td>' + fE(frais.prixAchatTotal) + '</td><td>-</td><td>' + fE(recap.travauxHTTotal) + '</td><td>' + fE(recap.prixVenteTotal) + '</td><td>' + fE(recap.margeBruteTotalSansTravaux) + '</td></tr>\
            </tbody>\
          </table>\
          \
          <h2>Acquisition</h2>\
          <table>\
            <tr><td>Prix achat total</td><td>' + fE(frais.prixAchatTotal) + '</td></tr>\
            <tr><td>Frais notaire</td><td>' + fE(frais.fraisNotaire) + '</td></tr>\
            <tr><td>Total frais divers</td><td>' + fE(frais.totalFraisDivers) + '</td></tr>\
            <tr class="total-row"><td>COÛT TOTAL ACQUISITION</td><td>' + fE(frais.coutTotalAcquisition) + '</td></tr>\
          </table>\
          \
          <h2>Rentabilité sans travaux</h2>\
          <table>\
            <tr><td>Marge brute</td><td>' + fE(recap.margeBruteTotalSansTravaux) + '</td></tr>\
            <tr><td>Marge nette</td><td>' + fE(recap.margeNetteSansTravaux) + '</td></tr>\
          </table>\
        </div>\
        \
        <div class="right-col">\
          <h2>Structure des marges IHP</h2>\
          <table>\
            <tr><td>Commission IHP bien</td><td>' + fE(recap.commissionIHPBien) + '</td></tr>\
            <tr><td>Commission IHP travaux</td><td>' + fE(recap.commissionIHPTravaux) + '</td></tr>\
            <tr class="total-row"><td>TOTAL COMMISSIONS</td><td>' + fE(recap.totalCommissionIHP) + '</td></tr>\
          </table>\
          \
          <h2>TVA sur marge</h2>\
          <table>\
            <tr><td>TVA marge travaux (20%)</td><td>' + fE(recap.tvaSurMargeTravaux) + '</td></tr>\
            <tr><td>Marge nette nette TRV</td><td>' + fE(recap.margeNetteNetteTRV) + '</td></tr>\
            <tr><td>TVA marge bien (20%)</td><td>' + fE(recap.tvaSurMargeBien) + '</td></tr>\
            <tr><td>Marge nette nette bien</td><td>' + fE(recap.margeNetteNetteBien) + '</td></tr>\
            <tr class="total-row"><td>TOTAL MARGE NETTE APRÈS TVA</td><td>' + fE(recap.totalMargeNetteApresTVASurMarge) + '</td></tr>\
          </table>\
          \
          <h2>Travaux</h2>\
          <table>\
            <tr><td>Travaux HT total</td><td>' + fE(recap.travauxHTTotal) + '</td></tr>\
            <tr><td>TVA travaux</td><td>' + fE(recap.tvaTravauxTotal) + '</td></tr>\
            <tr><td>Sous-total TTC + marge IHP</td><td>' + fE(recap.sousTotalTravauxTTCPlusMargeIHP) + '</td></tr>\
            <tr class="total-row"><td>PV AVEC TRAVAUX ET COM</td><td>' + fE(recap.prixVenteAvecTravauxEtCom) + '</td></tr>\
          </table>\
        </div>\
      </div>\
      \
      <div class="footer-note">\
        🔴 NO GO &lt; 10 000 € · 🟠 RÉFLEXION 10 000 € – 25 000 € · 🟢 GO ≥ 25 001 € — Document généré via Simulateur IDEAL\
      </div>\
    </div>';

    // ── Conteneur de rendu hors-écran ──
    var wrap = document.createElement('div');
    wrap.style.cssText = 'position:fixed;z-index:-1000;left:0;top:0;width:210mm;background:white;overflow:hidden;';
    wrap.innerHTML = h;
    document.body.appendChild(wrap);

    var opt = {
      margin: 0,
      filename: 'IDEAL_' + (meta.nom || 'Projet').replace(/[^\w\s\-àâäéèêëïîôùûüç]/gi, '') + '.pdf',
      image: { type: 'jpeg', quality: 1 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // setTimeout pour laisser le logo charger et le DOM se peindre
    setTimeout(function() {
      html2pdf().set(opt).from(document.getElementById('pdf-render')).save().then(function() {
        document.body.removeChild(wrap);
      }).catch(function() {
        document.body.removeChild(wrap);
      });
    }, 1000);

    return true;
  }

  return { exportPdf: exportPdf };
})();
