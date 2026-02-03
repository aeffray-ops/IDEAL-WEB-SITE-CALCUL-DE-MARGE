// CONTENU DÉTAILLÉ POUR CHAQUE VIGNETTE
const detailsData = {
  defi: {
    titre: "Pourquoi vendre un bien à rénover est souvent un défi",
    items: [
      {
        titre: "Manque de projection",
        texte: "Les acquéreurs ont souvent du mal à s'imaginer vivre dans un bien nécessitant des travaux importants. Le potentiel d'une maison abandonnée ou de travaux reste invisible pour beaucoup."
      },
      {
        titre: "Incertitude des coûts",
        texte: "Les vendeurs subissent souvent des estimations de travaux floues que les acheteurs utilisent pour renégocier le prix à la baisse au dernier moment."
      },
      {
        titre: "Débats interminables",
        texte: "Entre les visites, l'obtention du prêt et les délais légaux, une vente classique peut prendre 6 à 8 mois sans garantie de succès."
      },
      {
        titre: "Fatigue des visites",
        texte: "Multiplier les passages de curieux ou d'acheteurs non qualifiés est chronophage et intrusif."
      }
    ]
  },
  engagement: {
    titre: "Notre Engagement : Une approche d'investisseur pour une transaction sécurisée",
    items: [
      {
        titre: "Zéro Renégociation",
        texte: "Une fois notre analyse technique réalisée et notre offre acceptée, le prix est ferme. Nous ne revenons pas sur notre parole."
      },
      {
        titre: "Accompagnement Juridique",
        texte: "Nous gérons l'ensemble des démarches avec nos partenaires notaires pour une signature fluide et conforme."
      },
      {
        titre: "Maîtrise Technique",
        texte: "Là où un particulier voit des problèmes, nous voyons des solutions. Notre expertise nous permet d'assumer les contraintes techniques du bâti."
      },
      {
        titre: "Sécurisation Financière",
        texte: "Nous présentons des garanties de solvabilité immédiates, éliminant le risque de refus de prêt bancaire, cause n°1 d'échec des ventes."
      }
    ]
  },
  valorisation: {
    titre: "Comment nous valorisons votre bien",
    items: [
      {
        titre: "Audit Technique Complet",
        texte: "Nous réalisons à nos frais une étude structurelle et technique du bâtiment pour lever tous les doutes."
      },
      {
        titre: "Étude de Valorisation Architecturale",
        texte: "Nos experts dessinent le futur du bien (plans, 3D) pour lui redonner sa place sur le marché."
      },
      {
        titre: "Suivi de Chantier",
        texte: "Coordination complète des travaux avec nos partenaires de confiance."
      },
      {
        titre: "Livraison Clé en Main",
        texte: "Un bien rénové et prêt à être habité ou loué."
      }
    ]
  },
  processus: {
    titre: "Le Processus en 4 Étapes",
    items: [
      {
        titre: "1. Prise de contact",
        texte: "Vous nous présentez votre bien via notre formulaire."
      },
      {
        titre: "2. Visite Expertise",
        texte: "Un de nos agents techniques se déplace pour une analyse technique approfondie."
      },
      {
        titre: "3. Offre Ferme",
        texte: "Sous 48h après l'accord, nous vous présentons une offre d'achat sans conditions suspensives de prêt."
      },
      {
        titre: "4. Acte Authentique",
        texte: "Signature chez le notaire et versement des fonds."
      }
    ]
  }
};

// OUVERTURE ET FERMETURE MODAL
document.addEventListener('DOMContentLoaded', function() {
  const vignettes = document.querySelectorAll('.vignette-vendeur-principale');
  const modal = document.getElementById('modalDetails');
  const modalBody = document.getElementById('modalBody');
  const btnClose = document.querySelector('.modal-close');

  vignettes.forEach(vignette => {
    const btn = vignette.querySelector('.btn-voir-details');
    if (btn) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        const vignetteType = vignette.getAttribute('data-vignette');
        openModal(vignetteType);
      });
    }
  });

  if (btnClose) {
    btnClose.addEventListener('click', closeModal);
  }

  if (modal) {
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        closeModal();
      }
    });
  }

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      closeModal();
    }
  });
});

function openModal(type) {
  const modal = document.getElementById('modalDetails');
  const modalBody = document.getElementById('modalBody');
  const data = detailsData[type];

  if (!modal || !modalBody || !data) return;

  let html = '<h2>' + data.titre + '</h2>';

  data.items.forEach(function(item) {
    html += '<div class="modal-detail-item">' +
      '<h3>' + item.titre + '</h3>' +
      '<p>' + item.texte + '</p>' +
      '</div>';
  });

  modalBody.innerHTML = html;
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  const modal = document.getElementById('modalDetails');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
  }
}
