# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an experimental React data table spike project using React 19, TypeScript, and Vite (via rolldown-vite).

## Commands

- `npm run dev` - Start development server with HMR
- `npm run build` - Type-check with TypeScript then build for production
- `npm run lint` - Run ESLint on the codebase
- `npm run preview` - Preview production build locally

## Tech Stack

- **React 19** with TypeScript
- **Vite** using `rolldown-vite@7.2.5` (experimental Rolldown-based Vite)
- **ESLint** with TypeScript and React Hooks plugins
- **CSS** for styling (no CSS framework)
- **TanStack Table** (`@tanstack/react-table`) - Headless table library for building data tables
- **TanStack Query** (`@tanstack/react-query`) - Data fetching and caching
- **TanStack Virtual** (`@tanstack/react-virtual`) - Virtualization for large lists/tables
- **localforage** - Client-side storage abstraction (IndexedDB/WebSQL/localStorage)

## Architecture

Standard Vite React project structure:

- `src/main.tsx` - Application entry point, renders App in StrictMode
- `src/App.tsx` - Root component
- `vite.config.ts` - Vite configuration with React plugin
- `eslint.config.js` - Flat ESLint config with TypeScript and React rules

## TypeScript Configuration

Uses project references with separate configs:

- `tsconfig.app.json` - Application code (strict mode enabled)
- `tsconfig.node.json` - Node tooling files

## Code Documentation

Use JSDoc comments for all public interfaces, types, and exported functions:

- **Interfaces/Types** - Document the interface purpose and each property
- **React Components** - Document purpose, features, and include usage examples
- **Custom Hooks** - Document return values, features, and usage examples
- **Exported Constants** - Document purpose and usage

Example:
```typescript
/**
 * Props for the SearchFilter component.
 */
interface SearchFilterProps {
  /** The current filter value (controlled component) */
  value: string;
  /** Callback invoked with the new filter value after debounce delay */
  onChange: (value: string) => void;
}
```
