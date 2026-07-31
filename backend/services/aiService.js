const axios = require("axios");
 
async function generateProjectSummary(prompt) {
  const apiKey = process.env.OPENAI_API_KEY?.trim();

  if (!apiKey) {
    console.warn("OPENAI_API_KEY is not configured.");
    return "AI summary is unavailable because the API key is not configured.";
  }

  const systemPrompt = `
You are an expert Project Management Office analyst and delivery governance advisor.
Produce concise, metric-driven executive reports tailored for senior project stakeholders.
Use only the provided data and avoid unnecessary API or implementation details.
`;

  console.log("AI prompt length:", prompt.length);

  try {
    const response = await axios.post(
      "https://openai.generative.engine.capgemini.com/v1/chat/completions",
      {
        model: "openai.gpt-4o",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 1200,
        temperature: 0.2,
        top_p: 1,
        frequency_penalty: 0.0,
        presence_penalty: 0.0
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        }
      }
    );

    return (
      response.data?.choices?.[0]?.message?.content ||
      "No response generated."
    );
  } catch (error) {
    console.error(
      "AI Error:",
      error.response?.data || error.message || "Unknown error"
    );

    return "AI summary is temporarily unavailable. Please try again later.";
  }
}
 
module.exports = {
  generateProjectSummary
};