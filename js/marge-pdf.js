/**
 * Export PDF - Simulateur de marge IDEAL
 * html2pdf.js — STRICTEMENT 1 PAGE A4
 */

const MargePDF = (function() {
  function fE(n) { return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(n || 0); }
  function fP(n) { return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2 }).format(n || 0) + '%'; }

  function exportPdf(simulation) {
    const meta = simulation.meta || {};
    const recap = simulation.recap || {};
    const d = recap.decision || {};

    // --- CONSTRUCTION DU HTML ---
    let h = `
    <style>
      #pdf-render { font-family: 'Helvetica', sans-serif; color: #1e293b; padding: 20px; background: white; width: 210mm; min-height: 297mm; box-sizing: border-box; }
      .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #6D071A; padding-bottom: 10px; margin-bottom: 15px; }
      .logo-area { width: 120px; }
      .logo-area img { max-width: 100%; height: auto; }
      .title-area { text-align: left; flex-grow: 1; margin-left: 20px; }
      .title-area h1 { color: #6D071A; font-size: 18px; margin: 0; }
      .meta-info { text-align: right; font-size: 9px; color: #64748b; }
      
      .badge-container { text-align: center; margin: 15px 0; }
      .badge { display: inline-block; padding: 12px 50px; border-radius: 8px; font-size: 22px; font-weight: bold; border: 2px solid #d97706; background: #fffbeb; color: #92400e; }
      
      .kpis { display: flex; gap: 10px; margin-bottom: 20px; }
      .kpi-card { flex: 1; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px; background: #f8fafc; }
      .kpi-label { font-size: 8px; text-transform: uppercase; color: #64748b; font-weight: bold; }
      .kpi-value { font-size: 14px; font-weight: bold; color: #1e293b; }

      .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
      h2 { font-size: 10px; color: #6D071A; border-bottom: 1px solid #eee; padding-bottom: 5px; text-transform: uppercase; margin-top: 15px; }
      table { width: 100%; border-collapse: collapse; font-size: 9px; margin-top: 5px; }
      th { text-align: left; padding: 4px; background: #f1f5f9; }
      td { padding: 4px; border-bottom: 1px solid #f1f5f9; }
      .total-row { font-weight: bold; background: #fff8f8; }
    </style>

    <div id="pdf-render">
      <div class="header">
        <div class="logo-area">
          <img src="images/Logo_IHP.png" alt="Logo IHP">
        </div>
        <div class="title-area">
          <h1>IDEAL — Rentabilité</h1>
          <div style="font-size: 12px; font-weight: bold;">${meta.nom || 'Projet'} — ${meta.ville || ''}</div>
        </div>
        <div class="meta-info">
          Date : <b>${new Date().toLocaleDateString('fr-FR')}</b><br>
          Auteur : <b>${meta.auteur || '-'}</b><br>
          Lots : <b>${meta.nbLots || 1}</b>
        </div>
      </div>

      <div class="badge-container">
        <div class="badge">${d.code || 'REFLEXION'}</div>
      </div>

      <div class="kpis">
        <div class="kpi-card"><div class="kpi-label">Marge Nette</div><div class="kpi-value">${fE(recap.margeNetteProjet)}</div></div>
        <div class="kpi-card"><div class="kpi-label">ROI Projet</div><div class="kpi-value">${fP(recap.ROIProjetTotal)}</div></div>
        <div class="kpi-card"><div class="kpi-label">Investissement</div><div class="kpi-value">${fE(recap.investissementTotalPourROI)}</div></div>
        <div class="kpi-card"><div class="kpi-label">PV + Travaux</div><div class="kpi-value">${fE(recap.prixVenteAvecTravauxEtCom)}</div></div>
      </div>

      <div class="grid">
        <div class="left-col">
          <h2>Détail des lots</h2>
          <table>
             <thead><tr><th>Lot</th><th>Achat</th><th>PV IHP</th><th>Marge</th></tr></thead>
             <tbody>
                ${(simulation.lotsCalc || []).map((l, i) => `
                  <tr><td>${i+1}</td><td>${fE(l.prixAchat)}</td><td>${fE(l.pvIHP)}</td><td>${fE((l.margeBien||0)+(l.margeTRV||0))}</td></tr>
                `).join('')}
             </tbody>
          </table>
          
          <h2>Frais divers</h2>
          <table>
            <tr><td>Prix achat total</td><td>${fE(simulation.frais.prixAchatTotal)}</td></tr>
            <tr class="total-row"><td>Coût acquisition</td><td>${fE(simulation.frais.coutTotalAcquisition)}</td></tr>
          </table>
        </div>

        <div class="right-col">
          <h2>Structure des marges</h2>
          <table>
            <tr><td>Commissions IHP</td><td>${fE(recap.totalCommissionIHP)}</td></tr>
            <tr><td>TVA sur marge</td><td>${fE(recap.tvaSurMargeTravaux + recap.tvaSurMargeBien)}</td></tr>
            <tr class="total-row"><td>Marge Nette Après TVA</td><td>${fE(recap.totalMargeNetteApresTVASurMarge)}</td></tr>
          </table>
        </div>
      </div>
    </div>`;

    // --- GENERATION SECURISEE ---
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '-10000px';
    container.innerHTML = h;
    document.body.appendChild(container);

    const element = document.getElementById('pdf-render');
    
    const opt = {
      margin: 0,
      filename: `Rentabilite_${meta.nom || 'export'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false, letterRendering: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // On attend que les images soient chargées
    setTimeout(() => {
      html2pdf().set(opt).from(element).save().then(() => {
        document.body.removeChild(container);
      });
    }, 800); // Délai augmenté à 800ms pour le logo
  }

  return { exportPdf };
})();
