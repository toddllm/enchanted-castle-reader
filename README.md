# The Enchanted Castle Reader

Live demo: https://toddllm.github.io/enchanted-castle-reader/

![The Enchanted Castle cover](client/public/images/book-cover.png)

## What this is
An interactive, illustrated reader for E. Nesbit's public-domain novel *The Enchanted Castle*. It features chapter navigation, page-by-page reading, keyboard controls, bookmarks, and comic-style illustrations.

## How it works
- The source text is stored in `content/book.txt` (cleaned Project Gutenberg text).
- `client/src/data/illustrations.json` defines scene IDs and image paths.
- `scripts/update-book-content.ts` injects `<comic-panel>` placeholders into the text.
- `scripts/build-book-json.ts` compiles the structured `client/src/data/book.json` used by the reader.

## Development
```bash
pnpm install
pnpm dev
```

## Content pipeline
```bash
pnpm book:extract   # refresh content/book.txt from the Gutenberg source
pnpm book:content   # inject comic-panel placeholders
pnpm book:build     # regenerate client/src/data/book.json
```
