import {
  addDays, dayFull, eventWhen, isToday, monthGroup, relativeLabel,
  sameMonth, startOfGrid, startOfMonth, time, weekdayIndex,
} from './dates.js';
import { eventsOnDay } from './data.js';

const DOWS = ['lun', 'mar', 'mer', 'jeu', 'ven', 'sam', 'dim'];

export const hand = (key) => `assets/mains/${key}.svg`;
const MAX_PILLS = 3;

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const el = (html) => {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
};

const LINKABLE = /(https?:\/\/[^\s<]+[^\s<.,;:!?)\]'"]|www\.[^\s<]+[^\s<.,;:!?)\]'"])|([\w.+-]+@[\w-]+(?:\.[\w-]+)+)|((?<![\d+])(?:\+33 ?|0)[1-9](?:[ .-]?\d{2}){4}(?!\d))/g;

function descriptionText(raw) {
  if (!/<[a-z][^>]*>/i.test(raw)) return raw;
  const doc = new DOMParser().parseFromString(raw, 'text/html');
  doc.querySelectorAll('br').forEach((br) => br.replaceWith('\n'));
  doc.querySelectorAll('p, div, li').forEach((b) => b.append('\n'));
  doc.querySelectorAll('a[href]').forEach((a) => {
    const href = a.getAttribute('href');
    if (a.textContent.trim() !== href) a.append(` (${href})`);
  });
  return doc.body.textContent.trim();
}

function linkify(text) {
  let html = '';
  let last = 0;
  for (const m of text.matchAll(LINKABLE)) {
    const [found, url, mail, phone] = m;
    let href = url?.startsWith('www.') ? `https://${url}` : url;
    if (mail) href = `mailto:${mail}`;
    if (phone) href = `tel:${phone.replace(/[ .-]/g, '')}`;
    const external = url ? ' target="_blank" rel="noopener"' : '';
    html += `${esc(text.slice(last, m.index))}<a href="${esc(href)}"${external}>${esc(found)}</a>`;
    last = m.index + found.length;
  }
  return html + esc(text.slice(last));
}

const dowShort = (d) => DOWS[weekdayIndex(d)];
const monShort = (d) => new Intl.DateTimeFormat('fr-FR', { month: 'short' }).format(d).replace('.', '');

export function eventCard(ev, label) {
  const soon = relativeLabel(ev.start);
  const node = el(`
    <button class="event" style="--accent: var(--${ev.calendar})" type="button">
      <span class="date">
        <span class="dow">${esc(dowShort(ev.start))}</span>
        <span class="dom">${ev.start.getDate()}</span>
        <span class="mon">${esc(monShort(ev.start))}</span>
      </span>
      <span>
        <span class="title">${esc(ev.title)}</span>
        <span class="meta">${esc(eventWhen(ev))}${ev.location ? ' · ' + esc(ev.location) : ''}</span>
        <span class="tags">
          <span class="badge">${esc(label)}</span>
          ${soon ? `<span class="soon">${esc(soon)}</span>` : ''}
        </span>
      </span>
    </button>`);
  node.dataset.id = ev.id;
  return node;
}

export function renderUpcoming(container, events, labelOf, onPick) {
  container.replaceChildren();
  if (!events.length) {
    container.append(el(`
      <div class="empty">
        <img src="${hand('apep')}" alt="" width="1183" height="756">
        <p>Rien à l'horizon sur les calendriers sélectionnés — les prochaines dates arriveront ici.</p>
      </div>`));
    return;
  }
  let group = null;
  let list = null;
  for (const ev of events) {
    const key = monthGroup(ev.start);
    if (key !== group) {
      group = key;
      container.append(el(`<h2 class="month-head">${esc(key)}</h2>`));
      list = el('<div class="card-list"></div>');
      container.append(list);
    }
    const card = eventCard(ev, labelOf(ev.calendar));
    card.addEventListener('click', () => onPick(ev));
    list.append(card);
  }
}

export function renderMonth(container, monthStart, events, labelOf, onPickDay) {
  container.replaceChildren();
  const grid = el(`<div class="grid"><div class="dows">${DOWS.map((d) => `<span>${d}</span>`).join('')}</div></div>`);
  const first = startOfGrid(startOfMonth(monthStart));
  const daysInMonth = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0).getDate();
  const weeks = Math.ceil((weekdayIndex(startOfMonth(monthStart)) + daysInMonth) / 7);

  for (let w = 0; w < weeks; w += 1) {
    const week = el('<div class="week"></div>');
    for (let i = 0; i < 7; i += 1) {
      const day = addDays(first, w * 7 + i);
      const dayEvents = eventsOnDay(events, day);
      const cell = el(`<button class="day" type="button"></button>`);
      if (!sameMonth(day, monthStart)) cell.classList.add('outside');
      if (isToday(day)) cell.classList.add('today');
      cell.append(el(`<span class="num">${day.getDate()}</span>`));

      if (dayEvents.length) {
        cell.classList.add('has-events');
        cell.setAttribute('aria-label', `${dayFull(day)} — ${dayEvents.length} événement${dayEvents.length > 1 ? 's' : ''}`);
        for (const ev of dayEvents.slice(0, MAX_PILLS)) {
          const text = ev.allDay ? ev.title : `${time(ev.start)} ${ev.title}`;
          cell.append(el(`<span class="pill" style="--accent: var(--${ev.calendar})">${esc(text)}</span>`));
        }
        if (dayEvents.length > MAX_PILLS) {
          cell.append(el(`<span class="more">+${dayEvents.length - MAX_PILLS}</span>`));
        }
        const dots = el('<span class="dots"></span>');
        for (const ev of dayEvents.slice(0, 4)) {
          dots.append(el(`<i style="--accent: var(--${ev.calendar})"></i>`));
        }
        cell.append(dots);
        cell.addEventListener('click', () => onPickDay(day, dayEvents));
      } else {
        cell.disabled = true;
      }
      week.append(cell);
    }
    grid.append(week);
  }
  container.append(grid);
}

export function eventSheet(ev, label) {
  const sheet = el(`
    <div class="sheet" style="--accent: var(--${ev.calendar})">
      <img class="hand" src="${hand(ev.calendar)}" alt="">
      <span class="badge">${esc(label)}</span>
      <h2>${esc(ev.title)}</h2>
      <p class="when">${esc(dayFull(ev.start))} · ${esc(eventWhen(ev))}</p>
      <dl></dl>
      <div class="actions">
        <button class="primary" value="close" type="button">Fermer</button>
        <button value="share" type="button">Partager</button>
      </div>
    </div>`);
  const dl = sheet.querySelector('dl');
  if (ev.location) {
    dl.append(el(`<dt>Lieu</dt>`));
    dl.append(el(`<dd><a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ev.location)}" target="_blank" rel="noopener">${esc(ev.location)}</a></dd>`));
  }
  if (ev.description) {
    dl.append(el(`<dt>Détail</dt>`));
    dl.append(el(`<dd>${linkify(descriptionText(ev.description)).replace(/\n/g, '<br>')}</dd>`));
  }
  if (!dl.children.length) dl.remove();
  if (ev.link) {
    sheet.querySelector('.actions').append(
      el(`<a href="${esc(ev.link)}" target="_blank" rel="noopener">Ouvrir dans Google Agenda</a>`),
    );
  }
  return sheet;
}

export function daySheet(day, events, labelOf, onPick) {
  const sheet = el(`
    <div class="sheet">
      <h2>${esc(dayFull(day))}</h2>
      <div class="day-list"></div>
      <div class="actions"><button class="primary" value="close" type="button">Fermer</button></div>
    </div>`);
  const list = sheet.querySelector('.day-list');
  for (const ev of events) {
    const card = eventCard(ev, labelOf(ev.calendar));
    card.addEventListener('click', () => onPick(ev));
    list.append(card);
  }
  return sheet;
}

const DOC_ICONS = [
  [/pdf/, '📕'],
  [/spreadsheet|excel|csv/, '📊'],
  [/presentation|powerpoint/, '📽️'],
  [/document|word|text/, '📄'],
  [/image|photo/, '🖼️'],
  [/video/, '🎬'],
];

const docIcon = (mime) => (DOC_ICONS.find(([re]) => re.test(mime)) || [null, '📎'])[1];

const docDate = (iso) =>
  iso ? new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(iso)) : '';

export function renderDocuments(container, { folders, files, failed }) {
  container.replaceChildren();
  if (failed) {
    container.append(el(`
      <div class="notice warn">
        <h2>Les documents n'ont pas pu être chargés</h2>
        Réessayez dans quelques instants.
      </div>`));
    return;
  }
  if (!folders.length && !files.length) {
    container.append(el(`
      <div class="empty">
        <img src="${hand('apep')}" alt="" width="1183" height="756">
        <p>Aucun document publié pour le moment.</p>
      </div>`));
    return;
  }
  const list = el('<div class="card-list"></div>');
  for (const f of folders) {
    list.append(el(`
      <a class="doc" href="${esc(f.webViewLink)}" target="_blank" rel="noopener">
        <span class="kind">📁</span>
        <span><span class="name">${esc(f.name)}</span><br><span class="sub">Dossier — s'ouvre dans Google Drive</span></span>
        <span class="go">→</span>
      </a>`));
  }
  for (const f of files) {
    list.append(el(`
      <a class="doc" href="${esc(f.webViewLink)}" target="_blank" rel="noopener">
        <span class="kind">${docIcon(f.mimeType)}</span>
        <span><span class="name">${esc(f.name)}</span><br><span class="sub">Mis à jour le ${esc(docDate(f.modifiedTime))}</span></span>
        <span class="go">→</span>
      </a>`));
  }
  container.append(list);
}

// L'iPad se présente comme un Mac ; Android et Windows ne savent pas ouvrir webcal://.
const APPLE = /iPhone|iPad|iPod|Macintosh/;

export function renderSubscribe(container, calendars) {
  const links = container.querySelector('.links');
  links.replaceChildren();
  for (const c of calendars.filter((x) => x.id)) {
    const href = APPLE.test(navigator.userAgent)
      ? `webcal://calendar.google.com/calendar/ical/${encodeURIComponent(c.id)}/public/basic.ics`
      : `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(c.id)}`;
    links.append(el(`
      <a href="${esc(href)}" style="--accent: var(--${c.key})">
        <img src="${hand(c.key)}" alt="">${esc(c.short)}
      </a>`));
  }
}
