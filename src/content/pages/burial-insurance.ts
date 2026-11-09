import { definePage } from '../../lib/guide-types';
import { stateIndex } from '../../lib/mini-specs';

const FACE = 10000;

export default definePage({
  id: 'burial-insurance',
  group: 'final',
  order: 210,
  tool: { kind: 'mini:burial', props: { state: stateIndex('OH'), face: FACE } },
  related: ['final-expense-insurance', 'funeral-cost-inflation', 'prepaid-funeral', 'funeral-costs-by-state'],
  sources: ['census_ec', 'bls_cpi', 'nchs_states'],
  slug: 'burial-insurance',
  nav: 'Burial insurance',
  card: 'Whether a burial policy’s face amount will still cover a funeral in your state at the age you are likely to reach.',
  title: 'Burial Insurance: Will the Face Amount Cover a Funeral Later',
  description: 'Burial insurance against your state’s funeral spending: how much of the bill a fixed face amount pays at the age you are likely to reach, and what is left.',
  h1: 'Burial insurance for seniors: will the face amount cover a funeral?',
  intro: 'Pick your state and type the face amount of a burial policy. The calculator sets it against the state’s spending per death at your likely age of death.',
  resume: (h) => {
    const s = 'OH' as const; const med = h.E.medianAgeAtDeath(70, 'f', s); const later = h.E.grow(h.today(s), h.E.funeralTrend(), med - 70);
    return `Burial insurance is a small life insurance policy meant to pay for a funeral: a fixed face amount, usually paid to a beneficiary, for a level monthly premium. The face amount is fixed when the policy is bought, while funeral prices keep rising, so the share of the bill it pays falls every year. In Ohio, death-care businesses took in ${h.m(h.today(s))} per death at ${h.month} prices, from Census and BLS data. A woman of 70 in Ohio has even odds of living past ${h.num1(med)} on the state life table, and at the funeral price trend of ${h.pc(h.E.funeralTrend(), 1)} a year that spending would reach about ${h.m(later)} by then. A ${h.m(FACE)} policy would pay ${h.pc(FACE / later)} of it. Spending per death is an average of all funerals, including burials with a plot and a headstone; a simpler funeral costs less. The calculator does the sum for any state, age and face amount.`;
  },
  faqs: (h) => [
    { q: 'How much burial insurance do I need?', a: 'Enough to cover the funeral you want, at the price it will have when it is needed, less what will be paid anyway. Start from a price list or your state’s spending per death, grow it to the age you are likely to reach, then take off the VA allowance, the Social Security lump sum and money set aside. The funeral cost calculator on the home page does all three steps.' },
    { q: 'Does burial insurance pay the funeral home directly?', a: 'Most burial policies pay a named beneficiary, who then pays the funeral home and keeps any surplus. Some policies are assigned to a funeral home as part of a prepaid funeral contract, and then the provider is paid. You can also assign an ordinary policy to a funeral home at the time of death, if the home accepts it. The policy says who the beneficiary is.' },
    { q: 'Can I buy a burial policy with a growing benefit?', a: 'Some insurers sell policies whose face amount rises each year or at set ages, for a higher premium, and some whole life policies add dividends that buy more cover. Compare the growth promised with the funeral price trend shown here: a benefit that grows more slowly than funeral prices still loses ground.' },
  ],
  body: (h) => {
    const sts = ['NY', 'NJ', 'IL', 'PA', 'OH', 'TX', 'CA', 'GA', 'NC', 'FL', 'AZ', 'WA'] as const;
    const t = h.E.funeralTrend();
    const rows = sts.map((s) => { const med = h.E.medianAgeAtDeath(70, 'f', s); const later = h.E.grow(h.today(s), t, med - 70);
      return [h.E.stateName(s), h.m(h.today(s)), h.num1(med), h.m(later), h.pc(FACE / later)]; });
    return `
<h2>A ${h.m(FACE)} policy bought at 70, state by state</h2>
<p>Spending per death today, the median age at death of a woman of 70 in each state, that spending grown at ${h.pc(t, 1)} a year to that age, and the share of it a ${h.m(FACE)} face amount would pay.</p>
${h.table(['State', `Per death, ${h.month}`, 'Median age at death', 'By then', `Share paid by ${h.m(FACE)}`], rows, 'Census Bureau 2022 Economic Census and population estimates; BLS funeral index; NCHS U.S. State Life Tables, 2022 (women).', ['l', 'r', 'r', 'r', 'r'])}
<p>Two things move the share: the level of spending in the state, and how long people there live. A state with long lives gives prices more years to rise before the policy pays. All 51 states are in the calculator.</p>

<h2>Spending per death is not your funeral</h2>
<p>The Census figure counts all the money that funeral homes, cemeteries and crematories take in, divided by all deaths. It includes cremations with no service and burials with a casket, a vault, a plot and a stone, as well as cemetery plots and pre-need contracts sold in advance. A direct cremation can cost a fraction of it; a traditional burial can cost more. Use it as a yardstick, and replace it with a price list total in the ${h.a('home', 'main calculator')} once you have one.</p>

<h2>What a fixed face amount loses</h2>
<p>At ${h.pc(t, 1)} a year, a fixed sum loses about half of its funeral buying power in ${h.num(Math.log(2) / Math.log(1 + t))} years. Someone who buys at 70 and lives to the median age loses less than that, but a quarter of buyers live well past the median, and for them the policy covers much less of the bill than it did when it was bought. The ${h.a('funeral-cost-inflation', 'funeral inflation page')} shows the index since 1987, and the ${h.a('final-expense-insurance', 'final expense break-even')} shows how many years of premiums it takes to pay in the face amount.</p>

<h2>Alternatives that keep pace</h2>
<p>A ${h.a('prepaid-funeral', 'prepaid funeral contract')} fixes the price of the items it lists, so it keeps pace with prices for those items, at the cost of being tied to one provider. Savings keep pace if they earn at least the funeral trend after tax. A policy with an increasing benefit keeps pace if the increase matches the trend. Each has a cost; the right one depends on age, savings and how long the money has to wait.</p>
<h2>Before buying a burial policy</h2>
<p>Ask three questions. Who receives the money: a person you choose, or a funeral home under a contract? Does the face amount stay fixed, or grow, and by how much each year? How many years of premiums will it take to pay in the face amount? The first decides how flexible the money is, the second how much of a later funeral it covers, and the third how much you pay for that protection if you live a long time.</p>
`;
  },
});
