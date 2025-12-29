import { Given, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { PlaywrightWorld } from '../support/world';

Given('I navigate to the application', async function (this: PlaywrightWorld) {
  await this.page.goto('http://localhost:5173');
});

Then('I should see the application loaded', async function (this: PlaywrightWorld) {
  await expect(this.page).toHaveTitle(/Vite \+ React/);
});
