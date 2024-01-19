# Pooch MD

```terminal
npm install
```

## 1. environment

set your environment variables in `.env`

## 2. scraper

run the scrapper first. If you need to scrape a new source, create a new scraper class that implements `IScraper`. If you need a different output processor, create a new class that implements `IOutputProcessor`. Then just configure `main.ts` to use those. By default, `https://www.webmd.com/pets/dogs/symptoms` is scraped and data is recorded to `output.csv`. You may have to change the selectors (`symptomSelector`, `symptomContentSelector`) if the website you're scraping has been updated recently.

```terminal
npm run start:scraper
```

## 3. bot

if running for the first time, run the bot in create mode which will create the vector database index and update. it'll look for the output file in the root of the bot directory so for now you need to manually copy paste the output file from /scraper to /bot.

```terminal
npm run start:bot -- CREATE
```

alternatively you can just run the normal command if you've already built the vector database.

```terminal
npm run start:bot
```

## 4. web

[WIP]

playing around with WebSockets and chat instances for live Q&A with the bot.
