// CONTENU DÉTAILLÉ POUR CHAQUE VIGNETTE ACQUÉREURS
var detailsDataAcquereurs = {
  parcours: {
    titre: "En finir avec le parcours du combattant",
    items: [
      { titre: "Budgets qui s'envolent", texte: "Des devis travaux souvent sous-estimés ou flous." },
      { titre: "Malfaçons techniques", texte: "La peur des vices cachés ou des structures défaillantes." },
      { titre: "Délais non maîtrisés", texte: "Des chantiers qui décalent vos projets de vie." },
      { titre: "Défaut de projection", texte: "Difficulté d'imaginer le potentiel réel d'un espace dégradé." }
    ]
  },
  solution: {
    titre: "La Solution IHP : La Force du Clé en Main",
    items: [
      { titre: "Projets déjà budgétés", texte: "Chaque bien est présenté avec un chiffrage précis et transparent des rénovations nécessaires." },
      { titre: "Expertise Technique Garantie", texte: "Nos dossiers incluent des diagnostics structurels poussés. Vous savez exactement ce que vous achetez." },
      { titre: "Accompagnement d'architecte", texte: "Nous livrons des plans de masse et des rendus 3D immersifs pour que vous puissiez vous projeter immédiatement." },
      { titre: "Valorisation Immobilière", texte: "Nos projets sont pensés pour maximiser la valeur de revente ou le rendement locatif." }
    ]
  },
  services: {
    titre: "Nos Services : Un suivi de A à Z",
    items: [
      { titre: "Audit & Diagnostic", texte: "Validation de la viabilité du projet par notre Bureau des 7 et nos experts techniques." },
      { titre: "Dossier de Conception", texte: "Mise à disposition de tous les documents (plans, coupes, notices techniques)." },
      { titre: "Maîtrise d'Ouvrage", texte: "Nous assurons la coordination des corps d'état et le suivi rigoureux du planning." },
      { titre: "Livraison & Garantie", texte: "Un bien livré conforme aux attentes, prêt à habiter ou à louer." }
    ]
  },
  promesse: {
    titre: "La Promesse IHP : Acheter en toute confiance",
    items: [
      { titre: "Sécurité Juridique", texte: "Des transactions cadrées et transparentes avec nos partenaires notaires." },
      { titre: "Qualité Architecturale", texte: "Des choix de matériaux et d'aménagements durables et esthétiques." },
      { titre: "Transparence Financière", texte: "Pas de frais cachés, le coût réel est connu dès le départ." },
      { titre: "Accompagnement Personnalisé", texte: "Un conseiller dédié vous accompagne tout au long du projet." }
    ]
  }
};

document.addEventListener('DOMContentLoaded', function() {
  var vignettes = document.querySelectorAll('.vignette-acquereur-principale');
  var modal = document.getElementById('modalDetailsAcquereurs');
  if (!modal) return;

  var modalBody = document.getElementById('modalBodyAcquereurs');
  var btnClose = modal.querySelector('.modal-close');

  vignettes.forEach(function(vignette) {
    var btn = vignette.querySelector('.btn-voir-details');
    if (btn) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        var vignetteType = vignette.getAttribute('data-vignette');
        openModalAcquereurs(vignetteType);
      });
    }
  });

  if (btnClose) btnClose.addEventListener('click', closeModalAcquereurs);
  modal.addEventListener('click', function(e) {
    if (e.target === modal) closeModalAcquereurs();
  });
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeModalAcquereurs();
  });
});

function openModalAcquereurs(type) {
  var modal = document.getElementById('modalDetailsAcquereurs');
  var modalBody = document.getElementById('modalBodyAcquereurs');
  var data = detailsDataAcquereurs[type];
  if (!modal || !modalBody || !data) return;

  var html = '<h2>' + data.titre + '</h2>';
  data.items.forEach(function(item) {
    html += '<div class="modal-detail-item"><h3>' + item.titre + '</h3><p>' + item.texte + '</p></div>';
  });

  modalBody.innerHTML = html;
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModalAcquereurs() {
  var modal = document.getElementById('modalDetailsAcquereurs');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
  }
}
