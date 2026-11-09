import { definePage } from '../../lib/guide-types';

const ESTATE = 14000000, PAYOUT = 2000000;

export default definePage({
  id: 'life-insurance-taxes',
  group: 'tax',
  order: 400,
  tool: { kind: 'mini:estate', props: { estate: ESTATE, payout: PAYOUT } },
  related: ['cash-value-life-insurance', 'how-much-life-insurance', 'term-life-insurance-rates-by-age', 'indexed-universal-life'],
  sources: ['irs_525', 'irs_estate', 'irs_706', 'irs_15b'],
  slug: 'is-life-insurance-taxable',
  nav: 'Is life insurance taxable?',
  card: 'Income tax, estate tax and employer cover: when a payout or a policy is taxed, with two calculators.',
  title: 'Life Insurance Tax Rules: Income, Estate Tax and Work Cover',
  description: 'Life insurance taxes: when a death benefit is free of income tax, when it counts in a federal estate at the 2026 exclusion, and how employer cover is taxed.',
  h1: 'Is life insurance taxable? Income tax, estate tax and cover from work',
  intro: 'Type the size of the estate and the death benefit. The calculator shows the extra federal estate tax the payout causes when the insured owned the policy.',
  resume: (h) => {
    const r = h.E.estateTaxOnPayout(ESTATE, PAYOUT);
    return `A life insurance death benefit paid to a beneficiary is generally not taxable income: IRS Publication 525 says proceeds paid because of the insured person’s death are not included in income, unless the policy was transferred for a price. Interest added when the payout is held or paid in installments is taxable. Estate tax is a separate question. If the insured owned the policy, or could change its beneficiary, the death benefit counts in the gross estate, reported on Schedule D of Form 706. For ${h.P.year}, the IRS sets the basic exclusion at ${h.m(h.P.estate.basicExclusion)} per person, and the tax above it is charged at up to ${h.pc(h.P.estate.topRate, 0)}. An estate of ${h.m(ESTATE)} owes nothing; add a ${h.m(PAYOUT)} death benefit and it owes about ${h.m(r.extra)}. A policy given away within ${h.P.estate.lookbackYears} years of death is pulled back into the estate. Group-term cover from an employer above ${h.m(h.P.irsTable22.exclusion)} adds a small taxable amount to wages each year.`;
  },
  faqs: (h) => [
    { q: 'Do beneficiaries pay income tax on life insurance?', a: 'Generally not on the death benefit itself. Publication 525 excludes proceeds paid because of the insured’s death from income. Two exceptions matter: interest, when the insurer holds the money or pays it over time, is taxable; and a policy that was sold or transferred for value can lose part of the exclusion. A beneficiary receives a Form 1099 only for the taxable part.' },
    { q: 'Is a life insurance payout part of the estate?', a: `For federal estate tax, yes, when the insured held any incident of ownership at death, such as the right to change the beneficiary, borrow against the policy or cancel it, or when the payout goes to the estate. Most estates owe nothing anyway, because the ${h.P.year} exclusion is ${h.m(h.P.estate.basicExclusion)} per person. Some states tax estates at much lower thresholds.` },
    { q: 'How can a policy be kept out of the estate?', a: `By having someone else own it from the start, such as an adult child or an irrevocable life insurance trust that buys the policy and pays the premiums with gifts. Moving an existing policy works too, but if the insured dies within ${h.P.estate.lookbackYears} years of the transfer, the payout is counted in the estate. Gifts to pay premiums can use the annual exclusion of ${h.m(h.P.estate.annualGiftExclusion)} per recipient.` },
    { q: 'Is employer life insurance taxable?', a: `The first ${h.m(h.P.irsTable22.exclusion)} of employer-provided group-term cover is tax-free. Above that, the cost of the excess, from IRS Table 2-2, is added to your wages and is subject to Social Security and Medicare tax, less anything you paid for the cover after tax. It appears on your Form W-2. The calculator further down this page works it out.` },
  ],
  body: (h) => {
    const sizes = [5000000, 10000000, 14000000, 16000000, 20000000, 30000000];
    const rows = sizes.map((e) => { const r = h.E.estateTaxOnPayout(e, PAYOUT); return [h.m(e), h.m(r.without), h.m(r.withIt), h.m(r.extra), h.m(r.kept)]; });
    const t = h.E.tentativeTax(2000000);
    return `
<h2>The same payout in estates of different sizes</h2>
<p>A ${h.m(PAYOUT)} death benefit owned by the insured, added to estates of different sizes, at the ${h.P.year} exclusion of ${h.m(h.P.estate.basicExclusion)}, with no lifetime gifts, deductions or a late spouse’s unused exclusion.</p>
${h.table(['Estate without the policy', 'Tax without it', 'Tax with it', 'Extra tax', 'Payout left to heirs'], rows, 'Form 706 Table A unified rate schedule: every amount above the exclusion falls in the top bracket. State estate and inheritance taxes not included.', ['r', 'r', 'r', 'r', 'r'])}
<p>Above the exclusion, every additional dollar is taxed at ${h.pc(h.P.estate.topRate, 0)}, because the exclusion is far above the start of the top bracket in the Form 706 rate schedule (${h.m(h.P.estate.topBracketFrom)}, where the tentative tax is ${h.m(h.P.estate.topBracketBase)}; on ${h.m(2000000)} it would be ${h.m(t)}). A payout to a surviving spouse who is a US citizen qualifies for the marital deduction and owes nothing at the first death, though it adds to the spouse’s own estate.</p>

<h2>Cover from work above the exclusion</h2>
<p>The amount added to wages is small at young ages and grows fast after 60. For an employee of 45 with ${h.m(200000)} of cover who pays ${h.m(100)} a year for it after tax, Publication 15-B’s own example gives ${h.m(h.E.imputedIncome(45, 200000, 100).taxable)} of taxable income for the year. The full table is on the ${h.a('term-life-insurance-rates-by-age', 'term rates by age')} page.</p>

<!--tool:mini:imputed|{}-->

<h2>Cash value and surrenders</h2>
<p>A policy surrendered for more than its cost, generally the premiums paid, gives ordinary income on the difference, and a lapse with a loan outstanding can do the same. Policy dividends are generally a return of premium and not taxable until they exceed it. The ${h.a('cash-value-life-insurance', 'cash value page')} has the calculator.</p>

<h2>Who reports what</h2>
<p>The insurer reports taxable amounts on Form 1099-R or 1099-INT; the executor reports a policy owned by the insured on Schedule D of Form 706, with a statement from the insurer, if the estate must file. This page is general information read on ${h.src('irs_525', 'IRS Publication 525')}, the ${h.src('irs_estate', 'IRS estate and gift tax page')} and the ${h.src('irs_706', 'Form 706 instructions')}; a tax professional can apply it to a real estate.</p>
<h2>State taxes</h2>
<p>This page covers federal tax only. Some states levy their own estate tax, with an exclusion much lower than the federal one, and a few levy an inheritance tax paid by the heirs, where life insurance paid to a named beneficiary is often, but not always, exempt. State income tax generally follows the federal treatment of a death benefit. The state’s revenue department publishes its own rules.</p>
<h2>Ownership and beneficiary, in practice</h2>
<p>Three names on a policy decide its tax: the insured, the owner and the beneficiary. When they are the same person and the estate, the payout counts in the estate. When the owner is someone other than the insured, such as a spouse, a child or a trust, the payout generally stays out of the insured’s estate, unless the transfer happened within the last ${h.P.estate.lookbackYears} years. When three different people hold the three roles, the payout can be treated as a gift from the owner to the beneficiary, which is one more reason to set the roles up with care.</p>
`;
  },
});
