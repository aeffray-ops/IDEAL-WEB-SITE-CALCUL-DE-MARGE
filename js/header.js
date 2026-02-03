/**
 * CTA "Inscription webinaire" - Animation marquee avec pause 20s
 * À la fin d'un cycle (texte entièrement défiler), pause 20s puis reprise
 */
document.addEventListener('DOMContentLoaded', function() {
  const track = document.querySelector('.webinaire-marquee__track');
  if (!track || track.dataset.init === '1') return;
  track.dataset.init = '1';

  track.addEventListener('animationiteration', function() {
    track.classList.add('is-paused');
    setTimeout(function() {
      track.classList.remove('is-paused');
    }, 20000);
  });
});
