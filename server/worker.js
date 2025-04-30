import { Worker } from "bullmq";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { Document } from "@langchain/core/documents";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";

const worker = new Worker(
    'file-upload-queue',
    async (job) => {
        console.log(`Job:`, job.data);
        const data = JSON.parse(job.data)

        const loader = new PDFLoader(data.path);
        const docs = await loader.load();
        
        const embeddings = new GoogleGenerativeAIEmbeddings({
            apiKey: "AIzaSyD9SSfohPn-EODXUzs-Yminqyg4H1UBTuA", 
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