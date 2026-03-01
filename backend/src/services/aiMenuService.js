export const extractMenuJSON = async (text) => {
  const prompt = `STRICT RULES...`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4.1",
    messages: [{ role: "user", content: prompt }],
    temperature: 0,
  });

  return JSON.parse(completion.choices[0].message.content);
};
