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

Add the following dev dependencies:

- `@cucumber/cucumber` - BDD testing framework (v12+ required for ESM support)
- `playwright` - Browser automation library
- `@playwright/test` - Playwright test assertions
- `multiple-cucumber-html-reporter` - HTML report generator
- `ts-node` - TypeScript execution
- `tsx` - Fast TypeScript execution with ESM support

After installing dependencies, install Playwright browsers:

```bash
npx playwright install
```

Create the directory structure for acceptance tests:

```
features/
├── step_definitions/
├── support/
reports/
└── cucumber/
scripts/
```

Create a Cucumber configuration file `cucumber.js` in the root directory:

```javascript
export default {
  import: ['features/**/*.ts'],
  format: ['progress-bar', 'html:reports/cucumber/report.html'],
  formatOptions: { snippetInterface: 'async-await' },
  publishQuiet: true,
};
```

Create a Playwright World class `features/support/world.ts`:

```typescript
import { World, setWorldConstructor, IWorldOptions } from '@cucumber/cucumber';
import { Browser, BrowserContext, Page, chromium } from 'playwright';

export class PlaywrightWorld extends World {
  browser!: Browser;
  context!: BrowserContext;
  page!: Page;

  constructor(options: IWorldOptions) {
    super(options);
  }

  async init(): Promise<void> {
    this.browser = await chromium.launch({
      headless: true,
    });
    this.context = await this.browser.newContext();
    this.page = await this.context.newPage();
  }

  async cleanup(): Promise<void> {
    await this.page?.close();
    await this.context?.close();
    await this.browser?.close();
  }
}

setWorldConstructor(PlaywrightWorld);
```

Create Before/After hooks `features/support/hooks.ts`:

```typescript
import { Before, After, Status } from '@cucumber/cucumber';
import { PlaywrightWorld } from './world';

Before(async function (this: PlaywrightWorld) {
  await this.init();
});

After(async function (this: PlaywrightWorld, scenario) {
  if (scenario.result?.status === Status.FAILED) {
    const screenshot = await this.page.screenshot();
    this.attach(screenshot, 'image/png');
  }
  await this.cleanup();
});
```

Create an example feature file `features/example.feature`:

```gherkin
Feature: Example acceptance test
  As a user
  I want to verify the acceptance testing setup works
  So that I can write end-to-end tests

  Scenario: Application loads successfully
    Given I navigate to the application
    Then I should see the application loaded
```

Create example step definitions `features/step_definitions/example.steps.ts`:

```typescript
import { Given, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { PlaywrightWorld } from '../support/world';

Given('I navigate to the application', async function (this: PlaywrightWorld) {
  await this.page.goto('http://localhost:5173');
});

Then('I should see the application loaded', async function (this: PlaywrightWorld) {
  await expect(this.page).toHaveTitle(/data-table-spike/);
});
```

Create an HTML report generator script `scripts/generate-cucumber-report.ts` using `multiple-cucumber-html-reporter`:

```typescript
import * as fs from 'node:fs';
import * as path from 'node:path';
import reporter from 'multiple-cucumber-html-reporter';

async function main(): Promise<void> {
  const jsonPath = path.join(process.cwd(), 'reports/cucumber/report.json');

  if (!fs.existsSync(jsonPath)) {
    console.error('Error: Cucumber JSON report not found at', jsonPath);
    console.error('Run "npm run test:acceptance:report" first to generate the JSON report.');
    process.exit(1);
  }

  reporter.generate({
    jsonDir: 'reports/cucumber',
    reportPath: 'reports/cucumber/html',
    pageTitle: 'Data Table Spike - Acceptance Test Report',
    reportName: 'Acceptance Test Report',
    displayDuration: true,
    displayReportTime: true,
    metadata: {
      browser: {
        name: 'chromium',
        version: 'latest',
      },
      device: 'Local Machine',
      platform: {
        name: process.platform,
        version: process.version,
      },
    },
  });

  console.log('HTML report generated: reports/cucumber/html/index.html');
}

main().catch((error) => {
  console.error('Error generating report:', error);
  process.exit(1);
});
```

Create a type declaration file `scripts/multiple-cucumber-html-reporter.d.ts` for TypeScript support:

```typescript
declare module 'multiple-cucumber-html-reporter' {
  interface ReportMetadata {
    browser?: { name: string; version: string };
    device?: string;
    platform?: { name: string; version: string };
  }

  interface ReportOptions {
    jsonDir: string;
    reportPath: string;
    pageTitle?: string;
    reportName?: string;
    displayDuration?: boolean;
    displayReportTime?: boolean;
    metadata?: ReportMetadata;
  }

  const reporter: { generate(options: ReportOptions): void };
  export default reporter;
}
```

Add necessary scripts to `package.json` to run acceptance tests:

```json
{
  "scripts": {
    "test:acceptance": "NODE_OPTIONS='--import tsx' cucumber-js",
    "test:acceptance:report": "NODE_OPTIONS='--import tsx' cucumber-js --format json:reports/cucumber/report.json",
    "report:generate": "NODE_OPTIONS='--import tsx' npx tsx scripts/generate-cucumber-report.ts",
    "test:acceptance:html": "npm run test:acceptance:report && npm run report:generate"
  }
}
```

Note: The `cucumber.js` configuration file specifies the import paths, so they don't need to be repeated in the CLI commands.

To run acceptance tests, start the dev server first:

```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Run acceptance tests
npm run test:acceptance
```

Update `.gitignore` to exclude reports directory:

```
# Test reports
reports/
```

Create a feature branch for this work off of the main branch.
Commit the changes with a descriptive message.
Create a PR from the feature branch that will be merged into the main branch after review.

## Zustand

Install Zustand for state management.

Zustand is a lightweight, flexible state management library for React that provides a simple API with minimal boilerplate.

Add the following dependency:

- `zustand` - Lightweight state management library

Create the directory structure for stores:

```
src/
└── stores/
```

Example store `src/stores/useCounterStore.ts`:

```typescript
import { create } from 'zustand';

interface CounterState {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
}

export const useCounterStore = create<CounterState>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }),
}));
```

Example usage in a component:

```tsx
import { useCounterStore } from '../stores/useCounterStore';

function Counter() {
  const { count, increment, decrement, reset } = useCounterStore();

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
}
```

For stores with persistence, use the `persist` middleware:

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'light',
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'settings-storage',
    }
  )
);
```

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
