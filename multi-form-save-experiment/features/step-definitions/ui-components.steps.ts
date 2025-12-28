import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { PlaywrightWorld } from '../support/world.ts';

const BASE_URL = 'http://localhost:5173';

Given('I am on the multi-form editor page', async function (this: PlaywrightWorld) {
  await this.page!.goto(BASE_URL);
  await this.page!.waitForSelector('[data-testid="parent-container"]');
});

// Form visibility assertions
Then('I should see the User Information form', async function (this: PlaywrightWorld) {
  await expect(this.page!.locator('[data-testid="user-info-form"]')).toBeVisible();
});

Then('I should see the Address form', async function (this: PlaywrightWorld) {
  await expect(this.page!.locator('[data-testid="address-form"]')).toBeVisible();
});

Then('I should see the Preferences form', async function (this: PlaywrightWorld) {
  await expect(this.page!.locator('[data-testid="preferences-form"]')).toBeVisible();
});

// Global save button assertions (unique to avoid conflict with dirty-state.steps.ts)
Then('the global save button should be disabled', async function (this: PlaywrightWorld) {
  await expect(this.page!.locator('[data-testid="save-button"]')).toBeDisabled();
});

Then('the global save button should be enabled', async function (this: PlaywrightWorld) {
  await expect(this.page!.locator('[data-testid="save-button"]')).toBeEnabled();
});

// Form field interactions - User Info
When(
  'I fill in the user name field with {string}',
  async function (this: PlaywrightWorld, value: string) {
    await this.page!.fill('[data-testid="user-name-input"]', value);
  }
);

When(
  'I fill in the user email field with {string}',
  async function (this: PlaywrightWorld, value: string) {
    await this.page!.fill('[data-testid="user-email-input"]', value);
  }
);

// Form field interactions - Address
When(
  'I fill in the address street field with {string}',
  async function (this: PlaywrightWorld, value: string) {
    await this.page!.fill('[data-testid="address-street-input"]', value);
  }
);

When(
  'I fill in the address city field with {string}',
  async function (this: PlaywrightWorld, value: string) {
    await this.page!.fill('[data-testid="address-city-input"]', value);
  }
);

When(
  'I fill in the address state field with {string}',
  async function (this: PlaywrightWorld, value: string) {
    await this.page!.fill('[data-testid="address-state-input"]', value);
  }
);

When(
  'I fill in the address zip field with {string}',
  async function (this: PlaywrightWorld, value: string) {
    await this.page!.fill('[data-testid="address-zip-input"]', value);
  }
);

// Form field interactions - Preferences
When(
  'I select {string} in the notifications dropdown',
  async function (this: PlaywrightWorld, optionLabel: string) {
    const optionMap: Record<string, string> = {
      'All notifications': 'all',
      'Important only': 'important',
      None: 'none',
    };
    const value = optionMap[optionLabel] || optionLabel.toLowerCase();
    await this.page!.selectOption('[data-testid="pref-notifications-select"]', value);
  }
);

When('I check the newsletter checkbox', async function (this: PlaywrightWorld) {
  await this.page!.check('[data-testid="pref-newsletter-checkbox"]');
});

// Button clicks
When('I click the global save button', async function (this: PlaywrightWorld) {
  await this.page!.click('[data-testid="save-button"]');
});

When('I click the dismiss error button', async function (this: PlaywrightWorld) {
  await this.page!.click('[data-testid="error-summary"] button[aria-label="Dismiss errors"]');
});

// Dirty form count
Then('I should see the dirty form count indicator', async function (this: PlaywrightWorld) {
  await expect(this.page!.locator('[data-testid="dirty-form-count"]')).toBeVisible();
});

// Validation error summary assertions (unique to avoid conflict with validation.steps.ts)
Then('I should see the validation error summary', async function (this: PlaywrightWorld) {
  await expect(this.page!.locator('[data-testid="error-summary"]')).toBeVisible();
});

Then('I should not see the validation error summary', async function (this: PlaywrightWorld) {
  await expect(this.page!.locator('[data-testid="error-summary"]')).not.toBeVisible();
});

Then(
  'the validation error summary should mention validation errors',
  async function (this: PlaywrightWorld) {
    await expect(this.page!.locator('[data-testid="error-summary"]')).toContainText(
      'Validation Errors'
    );
  }
);

// Notification assertions
Then('I should see a success notification', async function (this: PlaywrightWorld) {
  await expect(this.page!.locator('[data-testid="notification-list"]')).toBeVisible();
  await expect(this.page!.locator('[data-testid="notification-list"]')).toContainText('Saved');
});

// Label assertions
Then(
  'the user name field should have a label {string}',
  async function (this: PlaywrightWorld, labelText: string) {
    const label = this.page!.locator('label[for="user-name"]');
    await expect(label).toContainText(labelText);
  }
);

Then(
  'the user email field should have a label {string}',
  async function (this: PlaywrightWorld, labelText: string) {
    const label = this.page!.locator('label[for="user-email"]');
    await expect(label).toContainText(labelText);
  }
);

Then(
  'the address street field should have a label {string}',
  async function (this: PlaywrightWorld, labelText: string) {
    const label = this.page!.locator('label[for="address-street"]');
    await expect(label).toContainText(labelText);
  }
);

// Required field assertions
Then('the user name field should be marked as required', async function (this: PlaywrightWorld) {
  const label = this.page!.locator('label[for="user-name"]');
  await expect(label.locator('span.text-red-500')).toBeVisible();
});

Then('the user email field should be marked as required', async function (this: PlaywrightWorld) {
  const label = this.page!.locator('label[for="user-email"]');
  await expect(label.locator('span.text-red-500')).toBeVisible();
});

Then(
  'the address street field should be marked as required',
  async function (this: PlaywrightWorld) {
    const label = this.page!.locator('label[for="address-street"]');
    await expect(label.locator('span.text-red-500')).toBeVisible();
  }
);
