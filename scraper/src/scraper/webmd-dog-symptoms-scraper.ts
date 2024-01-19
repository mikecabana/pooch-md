import { BasePlaywrightScraper } from './base-playwright-scraper';
import { ScrapeResult } from './models/srape-result';

export class WebMDDogSymptomsScraper extends BasePlaywrightScraper {
    symptomLinks = new Map<string, string>();
    symptomContent = new Map<string, string[]>();

    addSymptomLink(id: string, link: string): void {
        if (!this.symptomLinks.has(id)) {
            this.symptomLinks.set(id, link);
        }
    }

    addSymptomContent(id: string, content: string[]): void {
        if (!this.symptomContent.has(id)) {
            this.symptomContent.set(id, content);
        }
    }

    async scrape(): Promise<ScrapeResult> {
        const url = 'https://www.webmd.com/pets/dogs/symptoms';
        const symptomSelector = '#ContentPane31 > section.az-index-results.list > ul > li ul li a';
        const symptomContentSelector = '#ContentPane30 > article > div > div.article__body section';
        const results = new ScrapeResult([]);

        // go to page with list of symptoms
        await this.page.goto(url);

        const symptomEls = await this.page.$$(symptomSelector);
        for (const el of symptomEls) {
            const symptom = await el.innerText();

            const href = await el.getAttribute('href');

            if (href) {
                this.addSymptomLink(symptom, href);
            }
        }

        for (const symptom of this.symptomLinks.entries()) {
            const [id, link] = symptom;

            const directedUrl = this.page.url();
            if (directedUrl !== link) {
                await this.page.goto(link);
            }

            const sectionEls = await this.page.$$(symptomContentSelector);

            const contents: string[] = [];
            for (const sectionEl of sectionEls) {
                const section = await sectionEl.innerText();
                contents.push(section.replaceAll('\n', '').trim());
            }

            this.addSymptomContent(id, contents);
            results.add([id, link, directedUrl, ...contents]);
        }

        await this.close();

        return results;
    }
}
