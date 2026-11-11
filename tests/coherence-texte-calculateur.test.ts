/**
 * Un même cas, un seul chiffre (audit et testeurs naïfs du 2026-11-09, RECETTE §17.4 point 6) : l'accueil disait
 * 10 407 $ dans le texte et 10 426 $ dans le calculateur (tendance arrondie à 2,6 % d'un côté, exacte de l'autre),
 * la page prépayée 9 792 $ dans le tableau et 9 804 $ dans le calculateur. Ces tests rendent les calculateurs
 * avec leurs valeurs par défaut et comparent leurs chiffres à ceux que le texte des pages tire du moteur.
 */
import { existsSync, readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import FuneralCalc from '../src/components/calc/FuneralCalc';
import { FC_DEFAULTS } from '../src/lib/fc-defaults';
import * as E from '../src/lib/engine/funeral';
import { getSpec } from '../src/lib/mini-specs';
import { pageById } from '../src/lib/guides';
import { helpers } from '../src/lib/helpers';
import { formatMoney } from '../src/lib/format';

const m = (n: number) => formatMoney(Math.round(n), 0);
const txt = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/&nbsp;| | /g, ' ').replace(/\s+/g, ' ');
const has = (hay: string, money: string) => txt(hay).includes(money.replace(/ | /g, ' '));
const gap = E.funeralGap({ ...FC_DEFAULTS });

describe('calculateur principal : mêmes chiffres que le texte de l’accueil', () => {
  it('le champ de tendance affiche 2,6 % mais, non modifié, le moteur garde la tendance exacte', () => {
    expect(E.trendFromField(E.trendField())).toBe(E.funeralTrend());
    expect(E.trendFromField(3)).toBe(0.03);
  });
  it('« Someone has died » : coût de l’État aujourd’hui puis reste à payer', () => {
    const html = renderToStaticMarkup(createElement(FuneralCalc, { methodHref: '/m/' }));
    expect(has(html, m(gap.today))).toBe(true);
    expect(has(html, m(gap.gapToday))).toBe(true);
    expect(txt(html)).toContain('Example, not your result yet');
    expect(txt(html)).not.toMatch(/Gap at|life table\)/);
  });
  it('« Planning ahead » : même âge médian, même tendance, même dollar', () => {
    const html = renderToStaticMarkup(createElement(FuneralCalc, { methodHref: '/m/', mode: 'plan' }));
    expect(has(html, m(gap.future))).toBe(true);
    expect(has(html, m(gap.gapFuture))).toBe(true);
  });
  it('Social Security non comptée par défaut', () => {
    expect(FC_DEFAULTS.ssa).toBe(false);
    expect(gap.ssa).toBe(0);
  });
  it.skipIf(!existsSync('dist/en/index.html'))('le HTML construit de l’accueil porte ces chiffres et aucun autre pour ce cas', () => {
    const page = readFileSync('dist/en/index.html', 'utf8');
    for (const x of [gap.today, gap.gapToday, gap.future, gap.gapFuture]) expect(has(page, m(x)), m(x)).toBe(true);
    // l'ancien écart (tendance arrondie à 2,6 %) ne doit plus paraître
    const arrondi = E.funeralGap({ ...FC_DEFAULTS, trend: E.trendField() / 100 });
    if (Math.round(arrondi.future) !== Math.round(gap.future)) expect(has(page, m(arrondi.future))).toBe(false);
  });
});

describe('page prépayée : calculateur et tableau d’accord', () => {
  it('65 ans, femme (l’exemple unique du site) : même âge médian et même coût futur que la ligne 65 du tableau', () => {
    const spec = getSpec('prepaid');
    const v = Object.fromEntries(spec.inputs.map((i) => [i.id, i.def]));
    const out = spec.run(v, {});
    const c = E.prepaidCase({ price: E.spendToday('TX').all as number, age: 65, sex: 'f', rate: 0.02, state: E.STATES[v.state] });
    expect(v.age).toBe(65); expect(v.price).toBe(Math.round(E.spendToday('TX').all as number));
    // prix chargé = moyenne de l'État : même dollar futur que l'accueil
    expect(out.rows[0][1]).toBe(m(E.funeralGap({ ...FC_DEFAULTS }).future));
    expect(E.STATES[v.state]).toBe('TX');
    // même femme de 65 ans au Texas : même âge médian que l’accueil et la page assurance obsèques (testeurs du 2026-11-10)
    expect(c.median).toBe(E.medianAgeAtDeath(65, 'f', 'TX'));
    expect(out.rows[0][1]).toBe(m(c.later));
    expect(out.rows[0][0]).toContain(`age ${Math.floor(c.median)}`);
    const body = pageById('prepaid-funeral')!.body(helpers(true));
    expect(has(body, m(c.later))).toBe(true);
  });
});

describe('mêmes valeurs par défaut d’une page à l’autre', () => {
  it('tout champ État part du Texas, toute question Social Security de « non »', () => {
    for (const k of ['state', 'cremation', 'burial', 'seniors', 'prepaid']) {
      const st = getSpec(k).inputs.find((i) => i.id === 'state')!;
      expect(st.options![st.def].label, k).toBe('Texas');
    }
    for (const k of ['cremation', 'va']) expect(getSpec(k).inputs.find((i) => i.id === 'ssa')!.def, k).toBe(0);
    for (const id of ['funeral-costs-by-state', 'burial-insurance', 'life-insurance-for-seniors']) {
      const p = pageById(id)!; const s = p.tool?.props?.state;
      if (s !== undefined) expect(E.STATES[s as number], id).toBe('TX');
    }
  });
});
