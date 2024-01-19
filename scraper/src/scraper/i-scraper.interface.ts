import { Browser } from 'playwright';
import { ScrapeResult } from './models/srape-result';

export interface IScraper {
    launch(): void | Promise<void>;
    close(): void | Promise<void>;
    scrape(): ScrapeResult | Promise<ScrapeResult>;
}
