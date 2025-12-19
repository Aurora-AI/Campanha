# Migration Notes - Campaign Sandbox

**Source:** `Aurora-AI/Campanha` (Branch: `ui/editorial-sandbox-final`)
**Target:** Production Repository (TBD)
**Objective:** Migrate the validated Editorial UI "shell" and plug in real data logic.

## 1. Asset Migration Checklist

Copy these directories **in their entirety**:

- [ ] `app/sandbox/` -> `app/(campaign)/` (or desired route)
- [ ] `components/sandbox/` -> `components/campaign/`
- [ ] `lib/sandbox/` -> `lib/campaign/`
- [ ] `public/sandbox/` -> `public/campaign/`

## 2. Dependencies

Ensure the target project has these dependencies installed:
- `framer-motion` (Critical for animations)
- `recharts` (For the line chart)
- `clsx` / `tailwind-merge` (Standard utils)

## 3. Data Integration Points (The "Plug")

The UI is currently powered by `lib/sandbox/mock.ts`. To connect real data:

1.  **Create API Service:** Replace `const MOCK_DB` with a fetch/hook (e.g., `useCampaignMetrics()`).
2.  **Keep the Contract:** Ensure your API response matches the `SandboxData` interface exactly:
    ```typescript
    export interface SandboxData {
      hero: { ... };
      movement: { ... };
      campaign: { ... };
      kpis: { ... };
      accumulated: { ... };
    }
    ```
3.  **Refactor Components:**
    - In `Hero.tsx`, `SectionGroups.tsx`, etc., replace:
      `import { MOCK_DB } from '@/lib/sandbox/mock';`
      with your new data hook context or prop drill.

## 4. Specific Component Notes

- **`Hero.tsx`**: Contains mouse-tracking logic (`mousemove` listener). Ensure this doesn't conflict with global layout events.
- **`SectionGroups.tsx`**: traffic light logic (🟢/🟡/🔴) is hardcoded in the `statusColorMap`. Map your backend status enums to these keys (`NO_JOGO`, `EM_DISPUTA`, `FORA_DO_RITMO`).
