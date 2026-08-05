# Enterprise React + TypeScript Project

## Project Goal

This is a production-grade Enterprise React application.

The codebase must remain scalable, reusable, maintainable, testable, and production-ready.

Always preserve the existing architecture.

---

# Architecture

Always follow:

- SOLID Principles
- Clean Architecture
- Feature-Based Architecture
- Composition over Inheritance
- Separation of Concerns
- DRY
- KISS

Never introduce parallel architectures.

Always extend the existing implementation.

---

# Read Before Modify

Before modifying any file:

- Read the existing implementation.
- Understand the architecture.
- Identify reusable components, hooks, utilities, services, and types.
- Reuse existing code whenever possible.
- Prefer extending existing implementations over creating new ones.
- Never duplicate functionality that already exists.

---

# TypeScript

Strict TypeScript only.

Rules:

- No `any`
- No unsafe casting
- No @ts-ignore unless explicitly required
- No unused types
- Strong generic typing
- Prefer readonly where applicable
- Named exports
- Strong interfaces
- Keep types reusable

---

# React

Use:

- React 19
- Functional Components
- Hooks
- Composition Pattern

Do NOT use:

- React.FC
- Class Components

Keep components small and focused.

---

# UI Standards

Every UI implementation must:

- Produce a visible UI change when applicable.
- Follow the existing Theme System.
- Be responsive.
- Be accessible.
- Reuse Shared UI Components.
- Use semantic HTML.
- Support keyboard accessibility.
- Maintain visual consistency.

---

# Shared Components

Always reuse:

- Shared Components
- Existing Hooks
- Existing Utilities
- Existing Services
- Existing Layouts
- Existing Theme
- Existing Constants

Never create duplicate implementations.

---

# DataTable

The DataTable is the enterprise shared table component.

Rules:

- Keep it generic.
- Keep it reusable.
- Keep it presentation-only.
- Keep business logic outside UI.
- Never duplicate the DataTable.
- Extend existing functionality only.

---

# RTK Query

Always reuse the existing RTK Query architecture.

Do NOT:

- Create duplicate API slices.
- Move API logic into UI components.
- Duplicate request logic.

---

# Folder Structure

Respect the existing project structure.

Do NOT:

- Rename folders.
- Move files unless required.
- Create parallel folder structures.
- Break existing module boundaries.

---

# Code Changes

Modify ONLY the files required for the requested task.

Do NOT:

- Refactor unrelated modules.
- Rewrite working code.
- Rename public APIs.
- Modify unrelated imports.
- Introduce breaking changes.

Preserve backward compatibility.

Keep the change set as small as possible.

---

# Dependencies

Do NOT:

- Upgrade packages.
- Install new libraries.
- Modify package.json.
- Change project configuration.

Unless explicitly requested.

---

# Performance

Prefer:

- Memoization where appropriate.
- Reusable hooks.
- Pure utility functions.
- Reusable constants.
- Efficient rendering.

Avoid unnecessary renders.

---

# Accessibility

Maintain:

- Semantic HTML
- Proper ARIA attributes
- Keyboard navigation
- Focus management
- Accessible labels

---

# Git Safety

Never:

- Delete unrelated files.
- Rename existing folders.
- Replace working implementations.
- Modify unrelated modules.
- Perform project-wide refactoring.

Keep commits focused on the requested task.

---

# Verification

Before completing every task verify:

- Zero TypeScript errors
- Zero ESLint errors
- Zero broken imports
- Zero circular dependencies
- Zero duplicate implementations
- Zero dead code
- Successful production build

Fix every issue before considering the task complete.

---

# Output

After every implementation provide:

1. Files Modified
2. Files Created
3. Architecture Decisions
4. Verification Summary

---

# Workflow

For every request:

1. Read existing code.
2. Understand the architecture.
3. Identify files to modify.
4. Reuse existing components.
5. Implement ONLY the requested step.
6. Verify build quality.
7. Provide implementation summary.
8. Wait for the next instruction.

---

# Project Rules

Implement ONLY the requested step.

Do NOT implement future steps.

Do NOT anticipate future features.

Do NOT make assumptions about future modules.

Wait for the next instruction.

---

# Golden Rules

- Enterprise Architecture Only
- SOLID Principles
- Feature-Based Architecture
- Clean Code
- Strict TypeScript
- No `any`
- Generic-First Design
- Reuse Existing Architecture
- Reuse Existing Components
- No Duplicate Implementations
- No Inline Business Logic
- Presentation Components Only
- Production-Ready Code Only
- Maintain Zero TypeScript Errors
- Maintain Zero ESLint Errors