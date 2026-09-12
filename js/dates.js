const pad = (n) => String(n).padStart(2, '0');

export const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const fromYmd = (s) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
export const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
export const addMonths = (d, n) => new Date(d.getFullYear(), d.getMonth() + n, 1);
export const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1);

export const sameMonth = (a, b) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();

// Lundi = 0
export const weekdayIndex = (d) => (d.getDay() + 6) % 7;

export const startOfGrid = (monthStart) => addDays(monthStart, -weekdayIndex(monthStart));

const f = (opts) => new Intl.DateTimeFormat('fr-FR', opts);
const fmtMonthYear = f({ month: 'long', year: 'numeric' });
const fmtMonthLong = f({ month: 'long', year: 'numeric' });
const fmtDayFull = f({ weekday: 'long', day: 'numeric', month: 'long' });
const fmtDayShort = f({ weekday: 'short', day: 'numeric', month: 'short' });
const fmtTime = f({ hour: '2-digit', minute: '2-digit' });

export const monthYear = (d) => fmtMonthYear.format(d);
export const monthGroup = (d) => fmtMonthLong.format(d);
export const dayFull = (d) => fmtDayFull.format(d);
export const dayShort = (d) => fmtDayShort.format(d);
export const time = (d) => fmtTime.format(d);

export const isToday = (d) => ymd(d) === ymd(new Date());

export function relativeLabel(day) {
  const diff = Math.round((startOfDay(day) - startOfDay(new Date())) / 86400000);
  if (diff === 0) return "aujourd'hui";
  if (diff === 1) return 'demain';
  if (diff > 1 && diff < 7) return `dans ${diff} jours`;
  return null;
}

export function eventWhen(ev) {
  if (ev.allDay) {
    const lastDay = addDays(ev.end, -1);
    if (ymd(lastDay) === ymd(ev.start)) return 'Toute la journée';
    return `Jusqu'au ${dayFull(lastDay)}`;
  }
  const sameDayEnd = ymd(ev.end) === ymd(ev.start);
  if (sameDayEnd) return `${time(ev.start)} – ${time(ev.end)}`;
  return `${time(ev.start)} → ${dayShort(ev.end)} ${time(ev.end)}`;
}
