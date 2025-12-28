import { World, IWorldOptions, setWorldConstructor } from '@cucumber/cucumber';
import { Browser, BrowserContext, Page, chromium } from '@playwright/test';

export interface CustomWorld extends World {
  browser: Browser | null;
  context: BrowserContext | null;
  page: Page | null;
}

export class PlaywrightWorld extends World implements CustomWorld {
  browser: Browser | null = null;
  context: BrowserContext | null = null;
  page: Page | null = null;

  constructor(options: IWorldOptions) {
    super(options);
  }

  async init(): Promise<void> {
    this.browser = await chromium.launch({
      headless: process.env.HEADLESS !== 'false',
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
