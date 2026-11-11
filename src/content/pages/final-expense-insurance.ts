import { definePage } from '../../lib/guide-types';

import { stateIndex } from '../../lib/mini-specs';

// Un seul exemple sur le site (testeurs naïfs du 2026-11-10, règle 1) : une femme de 65 ans au Texas.
const AGE = 65, PREMIUM = 60, FACE = 10000;

export default definePage({
  id: 'final-expense-insurance',
  group: 'final',
  order: 200,
  tool: { kind: 'mini:final', props: { state: stateIndex('TX'), age: AGE, premium: PREMIUM, face: FACE } },
  related: ['burial-insurance', 'burial-insurance-no-waiting-period', 'prepaid-funeral', 'home'],
  sources: ['nchs_us', 'nchs_states', 'census_ec'],
  slug: 'final-expense-insurance',
  nav: 'Final expense insurance',
  card: 'The age at which your quoted premiums add up to the face amount, and the odds of living past it.',
  title: 'Final Expense Insurance: When Premiums Pass the Payout',
  description: 'Final expense insurance checked on your own quote: the age when premiums add up to the face amount, the chance of living past it, and premiums paid on average.',
  h1: 'Final expense insurance for seniors: when premiums pass the payout',
  intro: 'Final expense insurance and burial insurance are the same kind of policy. This page checks the premiums (monthly payments) on your quote: at what age do they add up to the payout?',
  resume: (h) => {
    const r = h.E.finalExpense({ age: AGE, sex: 'f', state: 'TX', premium: PREMIUM, face: FACE });
    return `Final expense insurance, also sold as funeral or burial insurance, is a small life insurance policy that lasts for life, usually paying out a few thousand to a few tens of thousands of dollars, sold to people in their fifties to eighties to pay for a funeral and final bills. The monthly payment never changes and the cover lasts for life, so the key number is how many years of payments it takes to pay in as much as the policy pays out. A woman of ${AGE} in Texas quoted ${h.m(PREMIUM)} a month for ${h.m(FACE)} of cover pays ${h.m(r.yearly)} a year and has paid in ${h.m(FACE)} by age ${h.num(Math.floor(r.breakEvenAge))}. On the Texas life table of the National Center for Health Statistics, ${h.pc(r.aliveAtBreakEven)} of women her age are still alive then, and on average she would pay ${h.m(r.expected)} in premiums before her death. That does not make the policy a bad buy, since it pays at once if death comes early, but it is the trade to understand. This site shows no premiums: the calculator uses only the quote you type.`;
  },
  faqs: (h) => [
    { q: 'What is the difference between final expense and burial insurance?', a: 'In most cases none: both names describe a small life insurance policy that lasts for life, meant to pay for a funeral, and the payout goes to a beneficiary who can spend it on anything. Some sellers use burial insurance for policies tied to a funeral home, which are closer to a prepaid funeral contract. Read whether the money goes to a person or to a provider.' },
    { q: 'Is final expense insurance worth it?', a: 'It depends on how long you live and what else you have. If the premiums would add up to the face amount within a few years, money set aside each month in a savings account would grow to the same sum over the same years. The policy is worth more to someone who may not live that long, or who would not save the money otherwise.' },
    { q: 'Can my final expense premium go up?', a: 'Most final expense policies last for life, with a monthly payment that never changes and a payout that does not change either. Some policies raise the payment at set ages, or end at a set age. The contract says which: look for the words level premium (a payment that never changes) and the age, if any, at which the cover ends.' },
  ],
  body: (h) => {
    const ages = [55, 60, 65, 70, 75, 80];
    const rows = ages.map((a) => { const f = h.E.finalExpense({ age: a, sex: 'f', state: 'TX', premium: PREMIUM, face: FACE }); const r = h.E.finalExpense({ age: a, sex: 'm', state: 'TX', premium: PREMIUM, face: FACE });
      return [`${a}`, h.num(Math.floor(f.breakEvenAge)), h.pc(f.aliveAtBreakEven), h.pc(r.aliveAtBreakEven), h.m(f.expected), h.m(r.expected)]; });
    return `
<h2>When your payments add up to the payout</h2>
<p>This age, sometimes called the break-even age, is a simple sum: the payout divided by a year of premiums, added to your age today. If you are likely to live well past it, the money paid in premiums could have been saved instead. If you die before it, the policy pays more than you put in. At most ages the odds lean toward living past it, which is how the insurer pays its claims and costs. The sum leaves out interest, which favors the insurer, and rising funeral prices, which shrink what a fixed payout buys: the ${h.a('burial-insurance', 'burial insurance calculator')} shows that part.</p>
<p>The life tables (official tables of how long people live) cover everyone, including people in poor health. Policies that ask health questions accept healthier buyers on better terms; policies with no health questions accept everyone and often pay only the premiums back in the first years, the ${h.a('burial-insurance-no-waiting-period', 'waiting period')}.</p>

<h2>The same premium at different ages</h2>
<p>A premium of ${h.m(PREMIUM)} a month for ${h.m(FACE)} of cover reaches the payout after the same number of years at any age. What changes is the chance of living that long. Real premiums rise with the age at purchase: type your own quote into the calculator.</p>
<details class="repli-section"><summary>Age when premiums pass the payout, by age at purchase, in Texas</summary>
<p>Each row keeps the same premium and payout and changes only the age at purchase. The last two columns are the premiums paid on average before death, counting the years each buyer is likely to live.</p>
${h.table(['Age at purchase', 'Premiums equal the payout at', 'Still alive then, women', 'Still alive then, men', 'Paid on average, women', 'Paid on average, men'], rows, `National Center for Health Statistics, Texas life table 2022. Same premium of ${h.m(PREMIUM)} a month at every age, for illustration only.`, ['l', 'r', 'r', 'r', 'r', 'r'])}
</details>

<h2>Reading a final expense insurance quote</h2>
<ul>
<li>Is the monthly payment the same for life, or does it rise or stop at a set age?</li>
<li>Is the full amount paid from the first day, or is there a graded period (often the first two years, when the policy pays back only your premiums)?</li>
<li>Does the payout stay fixed, or does it grow?</li>
<li>Who receives the money: a person you choose, or a funeral home?</li>
<li>How much cash would you get back if you cancel after five and ten years (the cash surrender value)?</li>
</ul>
`;
  },
});
