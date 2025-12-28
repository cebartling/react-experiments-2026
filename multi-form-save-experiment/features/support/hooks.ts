import { Before, After, BeforeAll, AfterAll, Status } from '@cucumber/cucumber';
import { PlaywrightWorld } from './world.ts';

BeforeAll(async function () {
  // Global setup before all scenarios
});

Before(async function (this: PlaywrightWorld) {
  await this.init();
});

After(async function (this: PlaywrightWorld, scenario) {
  // Take screenshot on failure
  if (scenario.result?.status === Status.FAILED && this.page) {
    const screenshot = await this.page.screenshot();
    this.attach(screenshot, 'image/png');
  }
  await this.cleanup();
});

AfterAll(async function () {
  // Global cleanup after all scenarios
});
