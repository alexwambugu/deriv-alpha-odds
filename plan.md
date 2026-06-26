# Deriv Analysis Tool Implementation Plan

Build a Deriv digit analysis tool for Even/Odd and Over/Under contract types, featuring a real-time log, account switching (Real/Demo), and strategy-based indicators targeting high win rates.

## Scope Summary
- **Deriv API Integration:** Connect to Deriv WebSocket for real-time tick/digit data.
- **Account Management:** Support for both Real and Demo accounts (via API Token entry).
- **Analysis Engine:** Real-time calculation of digit distribution (Even/Odd, Over/Under).
- **"Alex" Strategy Log:** A persistent sidebar or modal logging trade signals and analysis events.
- **High Win-Rate Indicator:** Logic that highlights "High Probability" (>90%) entry points based on statistical skew (e.g., waiting for extreme imbalances in the last 100 digits).
- **Responsive UI:** A professional dashboard for monitoring stats and account status.

## Non-Goals
- Automated bot execution (this is an *analysis tool*, not an auto-trader).
- Server-side database (all data is client-side only).
- Financial advice or guaranteed profit.

## Assumptions
- Users will provide their own Deriv API Tokens (Read scope).
- "Alex Log" refers to a specific naming convention for the activity/signal feed.
- "90% win rate" refers to identifying statistically infrequent streaks (e.g., 5 consecutive odds) before suggesting an "even" entry, which is a common community strategy for these contract types.

## Affected Areas
- `src/App.tsx`: Main layout and state management.
- `src/hooks/useDerivAPI.ts`: Custom hook for WebSocket connection and data parsing.
- `src/components/StatsDashboard.tsx`: Visualization of digit percentages and trends.
- `src/components/AlexLog.tsx`: The activity feed component.
- `src/components/AccountSwitcher.tsx`: Token management and account type toggle.

## Ordered Phases

### Phase 1: API Foundation (frontend_engineer)
- Implement `useDerivAPI` hook to handle WebSocket connection (`wss://ws.binaryws.com/websockets/v3`).
- Add basic `authorize` and `ticks` subscription logic.
- Create a state for storing the last N digits (e.g., 100).

### Phase 2: Analysis Engine & Logic (frontend_engineer)
- Create utility functions to calculate percentages for:
  - Even vs. Odd
  - Over X vs. Under X (configurable threshold, default 4.5).
- Implement the "High Probability" detection:
  - Trigger "Buy Signal" when a specific digit has not appeared for X ticks or when a side (Even/Odd) drops below a threshold (e.g., <30% in last 50 ticks).

### Phase 3: UI Implementation (frontend_engineer)
- Build the `AccountSwitcher` to allow users to input tokens for Demo/Real accounts.
- Build the `StatsDashboard` using progress bars or charts for digit distribution.
- Build the `AlexLog` component to display timestamped "signals" and "analysis notes".

### Phase 4: Refinement & "90%" Polish (quick_fix_engineer)
- Adjust the signal thresholds to be more conservative (targeting the "over 90% possible win" user request).
- Add visual indicators (Green/Red highlights) for high-probability moments.
- Ensure responsive styling for mobile/desktop.

## Execution Handoff

**Plan status:** ready

**Dispatch order:**
1. frontend_engineer — Build core API hook and data processing logic.
2. frontend_engineer — Build the UI dashboard, account management, and "Alex Log".
3. quick_fix_engineer — Polish UI, adjust strategy thresholds, and finalize styling.

**Per-agent instructions:**
### 1. frontend_engineer
- **Phases:** 1, 2, 3
- **Scope:** Create `useDerivAPI.ts` hook. Use `@deriv-com/deriv-api` or native `WebSocket`.
- **Logic:** Must track last 100 digits. Calculate % for Even/Odd and Over/Under.
- **Components:** `StatsDashboard`, `AlexLog` (the log feed), and `AccountManager` (token inputs).
- **Acceptance criteria:** WebSocket connects, digits update live, and "signals" appear in the Alex Log when statistics are skewed.

### 2. quick_fix_engineer
- **Phases:** 4
- **Scope:** Refine CSS/Tailwind for a professional "trading" look.
- **Task:** Tune the "90% win" threshold logic in the analysis engine (e.g., signal only after 6 consecutive same-type digits).
- **Files:** `src/components/AlexLog.tsx`, `src/App.tsx`.
- **Acceptance criteria:** Visual alerts for signals are clear and the layout is bug-free.
