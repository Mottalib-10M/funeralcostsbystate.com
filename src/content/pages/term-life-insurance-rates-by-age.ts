import { definePage } from '../../lib/guide-types';

export default definePage({
  id: 'term-life-insurance-rates-by-age',
  group: 'life',
  order: 310,
  tool: { kind: 'mini:term' },
  related: ['how-much-life-insurance', 'whole-life-insurance-rates-by-age', 'life-insurance-for-seniors', 'life-insurance-taxes'],
  sources: ['va_vgli', 'irs_15b', 'nchs_us'],
  slug: 'term-life-insurance-rates-by-age',
  nav: 'Term life rates by age',
  card: 'Two federal rate tables by age, the veterans’ group life plan and the tax agency’s table, with the chance a term policy pays.',
  title: 'Term Life Insurance Rates by Age: Federal Rate Charts 2026',
  description: 'Term life insurance rates by age from the two published federal tables, VGLI and IRS Table 2-2, with the chance a term policy pays out at each age (NCHS).',
  h1: 'Term life insurance rates by age: the federal charts and the odds',
  intro: 'Choose an age, a term and a cover amount to see the chance of a claim and what the two federal rate tables charge for that age.',
  resume: (h) => {
    const v40 = h.E.vgliMonthly(40, 100000), v60 = h.E.vgliMonthly(60, 100000);
    return `Term life insurance rates rise with age because the chance of dying within the term rises with it. Insurers do not publish their rates under terms that let a site reprint them, and the “average rate by age” tables found online come from brokers’ own quotes. Two federal rate tables are public. The VA’s Veterans’ Group Life Insurance (VGLI), sold to veterans leaving service, charges by five-year age band: ${h.m2(v40)} a month for ${h.m(100000)} of cover at ages 40 to 44 and ${h.m2(v60)} at 60 to 64, on rates in force from ${h.date(h.P.vgli.asOf)}. The IRS Table 2-2 in Publication 15-B sets the cost of employer group-term cover above ${h.m(h.P.irsTable22.exclusion)} for tax purposes. Neither is a quote for a healthy applicant buying a 20-year policy in the market, where rates are lower at young ages, but they are the only published per-age prices. The NCHS life tables give the odds behind them.`;
  },
  faqs: (h) => [
    { q: 'How much does term life insurance cost at 40?', a: `There is no published market average this site can reprint: prices depend on the insurer, your health, the term and the amount. As a federal yardstick, VGLI charges ${h.m2(h.E.vgliMonthly(40, 100000))} a month for ${h.m(100000)} at 40 to 44. On the NCHS tables, a man of 40 has a ${h.pc(h.E.payoutChance(40, 20, 'm'))} chance of dying within 20 years and a woman ${h.pc(h.E.payoutChance(40, 20, 'f'))}.` },
    { q: 'Why do term rates go up so fast after 50?', a: `Because the probability of death roughly doubles about every ten years of adult age. On the NCHS United States table, the chance a man of 50 dies within a year is ${h.pc(h.E.qx(50, 'm'), 2)}; at 60 it is ${h.pc(h.E.qx(60, 'm'), 2)} and at 70 ${h.pc(h.E.qx(70, 'm'), 2)}. A level term premium is set to cover the rising risk across the whole term.` },
    { q: 'Who can buy VGLI?', a: 'Veterans who had Servicemembers’ Group Life Insurance can convert it to VGLI after leaving service, up to the amount they had, within the limits and periods the VA sets. VGLI is renewable for life, with the premium rising at each five-year age band. Applying within the first period after separation needs no proof of good health.' },
    { q: 'Is term life insurance with a return of premium worth it?', a: 'A return of premium policy pays back the premiums if you outlive the term, for a much higher premium. The extra premium could instead be saved or invested each year. Compare the two by asking what the extra would grow to over the term at a rate you could earn, against the premiums returned, which come back with no interest.' },
  ],
  body: (h) => {
    const rows = h.P.vgli.bands.map((b) => { const a = b.from === 0 ? 29 : b.from; const lbl = b.from === 0 ? `${b.to} and under` : b.to >= 120 ? `${b.from} and over` : `${b.from} to ${b.to}`;
      return [lbl, h.m2(b.per10k), h.m2(h.E.vgliMonthly(a, 100000)), h.m2(h.E.vgliMonthly(a, h.P.vgli.max)), h.pc(h.E.payoutChance(a, 5, 'm'))]; });
    const irs = h.P.irsTable22.bands.map((b) => { const lbl = b.from === 0 ? `Under ${b.to + 1}` : b.to >= 120 ? `${b.from} and over` : `${b.from} to ${b.to}`; return [lbl, h.m2(b.cost), h.m2(b.cost * 12 * 100)]; });
    return `
<h2>VGLI monthly rates by age</h2>
<p>Rates in force from ${h.date(h.P.vgli.asOf)}, per ${h.m(10000)} of cover, and for ${h.m(100000)} and the maximum of ${h.m(h.P.vgli.max)}. The last column is the chance of a man of the first age of the band dying within five years, NCHS 2024.</p>
<details class="repli-section"><summary>VGLI rates by age band</summary>
${h.table(['Age band', `Per ${h.m(10000)}`, `${h.m(100000)} of cover`, `${h.m(h.P.vgli.max)} of cover`, '5-year death chance, men'], rows, `VA, VGLI premium rates (page updated ${h.date(h.P.vgli.pageUpdated)}). Same rates for men and women, no health rating.`, ['l', 'r', 'r', 'r', 'r'])}
</details>
<p>VGLI is priced for a whole group, with no health questions for those who apply in time, men and women alike. It is a renewable plan whose premium steps up every five years, not a level 20-year term. That is why it is cheap compared to the risk at older ages and dear at younger ones, where a healthy buyer in the market often pays less.</p>

<h2>IRS Table 2-2: the cost of group-term life for tax</h2>
<p>When an employer provides group-term life insurance above ${h.m(h.P.irsTable22.exclusion)}, the cost of the excess, from this table, is added to the employee’s wages. Age is the employee’s age on the last day of the tax year.</p>
<details class="repli-section"><summary>The IRS cost of employer cover, by age</summary>
${h.table(['Age', `Cost per ${h.m(1000)}, a month`, `${h.m(100000)} of excess, a year`], irs, 'IRS Publication 15-B (2026), Table 2-2.', ['l', 'r', 'r'])}
</details>
<p>The table is a tax rule, not a price, but it is a published federal schedule that puts a cost on group cover at each age. The ${h.a('life-insurance-taxes', 'tax page')} has a calculator for the amount added to your wages.</p>

<h2>Reading a market quote against these tables</h2>
<p>A level term policy charges the same premium every year of the term. At the start it charges more than the risk of that year, and toward the end less, so the premium reflects the average risk over the whole term, which the payout chance in the calculator sums up. Two policies with the same amount and term can differ a lot in price between insurers and health classes. Ask at least two insurers or an independent agent; this site asks for no contact details and passes none on.</p>
<p>Population life tables include everyone. People who pass an insurer’s health questions tend to live longer, so their odds of a claim are lower than the table, and their premiums lower than a group plan that takes everyone. The ${h.a('how-much-life-insurance', 'DIME calculator')} gives the amount; the ${h.a('life-insurance-for-seniors', 'cover after 60 page')} the odds at older ages.</p>
<p>One more use of the federal tables: a veteran leaving service can compare a market quote with the VGLI rate for the same amount and age band, and an employee can compare a personal policy with the cost of extra group cover at work, which the IRS table approximates. In both cases the federal figure is a benchmark to question a quote against, not a substitute for one.</p>
`;
  },
});
