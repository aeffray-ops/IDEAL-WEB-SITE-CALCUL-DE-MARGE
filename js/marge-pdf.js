/**
 * Export PDF - Simulateur de marge IDEAL
 * Utilise html2pdf.js via CDN
 */

const MargePDF = (function() {
  function formatE(n) {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 }).format(n || 0);
  }

  function formatPct(n) {
    return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2 }).format(n || 0) + ' %';
  }

  function exportPdf(simulation) {
    if (typeof html2pdf === 'undefined') {
      console.error('html2pdf non chargé');
      return false;
    }
    const meta = simulation.meta || {};
    const recap = simulation.recap || {};
    const lotsCalc = simulation.lotsCalc || [];
    const frais = simulation.frais || {};

    const nom = meta.nom || 'Sans nom';
    const ville = meta.ville || '';
    const auteur = meta.auteur || '';
    const nbLots = meta.nbLots || 1;
    const dateStr = meta.timestamp ? new Date(meta.timestamp).toLocaleDateString('fr-FR') : new Date().toLocaleDateString('fr-FR');
    const d = recap.decision || {};

    let html = '<div id="marge-pdf-content" style="font-family:Poppins,sans-serif;padding:20px;font-size:12px;">';
    html += '<div style="text-align:center;padding:40px 0;"><h1 style="color:#6D071A;">Rentabilité IDEAL</h1>';
    html += '<p><strong>Simulation :</strong> ' + nom + '</p><p><strong>Ville :</strong> ' + ville + '</p>';
    html += '<p><strong>Auteur :</strong> ' + (auteur || '-') + '</p><p><strong>Date :</strong> ' + dateStr + '</p>';
    html += '<p><strong>Nombre de lots :</strong> ' + nbLots + '</p></div>';

    html += '<div style="page-break-before:always;"><h2 style="color:#6D071A;">RÉCAPITULATIF SYNTHÈSE</h2>';
    html += '<p style="font-size:14px;font-weight:bold;">' + (d.code || '') + '  |  Marge Nette Projet : ' + formatE(recap.totalMargeNetteApresTVASurMarge) + '</p>';
    html += '<table style="width:100%;border-collapse:collapse;"><tr style="background:#f0f0f0;"><th>Indicateur</th><th>Valeur</th></tr>';
    html += '<tr><td>Investissement total</td><td>' + formatE(recap.investissementTotalPourROI) + '</td></tr>';
    html += '<tr><td>Marge nette après TVA</td><td>' + formatE(recap.totalMargeNetteApresTVASurMarge) + '</td></tr>';
    html += '<tr><td>ROI</td><td>' + formatPct(recap.ROIProjetTotal) + '</td></tr>';
    html += '<tr><td>Ratio marge/CA</td><td>' + formatPct(recap.ratioMargeCA) + '</td></tr>';
    html += '<tr><td>Prix vente avec travaux</td><td>' + formatE(recap.prixVenteAvecTravauxEtCom) + '</td></tr></table></div>';

    if (lotsCalc.length > 0) {
      html += '<div style="page-break-before:always;"><h2 style="color:#6D071A;">DÉTAIL LOTS</h2>';
      html += '<table style="width:100%;border-collapse:collapse;"><tr style="background:#6D071A;color:#fff;">';
      html += '<th>Lot</th><th>Prix achat</th><th>Surface</th><th>Prix/m²</th><th>Travaux HT</th><th>Travaux TTC</th><th>PV IHP</th><th>Marge lot</th></tr>';
      lotsCalc.forEach((l, i) => {
        const margeLot = (l.margeBien || 0) + (l.margeTRV || 0);
        html += '<tr><td>' + (i + 1) + '</td><td>' + formatE(l.prixAchat) + '</td><td>' + l.surface + ' m²</td><td>' + formatE(l.prixM2) + '</td>';
        html += '<td>' + formatE(l.travauxHT) + '</td><td>' + formatE(l.travauxTTC) + '</td><td>' + formatE(l.pvIHP) + '</td><td>' + formatE(margeLot) + '</td></tr>';
      });
      html += '</table>';
      html += '<h3 style="margin-top:24px;">Frais divers</h3><table style="width:100%;border-collapse:collapse;">';
      html += '<tr><td>Prix achat total</td><td>' + formatE(frais.prixAchatTotal) + '</td></tr>';
      html += '<tr><td>Frais notaire</td><td>' + formatE(frais.fraisNotaire) + '</td></tr>';
      html += '<tr><td>Total frais divers</td><td>' + formatE(frais.totalFraisDivers) + '</td></tr>';
      html += '<tr><td>Coût total acquisition</td><td>' + formatE(frais.coutTotalAcquisition) + '</td></tr></table></div>';
    }
    html += '</div>';

    const wrap = document.createElement('div');
    wrap.style.cssText = 'position:absolute;left:-9999px;top:0;width:210mm;';
    wrap.innerHTML = html;
    document.body.appendChild(wrap);
    const el = wrap.querySelector('#marge-pdf-content');

    const opt = {
      margin: 10,
      filename: 'Rentabilite - ' + (nom || 'projet').replace(/[^\w\s\-àâäéèêëïîôùûüç]/gi, '') + ' - ' + (ville || 'ville').replace(/[^\w\s\-àâäéèêëïîôùûüç]/gi, '') + '.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    };
    html2pdf().set(opt).from(el).save().then(() => {
      document.body.removeChild(wrap);
    }).catch(() => {
      document.body.removeChild(wrap);
    });
    return true;
  }

  return { exportPdf };
})();
