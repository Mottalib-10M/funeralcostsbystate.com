import { definePage } from '../../lib/guide-types';

const FACE = 25000;

export default definePage({
  id: 'whole-life-insurance-rates-by-age',
  group: 'life',
  order: 320,
  tool: { kind: 'mini:whole', props: { face: FACE } },
  related: ['final-expense-insurance', 'cash-value-life-insurance', 'term-life-insurance-rates-by-age', 'life-insurance-for-seniors'],
  sources: ['nchs_us', 'nchs_states', 'irs_525'],
  slug: 'whole-life-insurance-rates-by-age',
  nav: 'Whole life rates by age',
  card: 'A yardstick premium by age: the monthly amount at which expected premiums equal the face amount.',
  title: 'Whole Life Insurance Rates by Age: a Life Table Yardstick',
  description: 'Whole life insurance rates by age against a yardstick from NCHS life tables: the monthly premium at which expected premiums equal the face amount, by sex.',
  h1: 'Whole life insurance rates by age, against a life table yardstick',
  intro: 'Type an age and a face amount to see the monthly premium at which, on average, premiums paid would equal the payout. Add your own quote to compare.',
  resume: (h) => {
    const r = h.E.finalExpense({ age: 55, sex: 'f', premium: 1, face: FACE }); const fair = FACE / r.expected;
    return `Whole life insurance rates are not published by insurers in a form a site may reprint, so this page builds a yardstick instead. A whole life policy pays its face amount whenever death comes, in exchange for a premium paid for life or to a set age. On the NCHS United States life table, a woman of 55 pays premiums for ${h.num1(r.expected / 12)} years on average before her death. Dividing a face amount of ${h.m(FACE)} by that many years of monthly payments gives ${h.m2(fair)} a month: the premium at which, on average, she would pay in exactly what the policy pays out, with no interest, no expenses and no profit. A real premium sits above or below this line. Above it, the insurer is counting on investment returns and costs; below it, the policy is cheap against the life table. It is a way to read a quote, not a price, and the calculator compares your own quote with it.`;
  },
  faqs: (h) => [
    { q: 'Why is whole life so much more expensive than term?', a: 'A term policy pays only if death comes within the term, and most terms end with no claim. A whole life policy pays at death whenever it comes, so the insurer is almost certain to pay, and it also builds a cash value. The premium for the same face amount is therefore many times higher, especially when bought young.' },
    { q: 'Is whole life insurance worth it for seniors?', a: 'It can be for a need that lasts for life, such as a funeral or an estate tax bill, when the premium is near or below the yardstick for your age. Where premiums would add up to the face amount within a few years, saving the same sums each month may serve as well. Compare your quote with the yardstick and with the break-even age.' },
    { q: 'What does whole life insurance cost per month at 60?', a: `No market price is published under terms this site can reprint. As a yardstick, the monthly premium at which a man of 60 would on average pay in ${h.m(FACE)} is ${h.m2(FACE / h.E.finalExpense({ age: 60, sex: 'm', premium: 1, face: FACE }).expected)}, and for a woman of 60 ${h.m2(FACE / h.E.finalExpense({ age: 60, sex: 'f', premium: 1, face: FACE }).expected)}, on NCHS tables with no interest or costs.` },
  ],
  body: (h) => {
    const ages = [40, 45, 50, 55, 60, 65, 70, 75, 80];
    const y = (a: number, s: 'm' | 'f') => h.E.finalExpense({ age: a, sex: s, premium: 1, face: FACE }).expected;
    const rows = ages.map((a) => [`${a}`, h.num1(y(a, 'm') / 12), h.m2(FACE / y(a, 'm')), h.num1(y(a, 'f') / 12), h.m2(FACE / y(a, 'f'))]);
    return `
<h2>The yardstick, by age</h2>
<p>For a face amount of ${h.m(FACE)}, paid for life: the average number of years of premiums before death, and the monthly premium at which those premiums equal the face amount. Scale it to any amount: double the face, double the premium.</p>
${h.table(['Age', 'Years of premiums, men', 'Yardstick, men', 'Years of premiums, women', 'Yardstick, women'], rows, 'NCHS United States life tables, 2024. No interest, expenses, lapses or cash value: a yardstick, not a price.', ['l', 'r', 'r', 'r', 'r'])}

<h2>How the yardstick is built</h2>
<p>Each year, a person who is still alive pays twelve monthly premiums. The chance of being alive at the start of each year comes from the life table, year after year to age 100. Adding those chances gives the expected number of years of premiums. A premium equal to the face amount divided by twelve times that number makes the expected premiums equal the face amount. The calculation ignores interest: an insurer invests premiums for years before paying, which lets it charge less than the yardstick, while its expenses, commissions, profit and the cash value it builds push the other way.</p>
<p>It also uses population rates. People who pass a whole life application tend to live longer than the population, so they pay more years of premiums, which lowers the fair premium for them; people sold policies with no health questions tend to live less long, which raises it.</p>

<h2>Reading a quote with it</h2>
<p>Type the premium of a quote into the calculator. It shows the age at which your premiums would add up to the face amount, and how much you would pay in on average. A quote far above the yardstick is a policy where the cash value, the guarantees or the insurer’s costs carry a large share of the premium; that can be the right choice, but it is worth knowing. A whole life policy also builds a cash value that can be borrowed against or surrendered; the ${h.a('cash-value-life-insurance', 'cash value page')} shows how a surrender is taxed.</p>
<p>For small policies sold to pay for a funeral, the ${h.a('final-expense-insurance', 'final expense break-even')} page asks the same question with the premium you were quoted, and the ${h.a('life-insurance-for-seniors', 'cover after 60 page')} shows how long cover bought late has to last.</p>

<h2>Paid-up at 65 or 100</h2>
<p>Some whole life policies stop the premiums at a set age, such as 65 or 100, while the cover continues. Fewer years of premiums mean a higher premium for each year. The calculator on the final expense page lets you set the age at which premiums stop and shows the most you can pay in.</p>
`;
  },
});
