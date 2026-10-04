const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const pad = n => String(n).padStart(2, '0');
const toMin = t => +t.slice(0, 2) * 60 + +t.slice(3);
const fmt = m => `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;

document.getElementById('reserve-note').textContent = SHUTTLE.note;
document.getElementById('reserve-how').textContent = SHUTTLE.reserve;

const departures = s => {
  const out = [];
  for (let m = toMin(s.first); m <= toMin(s.last); m += s.every) out.push(m);
  return out;
};

const tabs = document.getElementById('tabs');
const panel = document.getElementById('panel');
const now = new Date().getHours() * 60 + new Date().getMinutes();

function show(i) {
  const s = SHUTTLE.stops[i];
  [...tabs.children].forEach((b, j) => { b.setAttribute('aria-selected', j === i); b.tabIndex = j === i ? 0 : -1; });
  if (!s.first) {
    panel.innerHTML = `<h3>${esc(s.name)}</h3><p>${esc(s.detail)}. ${esc(SHUTTLE.reserve)}</p>`;
    return;
  }
  const times = departures(s);
  const nextT = times.find(t => t >= now);
  panel.innerHTML = `<h3>${esc(s.name)}</h3><p class="panel-sub"><span>${esc(s.detail)}</span> · ${s.first}–${s.last}</p>
    <table><caption class="sr-only">Departures from the hotel to ${esc(s.name)}</caption>
    <thead><tr><th scope="col">Leaves hotel</th><th scope="col"></th></tr></thead>
    <tbody>${times.map(t => `<tr${t === nextT ? ' class="is-next"' : ''}><td>${fmt(t)}</td><td>${t === nextT ? '<span class="pill">Next</span>' : ''}</td></tr>`).join('')}</tbody></table>`;
}

SHUTTLE.stops.forEach((s, i) => {
  const b = document.createElement('button');
  b.type = 'button'; b.role = 'tab'; b.textContent = s.name;
  b.addEventListener('click', () => show(i));
  b.addEventListener('keydown', e => {
    const n = SHUTTLE.stops.length;
    const d = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    if (d) { const j = (i + d + n) % n; show(j); tabs.children[j].focus(); }
  });
  tabs.append(b);
});
show(0);
