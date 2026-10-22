import type { ProofStat, Strength } from './types';

// Every number here is on the CV. Nothing names the Cefalo client: the post stays anonymised.

export const hero = {
  statement: 'I build SaaS products end to end, and I find out',
  emphasis: "why they're slow",
  intro:
    'TypeScript/React front ends over C#/.NET and Python services, on AWS. At Cefalo since 2024, I took one product from an empty repository to production.',
};

export const proofStats: ProofStat[] = [
  {
    value: '20 min → ~15 s',
    label: 'A report that never finished, traced to an O(n²) loop',
    href: '/blog/a-report-that-never-finished/',
    linkText: 'Read the story',
  },
  {
    value: '0 → prod',
    label: 'An inventory app built from an empty repository, owned end to end',
    href: '/about/#experience',
    linkText: 'Experience',
  },
  {
    value: '50+',
    label: 'Features shipped across backend services and web clients',
    href: '/about/#experience',
    linkText: 'Experience',
  },
];

export const strengths: Strength[] = [
  {
    title: 'Production debugging',
    text: 'Find where the time goes before guessing why.',
    href: '/blog/a-report-that-never-finished/',
    linkText: 'The report that never finished',
  },
  {
    title: 'Zero to production',
    text: 'Greenfield apps owned end to end: React/Next.js on .NET, with Tesseract OCR.',
    href: '/about/#experience',
    linkText: 'Experience',
  },
  {
    title: 'Local AI and RAG',
    text: 'LLMs that run on a laptop, answering over your own documents.',
    href: '/projects/hearth-ai/',
    linkText: 'Hearth AI',
  },
  {
    title: 'Agent-directed development',
    text: 'I set the hypothesis and the correctness bar, and the agent executes.',
    href: '/blog/a-report-that-never-finished/#how-the-work-was-split',
    linkText: 'How the work was split',
  },
];
