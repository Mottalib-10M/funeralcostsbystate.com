import { definePage } from '../../lib/guide-types';
import { stateIndex } from '../../lib/mini-specs';

export default definePage({
  id: 'life-insurance-for-seniors',
  group: 'life',
  order: 330,
  tool: { kind: 'mini:seniors', props: { state: stateIndex('TX') } },
  related: ['final-expense-insurance', 'whole-life-insurance-rates-by-age', 'burial-insurance-no-waiting-period', 'home'],
  sources: ['nchs_states', 'nchs_us', 'va_vgli'],
  slug: 'life-insurance-for-seniors',
  nav: 'Life insurance for seniors',
  card: 'How long cover bought after 60 has to last in your state, the odds a term policy pays, and the veterans’ group life rate.',
  title: 'Life Insurance for Seniors: How Long Cover Must Last',
  description: 'Life insurance for seniors: how long cover bought after 60 has to last in your state, the chance a 10-year term pays out, and what permanent cover costs.',
  h1: 'Life insurance for seniors: how long the cover has to last',
  intro: 'Pick your state, age and sex to see how long life insurance has to last at your age. The calculator shows the chance a term policy pays, the age half and a quarter of people live past, and the VGLI rate at that age.',
  resume: (h) => {
    const s = 'TX' as const;
    return `Life insurance for seniors is a question of time. After 60, the chance of dying within any term rises fast, so term policies become dear and often end before they are needed, while whole life and final expense policies last for life but must be paid for as long as you live. On the NCHS 2022 life table for Texas, a woman of 68 has a ${h.pc(h.E.payoutChance(68, 10, 'f', s))} chance of dying within ten years, so a 10-year term would most likely expire unused; half the women of her age live past ${h.num1(h.E.medianAgeAtDeath(68, 'f', s))} and a quarter past ${h.num1(h.E.ageAtQuantile(68, 'f', 0.75, s))}. A permanent policy bought at 68 would be paid for, on average, for about ${h.num1(h.E.finalExpense({ age: 68, sex: 'f', state: s, premium: 1, face: 1 }).expected / 12)} years. As a federal yardstick, VGLI charges ${h.m2(h.E.vgliMonthly(68, 10000))} a month per ${h.m(10000)} at that age. The calculator gives the same figures for any state, age and term.`;
  },
  faqs: (h) => [
    { q: 'Can I get life insurance at 75 or 80?', a: 'Yes, though the choice narrows. Final expense whole life is sold to buyers at these ages, often as guaranteed issue with a graded benefit, and some insurers sell short term policies to older applicants. Face amounts are smaller and premiums higher. At these ages, compare the premium with the face amount: the break-even age can come within a few years.' },
    { q: 'Should seniors buy term or whole life insurance?', a: 'It depends on the need. A debt that will be paid off, such as a mortgage with ten years left, fits a term policy of that length. A need that lasts for life, such as a funeral or a spouse who depends on a pension that stops at death, fits permanent cover. The calculator shows how likely a term is to end before it pays.' },
    { q: 'What is the best life insurance for seniors on Social Security?', a: `No policy is best for everyone, and this site does not recommend insurers. For someone living on Social Security, the usual question is whether a small policy is needed at all: the lump sum is ${h.m(h.P.ssa.lumpSum)}, and a funeral costs far more, so a modest final expense policy or money set aside is what most such households weigh. The funeral cost calculator shows the gap.` },
  ],
  body: (h) => {
    const ages = [60, 65, 70, 75, 80, 85];
    const rows = ages.map((a) => [`${a}`, h.pc(h.E.payoutChance(a, 10, 'm')), h.pc(h.E.payoutChance(a, 10, 'f')), h.num1(h.E.medianAgeAtDeath(a, 'm')), h.num1(h.E.medianAgeAtDeath(a, 'f')), h.num1(h.E.ageAtQuantile(a, 'f', 0.75)), h.m2(h.E.vgliMonthly(a, 10000))]);
    const le = h.E.STATES.map((s) => ({ s, f: h.E.lifeExpectancy(65, 'f', s), m: h.E.lifeExpectancy(65, 'm', s) })).sort((a, b) => b.f - a.f);
    const leRows = [...le.slice(0, 6), ...le.slice(-6)].map((x) => [h.E.stateName(x.s), h.num1(x.m), h.num1(x.f)]);
    return `
<h2>The odds and the ages, after 60</h2>
<p>Chance of dying within ten years, median age at death, the age one in four women live past, and the VGLI rate per ${h.m(10000)} at each age. NCHS United States life tables 2024.</p>
<details class="repli-section"><summary>Chance of dying within ten years, by age</summary>
${h.table(['Age', '10-year death chance, men', 'Women', 'Median age at death, men', 'Women', 'One in four women live past', `VGLI per ${h.m(10000)}, a month`], rows, 'NCHS United States life tables, 2024; VA VGLI rates. Population rates, not insured lives.', ['l', 'r', 'r', 'r', 'r', 'r', 'r'])}
</details>

<h2>Life expectancy at 65, by state</h2>
<p>The six states with the longest and the six with the shortest remaining life expectancy for women at 65, with men alongside, on the NCHS U.S. State Life Tables for 2022.</p>
<details class="repli-section"><summary>Life expectancy at 65, state by state</summary>
${h.table(['State', 'Men at 65, years', 'Women at 65, years'], leRows, 'NCHS, U.S. State Life Tables, 2022. All 51 states are in the calculator.', ['l', 'r', 'r'])}
</details>

<h2>What the numbers mean for life insurance</h2>
<p>A term policy bought at 70 for ten years pays out in a minority of cases, because most buyers outlive it. It suits a need that ends, such as a loan. For a need that does not end, a term policy has a worse flaw: it may expire just when the odds of a claim are highest, and renewing at 80 costs far more, if it is offered at all.</p>
<p>A permanent policy, whole life or final expense, covers the whole span, but the premiums continue too. Someone who buys at 70 and lives to the age one in four reach pays for more than twenty years. The ${h.a('final-expense-insurance', 'break-even calculator')} turns a quote into the age at which the premiums add up to the face amount, and the ${h.a('whole-life-insurance-rates-by-age', 'whole life yardstick')} shows what premium would match the face amount on average.</p>
<p>Policies with no health questions accept everyone in their age range but grade the benefit in the first years; the ${h.a('burial-insurance-no-waiting-period', 'waiting period page')} shows what they pay then. Veterans can keep VGLI for life, at the rate of each age band, and the VA does not ask health questions of those who convert in time.</p>

<p>Most seniors who look for life insurance want to pay for a funeral or leave a little to a spouse. The ${h.a('home', 'funeral cost calculator')} shows the gap in your state after the VA allowance, Social Security and savings. If the gap is small, money set aside in a payable-on-death account may do the job without premiums. If it is large, the figures here help choose the kind of cover and its length.</p>
<p>The state matters less than age and health, but it is not nothing. Across the 51 state tables, remaining life expectancy at 65 differs by several years, which changes both the chance a term policy pays out and the number of years premiums on a permanent policy are paid. The calculator uses the table of the state you pick.</p>
`;
  },
});
