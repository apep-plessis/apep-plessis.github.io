export const CONFIG = {
  apiKey: 'AIzaSyCHLwX5GgiCTX3oy896yewc-K-_kCCO6qI',

  driveFolderId: '1dErn-POjXWbO22NXMsguxO7yjpFM4P7P',

  calendars: [
    { key: 'apep',  id: '5ff232de7fa0d67770a3fdaddfe1108f6ffc973abaa2643547ee6c15f50bb46c@group.calendar.google.com', label: 'APEP',                          short: 'APEP' },
    { key: 'vacances',  id: 'df63ff72bd3ee493d181a6cd2e141ca9ae7ba33f84951607ab771dc633d62305@group.calendar.google.com', label: 'Vacances scolaires',                          short: 'Vacances' },
    { key: 'iris',  id: '7ed577a07012ef7f91d24f5184177294190f16469d2b04a4cce8aebb50da3e83@group.calendar.google.com', label: 'Maternelle Les Iris',           short: 'Les Iris' },
    { key: 'pal',   id: 'bdd31a9cecc2f014adad0a887e5dbd2299a83b8da869d2b6e7773284b1bbd8e6@group.calendar.google.com', label: 'Maternelle Le Pré au Lièvre',   short: 'Le Pré au Lièvre' },
    { key: 'lw',    id: '37b4d8828b88c7eba807e921e741aa75f353165bb516f26b0fbfadb55af4b579@group.calendar.google.com', label: 'Élémentaire Louisette Wattier', short: 'Louisette Wattier' },
  ],
};

export const isConfigured = () =>
  Boolean(CONFIG.apiKey) && CONFIG.calendars.some((c) => c.id);
