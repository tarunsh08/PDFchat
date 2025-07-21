import { Worker } from "bullmq";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import dotenv from "dotenv";
dotenv.config();

const worker = new Worker(
    'file-upload-queue',
    async (job) => {
        console.log(`Job:`, job.data);
        const data = JSON.parse(job.data)

        const loader = new PDFLoader(data.path);
        const docs = await loader.load();
        
        const embeddings = new GoogleGenerativeAIEmbeddings({
            apiKey: process.env.GENAI_API_KEY, 
            model: "models/embedding-001" 
        });
          
        const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
            url: "http://localhost:6333",
            collectionName: "langchainjs-testing",
        });
        await vectorStore.addDocuments(docs);
        console.log('All docs added')
    },
    { concurrency: 100, connection: {
        host: 'localhost',
        port: '6379',
    }}
);