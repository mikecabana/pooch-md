import { ScrapeResult } from '../scraper/models/srape-result';
import { IOutputProcessor } from './i-output-processor';
import fs, { Mode } from 'fs';

export class CsvOutputProcessor implements IOutputProcessor {
    output(results: ScrapeResult): void {
        const lines: string[] = [];
        const csvFilePath = 'output.csv';

        for (const block of results.blocks) {
            const line = block.join(',');
            lines.push(line);
        }

        const data = lines.join('\n');

        fs.writeFile(csvFilePath, data, (err) => {
            if (err) {
                console.error('Error writing to CSV file:', err);
            } else {
                console.log(`CSV data has been written to ${csvFilePath}`);
            }
        });
    }
}
