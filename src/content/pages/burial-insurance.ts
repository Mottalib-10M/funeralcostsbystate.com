import { definePage } from '../../lib/guide-types';
import { stateIndex } from '../../lib/mini-specs';

const FACE = 10000;
// Un seul exemple sur le site (testeurs naïfs du 2026-11-10, règle 1) : une femme de 65 ans au Texas, comme sur l'accueil.
const AGE = 65;

export default definePage({
  id: 'burial-insurance',
  group: 'final',
  order: 210,
  tool: { kind: 'mini:burial', props: { state: stateIndex('TX'), age: AGE, face: FACE } },
  related: ['final-expense-insurance', 'funeral-cost-inflation', 'prepaid-funeral', 'funeral-costs-by-state'],
  sources: ['census_ec', 'bls_cpi', 'nchs_states'],
  slug: 'burial-insurance',
  nav: 'Burial insurance',
  card: 'Whether a burial policy’s face amount will still cover a funeral in your state at the age you are likely to reach.',
  title: 'Burial Insurance: Will the Payout Cover a Funeral Later',
  description: 'Burial insurance against your state’s funeral spending: how much of the bill a fixed face amount pays at the age you are likely to reach, and what is left.',
  h1: 'Burial insurance for seniors: will the policy’s payout cover a funeral?',
  intro: 'Pick your state and type what your burial insurance policy pays out (its face amount). The calculator sets it against the average funeral cost in your state at the age you are likely to reach.',
  resume: (h) => {
    const s = 'TX' as const; const med = h.E.medianAgeAtDeath(AGE, 'f', s); const later = h.E.grow(h.today(s), h.E.funeralTrend(), med - AGE);
    return `Burial insurance is a small life insurance policy meant to pay for a funeral: a fixed sum called the face amount, usually paid to a beneficiary (the person you name), for a monthly payment, the premium, that never changes. The face amount is fixed when the policy is bought, while funeral prices keep rising, so the share of the bill it pays falls every year. In Texas, death-care businesses took in ${h.m(h.today(s))} per death at ${h.month} prices, from Census Bureau and Labor Department data. Half of the women of ${AGE} in Texas live past ${h.num1(med)}, and with funeral prices rising ${h.pc(h.E.funeralTrend(), 1)} a year, that spending would reach about ${h.m(later)} by then. A ${h.m(FACE)} policy would pay ${h.pc(FACE / later)} of it. This state average mixes all funerals, including burials with a plot and a headstone; a simpler funeral costs less. The calculator does the sum for any state, age and face amount.`;
  },
  faqs: (h) => [
    { q: 'How much burial insurance do I need?', a: 'Enough to cover the funeral you want, at the price it will have when it is needed, less what will be paid anyway. Start from a price list or your state’s average funeral cost, grow it to the age you are likely to reach, then take off the VA allowance, the Social Security lump sum and money set aside. The funeral cost calculator on the home page does all three steps.' },
    { q: 'Does burial insurance pay the funeral home directly?', a: 'Most burial policies pay a named beneficiary, who then pays the funeral home and keeps any surplus. Some policies are assigned to a funeral home as part of a prepaid funeral contract, and then the provider is paid. You can also assign an ordinary policy to a funeral home at the time of death, if the home accepts it. The policy says who the beneficiary is.' },
    { q: 'Can I buy a burial policy with a growing benefit?', a: 'Some insurers sell policies whose payout rises each year or at set ages, for a higher premium, and some policies that last for life add yearly bonuses, called dividends, that buy more cover. Compare the growth promised with the funeral price trend shown here: a benefit that grows more slowly than funeral prices still loses ground.' },
  ],
  body: (h) => {
    const sts = ['NY', 'NJ', 'IL', 'PA', 'OH', 'TX', 'CA', 'GA', 'NC', 'FL', 'AZ', 'WA'] as const;
    const t = h.E.funeralTrend();
    const rows = sts.map((s) => { const med = h.E.medianAgeAtDeath(AGE, 'f', s); const later = h.E.grow(h.today(s), t, med - AGE);
      return [h.E.stateName(s), h.m(h.today(s)), h.num1(med), h.m(later), h.pc(FACE / later)]; });
    return `
<h2>A ${h.m(FACE)} burial insurance policy bought at ${AGE}, state by state</h2>
<p>Two things decide how much of the bill the policy pays: the level of funeral spending in the state, and how long people there live, since a long life gives prices more years to rise before the policy pays. The table shows a woman of ${AGE} in twelve states; the calculator has all 50 states and DC. The state average mixes every funeral, from a direct cremation to a burial with a plot and a stone, so a simple funeral can cost far less.</p>
<details class="repli-section"><summary>The same policy in twelve states</summary>
<p>Each row starts from the state’s average funeral today, grows it at the rise in funeral prices until the age half of the women of ${AGE} in that state reach, and shows the share of that later bill a ${h.m(FACE)} payout would meet. A share under 100% is what the family would still have to find.</p>
${h.table(['State', `Average funeral, ${h.month}`, `Age half of women of ${AGE} reach`, 'Funeral by then', `Share paid by ${h.m(FACE)}`], rows, 'Census Bureau 2022 Economic Census and population estimates; Bureau of Labor Statistics funeral price index; National Center for Health Statistics, U.S. State Life Tables, 2022 (women).', ['l', 'r', 'r', 'r', 'r'])}
</details>

<h2>What a fixed payout loses, and what keeps pace</h2>
<p>At ${h.pc(t, 1)} a year, a fixed sum loses about half of what it can buy at a funeral home in ${h.num(Math.log(2) / Math.log(1 + t))} years. A quarter of buyers live well past the age half of people reach, and for them the policy covers much less of the bill than when it was bought.</p>
<p>Three things keep pace better. A ${h.a('prepaid-funeral', 'prepaid funeral contract')} fixes the price of the items it lists, but ties the money to one funeral home. Savings keep pace if they earn at least the rise in funeral prices, after tax. A policy whose payout grows each year keeps pace if it grows as fast as prices. The ${h.a('final-expense-insurance', 'final expense page')} shows how many years of premiums it takes to pay in as much as the policy pays out.</p>

<h2>Before buying a burial insurance policy</h2>
<p>Ask three questions. Who receives the money: a person you choose, or a funeral home under a contract? Does the payout stay fixed, or grow, and by how much each year? How many years of premiums will it take to pay in as much as the policy pays out? The first decides how flexible the money is, the second how much of a later funeral it covers, and the third how much you pay for that protection if you live a long time.</p>
`;
  },
});
