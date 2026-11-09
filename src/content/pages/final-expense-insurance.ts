import { definePage } from '../../lib/guide-types';

const AGE = 65, PREMIUM = 60, FACE = 10000;

export default definePage({
  id: 'final-expense-insurance',
  group: 'final',
  order: 200,
  tool: { kind: 'mini:final', props: { age: AGE, premium: PREMIUM, face: FACE } },
  related: ['burial-insurance', 'burial-insurance-no-waiting-period', 'whole-life-insurance-rates-by-age', 'home'],
  sources: ['nchs_us', 'nchs_states', 'census_ec'],
  slug: 'final-expense-insurance',
  nav: 'Final expense insurance',
  card: 'The age at which your quoted premiums add up to the face amount, and the odds of living past it.',
  title: 'Final Expense Insurance: Break-Even Age on Your Own Quote',
  description: 'Final expense insurance checked on your own quote: the age when premiums add up to the face amount, the chance of living past it, and premiums paid on average.',
  h1: 'Final expense insurance for seniors: when premiums pass the payout',
  intro: 'Type the monthly premium and face amount from a quote. The calculator gives the age at which you will have paid in the face amount, and the odds of living past it.',
  resume: (h) => {
    const r = h.E.finalExpense({ age: AGE, sex: 'm', premium: PREMIUM, face: FACE });
    return `Final expense insurance, also sold as funeral or burial insurance, is a small whole life policy, usually with a face amount of a few thousand to a few tens of thousands of dollars, sold to people in their fifties to eighties to pay for a funeral and final bills. The premium is level and the cover lasts for life, so the key number is how many years of premiums it takes to pay in the face amount. A man of ${AGE} quoted ${h.m(PREMIUM)} a month for ${h.m(FACE)} of cover pays ${h.m(r.yearly)} a year and reaches the face amount at age ${h.num(Math.floor(r.breakEvenAge))}. On the NCHS United States life table, ${h.pc(r.aliveAtBreakEven)} of men his age are still alive then, and on average he would pay ${h.m(r.expected)} in premiums before his death. That does not make the policy a bad buy, since it pays at once if death comes early, but it is the trade to understand. This site shows no premiums: the calculator uses only the quote you type.`;
  },
  faqs: (h) => [
    { q: 'What is the difference between final expense and burial insurance?', a: 'In most cases none: both names describe a small whole life policy meant to pay for a funeral, and the payout goes to a beneficiary who can spend it on anything. Some sellers use burial insurance for policies tied to a funeral home, which are closer to a prepaid funeral contract. Read whether the money goes to a person or to a provider.' },
    { q: 'Is final expense insurance worth it?', a: 'It depends on how long you live and what else you have. If the premiums would add up to the face amount within a few years, money set aside each month in a savings account would grow to the same sum over the same years. The policy is worth more to someone who may not live that long, or who would not save the money otherwise.' },
    { q: 'Can my final expense premium go up?', a: 'Most final expense policies are whole life with a premium that is fixed for life and a face amount that does not change. Some policies, often sold as term or as modified plans, raise the premium at set ages or end at a set age. The policy illustration and the contract say which: look for the words level premium and the age, if any, at which cover ends.' },
    { q: 'What happens if I stop paying a final expense policy?', a: 'A whole life policy that has built up cash value may offer a reduced paid-up policy, extended term cover or a cash surrender value after a few years, as listed in its table of nonforfeiture values. In the first years there may be nothing left. Check the table in your contract before stopping, and ask the insurer for the current figures in writing.' },
  ],
  body: (h) => {
    const ages = [55, 60, 65, 70, 75, 80];
    const rows = ages.map((a) => { const r = h.E.finalExpense({ age: a, sex: 'm', premium: PREMIUM, face: FACE }); const f = h.E.finalExpense({ age: a, sex: 'f', premium: PREMIUM, face: FACE });
      return [`${a}`, h.num(Math.floor(r.breakEvenAge)), h.pc(r.aliveAtBreakEven), h.pc(f.aliveAtBreakEven), h.m(r.expected), h.m(f.expected)]; });
    return `
<h2>The same premium at different ages</h2>
<p>A premium of ${h.m(PREMIUM)} a month for ${h.m(FACE)} of cover reaches the face amount after the same number of years at any age. What changes is the chance of living that long. Real premiums rise with age at purchase; type your own quote into the calculator.</p>
<details class="repli-section"><summary>Break-even age by age at purchase, men and women</summary>
${h.table(['Age at purchase', 'Premiums equal face at', 'Alive then, men', 'Alive then, women', 'Paid on average, men', 'Paid on average, women'], rows, `NCHS United States life tables 2024, whole population. Same premium of ${h.m(PREMIUM)} a month at every age, for illustration only.`, ['l', 'r', 'r', 'r', 'r', 'r'])}
</details>

<h2>How to read the break-even</h2>
<p>The break-even age is a simple ratio: the face amount divided by the yearly premium, added to your age today. It ignores interest, which favors the insurer, and it ignores rising funeral prices, which work against the fixed face amount. If you would be likely to live well past the break-even, the money paid in premiums could have been saved instead, and would have grown. If you are likely to die before it, the policy pays more than you put in. The table shows that at most ages the odds lean toward living past it, which is how the insurer covers its claims and costs.</p>
<p>Population life tables cover everyone, including people in poor health. Insurers that ask health questions accept healthier applicants on better terms, so the odds for those policyholders are a little longer than the table; policies with no health questions accept everyone and are priced for it, often with a ${h.a('burial-insurance-no-waiting-period', 'waiting period')} on the full benefit.</p>

<h2>Sizing the face amount</h2>
<p>A face amount bought today is spent at the funeral, years from now, when prices will be higher. The ${h.a('burial-insurance', 'burial insurance calculator')} sets a face amount against the spending per death of your state at the age you are likely to reach. The ${h.a('home', 'funeral cost calculator')} takes off what the VA and Social Security pay, and what you have set aside, before you decide how much cover to buy. Nationally, death-care businesses took in ${h.m(h.today('US'))} per death at ${h.month} prices; that average includes every burial with a plot and a headstone, so a simple cremation can need far less.</p>

<h2>Reading a quote</h2>
<ul>
<li>Is the premium level for life, or does it rise or stop at a set age?</li>
<li>Is the full face amount paid from the first day, or is there a graded period?</li>
<li>Does the face amount stay fixed, or does it grow?</li>
<li>Who is the beneficiary: a person you choose, or a funeral home?</li>
<li>What is the cash surrender value after five and ten years?</li>
</ul>
`;
  },
});
