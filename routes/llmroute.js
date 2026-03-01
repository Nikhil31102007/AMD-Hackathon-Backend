import express from "express";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const router = express.Router();

if (!process.env.HF_TOKEN) {
  throw new Error("HF_TOKEN is not defined in environment variables");
}

const client = new OpenAI({
  baseURL: "https://router.huggingface.co/v1",
  apiKey: process.env.HF_TOKEN,
});

router.post("/why", async (req, res) => {
  try {
    const { user_query, user_message, recommended_laptops } = req.body;

    // Strict validation
    if (!user_query || !user_message || !Array.isArray(recommended_laptops)) {
      return res.status(400).json({
        error: "user_query, user_message and recommended_laptops (array) are required"
      });
    }

    // Reduce prompt injection risk
    const laptopsFormatted = recommended_laptops
      .map((l, i) => {
        return `
Laptop ${i + 1}:
Brand: ${l.brand || "N/A"}
Model: ${l.model || "N/A"}
CPU: ${l.cpu || "N/A"}
GPU: ${l.gpu || "N/A"}
RAM: ${l.ram || "N/A"}
Price: ${l.price || "N/A"}
`;
      })
      .join("\n");

    const messages = [
      {
        role: "system",
        content: "You are a strict technical laptop decision advisor. Use only provided data."
      },
      {
        role: "user",
        content: `
Original Query:
${user_query}

Available Laptops:
${laptopsFormatted}

User Question:
${user_message}

Answer concisely. Do not invent specs.
`
      }
    ];

    const completion = await client.chat.completions.create({
      model: "meta-llama/Meta-Llama-3-8B-Instruct",
      messages,
      temperature: 0.2,
      max_tokens: 300
    });

    if (!completion.choices?.length) {
      return res.status(500).json({ error: "Empty model response" });
    }

    const reply = completion.choices[0].message.content;

    res.status(200).json({ reply });

  } catch (error) {
    console.error("LLM Error:", error.response?.data || error.message);
    res.status(500).json({ error: "LLM processing failed" });
  }
});

export default router;
// import express from "express";
// import axios from "axios";

// const LLM_Router = express.Router();

// LLM_Router.post("/Why", async (req, res) => {
//   const { user_query, user_message, recommended_laptops } = req.body;

//   if (!user_query || !recommended_laptops) {
//     return res.status(400).json({ error: "Missing required fields" });
//   }

//   const prompt = `
// You are a precise technical advisor.

// Use only the provided laptop data.
// Do not invent information.
// If something is missing, say "Information not available in dataset."

// Original Query:
// ${user_query}

// Laptops:
// ${JSON.stringify(recommended_laptops)}

// User Question:
// ${user_message}

// Answer clearly and concisely.
// Do not repeat unnecessary information.
// `;

//   try {
//     const response = await axios.post("http://40.81.28.120:11434/api/generate", {
//       model: "tinyllama",   // or "phi" if you pulled that
//       prompt: prompt,
//       stream: false
//     });

//     const reply = response.data.response;

//     res.json({ reply });

//   } catch (error) {
//     console.error(error.response?.data || error.message);
//     res.status(500).json({ error: "Ollama processing failed" });
//   }
// });

// export default LLM_Router;
