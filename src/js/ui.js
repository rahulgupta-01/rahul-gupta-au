/**
 * @file Manages all general UI components and interactions for the application.
 */

function initializeHeader() {
  const navMenu = document.getElementById('navigation-menu');
  const hamburgerBtn = document.getElementById('hamburger-menu');
  const closeMenuBtn = document.getElementById('close-menu');
  const overlay = document.getElementById('overlay');

  const openMenu = () => {
    document.body.classList.add('menu-is-open');
    if (navMenu) {
      navMenu.classList.add('is-open');
      navMenu.setAttribute('aria-hidden', 'false');
      // Move focus to the close button when the menu opens
      if (closeMenuBtn) {
        closeMenuBtn.focus();
      }
    }
    if (overlay) overlay.classList.add('is-visible');
  };

  if (hamburgerBtn) hamburgerBtn.addEventListener('click', openMenu);
  if (closeMenuBtn) closeMenuBtn.addEventListener('click', closeMenu);
  if (overlay) overlay.addEventListener('click', closeMenu);
}

export function closeMenu() {
  const navMenu = document.getElementById('navigation-menu');
  const overlay = document.getElementById('overlay');
  const hamburgerBtn = document.getElementById('hamburger-menu');

  // Move focus back to the hamburger button before hiding the menu.
  // This is the key fix for the error.
  if (hamburgerBtn) {
    hamburgerBtn.focus();
  }
  
  // Now that focus is safe, hide the menu and overlay.
  document.body.classList.remove('menu-is-open');
  if (navMenu) {
    navMenu.classList.remove('is-open');
    navMenu.setAttribute('aria-hidden', 'true');
  }
  if (overlay) overlay.classList.remove('is-visible');
}

function initializeTheme() {
  const themeToggle = document.getElementById('dark-mode-toggle');
  const currentTheme = localStorage.getItem('theme');

  if (currentTheme === 'dark') {
    document.body.classList.add('dark-mode');
    if (themeToggle) themeToggle.checked = true;
  }

  if (themeToggle) {
    themeToggle.addEventListener('change', function() {
      document.body.classList.toggle('dark-mode', this.checked);
      localStorage.setItem('theme', this.checked ? 'dark' : 'light');
    });
  }
}

function initializeScrollToTop() {
  if (document.getElementById('scrollToTopBtn')) return;

  const buttonHTML = `<a href="#" id="scrollToTopBtn" class="scroll-to-top-btn" title="Go to top" aria-label="Scroll to top"><i class="fas fa-chevron-up" aria-hidden="true"></i></a>`;
  document.body.insertAdjacentHTML('beforeend', buttonHTML);
  const scrollToTopBtn = document.getElementById('scrollToTopBtn');
  if (!scrollToTopBtn) return;

  window.addEventListener('scroll', () => {
    scrollToTopBtn.classList.toggle('visible', window.scrollY > 300);
  });

  scrollToTopBtn.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

function updateClock() {
  const clockDateEl = document.getElementById('currentDate');
  const clockTimeEl = document.getElementById('currentTime');

  if (clockDateEl && clockTimeEl) {
    const now = new Date();
    const options = { timeZone: 'Australia/Perth' };
    clockDateEl.textContent = now.toLocaleDateString(
      'en-AU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', ...options }
    );
    clockTimeEl.textContent = now
      .toLocaleTimeString('en-AU', { hour12: true, hour: 'numeric', minute: '2-digit', second: '2-digit', ...options })
      .toLowerCase() + ' AWST';
  }
}

function initializeContactPage() {
  document.querySelectorAll('.copy-button').forEach(button => {
    if (button.dataset.bound === '1') return; // Prevent double-binding
    button.dataset.bound = '1';

    const tip = button.querySelector('.tooltip-text');
    button.addEventListener('click', () => {
      const text = button.dataset.copy || '';
      navigator.clipboard.writeText(text)
        .then(() => {
          if (tip) {
            const originalText = tip.textContent;
            tip.textContent = 'Copied!';
            button.classList.add('copied');
            setTimeout(() => {
              tip.textContent = originalText || 'Copy';
              button.classList.remove('copied');
            }, 1200);
          }
        })
        .catch(err => console.error('Failed to copy text: ', err));
    });
  });
}

// This function handles image fallbacks
function initializeImageFallbacks() {
  const profilePic = document.querySelector('img.profile-picture');
  if (profilePic) {
    // The { once: true } option automatically removes the listener after it runs once, preventing the loop.
    profilePic.addEventListener('error', () => {
      profilePic.src = 'https://placehold.co/180x180/00529B/FFFFFF?text=RG';
    }, { once: true });
  }
}

function initializeTooltips() {
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.tooltip-wrapper')) {
      document.querySelectorAll('.tooltip-wrapper.is-active').forEach(wrapper => {
        wrapper.classList.remove('is-active');
      });
    }
  });
}

export function setActiveNavLink(currentPath = location.pathname) {
  const normalize = (p) => (p || '').replace(location.origin, '').split(/[?#]/)[0].replace(/\/index\.html$/i, '/') || '/';
  const current = normalize(currentPath);

  document.querySelectorAll('nav a, #navigation-menu a, header a[data-nav], .site-nav a').forEach((a) => {
    const href = a.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto:')) {
      a.classList.remove('active', 'is-active');
      a.removeAttribute('aria-current');
      return;
    }

    let linkPath = href;
    try { linkPath = new URL(href, location.origin).pathname; } catch {}
    const link = normalize(linkPath);
    const isActive = link === current;

    a.classList.toggle('active', isActive);
    a.classList.toggle('is-active', isActive);

    if (isActive) {
      a.setAttribute('aria-current', 'page');
    } else {
      a.removeAttribute('aria-current');
    }
  });
}

function updateCopyrightYear() {
  const yearSpan = document.getElementById('copyright-year');
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }
}

/**
 * The main UI initialization function.
 */
export function initializeUI() {
  initializeHeader();
  initializeTheme();
  initializeScrollToTop();
  initializeTooltips();
  updateCopyrightYear();
  initializeImageFallbacks(); // Call the new function here

  if (document.getElementById('currentDate')) {
    updateClock();
    setInterval(updateClock, 1000);
  }
  if (document.querySelector('.copy-button')) {
    initializeContactPage();
  }
}