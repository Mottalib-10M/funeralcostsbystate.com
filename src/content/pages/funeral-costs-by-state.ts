import { definePage } from '../../lib/guide-types';
import { stateIndex } from '../../lib/mini-specs';

export default definePage({
  id: 'funeral-costs-by-state',
  group: 'costs',
  order: 100,
  tool: { kind: 'mini:state', props: { state: stateIndex('TX') } },
  related: ['home', 'cremation-cost', 'funeral-cost-inflation', 'funeral-rule'],
  sources: ['census_ec', 'census_pop', 'bls_cpi'],
  slug: 'average-funeral-cost-by-state',
  nav: 'Average funeral cost by state',
  card: 'All 51 states: what funeral homes, cemeteries and crematories took in per death, in 2022 and today.',
  title: 'Average Funeral Cost by State: All 51, Census Data 2026',
  description: 'Average funeral cost by state from the Census Bureau: what funeral homes, cemeteries and crematories took in per death in all 50 states and DC, carried to 2026.',
  h1: 'Average funeral cost by state: all 50 states and DC, from Census figures',
  intro: 'Pick your state for its figure today, or find it in the A to Z list below. It is an average of every kind of funeral, not a price quote.',
  resume: (h) => {
    const us = h.E.spendPerDeath('US'); const r = h.E.ranking();
    return `The average funeral cost in the United States, measured as what funeral homes, cemeteries and crematories took in per death, was ${h.m(us.all as number)} in 2022: ${h.m(us.homes as number)} at funeral homes and ${h.m(us.cemeteries as number)} at cemeteries and crematories. At ${h.month} prices that is about ${h.m(h.today('US'))}. The figure comes from the Census Bureau’s 2022 Economic Census, which counts the revenue of death-care businesses in each state, divided by the deaths the Census Bureau estimates for that state. It ranges from ${h.m(h.today(r[0].s))} per death in ${h.E.stateName(r[0].s)} to ${h.m(h.today(r[r.length - 1].s))} in ${h.E.stateName(r[r.length - 1].s)}. It is an average of every kind of funeral, from a direct cremation to a burial with a plot and a headstone, and it includes cemetery sales made in advance, so it is a measure of spending, not a price quote.`;
  },
  faqs: (h) => {
    const r = h.E.ranking(); const us = h.today('US');
    const below = r.filter((x) => (h.E.spendToday(x.s).all as number) < us).length;
    return [
      { q: 'Why are funerals more expensive in some states?', a: 'Prices differ, but so do choices. Where cremation is common, fewer families buy a casket, a vault and a plot, and the average per death falls. Where many people buy cemetery plots and pre-need contracts years ahead, revenue is counted when the sale is made, which raises the figure. Wages, land and the number of deaths each funeral home handles also play a part.' },
      { q: 'How many states spend less than the national average per death?', a: `${below} of the 51, counting the District of Columbia. The national figure is pulled up by a few large, high-spending states such as New York and New Jersey, so most states sit below it. That is one reason to use the figure for your own state rather than a single national average quoted in an article.` },
      { q: 'Why is the funeral home figure missing for some states?', a: 'The Census Bureau withholds a figure when publishing it could reveal the revenue of a single company. For Alaska and Wyoming, the total for all death-care businesses is published, but the split between funeral homes and cemeteries is not. The table shows the total and leaves the split blank rather than guessing it.' },
      { q: 'Is this the same as the funeral industry’s median price?', a: 'No. Industry surveys, such as the one of the National Funeral Directors Association (NFDA), report the median price of a defined funeral package, such as a viewing and burial, from a sample of funeral homes. This page divides the total revenue of all death-care businesses by all deaths, so it covers every type of funeral and the cemetery side as well. The two answer different questions and are not comparable.' },
    ];
  },
  body: (h) => {
    const rows = h.E.ranking().map((x, i) => { const t = h.E.spendToday(x.s); const p = h.E.spendPerDeath(x.s);
      return [`${i + 1}`, h.E.stateName(x.s), h.m(t.all as number), t.homes == null ? 'withheld' : h.m(t.homes), t.cemeteries == null ? 'withheld' : h.m(t.cemeteries), h.num(Math.round(p.deaths)), h.num(p.establishments ?? 0)]; });
    const us = h.E.spendPerDeath('US'); const usT = h.E.spendToday('US');
    rows.push(['', 'United States', h.m(usT.all as number), h.m(usT.homes as number), h.m(usT.cemeteries as number), h.num(Math.round(us.deaths)), h.num(us.establishments ?? 0)]);
    const shareHomes = (us.homes as number) / (us.all as number);
    const az = [...h.E.STATES].map((s) => [h.E.stateName(s), h.m(h.today(s))]);
    return `
<h2>Average funeral cost in every state, A to Z</h2>
<p>Average funeral cost at ${h.month} prices: what the state’s funeral homes, cemeteries and crematories took in during 2022, divided by its deaths that year, then brought to today with the federal funeral price index. The national figure is ${h.m(usT.all as number)}.</p>
${h.table(['State', `Per death, ${h.month}`], az, 'Census Bureau, 2022 Economic Census and population estimates; Bureau of Labor Statistics funeral price index.', ['l', 'r'])}

<h2>What the figure does not tell you</h2>
<p>It does not tell you what a particular funeral home charges. Under the ${h.a('funeral-rule', 'Funeral Rule')} of the Federal Trade Commission (FTC), every home must give you its General Price List when you ask in person, and prices by phone if you call; two or three lists from homes near you will tell you more about your own bill than any average. It does not include costs outside death-care businesses, such as flowers bought from a florist, travel, a reception or newspaper notices paid directly. And it mixes all ages and all circumstances, including deaths where the county paid for a basic burial.</p>

<details class="repli-section"><summary>The ranked table: funeral homes and cemeteries apart, deaths and businesses</summary>
<p>Each row divides the 2022 revenue of the state’s death-care businesses by its deaths in 2022, then brings the result to ${h.month} with the federal funeral price index (the national index, so the same factor applies to every state).</p>
${h.table(['Rank', 'State', `Per death, ${h.month}`, 'Funeral homes', 'Cemeteries and crematories', 'Deaths, 2022', 'Businesses'], rows, 'Census Bureau, 2022 Economic Census, EC2281BASIC; deaths: mean of the Census estimate years ending June 2022 and June 2023. Bureau of Labor Statistics, consumer price index for funeral expenses.', ['l', 'l', 'r', 'r', 'r', 'r', 'r'])}
</details>

<details class="repli-section"><summary>How a state’s figure is worked out</summary>
<p>Funeral homes account for ${h.pc(shareHomes)} of the national total and cemeteries and crematories for the rest. A family that chooses a direct cremation pays mostly the funeral home side, often with a crematory fee inside it; a family that buries pays both, and the cemetery side can include a plot, the opening and closing of the grave, an outer burial container and a marker. The ${h.a('cremation-cost', 'cost of cremation')} page takes the cremation side apart.</p>
<p>The number of deaths per business says something about competition and scale. A state where each funeral home handles few deaths a year spreads its fixed costs, the building, the vehicles, the staff on call, over fewer families. That does not set any one price, but it is one reason two neighboring states can differ.</p>
<p>Death counts come from the Census Bureau’s population estimates, which report deaths for years running from July to June. The page uses the mean of the two years that straddle calendar 2022; nationally that comes within one percent of the final count published by the National Center for Health Statistics. A state’s figure moves with its revenue, so a large cemetery company headquartered in one state does not shift it: the Census counts revenue at each establishment, where the service is sold.</p>

<h3>Carrying a state’s figure forward</h3>
<p>The 2022 figure is the latest one the Census will publish until the 2027 Economic Census is released. The federal funeral price index carries it to today; to see what it will be when it is needed, the ${h.a('home', 'funeral cost calculator')} grows it at the trend of funeral prices up to the median age at death in your state, then takes off the VA allowance, the Social Security payment and what you have set aside. The ${h.a('funeral-cost-inflation', 'funeral inflation page')} shows the index year by year since 1987.</p>
</details>
`;
  },
});
