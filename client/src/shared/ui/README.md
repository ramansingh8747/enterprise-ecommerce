# Shared UI Component Library

## Purpose

The `src/shared/ui/` directory is the **single reusable UI foundation** for the entire enterprise React application. It provides a curated, strongly typed collection of presentational components built on top of Material UI and the enterprise design system.

All feature modules, pages, and layouts consume shared UI components from this location. No feature may define its own primitive UI component (button, input, card, etc.) independently.

---

## Folder Structure

```
src/shared/ui/
├── avatar/          # User avatar display
├── badge/           # Notification and status badges
├── button/          # All button variants
├── card/            # Card containers and surfaces
├── checkbox/        # Checkbox input control
├── chip/            # Tag and selection chips
├── dialog/          # Modal dialog windows
├── divider/         # Section dividers
├── empty-state/     # Zero-result placeholder display
├── error-state/     # Error fallback display
├── icon/            # Icon wrapper for MUI icons
├── input/           # Text input field
├── modal/           # Low-level modal overlay primitive
├── radio/           # Radio button group
├── select/          # Dropdown select control
├── skeleton/        # Loading skeleton placeholder
├── snackbar/        # Notification toasts
├── spinner/         # Loading spinner/progress indicator
├── switch/          # Toggle switch control
├── table/           # Data table container
├── textarea/        # Multi-line text input
├── tooltip/         # Hover tooltip
├── typography/      # Text and heading variants
└── index.ts         # Root barrel export
```

---

## Naming Conventions

- Component files: `PascalCase.tsx` (e.g. `Button.tsx`, `InputField.tsx`)
- Component folders: `kebab-case/` (e.g. `empty-state/`, `error-state/`)
- Index files: `index.ts` per folder for barrel re-exports
- Interface props: `I{ComponentName}Props` (e.g. `IButtonProps`)
- Enums: `{ComponentName}Variant` (e.g. `ButtonVariant`)

---

## Import Rules

### ✅ Shared UI components MAY import

- `react`
- `@mui/material`
- `@mui/icons-material`
- `@/styles/theme`
- `@/shared/constants`
- `@/shared/types`
- `@/shared/helpers`
- `@/utils`

### ❌ Shared UI components MUST NEVER import

- `@/features/*` (any feature module)
- `@/pages/*`
- `@/services/*`
- `@/store/*` (no Redux integration)
- Any business-logic-containing module

---

## Reusability Guidelines

1. **Presentational only**: Components must be stateless or manage only local display state.
2. **Props-driven**: All configuration comes through typed props. No global state reads.
3. **Theme-aware**: Use MUI's `sx` prop or theme tokens — never hardcode colors, spacing, or sizes.
4. **Accessible**: Every interactive component must include `aria-*` attributes where applicable.
5. **Composable**: Design for composition — small, focused primitives that combine into larger patterns.

---

## Dependency Rules

```
[React + MUI + Theme] → [Shared UI Components] → [Feature Modules / Pages]
```

- Shared UI sits **below** all feature modules in the dependency graph.
- Feature modules compose shared UI components; shared UI never imports features.
- This ensures zero circular dependency risk across the codebase.

---

## Enterprise Standards

- **Strict TypeScript**: All props must be strongly typed. No `any`, no implicit `unknown`.
- **Display names**: Every component must set `ComponentName.displayName`.
- **SOLID principles**: Single responsibility per component. Open for extension via props.
- **Zero business logic**: Data fetching, Redux dispatches, and navigation are strictly forbidden.
- **Barrel exports**: Every component sub-folder must re-export through its own `index.ts`.

---

## Future Component Organization Strategy

As the component library grows, related components are co-located within their folder:

```
src/shared/ui/button/
├── Button.tsx           # Core component
├── Button.types.ts      # Props interface and enums
├── Button.test.tsx      # Unit tests (future)
└── index.ts             # Barrel export
```

Compound components (e.g. `Table` with sub-components `TableHead`, `TableBody`, `TableRow`) are organized within the same folder using a `compound/` sub-directory pattern when needed.
