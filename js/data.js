import { CONFIG } from './config.js';
import { fromYmd, startOfDay, addDays, addMonths } from './dates.js';

export const WINDOW_BACK_MONTHS = -12;
export const WINDOW_FWD_MONTHS = 18;

export const windowStart = () => addMonths(new Date(), WINDOW_BACK_MONTHS);
export const windowEnd = () => addMonths(new Date(), WINDOW_FWD_MONTHS);

class ApiError extends Error {
  constructor(status, detail, calendar) {
    super(detail);
    this.status = status;
    this.calendar = calendar;
  }
}

async function getJson(url) {
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiError(res.status, body?.error?.message || res.statusText);
  }
  return res.json();
}

function normalize(raw, calendar) {
  const allDay = Boolean(raw.start.date);
  return {
    id: `${calendar.key}:${raw.id}`,
    calendar: calendar.key,
    title: raw.summary || '(sans titre)',
    location: raw.location || '',
    description: raw.description || '',
    link: raw.htmlLink || '',
    allDay,
    start: allDay ? fromYmd(raw.start.date) : new Date(raw.start.dateTime),
    end: allDay ? fromYmd(raw.end.date) : new Date(raw.end.dateTime),
  };
}

async function fetchCalendar(calendar) {
  const params = new URLSearchParams({
    key: CONFIG.apiKey,
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: '2500',
    timeMin: windowStart().toISOString(),
    timeMax: windowEnd().toISOString(),
    fields: 'items(id,summary,location,description,htmlLink,start,end)',
  });
  const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendar.id)}/events?${params}`;
  try {
    const data = await getJson(url);
    return { calendar, events: (data.items || []).map((raw) => normalize(raw, calendar)) };
  } catch (err) {
    err.calendar = calendar;
    return { calendar, events: [], error: err };
  }
}

export async function loadEvents() {
  const active = CONFIG.calendars.filter((c) => c.id);
  const results = await Promise.all(active.map(fetchCalendar));
  const events = results
    .flatMap((r) => r.events)
    .sort((a, b) => a.start - b.start || a.title.localeCompare(b.title, 'fr'));
  return { events, errors: results.filter((r) => r.error).map((r) => r.error) };
}

export async function loadDocuments() {
  if (!CONFIG.driveFolderId) return { folders: [], files: [] };
  const params = new URLSearchParams({
    key: CONFIG.apiKey,
    q: `'${CONFIG.driveFolderId}' in parents and trashed = false`,
    orderBy: 'folder,name',
    pageSize: '200',
    fields: 'files(id,name,mimeType,modifiedTime,webViewLink,size)',
  });
  const data = await getJson(`https://www.googleapis.com/drive/v3/files?${params}`);
  const all = data.files || [];
  const isFolder = (f) => f.mimeType === 'application/vnd.google-apps.folder';
  return { folders: all.filter(isFolder), files: all.filter((f) => !isFolder(f)) };
}

export function upcoming(events) {
  const today = startOfDay(new Date());
  return events.filter((ev) => ev.end > today);
}

export function eventsOnDay(events, day) {
  const dayStart = startOfDay(day);
  const dayEnd = addDays(dayStart, 1);
  return events.filter((ev) => ev.start < dayEnd && ev.end > dayStart);
}
