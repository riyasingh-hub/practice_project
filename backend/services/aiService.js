const axios = require("axios");
 
async function generateProjectSummary(prompt) {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
 
  if (!apiKey) {
    console.warn("OPENAI_API_KEY is not configured.");
    return "AI summary is unavailable because the API key is not configured.";
  }
 
  console.log(prompt);
 
  try {
    const response = await axios.post(
      "https://openai.generative.engine.capgemini.com/v1/chat/completions",
      {
        model: "openai.gpt-4o",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.3
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