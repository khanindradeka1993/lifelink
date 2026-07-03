export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ reply: "Method not allowed" });
  }

  const { question } = req.body;

  try {
  const key = process.env.OPENROUTER_API_KEY;
console.log("Key:", key ? key.substring(0, 12) : "NOT FOUND");  
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
  headers: {
  "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
  "Content-Type": "application/json",
  "HTTP-Referer": "https://lifelink-q73z.vercel.app",
  "X-Title": "LifeLink"
},
  "Content-Type": "application/json",
  "HTTP-Referer": "https://lifelink-q73z.vercel.app",
  "X-Title": "LifeLink"
},
      body: JSON.stringify({
        model: "meta-llama/llama-3.1-8b-instruct:free",
        messages: [
          {
            role: "system",
            content: "You are an emergency healthcare assistant. Give short, clear first-aid advice. Always tell the user to contact emergency services immediately for life-threatening situations."
          },
          {
            role: "user",
            content: question
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({
        reply: JSON.stringify(data)
      });
    }

    const reply = data.choices[0].message.content;

    res.status(200).json({ reply });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      reply: "Server error while contacting AI."
    });
  }
}
