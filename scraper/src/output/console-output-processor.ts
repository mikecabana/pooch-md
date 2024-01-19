import { ScrapeResult } from '../scraper/models/srape-result';
import { IOutputProcessor } from './i-output-processor';

export class ConsoleOutputProcessor implements IOutputProcessor {
    output(results: ScrapeResult): void {
        const lines: string[] = [];

        for (const block of results.blocks) {
            const line = block.join(',');
            lines.push(line);
        }

        for (const line of lines) {
            console.log(line);
        }
    }
}
