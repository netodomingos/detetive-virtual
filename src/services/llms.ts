import OpenAI from "openai";
const openai = new OpenAI();

export async function llmVerify({
  transcript,
  sources
}: {
  transcript: string;
  sources: any[];
}) {
  const prompt = `
Analise o texto abaixo e verifique se o conteúdo apresentado é
coerente, factual e verificável.

Texto:
"${transcript}"

Fontes:
${sources.map(s => s.snippet).join("\n")}

Retorne JSON:
{
  "score": 0-100,
  "summary": "...",
  "verdict": "provavelmente verdadeiro | inconclusivo | provavelmente falso",
  "reasons": ["..."]
}
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }]
  });

  const content = response.choices[0]?.message?.content;
  
  if (!content) {
    throw new Error("No content in response");
  }

  return JSON.parse(content);
}
