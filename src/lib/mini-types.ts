/** Mini-calculator types (RECETTE §9.3). Each spec lives in `lib/mini-specs.ts` and calls the tested engine. */
export interface MiniInput { id: string; label: string; def: number; unit?: string; max?: number; decimals?: number; help?: string; options?: Array<{ value: string; label: string }>;
  /** Champ facultatif rangé dans le repli « Plus de détails » ; sa valeur actuelle reste lisible dans le titre du repli. */
  avance?: boolean }
export interface MiniOut { head: [string, string]; rows: Array<[string, string]>; note?: string }
export interface MiniSpec {
  title: string; cta: string; ctaPage?: string; inputs: MiniInput[];
  /** `touched` : les champs que le lecteur a modifiés (testeurs naïfs du 2026-11-08). Tant qu'il est vide,
   *  le composant pose la mention « Exemple, pas encore votre résultat » ; une spec peut aussi s'en servir
   *  pour taire un verdict (« vous êtes éligible ») tant que les chiffres sont ceux de l'exemple. */
  run: (v: Record<string, number>, touched?: Record<string, boolean>) => MiniOut;
}
