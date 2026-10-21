# rakinrkz.github.io

Portfolio and blog of A. K. M. Rakinuzzaman, live at **https://rakinrkz.github.io**.

A static [Astro](https://astro.build) 7 site in TypeScript. It ships no client JavaScript beyond a
small theme toggle.

## Develop

Requires Node 22.12 or later (24 recommended, see `.nvmrc`).

```sh
npm ci            # install exact locked versions
npm run dev       # http://localhost:4321, with drafts visible
npm run check     # astro check (strict TypeScript)
npm test          # vitest
npm run build     # static site into dist/
npm run preview   # serve dist/ locally
```

## Where content lives

| What | Where |
|---|---|
| Name, headline, links, about | `src/data/profile.ts` |
| Experience and education | `src/data/experience.ts` |
| Skills, certifications and awards | `src/data/skills.ts`, `src/data/awards.ts` |
| Projects (one Markdown file each) | `src/content/projects/*.md` |
| Blog posts | `src/content/blog/*.md` |
| Downloadable CV | `public/cv.pdf` |

A project's Markdown body is its case study. Set `caseStudy: true` to publish it at
`/projects/<file-name>/` and feature it on the home page. A post with `draft: true` shows under
`npm run dev` but is never built.

### Rules the build enforces

- A project marked `private: true` cannot have a `repo` link.
- A project marked `caseStudy: true` must have a body.
- Frontmatter must match the schemas in `src/content/schemas.ts`.

### Writing rule for posts and case studies

Posts and case studies never name the Cefalo client or its products, and never include internal
figures. Describe the system generically ("a multi-tenant hospitality POS/ERP SaaS") and use only
outcome numbers that are already on the CV. The Experience section on the home page is the one place
that names the client.

## Refresh the CV

The PDF is the phone-free build of the master CV in the Career repo. From `Career/`, run this twice:

```sh
pdflatex -output-directory=build -jobname=cv-public "\def\publicbuild{}\input{cv}"
```

Then copy `Career/build/cv-public.pdf` to `public/cv.pdf` and commit.

## Deploy

Push to `main`. `.github/workflows/deploy.yml` type-checks, tests, builds, checks internal links and
deploys to GitHub Pages. Any failing step stops the deploy. The repository's Pages source must be set
to **GitHub Actions**.

The social preview image `public/og-default.png` is rendered from `design/og-default.html` at
1200×630.
