import { definePage } from '../../lib/guide-types';

export default definePage({
  id: 'funeral-cost-inflation',
  group: 'costs',
  order: 120,
  tool: { kind: 'mini:inflation' },
  related: ['funeral-costs-by-state', 'burial-insurance', 'prepaid-funeral', 'home'],
  sources: ['bls_cpi', 'census_ec'],
  slug: 'funeral-cost-inflation',
  nav: 'Funeral cost inflation',
  card: 'The federal funeral price index since 1987: what an old bill or an old policy is worth at today’s prices.',
  title: 'Funeral Cost Inflation: BLS Funeral Price Index Since 1987',
  description: 'Funeral cost inflation from the BLS price index: what a funeral bill or policy from any year since 1987 is worth today, and how fast funeral prices rise.',
  h1: 'Funeral cost inflation, year by year since 1987',
  intro: 'Type a funeral price and its year to see it at today’s prices after funeral cost inflation, and how far it would move in the years ahead at the recent trend.',
  resume: (h) => {
    const y = h.E.funeralYoY(); const t = h.E.funeralTrend(); const a = h.E.allItemsTrend();
    return `Funeral cost inflation is measured by the Bureau of Labor Statistics in the Consumer Price Index for funeral expenses, a monthly series that starts in December 1986 at 100. In ${h.month} it stood at ${h.num1(h.E.latestFuneralIndex)}, ${h.pc(y.funeral, 1)} higher than a year earlier, while all consumer prices rose ${h.pc(y.all, 1)}. From ${h.P.cpi.trendFrom} to ${h.P.cpi.trendTo}, funeral prices rose ${h.pc(t, 1)} a year on average, against ${h.pc(a, 1)} for all items. The index follows the prices of a fixed set of funeral goods and services paid by urban consumers, not what families choose to spend. A price fixed in the past, such as the face amount of an old burial policy or a sum set aside years ago, buys less as the index rises. The calculator converts any amount from one year to today and projects it at the recent trend.`;
  },
  faqs: (h) => {
    const t = h.E.funeralTrend();
    return [
      { q: 'How much do funeral costs go up each year?', a: `On the BLS funeral expenses index, prices rose ${h.pc(t, 1)} a year on average from ${h.P.cpi.trendFrom} to ${h.P.cpi.trendTo}, and ${h.pc(h.E.funeralYoY().funeral, 1)} in the twelve months to ${h.month}. Single years vary, so the calculators use the ten-year average by default and let you type your own rate.` },
      { q: 'Have funeral prices risen faster than inflation?', a: `Over the whole series, yes: the funeral index rose ${h.pc(h.E.funeralAnnual(h.E.lastFullYear) / h.E.funeralAnnual(h.E.firstYear) - 1)} from ${h.E.firstYear} to ${h.E.lastFullYear}, against ${h.pc(h.E.allItemsAnnual(h.E.lastFullYear) / h.E.allItemsAnnual(h.E.firstYear) - 1)} for all consumer prices. Over the last ten years the order ${t < h.E.allItemsTrend() ? 'reversed, with funeral prices rising more slowly than the rest' : 'held'}. Both figures are national averages from the same survey.` },
      { q: 'What will my funeral cost in 20 years?', a: `Take today’s cost and grow it by the yearly rate for the number of years. At ${h.pc(t, 1)} a year, a funeral of ${h.m(10000)} today would cost about ${h.m(h.E.grow(10000, t, 20))} in twenty years. The home page calculator does this with your state’s spending per death and the age you are likely to reach.` },
      { q: 'Why does a fixed burial policy lose value?', a: `Because its face amount stays the same while prices rise. A ${h.m(10000)} policy bought twenty years before the funeral would buy, at the funeral, what about ${h.m(10000 / h.E.grow(1, t, 20))} buys today, at the recent trend. Some policies add an increasing benefit for a higher premium; the burial insurance page compares a fixed face amount with your state’s cost.` },
    ];
  },
  body: (h) => {
    const years: number[] = []; for (let y = h.E.firstYear; y <= h.E.lastFullYear; y++) years.push(y);
    const rows = years.map((y) => [String(y), h.num1(h.E.funeralAnnual(y)), y > h.E.firstYear ? h.pc(h.E.funeralAnnual(y) / h.E.funeralAnnual(y - 1) - 1, 1) : '', y > h.E.firstYear ? h.pc(h.E.allItemsAnnual(y) / h.E.allItemsAnnual(y - 1) - 1, 1) : '', h.m(h.E.toToday(1000, y))]);
    const us22 = h.E.spendPerDeath('US').all as number;
    return `
<h2>The index, every year</h2>
<p>Annual averages of the funeral expenses index, its change on the year before, the same change for all consumer prices, and what $1,000 of funeral spending in each year amounts to at ${h.month} prices.</p>
<details class="repli-section"><summary>The funeral price index, year by year</summary>
${h.table(['Year', 'Funeral index', 'Funeral prices, change', 'All prices, change', `$1,000 then, in ${h.month}`], rows, 'BLS CPI-U, U.S. city average, not seasonally adjusted: funeral expenses (CUUR0000SEGD02, December 1986 = 100) and all items (CUUR0000SA0). October 2025 was not collected; annual averages are as published.', ['l', 'r', 'r', 'r', 'r'])}
</details>

<h2>What the index measures</h2>
<p>The BLS prices a fixed set of funeral goods and services, month after month, in urban areas across the country, and reports how the price of that set changes. It does not measure what families spend: if more of them choose cremation, spending per death falls even when every price on the list rises. That is why this site uses two sources together. The level comes from the Census Bureau, which counts what death-care businesses took in per death in 2022 (${h.m(us22)} nationally). The movement since then comes from the BLS index, which brings that level to ${h.m(h.today('US'))} at ${h.month} prices.</p>
<p>The series is national. The BLS publishes consumer prices for regions and large metro areas, but the funeral index used here is the U.S. city average, so the same rate applies in every state. A state that spends more per death today will, at the same rate, keep spending more in dollars in the years ahead.</p>

<h2>Using funeral cost inflation for planning</h2>
<p>Every plan to pay for a funeral in advance is a bet on this rate. Money in a savings account keeps pace if it earns at least as much after tax. A ${h.a('prepaid-funeral', 'prepaid funeral contract')} fixes the price of what it lists, which removes the bet for those items. A ${h.a('burial-insurance', 'burial or final expense policy')} pays a fixed sum, so its value at the funeral falls by this rate every year it is held. The ${h.a('home', 'funeral cost calculator')} uses the ten-year average, ${h.pc(h.E.funeralTrend(), 1)} a year, to carry your state’s figure to the median age at death, and lets you type another rate in the second panel.</p>
<p>A ten-year average smooths out single years, but it is not a forecast. A higher rate makes a fixed sum lose value faster and a prepaid contract look better; a lower one does the reverse. Trying two or three rates in the calculator shows how much the answer depends on it.</p>
<p>Two checks help when a rate is quoted to you. A seller of a prepaid contract or a burial policy may quote a growth figure for funeral prices; compare it with the ten-year average shown here, read on the BLS series, and ask where theirs comes from. And a figure from an old article, a price list from a past year or a relative’s funeral bill can be brought to today with the calculator above, which uses the annual average of the year typed against the latest month published.</p>
`;
  },
});
