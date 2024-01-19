export class ScrapeResult {
    constructor(public blocks: string[][]) {}
    
    add(block: string[]): ScrapeResult {
        this.blocks.push(block);
        return this;
    }
}
