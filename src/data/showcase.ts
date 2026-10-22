import type { ImageMetadata } from 'astro';
import hearthScreenshot from '../assets/projects/hearth-ai.png';

export type DiagramKind = 'rag-pipeline' | 'deploy-loop';

/** How a featured project is presented visually. Keys are project ids (file names). */
export interface Showcase {
  /** A shorter line than the CV summary, for the home-page card. */
  tagline: string;
  /** Shown on the card and at the top of the case study. */
  image?: { src: ImageMetadata; alt: string; caption: string };
  /** Drawn on the case study, and on the card when there is no image. */
  diagram: { kind: DiagramKind; title: string; caption: string };
}

export const showcase: Record<string, Showcase> = {
  'hearth-ai': {
    tagline: 'A private, offline AI assistant: local LLMs, RAG over your own files, and summarised web search.',
    image: {
      src: hearthScreenshot,
      alt: 'The Hearth AI chat window: a conversation, with Chat, RAG and Web modes in the sidebar.',
      caption: 'The chat window, with Chat, RAG and Web modes in the sidebar.',
    },
    diagram: {
      kind: 'rag-pipeline',
      title: 'How a document question is answered',
      caption: 'Everything in this path runs on your machine.',
    },
  },
  'minimal-auto-deployment': {
    tagline: 'A 430-line, standard-library-only Go daemon that deploys new commits automatically under systemd.',
    diagram: {
      kind: 'deploy-loop',
      title: 'The deploy loop',
      caption: 'One pass per tick (60 seconds by default). A failed step is logged, and the loop waits for the next tick.',
    },
  },
};
