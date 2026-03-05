import { NextRequest, NextResponse } from "next/server";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

export async function POST(req: NextRequest) {
  try {
    const { answers } = await req.json();

    const key = process.env.GROQ_API_KEY;

    // Debug logs — remove after confirming it works
    console.log(" GROQ_API_KEY exists:", !!key);
    console.log(" Answers received:", JSON.stringify(answers));

    if (!key) {
      console.error(" GROQ_API_KEY is not set in .env.local");
      return NextResponse.json(
        { success: false, error: "API key not configured" },
        { status: 500 }
      );
    }

    const prompt = `You are a friendly pet adoption expert. Based on the following answers from a quiz, recommend the perfect pet type and breed for this person. Be warm, specific, and encouraging. Give a 3-4 sentence recommendation that includes: (1) the ideal pet type (dog/cat/bird/fish), (2) a specific breed recommendation, (3) why it fits their lifestyle. End with one short encouraging sentence about adoption.

Quiz answers:
- Living situation: ${answers.living ?? "not provided"}
- Daily activity level: ${answers.activity ?? "not provided"}
- Hours at home per day: ${answers.hoursHome ?? "not provided"}
- Experience with pets: ${answers.experience ?? "not provided"}
- Has children at home: ${answers.children ?? "not provided"}
- Has allergies: ${answers.allergies ?? "not provided"}
- Preferred pet size: ${answers.size ?? "not provided"}
- Main reason for adopting: ${answers.reason ?? "not provided"}

Respond in 3-4 sentences only. Be direct and specific.`;

    console.log("📡 Calling Groq API...");

    const groqRes = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    console.log(" Groq response status:", groqRes.status);

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      console.error(" Groq error body:", errText);
      return NextResponse.json(
        { success: false, error: `Groq API error: ${groqRes.status}` },
        { status: 500 }
      );
    }

    const groqData = await groqRes.json();
    console.log(" Groq response received");

    const recommendation =
      groqData.choices?.[0]?.message?.content?.trim() ??
      "Based on your lifestyle, we think a friendly Labrador Retriever would be a wonderful match — they're loving, adaptable, and great with families. Don't wait too long; your perfect companion is out there waiting for you!";

    return NextResponse.json({ success: true, recommendation });

  } catch (err: unknown) {
    console.error(" Quiz route exception:", err);
    return NextResponse.json(
      { success: false, error: "Something went wrong" },
      { status: 500 }
    );
  }
}