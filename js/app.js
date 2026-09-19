import { CONFIG, isConfigured } from './config.js';
import { loadDocuments, loadEvents, upcoming, windowEnd, windowStart } from './data.js';
import { DEMO_DOCUMENTS, DEMO_EVENTS } from './demo.js';
import { addDays, addMonths, monthYear, sameMonth, startOfMonth } from './dates.js';
import {
  daySheet, eventSheet, hand, renderDocuments, renderMonth, renderSubscribe, renderUpcoming,
} from './views.js';

const STORE_KEY = 'apep-calendriers-masques';

const $ = (sel) => document.querySelector(sel);

const labelOf = (key) => CONFIG.calendars.find((c) => c.key === key)?.short || key;

const state = {
  events: [],
  documents: { folders: [], files: [] },
  hidden: new Set(),
  month: startOfMonth(new Date()),
  tab: 'upcoming',
  demo: false,
};

/* ---------- Préférences de filtrage ---------- */

function loadHidden() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) state.hidden = new Set(JSON.parse(raw));
  } catch {
    /* stockage indisponible : on reste sur tous les calendriers visibles */
  }
}

function saveHidden() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify([...state.hidden]));
  } catch {
    /* idem */
  }
}

const visibleEvents = () => state.events.filter((ev) => !state.hidden.has(ev.calendar));

/* ---------- Dialogue ---------- */

const dialog = $('#sheet');

function openSheet(node) {
  dialog.replaceChildren(node);
  node.querySelector('[value="close"]').addEventListener('click', () => dialog.close());
  dialog.showModal();
}

const HASH_PREFIX = '#evenement=';

const eventUrl = (ev) => `${location.origin}${location.pathname}${HASH_PREFIX}${encodeURIComponent(ev.id)}`;

async function shareEvent(ev, button) {
  const url = eventUrl(ev);
  if (navigator.share) {
    await navigator.share({ title: ev.title, url }).catch(() => {});
    return;
  }
  try {
    await navigator.clipboard.writeText(url);
    button.textContent = 'Lien copié';
  } catch {
    prompt('Lien à copier :', url);
  }
}

function showEvent(ev) {
  const sheet = eventSheet(ev, labelOf(ev.calendar));
  const share = sheet.querySelector('[value="share"]');
  share.addEventListener('click', () => shareEvent(ev, share));
  openSheet(sheet);
  history.replaceState(null, '', eventUrl(ev));
}

function openFromHash() {
  if (!location.hash.startsWith(HASH_PREFIX)) return;
  const id = decodeURIComponent(location.hash.slice(HASH_PREFIX.length));
  const ev = state.events.find((e) => e.id === id);
  if (ev) showEvent(ev);
  else history.replaceState(null, '', location.pathname);
}

const showDay = (day, events) =>
  openSheet(daySheet(day, events, labelOf, (ev) => showEvent(ev)));

/* ---------- Rendu ---------- */

function renderFilters() {
  const box = $('#filters');
  box.replaceChildren();
  for (const c of CONFIG.calendars) {
    if (!c.id && !state.demo) continue;
    const on = !state.hidden.has(c.key);
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chip';
    chip.style.setProperty('--chip', `var(--${c.key})`);
    chip.setAttribute('aria-pressed', String(on));
    const icon = document.createElement('img');
    icon.src = hand(c.key);
    icon.alt = '';
    chip.append(icon, document.createTextNode(c.short));
    chip.addEventListener('click', () => {
      if (state.hidden.has(c.key)) state.hidden.delete(c.key);
      else state.hidden.add(c.key);
      saveHidden();
      renderFilters();
      render();
    });
    box.append(chip);
  }
}

function renderCount(events) {
  const soon = events.filter((ev) => ev.start < addDays(new Date(), 15));
  const box = $('#count');
  box.hidden = soon.length === 0;
  if (soon.length) {
    box.innerHTML = `<strong>${soon.length}</strong> date${soon.length > 1 ? 's' : ''}<br>d'ici 15 jours`;
  }
}

function renderMonthNav() {
  const min = startOfMonth(windowStart());
  const max = startOfMonth(windowEnd());
  $('#month-label').textContent = monthYear(state.month);
  $('#prev').disabled = state.month <= min;
  $('#next').disabled = state.month >= max;
  $('#today').hidden = sameMonth(state.month, new Date());
}

function render() {
  const events = visibleEvents();
  $('#view-upcoming').hidden = state.tab !== 'upcoming';
  $('#view-month').hidden = state.tab !== 'month';
  $('#view-documents').hidden = state.tab !== 'documents';
  $('#filters').hidden = state.tab === 'documents';
  if (!state.demo) $('#subscribe').hidden = state.tab === 'documents';

  if (state.tab === 'upcoming') {
    const next = upcoming(events);
    renderCount(next);
    renderUpcoming($('#upcoming-list'), next, labelOf, showEvent);
  } else if (state.tab === 'month') {
    renderMonthNav();
    renderMonth($('#month-grid'), state.month, events, labelOf, showDay);
  } else {
    renderDocuments($('#documents-list'), state.documents);
  }
}

function selectTab(tab) {
  state.tab = tab;
  for (const btn of document.querySelectorAll('.tabs button')) {
    btn.setAttribute('aria-selected', String(btn.dataset.tab === tab));
  }
  render();
}

/* ---------- Erreurs ---------- */

function reportErrors(errors) {
  if (!errors.length) return;
  const forbidden = errors.some((e) => e.status === 403 || e.status === 404);
  $('#errors').hidden = false;
  $('#errors').innerHTML = forbidden
    ? `<h2>Certains calendriers n'ont pas pu être chargés</h2>
       Vérifiez que chaque agenda est bien « rendu disponible publiquement » dans ses paramètres Google,
       et que la clé API autorise l'API Google Calendar depuis ce domaine.`
    : `<h2>Chargement partiel</h2>Les calendriers suivants n'ont pas répondu : ${errors
        .map((e) => e.calendar.short)
        .join(', ')}.`;
}

/* ---------- Démarrage ---------- */

async function start() {
  loadHidden();
  $('#prev').addEventListener('click', () => {
    state.month = addMonths(state.month, -1);
    render();
  });
  $('#next').addEventListener('click', () => {
    state.month = addMonths(state.month, 1);
    render();
  });
  $('#today').addEventListener('click', () => {
    state.month = startOfMonth(new Date());
    render();
  });
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) dialog.close();
  });
  dialog.addEventListener('close', () => {
    if (location.hash) history.replaceState(null, '', location.pathname);
  });

  if (!isConfigured()) {
    state.demo = true;
    state.events = DEMO_EVENTS;
    state.documents = DEMO_DOCUMENTS;
    $('#demo-banner').hidden = false;
    $('#subscribe').hidden = true;
  } else {
    const [{ events, errors }, documents] = await Promise.all([
      loadEvents(),
      loadDocuments().catch(() => ({ folders: [], files: [], failed: true })),
    ]);
    state.events = events;
    state.documents = documents;
    reportErrors(errors);
    renderSubscribe($('#subscribe'), CONFIG.calendars);
    $('#subscribe').hidden = false;
  }

  renderFilters();
  document.querySelectorAll('.tabs button').forEach((btn) => {
    btn.addEventListener('click', () => selectTab(btn.dataset.tab));
  });
  selectTab('upcoming');
  openFromHash();
}

start();
