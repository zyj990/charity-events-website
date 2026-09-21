// home.js — fetch upcoming events from the API and render them
const API_BASE = 'http://localhost:3000';

document.addEventListener('DOMContentLoaded', () => {
  fetchEvents();
});

function fetchEvents() {
  fetch(`${API_BASE}/api/events`)
    .then(res => {
      if (!res.ok) throw new Error('Failed to load events');
      return res.json();
    })
    .then(events => renderEvents(events))
    .catch(err => {
      document.getElementById('event-list').innerHTML =
        '<p class="error-msg" style="display:block;">Could not load events. Is the server running?</p>';
      console.error(err);
    });
}

function renderEvents(events) {
  const container = document.getElementById('event-list');

  if (!events || events.length === 0) {
    container.innerHTML = '<p class="empty-msg">No upcoming events at the moment.</p>';
    return;
  }

  container.innerHTML = events.map(ev => {
    const date = new Date(ev.event_date).toLocaleDateString('en-AU', {
      weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
    });
    const price = Number(ev.ticket_price) === 0
      ? '<span class="price free">Free</span>'
      : `<span class="price">$${Number(ev.ticket_price).toFixed(2)}</span>`;

    return `
      <div class="event-card">
        <span class="cat">${ev.category}</span>
        <h3>${ev.name}</h3>
        <p class="meta">📅 ${date} at ${ev.event_time?.slice(0,5)}</p>
        <p class="meta">📍 ${ev.location}</p>
        ${price}
        <a class="detail-link" href="event.html?id=${ev.event_id}">View details →</a>
      </div>
    `;
  }).join('');
}
//（注：内容由AI生成）
