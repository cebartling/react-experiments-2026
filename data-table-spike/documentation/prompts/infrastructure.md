# Infrastructure Prompts

## Prettier

Install Prettier for code formatting.
Create a configuration file `.prettierrc` in the root directory with the following content:

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "printWidth": 100
}
```

Create an `.prettierignore` file to exclude files and directories from formatting:

```
node_modules
dist
```

Create a script in `package.json` to run Prettier.
Create a feature branch for this work off of the main branch.
Commit the changes with a descriptive message.
Create a PR from the feature branch that will be merged into the main branch after review.

## Tailwind CSS

Install Tailwind CSS dev dependency "tailwindcss" for utility-first CSS styling.
Install the following Tailwind CSS related packages as dev dependencies: "@tailwindcss/cli" and "@tailwindcss/vite".

Create a configuration file `tailwind.config.js` in the root directory with the following content:

```js
module.exports = {
  content: ['./src/**/*.{html,js,jsx,ts,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

Create a CSS file `src/styles/tailwind.css` to include Tailwind directives:

```css
@import 'tailwindcss';
@config "../../tailwind.config.js";
```

Create a script in `package.json` to build Tailwind CSS.
Add the `tailwindcss()` plugin to the Vite configuration file (`vite.config.ts`).
Create a feature branch for this work off of the main branch.
Commit the changes with a descriptive message.
Create a PR from the feature branch that will be merged into the main branch after review.

## Zod

Install Zod for schema validation.
Create a feature branch for this work off of the main branch.
Commit the changes with a descriptive message.
Create a PR from the feature branch that will be merged into the main branch after review.

## Vitest

Install Vitest and React Testing Library for unit testing.

Add the following dev dependencies:

- `vitest` - Test runner
- `@testing-library/react` - React component testing utilities
- `@testing-library/jest-dom` - Custom DOM matchers
- `@testing-library/user-event` - User interaction simulation
- `jsdom` - DOM environment for tests
- `@vitest/coverage-v8` - Code coverage with V8
- `vitest-axe` - Accessibility testing with axe-core

Create a Vitest configuration file `vitest.config.ts` in the root directory:

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/test/'],
    },
  },
});
```

Create a test setup file `src/test/setup.ts`:

```typescript
import '@testing-library/jest-dom/vitest';
import * as matchers from 'vitest-axe/matchers';
import { expect } from 'vitest';

expect.extend(matchers);
```

Create a type declaration file `src/test/vitest-axe.d.ts` for accessibility matchers:

```typescript
import 'vitest';
import type { AxeMatchers } from 'vitest-axe/matchers';

declare module 'vitest' {
  interface Assertion<T> extends AxeMatchers {}
  interface AsymmetricMatchersContaining extends AxeMatchers {}
}
```

Update `tsconfig.app.json` to include test types:

```json
{
  "compilerOptions": {
    "types": ["vite/client", "vitest/globals", "@testing-library/jest-dom", "vitest-axe"]
  }
}
```

Add the following scripts to `package.json`:

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage"
  }
}
```

Create a feature branch for this work off of the main branch.
Commit the changes with a descriptive message.
Create a PR from the feature branch that will be merged into the main branch after review.

## Cucumber.js and Playwright

Install Cucumber.js and Playwright for acceptance testing.
Configure Cucumber.js with Playwright as the test runner.
Add the following dev dependencies: "@cucumber/cucumber", "@cucumber/playwright", "playwright", "ts-node", "tsx".
Add necessary scripts to `package.json` to run acceptance tests:

```json
{
  "scripts": {
    "test:acceptance": "NODE_OPTIONS='--import tsx' cucumber-js --import 'features/**/*.ts'",
    "test:acceptance:report": "NODE_OPTIONS='--import tsx' cucumber-js --import 'features/**/*.ts' --format json:reports/cucumber/report.json",
    "report:generate": "NODE_OPTIONS='--import tsx' npx tsx scripts/generate-cucumber-report.ts",
    "test:acceptance:html": "npm run test:acceptance:report && npm run report:generate"
  }
}
```

Create a feature branch for this work off of the main branch.
Commit the changes with a descriptive message.
Create a PR from the feature branch that will be merged into the main branch after review.

## Zustand

Install Zustand for state stores.
Create a feature branch for this work off of the main branch.
Commit the changes with a descriptive message.
Create a PR from the feature branch that will be merged into the main branch after review.

## React Router

Install React Router for routing.
Create a feature branch for this work off of the main branch.
Commit the changes with a descriptive message.
Create a PR from the feature branch that will be merged into the main branch after review.

## Mock Service Worker (msw)

Install Mock Service Worker (msw) for mocking HTTP requests.
Add configuration for msw in the project's `/public` directory.
Create a feature branch for this work off of the main branch.
Commit the changes with a descriptive message.
Create a PR from the feature branch that will be merged into the main branch after review.

## Localforage

Install localforage for abstracting persistence to localStorage and IndexedDB.
Create a feature branch for this work off of the main branch.
Commit the changes with a descriptive message.
Create a PR from the feature branch that will be merged into the main branch after review.
