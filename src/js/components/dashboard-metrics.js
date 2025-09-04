import { todayForCalculations, calcDays, escapeHTML, animateCountUp, animateProgressBar } from '../utils.js';

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

export function updateMetrics(milestones, config, elements) {
  const extensionMilestone = milestones.find(m => m.id === 'visa_extend');
  const extensionApplied = extensionMilestone && new Date(extensionMilestone.date) <= todayForCalculations;
  const activeExpiryDate = extensionApplied ? config.finalVisaExpiryDate : config.initialVisaExpiryDate;

  const daysLeft = calcDays(todayForCalculations, activeExpiryDate);
  if (daysLeft > 0) {
      animateCountUp(elements.daysRemaining, daysLeft);
  } else {
      elements.daysRemaining.textContent = 'BVA';
  }
  elements.visaStatus.textContent = extensionApplied ? 'Expires Feb 2028 (Ext. Active)' : 'Expires Feb 2027 (Ext. Pending)';

  const totalVisaDuration = Math.max(1, calcDays(config.journeyStartDate, activeExpiryDate));
  const visaTimeUsed = Math.max(0, calcDays(config.journeyStartDate, todayForCalculations));
  const visaWidth = `${Math.min(100, (visaTimeUsed / totalVisaDuration) * 100)}%`;
  animateProgressBar(elements.visaTimeProgress, visaWidth);

  if (elements.pointsTargetDisplay) {
    elements.pointsTargetDisplay.textContent = `Target: ${config.pointsTarget}`;
  }

  // This is the corrected line:
  const futureMilestones = milestones.filter(m => new Date(m.date) > todayForCalculations);
  if (futureMilestones.length > 0) {
    const nextM = futureMilestones[0];
    const daysToNext = calcDays(todayForCalculations, nextM.date);
    animateCountUp(elements.nextMilestoneCountdown, daysToNext);
    elements.nextMilestoneTitle.textContent = escapeHTML((nextM.title || '').trim());

    const prevIndex = Math.max(0, milestones.findIndex(m => m.id === nextM.id) - 1);
    const prevMDate = prevIndex >= 0 ? new Date(milestones[prevIndex].date) : new Date(config.journeyStartDate);
    const totalDaysBetween = Math.max(1, calcDays(prevMDate, nextM.date));
    const daysElapsed = Math.max(0, calcDays(prevMDate, todayForCalculations));
    const milestoneWidth = `${Math.min(100, (daysElapsed / totalDaysBetween) * 100)}%`;
    animateProgressBar(elements.milestoneProgress, milestoneWidth);
  } else {
    elements.nextMilestoneCountdown.textContent = '—';
    elements.nextMilestoneTitle.textContent = 'All milestones completed';
    animateProgressBar(elements.milestoneProgress, '100%');
  }

  checkUpcomingMilestones(milestones);
}

export function updateAlerts(milestones, config, elements) {
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
    const cls = a.type === 'success' ? 'alert--success' :
                a.type === 'warning' ? 'alert--warning' :
                a.type === 'error'   ? 'alert--error'   : 'alert--info';
    return `<div class="alert ${cls}"><i class="fas fa-info-circle" aria-hidden="true"></i>${a.msg}</div>`;
  }).join('');
}
