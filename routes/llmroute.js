// import express from "express";
// import dotenv from "dotenv";
// import { OpenAI } from "openai";

// dotenv.config();

// const LLM_Router = express.Router();

// const client = new OpenAI({
// baseURL: "https://router.huggingface.co/v1",
// apiKey: process.env.HF_TOKEN,
// });

// LLM_Router.post("/Why", async (req, res) => {
// const { user_query, user_message, recommended_laptops } = req.body;

// if (!user_query || !recommended_laptops) {
//     return res.status(400).json({ error: "Missing required fields" });
// }

// const prompt = `
// You are a precise technical advisor.

// Use only the provided laptop data.
// Do not invent information.

// Original Query:
// "${user_query}"

// Laptops:
// ${JSON.stringify(recommended_laptops)}

// User Question:
// "${user_message}"

// Answer directly and concisely.
// Do not restate the entire recommendation unless necessary.
// `;

// try {
//     const completion = await client.chat.completions.create({
//     model: "mistralai/Mistral-7B-Instruct-v0.2",
//     messages: [
//         { role: "system", content: "You are a strict technical decision advisor." },
//         { role: "user", content: prompt }
//     ] 
//     });

//     const reply = completion.choices[0].message.content;

//     res.json({ reply });

// } catch (error) {
//     console.error(error.response?.data || error.message);
//     res.status(500).json({ error: "LLM processing failed" });
// }
// });

// export default LLM_Router;

import express from "express";
import axios from "axios";

const LLM_Router = express.Router();

LLM_Router.post("/Why", async (req, res) => {
  const { user_query, user_message, recommended_laptops } = req.body;

  if (!user_query || !recommended_laptops) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const prompt = `
You are a precise technical advisor.

Use only the provided laptop data.
Do not invent information.
If something is missing, say "Information not available in dataset."

Original Query:
${user_query}

Laptops:
${JSON.stringify(recommended_laptops)}

User Question:
${user_message}

Answer clearly and concisely.
Do not repeat unnecessary information.
`;

  try {
    const response = await axios.post("http://40.81.28.120:11434/api/generate", {
      model: "tinyllama",   // or "phi" if you pulled that
      prompt: prompt,
      stream: false
    });

    const reply = response.data.response;

    res.json({ reply });

  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Ollama processing failed" });
  }
});

export default LLM_Router;
