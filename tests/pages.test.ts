/**
 * Editorial rules checked on every page file before the build (RECETTE §6, §7, §11, §21):
 * snippet lengths, key term first, citable block ≥ 120 words, FAQ 40-90 words and unique across the
 * site, no em dash, no statutory figure typed, internal links to existing pages only, body length.
 */
import { describe, it, expect } from 'vitest';
import { PAGES } from '../src/lib/guides';
import { helpers } from '../src/lib/helpers';
import { getSpec } from '../src/lib/mini-specs';
import { readFileSync } from 'node:fs';
// Figures of the parameter file never typed in a page (RECETTE §17.4): they come from h.P or h.E.
const TYPED = /1,032|1,002|\$2,000\b|\$1,500\b|\$255\b|\b255 dollars|15,000,000|\$15 million|19,000|\$50,000|\$420\b|\b13\.80?\b|\b21\.50?\b|\b38\.50?\b|\b2\.06\b|\b1\.27\b|October 1, 2026|345,800/;

const h = helpers(true);
const text = (html: string) => html.replace(/<table[\s\S]*?<\/table>/g, ' ').replace(/<!--[\s\S]*?-->/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/g, ' ');
const words = (s: string) => text(s).split(/\s+/).filter((w) => /[A-Za-z0-9$]/.test(w)).length;
const BAD_START = /^(US|U\.S\.|United States|American|America|Calculator|Calculate|How|What|Why|When|Which|Who|Is|Are|Do|Does|Can|FAQ|About)\b/;
const allQ = new Map<string, string>();
// Medical vocabulary: the site talks about contracts and money, never about illnesses (brief of 2026-11-07).
const MEDICAL = /\b(cancer|stroke|heart attack|tumou?r|dementia|diabetes|multiple sclerosis|parkinson|alzheimer|chemotherapy|symptom|diagnos(is|ed|e)|disease)\b/i;

describe.each(PAGES.map((p) => [p.id, p] as const))('%s', (_id, p) => {
  it('snippets', () => {
    expect(p.title.length, `title ${p.title.length}: ${p.title}`).toBeGreaterThanOrEqual(50);
    expect(p.title.length, `title ${p.title.length}: ${p.title}`).toBeLessThanOrEqual(60);
    expect(p.description.length, `description ${p.description.length}: ${p.description}`).toBeGreaterThanOrEqual(150);
    expect(p.description.length, `description ${p.description.length}: ${p.description}`).toBeLessThanOrEqual(160);
    expect(BAD_START.test(p.title), `title starts with a banned word: ${p.title}`).toBe(false);
    expect(/[—]|\s[:;!?]/.test(p.title + p.description), 'em dash or space before punctuation').toBe(false);
    expect(p.slug).toMatch(/^[a-z0-9-]+$/);
  });
  it('citable block of 120 words or more', () => {
    expect(words(p.resume(h))).toBeGreaterThanOrEqual(120);
  });
  it('FAQ: 3 to 8 questions of 40 to 90 words, never reused', () => {
    const f = p.faqs(h);
    expect(f.length).toBeGreaterThanOrEqual(3);
    expect(f.length).toBeLessThanOrEqual(8);
    for (const x of f) {
      const n = words(x.a);
      expect(n, `${x.q} (${n} words)`).toBeGreaterThanOrEqual(40);
      expect(n, `${x.q} (${n} words)`).toBeLessThanOrEqual(90);
      const k = x.q.toLowerCase().replace(/[^a-z0-9 ]/g, '');
      expect(allQ.has(k) && allQ.get(k) !== p.id, `question reused from ${allQ.get(k)}: ${x.q}`).toBe(false);
      allQ.set(k, p.id);
    }
  });
  it('no statutory figure typed in the page source', () => {
    const src = readFileSync(`src/content/pages/${p.id}.ts`, 'utf8').split('\n').filter((l) => !/^\s*(title|description|h1|nav|card|intro):/.test(l)).join('\n');
    const hit = src.match(TYPED);
    expect(hit, `typed figure “${hit?.[0]}”: use h.P or h.E`).toBeNull();
  });
  it('body: length, links, no em dash, no medical content, tools exist', () => {
    const b = p.body(h);
    const all = p.intro + p.resume(h) + b + p.faqs(h).map((f) => f.q + f.a).join(' ');
    expect(/—|&mdash;/.test(all), 'em dash').toBe(false);
    const med = all.match(MEDICAL);
    expect(med, `medical word “${med?.[0]}”`).toBeNull();
    const n = words(p.resume(h)) + words(b);
    const min = p.tool ? 520 : 1200;
    expect(n, `${n} words (min ${min})`).toBeGreaterThanOrEqual(min);
    for (const t of [p.tool, p.mini].filter(Boolean)) if (t!.kind.startsWith('mini:')) expect(() => getSpec(t!.kind.slice(5))).not.toThrow();
    for (const m of b.matchAll(/<!--tool:mini:([a-z0-9-]+)/g)) expect(() => getSpec(m[1])).not.toThrow();
    expect(p.tool || p.mini, 'every page carries a calculator').toBeTruthy();
    expect(p.sources.length).toBeGreaterThanOrEqual(2);
  });
});
