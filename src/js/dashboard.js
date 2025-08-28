import { todayForCalculations, calcDays, escapeHTML } from './utils.js';

// New: Milestone Notification Function
function checkUpcomingMilestones(milestones) {
  const upcoming = milestones.filter(m => {
    const daysUntil = calcDays(todayForCalculations, new Date(m.date));
    return daysUntil > 0 && daysUntil <= 7;
  });

  if (upcoming.length > 0 && 'Notification' in window && Notification.permission !== 'denied') {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        upcoming.forEach(m => {
          const days = calcDays(todayForCalculations, new Date(m.date));
          new Notification('Upcoming PR Milestone', {
            body: `${m.title} is in ${days} day(s).`,
            icon: '/assets/android-chrome-192x192.png'
          });
        });
      }
    });
  }
}

export function initializeDashboard(milestones, costData, config) {
  const dashboardContainer = document.querySelector('.main-content');
  if (!dashboardContainer) return;

  let state = { points: {}, costs: {} };
  const D = (id) => dashboardContainer.querySelector(`#${id}`);

  const elements = {
    currentPoints: D('currentPoints'),
    pointsProgress: D('pointsProgress'),
    pointsBreakdown: D('points-breakdown'),
    currentTotalPoints: D('currentTotalPoints'),
    costTracker: D('cost-tracker'),
    totalCostSpent: D('total_cost_spent'),
    totalSpentDisplay: D('totalSpentDisplay'),
    totalBudgetDisplay: D('totalBudgetDisplay'),
    investmentProgress: D('investmentProgress'),
    daysRemaining: D('daysRemaining'),
    visaStatus: D('visaStatus'),
    visaTimeProgress: D('visaTimeProgress'),
    nextMilestoneCountdown: D('nextMilestoneCountdown'),
    nextMilestoneTitle: D('nextMilestoneTitle'),
    milestoneProgress: D('milestoneProgress'),
    alertsContainer: D('alertsContainer'),
    pointsTargetDisplay: D('pointsTargetDisplay'),
  };

  function saveState() {
    try { localStorage.setItem('prDashboardState', JSON.stringify(state)); } catch {}
  }

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem('prDashboardState') || '{}');
      if (typeof saved !== 'object' || !saved) return { points: {}, costs: {} };
      return { points: {}, costs: {}, ...saved };
    } catch (e) {
      return { points: {}, costs: {} };
    }
  }

  // Helper function to handle checkbox interactions
  function addCheckboxListeners(container, stateKey, renderFn) {
    container.querySelectorAll('.interactive-checkbox:not(:disabled)').forEach(box => {
      box.addEventListener('change', (e) => {
        const id = e.target.dataset.id;
        state[stateKey][id] = !!e.target.checked;
        saveState();
        renderFn();
      });
    });
  }
  
  const formatCurrency = (val) => new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', minimumFractionDigits: 0 }).format(val);

  const calculateAge = (dob) => {
    const birthDate = new Date(dob);
    let age = todayForCalculations.getFullYear() - birthDate.getFullYear();
    const m = todayForCalculations.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && todayForCalculations.getDate() < birthDate.getDate())) age--;
    return age;
  };

  function getPointsData() {
    const age = calculateAge(config.userDOB);
    const dob = new Date(config.userDOB);
    const year25 = dob.getFullYear() + 25;
    const month = dob.getMonth();
    const day = dob.getDate();
    const birthday25 = new Date(year25, month, day);

    const jrpCompletionMilestone = milestones.find(m => m.id === 'jrp_complete');
    const workExpAchievedDate = jrpCompletionMilestone ? jrpCompletionMilestone.date : null;

    return [
      {
        id: 'age', label: 'Age', points: 30, currentPoints: age < 25 ? 25 : 30,
        achievedDate: age >= 25 ? birthday25.toISOString().slice(0,10) : null,
        tooltip: 'Points based on age at time of invitation.' },
      { id: 'english', label: 'Superior English', points: 20, currentPoints: 10, tooltip: 'Superior (e.g., IELTS 8 or equivalent in each PTE component) vs Proficient.' },
      { id: 'work_exp', label: '1 Year Aus Work Exp', points: 5, currentPoints: 0, achievedDate: workExpAchievedDate, tooltip: 'Achieved after completing the 12-month Job Ready Program.' },
      { id: 'degree', label: 'Bachelor Degree', points: 15, currentPoints: 15, initial: true, tooltip: 'Points for your Bachelor of IT degree from Griffith University.' },
      { id: 'study_req', label: 'Australian Study Req', points: 5, currentPoints: 5, initial: true, tooltip: 'Two academic years of study in Australia.' },
      { id: 'naati', label: 'Community Language', points: 5, currentPoints: 0, tooltip: 'NAATI CCL (Hindi).' },
      { id: 'regional', label: 'Regional Study', points: 5, currentPoints: 5, initial: true, tooltip: 'Studied in a designated regional area.' },
      { id: 'single', label: 'Single Applicant', points: 10, currentPoints: 10, initial: true, tooltip: 'Applying as a single applicant.' },
    ];
  }

  function renderPoints() {
    const pointsData = getPointsData();
    let currentTotal = 0;
    elements.pointsBreakdown.innerHTML = pointsData.map(p => {
      const isAchievedByDate = p.achievedDate && new Date(p.achievedDate) <= todayForCalculations;
      const isChecked = !!state.points[p.id] || isAchievedByDate || !!p.initial;
      const displayPoints = isChecked ? p.points : (p.currentPoints || 0);
      currentTotal += displayPoints;
      return `<div class="points-item">
        <input type="checkbox" class="interactive-checkbox" id="check_${escapeHTML(p.id)}" data-id="${escapeHTML(p.id)}" ${isChecked ? 'checked' : ''} ${isAchievedByDate ? 'disabled' : ''}>
        <label for="check_${escapeHTML(p.id)}" class="item-label">${escapeHTML(p.label)}</label>
        <div class="tooltip-wrapper">
          <span class="tooltip" aria-label="More info">(i)</span>
          <div class="tooltiptext">${escapeHTML(p.tooltip)}</div>
        </div>
        <span class="points-value ${isChecked ? 'points-achieved' : 'points-pending'}">${displayPoints}</span>
      </div>`;
    }).join('');

    elements.currentTotalPoints.textContent = currentTotal;
    elements.currentPoints.textContent = currentTotal;
    elements.pointsProgress.style.width = `${Math.min(100, (currentTotal / config.pointsTarget) * 100)}%`;

    const wrap = D('points-breakdown');
    if (wrap) {
      addCheckboxListeners(wrap, 'points', renderPoints);
      wrap.querySelectorAll('.tooltip-wrapper').forEach(wrapper => {
        wrapper.addEventListener('click', (e) => {
          document.querySelectorAll('.tooltip-wrapper.is-active').forEach(w => {
            if (w !== wrapper) w.classList.remove('is-active');
          });
          wrapper.classList.toggle('is-active');
        });
      });
    }
  }

  function renderCosts() {
    const totalBudget = costData.reduce((acc, item) => acc + item.amount, 0);
    let totalSpent = 0;

    elements.costTracker.innerHTML = costData.map(c => {
      const isPaid = c.paid === true;
      const isChecked = isPaid || !!state.costs[c.id];
      if (isChecked) {
        totalSpent += c.amount;
      }
      return `<div class="cost-item">
          <input type="checkbox" class="interactive-checkbox" id="cost_${escapeHTML(c.id)}" data-id="${escapeHTML(c.id)}" ${isChecked ? 'checked' : ''} ${isPaid ? 'disabled' : ''}>
          <label for="cost_${escapeHTML(c.id)}">${escapeHTML(c.label)}</label>
          <span>${formatCurrency(c.amount)}</span>
        </div>`;
    }).join('');

    elements.totalCostSpent.textContent = formatCurrency(totalSpent);
    elements.totalSpentDisplay.textContent = formatCurrency(totalSpent);
    elements.totalBudgetDisplay.textContent = `Budget: ${formatCurrency(totalBudget)}`;
    elements.investmentProgress.style.width = totalBudget > 0 ? `${Math.min(100, (totalSpent / totalBudget) * 100)}%` : '0%';

    const wrap = D('cost-tracker');
    if (wrap) {
      addCheckboxListeners(wrap, 'costs', renderCosts);
    }
  }

  function updateMetrics() {
    const extensionMilestone = milestones.find(m => m.id === 'visa_extend');
    const extensionApplied = extensionMilestone && new Date(extensionMilestone.date) <= todayForCalculations;
    const activeExpiryDate = extensionApplied ? config.finalVisaExpiryDate : config.initialVisaExpiryDate;

    const daysLeft = calcDays(todayForCalculations, activeExpiryDate);
    elements.daysRemaining.textContent = daysLeft > 0 ? daysLeft : 'BVA';
    elements.visaStatus.textContent = extensionApplied ? 'Expires Feb 2028 (Ext. Active)' : 'Expires Feb 2027 (Ext. Pending)';

    const totalVisaDuration = Math.max(1, calcDays(config.journeyStartDate, activeExpiryDate));
    const visaTimeUsed = Math.max(0, calcDays(config.journeyStartDate, todayForCalculations));
    elements.visaTimeProgress.style.width = `${Math.min(100, (visaTimeUsed / totalVisaDuration) * 100)}%`;

    if (elements.pointsTargetDisplay) {
      elements.pointsTargetDisplay.textContent = `Target: ${config.pointsTarget}`;
    }

    const futureMilestones = milestones.filter(m => new Date(m.date) > todayForCalculations);
    if (futureMilestones.length > 0) {
      const nextM = futureMilestones[0];
      elements.nextMilestoneCountdown.textContent = calcDays(todayForCalculations, nextM.date);
      elements.nextMilestoneTitle.textContent = escapeHTML((nextM.title || '').replace(/[^\w\s]/gi, '').trim());

      const prevIndex = Math.max(0, milestones.findIndex(m => m.id === nextM.id) - 1);
      const prevMDate = prevIndex >= 0 ? new Date(milestones[prevIndex].date) : new Date(config.journeyStartDate);
      const totalDaysBetween = Math.max(1, calcDays(prevMDate, nextM.date));
      const daysElapsed = Math.max(0, calcDays(prevMDate, todayForCalculations));
      elements.milestoneProgress.style.width = `${Math.min(100, (daysElapsed / totalDaysBetween) * 100)}%`;
    } else {
      elements.nextMilestoneCountdown.textContent = '—';
      elements.nextMilestoneTitle.textContent = 'All milestones completed';
      elements.milestoneProgress.style.width = '100%';
    }
  }

  function updateAlerts() {
    const extensionMilestone = milestones.find(m => m.id === 'visa_extend');
    const extensionApplied = extensionMilestone && new Date(extensionMilestone.date) <= todayForCalculations;
    const activeExpiryDate = extensionApplied ? config.finalVisaExpiryDate : config.initialVisaExpiryDate;
    const daysLeft = calcDays(todayForCalculations, activeExpiryDate);

    let alerts = [];

    const currentM = milestones.find(m => {
      const mDate = new Date(m.date);
      return mDate >= todayForCalculations && calcDays(todayForCalculations, mDate) <= 14;
    });
    if (currentM) alerts.push({ type: 'info', msg: `<strong>Upcoming:</strong> ${escapeHTML(currentM.title)}. This is happening now or in the next two weeks!` });

    if (daysLeft < 90 && daysLeft > 0) alerts.push({ type: 'warning', msg: '<strong>Visa alert:</strong> Less than 90 days remaining on your current visa. Ensure next steps are taken!' });
    else if (daysLeft < 365 && daysLeft > 0) alerts.push({ type: 'info', msg: '<strong>Visa alert:</strong> Less than one year remaining on your current visa.' });

    if (alerts.length === 0) alerts.push({ type: 'success', msg: 'All systems are green. You are on track!' });

    elements.alertsContainer.innerHTML = alerts.map(a => {
      const cls = a.type === 'success' ? 'alert-success' :
                  a.type === 'warning' ? 'alert-warning' :
                  a.type === 'error'   ? 'alert-error'   : 'alert-info';
      return `<div class="alert ${cls}"><i class="fas fa-info-circle" aria-hidden="true"></i>${a.msg}</div>`;
    }).join('');
  }

  function initializeResetButtons() {
    const handleReset = (type) => {
      const message = type === 'points'
        ? 'Are you sure you want to reset the points calculator?'
        : 'Are you sure you want to reset the investment tracker?';
      if (confirm(message)) {
        if (type === 'points') {
          state.points = {};
          renderPoints();
        } else if (type === 'costs') {
          state.costs = {};
          renderCosts();
        }
        saveState();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };
  
    const resetBtn1 = D('resetDataBtn');
    const resetBtn2 = D('resetDataBtn2');
    if (resetBtn1) {
      resetBtn1.addEventListener('click', () => handleReset('points'));
      resetBtn1.title = 'Reset Points Calculator';
    }
    if (resetBtn2) {
      resetBtn2.addEventListener('click', () => handleReset('costs'));
      resetBtn2.title = 'Reset Investment Tracker';
    }
  }

  state = loadState();
  renderPoints();
  renderCosts();
  updateMetrics();
  updateAlerts();
  initializeResetButtons();
  checkUpcomingMilestones(milestones); // Add this call at the end
  
  // New: Remove skeletons and show content after initialization
  dashboardContainer.querySelectorAll('.skeleton-item').forEach(el => el.remove());
  dashboardContainer.querySelectorAll('.metric-item, #points-breakdown > *, #cost-tracker > *').forEach(el => {
    if(el.style.display === 'none') el.style.display = '';
  });
}