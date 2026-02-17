import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

const API_URL = "https://router.huggingface.co/v1/chat/completions";

app.post("/ai", async (req, res) => {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HF_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "mistralai/Mistral-7B-Instruct-v0.2",
        messages: [
          {
            role: "user",
            content: req.body.message,
          },
        ],
      }),
    });

    const data = await response.json();

    res.json(data);

  } catch (err) {
    console.error("SERVER ERROR:", err);
    res.status(500).json({ error: "AI request failed" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log("Server running on", PORT));
