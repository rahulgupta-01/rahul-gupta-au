import { state, setState } from '../store.js';
import { todayForCalculations, escapeHTML, animateCountUp, animateProgressBar } from '../utils.js';

function addCheckboxListeners(container, stateKey) {
  container.querySelectorAll('.interactive-checkbox:not(:disabled)').forEach(box => {
    box.addEventListener('change', (e) => {
      const id = e.target.dataset.id;
      const updatedStateSlice = { ...state[stateKey], [id]: !!e.target.checked };
      setState({ [stateKey]: updatedStateSlice });
    });
  });
}

const calculateAge = (dob) => {
  const birthDate = new Date(dob);
  let age = todayForCalculations.getFullYear() - birthDate.getFullYear();
  const m = todayForCalculations.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && todayForCalculations.getDate() < birthDate.getDate())) age--;
  return age;
};

function getProcessedPointsData(pointsData, milestones, config) {
  const age = calculateAge(config.userDOB);
  const dob = new Date(config.userDOB);
  const jrpCompletionMilestone = milestones.find(m => m.id === 'jrp_complete');

  return pointsData.map(p => {
      const processedPoint = {...p};
      if (p.achievedDate === 'BIRTHDAY_25') {
          const year25 = dob.getFullYear() + 25;
          const month = dob.getMonth();
          const day = dob.getDate();
          processedPoint.achievedDate = new Date(year25, month, day).toISOString().slice(0, 10);
          processedPoint.currentPoints = age < 25 ? 25 : 30;
      }
      if (p.achievedDate === 'JRP_COMPLETE') {
          processedPoint.achievedDate = jrpCompletionMilestone ? jrpCompletionMilestone.date : null;
      }
      return processedPoint;
  });
}

export function renderPoints(pointsData, milestones, config, elements) {
  const processedPointsData = getProcessedPointsData(pointsData, milestones, config);
  let currentTotal = 0;
  elements.pointsBreakdown.innerHTML = processedPointsData.map(p => {
    const isAchievedByDate = p.achievedDate && new Date(p.achievedDate) <= todayForCalculations;
    const isChecked = !!state.points[p.id] || isAchievedByDate || !!p.initial;
    const displayPoints = isChecked ? p.points : (p.currentPoints || 0);
    currentTotal += displayPoints;
    const valueModifier = isChecked ? 'points-calculator__value--achieved' : 'points-calculator__value--pending';
    return `<div class="points-calculator__item">
      <input type="checkbox" class="interactive-checkbox" id="check_${escapeHTML(p.id)}" data-id="${escapeHTML(p.id)}" ${isChecked ? 'checked' : ''} ${isAchievedByDate ? 'disabled' : ''}>
      <label for="check_${escapeHTML(p.id)}" class="points-calculator__label">${escapeHTML(p.label)}</label>
      <div class="tooltip-wrapper">
        <span class="tooltip" aria-label="More info">(i)</span>
        <div class="tooltip-text">${escapeHTML(p.tooltip)}</div>
      </div>
      <span class="points-calculator__value ${valueModifier}">${displayPoints}</span>
    </div>`;
  }).join('');

  elements.currentTotalPoints.textContent = currentTotal;
  animateCountUp(elements.currentPoints, currentTotal);
  const pointsWidth = `${Math.min(100, (currentTotal / config.pointsTarget) * 100)}%`;
  animateProgressBar(elements.pointsProgress, pointsWidth);

  if (elements.pointsBreakdown) {
    addCheckboxListeners(elements.pointsBreakdown, 'points');
    elements.pointsBreakdown.querySelectorAll('.tooltip-wrapper').forEach(wrapper => {
      wrapper.addEventListener('click', (e) => {
        document.querySelectorAll('.tooltip-wrapper.is-active').forEach(w => {
          if (w !== wrapper) w.classList.remove('is-active');
        });
        wrapper.classList.toggle('is-active');
      });
    });
  }
}
