/* GNG Corporation - Animations (js/animations.js) */

document.addEventListener('DOMContentLoaded', () => {
  initScrollAnimations();
});

/**
 * Initializes IntersectionObserver for animating elements into view as you scroll
 */
function initScrollAnimations() {
  // Config for the observer
  const observerOptions = {
    root: null, // use viewport
    rootMargin: '0px 0px -10% 0px', // trigger slightly before entering fully
    threshold: 0.1 // 10% visible
  };

  const revealCallback = (entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        // Unobserve after showing so we don't recalculate on scroll up
        observer.unobserve(entry.target);
      }
    });
  };

  const observer = new IntersectionObserver(revealCallback, observerOptions);

  // Grab all reveal elements
  const revealElements = document.querySelectorAll('.reveal');
  revealElements.forEach(el => {
    observer.observe(el);
  });
}
