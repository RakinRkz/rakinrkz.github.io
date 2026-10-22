---
title: "Hearth AI"
summary: "Cross-platform local-LLM chat app: runs models on-device, answers questions over your own documents with RAG, and summarizes web search results."
stack: ["Python", "React", "llama.cpp", "RAG"]
repo: https://github.com/RakinRkz/Hearth-AI
caseStudy: true
order: 2
glance:
  role: "Solo, end to end"
  since: "Dec 2025"
  runsOn: "Windows installer; Linux and macOS from source"
---

## Problem

Local LLMs are good enough now to be useful offline: chatting, asking questions about your own
files, summarising what is on the web. But almost every way of running one assumes you are
comfortable with a terminal, Python environments and model formats. For a regular user that is a
wall.

Hearth AI is my attempt at the opposite: a private, offline assistant you install like any other
piece of software and start using. No cloud account and no API keys. Your documents and conversations
stay on your machine, and the only thing that ever goes out is a short web-search query.

## Constraints

- **Everything local.** The model, the embeddings and the vector store all run on the user's machine.
  Web search is the one exception. It is on by default and can be switched off in settings. Even when
  it is on, the model decides per message whether a search is needed, and only a few keywords are sent.
- **Ordinary hardware.** The default path has to work on a laptop CPU, so the starter models are
  small quantised GGUF files, from about 0.8 GB to 2.4 GB. The default is Phi-3.5 Mini (3.8B, Q4_K_M).
- **Install like normal software.** On Windows that means an installer that does not need admin
  rights, and a first run that fetches a model for you.
- **One person, one codebase.** A Python back end and a React front end I could keep in my head.

## Design

**Shape.** A FastAPI server runs on localhost and serves the built React app (Vite, React 19,
TypeScript, Tailwind). The UI opens in the user's browser. Replies stream over a WebSocket, one token
per frame, and everything else (settings, documents, conversations) is plain REST. On Windows a small
tray app starts the server and opens the browser, and the whole thing is packaged with PyInstaller
inside a per-user Inno Setup installer.

**Inference.** Models run through `llama-cpp-python`, in GGUF format. Starter models download from
Hugging Face with resumable range requests, so a dropped connection does not restart a 2 GB file. If
an NVIDIA GPU is found, layers are offloaded to it, and if GPU loading fails the model falls back to
the CPU instead of crashing.

**Document Q&A (RAG).** Users drop in PDF, DOCX, TXT or Markdown files. They are split into
500-character chunks with a 50-character overlap, broken at sentence or word boundaries where
possible. The chunks are embedded with `all-MiniLM-L6-v2` and stored in a persistent ChromaDB
collection using cosine distance. For each question the top 4 chunks are numbered and placed in the
system prompt, and the model is told to cite them as `[1]`, `[2]`, and so on.

**Web search.** A small model is a poor search engine, so the work is split up. First the local model
rewrites the question into a few search keywords, or answers `NONE` when no search is needed (small
talk, for example). Then DuckDuckGo returns 5 results, their pages are fetched in parallel with
strict size and time limits, and the cleaned text goes into the prompt for a cited answer.

## Trade-offs

- **Browser UI instead of Electron.** It avoids shipping a second browser engine. The cost is that it
  feels less like a native app, and a localhost server is one more thing to secure.
- **`fastembed` (ONNX) for embeddings instead of sentence-transformers.** It avoids pulling in a
  second CUDA stack that conflicts with llama.cpp's. The cost is a smaller choice of embedding models.
- **Character-based chunking.** It is simple and predictable. The cost is that chunks do not line up
  with the model's tokens or with the document's structure.
- **A small default context window (2,048 tokens).** It is sized so a model fits on a GPU with 4 GB
  of VRAM. The cost is that only recent turns and a few retrieved chunks fit in the prompt.

## What I'd change

Using it day to day, these are the gaps I would close next:

1. **Keep inference off the event loop.** Token generation and document indexing run on the server's
   event loop, so one long reply can stall everything else. Both belong in a worker thread.
2. **Remove the artificial delay in streaming.** The WebSocket loop sleeps briefly after every token,
   which caps throughput for no real benefit.
3. **Count tokens with the model's own tokenizer.** The context meter estimates tokens as characters
   ÷ 4. That is close for English prose, but it undercounts code and non-Latin scripts.
4. **Make retrieval more careful.** Add a relevance threshold, so weak matches are not injected just
   because they are in the top 4. And give chunks IDs that cannot collide when two files share a name
   (`notes.pdf` and `notes.txt`).
5. **Use the conversation summaries.** When a chat passes 70% of the context window, a summary is
   written to disk, but nothing feeds it back into the prompt. Only the last few messages reach the
   model.
6. **Tests in CI.** The public repository has a single test file, and its only workflow builds the
   Windows release. A real suite (API, retrieval and an end-to-end browser pass) running on every push
   is the foundation for everything above.
7. **Packaging beyond Windows.** Linux and macOS run from source today, the installer is CPU-only and
   unsigned, and GPU auto-detection only looks for NVIDIA.

The core idea holds up: a capable assistant that never needs the internet to be useful. Most of the
remaining work is making it as robust as it is private.
