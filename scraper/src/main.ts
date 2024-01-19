import { ConsoleOutputProcessor } from './output/console-output-processor';
import { CsvOutputProcessor } from './output/csv-output-processor';
import { IOutputProcessor } from './output/i-output-processor';
import { TextOutputProcessor } from './output/text-output-processor';
import { IScraper } from './scraper/i-scraper.interface';
import { WebMDDogSymptomsScraper } from './scraper/webmd-dog-symptoms-scraper';

(async () => {
    const dogSymptomScraper: IScraper = new WebMDDogSymptomsScraper();
    // const consoleOutputProcessor: IOutputProcessor = new ConsoleOutputProcessor();
    // const textOutputProcessor: IOutputProcessor = new TextOutputProcessor();
    const csvOutputProcessor: IOutputProcessor = new CsvOutputProcessor();

    await dogSymptomScraper.launch();

    const results = await dogSymptomScraper.scrape();

    // consoleOutputProcessor.output(results);
    // textOutputProcessor.output(results);
    csvOutputProcessor.output(results);

    console.log('Done');
})();
