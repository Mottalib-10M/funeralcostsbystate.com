import { definePage } from '../../lib/guide-types';

const D = { income: 60000, years: 15, debts: 15000, mortgage: 220000, education: 40000, savings: 25000 };

export default definePage({
  id: 'how-much-life-insurance',
  group: 'life',
  order: 300,
  tool: { kind: 'mini:need' },
  related: ['term-life-insurance-rates-by-age', 'life-insurance-taxes', 'home', 'life-insurance-for-seniors'],
  sources: ['nchs_us', 'census_ec', 'ssa_cfr', 'irs_525'],
  slug: 'how-much-life-insurance-do-i-need',
  nav: 'How much life insurance',
  card: 'The DIME sum with your own figures: debt, income, mortgage, education and the funeral, less what is there.',
  title: 'Life Insurance Calculator: How Much Do I Need? DIME Method',
  description: 'How much life insurance you need, worked out with the DIME method: debts, income, mortgage, education and a funeral at US prices, less savings and cover held.',
  h1: 'How much life insurance do I need? The DIME sum, with your figures',
  intro: 'Type your debts, the income your family would need and for how long, the mortgage, education and savings. Nothing is sent and no quote is asked for.',
  resume: (h) => {
    const r = h.E.lifeNeed({ ...D, funeral: Math.round(h.today('US')), group: 0, existing: 0, ssa: true, veteran: 'none' });
    return `How much life insurance you need is the money your family would have to find if you died tomorrow, less what they would already have. The DIME method, used by many planners, adds four things: Debts, Income to replace for the years it is needed, the Mortgage balance, and Education to fund, plus the cost of a funeral. Then it takes off savings, life cover from work and any policy already held. For a household with ${h.m(D.income)} a year of income to replace for ${D.years} years, ${h.m(D.mortgage)} left on the mortgage, ${h.m(D.debts)} of other debts, ${h.m(D.education)} for education and a funeral at the US spending per death of ${h.m(h.today('US'))}, the total is ${h.m(r.gross)}. With ${h.m(D.savings)} of savings and the Social Security lump sum of ${h.m(h.P.ssa.lumpSum)}, the cover still needed is ${h.m(r.need)}. A rule of thumb of ten times income would give ${h.m(D.income * 10)}. The calculator does the sum with your own figures.`;
  },
  faqs: (h) => [
    { q: 'Is ten times my salary enough life insurance?', a: 'It is a rough starting point, not an answer. A family with a large mortgage and young children can need more; a couple whose children have left home and whose house is paid off can need much less. The DIME sum replaces the multiple with your own debts, the years of income your family would need, and what is already in place.' },
    { q: 'Should I count Social Security survivor benefits?', a: 'They can be large for a young family: a surviving spouse caring for a child under 16, and children under 18, can receive monthly benefits on the worker’s record. This calculator does not estimate them, because they depend on your own earnings record; ssa.gov sets out the conditions and can show your figures. If you know the amount, reduce the income line by it.' },
    { q: 'Does life insurance from work count?', a: 'Yes, while you have it. Group life cover from an employer pays the same as a personal policy, but it usually ends when you leave the job, and it may not be portable. Count it, and check the sum again at each change of job. Cover above a threshold set by the IRS adds a small amount to your taxable wages.' },
    { q: 'How long should a term life policy last?', a: 'Long enough to cover the years your family depends on your income: often until the youngest child finishes school or the mortgage is paid off, whichever matters more. Some households buy two policies of different lengths, a larger one for the years the children are at home and a smaller one for the remaining mortgage.' },
  ],
  body: (h) => {
    const ages = [30, 35, 40, 45, 50];
    const rows = ages.map((a) => [`${a}`, h.pc(h.E.payoutChance(a, 20, 'm')), h.pc(h.E.payoutChance(a, 20, 'f')), h.pc(h.E.payoutChance(a, 30, 'm')), h.pc(h.E.payoutChance(a, 30, 'f'))]);
    return `
<h2>Each line of the sum</h2>
<ul>
<li><strong>Debts</strong>: credit cards, car and student loans that would fall on the family or the estate. Federal student loans are generally discharged when the borrower dies, so they can be left out; private loans may not be.</li>
<li><strong>Income</strong>: what the family would need each year in place of yours, times the number of years. It is usually less than your salary, since your own spending stops; it is more if your partner would cut back on work. The calculator assumes no interest and no inflation on this part: the two are left to cancel.</li>
<li><strong>Mortgage</strong>: the balance today, if the family would want to clear it.</li>
<li><strong>Education</strong>: the amount you would want to leave for school or college.</li>
<li><strong>Funeral</strong>: loaded with what death-care businesses take in per death nationally at ${h.month} prices, ${h.m(h.today('US'))}; the ${h.a('home', 'funeral cost calculator')} gives the figure for your state.</li>
</ul>
<p>Then what is already there: savings and investments the family could use, life cover through work, policies you already hold, and the Social Security lump sum of ${h.m(h.P.ssa.lumpSum)} if a spouse or eligible child would receive it.</p>

<h2>The chance a term policy pays out</h2>
<p>The amount is one decision; the term is the other. Most term policies expire without a claim, which is why they cost little at younger ages. Probability of dying within 20 or 30 years, NCHS United States life tables 2024, whole population:</p>
<details class="repli-section"><summary>Chance a term policy pays out, by age</summary>
${h.table(['Age', '20 years, men', '20 years, women', '30 years, men', '30 years, women'], rows, 'People who buy insurance and pass its health questions tend to live longer than the population as a whole, so these odds are, if anything, higher than those of insured lives.', ['l', 'r', 'r', 'r', 'r'])}
</details>
<p>The ${h.a('term-life-insurance-rates-by-age', 'term rates page')} adds the two federal rate tables that can be published, VGLI and the IRS table for group cover, as yardsticks.</p>

<h2>Term, whole or universal</h2>
<p>A need that lasts for a set number of years, while children grow up or a mortgage is paid, is what term insurance is built for. A need that lasts for life, such as a funeral, an estate that will owe tax, or a dependent who will always need support, is what permanent insurance, whole or universal life, is built for, at a much higher premium for the same face amount. The ${h.a('cash-value-life-insurance', 'cash value page')} shows how a permanent policy is taxed if it is surrendered, and the ${h.a('life-insurance-taxes', 'tax page')} when a payout can be taxed at all.</p>

<h2>What the sum leaves out</h2>
<p>It does not model Social Security survivor benefits, which depend on your earnings record, or the tax on any part of the payout, which for most families is none. It does not price a policy: no insurer’s prices are published under terms that allow a site to reprint them, and this site asks for no contact details. Once you know the amount and the term, a quote from two or three insurers or an independent agent gives the price.</p>
`;
  },
});
