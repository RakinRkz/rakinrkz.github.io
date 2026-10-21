import { describe, it, expect } from 'vitest';
import { requireCaseStudyBodies } from '../src/lib/projects';

const p = (id: string, caseStudy: boolean, body?: string) => ({ id, body, data: { caseStudy } });

describe('requireCaseStudyBodies', () => {
  it('returns only the case-study entries', () => {
    expect(requireCaseStudyBodies([p('a', true, '## Problem'), p('b', false)]).map(e => e.id)).toEqual(['a']);
  });
  it('throws, naming the entry, when a case study body is blank', () => {
    expect(() => requireCaseStudyBodies([p('c', true, '  \n')])).toThrow("Case study 'c' has an empty body");
    expect(() => requireCaseStudyBodies([p('d', true)])).toThrow("Case study 'd' has an empty body");
  });
});
