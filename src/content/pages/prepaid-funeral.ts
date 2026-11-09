import { definePage } from '../../lib/guide-types';

export default definePage({
  id: 'prepaid-funeral',
  group: 'costs',
  order: 150,
  tool: { kind: 'mini:prepaid' },
  related: ['burial-insurance', 'funeral-cost-inflation', 'funeral-rule', 'final-expense-insurance'],
  sources: ['bls_cpi', 'nchs_us', 'ftc_rule', 'census_ec'],
  slug: 'prepaid-funeral-plan-vs-insurance',
  nav: 'Prepaid funeral or savings',
  card: 'A prepaid price today against the same funeral at the likely age of death, and what saving instead would take.',
  title: 'Prepaid Funeral Plan vs Insurance or Savings: the Real Math',
  description: 'Prepaid funeral plan against insurance or savings: what the same funeral costs at the age you are likely to reach, and what you would need to set aside instead.',
  h1: 'Prepaid funeral plan, insurance or savings: which costs less',
  intro: 'Type the prepaid price you were quoted. The calculator grows it to the age you are likely to reach and works out what saving instead would take today.',
  resume: (h) => {
    const r = h.E.medianAgeAtDeath(70, 'f'); const t = h.E.funeralTrend(); const price = Math.round(h.E.spendToday('US').homes as number);
    const later = h.E.grow(price, t, r - 70);
    return `A prepaid funeral plan, also called a pre-need contract, buys a funeral from one provider at today’s price, paid in one sum or by installments. Its value depends on two numbers: how fast funeral prices rise, and how long the contract waits. On the BLS funeral index, prices rose ${h.pc(t, 1)} a year from ${h.P.cpi.trendFrom} to ${h.P.cpi.trendTo}. A woman of 70 has even odds of living past ${h.num1(r)} on the NCHS life table, so a funeral priced ${h.m(price)} today, the national funeral home spending per death, would cost about ${h.m(later)} by then. A prepaid contract that fixes that price is worth more than savings that earn less than the funeral trend after tax, and less than savings that earn more. Burial or final expense insurance is a third way: it pays a fixed sum that loses value as prices rise. The calculator compares the prepaid price with what you would need to set aside today at your own savings rate.`;
  },
  faqs: (h) => [
    { q: 'What happens to a prepaid funeral if I move?', a: 'It depends on the contract and the state where it was sold. Some contracts can be transferred to another funeral home, sometimes for a fee, and some can be cancelled with a refund of part of what was paid. Ask before signing whether the plan is portable, what is refunded on cancellation, and whether the money is held in a trust or paid into an insurance policy.' },
    { q: 'Is a prepaid funeral guaranteed?', a: 'Only for the items the contract lists as guaranteed. Many contracts fix the price of the funeral home’s own goods and services but not of cash advance items, such as the cemetery’s opening and closing or the death certificates, which are paid at the later price. Read which lines are guaranteed and which are estimates, and keep the price list the contract was based on.' },
    { q: 'Is it better to prepay a funeral or buy burial insurance?', a: 'They do different things. A prepaid contract fixes the price of a listed funeral at one provider. A burial policy pays a fixed sum to a beneficiary, who can spend it at any funeral home or on anything else, but the sum buys less each year. The calculator here and the burial insurance page show both against the likely age of death.' },
    { q: 'Does the Funeral Rule apply to prepaid funerals?', a: 'Yes, for the price disclosures. When you arrange a funeral in advance with a funeral provider, the FTC Funeral Rule still requires the General Price List and the itemized statement. How the money is protected afterward is set by state law, which differs from state to state: the state agency that licenses funeral homes or regulates insurance can say what applies.' },
  ],
  body: (h) => {
    const price = Math.round(h.E.spendToday('US').homes as number); const t = h.E.funeralTrend();
    const rows = [60, 65, 70, 75, 80, 85].map((a) => { const med = h.E.medianAgeAtDeath(a, 'f'); const later = h.E.grow(price, t, med - a);
      return [`${a}`, h.num1(med), h.m(later), h.m(later / Math.pow(1.02, med - a)), h.m(later / Math.pow(1.04, med - a))]; });
    return `
<h2>The same funeral, by age at purchase</h2>
<p>A funeral priced ${h.m(price)} today (the US funeral home spending per death at ${h.month} prices), grown at ${h.pc(t, 1)} a year to the median age at death of a woman of each age, and what would have to be saved today to pay it then at 2% or 4% a year after tax.</p>
${h.table(['Age today', 'Median age at death', 'Funeral by then', 'Save today at 2%', 'Save today at 4%'], rows, 'NCHS United States life table 2024, women; BLS funeral index trend; Census 2022 funeral home revenue per death. The savings rates are illustrations, not forecasts.', ['l', 'r', 'r', 'r', 'r'])}
<p>When the savings rate after tax is below the funeral trend, the sum needed today is above today’s price, and prepaying at today’s price comes out ahead on the items it guarantees. When the rate is above the trend, saving does. The younger the buyer, the longer the wait and the larger the difference either way.</p>

<h2>What else to weigh</h2>
<p>The calculator compares money. Three other things decide many purchases.</p>
<ul>
<li><strong>Flexibility.</strong> Savings, or a payable-on-death bank account naming the person who will arrange the funeral, can pay any funeral home, in any state, for any choice made later. A prepaid contract binds the money to one provider and one plan, unless it can be transferred.</li>
<li><strong>Protection of the money.</strong> Each state sets how a pre-need seller must hold the payments: in a trust, in an insurance policy, or in some other way, and how much of each payment must be set aside. If the seller goes out of business, that protection is what remains. The state regulator can say which rules apply.</li>
<li><strong>What is left outside.</strong> Items the contract does not guarantee, cemetery charges bought separately, and cash advance items are paid at the later price, by the family. The ${h.a('funeral-rule', 'Funeral Rule page')} lists them.</li>
</ul>

<h2>Paying by installments</h2>
<p>Many sellers offer installments over several years. They raise the total paid, and if the buyer dies before the last installment, what the family receives depends on the contract: some contracts are backed by an insurance policy that completes the payments, others refund what was paid. Ask for both the single price and the installment total in writing, and type the single price into the calculator.</p>

<h2>Where insurance fits</h2>
<p>A ${h.a('final-expense-insurance', 'final expense policy')} or a ${h.a('burial-insurance', 'burial policy')} pays its face amount to a beneficiary, who can use it for any funeral. It does not fix a price, so its value at the funeral falls by the ${h.a('funeral-cost-inflation', 'funeral inflation rate')} every year. Its cost is the premium, paid for as long as the policy requires; the break-even page shows the age at which the premiums add up to the face amount.</p>
`;
  },
});
