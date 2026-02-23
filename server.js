import express from "express";
import axios from "axios";
import cors from 'cors';
import LLM_Router from "./routes/llmroute.js";
const app = express();

app.use(cors({
  origin: "https://amd-hackathon-frontend-git-main-nikhil20073110-4360s-projects.vercel.app",  // your frontend URL
    methods: ["GET", "POST"],
    credentials: true
}));

app.use(express.json());
//uvicorn api:app --reload
app.get("/", (req, res) => {
    res.json({
        message : "Server is running"
    });
});

app.post("/api/recommend", async (req, res) => {
    try {
        const response = await axios.post(
            "https://amd-slingshot-hackathon.onrender.com/recommend",
            req.body
        );

        res.json(response.data);

    } catch (error) {
        res.status(500).json({ error: "ML service error" });
    }
});

const port = 5000;

app.use("/api/llm", LLM_Router);

app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
})