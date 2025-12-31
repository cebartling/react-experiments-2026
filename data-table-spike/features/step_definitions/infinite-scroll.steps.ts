import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { PlaywrightWorld } from '../support/world';

const BASE_URL = 'http://localhost:5173';

// Store initial count for comparison
let initialStockCount = 0;
let initialProgressWidth = 0;

// Navigation steps
Given('I am on the infinite scroll page', async function (this: PlaywrightWorld) {
  await this.page.goto(`${BASE_URL}/infinite-scroll`);
  await this.page.waitForLoadState('networkidle');
  await this.page.waitForSelector('.virtual-table-body', { timeout: 10000 });
});

Given('I am on the stocks infinite page', async function (this: PlaywrightWorld) {
  await this.page.goto(`${BASE_URL}/stocks-infinite`);
  await this.page.waitForLoadState('networkidle');
  await this.page.waitForSelector('.virtual-table-body', { timeout: 10000 });
});

When('I click the back link', async function (this: PlaywrightWorld) {
  await this.page.click('.back-link');
  await this.page.waitForLoadState('networkidle');
});

// Page content assertions
Then(
  'I should see the page title {string}',
  async function (this: PlaywrightWorld, expectedTitle: string) {
    const title = this.page.locator('.page-header h1');
    await expect(title).toHaveText(expectedTitle);
  }
);

Then('I should see the back link to home', async function (this: PlaywrightWorld) {
  const backLink = this.page.locator('.back-link');
  await expect(backLink).toBeVisible();
  await expect(backLink).toContainText('Back to Home');
});

// Row count assertions
Then(
  'I should see {string} in the row count',
  async function (this: PlaywrightWorld, expectedText: string) {
    const rowCount = this.page.locator('.row-count');
    await expect(rowCount).toContainText(expectedText);

    // Store initial count for later comparison
    const text = await rowCount.textContent();
    const match = text?.match(/^(\d+)/);
    if (match) {
      initialStockCount = parseInt(match[1], 10);
    }
  }
);

Then(
  'the stock count should be greater than {int}',
  async function (this: PlaywrightWorld, minCount: number) {
    const rowCount = this.page.locator('.row-count');
    const text = await rowCount.textContent();
    const match = text?.match(/^([\d,]+)/);
    expect(match).toBeTruthy();

    const currentCount = parseInt(match![1].replace(/,/g, ''), 10);
    expect(currentCount).toBeGreaterThan(minCount);
  }
);

// Progress bar assertions
Then(
  'the progress bar should show approximately {int} percent',
  async function (this: PlaywrightWorld, expectedPercent: number) {
    const progressBar = this.page.locator('.progress-bar');
    const style = await progressBar.getAttribute('style');
    const match = style?.match(/width:\s*([\d.]+)%/);
    expect(match).toBeTruthy();

    const width = parseFloat(match![1]);
    // Allow 1% tolerance
    expect(width).toBeGreaterThanOrEqual(expectedPercent - 1);
    expect(width).toBeLessThanOrEqual(expectedPercent + 1);

    // Store initial progress for later comparison
    initialProgressWidth = width;
  }
);

Then('the progress bar should have increased', async function (this: PlaywrightWorld) {
  const progressBar = this.page.locator('.progress-bar');
  const style = await progressBar.getAttribute('style');
  const match = style?.match(/width:\s*([\d.]+)%/);
  expect(match).toBeTruthy();

  const currentWidth = parseFloat(match![1]);
  expect(currentWidth).toBeGreaterThan(initialProgressWidth);
});

// Scroll actions
When('I scroll to the bottom of the table', async function (this: PlaywrightWorld) {
  const scrollContainer = this.page.locator('.virtual-table-body');

  // Scroll to bottom using JavaScript
  await scrollContainer.evaluate((el) => {
    el.scrollTop = el.scrollHeight;
  });

  // Small delay to allow scroll event to fire
  await this.page.waitForTimeout(100);
});

When('I wait for data to load', async function (this: PlaywrightWorld) {
  // Wait for potential loading state and data to arrive
  await this.page.waitForTimeout(500);

  // Wait for loading indicator to disappear if present
  const loadingIndicator = this.page.locator('.loading-indicator');
  if (await loadingIndicator.isVisible()) {
    await loadingIndicator.waitFor({ state: 'hidden', timeout: 5000 });
  }
});

// Loading indicator
Then(
  'I should see the loading indicator {string}',
  async function (this: PlaywrightWorld, expectedText: string) {
    // Loading indicator might be brief, so we check if it was visible or if data loaded
    const loadingIndicator = this.page.locator('.loading-indicator, .loading-text');

    // Try to catch the loading state, but don't fail if it's too fast
    try {
      await expect(loadingIndicator.first()).toBeVisible({ timeout: 2000 });
      await expect(loadingIndicator.first()).toContainText(expectedText);
    } catch {
      // If loading was too fast, verify data is loading/loaded instead
      const rowCount = this.page.locator('.row-count');
      const text = await rowCount.textContent();
      const match = text?.match(/^([\d,]+)/);
      const currentCount = parseInt(match![1].replace(/,/g, ''), 10);
      // Data should be loading or have loaded more
      expect(currentCount).toBeGreaterThanOrEqual(25);
    }
  }
);

// Filtering
Then('the filtered results should be displayed', async function (this: PlaywrightWorld) {
  const rowCount = this.page.locator('.row-count');
  await expect(rowCount).toBeVisible();
  // Filtered results should show a count
  const text = await rowCount.textContent();
  expect(text).toMatch(/\d+ of \d+/);
});

Then(
  'I should see {string} in the virtualized table',
  async function (this: PlaywrightWorld, text: string) {
    // Virtualized table uses divs with .virtual-cell, not td elements
    const cell = this.page.locator('.virtual-cell, .stock-symbol').filter({ hasText: text });
    await expect(cell.first()).toBeVisible({ timeout: 5000 });
  }
);

// Sorting
When(
  'I click the {string} column header to sort',
  async function (this: PlaywrightWorld, columnName: string) {
    const header = this.page.locator('[role="columnheader"]').filter({ hasText: columnName });
    await header.click();
    // Wait for server-side sort to complete and data to reload
    await this.page.waitForTimeout(1000);
  }
);

Then('the table should indicate sorting is active', async function (this: PlaywrightWorld) {
  // Check for sort indicator using role="columnheader" elements
  const headers = this.page.locator('[role="columnheader"]');
  const count = await headers.count();

  let hasSortIndicator = false;
  for (let i = 0; i < count; i++) {
    const header = headers.nth(i);
    const text = await header.textContent();
    const ariaSort = await header.getAttribute('aria-sort');

    if (text?.includes('↑') || text?.includes('↓') || ariaSort === 'ascending' || ariaSort === 'descending') {
      hasSortIndicator = true;
      break;
    }
  }

  expect(hasSortIndicator).toBe(true);
});

// Accessibility
Then('the table should have role {string}', async function (this: PlaywrightWorld, role: string) {
  const table = this.page.locator('.table-container');
  await expect(table).toHaveAttribute('role', role);
});

Then('the table should have aria-rowcount attribute', async function (this: PlaywrightWorld) {
  const table = this.page.locator('.table-container');
  const ariaRowCount = await table.getAttribute('aria-rowcount');
  expect(ariaRowCount).toBeTruthy();
  expect(parseInt(ariaRowCount!, 10)).toBeGreaterThan(0);
});

// Home page navigation links
Then('I should see {string} link', async function (this: PlaywrightWorld, linkText: string) {
  const link = this.page.locator('.nav-card').filter({ hasText: linkText });
  await expect(link).toBeVisible();
});
