/**
 * Mini-calculator (RECETTE §9.3): a few fields, the figure of the page's subject in large type, two to
 * four lines of detail and a link to the full calculator. The arithmetic is the engine's, through
 * `lib/mini-specs.ts`. First render = build defaults (§17.5). `primary`: main tool of a tool page
 * (result marked `data-resultat`, first screen); otherwise the form is `data-simulateur-secondaire`.
 *
 * Testeurs naïfs du 2026-11-08 (RECETTE §15.8), repris de la trame :
 * - le composant retient les champs modifiés par le lecteur (`touched`, passé à `spec.run`) ; tant
 *   qu'il n'en a modifié aucun, le résultat porte « Example, not your result yet » (MentionExemple) ;
 *   `saisiParLeLecteur` : valeurs venues d'un lien partagé, donc déjà les siennes, sans mention ;
 * - `title` : deux calculateurs empilés sur une page reçoivent chacun leur titre ;
 * - champs `avance` : rangés dans un repli dont le titre montre la valeur actuelle de chacun (« Now: … »).
 */
import { useEffect, useMemo, useState } from 'react';
import { ETAT_MEMO } from '../../lib/fc-defaults';
import NumberField from '../ui/NumberField';
import Toggle from '../ui/Toggle';
import SelectField from '../ui/SelectField';
import { getSpec } from '../../lib/mini-specs';
import MentionExemple from './MentionExemple';
import { libellesTrame, resumeRepli } from '../../lib/libelles-trame';
import { formatNumber } from '../../lib/format';
import type { MiniInput } from '../../lib/mini-types';

interface Props { kind: string; lang?: string; href?: string; defaults?: Record<string, number>; primary?: boolean; idPrefix?: string; title?: string; saisiParLeLecteur?: boolean }

export default function MiniSim({ kind, lang = 'en', href, defaults = {}, primary = false, idPrefix = 'm', title, saisiParLeLecteur = false }: Props) {
  const spec = getSpec(kind);
  const [v, setV] = useState<Record<string, number>>(() => Object.fromEntries(spec.inputs.map((i) => [i.id, defaults[i.id] ?? i.def])));
  const [touched, setTouched] = useState<Record<string, boolean>>(() => (saisiParLeLecteur ? Object.fromEntries(spec.inputs.map((i) => [i.id, true])) : {}));
  const out = useMemo(() => spec.run(v, touched), [v, spec, touched]);
  const set = (id: string) => (x: number) => { setV((o) => ({ ...o, [id]: x })); setTouched((o) => (o[id] ? o : { ...o, [id]: true }));
    // Un État choisi ici est repris sur les autres pages du site (après le premier rendu, RECETTE §17.5).
    if (id === 'state') { const nom = spec.inputs.find((i) => i.id === 'state')?.options?.find((o) => o.value === String(x))?.label; try { if (nom) localStorage.setItem(ETAT_MEMO, nom); } catch { /* storage refused */ } } };
  useEffect(() => {
    const champ = spec.inputs.find((i) => i.id === 'state' && i.options); if (!champ) return;
    try { const nom = localStorage.getItem(ETAT_MEMO); const o = champ.options!.find((x) => x.label === nom); if (o) setV((a) => ({ ...a, state: Number(o.value) })); } catch { /* storage refused */ }
  }, []);
  const fid = (id: string) => `${idPrefix}-${kind}-${id}`;
  const champ = (i: MiniInput) => (i.options && i.vue === 'boutons'
    ? <div key={i.id}><div className="grid"><Toggle id={fid(i.id)} label={i.label} value={String(v[i.id])} onChange={(x) => set(i.id)(Number(x))} options={i.options} /></div>{i.help && <p id={`${fid(i.id)}-help`} className="mt-1 text-xs text-navy-500">{i.help}</p>}</div>
    : i.options
    ? <SelectField key={i.id} id={fid(i.id)} label={i.label} value={String(v[i.id])} onChange={(x) => set(i.id)(Number(x))} options={i.options} help={i.help} />
    : <NumberField key={i.id} id={fid(i.id)} label={i.label} value={v[i.id]} onChange={set(i.id)} unit={i.unit} max={i.max} decimals={i.decimals} help={i.help} />);
  const avances = spec.inputs.filter((i) => i.avance);
  return (
    <div data-chrome data-mini={kind} className={`not-prose rechner ${primary ? '' : 'my-8'} border border-navy-300 bg-white p-4 sm:p-5`}>
      <p className="font-serif text-lg font-semibold text-navy-900">{title ?? spec.title}</p>
      <div className="mt-3 grid gap-5 sm:grid-cols-2">
        <form className="grid content-start gap-3" onSubmit={(e) => e.preventDefault()} {...(primary ? {} : { 'data-simulateur-secondaire': '' })}>
          {spec.inputs.filter((i) => !i.avance).map(champ)}
          {avances.length > 0 && (
            <details data-repli className="border border-navy-200 px-3 py-2">
              <summary className="cursor-pointer text-sm font-medium text-navy-700">{libellesTrame(lang).plusDeReglages}
                <span data-actuellement className="mt-0.5 block text-xs font-normal text-navy-600">{resumeRepli(lang, avances.map((i) => ({ label: i.label, valeur: valeurAffichee(i, v[i.id]) })))}</span></summary>
              <div className="mt-3 grid content-start gap-3">{avances.map(champ)}</div>
            </details>
          )}
        </form>
        <div aria-live="polite" {...(primary ? { 'data-resultat': '' } : {})} className="self-start border-l-4 border-accent-500 bg-accent-50 p-4">
          {!spec.sansMention && <MentionExemple lang={lang} touched={touched} suppose={spec.exemple?.(v)} />}
          <p className="text-sm font-semibold text-navy-800">{out.head[0]}</p>
          <p className="tabular-nums mt-1 text-4xl font-bold text-navy-900">{out.head[1]}</p>
          {out.sous && <p data-fixe className="mt-1 text-sm text-navy-800">{out.sous}</p>}
          <table className="ledger mt-3 w-full text-sm"><tbody>
            {out.rows.map(([l, x]) => <tr key={l}><td className="pr-3 text-navy-700">{l}</td><td className="tabular-nums text-right text-navy-900">{x}</td></tr>)}
          </tbody></table>
          {out.note && <p className="mt-2 text-xs text-navy-600">{out.note}</p>}
        </div>
      </div>
      {href && spec.cta && <a href={href} className="mt-4 inline-block text-sm font-medium text-accent-700 underline underline-offset-2 hover:text-accent-900">{spec.cta}</a>}
    </div>
  );
}

/** Valeur d'un champ telle que le lecteur la lit : libellé de l'option choisie, ou nombre et unité. */
export function valeurAffichee(i: MiniInput, x: number): string {
  if (i.options) return i.options.find((o) => o.value === String(x))?.label ?? String(x);
  return `${formatNumber(x, Number.isInteger(x) ? 0 : (i.decimals ?? 0))}${i.unit ? `\u00a0${i.unit}` : ''}`;
}
