import { Pinecone } from '@pinecone-database/pinecone';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { OpenAI } from 'langchain/llms/openai';
import { loadQAStuffChain } from 'langchain/chains';
import { Document } from 'langchain/document';

let pineconeClient: Pinecone;

export const initPinecone = () => {
    pineconeClient = new Pinecone({
        apiKey: `${process.env.PINECONE_API_KEY}`,
        environment: `${process.env.PINECONE_ENVIRONMENT}`,
    });
};

export const queryPineconeVectorStoreAndQueryLLM = async (question: string) => {
    const indexName = 'pooch-md';
    // 3. Start query process
    // console.log('Querying Pinecone vector store...');
    // 4. Retrieve the Pinecone index
    const index = pineconeClient.Index(indexName);
    // 5. Create query embedding
    const queryEmbedding = await new OpenAIEmbeddings().embedQuery(question);
    // 6. Query Pinecone index and return top 10 matches
    let queryResponse = await index.query({
        topK: 10,
        vector: queryEmbedding,
        includeMetadata: true,
        includeValues: true,
    });
    // 7. Log the number of matches
    // console.log(`Found ${queryResponse.matches?.length} matches...`);
    // 8. Log the question being asked
    // console.log(`Asking question: ${question}...`);
    if (queryResponse.matches?.length) {
        // 9. Create an OpenAI instance and load the QAStuffChain
        const llm = new OpenAI({});
        const chain = loadQAStuffChain(llm);
        // 10. Extract and concatenate page content from matched documents
        const concatenatedPageContent = queryResponse.matches
            .map((match) => (match.metadata as any).pageContent)
            .join(' ');
        // 11. Execute the chain with input documents and question
        const result = await chain.call({
            input_documents: [new Document({ pageContent: concatenatedPageContent })],
            question: question,
        });
        // 12. Log the answer
        return result.text as string;
    } else {
        // 13. Log that there are no matches, so GPT-3 will not be queried
        console.log('Since there are no matches, GPT-3 will not be queried.');
        return;
    }
};
