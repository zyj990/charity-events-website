// event.js — read ?id= from URL, fetch event detail, render page + modal
const API_BASE = 'http://localhost:3000';

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if (!id) {
    document.getElementById('event-detail').innerHTML =
      '<p class="error-msg" style="display:block;">No event specified. <a href="index.html">Back to home</a></p>';
    return;
  }
  fetchEvent(id);
});

function fetchEvent(id) {
  fetch(`${API_BASE}/api/events/${id}`)
    .then(res => {
      if (res.status === 404) throw new Error('Event not found');
      if (!res.ok) throw new Error('Failed to load');
      return res.json();
    })
    .then(renderEvent)
    .catch(() => {
      document.getElementById('event-detail').innerHTML =
        '<p class="error-msg" style="display:block;">Could not load this event. <a href="index.html">Back to home</a></p>';
    });
}

function renderEvent(ev) {
  const container = document.getElementById('event-detail');

  const date = new Date(ev.event_date).toLocaleDateString('en-AU', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  const price = Number(ev.ticket_price) === 0
    ? 'Free'
    : `$${Number(ev.ticket_price).toFixed(2)}`;

  const goal = Number(ev.goal_amount);
  const raised = Number(ev.raised_amount);
  const pct = goal > 0 ? Math.min(100, Math.round(raised / goal * 100)) : 0;

  container.innerHTML = `
    <span class="cat">${ev.category}</span>
    <h1>${ev.name}</h1>
    <p class="meta-row">📍 ${ev.location}</p>
    <p class="meta-row">📅 ${date} at ${ev.event_time?.slice(0,5)}</p>
    <p class="meta-row">🏛 Hosted by: <strong>${ev.organisation}</strong></p>
    <p class="meta-row">🎟 Ticket price: <strong>${price}</strong></p>

    <div class="desc">
      <h3 style="margin-bottom:8px;">About this event</h3>
      <p>${ev.description}</p>
      <p style="margin-top:10px;"><strong>Purpose:</strong> ${ev.purpose}</p>
    </div>

    <div>
      <h3 style="margin-bottom:6px;">Fundraising Goal</h3>
      <p class="progress-label">Raised $${raised.toLocaleString()} of $${goal.toLocaleString()} (${pct}%)</p>
      <div class="progress-bar-wrap">
        <div class="progress-bar" style="width:${pct}%">${pct}%</div>
      </div>
    </div>

    <div style="margin-top:24px;">
      <button class="btn btn-primary" onclick="openModal()">Register</button>
      <a href="index.html" style="margin-left:12px;">← Back to home</a>
    </div>
  `;
}

function openModal() {
  document.getElementById('register-modal').classList.add('show');
}
function closeModal() {
  document.getElementById('register-modal').classList.remove('show');
}
//（注：内容由AI生成）
