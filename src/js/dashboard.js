import { setState, subscribe } from './store.js';
import { renderPoints } from './components/points-calculator.js';
import { renderCosts } from './components/cost-tracker.js';
import { updateMetrics, updateAlerts } from './components/dashboard-metrics.js';

export function initializeDashboard(milestones, costData, pointsData, config) {
  const dashboardContainer = document.querySelector('.main-content');
  if (!dashboardContainer) return;

  const elements = {
    currentPoints: dashboardContainer.querySelector('#currentPoints'),
    pointsProgress: dashboardContainer.querySelector('#pointsProgress'),
    pointsBreakdown: dashboardContainer.querySelector('#points-breakdown'),
    currentTotalPoints: dashboardContainer.querySelector('#currentTotalPoints'),
    costTracker: dashboardContainer.querySelector('#cost-tracker'),
    totalCostSpent: dashboardContainer.querySelector('#total_cost_spent'),
    totalSpentDisplay: dashboardContainer.querySelector('#totalSpentDisplay'),
    totalBudgetDisplay: dashboardContainer.querySelector('#totalBudgetDisplay'),
    investmentProgress: dashboardContainer.querySelector('#investmentProgress'),
    daysRemaining: dashboardContainer.querySelector('#daysRemaining'),
    visaStatus: dashboardContainer.querySelector('#visaStatus'),
    visaTimeProgress: dashboardContainer.querySelector('#visaTimeProgress'),
    nextMilestoneCountdown: dashboardContainer.querySelector('#nextMilestoneCountdown'),
    nextMilestoneTitle: dashboardContainer.querySelector('#nextMilestoneTitle'),
    milestoneProgress: dashboardContainer.querySelector('#milestoneProgress'),
    alertsContainer: dashboardContainer.querySelector('#alertsContainer'),
    pointsTargetDisplay: dashboardContainer.querySelector('#pointsTargetDisplay'),
    resetDataBtn: dashboardContainer.querySelector('#resetDataBtn'),
    resetDataBtn2: dashboardContainer.querySelector('#resetDataBtn2')
  };

  function initializeResetButtons() {
    const handleReset = (type) => {
      const message = `Are you sure you want to reset the ${type} tracker?`;
      if (confirm(message)) {
        setState({ [type]: {} });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    if (elements.resetDataBtn) {
      elements.resetDataBtn.addEventListener('click', () => handleReset('points'));
      elements.resetDataBtn.title = 'Reset Points Calculator';
    }
    if (elements.resetDataBtn2) {
      elements.resetDataBtn2.addEventListener('click', () => handleReset('costs'));
      elements.resetDataBtn2.title = 'Reset Investment Tracker';
    }
  }

  subscribe(() => {
    renderPoints(pointsData, milestones, config, elements);
    renderCosts(costData, elements);
  });

  renderPoints(pointsData, milestones, config, elements);
  renderCosts(costData, elements);
  updateMetrics(milestones, config, elements);
  updateAlerts(milestones, config, elements);
  initializeResetButtons();

  dashboardContainer.querySelectorAll('.skeleton-item').forEach(el => el.remove());
  dashboardContainer.querySelectorAll('.key-metrics__item, .points-calculator__item, .cost-tracker__item').forEach(el => {
    if(el.style.display === 'none') el.style.display = '';
  });
}
