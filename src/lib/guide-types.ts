/**
 * One page = ONE data file in `src/content/pages/<id>.ts`: URL, snippets, H1, standfirst, citable block,
 * FAQ, body, sources, tool.
 */
import type { SourceKey } from './engine/params';
import type { Helpers } from './helpers';

export type Group = 'costs' | 'final' | 'life' | 'tax';
export interface FAQ { q: string; a: string }
/** Tools: `mini:<spec>` (a spec of `lib/mini-specs.ts`) or `funeral` (the full funeral gap calculator). */
export interface ToolDef { kind: string; props?: Record<string, string | number | boolean> }

export interface PageDef {
  id: string;
  group: Group;
  order: number;
  /** Main tool, first screen: the page is a tool page (`data-outil`, 500 words or more). */
  tool?: ToolDef;
  mini?: ToolDef;
  related: string[];
  sources: SourceKey[];
  slug: string;
  nav: string;
  card: string;
  title: string;
  description: string;
  h1: string;
  intro: string;
  /** Citable block, 120 words or more, one paragraph (RECETTE §21). */
  resume: (h: Helpers) => string;
  faqs: (h: Helpers) => FAQ[];
  /** HTML. A second tool can be placed inside with `<!--tool:mini:spec-->` or `<!--tool:mini:spec|{"age":40}-->`. */
  body: (h: Helpers) => string;
}
export const definePage = (g: PageDef): PageDef => g;
