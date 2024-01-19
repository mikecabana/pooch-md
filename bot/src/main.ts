import { Pinecone } from '@pinecone-database/pinecone';
// import { CSVLoader } from 'langchain/document_loaders/fs/csv';
import dotenv from 'dotenv';

import { createPineconeIndex } from './create-pinecone-index';
import { updatePinecone } from './update-pinecone';
import { queryPineconeVectorStoreAndQueryLLM } from './query-pinecone-and-query-gpt';

import readline from 'readline';
import { CSVLoader } from 'langchain/document_loaders/fs/csv';

if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
}

const vectorDimension = 1536;
const shouldCreate = process.argv.includes('CREATE');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

(async () => {
    const indexName = 'pooch-md';
    
    const client = new Pinecone({
        apiKey: `${process.env.PINECONE_API_KEY}`,
        environment: `${process.env.PINECONE_ENVIRONMENT}`,
    });
    
    if (shouldCreate) {
        const loader = new CSVLoader('output.csv');
        const docs = await loader.load();
        await createPineconeIndex(client, indexName, vectorDimension);
        await updatePinecone(client, indexName, docs);
    }

    console.clear();

    rl.question('What is your question?\n', async (input) => {
        const answer = await queryPineconeVectorStoreAndQueryLLM(client, indexName, input);
        if (answer) {
            console.log(answer);
        }
        rl.close();
    });
})();
