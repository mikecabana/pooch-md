import { ScrapeResult } from "../scraper/models/srape-result";

export interface IOutputProcessor {
    output(results: ScrapeResult): void;
}