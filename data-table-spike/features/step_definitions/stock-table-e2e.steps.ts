import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { PlaywrightWorld } from '../support/world';

const BASE_URL = 'http://localhost:5173';

Given('the application is running', async function (this: PlaywrightWorld) {
  // Application should be running via npm run dev
  // This step is a precondition reminder
});

Given('I am on the home page', async function (this: PlaywrightWorld) {
  await this.page.goto(BASE_URL);
  await this.page.waitForLoadState('networkidle');
});

Given('I am on the stock table page', async function (this: PlaywrightWorld) {
  await this.page.goto(`${BASE_URL}/stocks-read-only`);
  await this.page.waitForLoadState('networkidle');
  // Wait for data to load
  await this.page.waitForSelector('.stock-table-container', { timeout: 10000 });
});

Given('I have filtered by {string}', async function (this: PlaywrightWorld, filterText: string) {
  const searchInput = this.page.locator('input[placeholder*="Search"]');
  await searchInput.fill(filterText);
  // Wait for debounce
  await this.page.waitForTimeout(350);
});

Given(
  'I navigate to {string} with slow network',
  { timeout: 15000 },
  async function (this: PlaywrightWorld, path: string) {
    // Intercept the API request and delay it significantly
    await this.page.route('**/v1/stocks', async (route) => {
      // Hold the request for 5 seconds to ensure loading state is visible
      await new Promise((resolve) => setTimeout(resolve, 5000));
      await route.continue();
    });
    // Navigate to the page
    await this.page.goto(`${BASE_URL}${path}`, { waitUntil: 'domcontentloaded' });
    // Give React time to mount and show loading state
    await this.page.waitForTimeout(500);
  }
);

When('I click the {string} link', async function (this: PlaywrightWorld, linkText: string) {
  await this.page.click(`a:has-text("${linkText}")`);
  await this.page.waitForLoadState('networkidle');
});

When('I navigate to {string}', async function (this: PlaywrightWorld, path: string) {
  await this.page.goto(`${BASE_URL}${path}`);
  await this.page.waitForLoadState('networkidle');
  // Wait for data to load
  await this.page.waitForSelector('.stock-table-container', { timeout: 10000 });
});

// Use unique step pattern to avoid conflict with stock-table.steps.ts
When(
  'I click the {string} column to sort',
  async function (this: PlaywrightWorld, columnName: string) {
    // Use exact text matching for column names
    const header = this.page.locator('th').filter({ hasText: new RegExp(`^${columnName}`) });
    await header.click();
    // Small delay for re-render
    await this.page.waitForTimeout(100);
  }
);

When('I type {string} in the search filter', async function (this: PlaywrightWorld, text: string) {
  const searchInput = this.page.locator('input[placeholder*="Search"]');
  await searchInput.fill(text);
});

When('I wait for the filter to apply', async function (this: PlaywrightWorld) {
  // Wait for debounce (300ms) plus a small buffer
  await this.page.waitForTimeout(350);
});

When('I clear the search filter', async function (this: PlaywrightWorld) {
  const clearButton = this.page.locator('button[aria-label="Clear search"]');
  if (await clearButton.isVisible()) {
    await clearButton.click();
  } else {
    // Fallback: clear the input directly
    const searchInput = this.page.locator('input[placeholder*="Search"]');
    await searchInput.fill('');
  }
  await this.page.waitForTimeout(350);
});

Then('I should be on the {string} page', async function (this: PlaywrightWorld, path: string) {
  expect(this.page.url()).toBe(`${BASE_URL}${path}`);
});

Then('I should see the stock table', async function (this: PlaywrightWorld) {
  const table = this.page.locator('.stock-table-container');
  await expect(table).toBeVisible();
});

Then(
  'I should see {string} in the stock count',
  async function (this: PlaywrightWorld, expectedCount: string) {
    const stockCount = this.page.locator('.stock-count');
    await expect(stockCount).toContainText(expectedCount);
  }
);

Then('I should see column headers:', async function (this: PlaywrightWorld, dataTable) {
  const expectedHeaders = dataTable.raw().flat();
  for (const header of expectedHeaders) {
    // Use more specific locator for exact header text
    const headerCell = this.page.locator('th .header-content').filter({ hasText: header });
    await expect(headerCell.first()).toBeVisible();
  }
});

Then('I should see {int} stock rows', async function (this: PlaywrightWorld, expectedCount: number) {
  const rows = this.page.locator('tbody tr');
  await expect(rows).toHaveCount(expectedCount);
});

Then('I should see {string} in the table', async function (this: PlaywrightWorld, text: string) {
  const cell = this.page.locator(`td:has-text("${text}")`);
  await expect(cell.first()).toBeVisible();
});

Then('prices should be formatted as currency', async function (this: PlaywrightWorld) {
  const priceCell = this.page.locator('.price').first();
  const priceText = await priceCell.textContent();
  // Should contain $ and be formatted like $178.52
  expect(priceText).toMatch(/^\$[\d,]+\.\d{2}$/);
});

Then('volumes should be formatted with commas', async function (this: PlaywrightWorld) {
  const volumeCell = this.page.locator('.volume').first();
  const volumeText = await volumeCell.textContent();
  // Should contain commas for thousands
  expect(volumeText).toMatch(/[\d,]+/);
  expect(volumeText).toContain(',');
});

Then(
  'stocks with positive changes should have green styling',
  async function (this: PlaywrightWorld) {
    const positiveChange = this.page.locator('.change.positive').first();
    await expect(positiveChange).toBeVisible();
  }
);

Then(
  'positive change values should start with {string}',
  async function (this: PlaywrightWorld, prefix: string) {
    const positiveChange = this.page.locator('.change.positive').first();
    const text = await positiveChange.textContent();
    expect(text?.startsWith(prefix)).toBe(true);
  }
);

Then('stocks with negative changes should have red styling', async function (this: PlaywrightWorld) {
  const negativeChange = this.page.locator('.change.negative').first();
  await expect(negativeChange).toBeVisible();
});

Then(
  'the stocks should be sorted by symbol in ascending order',
  async function (this: PlaywrightWorld) {
    const symbols = await this.page.locator('.stock-symbol').allTextContents();
    const sortedSymbols = [...symbols].sort();
    expect(symbols).toEqual(sortedSymbols);
  }
);

Then(
  'the stocks should be sorted by symbol in descending order',
  async function (this: PlaywrightWorld) {
    const symbols = await this.page.locator('.stock-symbol').allTextContents();
    const sortedSymbols = [...symbols].sort().reverse();
    expect(symbols).toEqual(sortedSymbols);
  }
);

Then(
  'the stocks should be sorted by price in ascending order',
  async function (this: PlaywrightWorld) {
    const priceTexts = await this.page.locator('.price').allTextContents();
    const prices = priceTexts.map((p) => parseFloat(p.replace(/[$,]/g, '')));
    const sortedPrices = [...prices].sort((a, b) => a - b);
    expect(prices).toEqual(sortedPrices);
  }
);

Then(
  'the stocks should be sorted by price in descending order',
  async function (this: PlaywrightWorld) {
    const priceTexts = await this.page.locator('.price').allTextContents();
    const prices = priceTexts.map((p) => parseFloat(p.replace(/[$,]/g, '')));
    const sortedPrices = [...prices].sort((a, b) => b - a);
    expect(prices).toEqual(sortedPrices);
  }
);

Then(
  'the Symbol column should indicate ascending sort',
  async function (this: PlaywrightWorld) {
    const symbolHeader = this.page.locator('th').filter({ hasText: /^Symbol/ });
    // Check for aria-sort or sort indicator
    const ariaSort = await symbolHeader.getAttribute('aria-sort');
    if (ariaSort) {
      expect(ariaSort).toBe('ascending');
    } else {
      // Check for visual indicator (↑)
      const headerText = await symbolHeader.textContent();
      expect(headerText).toContain('↑');
    }
  }
);

Then(
  'the Symbol column should indicate descending sort',
  async function (this: PlaywrightWorld) {
    const symbolHeader = this.page.locator('th').filter({ hasText: /^Symbol/ });
    const ariaSort = await symbolHeader.getAttribute('aria-sort');
    if (ariaSort) {
      expect(ariaSort).toBe('descending');
    } else {
      const headerText = await symbolHeader.textContent();
      expect(headerText).toContain('↓');
    }
  }
);

Then('I should see 1 stock row', async function (this: PlaywrightWorld) {
  const rows = this.page.locator('tbody tr');
  await expect(rows).toHaveCount(1);
});

Then('I should see {string}', async function (this: PlaywrightWorld, text: string) {
  const element = this.page.locator(`text="${text}"`);
  await expect(element).toBeVisible();
});

Then('the search filter should be cleared', async function (this: PlaywrightWorld) {
  const searchInput = this.page.locator('input[placeholder*="Search"]');
  await expect(searchInput).toHaveValue('');
});

Then(
  'the table should have sortable column headers with button role',
  async function (this: PlaywrightWorld) {
    const sortableHeaders = this.page.locator('th.sortable');
    const count = await sortableHeaders.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const header = sortableHeaders.nth(i);
      // Check for cursor pointer or role button
      const cursor = await header.evaluate((el) => getComputedStyle(el).cursor);
      expect(cursor).toBe('pointer');
    }
  }
);

Then(
  'sort indicators should be hidden from screen readers',
  async function (this: PlaywrightWorld) {
    const sortIndicators = this.page.locator('.sort-indicator');
    const count = await sortIndicators.count();

    for (let i = 0; i < count; i++) {
      const indicator = sortIndicators.nth(i);
      const ariaHidden = await indicator.getAttribute('aria-hidden');
      expect(ariaHidden).toBe('true');
    }
  }
);

Then('I should see a loading indicator', async function (this: PlaywrightWorld) {
  const loadingState = this.page.locator('[role="status"]');
  await expect(loadingState).toBeVisible({ timeout: 2000 });
});

Then(
  'the loading indicator should have proper accessibility attributes',
  async function (this: PlaywrightWorld) {
    const loadingState = this.page.locator('[role="status"]');
    const ariaLabel = await loadingState.getAttribute('aria-label');
    expect(ariaLabel).toBeTruthy();
  }
);
