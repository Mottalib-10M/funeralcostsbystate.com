/** llms.txt (RECETTE §21): what the site is, where its figures come from, its main pages. Built from the data. */
import type { APIRoute } from 'astro';
import { PAGES } from '../lib/guides';
import { route } from '../i18n/routes';
import { SITE_URL, LAST_UPDATED } from '../data/site-config';
import { P } from '../lib/engine/params';
import * as E from '../lib/engine/funeral';
import { formatMoney } from '../lib/format';
import { monthLabel } from '../lib/helpers';
export const GET: APIRoute = () => {
  const m = (n: number) => formatMoney(Math.round(n), 0);
  const us = E.spendPerDeath('US').all as number;
  const va = E.vaAllowance('nonService');
  const lines = [
    '# Funeral Costs by State',
    '',
    `> What funeral homes, cemeteries and crematories took in per death in each US state: 2022 Economic Census revenue (NAICS 8122) divided by Census death estimates, ${m(us)} per death nationally in 2022, carried to ${monthLabel(E.latestMonth)} with the BLS CPI-U funeral expenses index. Then what is already paid: the VA burial allowance (${m(P.va.serviceConnected)} for a service-connected death, ${m(va.burial)} plus ${m(va.plot)} for a plot otherwise, for deaths on or after ${P.va.nonService[0].from}) and the Social Security lump-sum death payment of ${m(P.ssa.lumpSum)}. Final expense, burial and life insurance pages judge a policy on the premium the reader types, against the NCHS life tables (United States 2024, states 2022). The site shows no insurer or funeral home prices and asks for no contact details. Figures read on ${LAST_UPDATED}. Published by Radif Partners, an independent publisher; not an insurer, broker, funeral home or government agency, no personal advice. Life tables: Source: CDC/NCHS, available free at cdc.gov; no endorsement by the CDC is implied.`,
    '',
    '## Calculators',
    `- [Funeral cost calculator by state](${SITE_URL}${route('home', 'en')}): spending per death in your state today and at the likely age of death, after the VA allowance, the Social Security payment, savings and cover held.`,
    ...PAGES.map((p) => `- [${p.nav}](${SITE_URL}${route(p.id, 'en')}): ${p.card}`),
    '',
    '## Method',
    `- [How the figures are worked out](${SITE_URL}${route('method', 'en')})`,
    `- [About](${SITE_URL}${route('about', 'en')})`,
  ];
  return new Response(lines.join('\n') + '\n', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
