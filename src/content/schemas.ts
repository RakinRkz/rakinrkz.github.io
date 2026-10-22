import { z } from 'astro/zod';

export const projectSchema = z
  .object({
    title: z.string(),
    summary: z.string(),
    stack: z.array(z.string()).min(1),
    repo: z.url().optional(),
    private: z.boolean().default(false),
    caseStudy: z.boolean().default(false),
    order: z.number().int(),
    /** The "at a glance" strip at the top of a case study. */
    glance: z
      .object({
        role: z.string(),
        since: z.string(),
        runsOn: z.string(),
      })
      .optional(),
  })
  .refine((p) => !(p.private && p.repo), {
    message: 'A private project must not link a repository',
    path: ['repo'],
  });

export const blogSchema = z.object({
  title: z.string(),
  description: z.string(),
  pubDate: z.coerce.date(),
  draft: z.boolean().default(false),
});
