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
const stateIn = (def: E.StateCode = 'TX') => ({ id: 'state', label: 'State', def: stateIndex(def), options: ST });
const trendPct = E.trendField();
const SPOUSE = { id: 'ssa', label: 'A surviving husband or wife, or a child under 18?', def: 0, options: YESNO, help: `Only they can claim the ${m(P.ssa.lumpSum)} that Social Security pays once` };
const usToday = () => E.spendToday('US').all as number;
const VA_KIND = [{ value: '0', label: 'Caused by service, since Sept. 11, 2001' }, { value: '1', label: 'Caused by service, before Sept. 11, 2001' }, { value: '2', label: 'Not caused by service (most cases)' }, { value: '3', label: 'Not caused by service, in a VA hospital' }];
const dd = (iso: string) => displayDate(iso, 'en-US');
const DATE_BANDS = P.va.nonService.map((x, i) => ({ value: String(i), label: i === 0 ? `On or after ${dd(x.from)}` : `${dd(x.from)} to ${dd(P.va.nonService[i - 1].from)}` }));

const SPECS: Record<string, MiniSpec> = {
  state: {
    title: 'Funeral and cemetery spending per death, by state', cta: 'Your own funeral gap, with VA and Social Security', ctaPage: 'home',
    inputs: [stateIn('TX')],
    run: (v) => { const s = st(v.state); const t = E.spendToday(s); const p = E.spendPerDeath(s);
      return { head: [`Spent per death in ${E.stateName(s)}, today`, m(t.all as number)], rows: [['Funeral homes', t.homes == null ? 'withheld by Census' : m(t.homes)], ['Cemeteries and crematories', t.cemeteries == null ? 'withheld by Census' : m(t.cemeteries)], ['Same figure in 2022 dollars', m(p.all as number)], ['Rank among 51, highest first', `${E.rankOf(s)}`], ['United States, today', m(usToday())]], note: 'Census 2022 revenue of death-care businesses divided by deaths, brought forward with the BLS funeral index. An average of every kind of funeral, not a quote.' }; },
  },
  inflation: {
    title: 'A funeral price carried to today', cta: 'Funeral costs in your state', ctaPage: 'funeral-costs-by-state',
    inputs: [money('amount', 'A funeral bill or price', Math.round(E.spendPerDeath('US').all as number), 'Loaded: US spending per death in 2022'), { id: 'year', label: 'Year of that price', def: 2022, max: E.lastFullYear, help: `${E.firstYear} to ${E.lastFullYear}` }, { id: 'ahead', label: 'Years from now', def: 10, unit: 'yrs', max: 60 }],
    run: (v) => { const y = Math.max(E.firstYear, Math.min(E.lastFullYear, Math.round(v.year))); const now = E.toToday(v.amount, y); const tr = E.funeralTrend();
      return { head: ['Same funeral at today’s prices', m(now)], rows: [['Funeral prices since then', pct(E.latestFuneralIndex / E.funeralAnnual(y) - 1)], ['All consumer prices, same years', pct(E.allItemsAnnual(E.lastFullYear) / E.allItemsAnnual(y) - 1)], [`In ${formatNumber(v.ahead, 0)} years at ${pct(tr, 1)} a year`, m(E.grow(now, tr, v.ahead))]], note: 'BLS CPI-U, funeral expenses (CUUR0000SEGD02), annual average of the year typed against the latest month. The all-items line stops at the last full year.' }; },
  },
  cremation: {
    title: 'A cremation price list, added up', cta: 'Funeral costs in your state', ctaPage: 'funeral-costs-by-state',
    inputs: [stateIn('TX'), money('services', 'Funeral home charges, direct cremation included', 1500, 'Basic services, transfer, paperwork, the cremation itself'), money('crematory', 'Crematory fee, if listed apart', 400), money('items', 'Urn, copies, other items', 300), { id: 'vet', label: 'Was the person a veteran?', def: 0, options: [{ value: '0', label: 'No, or no VA condition is met' }, { value: '1', label: 'Veteran on a VA pension or compensation, or in VA care' }, { value: '2', label: 'Veteran whose death was caused by military service' }] }, SPOUSE],
    run: (v) => { const s = st(v.state); const total = v.services + v.crematory + v.items; const va = E.vaAllowance(v.vet === 2 ? 'service' : v.vet === 1 ? 'nonService' : 'none'); const ss = E.ssaLumpSum(v.ssa === 1);
      return { head: ['Your price list adds up to', m(total)], rows: [['VA burial allowance, if a VA condition is met', va.burial > 0 ? `− ${m(va.burial)}` : 'none'], ['Social Security, for a spouse or young child', ss > 0 ? `− ${m(ss)}` : 'none'], ['Left to pay', m(Math.max(0, total - va.burial - ss))], [`For comparison: all funerals in ${E.stateName(s)}, per death`, m(E.spendToday(s).all as number)]], note: 'The amounts loaded are an example to type over, not prices we read anywhere. The comparison line averages every kind of funeral, burials included. The VA plot allowance is left out because a cremation may not use a plot.' }; },
  },
  gpl: {
    title: 'Package price or itemized: what the list lets you drop', cta: 'Cost of cremation', ctaPage: 'cremation-cost',
    inputs: [money('pkg', 'Package price quoted', 9000), money('chosen', 'Items you want, added from the list', 6500, 'Goods and services you choose'), money('cash', 'Cash advance items', 600, 'Fees the home pays for you')],
    run: (v) => { const item = v.chosen + v.cash; const save = v.pkg + v.cash - item;
      return { head: ['Itemizing would save', m(Math.max(0, v.pkg - v.chosen))], rows: [['Package plus cash advances', m(v.pkg + v.cash)], ['Your own selection plus cash advances', m(item)], ['Difference', save >= 0 ? m(save) : `package ${m(-save)} cheaper`]], note: 'Example amounts to type over. Under the FTC Funeral Rule you may buy only the items you want, and the home must give you its General Price List.' }; },
  },
  va: {
    title: 'VA burial allowance for one veteran', cta: 'The whole funeral gap', ctaPage: 'home',
    inputs: [{ id: 'kind', label: 'Was the death caused by military service?', def: 2, options: VA_KIND }, { id: 'band', label: 'Date of death', def: 0, options: DATE_BANDS }, { id: 'marker', label: 'Headstone or marker allowance claimed', def: 0, options: YESNO }, SPOUSE],
    run: (v) => { const b = P.va.nonService[Math.max(0, Math.min(P.va.nonService.length - 1, Math.round(v.band)))]; const kind: E.Veteran = v.kind >= 2 ? 'nonService' : 'service';
      const date = v.kind === 1 ? '2001-01-01' : b.from; const a = E.vaAllowance(kind, date, v.kind === 3); const hsKnown = b.from >= P.va.headstone[P.va.headstone.length - 1].from; const hs = v.marker === 1 && hsKnown ? E.headstoneAllowance(b.from) : 0; const ss = E.ssaLumpSum(v.ssa === 1);
      return { head: ['Most the VA pays: burial, plot and marker', m(a.total + hs)], rows: [['Burial allowance', m(a.burial)], ['Plot or interment allowance', a.plot > 0 ? m(a.plot) : 'none for this kind of death'], ['Headstone or marker allowance', hs > 0 ? m(hs) : v.marker === 1 ? 'see va.gov for that date' : 'not claimed'], ['Social Security lump sum, paid apart, not by the VA', ss > 0 ? m(ss) : 'none']], note: `Maximum amounts from va.gov.${kind === 'nonService' ? ' For a death not caused by service, the VA pays only if the veteran was on a VA pension or compensation, had a claim pending, or died in VA care.' : ''} The person paying must not be repaid by another body, and a dishonorable discharge rules it out.` }; },
  },
  prepaid: {
    title: 'Prepay the funeral or set money aside', cta: 'Burial insurance against the same funeral', ctaPage: 'burial-insurance',
    inputs: [money('price', 'Prepaid price quoted today', Math.round(E.spendToday('US').homes as number), 'Example: US average funeral home spending per death, not a quote'), ageIn(70), { id: 'sex', label: 'Sex', def: 1, options: SEX }, { id: 'rate', label: 'Your savings earn, a year', def: 3, unit: '%', max: 20, decimals: 1, help: 'Your own assumption' }, { id: 'trend', label: 'Funeral prices rise, a year', def: trendPct, unit: '%', max: 20, decimals: 1 }],
    run: (v) => { const r = E.prepaidCase({ price: v.price, age: v.age, sex: sx(v.sex), rate: v.rate / 100, trend: E.trendFromField(v.trend) });
      return { head: ['To save instead, set aside today', m(r.need)], rows: [[`Same funeral at age ${formatNumber(r.median, 1)}, the age half of people reach`, m(r.later)], ['Prepaid price today', m(v.price)], [r.need > v.price ? 'Prepaying costs less by' : 'Saving costs less by', m(Math.abs(r.need - v.price))]], note: 'Age at death from the United States life table (National Center for Health Statistics): this calculator uses US figures, not your state. A prepaid contract only fixes what it lists, and protection of the money differs by state.' }; },
  },
  final: {
    title: 'Final expense policy: when premiums pass the face amount', cta: 'What a funeral will cost by then', ctaPage: 'burial-insurance',
    inputs: [ageIn(65), { id: 'sex', label: 'Sex', def: 0, options: SEX }, money('premium', 'Your quoted premium, a month', 60), money('face', 'Amount the policy pays (face amount)', 10000), { id: 'stop', label: 'Premiums stop at', def: 0, unit: 'yrs', max: 121, help: '0 if paid for life' }],
    run: (v) => { const r = E.finalExpense({ age: v.age, sex: sx(v.sex), premium: v.premium, face: v.face, stopAge: v.stop });
      return { head: ['Your premiums add up to what the policy pays at', age1(r.breakEvenAge)], rows: [['Chance of being alive then', pct(r.aliveAtBreakEven)], ['Premiums paid, on average, before death', m(r.expected)], ['Half of people your age live past', age1(r.median)], ['Most you can pay in', Number.isFinite(r.maxPaid) ? m(r.maxPaid) : 'no limit']], note: 'United States life tables 2024 (National Center for Health Statistics), whole population: US figures, not your state. Uses only the premium you type: no price is suggested.' }; },
  },
  burial: {
    title: 'A fixed face amount against a rising funeral bill', cta: 'Final expense break-even', ctaPage: 'final-expense-insurance',
    inputs: [stateIn('TX'), ageIn(70), { id: 'sex', label: 'Sex', def: 1, options: SEX }, money('face', 'Amount the policy pays (face amount)', 10000)],
    run: (v) => { const s = st(v.state); const med = E.medianAgeAtDeath(v.age, sx(v.sex), s); const n = Math.max(0, med - v.age); const tr = E.funeralTrend(); const later = E.grow(E.spendToday(s).all as number, tr, n);
      return { head: [`Share of the funeral it pays at ${age1(med)}`, pct(v.face / later)], rows: [[`Spending per death in ${E.stateName(s)} by then`, m(later)], ['What that amount will buy, at today’s prices', m(v.face / Math.pow(1 + tr, n))], ['Still to find', m(Math.max(0, later - v.face))]], note: `Median age at death from the ${E.stateName(s)} life table (NCHS 2022); funeral prices rising ${pct(tr, 1)} a year, the BLS trend from ${P.cpi.trendFrom} to ${P.cpi.trendTo}.` }; },
  },
  graded: {
    title: 'Graded benefit: the waiting period in numbers', cta: 'Break-even of the same policy', ctaPage: 'final-expense-insurance',
    inputs: [ageIn(70), { id: 'sex', label: 'Sex', def: 0, options: SEX }, money('premium', 'Your quoted premium, a month', 50), money('face', 'Amount the policy pays (face amount)', 8000), { id: 'years', label: 'Waiting period', def: 2, unit: 'yrs', max: 5 }, { id: 'refund', label: 'Interest added to premiums refunded', def: 10, unit: '%', max: 100, help: 'As written in the policy' }],
    run: (v) => { const g = Math.round(v.years); const r = E.finalExpense({ age: v.age, sex: sx(v.sex), premium: v.premium, face: v.face, gradedYears: g, gradedRefund: v.refund / 100 });
      return { head: [`Chance of dying in the first ${g} ${g === 1 ? 'year' : 'years'}`, pct(r.dieInGraded)], rows: [['Paid on a death in year 1', m(r.paidIfDeathInYear(1))], [`Paid on a death in year ${Math.max(1, g)}`, m(r.paidIfDeathInYear(Math.max(1, g)))], [`Paid from year ${g + 1}`, m(r.paidIfDeathInYear(g + 1))]], note: 'Refund modeled as premiums paid plus the percentage you type. Many policies pay the full amount at once for an accidental death: read yours.' }; },
  },
  need: {
    title: 'How much life insurance: the DIME sum', cta: 'Chance a term policy pays out', ctaPage: 'term-life-insurance-rates-by-age',
    inputs: [money('income', 'Income to replace, a year', 60000), { id: 'years', label: 'For how many years', def: 15, unit: 'yrs', max: 50 }, money('debts', 'Debts other than the mortgage', 15000), money('mortgage', 'Mortgage balance', 220000), money('education', 'Education to fund', 40000), money('funeral', 'Funeral', Math.round(usToday()), 'Loaded: US spending per death, today'), money('savings', 'Savings the family could use', 25000), money('group', 'Life cover at work', 0), money('existing', 'Policies you already hold', 0)],
    run: (v) => { const r = E.lifeNeed({ income: v.income, years: v.years, debts: v.debts, mortgage: v.mortgage, education: v.education, funeral: v.funeral, savings: v.savings, group: v.group, existing: v.existing, ssa: true, veteran: 'none' });
      return { head: ['Life insurance still needed', m(r.need)], rows: [['Debt, income, mortgage, education, funeral', m(r.gross)], ['Income part alone', m(r.income)], ['Already there, with the Social Security lump sum', `− ${m(r.have)}`]], note: 'No interest or inflation on the income part: the two are left to cancel. Social Security survivor benefits are not counted; ssa.gov gives your own estimate.' }; },
  },
  term: {
    title: 'Term life: the chance of a claim and two federal rate tables', cta: 'How much cover to buy', ctaPage: 'how-much-life-insurance',
    inputs: [ageIn(40), { id: 'sex', label: 'Sex', def: 0, options: SEX }, { id: 'term', label: 'Term', def: 20, unit: 'yrs', max: 50 }, money('cover', 'Cover amount', 500000)],
    run: (v) => { const p = E.payoutChance(v.age, v.term, sx(v.sex)); let vg = 0; for (let k = 0; k < Math.round(v.term); k++) vg += 12 * E.vgliMonthly(v.age + k, v.cover);
      return { head: ['Chance the policy pays out', pct(p)], rows: [['Ends with no claim', pct(1 - p)], ['VGLI, a month at this age', m2(E.vgliMonthly(v.age, v.cover))], ['VGLI over the whole term, by age band', m(vg)], ['IRS cost of employer cover, a year', m(E.imputedIncome(v.age, v.cover).cost)]], note: `NCHS US life tables 2024. VGLI is the VA group plan for veterans (rates of ${P.vgli.asOf}, up to ${m(P.vgli.max)}); the IRS line is Table 2-2. Neither is a market quote.` }; },
  },
  whole: {
    title: 'Whole life: the premium at which you pay in what it pays out', cta: 'Final expense break-even', ctaPage: 'final-expense-insurance',
    inputs: [ageIn(55), { id: 'sex', label: 'Sex', def: 1, options: SEX }, money('face', 'Amount the policy pays (face amount)', 25000), money('premium', 'Your quoted premium, a month', 0, '0 to see the yardstick only')],
    run: (v) => { const r = E.finalExpense({ age: v.age, sex: sx(v.sex), premium: 1, face: v.face }); const yrsPaid = r.expected / 12; const fair = v.face / (12 * yrsPaid);
      const q = v.premium > 0 ? E.finalExpense({ age: v.age, sex: sx(v.sex), premium: v.premium, face: v.face }) : null;
      return { head: ['Monthly premium where expected premiums equal the face', m2(fair)], rows: [['Years of premiums, on average', yrs(yrsPaid)], ['Half of people your age live past', age1(r.median)], ...(q ? [['Your quote: premiums equal the face at', age1(q.breakEvenAge)] as [string, string], ['Your quote: paid in, on average', m(q.expected)] as [string, string]] : [])], note: 'A yardstick from the NCHS US life table, with no interest, expenses or cash value. It is not a price: an insurer adds costs and invests the premiums.' }; },
  },
  seniors: {
    title: 'Cover after 60: how long it has to last', cta: 'Final expense break-even', ctaPage: 'final-expense-insurance',
    inputs: [stateIn('TX'), ageIn(68), { id: 'sex', label: 'Sex', def: 1, options: SEX }, { id: 'term', label: 'Term of a policy', def: 10, unit: 'yrs', max: 40 }],
    run: (v) => { const s = st(v.state); const p = E.payoutChance(v.age, v.term, sx(v.sex), s);
      return { head: [`Chance a ${formatNumber(v.term, 0)}-year term pays out`, pct(p)], rows: [['Alive when it ends', pct(1 - p)], ['Half of people your age live past', age1(E.medianAgeAtDeath(v.age, sx(v.sex), s))], ['One in four live past', age1(E.ageAtQuantile(v.age, sx(v.sex), 0.75, s))], ['VGLI per $10,000, a month at this age', m2(E.vgliMonthly(v.age, 10000))]], note: `${E.stateName(s)} life table (NCHS 2022), whole population. VGLI is the VA plan for veterans, shown as a published federal rate, not a market price.` }; },
  },
  surrender: {
    title: 'Cash value policy: tax on a surrender', cta: 'Is a payout taxable?', ctaPage: 'life-insurance-taxes',
    inputs: [money('cash', 'Cash surrender value', 40000), money('paid', 'Premiums paid in total', 30000), money('loans', 'Policy loans outstanding', 0), { id: 'rate', label: 'Your federal income tax rate', def: 22, unit: '%', max: 50 }],
    run: (v) => { const r = E.surrenderTax(v.cash, v.paid, v.rate / 100, v.loans);
      return { head: ['Federal tax on the surrender', m(r.tax)], rows: [['Taxable gain over premiums paid', m(r.gain)], ['Cash paid to you', m(r.proceeds)], ['Left after the tax', m(r.net)]], note: 'IRS Publication 525: the part of a surrender above the premiums paid is ordinary income. Dividends taken in cash and modified endowment contracts change the sum.' }; },
  },
  iul: {
    title: 'Indexed universal life: what the cap and floor do', cta: 'Tax on a cash value surrender', ctaPage: 'cash-value-life-insurance',
    inputs: [{ id: 'y1', label: 'Index change, year 1', def: 18, unit: '%', max: 100, help: 'Your own test path' }, { id: 'y2', label: 'Year 2', def: -12, unit: '%', max: 100 }, { id: 'y3', label: 'Year 3', def: 7, unit: '%', max: 100 }, { id: 'y4', label: 'Year 4', def: 24, unit: '%', max: 100 }, { id: 'y5', label: 'Year 5', def: 3, unit: '%', max: 100 }, { id: 'cap', label: 'Cap', def: 9, unit: '%', max: 50, decimals: 1 }, { id: 'par', label: 'Participation rate', def: 100, unit: '%', max: 300 }, { id: 'floor', label: 'Floor', def: 0, unit: '%', max: 10, decimals: 1 }],
    run: (v) => { const ch = [v.y1, v.y2, v.y3, v.y4, v.y5].map((x) => x / 100); const r = E.iulYears(ch, v.cap / 100, v.par / 100, v.floor / 100);
      const ann = (x: number) => Math.pow(1 + x, 1 / ch.length) - 1;
      return { head: ['Credited over the five years', pct(r.credited, 1)], rows: [['Index over the same years', pct(r.index, 1)], ['Credited, a year on average', pct(ann(r.credited), 1)], ['Index, a year on average', pct(ann(r.index), 1)]], note: 'Interest credited on the account before charges. The index changes are a path you type, not market data; index dividends are never credited.' }; },
  },
  estate: {
    title: 'A payout counted in the estate: federal estate tax', cta: 'Tax on employer group cover', ctaPage: 'life-insurance-taxes',
    inputs: [money('estate', 'Estate without the policy', 14000000), money('payout', 'Death benefit', 2000000), money('ported', 'Unused exclusion of a late spouse', 0, 'Portability (DSUE), if elected'), { id: 'spouse', label: 'Everything goes to a US citizen spouse', def: 0, options: YESNO }],
    run: (v) => { const r = E.estateTaxOnPayout(v.estate, v.payout, v.ported, v.spouse === 1);
      return { head: ['Extra estate tax caused by the payout', m(r.extra)], rows: [['Exclusion available', m(r.exclusion)], ['Tax without the policy', m(r.without)], ['Tax with it', m(r.withIt)], ['Payout left to the heirs', m(r.kept)]], note: `${P.year} basic exclusion, top rate ${pct(P.estate.topRate, 0)} above it. Lifetime gifts, deductions and state estate taxes are left out.` }; },
  },
  imputed: {
    title: `Employer group-term life above the first ${m(P.irsTable22.exclusion)}`, cta: 'Term rates by age', ctaPage: 'term-life-insurance-rates-by-age',
    inputs: [ageIn(45, 'Age at the end of the year'), money('cover', 'Group-term cover from work', 200000), money('paid', 'What you paid for it after tax, a year', 100)],
    run: (v) => { const r = E.imputedIncome(v.age, v.cover, v.paid);
      return { head: ['Added to your taxable wages', m(r.taxable)], rows: [['Cover above the exclusion', m(r.excess)], ['IRS cost per $1,000, a month', m2(r.monthly)], ['Cost of that cover for the year', m(r.cost)]], note: 'IRS Publication 15-B, Table 2-2. Social Security and Medicare taxes apply to it too; income tax withholding is optional for the employer.' }; },
  },
};

export function getSpec(kind: string, _lang = 'en'): MiniSpec {
  const s = SPECS[kind];
  if (!s) throw new Error(`Unknown mini spec ${kind}`);
  return s;
}
export const SPEC_IDS = Object.keys(SPECS);
