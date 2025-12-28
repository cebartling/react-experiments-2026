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

Install Tailwind CSS for utility-first CSS styling.
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
@tailwind base;
@tailwind components;
@tailwind utilities;
```

Create a script in `package.json` to build Tailwind CSS.
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
