import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const API_URL = "https://router.huggingface.co/hf-inference/models/gpt2";

app.post("/ai", async (req, res) => {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HF_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: req.body.message,
      }),
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("HF ERROR:", err); 
    res.status(500).json({ error: "AI request failed" });
  }
});

app.listen(3001, () => {
  console.log("AI server running on http://localhost:3001");
});
