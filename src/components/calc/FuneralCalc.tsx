/**
 * Main tool, in two situations (testeurs naïfs du 2026-11-09 : « mon père est mort, pourquoi on me demande
 * à quel âge il va probablement mourir ? ») :
 *  - `now` (default) : a death has just happened. The first figure is what a death costs in the state today
 *    (Census 2022 revenue of death-care businesses per death, carried to today with the BLS funeral index),
 *    then what is left to pay after the VA allowance, the Social Security $255 and the money available.
 *    No age, no sex, no projection.
 *  - `plan` : planning ahead. Same figure carried to the median age at death (NCHS state life table) at the
 *    funeral price trend, then the same deductions.
 * All arithmetic is `lib/engine/funeral.ts`. The trend field shows 2.6 % but, untouched, the engine's exact
 * trend is used (`trendFromField`), so the page text and the calculator give the same dollar.
 * Hydration (RECETTE §17.5): first render = props defaults; link parameters, `#plan` and the state chosen on
 * another page of the site (localStorage `fcbs-etat`) are applied in an effect.
 * No bar fixed at the bottom of the phone any more: « Gap at 85 » covered the form and the menu, and three
 * testers out of three did not understand it. The state's cost now shows right under the state field.
 */
import { useEffect, useMemo, useState } from 'react';
import NumberField from '../ui/NumberField';
import SelectField from '../ui/SelectField';
import Toggle from '../ui/Toggle';
import { funeralGap, spendToday, STATES, stateName, latestMonth, trendField, trendFromField, type Sex, type StateCode, type Veteran } from '../../lib/engine/funeral';
import { P } from '../../lib/engine/params';
import { formatMoney, formatPercent, formatNumber } from '../../lib/format';
import { readParams, num, str, updateURL } from '../../lib/url-state';
import MentionExemple from './MentionExemple';
import { resumeRepli } from '../../lib/libelles-trame';
import { FC_DEFAULTS, ETAT_MEMO, type Mode } from '../../lib/fc-defaults';

interface Props { mode?: Mode; state?: StateCode; age?: number; sex?: Sex; veteran?: Veteran; ssa?: boolean; saved?: number; cover?: number; methodHref: string; vaHref?: string; idPrefix?: string }
const m = (n: number) => formatMoney(Math.round(n), 0);
const STATE_OPTS = STATES.map((s) => ({ value: s, label: stateName(s) }));
const VET = [
  { value: 'none', label: 'No, or no VA condition is met' },
  { value: 'nonService', label: 'Veteran on a VA pension or compensation, or in VA care' },
  { value: 'service', label: 'Veteran whose death was caused by military service' },
];
const SEX = [{ value: 'm', label: 'Male' }, { value: 'f', label: 'Female' }];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const monthLabel = (ym: string) => `${MONTHS[Number(ym.slice(5)) - 1]} ${ym.slice(0, 4)}`;

export default function FuneralCalc(p: Props) {
  const d = { ...FC_DEFAULTS, ...p };
  const defTrend = trendField();
  const [mode, setMode] = useState<Mode>(d.mode);
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
  const chooseState = (v: string) => { setState(v as StateCode); try { localStorage.setItem(ETAT_MEMO, stateName(v as StateCode)); } catch { /* storage refused */ } };

  useEffect(() => {
    // `#plan` (lien « Planning ahead ») et `#start` (lien « Someone has died ») choisissent la situation, aussi sur la même page.
    const auHash = () => { if (window.location.hash === '#plan') setMode('plan'); else if (window.location.hash === '#start') setMode('now'); };
    window.addEventListener('hashchange', auHash);
    return () => window.removeEventListener('hashchange', auHash);
  }, []);
  useEffect(() => {
    if (window.location.hash === '#plan') setMode('plan');
    const u = readParams(window.location.search);
    if (!u.toString()) {
      try { const n = localStorage.getItem(ETAT_MEMO); const s = STATES.find((x) => stateName(x) === n); if (s) setState(s); } catch { /* storage refused */ }
      return;
    }
    setTouched({ lien: true });
    if (str(u, 'm', 'now') === 'plan') setMode('plan');
    const s = str(u, 'st', d.state); if ((STATES as string[]).includes(s)) setState(s as StateCode);
    setAge(num(u, 'a', d.age)); const x = str(u, 's', d.sex); if (x === 'm' || x === 'f') setSex(x);
    const v = str(u, 'v', d.veteran); if (VET.some((o) => o.value === v)) setVeteran(v as Veteran);
    setSsa(str(u, 'ss', d.ssa ? '1' : '0') === '1'); setSaved(num(u, 'sv', d.saved)); setCover(num(u, 'c', d.cover));
    setPlan(num(u, 'q', 0)); setTrend(num(u, 't', defTrend));
  }, []);
  useEffect(() => {
    updateURL({ m: mode === 'plan' ? 'plan' : undefined, st: state, a: mode === 'plan' ? age : undefined, s: mode === 'plan' ? sex : undefined, v: veteran, ss: ssa ? 1 : 0, sv: saved, c: cover || undefined, q: plan || undefined, t: mode === 'plan' && trend !== defTrend ? trend : undefined });
  }, [mode, state, age, sex, veteran, ssa, saved, cover, plan, trend]);

  const r = useMemo(() => funeralGap({ state, age, sex, veteran, ssa, saved, cover, plan, trend: trendFromField(trend) }), [state, age, sex, veteran, ssa, saved, cover, plan, trend]);
  const st = spendToday(state);
  const share = () => { try { navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* clipboard refused */ } };
  const id = (x: string) => `${p.idPrefix ?? 'fc'}-${x}`;
  const row = (label: string, x: string, strong = false) => (
    <tr key={label} className={strong ? 'total' : ''}><td className="pr-2 text-navy-700">{label}</td><td className="tabular-nums text-right text-navy-900">{x}</td></tr>
  );
  const atAge = Math.round(r.median);
  const now = mode === 'now';
  const where = stateName(state);
  const costLabel = plan > 0 ? 'The funeral home’s total you typed' : `Spent per death in ${where}, today`;
  const modeBtn = (v: Mode, label: string, sub: string) => (
    <button type="button" aria-pressed={mode === v} onClick={() => setMode(v)}
      className={`min-h-12 rounded-lg border px-3 py-2 text-left text-sm leading-snug transition-colors ${mode === v ? 'border-accent-600 bg-accent-600 text-white' : 'border-navy-300 bg-white text-navy-800 hover:bg-navy-50'}`}>
      <span className="block font-semibold">{label}</span><span className={`block text-xs ${mode === v ? 'text-white' : 'text-navy-600'}`}>{sub}</span>
    </button>
  );

  return (
    <div data-chrome id="start" className="rechner relative scroll-mt-20 border border-navy-300 bg-white p-4 sm:p-5">
      <div className="grid gap-6 lg:grid-cols-[1fr_minmax(0,26rem)]">
        <form className="grid content-start gap-4" onSubmit={(e) => e.preventDefault()}>
          <span id="plan" className="sr-only absolute -top-20" aria-hidden="true"></span>
          <div role="group" aria-label="Your situation" className="grid grid-cols-2 gap-2">
            {modeBtn('now', 'Someone has died', 'What it costs now')}
            {modeBtn('plan', 'Planning ahead', 'What it may cost later')}
          </div>
          <SelectField id={id('state')} label="State" value={state} onChange={mark('state', chooseState)} options={STATE_OPTS} help="Where the funeral takes place" />
          {now && (
            <div data-cout-etat className="border-l-4 border-navy-400 bg-navy-50 px-3 py-2">
              <p className="text-sm text-navy-700">{costLabel}</p>
              <p className="tabular-nums text-3xl font-bold text-navy-900">{m(r.today)}</p>
              <p className="text-xs text-navy-600">{plan > 0 ? 'Your own figure replaces the state average.' : 'Average of all funerals, from a simple cremation to a full burial. Not a quote.'}</p>
            </div>
          )}
          {!now && (
            <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 sm:gap-y-0">
              <NumberField id={id('age')} label="Age today" value={age} onChange={mark('age', setAge)} unit="yrs" min={18} max={100} help="Of the person whose funeral it is" />
              <Toggle id={id('sex')} label="Sex (sets life expectancy)" value={sex} onChange={mark('sex', (v: string) => setSex(v as Sex))} options={SEX} />
            </div>
          )}
          <SelectField id={id('veteran')} label="Was the person a veteran?" value={veteran} onChange={mark('veteran', (v: string) => setVeteran(v as Veteran))} options={VET} help="Other veterans get no burial allowance from the VA" />
          <div>
            <div className="grid"><Toggle id={id('ssa')} label="A surviving husband or wife, or a child under 18?" value={ssa ? '1' : '0'} onChange={mark('ssa', (v: string) => setSsa(v === '1'))} options={[{ value: '0', label: 'No' }, { value: '1', label: 'Yes' }]} /></div>
            <p className="mt-1 text-xs text-navy-500">Only they can claim the {m(P.ssa.lumpSum)} that Social Security pays once</p>
          </div>
          <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 sm:gap-y-0">
            <NumberField id={id('saved')} label={now ? 'Money the family can use' : 'Money set aside for it'} value={saved} onChange={mark('saved', setSaved)} unit="$" max={10_000_000} help="Savings, a bank account that passes to the family" />
            <NumberField id={id('cover')} label="Life insurance that will pay" value={cover} onChange={mark('cover', setCover)} unit="$" max={50_000_000} help="0 if there is no policy" />
          </div>
          {now && <NumberField id={id('plan')} label="Have a funeral home’s price? Its total" value={plan} onChange={mark('plan', setPlan)} unit="$" max={1_000_000} help={`0 uses the ${where} average`} />}
          {!now && (
            <details className="border-t border-navy-200 pt-3">
              <summary className="cursor-pointer text-sm font-semibold text-navy-800">Have a funeral home’s price? Prices rising faster?
                <span data-actuellement className="mt-0.5 block text-xs font-normal text-navy-600">{resumeRepli('en', [{ label: 'Price used', valeur: plan > 0 ? m(plan) : `${where} average` }, { label: 'Prices rise', valeur: `${formatNumber(trend, 1)}% a year` }])}</span></summary>
              <div className="mt-3 grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 sm:gap-y-0">
                <NumberField id={id('plan')} label="A funeral home’s total today" value={plan} onChange={mark('plan', setPlan)} unit="$" max={1_000_000} help={`0 uses the ${where} average`} />
                <NumberField id={id('trend')} label="Funeral prices rise each year" value={trend} onChange={mark('trend', setTrend)} unit="%" max={20} decimals={1} help={`Funeral price index, ${P.cpi.trendFrom} to ${P.cpi.trendTo}`} />
              </div>
            </details>
          )}
        </form>
        <div data-resultat aria-live="polite" className="self-start border-l-4 border-accent-500 bg-accent-50 p-4">
          <MentionExemple lang="en" touched={touched} />
          {now ? (<>
            <p className="text-sm font-medium text-navy-700">Left to pay today, after what is paid</p>
            <p className="tabular-nums mt-1 text-4xl font-bold text-navy-900">{m(r.gapToday)}</p>
            <p className="mt-1 text-sm text-navy-800">{m(r.today)} {plan > 0 ? 'quoted' : `spent per death in ${where}`}, minus {m(r.paid)} from the VA, Social Security, savings and insurance.</p>
          </>) : (<>
            <p className="text-sm font-medium text-navy-700">Left to pay at age {atAge}, the age half of people reach</p>
            <p className="tabular-nums mt-1 text-4xl font-bold text-navy-900">{m(r.gapFuture)}</p>
            <p className="mt-1 text-sm text-navy-800">If it happened today: <strong className="tabular-nums">{m(r.gapToday)}</strong> left to pay. Half the people of this age and sex in {where} live past <strong className="tabular-nums">{formatNumber(r.median, 1)}</strong>.</p>
          </>)}
          <table className="ledger mt-3 w-full text-sm"><tbody>
            {row(costLabel, m(r.today), now)}
            {!now && row(`Same at age ${atAge}, prices up ${formatPercent(trend / 100, 1)} a year`, m(r.future), true)}
            {row('VA burial and plot allowance', r.va > 0 ? `− ${m(r.va)}` : 'none')}
            {row('Social Security lump sum', r.ssa > 0 ? `− ${m(r.ssa)}` : 'none')}
            {row('Money and life insurance', `− ${m(saved + cover)}`)}
            {row(now ? 'Left to pay today' : `Left to pay at ${atAge}`, m(now ? r.gapToday : r.gapFuture), true)}
          </tbody></table>
          <p className="mt-2 text-xs text-navy-600">{plan > 0 ? 'Uses the total you typed. ' : `What funeral homes, cemeteries and crematories in ${where} took in per death in 2022 (Census Bureau), brought to ${monthLabel(latestMonth)} prices with the federal funeral price index (× ${formatNumber(st.factor, 3)}). An average of every kind of funeral, not a quote. `}{now ? '' : 'Age at death from the 2022 life table of the state (National Center for Health Statistics). '}{p.vaHref ? <>VA allowance only if a <a href={p.vaHref} className="underline">VA condition</a> is met. </> : ''}Estimate only, not advice.</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
        <button type="button" onClick={share} className="rounded border border-navy-300 px-3 py-1.5 font-medium text-navy-800 hover:bg-navy-50">{copied ? 'Link copied' : 'Copy a link to these figures'}</button>
        <button type="button" onClick={() => window.print()} className="rounded border border-navy-300 px-3 py-1.5 font-medium text-navy-800 hover:bg-navy-50">Print</button>
        <a href={p.methodHref} className="text-accent-700 underline underline-offset-2">How this is calculated</a>
        <span className="text-xs text-navy-600">No quote form, no phone number. Nothing you type is sent.</span>
      </div>
    </div>
  );
}
