import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

const API_URL =
  "https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta";


const SYSTEM_PROMPT = `
Ти AI асистент сайту KinoArea.

Твої задачі:
- допомагати з фільмами
- рекомендувати кіно
- відповідати коротко
- писати українською
- не говорити що ти не маєш доступу до інтернету
- не пояснювати як ти працюєш

Якщо просять список — давай список.
`;

app.post("/ai", async (req, res) => {
  try {
    const { message, userMovies } = req.body;

    const userContext = userMovies?.length
      ? `Улюблені фільми користувача: ${userMovies.join(", ")}`
      : "";

    const prompt = `
${SYSTEM_PROMPT}

${userContext}

Користувач: ${message}
Асистент:
`;

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HF_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 300,
          temperature: 0.7,
        },
      }),
    });

    const text = await response.text();

    if (!response.ok) {
      console.error("HF ERROR:", text);
      return res.status(500).json({ error: text });
    }

    const data = JSON.parse(text);

    const aiMessage =
      data?.[0]?.generated_text?.replace(prompt, "") ||
      "Сталася помилка генерації";

    res.json({ message: aiMessage });

  } catch (err) {
    console.error("SERVER ERROR:", err);
    res.status(500).json({ error: "AI request failed" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log("Server running on", PORT));
