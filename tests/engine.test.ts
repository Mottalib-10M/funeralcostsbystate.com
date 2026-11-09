/** Engine tests (RECETTE §17.3, §17.4): each case is computed by hand from the source it cites. */
import { describe, it, expect } from 'vitest';
import * as E from '../src/lib/engine/funeral';
import { P } from '../src/lib/engine/params';
import DC from '../src/data/death-care-2022.json';
import LT from '../src/data/life-tables.json';
import CPI from '../src/data/cpi-funeral.json';

describe('Census 2022 death-care revenue per death', () => {
  it('holds the 50 states and DC, with homes + cemeteries = total where both are published', () => {
    expect(E.STATES.length).toBe(51);
    for (const s of E.STATES) { const r = (DC.states as any)[s]; if (r.homes != null && r.cemeteries != null) expect(r.homes + r.cemeteries).toBe(r.all); }
    expect(DC.us.homes + DC.us.cemeteries).toBe(DC.us.all);
  });
  it('United States: $23,396,061,000 over the mean of 3,456,354 and 3,154,285 deaths', () => {
    expect(E.deaths2022('US')).toBe((3456354 + 3154285) / 2);
    expect(E.spendPerDeath('US').all).toBeCloseTo(23396061000 / 3305319.5, 6);
    expect(Math.round(E.spendPerDeath('US').all as number)).toBe(7078);
  });
  it('Texas: $1,726,191,000 over (261,155 + 232,364) / 2 deaths', () => {
    expect(E.spendPerDeath('TX').all).toBeCloseTo(1726191000 / 246759.5, 6);
  });
  it('withheld figures stay empty (Alaska and Wyoming split), never estimated', () => {
    expect(E.spendPerDeath('AK').homes).toBeNull();
    expect(E.spendPerDeath('WY').cemeteries).toBeNull();
    expect(E.spendPerDeath('AK').all).not.toBeNull();
  });
  it('ranking covers every state once, highest first', () => {
    const r = E.ranking();
    expect(new Set(r.map((x) => x.s)).size).toBe(51);
    for (let i = 1; i < r.length; i++) expect(r[i - 1].v).toBeGreaterThanOrEqual(r[i].v);
    expect(E.rankOf(r[0].s)).toBe(1);
  });
});

describe('BLS funeral price index', () => {
  it('series CUUR0000SEGD02 reads 100 in December 1986 (base) and the 2022 annual average as published', () => {
    expect((CPI.funeral.monthly as any)['1986-12']).toBe(100);
    expect(E.funeralAnnual(2022)).toBe(360.161);
  });
  it('today = 2022 figure × latest month ÷ 2022 average', () => {
    const k = E.latestFuneralIndex / 360.161;
    expect(E.spendToday('US').factor).toBeCloseTo(k, 12);
    expect(E.spendToday('US').all).toBeCloseTo((E.spendPerDeath('US').all as number) * k, 6);
  });
  it('trend is the geometric mean change 2015 to 2025', () => {
    expect(E.funeralTrend()).toBeCloseTo(Math.pow(405.187 / 313.676, 1 / 10) - 1, 12);
    expect(E.grow(100, 0.1, 2)).toBeCloseTo(121, 9);
    expect(E.toToday(1000, 2022)).toBeCloseTo(1000 * E.latestFuneralIndex / 360.161, 9);
  });
});

describe('NCHS life tables', () => {
  it('holds 101 ages for both sexes, United States and 51 states', () => {
    for (const s of ['m', 'f'] as const) { expect((LT.us as any)[s].qx.length).toBe(101); for (const st of E.STATES) expect((LT.states as any)[st][s].qx.length).toBe(101); }
  });
  it('reads the published values (US 2024 women: q65 0.00996, e0 81.45, e65 20.83; Texas 2022 women: q65 0.01151)', () => {
    expect(E.qx(65, 'f')).toBeCloseTo(0.009963, 6);
    expect(E.lifeExpectancy(0, 'f')).toBeCloseTo(81.45, 2);
    expect(E.lifeExpectancy(65, 'f')).toBeCloseTo(20.83, 2);
    expect(E.qx(65, 'f', 'TX')).toBeCloseTo(0.0115078, 6);
  });
  it('survival is the product of yearly rates; payout chance its complement', () => {
    let s = 1; for (let a = 40; a < 60; a++) s *= 1 - E.qx(a, 'm');
    expect(E.payoutChance(40, 20, 'm')).toBeCloseTo(1 - s, 12);
    expect(E.survival(50, 0, 'f')).toBe(1);
    expect(E.payoutChance(60, 10, 'm')).toBeGreaterThan(E.payoutChance(40, 10, 'm'));
  });
  it('median age at death sits where survival crosses one half', () => {
    for (const st of ['US', 'TX', 'MS', 'HI'] as const) {
      const med = E.medianAgeAtDeath(65, 'f', st);
      expect(E.survival(65, med - 65, 'f', st)).toBeCloseTo(0.5, 3);
    }
    expect(E.ageAtQuantile(70, 'm', 0.75)).toBeGreaterThan(E.medianAgeAtDeath(70, 'm'));
  });
});

describe('VA and Social Security', () => {
  it('reads va.gov: $2,000 service-connected after 9/11/2001, $1,500 before', () => {
    expect(E.vaAllowance('service').total).toBe(2000);
    expect(E.vaAllowance('service', '2001-09-10').total).toBe(1500);
  });
  it('non-service-connected: $1,032 + $1,032 from October 1, 2026; $1,002 + $1,002 the year before; $300 + $893 late 2022', () => {
    expect(E.vaAllowance('nonService')).toEqual({ burial: 1032, plot: 1032, total: 2064 });
    expect(E.vaAllowance('nonService', '2026-09-30').total).toBe(2004);
    expect(E.vaAllowance('nonService', '2022-12-01')).toEqual({ burial: 300, plot: 893, total: 1193 });
    expect(E.vaAllowance('nonService', '2022-12-01', true)).toEqual({ burial: 893, plot: 893, total: 1786 });
    expect(E.vaAllowance('nonService', '2023-02-01', true).total).toBe(1786);
    expect(E.vaAllowance('nonService', '2013-10-01').plot).toBe(734);
    expect(E.vaAllowance('none').total).toBe(0);
  });
  it('headstone or marker allowance: $420 from October 1, 2026, $441 the year before', () => {
    expect(E.headstoneAllowance()).toBe(420);
    expect(E.headstoneAllowance('2026-01-15')).toBe(441);
  });
  it('Social Security lump sum: $255 (20 CFR 404.390)', () => {
    expect(E.ssaLumpSum(true)).toBe(255);
    expect(E.ssaLumpSum(false)).toBe(0);
  });
  it('funeral gap = future cost − VA − SSA − savings − cover, never below zero', () => {
    const g = E.funeralGap({ state: 'TX', age: 65, sex: 'f', veteran: 'nonService', ssa: true, saved: 1000, cover: 0, trend: 0 });
    expect(g.future).toBeCloseTo(g.today, 9);
    expect(g.gapFuture).toBeCloseTo(g.today - 2064 - 255 - 1000, 6);
    expect(E.funeralGap({ state: 'TX', age: 65, sex: 'f', veteran: 'none', ssa: false, saved: 1e6, cover: 0 }).gapFuture).toBe(0);
    expect(E.funeralGap({ state: 'TX', age: 65, sex: 'f', veteran: 'none', ssa: false, saved: 0, cover: 0, plan: 5000, trend: 0 }).today).toBe(5000);
  });
});

describe('policies', () => {
  it('final expense: $60 a month for $10,000 at 65 reaches the face amount after 13.9 years', () => {
    const r = E.finalExpense({ age: 65, sex: 'm', premium: 60, face: 10000 });
    expect(r.breakEvenAge).toBeCloseTo(65 + 10000 / 720, 9);
    expect(r.aliveAtBreakEven).toBeCloseTo(E.survival(65, 10000 / 720, 'm'), 12);
    expect(E.finalExpense({ age: 65, sex: 'm', premium: 60, face: 10000, stopAge: 70 }).breakEvenAge).toBe(Infinity);
  });
  it('graded benefit: premiums plus 10% in the period, face amount after', () => {
    const r = E.finalExpense({ age: 70, sex: 'm', premium: 50, face: 8000, gradedYears: 2, gradedRefund: 0.1 });
    expect(r.paidIfDeathInYear(1)).toBeCloseTo(660, 9);
    expect(r.paidIfDeathInYear(2)).toBeCloseTo(1320, 9);
    expect(r.paidIfDeathInYear(3)).toBe(8000);
    expect(r.dieInGraded).toBeCloseTo(E.payoutChance(70, 2, 'm'), 12);
  });
  it('DIME need adds the five lines and takes off what is there', () => {
    const r = E.lifeNeed({ income: 50000, years: 10, debts: 10000, mortgage: 200000, education: 30000, funeral: 8000, savings: 20000, group: 50000, existing: 0, ssa: true, veteran: 'none' });
    expect(r.gross).toBe(748000);
    expect(r.need).toBe(748000 - 20000 - 50000 - 255);
  });
  it('VGLI: $1.40 per $10,000 a month at 40 to 44, capped at $500,000', () => {
    expect(E.vgliMonthly(42, 100000)).toBeCloseTo(14, 9);
    expect(E.vgliMonthly(82, 1000000)).toBeCloseTo(50 * 44, 9);
  });
  it('IRS Publication 15-B example: Tom, 45, $200,000 of cover, paid $100, has $170 of taxable income', () => {
    const r = E.imputedIncome(45, 200000, 100);
    expect(r.cost).toBeCloseTo(270, 9);
    expect(r.taxable).toBeCloseTo(170, 9);
    expect(E.imputedIncome(30, 50000).cost).toBe(0);
  });
});

describe('taxes', () => {
  it('estate tax: nothing under the 2026 exclusion of $15,000,000, 40% above it', () => {
    expect(P.estate.basicExclusion).toBe(15000000);
    expect(E.estateTaxOnPayout(10000000, 2000000).extra).toBe(0);
    expect(E.estateTaxOnPayout(14000000, 2000000).extra).toBeCloseTo(400000, 6);
    expect(E.estateTaxOnPayout(14000000, 2000000, 5000000).extra).toBe(0);
    expect(E.estateTaxOnPayout(20000000, 2000000, 0, true).extra).toBe(0);
  });
  it('Form 706 Table A: $345,800 on the first $1,000,000, 40% above', () => {
    expect(E.tentativeTax(2000000)).toBeCloseTo(745800, 6);
  });
  it('surrender: gain above premiums paid is taxed; a loss gives no tax', () => {
    expect(E.surrenderTax(40000, 30000, 0.22)).toEqual({ proceeds: 40000, gain: 10000, tax: 2200, net: 37800 });
    expect(E.surrenderTax(20000, 25000, 0.22).tax).toBe(0);
  });
  it('IUL: floor and cap bound each yearly credit', () => {
    expect(E.iulCredit(-0.2, 0.09, 1, 0)).toBe(0);
    expect(E.iulCredit(0.25, 0.09, 1, 0)).toBe(0.09);
    expect(E.iulCredit(0.1, 0.12, 0.6, 0)).toBeCloseTo(0.06, 12);
    expect(E.iulYears([0.1, -0.1], 1, 1, -1).index).toBeCloseTo(1.1 * 0.9 - 1, 12);
  });
});
