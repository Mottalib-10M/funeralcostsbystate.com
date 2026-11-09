import { definePage } from '../../lib/guide-types';

export default definePage({
  id: 'cremation-cost',
  group: 'costs',
  order: 110,
  tool: { kind: 'mini:cremation' },
  related: ['funeral-rule', 'funeral-costs-by-state', 'va-burial-benefits', 'home'],
  sources: ['ftc_rule', 'census_ec', 'va_burial', 'ssa_cfr'],
  slug: 'cost-of-cremation',
  nav: 'Cost of cremation',
  card: 'Add up the lines of a cremation price list, take off the VA and Social Security, and set it against your state.',
  title: 'Cost of Cremation 2026: Add Up a Price List, State by State',
  description: 'Cost of cremation in 2026: add up the lines of a funeral home price list, take off the VA allowance and the Social Security payment, and compare to your state.',
  h1: 'Cost of cremation: add up the price list, then take off what is paid',
  intro: 'Type the lines of a cremation price list. The total is set against what a death costs on average in your state, then the federal payments come off.',
  resume: (h) => {
    const us = h.E.spendToday('US'); const nonSvc = h.E.vaAllowance('nonService');
    return `The cost of cremation is set by the funeral home or crematory that performs it, and every one of them must show it on a General Price List under the FTC Funeral Rule. A direct cremation, with no viewing or ceremony beforehand, is usually the lowest-priced line on that list, and a home that offers it must let you use an alternative container instead of a casket. No public source publishes cremation prices by state, so this page does not print an average price. What can be measured is the spending of all death-care businesses: ${h.m(us.all as number)} per death nationally at ${h.month} prices, of which ${h.m(us.cemeteries as number)} goes to cemeteries and crematories. A veteran’s family may receive a VA burial allowance of ${h.m(nonSvc.burial)} or more for a cremation, and a surviving spouse ${h.m(h.P.ssa.lumpSum)} from Social Security. The calculator adds up the lines of your own price list and takes both off.`;
  },
  faqs: (h) => [
    { q: 'Do I need to buy a casket for a cremation?', a: 'No. Under the FTC Funeral Rule a funeral home that arranges direct cremations may not tell you that a casket is required, and it must make an alternative container available: an unfinished wood box or another container of fiberboard, pressed wood or cardboard. You can also bring a container bought elsewhere, and the home may not charge you a fee for using it.' },
    { q: 'What is included in a direct cremation price?', a: 'The Funeral Rule requires the price list to show the price of a direct cremation and to say what it includes, such as the transfer of the body, the necessary services of staff and the container. Whether the crematory fee is inside the price or listed as a separate charge differs between homes, so read the line itself before comparing two lists.' },
    { q: 'Does the VA pay for a veteran’s cremation?', a: `Yes, when the veteran qualifies. The VA says burial benefits cover all legal burial types, including cremation. The burial allowance is up to ${h.m(h.P.va.serviceConnected)} for a service-connected death, and otherwise ${h.m(h.E.vaAllowance('nonService').burial)} for a death on or after ${h.D.vaFrom} when one of its conditions is met. The plot or interment allowance can help when the ashes are placed in a grave or a niche.` },
    { q: 'Is cremation always cheaper than burial?', a: 'Usually, because a cremation can leave out a casket, an outer burial container, a plot and the opening of a grave, but not always. A cremation with a viewing beforehand, a rented casket, a service and a niche in a columbarium can approach the cost of a simple burial. The price list lets you compare the two at the same funeral home.' },
  ],
  body: (h) => {
    const rows = h.E.ranking().slice(0, 51).map((x) => ({ s: x.s, t: h.E.spendToday(x.s) })).filter((x) => x.t.cemeteries != null).sort((a, b) => (b.t.cemeteries as number) - (a.t.cemeteries as number));
    const tbl = [...rows.slice(0, 8), ...rows.slice(-8)].map((x) => [h.E.stateName(x.s), h.m(x.t.cemeteries as number), h.m(x.t.homes as number), h.pc((x.t.cemeteries as number) / (x.t.all as number))]);
    return `
<h2>The lines of a cremation price list</h2>
<p>A General Price List groups its prices in a set order. For a cremation, the lines that usually matter are these.</p>
<ul>
<li><strong>Basic services of the funeral director and staff.</strong> The one fee you cannot decline. It covers planning, permits, coordination with the crematory and overhead. Some homes include it in the direct cremation price; the list must say so.</li>
<li><strong>Transfer of the remains</strong> to the funeral home, often with a distance limit and a charge per mile beyond it.</li>
<li><strong>Direct cremation</strong>, a single price that the Rule requires to be listed, with the container options.</li>
<li><strong>Crematory fee</strong>, if the home uses an outside crematory and passes the charge on.</li>
<li><strong>Urn</strong>, from the home or bought anywhere else: the home may not make you buy one from it.</li>
<li><strong>Cash advance items</strong>: certified copies of the death certificate, permits, an obituary notice. The home pays them for you and must tell you if it adds a charge to them.</li>
</ul>
<p>Type each line from the list into the calculator. The amounts loaded there are only an example, not a price this site has read; a real list from two or three homes near you is the only reliable figure.</p>

<h2>The cemetery side, by state</h2>
<p>The Census counts crematories with cemeteries (industry 812220), so the cemetery side of spending per death covers both. States where that side is small spend most of their death-care money at funeral homes, which is what a family choosing cremation would mostly pay. The table shows the states with the largest and the smallest cemetery side, at ${h.month} prices.</p>
${h.table(['State', 'Cemeteries and crematories, per death', 'Funeral homes, per death', 'Cemetery share'], tbl, 'Census Bureau, 2022 Economic Census (NAICS 812210 and 812220), deaths from Census estimates, BLS funeral index. Alaska and Wyoming: split withheld.', ['l', 'r', 'r', 'r'])}
<p>These are averages across every kind of funeral, not cremation prices. They show where the money goes in each state, and they are a reasonable ceiling to hold a cremation quote against: a direct cremation priced above the whole spending per death of your state deserves a second list.</p>

<h2>What the federal government pays toward it</h2>
<p>The VA ${h.src('va_burial', 'burial allowance')} applies to cremation as to burial, when the veteran met one of the VA’s conditions, such as dying while receiving a VA pension or compensation or in VA care. The plot or interment allowance can pay toward placing the ashes in a grave or a niche. Social Security pays its ${h.m(h.P.ssa.lumpSum)} to a surviving spouse, or to an eligible child, whatever kind of funeral it is. The ${h.a('va-burial-benefits', 'VA burial page')} has the amounts for every date of death since 2013.</p>

<h2>Scattering, keeping or burying the ashes</h2>
<p>Once the cremation is done, the cost of what happens to the ashes depends on the choice. Keeping them at home or scattering them adds little to the bill, though states and local authorities set their own rules on where ashes may be scattered. Placing them in a cemetery plot, an urn garden or a columbarium niche brings back part of the cemetery side: the space itself, the opening and closing, and often a marker. A veteran’s ashes may be placed in a VA national cemetery. Ask for the cemetery’s own price list for these items; the Funeral Rule applies to funeral providers, and a cemetery that also sells funeral goods and services is covered for those.</p>
`;
  },
});
