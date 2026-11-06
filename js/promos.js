const PROMOS = [
  {
    emoji: "🧦",
    court: "Chaussettes de Noël · jusqu'au 4 déc.",
    texte: "Des chaussettes de Noël cousues par les bénévoles de l'APEP, avec le prénom de votre enfant si vous le souhaitez. Commandes jusqu'au 4 décembre.",
    action: "Commander une chaussette",
    lien: "https://www.helloasso.com/associations/association-des-parents-d-eleves-du-plessis-belleville/boutiques/chaussettes-de-noel",
    fin: "2026-12-04",
  },
  {
    emoji: "🧸",
    court: "Bourse aux jouets · sam. 5 déc. · entrée libre",
    texte: "Bourse aux jouets le samedi 5 décembre, de 9h à 16h, salle Suzanne Lelay. Entrée libre, buvette sur place : des idées cadeaux avant Noël.",
    action: "Voir la bourse aux jouets",
    lien: "https://www.helloasso.com/associations/association-des-parents-d-eleves-du-plessis-belleville/evenements/bourse-aux-jouets-05-12-2026",
    fin: "2026-12-05",
  },
  {
    emoji: "🍫",
    court: "Chocolats de Noël · commande en ligne",
    texte: "Les chocolats de Noël d'un chocolatier du Loiret, à commander en ligne auprès de l'APEP.",
    action: "Commander des chocolats",
    lien: "https://asso.initiatives.fr/q/AECGGH",
    debut: "2026-11-14",
    fin: "2027-01-04",
  },
];

export function promosActives(maintenant = new Date()) {
  const jour = maintenant.toLocaleDateString("sv-SE", { timeZone: "Europe/Paris" });
  return PROMOS.filter(p => (!p.debut || p.debut <= jour) && jour <= p.fin).sort((a, b) => a.fin.localeCompare(b.fin));
}

export function lignePromo(el) {
  const p = promosActives()[0];
  if (!p) return;
  const a = Object.assign(document.createElement("a"), { href: p.lien, target: "_blank", rel: "noopener" });
  a.textContent = `${p.emoji} ${p.court}`;
  el.replaceChildren(a);
  el.hidden = false;
}
