import { addDays, startOfDay } from './dates.js';

const at = (offsetDays, hh, mm, durationMin) => {
  const d = addDays(startOfDay(new Date()), offsetDays);
  const start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), hh, mm);
  return { start, end: new Date(start.getTime() + durationMin * 60000), allDay: false };
};

const days = (offsetDays, count = 1) => {
  const start = addDays(startOfDay(new Date()), offsetDays);
  return { start, end: addDays(start, count), allDay: true };
};

const seed = [
  ['apep', 'Assemblée générale ordinaire', 'Salle des fêtes', at(3, 20, 0, 120)],
  ['apep', 'Vente de gâteaux', "Devant l'école Louisette Wattier", at(9, 16, 15, 75)],
  ['apep', 'Réunion du bureau', 'Salle associative', at(17, 20, 30, 90)],
  ['apep', 'Marché de Noël', 'Place de la mairie', days(52, 2)],
  ['lw', "Conseil d'école", 'Élémentaire Louisette Wattier', at(12, 18, 0, 120)],
  ['lw', 'Sortie au gymnase — parents accompagnants recherchés', 'Gymnase municipal', at(5, 9, 0, 180)],
  ['lw', 'Photo de classe', 'Élémentaire Louisette Wattier', days(24)],
  ['iris', "Conseil d'école", 'Maternelle Les Iris', at(19, 17, 30, 105)],
  ['iris', 'Carnaval des petits', 'Cour de la maternelle', at(33, 10, 0, 120)],
  ['pal', "Conseil d'école", 'Maternelle Le Pré au Lièvre', at(26, 17, 30, 105)],
  ['pal', 'Spectacle de fin de trimestre', 'Salle des fêtes', at(41, 18, 0, 90)],
  ['apep', "Vacances d'automne", '', days(-2, 16)],
];

export const DEMO_EVENTS = seed
  .map(([calendar, title, location, when], i) => ({
    id: `demo:${i}`,
    calendar,
    title,
    location,
    description: '',
    link: '',
    ...when,
  }))
  .sort((a, b) => a.start - b.start);

export const DEMO_DOCUMENTS = {
  folders: [{ id: 'd1', name: 'Comptes-rendus de conseil d’école', webViewLink: '#' }],
  files: [
    { id: 'f1', name: 'Statuts de l’association.pdf', mimeType: 'application/pdf', modifiedTime: '2026-08-20T10:00:00Z', webViewLink: '#' },
    { id: 'f2', name: 'Bulletin d’adhésion 2026-2027.pdf', mimeType: 'application/pdf', modifiedTime: '2026-09-01T08:30:00Z', webViewLink: '#' },
    { id: 'f3', name: 'Règlement intérieur.pdf', mimeType: 'application/pdf', modifiedTime: '2026-08-20T10:05:00Z', webViewLink: '#' },
    { id: 'f4', name: 'Compte-rendu AG constitutive.pdf', mimeType: 'application/pdf', modifiedTime: '2026-07-12T19:00:00Z', webViewLink: '#' },
  ],
};
