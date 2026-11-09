import { definePage } from '../../lib/guide-types';

const CASH = 40000, PAID = 30000, RATE = 0.22;

export default definePage({
  id: 'cash-value-life-insurance',
  group: 'life',
  order: 340,
  tool: { kind: 'mini:surrender' },
  related: ['indexed-universal-life', 'life-insurance-taxes', 'whole-life-insurance-rates-by-age', 'how-much-life-insurance'],
  sources: ['irs_525', 'irs_706', 'nchs_us'],
  slug: 'cash-value-life-insurance',
  nav: 'Cash value life insurance',
  card: 'How a surrender, a loan or a withdrawal is taxed, with a calculator for the tax on cashing a policy in.',
  title: 'Cash Value Life Insurance: Surrender Tax, Loans, Withdrawals',
  description: 'Cash value life insurance explained: how the cash value grows, and how a surrender, a policy loan or a withdrawal is taxed by the IRS, with a tax calculator.',
  h1: 'Cash value life insurance: what you can take out, and the tax on it',
  intro: 'Type what a cash value life insurance policy pays on surrender (its cash surrender value), the premiums paid and your tax rate. The calculator gives the taxable gain and what is left after federal tax.',
  resume: (h) => {
    const r = h.E.surrenderTax(CASH, PAID, RATE);
    return `Cash value life insurance is permanent cover, whole life or universal life, in which part of each premium builds a savings value inside the policy. That value grows without yearly tax, can be borrowed against or partly withdrawn, and is paid to the owner if the policy is surrendered, less any surrender charge. When a policy is surrendered for cash, IRS Publication 525 says the part of the proceeds above the cost of the policy, generally the premiums paid less any refunded premiums, dividends or untaxed withdrawals, is taxable as ordinary income, not as a capital gain. A policy with a cash surrender value of ${h.m(CASH)} on which ${h.m(PAID)} of premiums were paid gives a taxable gain of ${h.m(r.gain)}; at a ${h.pc(RATE)} federal rate, the tax is ${h.m(r.tax)}. A policy loan is not taxed while the policy stays in force, but an unpaid loan becomes part of the proceeds if the policy lapses or is surrendered. The calculator does the sum with your figures.`;
  },
  faqs: (h) => [
    { q: 'Is the cash value of life insurance taxable?', a: 'Not while it stays in the policy: the growth is not taxed year by year. It becomes taxable when you take out more than your cost in the policy, by surrender or withdrawal, or when the policy lapses with a loan outstanding. The death benefit paid to a beneficiary is generally not taxable income, whatever the cash value was.' },
    { q: 'Should I surrender my whole life policy?', a: 'Compare what you would give up with what you would receive. Surrender ends the death benefit and may trigger tax on the gain and a surrender charge. Alternatives include a policy loan, a reduced paid-up policy with a smaller death benefit and no more premiums, or a tax-free exchange into another policy or an annuity. The insurer can give you each figure in writing.' },
    { q: 'What is a modified endowment contract?', a: 'A life insurance policy funded faster than tax law allows, failing what the tax code calls the 7-pay test. It keeps the tax-free death benefit, but loans and withdrawals are taxed as gain first, and an extra penalty tax can apply when the owner is younger than retirement age. Ask the insurer whether a planned premium would change your policy’s status before paying it.' },
  ],
  body: (h) => {
    const rows = [[20000, 25000], [30000, 30000], [40000, 30000], [60000, 40000], [100000, 60000]].map(([c, p]) => { const r = h.E.surrenderTax(c, p, RATE); return [h.m(c), h.m(p), h.m(r.gain), h.m(r.tax), h.m(r.net)]; });
    return `
<h2>Surrender values and the tax, side by side</h2>
<p>Examples at a ${h.pc(RATE)} federal rate, with no loan outstanding. A surrender below the premiums paid gives no taxable gain, and the loss is not deductible.</p>
<details class="repli-section"><summary>Tax on a surrender, worked through</summary>
${h.table(['Cash surrender value', 'Premiums paid', 'Taxable gain', 'Federal tax', 'Left after tax'], rows, 'IRS Publication 525, surrender of a life insurance policy. Example figures; state income tax not included.', ['r', 'r', 'r', 'r', 'r'])}
</details>

<h2>Three ways to take money out</h2>
<ul>
<li><strong>Surrender.</strong> The policy ends and the insurer pays the cash surrender value. Tax is due on the part above your cost in the policy. Surrender charges in the early years can take a large share of the value.</li>
<li><strong>Withdrawal</strong> (for universal life). Part of the value is paid out and the death benefit falls. For a policy that is not a modified endowment contract, withdrawals come first out of your cost, so they are tax-free until they exceed it.</li>
<li><strong>Policy loan.</strong> The insurer lends against the value, with interest. The loan is not income while the policy is in force. If the policy lapses or is surrendered with a loan unpaid, the loan counts in the proceeds and the gain can be taxed, even though no new cash is paid: the trap known as a tax bomb.</li>
</ul>

<h2>How cash value life insurance grows</h2>
<p>In a whole life policy, the insurer guarantees a schedule of cash values and may add dividends. In a universal life policy, the account is credited with interest at a declared rate, and the cost of insurance and fees are deducted each month; in an ${h.a('indexed-universal-life', 'indexed universal life')} policy, the interest follows a stock index within a cap and a floor. In all three, the cost of the insurance rises with age, which is why a universal life policy that is underfunded can lapse late in life when the charges outgrow the account.</p>

<h2>At death</h2>
<p>When the insured dies, the beneficiary receives the death benefit, generally free of income tax, and the cash value does not add to it in most whole life designs. If the insured owned the policy, the death benefit counts in the estate for federal estate tax; the ${h.a('life-insurance-taxes', 'tax page')} shows when that matters. A policy sold to a third party for value can lose part of the income tax exclusion.</p>
<p>Before any of these steps, ask the insurer for an in-force illustration: it shows the current cash value, surrender charges, loans, and how the policy is projected to perform if premiums continue, stop or change.</p>
`;
  },
});
