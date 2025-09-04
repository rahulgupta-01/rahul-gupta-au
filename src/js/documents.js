import { escapeHTML } from './utils.js';

function renderDocuments(documents) {
  const tableBody = document.querySelector('.document-table tbody');
  if (!tableBody) return;

  tableBody.innerHTML = documents.map(doc => {
    let statusModifier = '';
    if (doc.status === 'Obtained') {
      statusModifier = 'status-badge--green';
    } else if (doc.status === 'Booked') {
      statusModifier = 'status-badge--orange';
    } else if (doc.status === 'Required') {
      statusModifier = 'status-badge--red';
    }

    return `
      <tr>
        <td data-label="Document"><i class="fas ${escapeHTML(doc.icon)}"></i> ${escapeHTML(doc.document)}</td>
        <td data-label="Status"><span class="status-badge ${statusModifier}">${escapeHTML(doc.status)}</span></td>
        <td data-label="Notes / Expiry">${escapeHTML(doc.notes)}</td>
      </tr>
    `;
  }).join('');
}

export async function initializeDocumentsPage() {
  try {
    const res = await fetch('/data/documents.json');
    if (!res.ok) throw new Error('Failed to load documents data');
    const documents = await res.json();
    renderDocuments(documents);
  } catch (error) {
    console.error('Could not initialize documents page:', error);
  }
}
