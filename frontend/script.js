const API_URL = '/api/services';
const form = document.getElementById('add-form');
const grid = document.getElementById('services-grid');
const emptyState = document.getElementById('empty-state');
const countTotal = document.getElementById('count-total');
const countUp = document.getElementById('count-up');
const countDown = document.getElementById('count-down');
const clockEl = document.getElementById('clock');

// Horloge UTC live (renforce l'ambiance "salle de contrôle")
function tickClock() {
  const now = new Date();
  clockEl.textContent = now.toISOString().slice(11, 19);
}
setInterval(tickClock, 1000);
tickClock();

loadServices();

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('name').value;
  const url = document.getElementById('url').value;

  await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, url })
  });

  form.reset();
  loadServices();
});

async function loadServices() {
  const res = await fetch(API_URL);
  const services = await res.json();

  grid.innerHTML = '';
  emptyState.hidden = services.length > 0;

  let upCount = 0;
  let downCount = 0;

  services.forEach(service => {
    const statusKey = service.status === 'UP' ? 'up'
      : service.status === 'DOWN' ? 'down'
      : 'unknown';

    if (statusKey === 'up') upCount++;
    if (statusKey === 'down') downCount++;

    const lastChecked = service.last_checked
      ? new Date(service.last_checked).toLocaleString('fr-FR')
      : 'jamais vérifié';

    const card = document.createElement('div');
    card.className = 'service-card';
    card.innerHTML = `
      <div class="card-top">
        <div>
          <div class="service-name">${escapeHtml(service.name)}</div>
          <span class="service-url">${escapeHtml(service.url)}</span>
        </div>
        <div class="signal ${statusKey}" title="${service.status}"></div>
      </div>
      <div class="card-bottom">
        <div>
          <div class="status-text ${statusKey}">${service.status}</div>
          <div class="last-checked">${lastChecked}</div>
        </div>
        <div class="card-actions">
          <button class="action-btn check-btn" data-id="${service.id}" data-action="check">Vérifier</button>
          <button class="action-btn delete-btn" data-id="${service.id}" data-action="delete">Suppr.</button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });

  countTotal.textContent = services.length;
  countUp.textContent = upCount;
  countDown.textContent = downCount;
}

grid.addEventListener('click', async (e) => {
  const btn = e.target.closest('.action-btn');
  if (!btn) return;

  const id = btn.dataset.id;
  const action = btn.dataset.action;

  if (action === 'check') {
    btn.textContent = '...';
    btn.classList.add('checking');
    await fetch(`${API_URL}/${id}/check`, { method: 'POST' });
    loadServices();
  } else if (action === 'delete') {
    await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    loadServices();
  }
});

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}