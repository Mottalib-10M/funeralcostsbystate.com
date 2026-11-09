import { definePage } from '../../lib/guide-types';

const PATH = [0.18, -0.12, 0.07, 0.24, 0.03], CAP = 0.09, PAR = 1, FLOOR = 0;

export default definePage({
  id: 'indexed-universal-life',
  group: 'life',
  order: 350,
  tool: { kind: 'mini:iul' },
  related: ['cash-value-life-insurance', 'whole-life-insurance-rates-by-age', 'life-insurance-taxes', 'how-much-life-insurance'],
  sources: ['irs_525', 'nchs_us'],
  slug: 'indexed-universal-life',
  nav: 'Indexed universal life (IUL)',
  card: 'What a cap, a floor and a participation rate do to an index return, year by year, on a path you choose.',
  title: 'Indexed Universal Life (IUL): Caps, Floors and Crediting',
  description: 'Indexed universal life (IUL) explained with a crediting calculator: what the cap, the floor and the participation rate do to an index return, before charges.',
  h1: 'Indexed universal life: what the cap and the floor really do',
  intro: 'Type five years of index changes, a cap, a participation rate and a floor. The calculator shows what the policy credits against what the index did.',
  resume: (h) => {
    const r = h.E.iulYears(PATH, CAP, PAR, FLOOR);
    return `Indexed universal life, or IUL, is a universal life policy whose cash account is credited with interest linked to a stock market index, usually through a one-year segment with three settings: a cap, the highest rate credited in a year; a participation rate, the share of the index gain that counts; and a floor, often zero, below which the credit never falls. The index itself is not bought: the account does not receive dividends, and the cost of insurance and policy fees are deducted every month whatever the credit. On a five-year path where the index moves ${PATH.map((x) => h.pc(x, 0)).join(', ')}, a ${h.pc(CAP, 0)} cap, ${h.pc(PAR, 0)} participation and a ${h.pc(FLOOR, 0)} floor credit ${h.pc(r.credited, 1)} in total, against ${h.pc(r.index, 1)} for the index. The floor removed the loss; the cap removed the best years. Insurers can change caps and participation rates after the sale, within the contract’s minimums. The calculator uses only the path and settings you type: this site publishes no index data and no insurer rates.`;
  },
  faqs: (h) => [
    { q: 'Can you lose money in an indexed universal life policy?', a: 'The floor protects the interest credit, not the account. In a year when the index falls, the credit is the floor, often zero, but the monthly cost of insurance and fees are still deducted, so the account value falls. If the account cannot cover the charges, the policy can lapse, and a lapse with a loan outstanding can create taxable income.' },
    { q: 'What is a good cap rate on an IUL?', a: 'There is no good cap in isolation: a higher cap with a lower participation rate can credit less than a lower cap at full participation, and the insurer can lower either in later years. Test the settings on the same index path in the calculator, and ask the insurer for the guaranteed minimum cap and participation in the contract.' },
    { q: 'Is IUL better than buying term and investing the difference?', a: 'They are different bets. IUL offers lifelong cover and tax-deferred growth with a floor, at the cost of caps, fees and the cost of insurance. Term plus investing gives cover for a set period and full market returns with losses, at lower cost. Comparing them needs the policy’s own illustration with its charges, which the insurer can provide before you buy.' },
  ],
  body: (h) => {
    const rows = PATH.map((c, i) => [`Year ${i + 1}`, h.pc(c, 0), h.pc(h.E.iulCredit(c, CAP, PAR, FLOOR), 1), h.pc(h.E.iulCredit(c, CAP, 0.6, FLOOR), 1), h.pc(h.E.iulCredit(c, 0.12, 0.6, FLOOR), 1)]);
    const a = h.E.iulYears(PATH, CAP, PAR, FLOOR), b = h.E.iulYears(PATH, CAP, 0.6, FLOOR), c2 = h.E.iulYears(PATH, 0.12, 0.6, FLOOR);
    rows.push(['Five years', h.pc(h.E.iulYears(PATH, 1, 1, -1).index, 1), h.pc(a.credited, 1), h.pc(b.credited, 1), h.pc(c2.credited, 1)]);
    return `
<h2>The same path under three sets of terms</h2>
<p>The index path of the calculator, credited with a ${h.pc(CAP, 0)} cap at full participation, the same cap at 60% participation, and a 12% cap at 60% participation, all with a floor of zero. The path is an example to test the terms, not market data.</p>
<details class="repli-section"><summary>The cap and floor on a past index path</summary>
${h.table(['Year', 'Index change', `Cap ${h.pc(CAP, 0)}, 100%`, `Cap ${h.pc(CAP, 0)}, 60%`, 'Cap 12%, 60%'], rows, 'Interest credited before the cost of insurance and fees. Annual point-to-point segments.', ['l', 'r', 'r', 'r', 'r'])}
</details>
<p>The floor matters most in a falling year and the cap in a strong one. Over a run of years that includes both, the credit lands well below the index in rising markets and above it in falling ones. An illustration that assumes the same rate every year hides that pattern; the sequence of years is what the terms act on.</p>

<h2>What is deducted</h2>
<p>Every month the policy deducts the cost of insurance for the amount at risk, a policy fee, and often a charge on premiums and on the account. The cost of insurance rises with age. In the early years, surrender charges reduce what can be taken out. A credit of a few percent can be outweighed by these charges, which is why the policy illustration, which the insurer provides with both guaranteed and non-guaranteed columns, matters more than the crediting terms alone.</p>

<h2>Loans and the tax position</h2>
<p>IUL is sold for tax-deferred growth and tax-free access through loans. The death benefit is generally free of income tax, and a loan is not income while the policy stays in force. If the policy lapses or is surrendered with a loan outstanding, the loan counts as proceeds and the gain above the premiums paid is taxable, as IRS Publication 525 describes; the ${h.a('cash-value-life-insurance', 'cash value page')} has the calculator. A policy funded too fast becomes a modified endowment contract, with loans taxed as gain first.</p>

<h2>Who it suits</h2>
<p>A buyer with a lifelong need for cover, income high enough to fund the policy well above its minimum for many years, and the time to read the illustration and the contract. For a family that needs cover while children grow up, the ${h.a('how-much-life-insurance', 'DIME calculator')} and a term policy usually answer the question at a fraction of the premium.</p>
<p>A last check before signing: ask for the illustration at the guaranteed minimum cap and participation, not only at the current ones, and see whether the policy stays in force to age 100 on those terms with the premium you plan to pay.</p>
`;
  },
});
