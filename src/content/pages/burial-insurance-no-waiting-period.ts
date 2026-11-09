import { definePage } from '../../lib/guide-types';

const AGE = 70, PREMIUM = 50, FACE = 8000;

export default definePage({
  id: 'burial-insurance-no-waiting-period',
  group: 'final',
  order: 220,
  tool: { kind: 'mini:graded', props: { age: AGE, premium: PREMIUM, face: FACE } },
  related: ['final-expense-insurance', 'burial-insurance', 'life-insurance-for-seniors', 'whole-life-insurance-rates-by-age'],
  sources: ['nchs_us', 'nchs_states', 'census_ec'],
  slug: 'burial-insurance-no-waiting-period',
  nav: 'No waiting period and no exam',
  card: 'Policies with no health questions or no exam: what they pay if death comes in the first years, and the odds of it.',
  title: 'Burial Insurance With No Waiting Period or Medical Exam',
  description: 'Burial insurance with no waiting period or medical exam: guaranteed and simplified issue, what a graded policy pays in its first years, and the odds involved.',
  h1: 'Burial insurance with no waiting period, and life cover with no exam',
  intro: 'Type a graded policy’s premium, face amount and waiting period. The calculator shows what it pays on a death in each of the first years, and the odds of one.',
  resume: (h) => {
    const r = h.E.finalExpense({ age: AGE, sex: 'm', premium: PREMIUM, face: FACE, gradedYears: 2, gradedRefund: 0.1 });
    return `Life insurance with no medical exam comes in two kinds. Simplified issue policies ask a few health questions on the application and decide on the answers, without an exam or blood test; an applicant who passes usually gets the full face amount from the first day, with no waiting period. Guaranteed issue policies ask no health questions and accept every applicant in the age range, but usually pay only a graded benefit in the first two or three years: on a death from natural causes in that period, the beneficiary receives the premiums paid plus a stated percentage, not the face amount. Deaths from accidents are often paid in full from the start. For a man of ${AGE}, the NCHS life table gives a ${h.pc(r.dieInGraded)} chance of dying within two years, so the waiting period matters to few buyers but greatly to those it touches. The calculator shows what a graded policy pays on a death in each of its first years, using your own quote.`;
  },
  faqs: (h) => [
    { q: 'Is there burial insurance with no waiting period?', a: 'Yes, usually as simplified issue: the insurer asks health questions on the application, and if the answers qualify, the full benefit is payable from the first day. Guaranteed issue policies, which ask no questions, almost always have a graded period instead. The policy’s benefit schedule says which applies, and the word graded or modified in its name is a clue.' },
    { q: 'What does a graded death benefit pay?', a: 'During the graded period, usually two or three years, a death from natural causes pays back the premiums paid, often with interest of a stated percentage, or a fraction of the face amount that rises each year. After the period, the full face amount is paid. An accidental death is often paid in full from the start. The contract sets the exact rule.' },
    { q: 'Can a no-exam policy be denied?', a: 'A simplified issue policy can be declined, or offered only on graded terms, based on the answers to its health questions. A guaranteed issue policy cannot be declined within its age range. Answering the questions truthfully matters: within the contestable period, often the first two years, an insurer can contest a claim on a policy issued on false answers.' },
  ],
  body: (h) => {
    const rows = [50, 55, 60, 65, 70, 75, 80, 85].map((a) => [`${a}`, h.pc(h.E.payoutChance(a, 2, 'm')), h.pc(h.E.payoutChance(a, 2, 'f')), h.pc(h.E.payoutChance(a, 3, 'm')), h.pc(h.E.payoutChance(a, 3, 'f'))]);
    const r = h.E.finalExpense({ age: AGE, sex: 'm', premium: PREMIUM, face: FACE, gradedYears: 2, gradedRefund: 0.1 });
    return `
<h2>The chance of a death inside the waiting period</h2>
<p>Probability of dying within two or three years of buying, by age and sex, on the NCHS United States life table. The table covers the whole population; buyers of guaranteed issue policies include people in poorer health than average, so their odds are higher, which is why insurers grade the benefit.</p>
<details class="repli-section"><summary>Chance of dying in the waiting period, by age</summary>
${h.table(['Age', '2 years, men', '2 years, women', '3 years, men', '3 years, women'], rows, 'NCHS United States life tables, 2024. Chance of death from any cause within the period.', ['l', 'r', 'r', 'r', 'r'])}
</details>

<h2>What a graded policy pays, worked through</h2>
<p>A man of ${AGE} buys a guaranteed issue policy of ${h.m(FACE)} for ${h.m(PREMIUM)} a month, with a two-year graded period that returns premiums plus 10%. If he dies from natural causes in the first year, his beneficiary receives ${h.m(r.paidIfDeathInYear(1))}; in the second year, ${h.m(r.paidIfDeathInYear(2))}; from the third year, the full ${h.m(FACE)}. These are example figures; real policies differ in the length of the period, the refund rule and the treatment of accidents. Type your own into the calculator.</p>
<p>The trade is plain once the numbers are side by side. A buyer who could pass a simplified issue application gets the full benefit from the first day, usually at a lower premium. A buyer who cannot, or does not want to answer questions, accepts a period in which the policy works like a savings account with a small return, in exchange for certain acceptance.</p>

<h2>Simplified issue, guaranteed issue, fully underwritten</h2>
<ul>
<li><strong>Fully underwritten</strong>: an application, often an exam and records. The lowest premiums for those who qualify, and the largest face amounts.</li>
<li><strong>Simplified issue</strong>: health questions only, a decision in days or minutes. Full benefit from day one if accepted; face amounts usually smaller.</li>
<li><strong>Guaranteed issue</strong>: no questions within an age range set by the insurer. A graded benefit for the first years and the highest premium for the cover.</li>
</ul>
<p>Whatever the type, the ${h.a('final-expense-insurance', 'break-even calculator')} shows how many years of premiums add up to the face amount, and the ${h.a('burial-insurance', 'burial insurance page')} whether the face amount will still cover a funeral in your state.</p>

<h2>Other ways to avoid a waiting period</h2>
<p>Group life insurance at work is usually issued without health questions up to a set amount, but it ends when the job does. Veterans leaving service can convert their service members’ group cover to VGLI without health questions if they apply within a set period after separation; the ${h.a('term-life-insurance-rates-by-age', 'term rates page')} shows the VGLI rates. Money set aside in a payable-on-death account has no waiting period at all.</p>
`;
  },
});
