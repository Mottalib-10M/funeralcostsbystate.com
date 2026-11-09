/**
 * Mention posée sur un résultat calculé avec les valeurs d'exemple (testeurs naïfs du 2026-11-08,
 * RECETTE §15.8) : tant que le lecteur n'a modifié aucun champ, le résultat n'est pas le sien.
 * Elle disparaît dès la première saisie. À poser dans le bloc du résultat de tout calculateur
 * pré-rempli : `<MentionExemple lang={lang} touched={touched} />`.
 *
 * `suppose` (testeurs du 2026-11-09, tour final) : ce que l'exemple suppose, en mots simples (« a death in
 * Texas, no veteran, $3,000 of savings »). Une mention vague ne disait pas quel chiffre changer.
 */
import { libellesTrame, resultatExemple } from '../../lib/libelles-trame';

export default function MentionExemple({ lang, touched, suppose, className = '' }: { lang?: string; touched?: Record<string, boolean>; suppose?: string; className?: string }) {
  if (!resultatExemple(touched)) return null;
  const l = libellesTrame(lang);
  if (suppose) return (
    <p data-exemple className={`mb-2 rounded-md border border-amber-300 bg-amber-50 px-2 py-1 text-xs leading-snug text-amber-900 ${className}`}>
      <strong className="font-semibold">{l.exemple}:</strong> {suppose}. Change any answer to see yours.
    </p>
  );
  return (
    <p data-exemple className={`mb-2 inline-flex flex-wrap items-baseline gap-x-1 rounded-md border border-amber-300 bg-amber-50 px-2 py-0.5 text-xs text-amber-900 ${className}`}>
      <strong className="font-semibold">{l.exemple}</strong><span>· {l.exempleAide}</span>
    </p>
  );
}
