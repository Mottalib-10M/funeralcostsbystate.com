import { route, type Locale } from './routes';
import { PAGES, pageById } from '../lib/guides';
import type { Group } from '../lib/guide-types';
export interface NavLink { href: string; label: string } export interface NavCategory { label: string; links: NavLink[] }
const CORE: Record<string, string> = { home: 'Funeral cost calculator', method: 'How the figures are worked out', about: 'About', widget: 'Embed the calculator', contact: 'Contact', editorial: 'Editorial policy', privacy: 'Privacy', terms: 'Legal notice', cookies: 'Cookies' };
const GROUP_LABEL: Record<Group, string> = { costs: 'Funeral costs and help', final: 'Final expense and burial insurance', life: 'Life insurance', tax: 'Taxes on a payout' };
export const GROUPS_ORDER: Group[] = ['costs', 'final', 'life', 'tax'];
export const groupLabel = (g: Group) => GROUP_LABEL[g];
export const label = (id: string, _lang: Locale = 'en') => CORE[id] ?? pageById(id)?.nav ?? id;
const link = (id: string, lang: Locale): NavLink => ({ href: route(id, lang), label: label(id, lang) });
const inGroup = (g: Group, lang: Locale) => PAGES.filter((p) => p.group === g).map((p) => link(p.id, lang));
function categoriesCompletes(lang: Locale): NavCategory[] {
  return GROUPS_ORDER.map((g) => ({ label: GROUP_LABEL[g], links: inGroup(g, lang) })).filter((c) => c.links.length);
}
// Top menu: short labels, never on two lines (full labels stay in the footer).
const COURT: Record<string, string> = { 'Funeral costs and help': 'Funeral costs', 'Final expense and burial insurance': 'Final expense', 'Life insurance': 'Life insurance', 'Taxes on a payout': 'Taxes' };
export const navCategories = (lang: Locale, court = true): NavCategory[] =>
  categoriesCompletes(lang).map((c) => (court ? { ...c, label: COURT[c.label] ?? c.label } : c));
export const navDirect = (_lang: Locale): NavLink[] => [];
export const footerColumns = (lang: Locale): NavCategory[] => [...GROUPS_ORDER.map((g) => ({ label: GROUP_LABEL[g], links: inGroup(g, lang) })).filter((c) => c.links.length), { label: 'This site', links: ['home', 'method', 'about', 'contact', 'editorial', 'widget', 'terms', 'privacy', 'cookies'].map((i) => link(i, lang)) }];
export const popularLinks = (_lang: Locale): NavLink[] => [];
