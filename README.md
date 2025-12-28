# react-experiments-2026

Various React experiments during 2026.

## Experiments

### [Multi-Form Save Experiment](./multi-form-save-experiment)

A React 19 experiment demonstrating coordinated multi-form validation and submission with a unified save experience.

**Problem**: Managing multiple independent forms that share a single "Save All" button, where validation must pass on all forms before any submissions occur.

**Key Concepts**:
- Dirty state tracking across multiple forms via Zustand
- Coordinated validation using React Hook Form + Zod
- Parallel submission with partial failure handling
- Centralized error display with field-level feedback

**Tech Stack**: React 19, TypeScript, Vite, Zustand, React Hook Form, Zod, Tailwind CSS v4, MSW, Vitest, Cucumber.js + Playwright
