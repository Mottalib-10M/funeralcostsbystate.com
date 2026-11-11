/**
 * Mini-calculators, one per subject (RECETTE §9.3). Each one calls the tested engine of
 * `lib/engine/funeral.ts`; none computes on its own. A page sets its defaults with the `props` of its
 * ToolDef (same ids). No insurer or funeral home price is ever shown: a premium or a quote appears only
 * when the user types it, and the amounts loaded in the price-list tools are examples to type over.
 */
import type { MiniSpec } from './mini-types';
import { P } from './engine/params';
import * as E from './engine/funeral';
import { formatMoney as fm, formatNumber, displayDate } from './format';
import { pct } from './pct';

const m = (n: number) => fm(Math.round(n), 0);
const m2 = (n: number) => fm(n, 2);
const yrs = (n: number) => `${formatNumber(n, 1)} years`;
const age1 = (n: number) => (Number.isFinite(n) ? `age ${formatNumber(Math.floor(n), 0)}` : 'never');
const SEX = [{ value: '0', label: 'Male' }, { value: '1', label: 'Female' }];
const sx = (v: number): E.Sex => (v === 1 ? 'f' : 'm');
const ST = E.STATES.map((s, i) => ({ value: String(i), label: E.stateName(s) }));
export const stateIndex = (s: E.StateCode) => E.STATES.indexOf(s);
const st = (v: number): E.StateCode => E.STATES[Math.max(0, Math.min(E.STATES.length - 1, Math.round(v)))];
const YESNO = [{ value: '0', label: 'No' }, { value: '1', label: 'Yes' }];
const money = (id: string, label: string, def: number, help?: string) => ({ id, label, def, unit: '$', max: 50_000_000, help });
const ageIn = (def: number, label = 'Age today') => ({ id: 'age', label, def, unit: 'yrs', max: 100 });
const stateIn = (def: E.StateCode = 'TX') => ({ id: 'state', label: 'State', def: stateIndex(def), options: ST, help: `Shown first: ${E.stateName(def)}, as an example. Pick your own state.` });
const trendPct = E.trendField();
const SPOUSE = { id: 'ssa', label: 'A surviving husband or wife, or a child under 18?', def: 0, options: YESNO, vue: 'boutons' as const, help: `Only they can claim the ${m(P.ssa.lumpSum)} that Social Security pays once. Not sure? Choose No: that money is then not counted.` };
// Question vétéran (testeurs du 2026-11-09, tour final : « No, or no VA condition is met » incompréhensible) :
// les conditions sont dans les réponses, l'aide dit quand le VA paie.
export const VET_OPTIONS = [{ value: '0', label: 'No' }, { value: '1', label: 'Yes, and on VA pension or disability pay, or in VA care' }, { value: '2', label: 'Yes, and the death was caused by military service' }, { value: '3', label: 'Yes, but none of these' }, { value: '4', label: 'Not sure' }];
// Testeurs naïfs du 2026-11-10 : les cas sont nommés dans l'aide (la liste fermée ne les montrait pas) ; « Not sure » ne compte rien.
export const VET_HELP = 'The VA (Department of Veterans Affairs) pays only if the death was caused by military service, or if the veteran was on a VA pension or disability pay, had a VA claim open, or died in VA care. Not sure? Choose “Not sure”: no VA money is counted.';
const vetKind = (x: number): E.Veteran => (x === 1 ? 'nonService' : x === 2 ? 'service' : 'none');
const usToday = () => E.spendToday('US').all as number;
const VA_KIND = [{ value: '0', label: 'Caused by service, since Sept. 11, 2001' }, { value: '1', label: 'Caused by service, before Sept. 11, 2001' }, { value: '2', label: 'Not caused by service (most cases)' }, { value: '3', label: 'Not caused by service, in a VA hospital' }];
const dd = (iso: string) => displayDate(iso, 'en-US');
const DATE_BANDS = P.va.nonService.map((x, i) => ({ value: String(i), label: i === 0 ? `On or after ${dd(x.from)}` : `${dd(x.from)} to ${dd(P.va.nonService[i - 1].from)}` }));

const SPECS: Record<string, MiniSpec> = {
  state: {
    title: 'Average funeral cost, by state', cta: 'What is left to pay after the VA, Social Security and savings', ctaPage: 'home', sansMention: true,
    inputs: [stateIn('TX')],
    run: (v) => { const s = st(v.state); const t = E.spendToday(s);
      return { head: [`Average funeral cost in ${E.stateName(s)} today`, m(t.all as number)], sous: `Every kind of funeral in ${E.stateName(s)}, from a simple cremation to a full burial, at today’s prices. Not a quote.`, rows: [['Funeral homes', t.homes == null ? 'withheld by Census' : m(t.homes)], ['Cemeteries and crematories', t.cemeteries == null ? 'withheld by Census' : m(t.cemeteries)], ['Rank among the 50 states and DC (1 = most expensive)', `${E.rankOf(s)}`], ['United States average, today', m(usToday())]], note: 'What funeral homes, cemeteries and crematories in the state took in per death in 2022 (Census Bureau), updated to today’s prices.' }; },
  },
  inflation: {
    title: 'A funeral price carried to today', cta: 'Funeral costs in your state', ctaPage: 'funeral-costs-by-state',
    inputs: [money('amount', 'A funeral bill or price', Math.round(E.spendPerDeath('US').all as number), 'Loaded: US spending per death in 2022'), { id: 'year', label: 'Year of that price', def: 2022, max: E.lastFullYear, help: `${E.firstYear} to ${E.lastFullYear}` }, { id: 'ahead', label: 'Years from now', def: 10, unit: 'yrs', max: 60 }],
    run: (v) => { const y = Math.max(E.firstYear, Math.min(E.lastFullYear, Math.round(v.year))); const now = E.toToday(v.amount, y); const tr = E.funeralTrend();
      return { head: ['Same funeral at today’s prices', m(now)], sous: `What ${m(v.amount)} paid in ${y} is worth at today’s funeral prices.`, rows: [['Funeral prices since then', pct(E.latestFuneralIndex / E.funeralAnnual(y) - 1)], ['All consumer prices, same years', pct(E.allItemsAnnual(E.lastFullYear) / E.allItemsAnnual(y) - 1)], [`In ${formatNumber(v.ahead, 0)} years at ${pct(tr, 1)} a year`, m(E.grow(now, tr, v.ahead))]], note: 'Labor Department index of funeral prices (Bureau of Labor Statistics), yearly average of the year typed against the latest month. The all-prices line stops at the last full year.' }; },
  },
  cremation: {
    title: 'A cremation price list, added up', cta: 'Funeral costs in your state', ctaPage: 'funeral-costs-by-state',
    exemple: (v) => `a direct cremation in ${E.stateName(st(v.state))}: ${m(v.services)} of funeral home charges, a ${m(v.crematory)} crematory fee and ${m(v.items)} of other items, no veteran, no spouse or young child`,
    inputs: [stateIn('TX'), money('services', 'Funeral home charges, direct cremation included', 1500, 'Basic services, transfer, paperwork, the cremation itself. No list yet? Keep the example and call a funeral home.'), money('crematory', 'Crematory fee, if listed apart', 400, 'Leave it empty if the list has no separate crematory line.'), money('items', 'Urn, copies, other items', 300), { id: 'vet', label: 'Was the person a veteran?', def: 0, options: VET_OPTIONS, help: VET_HELP }, SPOUSE],
    run: (v, touched) => { const s = st(v.state); const total = v.services + v.crematory + v.items; const va = E.vaAllowance(vetKind(v.vet)); const ss = E.ssaLumpSum(v.ssa === 1);
      const exemple = !touched || !Object.keys(touched).length;
      return { head: [exemple ? 'This example price list adds up to' : 'Your price list adds up to', m(total)], sous: 'Funeral home, crematory and other items, before any help is taken off.', rows: [['VA (Veterans Affairs) burial allowance', va.burial > 0 ? `− ${m(va.burial)}` : 'none'], ['Social Security, for a spouse or young child', ss > 0 ? `− ${m(ss)}` : 'none'], ['Left to pay', m(Math.max(0, total - va.burial - ss))], [`For comparison: the average funeral in ${E.stateName(s)}, burials included`, m(E.spendToday(s).all as number)]], note: 'The amounts loaded are an example to type over, not prices we read anywhere. The VA plot allowance is not counted here: it helps only when the ashes go into a grave or a niche (a space in a wall for an urn).' }; },
  },
  gpl: {
    title: 'Package price or itemized: what the list lets you drop', cta: 'Cost of cremation', ctaPage: 'cremation-cost',
    inputs: [money('pkg', 'Package price quoted', 9000), money('chosen', 'Items you want, added from the list', 6500, 'Goods and services you choose'), money('cash', 'Cash advance items', 600, 'Fees the home pays for you')],
    run: (v) => { const item = v.chosen + v.cash; const save = v.pkg + v.cash - item;
      return { head: ['Itemizing would save', m(Math.max(0, v.pkg - v.chosen))], sous: 'Package price against only the items you want, from the same price list.', rows: [['Package plus cash advances', m(v.pkg + v.cash)], ['Your own selection plus cash advances', m(item)], ['Difference', save >= 0 ? m(save) : `package ${m(-save)} cheaper`]], note: 'Example amounts to type over. Under the FTC Funeral Rule you may buy only the items you want, and the home must give you its General Price List.' }; },
  },
  va: {
    title: 'VA burial allowance for one veteran', cta: 'What is left to pay for the whole funeral, after the VA', ctaPage: 'home',
    exemple: () => `a veteran on a VA pension who died of a cause not linked to service, on or after ${dd(P.va.nonService[0].from)}, with no headstone claim`,
    inputs: [{ id: 'kind', label: 'Was the death caused by military service?', def: 2, options: VA_KIND },
      { id: 'ok', label: 'Was the veteran on VA pension or disability pay, had a VA claim open, or in VA care?', def: 1, options: [...YESNO, { value: '2', label: 'Not sure' }], vue: 'boutons', help: 'Matters only for a death not caused by service. Not sure? Choose Not sure: no VA money is counted, and the VA decides.' },
      { id: 'band', label: 'Date of death', def: 0, options: DATE_BANDS }, { id: 'marker', label: 'Headstone or marker allowance claimed', def: 0, options: YESNO, vue: 'boutons' }, SPOUSE],
    run: (v) => { const b = P.va.nonService[Math.max(0, Math.min(P.va.nonService.length - 1, Math.round(v.band)))]; const kind: E.Veteran = v.kind >= 2 ? 'nonService' : 'service';
      // Testeurs du 2026-11-09 (tour final) : 2 064 $ affiché sans demander si une condition du VA est remplie.
      const horsCondition = kind === 'nonService' && v.kind !== 3 && v.ok !== 1;
      const date = v.kind === 1 ? '2001-01-01' : b.from; const a0 = E.vaAllowance(kind, date, v.kind === 3); const a = horsCondition ? { burial: 0, plot: 0, total: 0 } : a0;
      const hsKnown = b.from >= P.va.headstone[P.va.headstone.length - 1].from; const hs = v.marker === 1 && hsKnown ? E.headstoneAllowance(b.from) : 0; const ss = E.ssaLumpSum(v.ssa === 1);
      const parts = [a.burial > 0 ? 'burial' : '', a.plot > 0 ? 'plot' : '', hs > 0 ? 'headstone' : ''].filter(Boolean);
      const quoi = parts.length > 1 ? `${parts.slice(0, -1).join(', ')} and ${parts.at(-1)}` : parts[0];
      // Règle « un chiffre par cas » (2026-11-10) : l'accueil suppose « pas vétéran » ; ici l'hypothèse change, le titre la dit avant le chiffre.
      const si = v.kind <= 1 ? 'If the death was caused by military service' : v.kind === 3 ? 'If the veteran died in a VA hospital' : 'If the veteran was on a VA pension or disability pay';
      const head = a.total + hs > 0 ? `${si}, most the VA pays (${quoi})` : 'The VA pays no burial allowance in this case';
      return { head: [head, m(a.total + hs)], sous: a.total + hs > 0 ? `Paid once, to whoever paid for the funeral, for a death ${v.kind === 0 ? 'on or after September 11, 2001' : v.kind === 1 ? 'before September 11, 2001' : Math.round(v.band) === 0 ? `on or after ${dd(b.from)}` : `from ${dd(b.from)}`}.` : 'Nothing is counted from the VA until one of its conditions is met.', rows: [['Burial allowance', a.burial > 0 ? m(a.burial) : 'none'], ['Plot allowance (for the grave or the ashes)', a.plot > 0 ? m(a.plot) : horsCondition ? 'none' : 'none for this kind of death'], ['Headstone or marker allowance', hs > 0 ? m(hs) : v.marker === 1 ? 'see va.gov for that date' : 'not claimed'], ['Social Security one-time payment, paid apart, not by the VA', ss > 0 ? m(ss) : 'none']], note: `Maximum amounts from va.gov.${horsCondition ? ` For a death not caused by service, the VA pays ${m(a0.burial)} and ${m(a0.plot)} only if the veteran was on a VA pension or disability pay, had a claim open, or died in VA care.` : kind === 'nonService' ? ' Paid because the veteran met one of the VA’s conditions (VA pension or disability pay, a claim open, or VA care).' : ''} The person paying must not be repaid by anyone else, such as an employer or another agency, and a dishonorable discharge rules it out.` }; },
  },
  prepaid: {
    title: 'Prepay the funeral or set money aside', cta: 'Burial insurance against the same funeral', ctaPage: 'burial-insurance',
    exemple: (v) => `a ${v.sex === 1 ? 'woman' : 'man'} of ${formatNumber(v.age, 0)} in ${E.stateName(st(v.state))} quoted ${m(v.price)} for a prepaid funeral, with savings earning ${formatNumber(v.rate, 1)}% a year`,
    inputs: [stateIn('TX'), money('price', 'Prepaid price quoted today', Math.round(E.spendToday('TX').all as number), `Loaded: the average Texas funeral today, ${m(E.spendToday('TX').all as number)}, the same figure as on the other pages. Type the price on your quote.`), ageIn(65), { id: 'sex', label: 'Sex', def: 1, options: SEX }, { id: 'rate', label: 'Interest your savings earn, a year', def: 3, unit: '%', max: 20, decimals: 1, help: 'What your bank pays on savings, after tax. Not sure? Keep 3, then try 1 to see the cautious case.' }, { id: 'trend', label: 'Funeral prices rise, a year', def: trendPct, unit: '%', max: 20, decimals: 1, help: `The rise of the federal index of funeral prices, ${P.cpi.trendFrom} to ${P.cpi.trendTo}. Not sure? Keep it.` }],
    // Un chiffre par cas (2026-11-10) : le prix chargé est la moyenne arrondie de l'État ; on garde la valeur exacte pour
    // que « $13,662 at age 85 » soit le même dollar qu'à l'accueil et sur la page assurance obsèques.
    run: (v) => { const s = st(v.state); const moy = E.spendToday(s).all as number; const price = v.price === Math.round(moy) ? moy : v.price; const r = E.prepaidCase({ price, age: v.age, sex: sx(v.sex), rate: v.rate / 100, trend: E.trendFromField(v.trend), state: s });
      return { head: ['To save instead, set aside today', m(r.need)], sous: `Enough to pay ${m(r.later)} at ${age1(r.median)}, with savings earning ${formatNumber(v.rate, 1)}% a year until then.`, rows: [[`Same funeral at ${age1(r.median)}, the age half of people reach`, m(r.later)], ['Prepaid price today', m(v.price)], [r.need > price ? 'Prepaying costs less by' : 'Saving costs less by', m(Math.abs(r.need - price))]], note: `Age at death from the ${E.stateName(s)} life table (National Center for Health Statistics, 2022). A prepaid contract only fixes what it lists, and how the money is protected differs by state.` }; },
  },
  final: {
    title: 'Final expense policy: when your premiums pass the payout', cta: 'Will the payout still cover a funeral by then?', ctaPage: 'burial-insurance',
    exemple: (v) => `a ${v.sex === 1 ? 'woman' : 'man'} of ${formatNumber(v.age, 0)} in ${E.stateName(st(v.state))} quoted ${m(v.premium)} a month for a policy that pays ${m(v.face)}, paid for life`,
    inputs: [stateIn('TX'), ageIn(65), { id: 'sex', label: 'Sex', def: 1, options: SEX }, money('premium', 'Your quoted premium, a month', 60, 'The monthly payment on the insurer’s quote. No quote yet? The 60 loaded is only an example.'), money('face', 'Amount the policy pays out (face amount)', 10000, 'The sum written on the policy, paid to your family at your death.'), { id: 'stop', label: 'How long you pay', def: 0, options: [{ value: '0', label: 'For life (most policies)' }, ...[85, 90, 95, 100].map((a) => ({ value: String(a), label: `Until age ${a}` }))], help: 'Written in the policy. Not sure? Keep “For life”.' }],
    run: (v) => { const s = st(v.state); const r = E.finalExpense({ age: v.age, sex: sx(v.sex), state: s, premium: v.premium, face: v.face, stopAge: v.stop });
      return { head: [`Your premiums add up to the ${m(v.face)} payout at`, age1(r.breakEvenAge)], sous: `Paying ${m(v.premium)} a month ${v.stop > 0 ? `until age ${formatNumber(v.stop, 0)}` : 'for life'}, from age ${formatNumber(v.age, 0)}.`, rows: [['Chance you are still alive, and still paying, at that age', Number.isFinite(r.breakEvenAge) ? pct(r.aliveAtBreakEven) : '—'], ['Premiums paid in, on average, before death', m(r.expected)], ['Half of people your age live past', age1(r.median)], ['How long you pay', Number.isFinite(r.maxPaid) ? `until age ${formatNumber(v.stop, 0)}, ${m(r.maxPaid)} in all` : 'for life']], note: `On average you would pay ${m(r.expected)} in premiums for a policy that pays ${m(v.face)}. Ages from the ${E.stateName(s)} life table (National Center for Health Statistics, 2022). Uses only the premium you type: no price is suggested.` }; },
  },
  burial: {
    title: 'A fixed payout against a rising funeral bill', cta: 'How many years of monthly payments match the payout', ctaPage: 'final-expense-insurance',
    exemple: (v) => `a ${v.sex === 1 ? 'woman' : 'man'} of ${formatNumber(v.age, 0)} in ${E.stateName(st(v.state))} with a policy that pays ${m(v.face)}`,
    inputs: [stateIn('TX'), ageIn(65), { id: 'sex', label: 'Sex', def: 1, options: SEX }, money('face', 'Amount the policy pays out (face amount)', 10000, 'The sum written on the policy, paid at death. Not sure? It is on the first page of the policy.')],
    run: (v) => { const s = st(v.state); const med = E.medianAgeAtDeath(v.age, sx(v.sex), s); const n = Math.max(0, med - v.age); const tr = E.funeralTrend(); const later = E.grow(E.spendToday(s).all as number, tr, n); const rest = Math.max(0, later - v.face);
      // Testeurs naïfs du 2026-11-10 (3 sur 3) : dollars « d'alors » et « d'aujourd'hui » mêlés dans le tableau. Le tableau est
      // tout en dollars d'alors ; la valeur d'aujourd'hui passe dans la note, nommée comme telle.
      return { head: [`Share of the funeral the policy pays at ${age1(med)}`, pct(v.face / later)], sous: `${age1(med).replace('age', 'Age')} is the age half of people like you reach in ${E.stateName(s)}. Funeral prices rising ${pct(tr, 1)} a year until then.`, rows: [[`Average funeral in ${E.stateName(s)} at ${age1(med)}, in dollars of that time`, m(later)], ['Your policy pays', m(v.face)], ['Left for the family to find then', m(rest)]], note: `Put another way, by then your ${m(v.face)} will buy what ${m(v.face / Math.pow(1 + tr, n))} buys today. Age from the ${E.stateName(s)} life table (National Center for Health Statistics, 2022); price trend from the federal index of funeral prices, ${P.cpi.trendFrom} to ${P.cpi.trendTo}.` }; },
  },
  graded: {
    title: 'Graded benefit: the waiting period in numbers', cta: 'Break-even of the same policy', ctaPage: 'final-expense-insurance',
    inputs: [ageIn(70), { id: 'sex', label: 'Sex', def: 0, options: SEX }, money('premium', 'Your quoted premium, a month', 50), money('face', 'Amount the policy pays (face amount)', 8000), { id: 'years', label: 'Waiting period', def: 2, unit: 'yrs', max: 5 }, { id: 'refund', label: 'Interest added to premiums refunded', def: 10, unit: '%', max: 100, help: 'As written in the policy' }],
    run: (v) => { const g = Math.round(v.years); const r = E.finalExpense({ age: v.age, sex: sx(v.sex), premium: v.premium, face: v.face, gradedYears: g, gradedRefund: v.refund / 100 });
      return { head: [`Chance of dying in the first ${g} ${g === 1 ? 'year' : 'years'}`, pct(r.dieInGraded)], sous: `For a ${v.sex === 1 ? 'woman' : 'man'} of ${formatNumber(v.age, 0)}, on the United States life table: in those years the policy pays back premiums, not the full amount.`, rows: [['Paid on a death in year 1', m(r.paidIfDeathInYear(1))], [`Paid on a death in year ${Math.max(1, g)}`, m(r.paidIfDeathInYear(Math.max(1, g)))], [`Paid from year ${g + 1}`, m(r.paidIfDeathInYear(g + 1))]], note: 'Refund modeled as premiums paid plus the percentage you type. Many policies pay the full amount at once for an accidental death: read yours.' }; },
  },
  need: {
    title: 'How much life insurance: the DIME sum', cta: 'Chance a term policy pays out', ctaPage: 'term-life-insurance-rates-by-age',
    inputs: [money('income', 'Income to replace, a year', 60000), { id: 'years', label: 'For how many years', def: 15, unit: 'yrs', max: 50 }, money('debts', 'Debts other than the mortgage', 15000), money('mortgage', 'Mortgage balance', 220000), money('education', 'Education to fund', 40000), money('funeral', 'Funeral', Math.round(usToday()), 'Loaded: US spending per death, today'), money('savings', 'Savings the family could use', 25000), money('group', 'Life cover at work', 0), money('existing', 'Policies you already hold', 0)],
    run: (v) => { const r = E.lifeNeed({ income: v.income, years: v.years, debts: v.debts, mortgage: v.mortgage, education: v.education, funeral: v.funeral, savings: v.savings, group: v.group, existing: v.existing, ssa: true, veteran: 'none' });
      return { head: ['Life insurance still needed', m(r.need)], sous: `To replace ${m(v.income)} a year for ${formatNumber(v.years, 0)} years and pay the debts, the mortgage, education and a funeral.`, rows: [['Debt, income, mortgage, education, funeral', m(r.gross)], ['Income part alone', m(r.income)], ['Already there, with the Social Security lump sum', `− ${m(r.have)}`]], note: 'No interest or inflation on the income part: the two are left to cancel. Social Security survivor benefits are not counted; ssa.gov gives your own estimate.' }; },
  },
  term: {
    title: 'Term life: the chance of a claim and two federal rate tables', cta: 'How much cover to buy', ctaPage: 'how-much-life-insurance',
    inputs: [ageIn(40), { id: 'sex', label: 'Sex', def: 0, options: SEX }, { id: 'term', label: 'Term', def: 20, unit: 'yrs', max: 50 }, money('cover', 'Cover amount', 500000)],
    run: (v) => { const p = E.payoutChance(v.age, v.term, sx(v.sex)); let vg = 0; for (let k = 0; k < Math.round(v.term); k++) vg += 12 * E.vgliMonthly(v.age + k, v.cover);
      return { head: ['Chance the policy pays out', pct(p)], sous: `A ${formatNumber(v.term, 0)}-year term bought at ${formatNumber(v.age, 0)}, on the United States life table.`, rows: [['Ends with no claim', pct(1 - p)], ['VGLI, a month at this age', m2(E.vgliMonthly(v.age, v.cover))], ['VGLI over the whole term, by age band', m(vg)], ['IRS cost of employer cover, a year', m(E.imputedIncome(v.age, v.cover).cost)]], note: `NCHS US life tables 2024. VGLI is the VA group plan for veterans (rates of ${P.vgli.asOf}, up to ${m(P.vgli.max)}); the IRS line is Table 2-2. Neither is a market quote.` }; },
  },
  whole: {
    title: 'Whole life: the premium at which you pay in what it pays out', cta: 'Final expense break-even', ctaPage: 'final-expense-insurance',
    inputs: [ageIn(55), { id: 'sex', label: 'Sex', def: 1, options: SEX }, money('face', 'Amount the policy pays (face amount)', 25000), money('premium', 'Your quoted premium, a month', 0, '0 to see the yardstick only')],
    run: (v) => { const r = E.finalExpense({ age: v.age, sex: sx(v.sex), premium: 1, face: v.face }); const yrsPaid = r.expected / 12; const fair = v.face / (12 * yrsPaid);
      const q = v.premium > 0 ? E.finalExpense({ age: v.age, sex: sx(v.sex), premium: v.premium, face: v.face }) : null;
      return { head: ['Monthly premium where expected premiums equal the face', m2(fair)], sous: `For a ${v.sex === 1 ? 'woman' : 'man'} of ${formatNumber(v.age, 0)}, paying for life, with no interest and no insurer costs.`, rows: [['Years of premiums, on average', yrs(yrsPaid)], ['Half of people your age live past', age1(r.median)], ...(q ? [['Your quote: premiums equal the face at', age1(q.breakEvenAge)] as [string, string], ['Your quote: paid in, on average', m(q.expected)] as [string, string]] : [])], note: 'A yardstick from the NCHS US life table, with no interest, expenses or cash value. It is not a price: an insurer adds costs and invests the premiums.' }; },
  },
  seniors: {
    title: 'Cover after 60: how long it has to last', cta: 'Final expense break-even', ctaPage: 'final-expense-insurance',
    inputs: [stateIn('TX'), ageIn(68), { id: 'sex', label: 'Sex', def: 1, options: SEX }, { id: 'term', label: 'Term of a policy', def: 10, unit: 'yrs', max: 40 }],
    run: (v) => { const s = st(v.state); const p = E.payoutChance(v.age, v.term, sx(v.sex), s);
      return { head: [`Chance a ${formatNumber(v.term, 0)}-year term pays out`, pct(p)], sous: `For a ${v.sex === 1 ? 'woman' : 'man'} of ${formatNumber(v.age, 0)} in ${E.stateName(s)}, on the state life table.`, rows: [['Alive when it ends', pct(1 - p)], ['Half of people your age live past', age1(E.medianAgeAtDeath(v.age, sx(v.sex), s))], ['One in four live past', age1(E.ageAtQuantile(v.age, sx(v.sex), 0.75, s))], ['VGLI per $10,000, a month at this age', m2(E.vgliMonthly(v.age, 10000))]], note: `${E.stateName(s)} life table (NCHS 2022), whole population. VGLI is the VA plan for veterans, shown as a published federal rate, not a market price.` }; },
  },
  surrender: {
    title: 'Cash value policy: tax on a surrender', cta: 'Is a payout taxable?', ctaPage: 'life-insurance-taxes',
    inputs: [money('cash', 'Cash surrender value', 40000), money('paid', 'Premiums paid in total', 30000), money('loans', 'Policy loans outstanding', 0), { id: 'rate', label: 'Your federal income tax rate', def: 22, unit: '%', max: 50 }],
    run: (v) => { const r = E.surrenderTax(v.cash, v.paid, v.rate / 100, v.loans);
      return { head: ['Federal tax on the surrender', m(r.tax)], sous: `At a ${formatNumber(v.rate, 0)}% federal income tax rate, on the part above the premiums paid.`, rows: [['Taxable gain over premiums paid', m(r.gain)], ['Cash paid to you', m(r.proceeds)], ['Left after the tax', m(r.net)]], note: 'IRS Publication 525: the part of a surrender above the premiums paid is ordinary income. Dividends taken in cash and modified endowment contracts change the sum.' }; },
  },
  iul: {
    title: 'Indexed universal life: what the cap and floor do', cta: 'Tax on a cash value surrender', ctaPage: 'cash-value-life-insurance',
    inputs: [{ id: 'y1', label: 'Index change, year 1', def: 18, unit: '%', max: 100, help: 'Your own test path' }, { id: 'y2', label: 'Year 2', def: -12, unit: '%', max: 100 }, { id: 'y3', label: 'Year 3', def: 7, unit: '%', max: 100 }, { id: 'y4', label: 'Year 4', def: 24, unit: '%', max: 100 }, { id: 'y5', label: 'Year 5', def: 3, unit: '%', max: 100 }, { id: 'cap', label: 'Cap', def: 9, unit: '%', max: 50, decimals: 1 }, { id: 'par', label: 'Participation rate', def: 100, unit: '%', max: 300 }, { id: 'floor', label: 'Floor', def: 0, unit: '%', max: 10, decimals: 1 }],
    run: (v) => { const ch = [v.y1, v.y2, v.y3, v.y4, v.y5].map((x) => x / 100); const r = E.iulYears(ch, v.cap / 100, v.par / 100, v.floor / 100);
      const ann = (x: number) => Math.pow(1 + x, 1 / ch.length) - 1;
      return { head: ['Credited over the five years', pct(r.credited, 1)], sous: `With a ${formatNumber(v.cap, 1)}% cap and a ${formatNumber(v.floor, 1)}% floor, on the five yearly changes you typed.`, rows: [['Index over the same years', pct(r.index, 1)], ['Credited, a year on average', pct(ann(r.credited), 1)], ['Index, a year on average', pct(ann(r.index), 1)]], note: 'Interest credited on the account before charges. The index changes are a path you type, not market data; index dividends are never credited.' }; },
  },
  estate: {
    title: 'A payout counted in the estate: federal estate tax', cta: 'Tax on employer group cover', ctaPage: 'life-insurance-taxes',
    inputs: [money('estate', 'Estate without the policy', 14000000), money('payout', 'Death benefit', 2000000), money('ported', 'Unused exclusion of a late spouse', 0, 'Portability (DSUE), if elected'), { id: 'spouse', label: 'Everything goes to a US citizen spouse', def: 0, options: YESNO }],
    run: (v) => { const r = E.estateTaxOnPayout(v.estate, v.payout, v.ported, v.spouse === 1);
      return { head: ['Extra estate tax caused by the payout', m(r.extra)], sous: `Federal estate tax in ${P.year}, when the policy is owned by the person who died.`, rows: [['Exclusion available', m(r.exclusion)], ['Tax without the policy', m(r.without)], ['Tax with it', m(r.withIt)], ['Payout left to the heirs', m(r.kept)]], note: `${P.year} basic exclusion, top rate ${pct(P.estate.topRate, 0)} above it. Lifetime gifts, deductions and state estate taxes are left out.` }; },
  },
  imputed: {
    title: `Employer group-term life above the first ${m(P.irsTable22.exclusion)}`, cta: 'Term rates by age', ctaPage: 'term-life-insurance-rates-by-age',
    inputs: [ageIn(45, 'Age at the end of the year'), money('cover', 'Group-term cover from work', 200000), money('paid', 'What you paid for it after tax, a year', 100)],
    run: (v) => { const r = E.imputedIncome(v.age, v.cover, v.paid);
      return { head: ['Added to your taxable wages', m(r.taxable)], sous: `For one year of ${m(v.cover)} of group-term cover at age ${formatNumber(v.age, 0)}.`, rows: [['Cover above the exclusion', m(r.excess)], ['IRS cost per $1,000, a month', m2(r.monthly)], ['Cost of that cover for the year', m(r.cost)]], note: 'IRS Publication 15-B, Table 2-2. Social Security and Medicare taxes apply to it too; income tax withholding is optional for the employer.' }; },
  },
};

export function getSpec(kind: string, _lang = 'en'): MiniSpec {
  const s = SPECS[kind];
  if (!s) throw new Error(`Unknown mini spec ${kind}`);
  return s;
}
export const SPEC_IDS = Object.keys(SPECS);
