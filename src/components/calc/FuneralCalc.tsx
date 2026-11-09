/**
 * Main tool: what death-care businesses in the chosen state took in per death (Census 2022), carried to
 * today with the BLS funeral price index and to the median age at death (NCHS state life table) at the
 * funeral price trend, less the VA allowance, the Social Security $255, savings and cover held.
 * All arithmetic is `lib/engine/funeral.ts`. Hydration (RECETTE §17.5): first render = props defaults,
 * link parameters applied in an effect.
 * Testeurs naïfs du 2026-11-08 : tant que le lecteur n'a rien modifié (ni ouvert un lien partagé), le
 * résultat porte « Example, not your result yet » (MentionExemple de la trame).
 */
import { useEffect, useMemo, useState } from 'react';
import NumberField from '../ui/NumberField';
import SelectField from '../ui/SelectField';
import Toggle from '../ui/Toggle';
import { funeralGap, funeralTrend, spendToday, STATES, stateName, latestMonth, type Sex, type StateCode, type Veteran } from '../../lib/engine/funeral';
import { P } from '../../lib/engine/params';
import { formatMoney, formatPercent, formatNumber } from '../../lib/format';
import { readParams, num, str, updateURL } from '../../lib/url-state';
import MentionExemple from './MentionExemple';
import { resumeRepli } from '../../lib/libelles-trame';

interface Props { state?: StateCode; age?: number; sex?: Sex; veteran?: Veteran; ssa?: boolean; saved?: number; cover?: number; methodHref: string; idPrefix?: string }
const m = (n: number) => formatMoney(Math.round(n), 0);
const STATE_OPTS = STATES.map((s) => ({ value: s, label: stateName(s) }));
const VET = [
  { value: 'none', label: 'Not a veteran, or no VA allowance' },
  { value: 'nonService', label: 'Veteran, non-service-connected allowance' },
  { value: 'service', label: 'Veteran, service-connected death' },
];
const SEX = [{ value: 'm', label: 'Male' }, { value: 'f', label: 'Female' }];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const monthLabel = (ym: string) => `${MONTHS[Number(ym.slice(5)) - 1]} ${ym.slice(0, 4)}`;

export default function FuneralCalc(p: Props) {
  const d = { state: 'TX' as StateCode, age: 65, sex: 'f' as Sex, veteran: 'none' as Veteran, ssa: true, saved: 3000, cover: 0, ...p };
  const defTrend = Math.round(funeralTrend() * 1000) / 10;
  const [state, setState] = useState<StateCode>(d.state);
  const [age, setAge] = useState(d.age);
  const [sex, setSex] = useState<Sex>(d.sex);
  const [veteran, setVeteran] = useState<Veteran>(d.veteran);
  const [ssa, setSsa] = useState(d.ssa);
  const [saved, setSaved] = useState(d.saved);
  const [cover, setCover] = useState(d.cover);
  const [plan, setPlan] = useState(0);
  const [trend, setTrend] = useState(defTrend);
  const [copied, setCopied] = useState(false);
  // Champs modifiés par le lecteur : `mark` enveloppe chaque setter du formulaire.
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const mark = <T,>(k: string, f: (x: T) => void) => (x: T) => { f(x); setTouched((o) => (o[k] ? o : { ...o, [k]: true })); };

  useEffect(() => {
    const u = readParams(window.location.search);
    if (!u.toString()) return;
    setTouched({ lien: true });
    const s = str(u, 'st', d.state); if ((STATES as string[]).includes(s)) setState(s as StateCode);
    setAge(num(u, 'a', d.age)); const x = str(u, 's', d.sex); if (x === 'm' || x === 'f') setSex(x);
    const v = str(u, 'v', d.veteran); if (VET.some((o) => o.value === v)) setVeteran(v as Veteran);
    setSsa(str(u, 'ss', d.ssa ? '1' : '0') === '1'); setSaved(num(u, 'sv', d.saved)); setCover(num(u, 'c', d.cover));
    setPlan(num(u, 'q', 0)); setTrend(num(u, 't', defTrend));
  }, []);
  useEffect(() => {
    updateURL({ st: state, a: age, s: sex, v: veteran, ss: ssa ? 1 : 0, sv: saved, c: cover || undefined, q: plan || undefined, t: trend !== defTrend ? trend : undefined });
  }, [state, age, sex, veteran, ssa, saved, cover, plan, trend]);

  const r = useMemo(() => funeralGap({ state, age, sex, veteran, ssa, saved, cover, plan, trend: trend / 100 }), [state, age, sex, veteran, ssa, saved, cover, plan, trend]);
  const st = spendToday(state);
  const share = () => { try { navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* clipboard refused */ } };
  const id = (x: string) => `${p.idPrefix ?? 'fc'}-${x}`;
  const row = (label: string, x: string, strong = false) => (
    <tr key={label} className={strong ? 'total' : ''}><td className="pr-2 text-navy-700">{label}</td><td className="tabular-nums text-right text-navy-900">{x}</td></tr>
  );
  const atAge = Math.round(r.median);

  return (
    <div data-chrome className="rechner border border-navy-300 bg-white p-4 sm:p-5">
      <div className="grid gap-6 lg:grid-cols-[1fr_minmax(0,26rem)]">
        <form className="grid content-start gap-4" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 sm:gap-y-0">
            <SelectField id={id('state')} label="State" value={state} onChange={mark('state', (v: string) => setState(v as StateCode))} options={STATE_OPTS} help="Where the funeral would take place" />
            <NumberField id={id('age')} label="Age of the person" value={age} onChange={mark('age', setAge)} unit="yrs" min={18} max={100} help="Sets the likely age at death" />
          </div>
          <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 sm:gap-y-0">
            <Toggle id={id('sex')} label="Sex (life table)" value={sex} onChange={mark('sex', (v: string) => setSex(v as Sex))} options={SEX} />
            <Toggle id={id('ssa')} label="Spouse or child for the $255" value={ssa ? '1' : '0'} onChange={mark('ssa', (v: string) => setSsa(v === '1'))} options={[{ value: '1', label: 'Yes' }, { value: '0', label: 'No' }]} />
          </div>
          <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 sm:gap-y-0">
            <NumberField id={id('saved')} label="Money set aside for it" value={saved} onChange={mark('saved', setSaved)} unit="$" max={10_000_000} help="Savings, a payable-on-death account" />
            <NumberField id={id('cover')} label="Life cover already held" value={cover} onChange={mark('cover', setCover)} unit="$" max={50_000_000} help="Any policy the family could use" />
          </div>
          <SelectField id={id('veteran')} label="Veterans Affairs burial allowance" value={veteran} onChange={mark('veteran', (v: string) => setVeteran(v as Veteran))} options={VET} />
          <details className="border-t border-navy-200 pt-3">
            <summary className="cursor-pointer text-sm font-semibold text-navy-800">More: your own price list total, funeral price trend
              <span data-actuellement className="mt-0.5 block text-xs font-normal text-navy-600">{resumeRepli('en', [{ label: 'Price list total', valeur: plan > 0 ? m(plan) : 'none, state figure used' }, { label: 'Prices rise', valeur: `${formatNumber(trend, 1)}% a year` }])}</span></summary>
            <div className="mt-3 grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 sm:gap-y-0">
              <NumberField id={id('plan')} label="A funeral home’s total, if you have one" value={plan} onChange={mark('plan', setPlan)} unit="$" max={1_000_000} help="0 uses the state figure" />
              <NumberField id={id('trend')} label="Funeral prices rise each year" value={trend} onChange={mark('trend', setTrend)} unit="%" max={20} decimals={1} help={`BLS funeral index, ${P.cpi.trendFrom} to ${P.cpi.trendTo}`} />
            </div>
          </details>
        </form>
        <div data-resultat aria-live="polite" className="self-start border-l-4 border-accent-500 bg-accent-50 p-4">
          <MentionExemple lang="en" touched={touched} />
          <p className="text-sm font-medium text-navy-700">Still to cover at age {atAge}</p>
          <p className="tabular-nums mt-1 text-4xl font-bold text-navy-900">{m(r.gapFuture)}</p>
          <p className="mt-1 text-sm text-navy-800">Half the people of this age and sex in {stateName(state)} live past <strong className="tabular-nums">{formatNumber(r.median, 1)}</strong>. If it happened today, <strong className="tabular-nums">{m(r.gapToday)}</strong> would be left to pay.</p>
          <table className="ledger mt-3 w-full text-sm"><tbody>
            {row(plan > 0 ? 'Your price list total, today' : `Spent per death in ${stateName(state)}, today`, m(r.today))}
            {row(`Same at age ${atAge}, ${formatPercent(trend / 100, 1)} a year`, m(r.future), true)}
            {row('VA burial and plot allowance', r.va > 0 ? `−\u00a0${m(r.va)}` : 'none')}
            {row('Social Security lump sum', r.ssa > 0 ? `−\u00a0${m(r.ssa)}` : 'none')}
            {row('Set aside and cover held', `−\u00a0${m(saved + cover)}`)}
            {row('Final expense gap', m(r.gapFuture), true)}
          </tbody></table>
          <p className="mt-2 text-xs text-navy-600">{plan > 0 ? 'Uses the total you typed. ' : `What funeral homes, cemeteries and crematories in ${stateName(state)} took in per death in 2022 (Census), brought to ${monthLabel(latestMonth)} with the BLS funeral index (× ${formatNumber(st.factor, 3)}). It counts every kind of funeral, burial and cremation alike, plus pre-need sales: an average, not a quote. `}Median age at death from the NCHS 2022 life table of the state. Estimate only, not advice.</p>
        </div>
      </div>
      <div aria-hidden="true" className="fixed inset-x-0 bottom-0 z-40 border-t border-navy-300 bg-white/95 px-4 py-2 text-sm text-navy-900 shadow-[0_-2px_6px_rgba(0,0,0,0.06)] lg:hidden print:hidden">Gap at {atAge}: <strong className="tabular-nums">{m(r.gapFuture)}</strong> · today: <strong className="tabular-nums">{m(r.gapToday)}</strong></div>
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
        <button type="button" onClick={share} className="rounded border border-navy-300 px-3 py-1.5 font-medium text-navy-800 hover:bg-navy-50">{copied ? 'Link copied' : 'Copy a link to these figures'}</button>
        <button type="button" onClick={() => window.print()} className="rounded border border-navy-300 px-3 py-1.5 font-medium text-navy-800 hover:bg-navy-50">Print</button>
        <a href={p.methodHref} className="text-accent-700 underline underline-offset-2">How this is calculated</a>
        <span className="text-xs text-navy-600">Census, BLS, NCHS and VA figures. No quote form, no phone number.</span>
      </div>
    </div>
  );
}
