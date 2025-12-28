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
@import "tailwindcss";
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

Install vitest and React testing library for unit testing.
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
