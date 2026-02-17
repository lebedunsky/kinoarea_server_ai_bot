import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

const API_URL = "https://router.huggingface.co/v1/chat/completions";

app.post("/ai", async (req, res) => {
  try {
    const { message, userMovies } = req.body;

    // Контекст користувача
    const userContext = userMovies?.length
      ? `Улюблені або переглянуті фільми користувача: ${userMovies.join(", ")}.`
      : "Користувач поки що не має переглянутих фільмів.";

    // Формуємо чат-повідомлення для AI
    const messages = [
      {
        role: "system",
        content: `
Ти AI асистент онлайн-кінотеатру KinoArea.
Твої задачі:
- рекомендувати фільми на основі вподобань користувача та популярності
- давати списки фільмів по жанру або настрою
- відповідати українською
- форматувати відповідь у JSON:
{
  "recommendations": [
    {"title": "Назва фільму", "genre": "жанр"}
  ]
}
- не пояснювати як ти працюєш
        `,
      },
      {
        role: "user",
        content: `${userContext}\nКористувач: ${message}`,
      },
    ];

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HF_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "mistralai/Mistral-7B-Instruct-v0.2",
        messages,
        parameters: {
          max_new_tokens: 200,
          temperature: 0.7,
          top_p: 0.9,
        },
      }),
    });

    const data = await response.json();
    const aiRaw = data.choices?.[0]?.message?.content || "{}";

    let aiMessage;
    try {
      aiMessage = JSON.parse(aiRaw);
    } catch {
      aiMessage = { recommendations: [{ title: aiRaw, genre: "невідомий" }] };
    }

    res.json({ message: aiMessage });

  } catch (err) {
    console.error("SERVER ERROR:", err);
    res.status(500).json({ error: "AI request failed" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log("Server running on", PORT));
