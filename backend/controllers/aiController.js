const { conceptExplainPrompt, questionAnswerPrompt } = require("../utils/prompts");

// Helper to extract JSON from AI response
const extractJSON = (text) => {
    if (!text) return null;
    const cleaned = text
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();
    return JSON.parse(cleaned);
};

// Helper to call LLM (Gemini or Groq)
const callLLM = async (prompt) => {
    if (process.env.GEMINI_API_KEY) {
        const { GoogleGenAI } = require("@google/genai");
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const response = await ai.models.generateContent({
            model: "gemini-3.6-flash",
            contents: prompt,
        });
        return response.text;
    } else if (process.env.GROQ_API_KEY) {
        const Groq = require("groq-sdk");
        const ai = new Groq({ apiKey: process.env.GROQ_API_KEY });
        const completion = await ai.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" },
        });
        return completion.choices[0]?.message?.content || "";
    } else {
        throw new Error("Neither GEMINI_API_KEY nor GROQ_API_KEY is configured in .env");
    }
};

//Generate interview question and ans using Gemini / Groq
//POST api/ai/generate-questions
//Pvt access
const generateInterviewQuestions = async (req, res) => {
    try {
        const { role, experience, topicsToFocus, numberOfQuestions } = req.body;

        if (!role || !experience || !topicsToFocus || !numberOfQuestions) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const prompt = questionAnswerPrompt(role, experience, topicsToFocus, numberOfQuestions);
        const rawText = await callLLM(prompt);
        const data = extractJSON(rawText);

        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({
            message: "Failed to generate questions",
            error: err.message,
        });
    }
};

//Generate explains a interview question
//POST api/ai/generate-explanation
//Pvt access
const generateConceptExplanation = async (req, res) => {
    try {
        const { question } = req.body;

        if (!question) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const prompt = conceptExplainPrompt(question);
        const rawText = await callLLM(prompt);

        let data;
        try {
            data = extractJSON(rawText);
        } catch (parseError) {
            console.log("AI RAW RESPONSE:", rawText);
            return res.status(500).json({
                message: "Invalid JSON returned by AI",
                error: parseError.message,
            });
        }

        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({
            message: "Failed to generate explanation",
            error: err.message,
        });
    }
};

module.exports = { generateConceptExplanation, generateInterviewQuestions };