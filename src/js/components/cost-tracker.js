import { state, setState } from '../store.js';
import { escapeHTML, animateCurrencyUp, animateProgressBar } from '../utils.js';

function addCheckboxListeners(container, stateKey) {
  container.querySelectorAll('.interactive-checkbox:not(:disabled)').forEach(box => {
    box.addEventListener('change', (e) => {
      const id = e.target.dataset.id;
      const updatedStateSlice = { ...state[stateKey], [id]: !!e.target.checked };
      setState({ [stateKey]: updatedStateSlice });
    });
  });
}

const formatCurrency = (val) => new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', minimumFractionDigits: 0 }).format(val);

export function renderCosts(costData, elements) {
  const totalBudget = costData.reduce((acc, item) => acc + item.amount, 0);
  let totalSpent = 0;

  elements.costTracker.innerHTML = costData.map(c => {
    const isPaid = c.paid === true;
    const isChecked = isPaid || !!state.costs[c.id];
    if (isChecked) {
      totalSpent += c.amount;
    }
    return `<div class="cost-tracker__item">
        <input type="checkbox" class="interactive-checkbox" id="cost_${escapeHTML(c.id)}" data-id="${escapeHTML(c.id)}" ${isChecked ? 'checked' : ''} ${isPaid ? 'disabled' : ''}>
        <label for="cost_${escapeHTML(c.id)}" class="cost-tracker__label">${escapeHTML(c.label)}</label>
        <span>${formatCurrency(c.amount)}</span>
      </div>`;
  }).join('');

  elements.totalCostSpent.textContent = formatCurrency(totalSpent);
  animateCurrencyUp(elements.totalSpentDisplay, totalSpent, formatCurrency);
  elements.totalBudgetDisplay.textContent = `Budget: ${formatCurrency(totalBudget)}`;
  const investmentWidth = totalBudget > 0 ? `${Math.min(100, (totalSpent / totalBudget) * 100)}%` : '0%';
  animateProgressBar(elements.investmentProgress, investmentWidth);

  if (elements.costTracker) {
    addCheckboxListeners(elements.costTracker, 'costs');
  }
}
