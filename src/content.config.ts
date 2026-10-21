import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { blogSchema, projectSchema } from './content/schemas';

const projects = defineCollection({
  loader: glob({ base: './src/content/projects', pattern: '**/*.md' }),
  schema: projectSchema,
});

const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/*.md' }),
  schema: blogSchema,
});

export const collections = { projects, blog };
