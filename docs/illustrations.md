# Illustration Specification

## Style Guide
- **Art Style**: Edwardian storybook illustration with ink linework and soft watercolor washes.
- **Mood**: Magical, adventurous, slightly mysterious; warm daylight for day scenes, cool moonlight for night scenes.
- **Composition**: Clear focal point, readable silhouettes, cinematic framing.
- **Restrictions**: No text, speech bubbles, watermarks, or modern objects.
- **Characters**:
  - **Gerald**: Brown hair, confident, short trousers, collared shirt, vest.
  - **Jimmy**: Sandy hair, skeptical, short trousers.
  - **Kathleen**: Chestnut hair with ribbons, pinafore dress.
  - **Mademoiselle**: French governess, refined, dark hair in a bun.
  - **Princess (Mabel)**: Looks like a princess but with a hint of playing dress-up (until the magic takes over).

## Character Consistency
- Use reference images in `client/public/images/characters/` and keep facial features consistent.
- References should be text-free and match the final illustration style.
- Keep Chapter 1 outfits consistent across its scenes.

## Naming Convention
Files should be placed in `client/public/images/`.
Format: `ch{chapter_num}_{scene_num}_{short_description}.png` (chapter and scene are 2 digits).

Example: `ch01_01_bandit_proposal.png`

## Implementation
- Data is stored in `client/src/data/illustrations.json`.
- Images are referenced by path in the JSON.
- The text parser uses `<comic-panel id="scene_id">` tags that map to `illustrations.json` entries by `id`.
- Scene entries may include an `anchor` string used by scripts to place panels near specific passages.

## Pipeline
- Source text lives in `content/book.txt` (cleaned Project Gutenberg text).
- Run `pnpm exec tsx scripts/update-book-content.ts` to inject comic-panel placeholders.
- Run `pnpm exec tsx scripts/build-book-json.ts` to regenerate `client/src/data/book.json`.
