/** Defaults of the main calculator, shared with the text of the home page (one case, one set of figures,
 *  RECETTE §17.4 point 6) and with every page that has a state field: Texas everywhere. */
import type { Sex, StateCode, Veteran } from './engine/funeral';
export type Mode = 'now' | 'plan';
export const FC_DEFAULTS = { mode: 'now' as Mode, state: 'TX' as StateCode, age: 65, sex: 'f' as Sex, veteran: 'none' as Veteran, ssa: false, saved: 0, cover: 0 };
/** localStorage key: the state chosen on one page is offered on the next (read after the first render). */
export const ETAT_MEMO = 'fcbs-etat';
