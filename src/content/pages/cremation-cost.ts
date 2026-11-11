import { definePage } from '../../lib/guide-types';
import * as E from '../../lib/engine/funeral';
import { formatMoney } from '../../lib/format';

// Testeurs du 2026-11-09 (tour final, 3 sur 3) : pas de prix de crémation alors que c'est la question n° 1. Aucune
// source officielle connue n'en publie (le Census compte des recettes, le BLS un indice sans prix ; les pages de la
// FTC et du BLS ont refusé curl le 2026-11-09, rien n'a donc pu être relu) : le chapeau le dit et donne le seul
// repère officiel, la moyenne de l'État qui mêle les enterrements, la même que dans le calculateur.
const TX_ALL = formatMoney(Math.round(E.spendToday('TX').all as number), 0);

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
  intro: `No official source publishes a cremation price, for a state or for the country, so this page does not invent one. A direct cremation usually costs far less than your state’s average funeral, which mixes in burials: ${TX_ALL} in Texas. If a quote comes close to that, ask two more funeral homes; they must give prices by phone. Then type the lines of the price list below.`,
  resume: (h) => {
    const us = h.E.spendToday('US'); const nonSvc = h.E.vaAllowance('nonService');
    return `The cost of cremation is set by the funeral home or crematory that performs it, and every one of them must show it on a General Price List (the written list of every price it charges) under the Funeral Rule, a federal rule enforced by the Federal Trade Commission (FTC). A direct cremation, with no viewing or ceremony beforehand, is usually the lowest-priced line on that list, and a home that offers it must let you use an alternative container instead of a casket. No public source publishes cremation prices by state, so this page does not print an average price. What can be measured is the spending of all death-care businesses: ${h.m(us.all as number)} per death nationally at ${h.month} prices, of which ${h.m(us.cemeteries as number)} goes to cemeteries and crematories. A veteran’s family may receive a burial allowance from the VA (Department of Veterans Affairs) of ${h.m(nonSvc.burial)} or more for a cremation, and a surviving spouse ${h.m(h.P.ssa.lumpSum)} from Social Security. The calculator adds up the lines of your own price list and takes both off.`;
  },
  faqs: (h) => [
    { q: 'Do I need to buy a casket for a cremation?', a: 'No. Under the Funeral Rule of the Federal Trade Commission, a funeral home that arranges direct cremations may not tell you that a casket is required, and it must make an alternative container available: an unfinished wood box or another container of fiberboard, pressed wood or cardboard. You can also bring a container bought elsewhere, and the home may not charge you a fee for using it.' },
    { q: 'What is included in a direct cremation price?', a: 'The Funeral Rule requires the price list to show the price of a direct cremation and to say what it includes, such as the transfer of the body, the necessary services of staff and the container. Whether the crematory fee is inside the price or listed as a separate charge differs between homes, so read the line itself before comparing two lists.' },
    { q: 'Does the VA pay for a veteran’s cremation?', a: `Yes, when the veteran qualifies. The VA says burial benefits cover all legal burial types, including cremation. The burial allowance is up to ${h.m(h.P.va.serviceConnected)} for a death caused by military service, and otherwise ${h.m(h.E.vaAllowance('nonService').burial)} for a death on or after ${h.D.vaFrom} when one of its conditions is met. The VA plot allowance can also help when the ashes are placed in a grave, or in a niche (a space in a wall built for urns).` },
  ],
  body: (h) => `
<h2>The lines of a cremation price list</h2>
<p>A General Price List groups its prices in a set order. For a cremation, the lines that usually matter are these.</p>
<ul>
<li><strong>Basic services of the funeral director and staff.</strong> The one fee you cannot decline. It covers planning, permits, coordination with the crematory and overhead. Some homes include it in the direct cremation price; the list must say so.</li>
<li><strong>Transfer of the remains</strong> to the funeral home, often with a distance limit and a charge per mile beyond it.</li>
<li><strong>Direct cremation</strong>, a single price that the Rule requires to be listed, with the container options.</li>
<li><strong>Crematory fee</strong>, if the home uses an outside crematory and passes the charge on.</li>
<li><strong>Urn</strong>, from the home or bought anywhere else: the home may not make you buy one from it.</li>
<li><strong>Cash advance items</strong>: fees the home pays to others for you, such as certified copies of the death certificate, permits or an obituary notice. The home must tell you if it adds a charge to them.</li>
</ul>
<p>Type each line from the list into the calculator. The amounts loaded there are only an example, not a price this site has read; a real list from two or three homes near you is the only reliable figure. Hold it against your state’s average funeral, which mixes in burials with a casket and a plot: a direct cremation priced above that average deserves a second list. The ${h.a('funeral-costs-by-state', 'average funeral cost by state')} page has every state.</p>

<h2>What the federal government pays toward a cremation</h2>
<p>The VA ${h.src('va_burial', 'burial allowance')} applies to cremation as to burial, when the veteran met one of the VA’s conditions, such as dying while receiving a VA pension or disability pay, or in VA care. The VA plot allowance can pay toward placing the ashes in a grave or a niche. Social Security pays its ${h.m(h.P.ssa.lumpSum)} to a surviving husband or wife, or to a young child, whatever kind of funeral it is. The ${h.a('va-burial-benefits', 'VA burial page')} has the amounts for every date of death since 2013.</p>

<h2>Scattering, keeping or burying the ashes</h2>
<p>Once the cremation is done, the cost of what happens to the ashes depends on the choice. Keeping them at home or scattering them adds little to the bill, though states and towns set their own rules on where ashes may be scattered. Placing them in a cemetery plot, an urn garden or a niche in a wall built for urns brings back part of the cemetery costs: the space itself, the opening and closing, and often a marker. A veteran’s ashes may be placed in a VA national cemetery. Ask the cemetery for its own price list, and compare it with a cremation and burial at the same funeral home: a cremation with a viewing, a rented casket and a service can come close to the cost of a simple burial.</p>
`,
});
