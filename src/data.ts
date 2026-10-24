// Tout le contenu du site vit ici (source : CV de Riadh Bouallegue).

export const ME = {
  first: 'Riadh',
  last: 'Bouallegue',
  full: 'Riadh Bouallegue',
  role: ['AUDITEUR', 'JUNIOR.'],
  roleLong: 'Auditeur junior — Audit financier & Comptabilité',
  city: 'Sousse, Tunisie',
  email: 'riadhbouallegue@outlook.com',
  linkedin: 'https://linkedin.com/in/riadh-bouallegue',
  resume: './resume.pdf',
  year: 2026,
}

export const TAGLINE =
  'Auditeur junior, Master CCA. Je teste les contrôles, cartographie les risques et rédige les notes de synthèse qui fondent l’opinion du commissaire aux comptes.'

export const MANIFESTO: { t: string; k?: boolean }[] = [
  { t: 'Je transforme des' },
  { t: 'chiffres', k: true },
  { t: 'bruts en' },
  { t: 'assurance', k: true },
  { t: 'fiable. Chaque' },
  { t: 'risque', k: true },
  { t: 'identifié, chaque' },
  { t: 'contrôle', k: true },
  { t: 'testé, chaque dossier livré à temps — avec' },
  { t: 'rigueur', k: true },
  { t: 'et méthode.' },
]

export const STATS = [
  { value: 15, suffix: '+', label: 'Clients audités', sub: 'en 6 mois' },
  { value: 2, suffix: ' ans', label: 'D’expérience', sub: 'en cabinets' },
  { value: 4, suffix: '', label: 'Langues', sub: 'FR · EN · AR · ES' },
]

export const PROJECTS = [
  {
    n: '01',
    cat: 'Audit financier · Déc. 2025 — présent',
    name: 'MCAM Audit',
    desc: 'Missions d’audit pour un portefeuille multi-clients : contrôle interne, tests et notes de synthèse.',
    chips: ['Contrôle interne', 'Tests d’audit', 'Plan annuel', 'Synthèse'],
    link: 'Voir le profil',
    href: ME.linkedin,
    visual: 'gauge',
  },
  {
    n: '02',
    cat: 'Commissariat aux comptes · 2025',
    name: 'Orga Audit',
    desc: 'Saisie des opérations comptables, audit des comptes et contribution à la préparation des états financiers (bilan, compte de résultat, annexes).',
    chips: ['Saisie comptable', 'Audit des comptes', 'États financiers', 'Bilan'],
    link: 'Voir le profil',
    href: ME.linkedin,
    visual: 'heat',
  },
  {
    n: '03',
    cat: 'Comptabilité · 2022 — 2023',
    name: 'Cabinet Zied Hamza',
    desc: 'Déclarations fiscales et sociales, clôtures et travaux extra-comptables au quotidien.',
    chips: ['Fiscalité', 'Social', 'Clôtures', 'Extra-comptable'],
    link: 'Voir le profil',
    href: ME.linkedin,
    visual: 'ledger',
  },
]

export const JOURNEY = {
  from: 2018,
  to: 2025,
  items: [
    { year: '2025', title: 'Master CCA', org: 'EPI Business School — Comptabilité, Contrôle & Audit' },
    { year: '2022', title: 'Licence Sciences de gestion', org: 'ISFFS Sousse — Finances & Fiscalité' },
    { year: '2018', title: 'Baccalauréat', org: 'Économie et Gestion — Lycée Hammam Sousse 2' },
  ],
}

export const SKILLS = [
  'Risques', 'Contrôle interne', 'Tests d’audit', 'Conformité',
  'Notes de synthèse', 'IFRS', 'ISA', 'Normes TN',
  'Fiscalité', 'Clôtures', 'Inventaires', 'Sage',
  'Ciel Compta', 'ComptaSig', 'SPSS', 'Excel avancé',
]

export const COUNTS = [
  { n: 15, suffix: '+', label: 'Clients audités' },
  { n: 6, suffix: '', label: 'Mois pour y arriver' },
  { n: 4, suffix: '', label: 'Langues parlées' },
  { n: 3, suffix: '★', label: 'Certifications' },
]

export const CERTS = [
  { title: 'TOEIC', issuer: 'Anglais professionnel' },
  { title: 'MOS Excel', issuer: 'Microsoft Office Specialist' },
  { title: 'DELF B2', issuer: 'Français' },
  { title: 'Master CCA', issuer: 'EPI Business School' },
  { title: 'Licence', issuer: 'ISFFS Sousse' },
  { title: 'IFRS · ISA', issuer: 'Normes internationales' },
]

export const LINKS = [
  { label: 'LinkedIn', href: ME.linkedin, cursor: 'Go' },
  { label: 'E-mail', href: `mailto:${ME.email}`, cursor: 'Write' },
  { label: 'Résumé', href: ME.resume, cursor: 'PDF' },
]

export const LABELS = {
  about: 'À propos',
  work: 'Missions',
  journey: 'Parcours',
  skills: 'Outils',
  awards: 'Distinctions',
}
