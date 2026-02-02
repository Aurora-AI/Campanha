---
name: library-docs
description: Index of library documentation available in .antigravity/knowledge/. Use this file to locate documentation for specific libraries before implementing features.
priority: P1
---

# 📚 Library Documentation Index

> **Location:** `.antigravity/knowledge/`
> **Purpose:** Reference documentation for AI agents

---

## 🔍 Quick Lookup

| Library                 | Folder              | Primary Use                                  |
| ----------------------- | ------------------- | -------------------------------------------- |
| **GSAP**                | `gsap_docs/`        | Complex animations, ScrollTrigger, Timelines |
| **Tailwind CSS**        | `tailwindcss/`      | Utility-first styling, v4 patterns           |
| **Shadcn/UI**           | `shadcn_ui/`        | Headless UI components                       |
| **Framer Motion**       | `framer/`           | Micro-interactions, layout animations        |
| **Vercel AI SDK**       | `vercel_sdk/`       | AI integration, streaming                    |
| **PMND (Drei/R3F)**     | `pmnd_docs/`        | 3D graphics, React Three Fiber               |
| **The Book of Shaders** | `thebookofshaders/` | GLSL, GPU programming                        |

---

## 📖 Documentation by Agent

### Frontend Specialist (`frontend-specialist.md`)

| Topic              | Read First              |
| ------------------ | ----------------------- |
| Styling            | `tailwindcss/docs_*.md` |
| Animations         | `gsap_docs/GSAP*.md`    |
| Components         | `shadcn_ui/`            |
| Micro-interactions | `framer/`               |

**GSAP Key Files:**

- `gsap_docs/GSAPgsapto.md` — Basic tweens
- `gsap_docs/GSAPTimeline.md` — Timeline sequences
- `gsap_docs/PluginsScrollTrigger.md` — Scroll-based animations
- `gsap_docs/PluginsFlip.md` — FLIP animations
- `gsap_docs/Eases.md` — Easing functions

**Tailwind Key Files:**

- `tailwindcss/docs_dark-mode.md` — Dark mode
- `tailwindcss/docs_responsive-design.md` — Breakpoints
- `tailwindcss/docs_animation.md` — CSS animations
- `tailwindcss/docs_theme.md` — Theme customization

---

### Website Cloner (`website-cloner.md`)

| Topic      | Read First                                              |
| ---------- | ------------------------------------------------------- |
| Typography | `tailwindcss/docs_font-*.md`                            |
| Colors     | `tailwindcss/docs_color.md`, `docs_background-color.md` |
| Spacing    | `tailwindcss/docs_margin.md`, `docs_padding.md`         |
| Effects    | `tailwindcss/docs_box-shadow.md`, `docs_filter*.md`     |

---

### Backend Specialist (`backend-specialist.md`)

| Topic          | Read First    |
| -------------- | ------------- |
| AI Integration | `vercel_sdk/` |
| Deployment     | `vercel/`     |

---

### Game Developer (`game-developer.md`)

| Topic       | Read First          |
| ----------- | ------------------- |
| 3D Graphics | `pmnd_docs/`        |
| Shaders     | `thebookofshaders/` |

---

## 🏛️ Certum-Specific Knowledge

### Motion/Animation

1. **GSAP ScrollTrigger:** `gsap_docs/PluginsScrollTrigger.md`
   - Pinning, scrubbing, snap
   - Use with Lenis: sync via `ScrollTrigger.update()`

2. **GSAP Easing:** `gsap_docs/Eases.md`
   - Allowed: `power2.out`, `power3.out`, `power4.out`
   - Banned: `bounce`, `elastic`, `back`

3. **Framer Motion:** `framer/`
   - Use for hover states, layout animations
   - NOT for scroll-based animations

### Styling

1. **Tailwind v4:** `tailwindcss/docs_theme.md`
   - CSS-first configuration
   - Custom properties

2. **Colors:** `tailwindcss/docs_colors.md`
   - Override with Certum palette (Gold, Emerald, Trust Blue)

---

## 📁 Folder Structure

```
.antigravity/knowledge/
├── gsap_docs/           # 500+ files - GSAP complete reference
├── tailwindcss/         # 300+ files - Tailwind CSS v4
├── shadcn_ui/           # Shadcn component patterns
├── framer/              # Framer Motion
├── vercel_sdk/          # Vercel AI SDK
├── vercel/              # Vercel platform
├── pmnd_docs/           # React Three Fiber, Drei
├── thebookofshaders/    # GLSL shader tutorials
├── claude_code/         # Claude coding patterns
├── google_ai_studio/    # Google AI integration
├── github/              # GitHub workflows
├── estudos/             # Research studies
├── documento_tecnicos/  # Technical documents
├── antigravity/         # Antigravity kit docs
└── os/                  # OS-related docs
```

---

## 🔧 How to Use

### For Agents

1. **Before implementing:** Check if documentation exists
2. **Search:** Use `grep_search` or `find_by_name` in knowledge folder
3. **Read:** Use `view_file` on specific documentation
4. **Apply:** Follow patterns from documentation

### Example Workflow

```
User: "Add a scroll-triggered animation"

Agent:
1. Check gsap_docs/PluginsScrollTrigger.md
2. Review .antigravity/rules.md for Certum patterns
3. Implement using documented patterns
```

---

## ✅ Documentation Checklist

Before implementing features, verify documentation exists:

- [ ] **GSAP Animation?** → Check `gsap_docs/`
- [ ] **Tailwind Class?** → Check `tailwindcss/`
- [ ] **React Pattern?** → Check `shadcn_ui/` or skill files
- [ ] **AI Feature?** → Check `vercel_sdk/`
- [ ] **3D/Shader?** → Check `pmnd_docs/` or `thebookofshaders/`

---

> **Nota:** Esta base de conhecimento é atualizada manualmente. Para adicionar novas bibliotecas, copie a documentação para `.antigravity/knowledge/<library>/`.
