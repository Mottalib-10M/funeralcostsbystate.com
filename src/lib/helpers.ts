/** Writing helpers handed to every page: links, numbers from the engine, tables, sources. */
import { route, ROUTES } from '../i18n/routes';
import { P, type SourceKey } from './engine/params';
import * as E from './engine/funeral';
import { formatMoney, formatNumber, displayDate } from './format';

const esc = (s: string | number) => String(s).replace(/&(?!(?:[a-z]+|#\d+);)/g, '&amp;').replace(/</g, '&lt;');
// Fiches sous 768 px (testeurs naïfs du 2026-11-08, lib/tableaux.ts) : classe `empile` dès 3 colonnes et
// `data-label` (nom de la colonne) sur chaque cellule, posés au build. Un rang en 1re colonne cède le titre de la
// fiche à la colonne suivante (le nom de l'État), le rang restant dans la fiche (`ficheTitre`, `data-titre`, report du 2026-11-08).
export function table(headers: string[], rows: Array<Array<string | number>>, caption?: string, align: Array<'l' | 'r'> = []) {
  const al = (i: number) => (align[i] === 'r' ? 'text-right' : 'text-left');
  const { classe } = attributsTableau('auto', headers.length);
  const nus = headers.map((h) => h.replace(/<[^>]+>/g, ''));
  const fiche = ficheTitre(nus, rows);
  const lab = (n: number) => etiquettes(nus, n, { titre: fiche.titre, nommer: false });
  return `<div class="not-prose my-6 overflow-x-auto"><table class="journal w-full text-sm${classe ? ` ${classe}` : ''}"${fiche.titre ? ' data-titre="2"' : ''}>${caption ? `<caption class="mb-2 text-left text-sm text-navy-600">${caption}</caption>` : ''}<thead><tr>${headers.map((h, i) => `<th scope="col" class="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-navy-700 ${al(i)}">${h}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => { const l = lab(r.length); return `<tr>${r.map((c, i) => `<td data-label="${l[i].replace(/"/g, '&quot;')}" class="tabular-nums border-b border-navy-100 px-3 py-2 text-navy-800 ${al(i)}">${typeof c === 'number' ? esc(formatNumber(c, 0)) : c}</td>`).join('')}</tr>`; }).join('')}</tbody></table></div>`;
}

import { pct } from './pct';
import { attributsTableau, etiquettes, ficheTitre } from './tableaux';
export { pct };

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
/** “September 2026” from "2026-09". */
export const monthLabel = (ym: string) => `${MONTHS[Number(ym.slice(5)) - 1]} ${ym.slice(0, 4)}`;

export function helpers(strict = false) {
  const m = (n: number) => formatMoney(Math.round(n), 0);
  const m2 = (n: number) => formatMoney(n, 2);
  const oneIn = (x: number) => (x > 0 ? `1 in ${formatNumber(Math.round(1 / x), 0)}` : 'none');
  const a = (id: string, text: string) => {
    if (!ROUTES.some((r) => r.id === id)) { if (strict) throw new Error(`Unknown page id in a link: ${id}`); return text; }
    return `<a href="${route(id, 'en')}">${text}</a>`;
  };
  const today = (s: E.StateCode | 'US') => E.spendToday(s).all as number;
  return {
    P,
    E,
    /** Link to another page of the site by id. */
    a,
    /** $2,363 (rounded to the dollar). */
    m,
    /** $123.25 (cents kept). */
    m2,
    num: (n: number) => formatNumber(n, 0),
    num1: (n: number) => formatNumber(n, 1),
    pc: pct,
    oneIn,
    /** “October 1, 2026” from an ISO date. */
    date: (iso: string) => displayDate(iso, 'en-US'),
    /** “September 2026”: latest month of the BLS funeral index. */
    month: monthLabel(E.latestMonth),
    D: { read: displayDate(P.retrieved_at, 'en-US'), vaFrom: displayDate(P.va.nonService[0].from, 'en-US'), vaPrev: displayDate(P.va.nonService[1].from, 'en-US') },
    /** Death-care spending per death in a state, brought to the latest month of the funeral index. */
    today,
    table,
    /** Link to an official source of the parameter file. */
    src: (key: SourceKey, text?: string) => { const s = P.sources[key]; return `<a href="${s.url}" target="_blank" rel="nofollow noopener noreferrer">${text ?? s.label.en}</a>`; },
    box: (title: string, html: string, kind: 'info' | 'tip' | 'warning' | 'example' = 'info') => `<div class="callout callout-${kind}"><span class="callout-title">${title}</span>${html}</div>`,
    /** Chance of dying within a term (NCHS life tables, population rates). */
    odds: (age: number, term: number, sex: E.Sex, s: E.StateCode | 'US' = 'US') => E.payoutChance(age, term, sex, s),
  };
}
export type Helpers = ReturnType<typeof helpers>;
