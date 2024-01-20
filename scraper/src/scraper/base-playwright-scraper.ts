import { Browser, BrowserContext, Page, chromium } from 'playwright';
import { IScraper } from './i-scraper.interface';
import { ScrapeResult } from './models/srape-result';

export abstract class BasePlaywrightScraper implements IScraper {
    browser!: Browser;
    context!: BrowserContext;
    page!: Page;

    constructor() {}

    async launch(): Promise<void> {
        this.browser = await chromium.launch({ headless: true });
        this.context = await this.browser.newContext({ javaScriptEnabled: false, geolocation: undefined });
        this.page = await this.context.newPage();
    }

    async close() {
        await this.browser.close();
    }

    abstract scrape(): ScrapeResult | Promise<ScrapeResult>;
}
