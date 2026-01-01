# Image Agent Brief (Chapter 1 POC + Consistency)

## Goal
Regenerate Chapter 1 images in a consistent Edwardian storybook style with correct aspect ratio and period-accurate clothing. Use the prompt list in `docs/illustration-prompts.md`.

## Required Inputs
- Prompts: `docs/illustration-prompts.md` (Chapter 1 section).
- Character refs (must be text-free and style-matched):
  - `client/public/images/characters/gerald_ref.png`
  - `client/public/images/characters/jimmy_ref.png`
  - `client/public/images/characters/kathleen_ref.png`
  - `client/public/images/characters/mabel_ref.png` (needed for CH01-03 only if present)
  - `client/public/images/characters/mademoiselle_ref.png` (needed for CH01-03)

If the Mabel/Mademoiselle refs are not ready, create those first (see Issue IMG-01).

## Global Constraints
- 16:9 landscape (target 2048x1152 or 1920x1080).
- No text, no speech bubbles, no captions, no watermarks.
- Edwardian clothing only (no jeans, no sneakers, no T-shirts).
- Avoid props not in the text (no swords, no glowing magic unless described).
- Keep Chapter 1 wardrobe consistent across all seven scenes.
- Keep faces consistent with reference sheets.
- Export real PNGs (not JPEGs saved with a .png extension).

## Output Files (replace these)
- `client/public/images/ch01_01_bandit_proposal.png`
- `client/public/images/ch01_02_jimmy_sarcasm.png`
- `client/public/images/ch01_03_charming_mademoiselle.png`
- `client/public/images/ch01_04_cave_discovery.png`
- `client/public/images/ch01_05_secret_passage.png`
- `client/public/images/ch01_06_castle_discovery.png`
- `client/public/images/ch01_07_finding_ring.png`

## Quick QA
- Verify 16:9 aspect ratio.
- Confirm no embedded text/speech bubbles.
- Confirm period-accurate wardrobe and consistent faces.
