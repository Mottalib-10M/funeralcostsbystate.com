import { definePage } from '../../lib/guide-types';

export default definePage({
  id: 'va-burial-benefits',
  group: 'costs',
  order: 140,
  tool: { kind: 'mini:va' },
  related: ['home', 'cremation-cost', 'funeral-rule', 'funeral-costs-by-state'],
  sources: ['va_burial', 'ssa_cfr', 'census_ec'],
  slug: 'va-burial-allowance',
  nav: 'VA burial allowance',
  card: 'Every VA burial, plot and headstone allowance by date of death, plus the Social Security lump sum.',
  title: 'VA Burial Allowance 2026: Amounts by Date of Death and Plot',
  description: 'VA burial allowance amounts for 2026 and each year since 2013: service-connected or not, plot and headstone allowances, who claims, and the Social Security sum.',
  h1: 'VA burial allowance: what is paid, for which death, and who claims',
  intro: 'The VA (Department of Veterans Affairs) helps pay for some veterans’ funerals, not all. Answer the questions to see whether it pays in your case, and the most it pays toward the burial, the plot and a headstone.',
  resume: (h) => {
    const n = h.E.vaAllowance('nonService');
    return `The VA burial allowance helps the person who paid for a veteran’s funeral, if no one else, such as an employer or another agency, repays them. For a death caused by military service (service-connected), the VA pays up to ${h.m(h.P.va.serviceConnected)} when the veteran died on or after September 11, 2001, and up to ${h.m(h.P.va.serviceConnectedBefore2001)} before that date. For a death not caused by service, it pays a burial allowance of ${h.m(n.burial)} and a plot allowance (for the grave or the place of the ashes) of ${h.m(n.plot)} for deaths on or after ${h.D.vaFrom}, when the veteran met one of its conditions, such as receiving a VA pension or disability pay, dying in VA care, or having a claim open. Most veterans who were on none of these get no burial allowance. These amounts change every October 1. A headstone or marker allowance of up to ${h.m(h.E.headstoneAllowance())} can be added. The veteran must not have been dishonorably discharged. Social Security adds a one-time ${h.m(h.P.ssa.lumpSum)} for an eligible spouse or child. The calculator gives the most that can be paid for a chosen date and kind of death.`;
  },
  faqs: (h) => [
    { q: 'How do I apply for the VA burial allowance?', a: 'Online on va.gov, or by mail with the Application for Burial Benefits (VA Form 21P-530EZ), sent to the VA Pension Intake Center. A copy of the death certificate is needed, a receipt listing any transport costs, and the VA recommends the veteran’s discharge papers (DD214). A funeral home can apply when it is the one that paid.' },
    { q: 'Does a surviving spouse need to apply?', a: 'Not always. The VA says a surviving spouse listed on the veteran’s profile does not need to file a claim: when the VA learns of the death, it pays a set amount automatically to eligible spouses to help with the plot, the burial or the transport of the remains. A spouse who paid more than that, or a family member who is not the spouse, files the form.' },
    { q: 'Is there a time limit to claim VA burial benefits?', a: `For a death caused by service, none. For a death not caused by service, the claim must be made within ${h.P.va.claimYearsNonService} years of the burial, with two exceptions the VA lists: there is no limit if the veteran died in VA care, or if the claim is only for the plot or interment allowance or for transport.` },
  ],
  body: (h) => {
    const care = new Map(h.P.va.nonServiceVaCare.map((x) => [x.from, x]));
    const rows = h.P.va.nonService.map((x, i) => { const end = i === 0 ? 'today' : h.date(h.P.va.nonService[i - 1].from); const c = care.get(x.from);
      return [`${h.date(x.from)} to ${end}`, h.m(x.burial), h.m(x.plot), c && x.from < h.P.va.vaCareSameFrom ? `${h.m(c.burial)} + ${h.m(c.plot)}` : 'same']; });
    const hs = h.P.va.headstone.map((x, i) => [`${h.date(x.from)} to ${i === 0 ? 'today' : h.date(h.P.va.headstone[i - 1].from)}`, h.m(x.amount)]);
    const n = h.E.vaAllowance('nonService'); const us = h.today('US');
    return `
<h2>The VA burial allowance depends on the date of death</h2>
<p>For a death not caused by military service on or after ${h.D.vaFrom}, the VA pays up to ${h.m(n.burial)} toward the burial and ${h.m(n.plot)} toward the plot. The amount follows the date of death, not the date of the claim, so a family claiming late for an older death gets the rate of that year. For a death caused by service the allowance is a single sum, ${h.m(h.P.va.serviceConnected)} or ${h.m(h.P.va.serviceConnectedBefore2001)} before September 11, 2001, and the VA may also repay the cost of moving the remains to a VA national cemetery.</p>
<p>A headstone or marker allowance comes on top, reset every October 1. For a death on or after ${h.date(h.P.va.headstone[0].from)} it is up to ${h.m(h.P.va.headstone[0].amount)}, ${h.P.va.headstone[0].amount < h.P.va.headstone[1].amount ? 'a little less than' : 'up from'} the year before, as listed on va.gov.</p>
<details class="repli-section"><summary>Every amount since 2013, by date of death</summary>
${h.table(['Date of death', 'Burial allowance', 'Plot allowance', 'If in a VA hospital'], rows, `va.gov, Veterans burial allowance and transportation benefits, page updated ${h.date(h.P.va.pageUpdated)}, read ${h.D.read}.`, ['l', 'r', 'r', 'r'])}
<p>Before ${h.date(h.P.va.vaCareSameFrom)}, a veteran who was in a VA hospital at the time of death had a higher burial allowance; from that date both columns are the same.</p>
${h.table(['Date of death', 'Headstone or marker, most paid'], hs, 'va.gov, headstone or marker allowance amounts based on when the veteran died.', ['l', 'r'])}
</details>

<h2>Who can claim</h2>
<p>The VA repays the person or organization that paid for the burial and will not be repaid by anyone else: a husband, wife or partner, a child, a parent, the executor of the estate, another relative or a friend, or a funeral home or cemetery. The veteran must not have been dishonorably discharged.</p>
<p>For a death not caused by service, one of these must also be true: the veteran died while getting VA care, or traveling to or from it with VA approval; had a claim for VA pension or disability pay still open; was receiving a VA pension or disability pay; or could have received one but took military retired pay instead. The VA pays nothing for a death on active duty, in Congress, or in federal prison. It pays for every legal kind of funeral, including cremation, burial at sea and giving the body to a medical school.</p>

<h2>Against the cost of a funeral</h2>
<p>For a veteran whose death was not caused by service, the two allowances together come to ${h.m(n.total)}, ${h.pc(n.total / us)} of the national average funeral cost today (${h.m(us)}). The ${h.a('home', 'funeral cost calculator')} takes them off your state’s figure, with the ${h.m(h.P.ssa.lumpSum)} Social Security payment for a husband, wife or young child. A veteran may also be buried free in a VA national cemetery, with a headstone from the VA. These are maximums: only the VA and the Social Security Administration decide a claim.</p>
`;
  },
});
