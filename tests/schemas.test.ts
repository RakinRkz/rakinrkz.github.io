import { describe, it, expect } from 'vitest';
import { projectSchema, blogSchema } from '../src/content/schemas';

const base = { title: 'Hearth AI', summary: 's', stack: ['Python'], order: 2 };

describe('projectSchema', () => {
  it('applies defaults', () => {
    expect(projectSchema.parse(base)).toMatchObject({ private: false, caseStudy: false });
  });
  it('rejects a private project with a repo link', () => {
    const r = projectSchema.safeParse({ ...base, private: true, repo: 'https://github.com/RakinRkz/x' });
    expect(r.success).toBe(false);
    expect(r.error!.issues[0]).toMatchObject({ path: ['repo'], message: 'A private project must not link a repository' });
  });
  it('accepts a private project without a repo', () => {
    expect(projectSchema.safeParse({ ...base, private: true }).success).toBe(true);
  });
  it('rejects a malformed repo URL', () => {
    expect(projectSchema.safeParse({ ...base, repo: 'not-a-url' }).success).toBe(false);
  });
  it('rejects an empty stack and a fractional order', () => {
    expect(projectSchema.safeParse({ ...base, stack: [] }).success).toBe(false);
    expect(projectSchema.safeParse({ ...base, order: 1.5 }).success).toBe(false);
  });
});

describe('blogSchema', () => {
  it('coerces pubDate and defaults draft to false', () => {
    const d = blogSchema.parse({ title: 't', description: 'd', pubDate: '2026-10-21' });
    expect(d.pubDate).toBeInstanceOf(Date);
    expect(d.draft).toBe(false);
  });
  it('requires a description', () => {
    expect(blogSchema.safeParse({ title: 't', pubDate: '2026-10-21' }).success).toBe(false);
  });
});
