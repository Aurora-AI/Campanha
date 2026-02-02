---
name: certum-overrides
description: Project-specific rules for Certum Private (Wealth OS). These rules OVERRIDE generic Kit 2.0 guidelines when working on this project.
version: 1.0.0
priority: P0 (Highest)
---

# 🏛️ CERTUM PROJECT OVERRIDES

> **Status:** LEI SUPREMA para o projeto Certum
> **Referência Visual:** https://certum.vercel.app/

---

## 1. COLOR PALETTE (Override Purple Ban)

### Allowed Colors

| Name           | Hex       | Usage                                     |
| -------------- | --------- | ----------------------------------------- |
| **Gold**       | `#C9A227` | Primary accent, CTAs, highlights          |
| **Emerald**    | `#00C853` | Success, yields, positive data            |
| **Trust Blue** | `#4A9CC9` | Trust indicators (override Blue Trap ban) |
| **Indigo**     | `#6366F1` | Tertiary accent, wealth/legacy theme      |
| **Amber**      | `#F59E0B` | Warmth, planning theme                    |

### Banned Colors

| Color                        | Reason                         |
| ---------------------------- | ------------------------------ |
| Purple/Violet as **primary** | OK as subtle accent only       |
| Off-white backgrounds        | Use `#FFFFFF` only             |
| Gray text for body           | Use `#000000` (Absolute Black) |

---

## 2. BACKGROUND RULE (Absolute White)

- **Mandatory:** All sections use `#FFFFFF` (Absolute White)
- **Exception:** `MissionCommand` footer can use `#050505` (Void Black)
- **Texture:** Add subtle noise (opacity 0.03) and grid lines (1px, opacity 0.03)

```css
/* Certum Background Standard */
background: #ffffff;

/* Subtle texture layer */
.site-atmosphere {
  background-image:
    linear-gradient(rgba(0, 0, 0, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 0, 0, 0.03) 1px, transparent 1px);
  background-size: 60px 60px;
}
```

---

## 3. MOTION CONFIG (Lenis + GSAP)

### Lenis Configuration

```typescript
const lenis = new Lenis({
  lerp: 0.05, // HIGH INERTIA (Paradoxo de Zenão)
  duration: 1.2,
  smoothWheel: true,
});
```

### GSAP Easing Rules

| Use                | Easing                      |
| ------------------ | --------------------------- |
| Reveals            | `power2.out`, `power3.out`  |
| Micro-interactions | `power2.inOut`              |
| **BANNED**         | `bounce`, `elastic`, `back` |

### Spring Physics (Framer Motion)

```typescript
// Certum Spring Config (Heavy + Smooth)
const springConfig = {
  stiffness: 50,
  damping: 30,
  mass: 1.5,
};
```

---

## 4. MANDATORY COMPONENTS

When building Certum UI, these components are **REQUIRED**:

| Component            | Purpose                             | Location         |
| -------------------- | ----------------------------------- | ---------------- |
| `<KineticHeading />` | Section titles with scramble effect | `components/ui/` |
| `<SiteAtmosphere />` | Global noise + grid texture         | `components/ui/` |
| `<ScrambleText />`   | Text decrypt animation              | `components/ui/` |
| `<NumberTicker />`   | Animated statistics                 | `components/ui/` |
| `<PillarCard />`     | Service/feature cards               | `components/ui/` |

---

## 5. GLASS & GRADIENT OVERRIDES

### Glass Effect (Override "Glass Trap" Ban)

Certum **allows** glassmorphism when:

- Border: `border-black/5` (thin, subtle)
- Blur: `backdrop-blur-sm` (4px max)
- Background: `bg-white/80` or higher opacity

```jsx
// Allowed Glass Pattern
<div className="bg-white/80 backdrop-blur-sm border border-black/5">...</div>
```

### Gradient Effect (Override Mesh Gradient Ban)

Certum **allows** gradients when:

- Opacity ≤ 0.3 (subtle, not dominating)
- Used for depth/atmosphere, not decoration
- Combined with solid elements (not floating)

```jsx
// Allowed Gradient Pattern (Service Blocks)
background: radial-gradient(
  ellipse 80% 50% at 50% 100%,
  rgba(201, 162, 39, 0.25), // Gold with low opacity
  transparent
);
```

---

## 6. TYPOGRAPHY RULES

### Fonts

| Purpose     | Font             | Tailwind Class |
| ----------- | ---------------- | -------------- |
| Headlines   | Playfair Display | `font-serif`   |
| Body        | Inter            | `font-sans`    |
| Labels/Code | JetBrains Mono   | `font-mono`    |

### Text Colors

| Element         | Color     | Class            |
| --------------- | --------- | ---------------- |
| Primary text    | `#000000` | `text-black`     |
| Secondary/Muted | `#8A8A8A` | `text-[#8A8A8A]` |
| Accent          | `#C9A227` | `text-[#C9A227]` |

---

## 7. STACK CONFIGURATION

- **Framework:** Vite + React 18 (NOT Next.js)
- **Styling:** Tailwind CSS v4
- **Animation:** GSAP (primary), Framer Motion (micro-interactions)
- **Scroll:** Lenis (mandatory)
- **Types:** TypeScript Strict Mode

---

## 8. DECISION HIERARCHY

When in doubt, follow this order:

1. **Live Site:** https://certum.vercel.app/ (Visual Single Source of Truth)
2. **This File:** `.agent/rules/certum-overrides.md`
3. **Constitution:** `.antigravity/constitution.md`
4. **Rules:** `.antigravity/rules.md`
5. **Kit Agents:** `.agent/agents/`

---

> **Lembrete:** "Isso parece um site de $90.000 ou um template gratuito?"
> Se a resposta for a segunda, **REFAÇA**.
