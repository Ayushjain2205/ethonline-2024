import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export async function generatePredictions(sportType, matchDetails) {
  const prompt = `Generate 3 unique and interesting prediction market questions for a ${sportType} match/game with the following details:

${Object.entries(matchDetails)
  .map(([key, value]) => `${key}: ${value}`)
  .join("\n")}

Each question should have 2-4 possible outcomes and be relevant to the specific sport and match situation. Consider unique aspects of ${sportType} in your questions.

Format the response as a JSON array of objects, each with 'question' and 'options' fields.`;

  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const generatedQuestions = JSON.parse(
      completion.data.choices[0].message.content
    );
    return generatedQuestions;
  } catch (error) {
    console.error("Error generating predictions:", error);
    throw new Error("Failed to generate predictions");
  }
}

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const { sportType, matchDetails } = req.body;

      if (!sportType || !matchDetails) {
        return res
          .status(400)
          .json({ error: "Sport type and match details are required" });
      }

      const predictions = await generatePredictions(sportType, matchDetails);
      res.status(200).json({ predictions });
    } catch (error) {
      console.error("Error in prediction API:", error);
      res.status(500).json({ error: "Failed to generate predictions" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
