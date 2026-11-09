import { definePage } from '../../lib/guide-types';

export default definePage({
  id: 'va-burial-benefits',
  group: 'costs',
  order: 140,
  tool: { kind: 'mini:va' },
  related: ['home', 'cremation-cost', 'term-life-insurance-rates-by-age', 'funeral-costs-by-state'],
  sources: ['va_burial', 'ssa_cfr', 'census_ec'],
  slug: 'va-burial-allowance',
  nav: 'VA burial allowance',
  card: 'Every VA burial, plot and headstone allowance by date of death, plus the Social Security lump sum.',
  title: 'VA Burial Allowance 2026: Amounts by Date of Death and Plot',
  description: 'VA burial allowance amounts for 2026 and each year since 2013: service-connected or not, plot and headstone allowances, who claims, and the Social Security sum.',
  h1: 'VA burial allowance: what is paid, for which death, and who claims',
  intro: 'Choose the kind of death and its date to see the most the VA pays toward the burial, the plot and a headstone, and whether Social Security adds its lump sum.',
  resume: (h) => {
    const n = h.E.vaAllowance('nonService');
    return `The VA burial allowance helps the person who paid for a veteran’s funeral, if no other body repays them. For a service-connected death, the VA pays up to ${h.m(h.P.va.serviceConnected)} when the veteran died on or after September 11, 2001, and up to ${h.m(h.P.va.serviceConnectedBefore2001)} before that date. For a death that was not service-connected, it pays a burial allowance of ${h.m(n.burial)} and a plot or interment allowance of ${h.m(n.plot)} for deaths on or after ${h.D.vaFrom}, when the veteran met one of its conditions, such as receiving a VA pension or compensation, dying in VA care, or having a claim pending. These amounts change every October 1. A headstone or marker allowance of up to ${h.m(h.E.headstoneAllowance())} can be added. The veteran must not have had a dishonorable discharge. Social Security adds a one-time ${h.m(h.P.ssa.lumpSum)} for an eligible spouse or child. The calculator gives the most that can be paid for a chosen date and kind of death.`;
  },
  faqs: (h) => [
    { q: 'How do I apply for the VA burial allowance?', a: 'Online on va.gov, or by mail with VA Form 21P-530EZ, the Application for Burial Benefits, sent to the VA Pension Intake Center. A copy of the death certificate is needed, an itemized receipt for any transport costs, and the VA recommends the veteran’s DD214 or other separation documents. A funeral home can apply when it is the one that paid.' },
    { q: 'Does a surviving spouse need to apply?', a: 'Not always. The VA says a surviving spouse listed on the veteran’s profile does not need to file a claim: when the VA learns of the death, it pays a set amount automatically to eligible spouses to help with the plot, the interment or the transport of the remains. A spouse who paid more than that, or a family member who is not the spouse, files the form.' },
    { q: 'Is there a time limit to claim VA burial benefits?', a: `For a service-connected death, none. For a death that was not service-connected, the claim must be made within ${h.P.va.claimYearsNonService} years of the burial, with two exceptions the VA lists: there is no limit if the veteran died in VA care, or if the claim is only for the plot or interment allowance or for transport.` },
    { q: 'Who gets the Social Security death payment?', a: `The ${h.m(h.P.ssa.lumpSum)} goes first to a widow or widower who was living in the same household as the worker, or who could receive benefits on the worker’s record for the month of death. If there is none, it goes to a child who could receive benefits on that record. It is paid once and must be claimed within ${h.P.ssa.claimYears} years.` },
  ],
  body: (h) => {
    const care = new Map(h.P.va.nonServiceVaCare.map((x) => [x.from, x]));
    const rows = h.P.va.nonService.map((x, i) => { const end = i === 0 ? 'today' : h.date(h.P.va.nonService[i - 1].from); const c = care.get(x.from);
      return [`${h.date(x.from)} to ${end}`, h.m(x.burial), h.m(x.plot), c && x.from < h.P.va.vaCareSameFrom ? `${h.m(c.burial)} + ${h.m(c.plot)}` : 'same']; });
    const hs = h.P.va.headstone.map((x, i) => [`${h.date(x.from)} to ${i === 0 ? 'today' : h.date(h.P.va.headstone[i - 1].from)}`, h.m(x.amount)]);
    const n = h.E.vaAllowance('nonService'); const us = h.today('US');
    return `
<h2>Every non-service-connected amount since 2013</h2>
<p>The amount depends on the date of death, not the date of the claim. Before ${h.date(h.P.va.vaCareSameFrom)}, a veteran who was hospitalized by the VA at the time of death had a higher burial allowance; from that date both tables are the same.</p>
${h.table(['Date of death', 'Burial allowance', 'Plot or interment', 'If hospitalized by VA'], rows, `va.gov, Veterans burial allowance and transportation benefits, page updated ${h.date(h.P.va.pageUpdated)}, read ${h.D.read}.`, ['l', 'r', 'r', 'r'])}
<p>For a service-connected death the allowance is a single sum, ${h.m(h.P.va.serviceConnected)} or ${h.m(h.P.va.serviceConnectedBefore2001)}, with no separate plot allowance, and the VA may also repay some or all of the cost of moving the remains to a VA national cemetery.</p>

<h2>Headstone or marker allowance</h2>
${h.table(['Date of death', 'Most paid'], hs, 'va.gov, headstone or marker allowance amounts based on when the veteran died.', ['l', 'r'])}

<h2>Who can claim</h2>
<p>The VA pays the person or organization that paid for the burial and will not be repaid by anyone else, such as another government agency or the veteran’s employer. That can be a surviving spouse or partner from a legal union, a child, a parent, the executor of the estate, another family member or friend, or a funeral home or cemetery. The veteran must not have received a dishonorable discharge. For a death that was not service-connected, one of these must also be true: the veteran died while getting VA care, or traveling with VA authorization to or from such care, had a claim for compensation or pension pending, was receiving a VA pension or compensation, or was eligible for one but received military retired or disability pay instead.</p>
<p>The VA pays no burial allowance for a death on active duty, while serving as a member of Congress, or while serving a federal prison sentence. It pays for every legal type of burial, including cremation, burial at sea and donation of the body to a medical school.</p>

<h2>Against the cost of a funeral</h2>
<p>For a veteran whose death was not service-connected, the two allowances together come to ${h.m(n.total)}, ${h.pc(n.total / us)} of the national spending per death at ${h.month} prices (${h.m(us)}). With the Social Security payment, ${h.m(n.total + h.P.ssa.lumpSum)}. The ${h.a('home', 'funeral cost calculator')} takes them off your state’s figure for you. A veteran may also be buried in a VA national cemetery, and the VA furnishes headstones and markers; the conditions are on va.gov. For a veteran who held VGLI, the VA life insurance plan, its rates are on the ${h.a('term-life-insurance-rates-by-age', 'term rates by age')} page.</p>
<p>The amounts on this page are maximums, read on ${h.src('va_burial', 'va.gov')}. The ${h.src('ssa_cfr', 'Social Security regulation')} sets the ${h.m(h.P.ssa.lumpSum)}. Only the VA and the Social Security Administration decide a claim.</p>
`;
  },
});
