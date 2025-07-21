import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { Queue } from 'bullmq';
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GENAI_API_KEY);

const queue = new Queue("file-upload-queue", {
    connection: {
        host: 'localhost',
        port: '6379',
    },
});

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, '/uploads');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${uniqueSuffix}-${file.originalname}`);
    },
})

const upload = multer({ storage: storage });

const app = express();
app.use(cors());

app.get('/', (req, res) => {
    return res.json({ status: 'OKKKKK!' })
})

app.post('/upload/pdf', upload.single('pdf'), async (req, res) => {
    await queue.add('file-ready', JSON.stringify({
        filename: req.file.originalname,
        destination: req.file.destination,
        path: req.file.path,
    }))
    return res.json({ message: 'Uploaded' })
});

app.get('/chat', async (req, res) => {
    try {
        const userQuery = req.query.message;
        
        const embeddings = new GoogleGenerativeAIEmbeddings({
            apiKey: process.env.GENAI_API_KEY,
            model: "models/embedding-001"
        });
        const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
            url: "http://localhost:6333",
            collectionName: "langchainjs-testing",
        });
        const ret = vectorStore.asRetriever({
            k: 2
        })
        const result = await ret.invoke(userQuery);

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
        
        const SYSTEM_PROMPT = `You are helpful AI assistant who answers user query based on the available context from PDF file.
        Context: ${JSON.stringify(result)}`;

        const chatResult = await model.generateContent({
            contents: [{ 
                role: "user", 
                parts: [{ text: `${SYSTEM_PROMPT}\n\nUser query: ${userQuery}` }]
            }]
        });
        
        const response = chatResult.response;
        const responseText = response.text();

        return res.json({ message: responseText, docs: result });
    } catch (error) {
        console.error("Error in /chat endpoint:", error);
        return res.status(500).json({ error: error.message });
    }
})

app.listen(8000, () => console.log(`Server started on PORT:${8000}`))