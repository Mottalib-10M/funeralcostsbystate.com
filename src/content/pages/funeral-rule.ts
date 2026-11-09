import { definePage } from '../../lib/guide-types';

export default definePage({
  id: 'funeral-rule',
  group: 'costs',
  order: 130,
  tool: { kind: 'mini:gpl' },
  related: ['cremation-cost', 'prepaid-funeral', 'funeral-costs-by-state', 'home'],
  sources: ['ftc_rule', 'census_ec'],
  slug: 'funeral-price-list-rights',
  nav: 'Funeral price list rights',
  card: 'What the FTC Funeral Rule makes every funeral home show and allow, with a package against itemized check.',
  title: 'Funeral Price List Rights: the FTC Funeral Rule, Explained',
  description: 'Funeral price list rights under the FTC Funeral Rule: the General Price List, prices by phone, buying only what you want, and a package against itemized check.',
  h1: 'Your funeral price list rights under the FTC Funeral Rule',
  intro: 'Type a package price and the items you would choose from the same price list to see what itemizing saves.',
  resume: (h) => `The FTC Funeral Rule, in 16 CFR Part 453, sets what every funeral provider in the United States must show and allow. When you ask about arrangements in person, the funeral home must give you a General Price List to keep, listing the price of each good and service it offers. It must give prices over the phone if you ask, show its casket and outer burial container price lists before you see the merchandise, and give you an itemized statement of what you chose before you pay. You may buy only the items you want, except a basic services fee and anything a law requires; the home may not make buying its own casket or urn a condition of its services, and it may not say that embalming is required when no law requires it. Packages are allowed, but so is choosing item by item. The calculator compares a package price with the items you would pick from the same list, plus cash advance fees.`,
  faqs: (h) => [
    { q: 'Does a funeral home have to give me a price list?', a: 'Yes. Under the FTC Funeral Rule the home must give you a General Price List to keep as soon as you begin discussing arrangements, the type of funeral, or the goods and services it offers, in person. It must also show a casket price list and an outer burial container price list before you look at the items themselves.' },
    { q: 'Can a funeral home refuse a casket bought online?', a: 'No. The Funeral Rule forbids making the purchase of any good, such as a casket, a condition of buying other goods or services, and it allows only one fee that every customer must pay, the basic services fee. A separate charge for handling a casket you bring is therefore not allowed. Have it delivered to the home before the service.' },
    { q: 'Is embalming required by law?', a: 'Not as a general rule. The Funeral Rule forbids a funeral home to say that embalming is required when state or local law does not require it, and the price list must say that embalming is not required by law except in certain special cases. The home may require it for a viewing with an open casket, and must tell you that you can choose an arrangement without one, such as direct cremation.' },
    { q: 'Who enforces the Funeral Rule?', a: 'The Federal Trade Commission. A complaint about a funeral home can be sent to the FTC, and also to the state board or agency that licenses funeral directors, which handles license issues. Keep the General Price List and the itemized statement: they are the documents that show what you were offered and what you paid.' },
  ],
  body: (h) => `
<h2>What the price list must show</h2>
<p>The General Price List is the core of the Rule. It must carry the funeral home’s name, address and phone number, an effective date, and the price of each item it offers in a set order, with the disclosures written in the Rule. The lines that every list must price separately, if the home offers them, include:</p>
<ul>
<li>forwarding remains to another funeral home, and receiving remains from one;</li>
<li>direct cremation and immediate burial, with a description of what each price includes;</li>
<li>transfer of remains to the funeral home, embalming, and other preparation of the body;</li>
<li>use of facilities and staff for a viewing, a funeral ceremony or a memorial service, and use of equipment and staff for a graveside service;</li>
<li>a hearse and a limousine;</li>
<li>the basic services of the funeral director and staff, the one fee that may not be declined.</li>
</ul>
<p>Caskets and outer burial containers can sit on separate lists, but the general list must give their price range or say where to find them.</p>

<h2>What you may decline</h2>
<p>Everything except the basic services fee and what a law requires. You can buy a casket elsewhere and have it delivered, use an alternative container for a cremation, skip embalming when there is no viewing, refuse an outer burial container unless the cemetery requires one, and leave out the hearse, the limousine and the printed cards. The home must write on the statement any legal, cemetery or crematory requirement that obliged you to buy an item, with the reason.</p>
<p>A package is allowed as long as the itemized prices are also offered. When the home’s package costs less than the same items bought one by one, it can be the better deal; when it includes things you would not have picked, it is not. The calculator above does that comparison with the figures from a list. The amounts loaded there are an example, not prices this site has read.</p>

<h2>Cash advance items</h2>
<p>Some charges are paid by the funeral home to someone else on your behalf: certified copies of the death certificate, a newspaper notice, flowers, an officiant’s fee, the cemetery’s opening and closing. The Rule calls them cash advance items. The home must tell you, on the price list and the statement, if it adds a service charge to them or keeps a refund or rebate from the supplier. They stay in your bill whether you take a package or not, which is why the calculator adds them to both sides.</p>

<h2>Comparing homes</h2>
<p>Two or three price lists from homes near you show more about your own bill than any average. As a ceiling, the ${h.a('funeral-costs-by-state', 'state table')} gives what death-care businesses took in per death in your state: ${h.m(h.today('US'))} nationally at ${h.month} prices, an average that includes every burial with a plot and a headstone. A quote well above your state’s figure for a simple service is worth questioning. A prepaid contract follows the same Rule for the goods and services it lists; the ${h.a('prepaid-funeral', 'prepaid funeral page')} explains what else to read in one.</p>
<p>The full text of the Rule is on the ${h.src('ftc_rule', 'eCFR, 16 CFR Part 453')}. This page summarizes it in plain words and is not legal advice; state laws can add duties of their own.</p>
`,
});
