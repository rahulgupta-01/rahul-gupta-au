// Get the current date string (YYYY-MM-DD) for the Perth time zone.
const perthDateString = new Date().toLocaleDateString('sv-SE', { timeZone: 'Australia/Perth' });

// Create a new date object representing midnight in Perth on the current day.
export const todayForCalculations = new Date(perthDateString);

// Calculate day difference between two dates (date strings or Date objects).
export const calcDays = (d1, d2) => Math.round((new Date(d2) - new Date(d1)) / (1000 * 60 * 60 * 24));

// Basic HTML escaping to prevent XSS when injecting text from JSON.
export function escapeHTML(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Function to animate a number counting up
export function animateCountUp(element, endValue, duration = 800) {
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    element.textContent = Math.floor(progress * endValue).toLocaleString();
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };
  window.requestAnimationFrame(step);
}

// Function to animate a currency value counting up
export function animateCurrencyUp(element, endValue, formatter, duration = 800) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const currentValue = Math.floor(progress * endValue);
        element.textContent = formatter(currentValue);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// Helper function to trigger progress bar animations reliably
export function animateProgressBar(element, widthPercentage) {
  setTimeout(() => {
    if (element) {
      element.style.width = widthPercentage;
      element.style.transform = 'scaleX(1)';
    }
  }, 100);
}
