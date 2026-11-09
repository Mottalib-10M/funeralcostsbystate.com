/**
 * Engine of the site: pure functions, no network, every figure read from `params-2026.json` or the three
 * data files built by `scripts/data/build-data.py` (Census 2022, NCHS life tables, BLS CPI).
 * Nothing here is a price quote: death-care spending per death is what funeral homes, cemeteries and
 * crematories took in, divided by deaths; insurance premiums only ever come from the user.
 */
import { P } from './params';
import DC from '../../data/death-care-2022.json';
import LT from '../../data/life-tables.json';
import CPI from '../../data/cpi-funeral.json';

export type Sex = 'm' | 'f';
export type StateCode = keyof typeof DC.states;
export const STATES = Object.keys(DC.states).sort((a, b) => (DC.states as any)[a].name.localeCompare((DC.states as any)[b].name)) as StateCode[];
export const stateName = (s: StateCode | 'US') => (s === 'US' ? 'United States' : (DC.states as any)[s].name as string);
type Row = { all: number | null; homes: number | null; cemeteries: number | null; estab: number | null; estabHomes: number | null; estabCemeteries: number | null; deathsEst2022: number; deathsEst2023: number; pop2022: number };
const row = (s: StateCode | 'US'): Row => (s === 'US' ? DC.us : (DC.states as any)[s]) as Row;

// ---------------------------------------------------------------- deaths and death-care spending, 2022
/** Deaths in calendar 2022, estimated as the mean of the two Census estimate years (July to June) that straddle it. */
export const deaths2022 = (s: StateCode | 'US') => (row(s).deathsEst2022 + row(s).deathsEst2023) / 2;
export interface Spend { all: number | null; homes: number | null; cemeteries: number | null; deaths: number; establishments: number | null; deathsPerEstablishment: number | null }
/** Revenue of death-care businesses (NAICS 8122) in 2022 divided by deaths: dollars per death, 2022 dollars. */
export function spendPerDeath(s: StateCode | 'US'): Spend {
  const r = row(s); const d = deaths2022(s);
  const per = (x: number | null) => (x == null ? null : x / d);
  return { all: per(r.all), homes: per(r.homes), cemeteries: per(r.cemeteries), deaths: d, establishments: r.estab, deathsPerEstablishment: r.estab ? d / r.estab : null };
}
/** States ranked by spending per death, highest first. */
export const ranking = () => STATES.map((s) => ({ s, v: spendPerDeath(s).all as number })).sort((a, b) => b.v - a.v);
export const rankOf = (s: StateCode) => ranking().findIndex((x) => x.s === s) + 1;

// ---------------------------------------------------------------- funeral price index (BLS)
const FM = CPI.funeral.monthly as Record<string, number>;
const FA = CPI.funeral.annual as Record<string, number>;
const AA = CPI.all.annual as Record<string, number>;
const AM = CPI.all.monthly as Record<string, number>;
export const latestMonth = Object.keys(FM).sort().at(-1)!; // "2026-09"
export const latestFuneralIndex = FM[latestMonth];
export const funeralAnnual = (y: number) => FA[String(y)];
export const allItemsAnnual = (y: number) => AA[String(y)];
export const firstYear = Math.min(...Object.keys(FA).map(Number));
export const lastFullYear = Math.max(...Object.keys(FA).map(Number));
/** Annual average change of the funeral index between two years (geometric). */
export const funeralTrend = (from = P.cpi.trendFrom, to = P.cpi.trendTo) => Math.pow(FA[String(to)] / FA[String(from)], 1 / (to - from)) - 1;
export const allItemsTrend = (from = P.cpi.trendFrom, to = P.cpi.trendTo) => Math.pow(AA[String(to)] / AA[String(from)], 1 / (to - from)) - 1;
/** Year-on-year change of the funeral index in the latest month published. */
export function funeralYoY() {
  const [y, m] = latestMonth.split('-'); const prev = `${Number(y) - 1}-${m}`;
  return { month: latestMonth, funeral: FM[latestMonth] / FM[prev] - 1, all: AM[latestMonth] / AM[prev] - 1 };
}
/** Bring a funeral price of a past year to the latest month, with the funeral index. */
export const toToday = (amount: number, year: number) => amount * latestFuneralIndex / FA[String(year)];
/** Death-care spending per death carried from 2022 to the latest month of the funeral index. */
export function spendToday(s: StateCode | 'US') {
  const p = spendPerDeath(s); const k = latestFuneralIndex / FA[String(P.cpi.baseYear)];
  return { all: p.all == null ? null : p.all * k, homes: p.homes == null ? null : p.homes * k, cemeteries: p.cemeteries == null ? null : p.cemeteries * k, factor: k };
}
/** A cost of today grown at a yearly rate for some years. */
export const grow = (amount: number, rate: number, years: number) => amount * Math.pow(1 + rate, Math.max(0, years));

// ---------------------------------------------------------------- life tables (NCHS)
type Table = { qx: number[]; ex: number[] };
const tbl = (sex: Sex, s: StateCode | 'US'): Table => (s === 'US' ? (LT.us as any)[sex] : (LT.states as any)[s][sex]);
const A = (age: number) => Math.max(0, Math.min(100, Math.floor(age)));
export const qx = (age: number, sex: Sex, s: StateCode | 'US' = 'US') => tbl(sex, s).qx[A(age)];
export const lifeExpectancy = (age: number, sex: Sex, s: StateCode | 'US' = 'US') => tbl(sex, s).ex[A(age)];
/** Probability of being alive `years` from now (whole years, then a straight line inside the last year). */
export function survival(age: number, years: number, sex: Sex, s: StateCode | 'US' = 'US') {
  let p = 1; let a = A(age); let left = Math.max(0, years);
  while (left >= 1) { p *= 1 - qx(a, sex, s); a = Math.min(100, a + 1); left -= 1; }
  if (left > 0) p *= 1 - left * qx(a, sex, s);
  return p;
}
/** Chance of dying within the term: what a term policy's payout odds look like on population rates. */
export const payoutChance = (age: number, term: number, sex: Sex, s: StateCode | 'US' = 'US') => 1 - survival(age, term, sex, s);
/** Age by which a share `q` of people of this age and sex have died (q = 0.5 is the median age at death). */
export function ageAtQuantile(age: number, sex: Sex, q: number, s: StateCode | 'US' = 'US') {
  let p = 1; let a = A(age);
  for (let k = 0; k < 130; k++) {
    const q1 = a >= 100 ? 0.5 : qx(a, sex, s); const next = p * (1 - q1);
    if (1 - next >= q) return age + k + (p - (1 - q)) / (p - next);
    p = next; a = Math.min(100, a + 1);
  }
  return Infinity;
}
export const medianAgeAtDeath = (age: number, sex: Sex, s: StateCode | 'US' = 'US') => ageAtQuantile(age, sex, 0.5, s);

// ---------------------------------------------------------------- what the government pays
export type Veteran = 'none' | 'nonService' | 'service';
/** VA burial allowance for a death on a given date (va.gov): service-connected, or non-service-connected burial + plot. */
export function vaAllowance(kind: Veteran, deathDate: string = P.va.nonService[0].from, inVaCare = false) {
  if (kind === 'none') return { burial: 0, plot: 0, total: 0 };
  if (kind === 'service') { const b = deathDate >= P.va.serviceConnectedCutoff ? P.va.serviceConnected : P.va.serviceConnectedBefore2001; return { burial: b, plot: 0, total: b }; }
  // Hospitalized by VA at death: a separate table before January 5, 2023; the same amounts from that date.
  const list = inVaCare && deathDate < P.va.vaCareSameFrom ? P.va.nonServiceVaCare : P.va.nonService;
  const r = list.find((x) => deathDate >= x.from) ?? list[list.length - 1];
  return { burial: r.burial, plot: r.plot, total: r.burial + r.plot };
}
export const headstoneAllowance = (deathDate: string = P.va.headstone[0].from) => (P.va.headstone.find((x) => deathDate >= x.from) ?? P.va.headstone[P.va.headstone.length - 1]).amount;
/** Social Security lump-sum death payment (20 CFR 404.390): $255 to an eligible spouse or child. */
export const ssaLumpSum = (eligible: boolean) => (eligible ? P.ssa.lumpSum : 0);

// ---------------------------------------------------------------- the funeral gap
export interface GapIn { state: StateCode; age: number; sex: Sex; veteran: Veteran; ssa: boolean; saved: number; cover: number; trend?: number; plan?: number }
/** Today's typical spending in the state, carried to the median age at death at the funeral trend, less what is paid. */
export function funeralGap(i: GapIn) {
  const today = (i.plan && i.plan > 0 ? i.plan : spendToday(i.state).all) as number;
  const trend = i.trend ?? funeralTrend();
  const median = medianAgeAtDeath(i.age, i.sex, i.state);
  const years = Math.max(0, median - i.age);
  const future = grow(today, trend, years);
  const va = vaAllowance(i.veteran).total; const ss = ssaLumpSum(i.ssa);
  const paid = va + ss + i.saved + i.cover;
  return { today, trend, median, years, future, va, ssa: ss, paid, gapFuture: Math.max(0, future - paid), gapToday: Math.max(0, today - paid) };
}

// ---------------------------------------------------------------- final expense policies
export interface FinalIn { age: number; sex: Sex; state?: StateCode | 'US'; premium: number; face: number; stopAge?: number; gradedYears?: number; gradedRefund?: number }
/**
 * A level-premium policy with a fixed face amount, priced by the user's own quote. Returns the age at which
 * premiums paid equal the face amount, the chance of being alive then, the expected premiums before death,
 * and the chance of dying inside a graded (waiting) period, when only premiums plus a refund are paid back.
 */
export function finalExpense(i: FinalIn) {
  const s = i.state ?? 'US';
  const yearly = i.premium * 12;
  const stop = i.stopAge && i.stopAge > i.age ? i.stopAge : Infinity;
  const maxPaid = Number.isFinite(stop) ? yearly * (stop - i.age) : Infinity;
  const be = yearly > 0 ? i.face / yearly : Infinity;
  const breakEvenAge = i.age + be <= stop ? i.age + be : Infinity;
  const aliveAtBreakEven = Number.isFinite(breakEvenAge) ? survival(i.age, breakEvenAge - i.age, i.sex, s) : 0;
  let expected = 0; let p = 1; let a = i.age;
  for (let k = 0; k < 120 && p > 1e-6; k++) { if (a < stop) expected += p * yearly; p *= 1 - qx(a, i.sex, s); a += 1; }
  const g = i.gradedYears ?? 0;
  const dieInGraded = g > 0 ? payoutChance(i.age, g, i.sex, s) : 0;
  return { yearly, breakEvenAge, aliveAtBreakEven, expected, maxPaid, median: medianAgeAtDeath(i.age, i.sex, s), lifeExp: lifeExpectancy(i.age, i.sex, s), dieInGraded,
    paidIfDeathInYear: (year: number) => (year <= g ? Math.min(i.face, yearly * year * (1 + (i.gradedRefund ?? 0))) : i.face) };
}

// ---------------------------------------------------------------- how much life insurance (DIME)
export interface NeedIn { income: number; years: number; debts: number; mortgage: number; education: number; funeral: number; savings: number; group: number; existing: number; ssa: boolean; veteran: Veteran }
export function lifeNeed(i: NeedIn) {
  const income = i.income * i.years;
  const gross = i.debts + income + i.mortgage + i.education + i.funeral;
  const state = ssaLumpSum(i.ssa) + vaAllowance(i.veteran).total;
  const have = i.savings + i.group + i.existing + state;
  return { income, gross, state, have, need: Math.max(0, gross - have) };
}

// ---------------------------------------------------------------- official group rates
const band = <T extends { from: number; to: number }>(bands: T[], age: number) => bands.find((b) => age >= b.from && age <= b.to) ?? bands[bands.length - 1];
/** VGLI monthly premium (va.gov rates as of 1 July 2025), coverage in $10,000 steps up to $500,000. */
export function vgliMonthly(age: number, amount: number) {
  const units = Math.min(P.vgli.max, Math.max(0, Math.round(amount / 10000) * 10000)) / 10000;
  return units * band(P.vgli.bands, age).per10k;
}
/** IRS Table 2-2: taxable cost of employer group-term life above $50,000, for a year (Publication 15-B). */
export function imputedIncome(age: number, coverage: number, employeePaid = 0, months = 12) {
  const excess = Math.max(0, coverage - P.irsTable22.exclusion);
  const monthly = band(P.irsTable22.bands, age).cost;
  const cost = (excess / 1000) * monthly * months;
  return { excess, monthly, cost, taxable: Math.max(0, cost - employeePaid) };
}

// ---------------------------------------------------------------- taxes on a policy
/** Federal estate tax caused by a payout counted in the estate (owner = insured, Schedule D), at 2026 rules. */
export function estateTaxOnPayout(estate: number, payout: number, ported = 0, toSpouse = false) {
  const exclusion = P.estate.basicExclusion + Math.max(0, ported);
  const tax = (x: number) => Math.max(0, x - exclusion) * P.estate.topRate; // both amounts sit in the 40 % bracket above $1M
  const without = toSpouse ? 0 : tax(estate);
  const withIt = toSpouse ? 0 : tax(estate + payout);
  return { exclusion, without, withIt, extra: withIt - without, kept: payout - (withIt - without) };
}
/** Unified rate schedule, top bracket only (Form 706, Table A): tentative tax on an amount above $1,000,000. */
export const tentativeTax = (x: number) => (x <= P.estate.topBracketFrom ? NaN : P.estate.topBracketBase + (x - P.estate.topBracketFrom) * P.estate.topRate);
/** Surrender for cash: the part above premiums paid is ordinary income (Publication 525). */
export function surrenderTax(cashValue: number, premiumsPaid: number, rate: number, loans = 0) {
  const proceeds = cashValue - loans;
  const gain = Math.max(0, cashValue - premiumsPaid);
  return { proceeds, gain, tax: gain * rate, net: proceeds - gain * rate };
}

// ---------------------------------------------------------------- indexed universal life crediting
/** Credited rate for one segment: participation × index change, capped, never below the floor. */
export const iulCredit = (indexChange: number, cap: number, participation: number, floor: number) => Math.max(floor, Math.min(cap, participation * indexChange));
export function iulYears(changes: number[], cap: number, participation: number, floor: number) {
  let v = 1; let raw = 1;
  for (const c of changes) { v *= 1 + iulCredit(c, cap, participation, floor); raw *= 1 + c; }
  return { credited: v - 1, index: raw - 1 };
}
