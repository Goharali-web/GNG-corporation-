/* GNG Corporation - Main JavaScript (js/main.js) */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  highlightActiveLink();
});

/**
 * Initializes the mobile nav drawer toggling behavior
 */
function initNavbar() {
  const menuToggle = document.querySelector('.menu-toggle');
  const mobileNav = document.querySelector('.mobile-nav');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');
  const navbar = document.querySelector('.navbar');

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener('click', () => {
      const isActive = menuToggle.classList.toggle('active');
      mobileNav.classList.toggle('active', isActive);
      document.body.style.overflow = isActive ? 'hidden' : '';
    });

    // Close menu when a link is clicked
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        menuToggle.classList.remove('active');
        mobileNav.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  // Sticky scroll class transition
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('navbar-scrolled');
    } else {
      navbar.classList.remove('navbar-scrolled');
    }
  });
}

/**
 * Automatically detects the current page location and highlights the corresponding navbar links
 */
function highlightActiveLink() {
  const currentPath = window.location.pathname;
  const filename = currentPath.substring(currentPath.lastIndexOf('/') + 1) || 'index.html';
  
  const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
  
  navLinks.forEach(link => {
    const linkHref = link.getAttribute('href');
    if (!linkHref) return;
    
    const hrefFilename = linkHref.substring(linkHref.lastIndexOf('/') + 1) || 'index.html';
    
    // Check if filename matches or (for subpages) if it relates
    if (filename === hrefFilename) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}
