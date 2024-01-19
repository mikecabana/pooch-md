import { ScrapeResult } from '../scraper/models/srape-result';
import { IOutputProcessor } from './i-output-processor';
import fs from 'fs';

export class TextOutputProcessor implements IOutputProcessor {
    output(results: ScrapeResult): void {
        const lines: string[] = [];
        const textFilePath = 'output.txt';

        for (const block of results.blocks) {

            const [a, b, c, ...theRest ] = block;
            const line = theRest.join('\n');
            lines.push(line);
        }

        const data = lines.join('\n');

        fs.writeFile(textFilePath, data, (err) => {
            if (err) {
                console.error('Error writing to text file:', err);
            } else {
                console.log(`Text data has been written to ${textFilePath}`);
            }
        });
    }
}
