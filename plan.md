# Deriv Analysis Tool Implementation Plan - Matches/Differs Scanner

Add a Matches/Differs scanner with 90%+ accuracy to the existing Deriv analysis tool. This scanner will monitor digit patterns to identify high-probability "Differs" opportunities (where the prediction is that the next digit will NOT match a specific number).

## Scope Summary
- **Matches/Differs Logic:** Implement a scanner that tracks the frequency of all digits (0-9).
- **Scanner UI:** Add a new section or tab to display digit frequencies and "Differs" signals.
- **Signal Logic:** Trigger a 90%+ probability signal when a specific digit has a statistically high "cold streak" or low frequency over a window of ticks.
- **Robot Integration:** Update the `RobotPanel` or internal logic to optionally support Matches/Differs (if applicable, though the user specifically asked for a "scanner").

## Non-Goals
- Real money trading by default (requires user token).
- Persistence of scanner history across sessions (client-side only).

## Assumptions
- The "90% accuracy" for Matches/Differs usually relies on the "Differs" contract where the probability of winning is naturally 90% (1/10 chance of losing). The scanner's job is to find the *best* digit to bet against.
- The user wants a visual scanner to identify these digits.

## Affected Areas
- `src/hooks/useDerivAPI.ts`: Update stats to include individual digit frequencies (0-9).
- `src/components/StatsDashboard.tsx`: Add a "Digit Frequency" grid to show which digits are "hot" or "cold".
- `src/App.tsx`: Layout adjustments to include the scanner.
- `src/components/MatchesDiffersScanner.tsx`: (New) Component to specifically highlight the 90%+ accuracy scanner.

## Auth & RLS model
**Auth in scope:** no
**Model:** no_auth_public_read (Deriv API tokens are stored in localStorage)
**RLS strategy:** N/A
**Frontend implication:** Deriv tokens are client-managed.

## Migration baseline
**Local migrations in project:** none
**User confirmed proceed on connected DB:** not_applicable

## Ordered Phases

### Phase 1: Data Logic (frontend_engineer)
- Update `useDerivAPI.ts` to calculate the frequency of each digit (0-9) in the last 100 ticks.
- Implement logic to identify the "Least Frequent" digit over the last 25, 50, and 100 ticks.
- Add `MATCHES_DIFFERS` signal type to the `Signal` type definition.

### Phase 2: UI Components (frontend_engineer)
- Create `src/components/MatchesDiffersScanner.tsx`.
- Display a 0-9 grid with percentages/counts.
- Highlight the digit with the lowest frequency as the recommended "Differs" target.
- Add a "Scanner" tab to the main `App.tsx` layout.

### Phase 3: Signal Refinement (quick_fix_engineer)
- Fine-tune the "90% accuracy" logic: trigger a signal only when a digit hasn't appeared for a specific number of ticks (e.g., > 15 ticks).
- Add visual "Confidence" levels to the scanner.

## Execution Handoff

**Plan status:** ready

**Dispatch order:**
1. frontend_engineer — Update hook and create the scanner component.
2. quick_fix_engineer — Polish UI and fine-tune signal thresholds.

**Per-agent instructions:**
### 1. frontend_engineer
- **Phases:** 1, 2
- **Scope:** Update `AnalysisStats` in `useDerivAPI.ts` to include `digitFrequency: Record<number, number>`. Update `calculateStats` and the `tick` handler.
- **Component:** Build `MatchesDiffersScanner.tsx` using a grid layout. Show progress bars or heatmaps for digits 0-9.
- **Files:** `src/hooks/useDerivAPI.ts`, `src/components/MatchesDiffersScanner.tsx`, `src/App.tsx`.
- **Acceptance criteria:** The UI shows live frequencies for all 10 digits. The "Coldest" digit is clearly marked.

### 2. quick_fix_engineer
- **Phases:** 3
- **Scope:** Styling and threshold tuning.
- **Files:** `src/components/MatchesDiffersScanner.tsx`.
- **Acceptance criteria:** Signals for "Differs" are visually distinct and trigger correctly based on the cold-streak logic.
