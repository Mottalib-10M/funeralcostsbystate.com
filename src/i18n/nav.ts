import { route, type Locale } from './routes';
import { PAGES, pageById } from '../lib/guides';
import type { Group } from '../lib/guide-types';
export interface NavLink { href: string; label: string }
/** `ouverte` : rubrique dépliée d'office dans le menu du téléphone. `sousTitre` : précision sous le titre. */
export interface NavCategory { label: string; links: NavLink[]; ouverte?: boolean; sousTitre?: string; groupes?: NavCategory[] }
const CORE: Record<string, string> = { home: 'Funeral cost calculator (home page)', method: 'How the figures are worked out', about: 'About', widget: 'Embed the calculator', contact: 'Contact', editorial: 'Editorial policy', privacy: 'Privacy', terms: 'Legal notice', cookies: 'Cookies' };
// Testeurs naïfs du 2026-11-09 (tour final, 3 sur 3) : « Life insurance » ouvert, IUL et « Taxes » dans le même
// menu que le deuil, « c'est un site d'assurance déguisé ? ». Les rubriques suivent désormais la situation du
// lecteur : après un décès, préparer ses obsèques, puis l'assurance vie et les impôts, à part et repliés.
const GROUP_LABEL: Record<Group, string> = { costs: 'After a death: costs and help', final: 'Planning ahead: prepaid plans and burial insurance', life: 'Life insurance', tax: 'Taxes on a life insurance payout' };
export const GROUPS_ORDER: Group[] = ['costs', 'final', 'life', 'tax'];
export const groupLabel = (g: Group) => GROUP_LABEL[g];
export const label = (id: string, _lang: Locale = 'en') => CORE[id] ?? pageById(id)?.nav ?? id;
const link = (id: string, lang: Locale): NavLink => ({ href: route(id, lang), label: label(id, lang) });
const inGroup = (g: Group, lang: Locale) => PAGES.filter((p) => p.group === g).map((p) => link(p.id, lang));
// Top menu: short labels, never on two lines (full labels stay in the footer).
const COURT: Record<Group, string> = { costs: 'After a death', final: 'Planning ahead', life: 'Life insurance', tax: 'Taxes' };
export const AUTRES_LABEL = 'Life insurance and taxes (not about funerals)';
/** Trois rubriques : après un décès et préparer à l'avance, dépliées ; assurance vie et impôts réunis, repliés. */
export const navCategories = (lang: Locale): NavCategory[] => [
  { label: COURT.costs, links: inGroup('costs', lang), ouverte: true },
  { label: COURT.final, links: inGroup('final', lang), ouverte: true },
  { label: 'Life insurance and taxes', links: [...inGroup('life', lang), ...inGroup('tax', lang)], sousTitre: AUTRES_LABEL,
    groupes: (['life', 'tax'] as Group[]).map((g) => ({ label: COURT[g], links: inGroup(g, lang) })) },
].filter((c) => c.links.length);
// Entrée par situation (testeurs du 2026-11-09 : « rien ne s'appelle Someone has died »).
export const navDirect = (lang: Locale): NavLink[] => [{ href: `${route('home', lang)}#start`, label: 'Someone has died? Start here' }];
export const footerColumns = (lang: Locale): NavCategory[] => [...GROUPS_ORDER.map((g) => ({ label: GROUP_LABEL[g], links: inGroup(g, lang) })).filter((c) => c.links.length), { label: 'This site', links: ['home', 'method', 'about', 'contact', 'editorial', 'widget', 'terms', 'privacy', 'cookies'].map((i) => link(i, lang)) }];
export const popularLinks = (_lang: Locale): NavLink[] => [];
