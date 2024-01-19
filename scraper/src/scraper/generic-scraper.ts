import { BasePlaywrightScraper } from './base-playwright-scraper';
import { ScrapeResult } from './models/srape-result';

export class GenericScraper extends BasePlaywrightScraper {
    async scrape(url: string, selectors: string[]): Promise<ScrapeResult> {
        const results = new ScrapeResult([]);

        await this.page.goto(url);

        for (const selector of selectors) {
            const els = await this.page.$$(selector);
            for (const el of els) {
                const block = await el.innerText();
                results.add([block]);
            }
        }

        await this.close();

        return results;
    }
}
