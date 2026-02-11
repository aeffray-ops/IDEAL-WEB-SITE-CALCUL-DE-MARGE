/**
 * Export PDF - Simulateur de marge IDEAL
 * Version optimisée : 1 page A4, Logo inclus, Rendu stabilisé.
 */

const MargePDF = (function() {
  // Formatteurs
  function fE(n) { return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n || 0); }
  function fP(n) { return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0) + '%'; }

  function exportPdf(simulation) {
    if (typeof html2pdf === 'undefined') {
      alert("Erreur : La bibliothèque PDF n'est pas chargée. Veuillez rafraîchir la page.");
      return false;
    }

    const meta = simulation.meta || {};
    const recap = simulation.recap || {};
    const d = recap.decision || {};

    // --- CONSTRUCTION DU HTML ---
    let h = `
    <style>
      #pdf-render { 
        font-family: 'Helvetica', Arial, sans-serif; 
        color: #1e293b; 
        padding: 30px; 
        background: white; 
        width: 210mm; 
        min-height: 297mm; 
        box-sizing: border-box; 
      }
      .header { 
        display: flex; 
        justify-content: space-between; 
        align-items: center; 
        border-bottom: 4px solid #6D071A; 
        padding-bottom: 15px; 
        margin-bottom: 20px; 
      }
      .logo-area { width: 140px; }
      .logo-area img { max-width: 100%; height: auto; display: block; }
      
      .title-area { flex-grow: 1; margin-left: 25px; }
      .title-area h1 { color: #6D071A; font-size: 22px; margin: 0; font-weight: 800; text-transform: uppercase; }
      .project-name { font-size: 14px; font-weight: 600; color: #475569; margin-top: 5px; }
      
      .meta-info { text-align: right; font-size: 10px; color: #64748b; line-height: 1.4; }
      .meta-info b { color: #1e293b; }

      .badge-container { text-align: center; margin: 20px 0; }
      .badge { 
        display: inline-block; 
        padding: 15px 60px; 
        border-radius: 12px; 
        font-size: 24px; 
        font-weight: 800; 
        letter-spacing: 2px;
        border: 3px solid #d97706; 
        background: #fffbeb; 
        color: #92400e; 
      }

      .kpis { display: flex; gap: 12px; margin-bottom: 25px; }
      .kpi-card { 
        flex: 1; 
        border: 1px solid #e2e8f0; 
        border-radius: 8px; 
        padding: 12px; 
        background: #f8fafc; 
        box-shadow: inset 0 1px 2px rgba(0,0,0,0.05);
      }
      .kpi-label { font-size: 8px; text-transform: uppercase; color: #64748b; font-weight: 700; margin-bottom: 4px; }
      .kpi-value { font-size: 16px; font-weight: 800; color: #1e293b; }

      .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
      h2 { 
        font-size: 11px; 
        color: #6D071A; 
        border-bottom: 2px solid #f1f5f9; 
        padding-bottom: 6px; 
        text-transform: uppercase; 
        margin-top: 20px; 
        margin-bottom: 10px;
        letter-spacing: 0.5px;
      }
      
      table { width: 100%; border-collapse: collapse; font-size: 9.5px; }
      th { text-align: left; padding: 6px; background: #f8fafc; color: #475569; font-weight: 700; border-bottom: 1px solid #e2e8f0; }
      td { padding: 6px; border-bottom: 1px solid #f1f5f9; }
      .total-row { font-weight: 700; background: #fff8f8; color: #6D071A; }
      
      .footer-note { 
        margin-top: 40px; 
        font-size: 8px; 
        color: #94a3b8; 
        text-align: center; 
        border-top: 1px solid #f1f5f9; 
        padding-top: 15px; 
      }
    </style>

    <div id="pdf-render">
      <div class="header">
        <div class="logo-area">
          <img src="images/Logo_IHP.png" alt="Logo" onerror="this.style.display='none'">
        </div>
        <div class="title-area">
          <h1>IDEAL — Rentabilité</h1>
          <div class="project-name">${meta.nom || 'Sans nom'} — ${meta.ville || 'Ville non spécifiée'}</div>
        </div>
        <div class="meta-info">
          Date : <b>${new Date().toLocaleDateString('fr-FR')}</b><br>
          Auteur : <b>${meta.auteur || '-'}</b><br>
          Nombre de lots : <b>${meta.nbLots || 1}</b>
        </div>
      </div>

      <div class="badge-container">
        <div class="badge" style="${d.code === 'GO' ? 'border-color:#16a34a;background:#f0fdf4;color:#166534;' : (d.code === 'NO GO' ? 'border-color:#dc2626;background:#fef2f2;color:#991b1b;' : '')}">
          ${d.code || 'À ANALYSER'}
        </div>
      </div>

      <div class="kpis">
        <div class="kpi-card"><div class="kpi-label">Marge Nette Projet</div><div class="kpi-value">${fE(recap.margeNetteProjet)}</div></div>
        <div class="kpi-card"><div class="kpi-label">ROI Projet</div><div class="kpi-value">${fP(recap.ROIProjetTotal)}</div></div>
        <div class="kpi-card"><div class="kpi-label">Investissement</div><div class="kpi-value">${fE(recap.investissementTotalPourROI)}</div></div>
        <div class="kpi-card"><div class="kpi-label">Prix de Vente Total</div><div class="kpi-value">${fE(recap.prixVenteAvecTravauxEtCom)}</div></div>
      </div>

      <div class="grid">
        <div class="left-col">
          <h2>Détail financier des lots</h2>
          <table>
             <thead><tr><th>Lot</th><th>Achat</th><th>m²</th><th>Marge</th></tr></thead>
             <tbody>
                ${(simulation.lotsCalc || []).map((l, i) => `
                  <tr>
                    <td>${i+1}</td>
                    <td>${fE(l.prixAchat)}</td>
                    <td>${l.surface || 0} m²</td>
                    <td>${fE((l.margeBien||0)+(l.margeTRV||0))}</td>
                  </tr>
                `).join('')}
                <tr class="total-row">
                  <td>TOTAL</td>
                  <td>${fE(simulation.frais.prixAchatTotal)}</td>
                  <td>-</td>
                  <td>${fE(recap.margeBruteTotalSansTravaux)}</td>
                </tr>
             </tbody>
          </table>
          
          <h2>Synthèse Acquisition</h2>
          <table>
            <tr><td>Prix d'achat net vendeur</td><td>${fE(simulation.frais.prixAchatTotal)}</td></tr>
            <tr><td>Frais de notaire estimés</td><td>${fE(simulation.frais.fraisNotaire)}</td></tr>
            <tr><td>Frais divers</td><td>${fE(simulation.frais.totalFraisDivers)}</td></tr>
            <tr class="total-row"><td>COÛT ACQUISITION TOTAL</td><td>${fE(simulation.frais.coutTotalAcquisition)}</td></tr>
          </table>
        </div>

        <div class="right-col">
          <h2>Structure des Marges IHP</h2>
          <table>
            <tr><td>Commission sur Bien</td><td>${fE(recap.commissionIHPBien)}</td></tr>
            <tr><td>Commission sur Travaux</td><td>${fE(recap.commissionIHPTravaux)}</td></tr>
            <tr class="total-row"><td>TOTAL COMMISSIONS HT</td><td>${fE(recap.totalCommissionIHP)}</td></tr>
          </table>

          <h2>Fiscalité & Net</h2>
          <table>
            <tr><td>TVA sur Marge (20%)</td><td>${fE(recap.tvaSurMargeTravaux + recap.tvaSurMargeBien)}</td></tr>
            <tr class="total-row"><td>MARGE NETTE (APRÈS TVA)</td><td>${fE(recap.totalMargeNetteApresTVASurMarge)}</td></tr>
          </table>

          <h2>Bilan Travaux</h2>
          <table>
            <tr><td>Travaux HT Total</td><td>${fE(recap.travauxHTTotal)}</td></tr>
            <tr><td>TVA sur Travaux</td><td>${fE(recap.tvaTravauxTotal)}</td></tr>
            <tr class="total-row"><td>TOTAL TRAVAUX TTC</td><td>${fE(recap.sousTotalTravauxTTCPlusMargeIHP)}</td></tr>
          </table>
        </div>
      </div>

      <div class="footer-note">
        Document généré via le Simulateur de Marge Inter-Hautes-Pyrénées (IDEAL). 
        Les calculs sont donnés à titre indicatif.
      </div>
    </div>`;

    // --- PROCESSUS DE RENDU ---
    const wrap = document.createElement('div');
    wrap.style.cssText = 'position:fixed; z-index:-1000; left:0; top:0; width:210mm; background:white;';
    wrap.innerHTML = h;
    document.body.appendChild(wrap);

    const element = document.getElementById('pdf-render');
    
    const opt = {
      margin: 0,
      filename: `IDEAL_Rentabilite_${(meta.nom || 'Projet').replace(/\s+/g, '_')}.pdf`,
      image: { type: 'jpeg', quality: 1 },
      html2canvas: { 
        scale: 2, 
        useCORS: true, 
        logging: false,
        letterRendering: true,
        allowTaint: true
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // On attend 1 seconde pour garantir le rendu des polices et images
    setTimeout(() => {
      html2pdf().set(opt).from(element).save().then(() => {
        document.body.removeChild(wrap);
      }).catch(err => {
        console.error("Erreur PDF:", err);
        document.body.removeChild(wrap);
      });
    }, 1000);

    return true;
  }

  return { exportPdf: exportPdf };
})();