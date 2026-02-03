// FERMER LE BANDEAU
document.addEventListener('DOMContentLoaded', function() {
  const btnClose = document.querySelector('.btn-close-bandeau, .bandeau-close');
  const bandeau = document.getElementById('bandeau-evenement') || document.querySelector('.bandeau-evenement, .bandeau-evenements');
  const header = document.querySelector('.header-principal');

  if (btnClose && bandeau) {
    btnClose.addEventListener('click', function() {
      bandeau.style.transition = 'all 0.3s ease';
      bandeau.style.transform = 'translateY(-100%)';
      bandeau.style.opacity = '0';

      setTimeout(function() {
        bandeau.style.display = 'none';
        document.body.classList.add('bandeau-ferme');
        if (header) header.style.marginTop = '0';
      }, 300);
    });
  }

  // BURGER + DROPDOWN PROFIL (mobile + desktop)
  const burger = document.querySelector('.burger, .menu-toggle');
  const nav = document.querySelector('#mainNav, .header-nav-full, .header-nav');
  const btnProfil = document.querySelector('.btn-profil');
  const profilDropdown = document.querySelector('#profilDropdown, .dropdown-profil');

  const closeNav = function() {
    if (!nav || !burger) return;
    nav.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
  };

  const closeProfil = function() {
    if (!profilDropdown || !btnProfil) return;
    profilDropdown.classList.remove('is-open');
    btnProfil.setAttribute('aria-expanded', 'false');
    if (profilDropdown.setAttribute) profilDropdown.setAttribute('aria-hidden', 'true');
  };

  // Burger toggle
  if (burger && nav) {
    burger.addEventListener('click', function(e) {
      e.stopPropagation();
      const isOpen = nav.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      if (isOpen) closeProfil();
    });

    var navLinks = nav.querySelectorAll('a');
    for (var i = 0; i < navLinks.length; i++) {
      navLinks[i].addEventListener('click', function() { closeNav(); });
    }
  }

  // Dropdown profil (clic)
  if (btnProfil && profilDropdown) {
    btnProfil.addEventListener('click', function(e) {
      e.stopPropagation();
      const isOpen = profilDropdown.classList.toggle('is-open');
      btnProfil.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      profilDropdown.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
      if (isOpen) closeNav();
    });

    profilDropdown.addEventListener('click', function(e) {
      e.stopPropagation();
    });
  }

  // Clic extérieur : fermer tout (sauf si clic sur un lien qui navigue)
  document.addEventListener('click', function(e) {
    if (profilDropdown && profilDropdown.contains(e.target)) return;
    if (nav && nav.contains(e.target)) return;
    closeNav();
    closeProfil();
  });

  // ESC : fermer tout
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      closeNav();
      closeProfil();
    }
  });
});
