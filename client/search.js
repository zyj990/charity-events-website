// search.js — load categories, handle search form, render results
const API_BASE = 'http://localhost:3000';

const form   = document.getElementById('search-form');
const dateEl = document.getElementById('date');
const locEl  = document.getElementById('location');
const catEl  = document.getElementById('category');
const errorBox = document.getElementById('error-box');
const results  = document.getElementById('results');

// Populate category dropdown on page load
document.addEventListener('DOMContentLoaded', loadCategories);

function loadCategories() {
  fetch(`${API_BASE}/api/categories`)
    .then(res => res.json())
    .then(cats => {
      cats.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.category_id;
        opt.textContent = c.name;
        catEl.appendChild(opt);
      });
    })
    .catch(() => showError('Could not load categories. Is the server running?'));
}

// Search on form submit
form.addEventListener('submit', (e) => {
  e.preventDefault();
  hideError();
  results.innerHTML = '<p class="loading">Searching...</p>';

  const params = new URLSearchParams();
  if (dateEl.value)     params.set('date', dateEl.value);
  if (locEl.value.trim()) params.set('location', locEl.value.trim());
  if (catEl.value)      params.set('category', catEl.value);

  fetch(`${API_BASE}/api/events/search?${params.toString()}`)
    .then(res => {
      if (!res.ok) throw new Error('Search failed');
      return res.json();
    })
    .then(renderResults)
    .catch(() => {
      results.innerHTML = '';
      showError('Search failed. Please try again.');
    });
});

// Clear Filters button — reset all fields and results
document.getElementById('clear-btn').addEventListener('click', () => {
  // Small delay so form reset actually clears DOM before we react
  setTimeout(() => {
    hideError();
    results.innerHTML = '';
  }, 0);
});

function renderResults(events) {
  if (!events || events.length === 0) {
    results.innerHTML = '<p class="empty-msg">No events match your criteria. Try clearing filters.</p>';
    return;
  }

  results.innerHTML = events.map(ev => {
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

function showError(msg) {
  errorBox.textContent = msg;
  errorBox.style.display = 'block';
}
function hideError() {
  errorBox.textContent = '';
  errorBox.style.display = 'none';
}
//（注：内容由AI生成）
