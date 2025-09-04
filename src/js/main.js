// src/js/main.js
import { loadJourneyData } from './data.js';
import { initializeDashboard } from './dashboard.js';
import { initializeTimeline } from './timeline.js';
import { initializeUI } from './ui.js';
import { initializeRouter } from './router.js';
import { initializeDocumentsPage } from './documents.js';
import { defaultConfig } from './config.default.js';

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
    return defaultConfig;
  }
}

async function initializeApp() {
  try {
    initializeUI();

    const config = await fetchConfig();
    const { milestones, costData, pointsData } = await loadJourneyData(config);

    const runPageScripts = (path) => {
      initializeUI();
      // This is the corrected line:
      if (document.querySelector('.key-metrics')) {
        initializeDashboard(milestones, costData, pointsData, config);
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
