import { loadJourneyData } from './data.js';
import { initializeDashboard } from './dashboard.js';
import { initializeTimeline } from './timeline.js';
import { initializeUI, showUpdateToast } from './ui.js';
import { initializeRouter } from './router.js';
import { initializeDocumentsPage } from './documents.js';

function showConfigError() {
  const errorBanner = document.createElement('div');
  errorBanner.className = 'config-error-banner';
  errorBanner.textContent = '⚠️ Could not load live configuration. Displaying default data. Some information may be outdated.';
  document.body.prepend(errorBanner);
  
  const style = document.createElement('style');
  style.textContent = `
    .config-error-banner {
      background-color: #D32F2F;
      color: white;
      text-align: center;
      padding: 0.75rem;
      font-weight: 500;
      font-size: 0.9rem;
    }
  `;
  document.head.appendChild(style);
}

function showErrorBoundary(message) {
  const container = document.querySelector('.main-content');
  if (container) {
    container.innerHTML = `<div class="card"><div class="card-header"><i class="fas fa-exclamation-triangle"></i> Application Error</div><p>${message}</p></div>`;
    container.classList.remove('fade-out');
  }
}

async function fetchConfig() {
  try {
    const res = await fetch('data/config.json', { credentials: 'same-origin' });
    if (!res.ok) throw new Error(`Failed to load config: ${res.statusText}`);
    return await res.json();
  } catch (e) {
    console.error('Config load failed, falling back to defaults', e);
    showConfigError();
    return {
      userDOB: '2001-05-18',
      journeyStartDate: '2025-02-15',
      initialVisaExpiryDate: '2027-02-15',
      finalVisaExpiryDate: '2028-02-15',
      pointsTarget: 95,
      dataVersion: 1
    };
  }
}

async function initializeApp() {
  try {
    if ('serviceWorker' in navigator) {
      if (import.meta && import.meta.env && import.meta.env.PROD) {
        // Register the service worker
        const registration = await navigator.serviceWorker.register('/sw.js');

        // This is the robust way to detect updates.
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              // The new worker has successfully installed and is waiting to activate.
              // We check for `navigator.serviceWorker.controller` to ensure this isn't the first install.
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                showUpdateToast();
              }
            });
          }
        });
      } else {
        // Unregister any active service workers in development mode.
        try {
          const regs = await navigator.serviceWorker.getRegistrations();
          for (const r of regs) { await r.unregister().catch(()=>{}); }
        } catch {}
      }
    }

    initializeUI();

    const config = await fetchConfig();
    const { milestones, costData } = await loadJourneyData(config);

    const runPageScripts = (path) => {
      initializeUI();
      if (document.querySelector('.key-metrics-panel')) {
        initializeDashboard(milestones, costData, config);
      }
      if (document.getElementById('timeline')) {
        initializeTimeline(milestones);
      }
      if (document.querySelector('.document-table')) {
        initializeDocumentsPage();
      }
    };

    initializeRouter(runPageScripts);
  } catch (error) {
    console.error('Fatal error during application initialization:', error);
    showErrorBoundary('Could not load the application due to a critical error. Please try refreshing the page.');
  }
}

document.addEventListener('DOMContentLoaded', initializeApp);