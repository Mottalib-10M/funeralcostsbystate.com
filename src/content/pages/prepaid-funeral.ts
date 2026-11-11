import { definePage } from '../../lib/guide-types';

// Un seul exemple sur le site (testeurs naïfs du 2026-11-10, règle 1) : une femme de 65 ans au Texas, et le prix
// chargé est la moyenne de l'État, le même chiffre que sur l'accueil et la page assurance obsèques.
const AGE = 65;

export default definePage({
  id: 'prepaid-funeral',
  group: 'final',
  order: 190,
  tool: { kind: 'mini:prepaid' },
  related: ['burial-insurance', 'funeral-cost-inflation', 'funeral-rule', 'final-expense-insurance'],
  sources: ['bls_cpi', 'nchs_states', 'ftc_rule', 'census_ec'],
  slug: 'prepaid-funeral-plan-vs-insurance',
  nav: 'Prepaid funeral or savings',
  card: 'A prepaid price today against the same funeral at the likely age of death, and what saving instead would take.',
  title: 'Prepaid Funeral Plan vs Savings: Which Costs Less, by State',
  description: 'Prepaid funeral plan against savings: what the same funeral costs at the age you are likely to reach in your state, and what you would have to set aside now.',
  h1: 'Prepaid funeral plan or savings: which costs less',
  intro: 'Pick your state and type the price of the prepaid funeral plan you were quoted. The calculator grows it to the age you are likely to reach and works out what saving instead would take today. Burial insurance is compared on its own page, linked under the result.',
  resume: (h) => {
    const t = h.E.funeralTrend(); const price = (h.E.spendToday('TX').all as number);
    const c = h.E.prepaidCase({ price, age: AGE, sex: 'f', rate: 0.03, state: 'TX' }); const r = c.median; const later = c.later;
    return `A prepaid funeral plan, also called a pre-need contract, buys a funeral from one provider at today’s price, paid in one sum or by installments. Its value depends on two numbers: how fast funeral prices rise, and how long the contract waits. Funeral prices rose ${h.pc(t, 1)} a year from ${h.P.cpi.trendFrom} to ${h.P.cpi.trendTo}, on the Labor Department’s index. Half of the women of ${AGE} in Texas live past ${h.num1(r)}, so a funeral priced ${h.m(price)} today, the average Texas funeral, would cost about ${h.m(later)} by then. A prepaid contract that fixes that price is worth more than savings that earn less than the funeral trend after tax, and less than savings that earn more. Burial or final expense insurance is a third way: it pays a fixed sum that loses value as prices rise. The calculator compares the prepaid price with what you would need to set aside today at your own savings rate.`;
  },
  faqs: (h) => [
    { q: 'What happens to a prepaid funeral if I move?', a: 'It depends on the contract and the state where it was sold. Some contracts can be transferred to another funeral home, sometimes for a fee, and some can be cancelled with a refund of part of what was paid. Ask before signing whether the plan is portable, what is refunded on cancellation, and whether the money is held in a trust or paid into an insurance policy.' },
    { q: 'Is a prepaid funeral guaranteed?', a: 'Only for the items the contract lists as guaranteed. Many contracts fix the price of the funeral home’s own goods and services but not of cash advance items (fees the home pays to others for you), such as the cemetery’s opening and closing or the death certificates, which are paid at the later price. Read which lines are guaranteed and which are estimates, and keep the price list the contract was based on.' },
    { q: 'Is it better to prepay a funeral or buy burial insurance?', a: 'They do different things. A prepaid contract fixes the price of a listed funeral at one provider. A burial policy pays a fixed sum to a beneficiary, who can spend it at any funeral home or on anything else, but the sum buys less each year. The calculator here and the burial insurance page show both against the likely age of death.' },
  ],
  body: (h) => {
    const price = (h.E.spendToday('TX').all as number); const t = h.E.funeralTrend();
    const rows = [60, 65, 70, 75, 80, 85].map((a) => { const c2 = h.E.prepaidCase({ price, age: a, sex: 'f', rate: 0.02, state: 'TX' }); const c4 = h.E.prepaidCase({ price, age: a, sex: 'f', rate: 0.04, state: 'TX' });
      return [`${a}`, h.num1(c2.median), h.m(c2.later), h.m(c2.need), h.m(c4.need)]; });
    return `
<h2>The same funeral, by age at purchase</h2>
<p>When savings earn less than the rise in funeral prices, after tax, you would need to set aside more than today’s price, and prepaying comes out ahead on the items the contract guarantees. When savings earn more, saving does. The younger the buyer, the longer the wait and the larger the difference either way. The table takes the average Texas funeral today, ${h.m(price)}, the same figure as in the calculator, for a woman of each age, with savings at 2% or 4% a year after tax.</p>
<details class="repli-section"><summary>The same funeral by age at purchase, and what to save instead</summary>
<p>Each row grows today’s price to the age half of the women of that age in Texas reach, then works back to the sum that would pay it then.</p>
${h.table(['Age today', 'Age half of women reach', 'Funeral by then', 'Save today at 2%', 'Save today at 4%'], rows, `National Center for Health Statistics, Texas life table 2022, women; Bureau of Labor Statistics funeral price index, ${h.pc(t, 1)} a year; Census Bureau 2022 spending per death in Texas. The savings rates are illustrations, not forecasts.`, ['l', 'r', 'r', 'r', 'r'])}
</details>

<h2>Prepaid funeral plan or savings: what else to weigh</h2>
<p>The calculator compares money. Three other things decide many purchases.</p>
<ul>
<li><strong>Flexibility.</strong> Savings, or a bank account payable on death to the person who will arrange the funeral, can pay any funeral home, in any state, for any choice made later. A prepaid contract binds the money to one provider and one plan, unless it can be transferred.</li>
<li><strong>Protection of the money.</strong> Each state sets how a seller must hold the payments: in a trust, in an insurance policy, or in some other way. If the seller goes out of business, that protection is what remains. The state agency that licenses funeral homes can say which rules apply.</li>
<li><strong>What is left outside.</strong> Items the contract does not guarantee, cemetery charges bought separately, and fees the home pays to others for you are paid at the later price, by the family. The ${h.a('funeral-rule', 'price list page')} lists them.</li>
</ul>
<p>A ${h.a('burial-insurance', 'burial insurance policy')} is a third way: it pays a fixed sum to a person you name, who can use it at any funeral home, but that sum buys a little less every year.</p>

<h2>Paying by installments</h2>
<p>Many sellers offer installments over several years. They raise the total paid, and if the buyer dies before the last installment, what the family receives depends on the contract: some contracts are backed by an insurance policy that completes the payments, others refund what was paid. Ask for both the single price and the installment total in writing, and type the single price into the calculator.</p>
`;
  },
});
