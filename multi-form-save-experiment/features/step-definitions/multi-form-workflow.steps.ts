import { When, Then, DataTable } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { PlaywrightWorld } from '../support/world.ts';

Then('I should see the page title {string}', async function (this: PlaywrightWorld, title: string) {
  await expect(this.page!.locator('header h1')).toContainText(title);
});

// Bulk form filling steps
When(
  'I fill in all user information fields:',
  async function (this: PlaywrightWorld, dataTable: DataTable) {
    const rows = dataTable.hashes();
    for (const row of rows) {
      const testId = `user-${row.field}-input`;
      await this.page!.fill(`[data-testid="${testId}"]`, row.value);
    }
  }
);

When('I fill in all address fields:', async function (this: PlaywrightWorld, dataTable: DataTable) {
  const rows = dataTable.hashes();
  for (const row of rows) {
    const testId = `address-${row.field}-input`;
    await this.page!.fill(`[data-testid="${testId}"]`, row.value);
  }
});

// Dirty count assertions
Then(
  'the dirty form count should show {string}',
  async function (this: PlaywrightWorld, count: string) {
    const dirtyCount = this.page!.locator('[data-testid="dirty-form-count"]');
    await expect(dirtyCount).toContainText(count);
  }
);

Then('I should not see the dirty form count indicator', async function (this: PlaywrightWorld) {
  await expect(this.page!.locator('[data-testid="dirty-form-count"]')).not.toBeVisible();
});

// Theme dropdown steps
When(
  'I select {string} in the theme dropdown',
  async function (this: PlaywrightWorld, themeLabel: string) {
    const themeMap: Record<string, string> = {
      Light: 'light',
      Dark: 'dark',
      'System default': 'system',
    };
    const value = themeMap[themeLabel] || themeLabel.toLowerCase();
    await this.page!.selectOption('[data-testid="pref-theme-select"]', value);
  }
);

Then(
  'the theme dropdown should show {string}',
  async function (this: PlaywrightWorld, expectedLabel: string) {
    const themeMap: Record<string, string> = {
      Light: 'light',
      Dark: 'dark',
      'System default': 'system',
    };
    const expectedValue = themeMap[expectedLabel] || expectedLabel.toLowerCase();
    await expect(this.page!.locator('[data-testid="pref-theme-select"]')).toHaveValue(
      expectedValue
    );
  }
);

// Field content verification
Then(
  'the user name field should contain {string}',
  async function (this: PlaywrightWorld, value: string) {
    await expect(this.page!.locator('[data-testid="user-name-input"]')).toHaveValue(value);
  }
);

Then(
  'the user email field should contain {string}',
  async function (this: PlaywrightWorld, value: string) {
    await expect(this.page!.locator('[data-testid="user-email-input"]')).toHaveValue(value);
  }
);

Then(
  'the address street field should contain {string}',
  async function (this: PlaywrightWorld, value: string) {
    await expect(this.page!.locator('[data-testid="address-street-input"]')).toHaveValue(value);
  }
);

// Validation error summary assertions
Then(
  'the validation error summary should include {string}',
  async function (this: PlaywrightWorld, formName: string) {
    await expect(this.page!.locator('[data-testid="error-summary"]')).toContainText(formName);
  }
);

// Header and layout assertions
Then('I should see the save all button in the header', async function (this: PlaywrightWorld) {
  await expect(this.page!.locator('header [data-testid="save-button"]')).toBeVisible();
});

Then('I should see the User Information form section', async function (this: PlaywrightWorld) {
  await expect(this.page!.locator('[data-testid="user-info-form"]')).toBeVisible();
});

Then('I should see the Address form section', async function (this: PlaywrightWorld) {
  await expect(this.page!.locator('[data-testid="address-form"]')).toBeVisible();
});

Then('I should see the Preferences form section', async function (this: PlaywrightWorld) {
  await expect(this.page!.locator('[data-testid="preferences-form"]')).toBeVisible();
});

Then(
  'the User Information form should have description {string}',
  async function (this: PlaywrightWorld, description: string) {
    const form = this.page!.locator('[data-testid="user-info-form"]');
    await expect(form.locator('p')).toContainText(description);
  }
);

Then(
  'the Address form should have description {string}',
  async function (this: PlaywrightWorld, description: string) {
    const form = this.page!.locator('[data-testid="address-form"]');
    await expect(form.locator('p')).toContainText(description);
  }
);

Then(
  'the Preferences form should have description {string}',
  async function (this: PlaywrightWorld, description: string) {
    const form = this.page!.locator('[data-testid="preferences-form"]');
    await expect(form.locator('p')).toContainText(description);
  }
);
