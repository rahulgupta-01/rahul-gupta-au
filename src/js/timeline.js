import { todayForCalculations } from './utils.js';

function renderTimeline(milestones, filter = 'all') {
    const timelineEl = document.getElementById('timeline');
    if (!timelineEl) return;

    const visibleMilestones = milestones.filter(m => filter === 'all' || m.phase === filter);
    const lastCompletedIndex = visibleMilestones.findLastIndex(m => new Date(m.date + "T00:00:00") <= todayForCalculations);
    const progressPercent = lastCompletedIndex >= 0 ? ((lastCompletedIndex + 1) / visibleMilestones.length) * 100 : 0;

    timelineEl.innerHTML = `<div id="timeline-progress-fill" class="timeline__progress-fill" style="height: ${progressPercent}%"></div>` + visibleMilestones.map(m => {
        const milestoneDate = new Date(m.date + "T00:00:00");
        const isCompleted = milestoneDate <= todayForCalculations;
        const displayDate = milestoneDate.toLocaleDateString('en-AU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Australia/Perth' });
        const iconModifier = isCompleted ? 'timeline__icon--completed' : 'timeline__icon--future';
        const iconGlyph = isCompleted ? 'fa-check' : 'fa-hourglass-start';
        
        return `
            <div class="timeline__milestone" data-phase="${m.phase}">
                <div class="timeline__header" data-id="${m.id}" aria-expanded="false" aria-controls="details_${m.id}">
                    <div class="timeline__icon ${iconModifier}">
                        <i class="fas ${iconGlyph}"></i>
                    </div>
                    <div class="timeline__content">
                        <div class="timeline__title">${m.title}</div>
                        <div class="timeline__date">${displayDate}</div>
                    </div>
                </div>
                <div class="timeline__details" id="details_${m.id}"><p>${m.details}</p></div>
            </div>`;
    }).join('');

    document.querySelectorAll('.timeline__header').forEach(header => {
        const action = (e) => {
            const detailsEl = document.getElementById(`details_${e.currentTarget.dataset.id}`);
            const isExpanded = detailsEl.classList.toggle('timeline__details--visible');
            e.currentTarget.setAttribute('aria-expanded', isExpanded);

            if (isExpanded) {
                e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        };

        header.addEventListener('click', action);
    });
}

export function initializeTimeline(milestones) {
    renderTimeline(milestones);
    const toggleBtnGroup = document.querySelector('.toggle-buttons');
    if (toggleBtnGroup) {
        toggleBtnGroup.querySelectorAll('.toggle-buttons__button').forEach(btn => {
            btn.setAttribute('aria-pressed', btn.classList.contains('active') ? 'true' : 'false');
        });

        toggleBtnGroup.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON') {
                document.querySelectorAll('.toggle-buttons__button').forEach(btn => {
                  btn.classList.remove('active');
                  btn.setAttribute('aria-pressed', 'false');
                });
                e.target.classList.add('active');
                e.target.setAttribute('aria-pressed', 'true');
                renderTimeline(milestones, e.target.dataset.phase);
            }
        });
    }
}
