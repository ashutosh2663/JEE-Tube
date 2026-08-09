import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is missing.");
}

const ai = new GoogleGenAI({
  apiKey,
});

export async function classifyVideo(video) {
  const prompt = `
You are JEE-Tube's educational curriculum classifier.

Your job is to analyze a YouTube video and determine exactly where it belongs
in a structured IIT-JEE learning course.

Title:
${video.title}

Channel:
${video.channelName}

Description:
${video.description || ""}

Return ONLY valid JSON in exactly this structure:

{
  "relevant": true,
  "relevance": 0.95,
  "subject": "Physics",
  "category": "Lecture",
  "chapter": "Kinematics",
  "topic": "Motion in a Straight Line",
  "series_name": null,
  "video_type": "Lecture",
  "study_role": "concept",
  "exam": "JEE Main + Advanced",
  "difficulty": "Standard",
  "is_short": false
}

Allowed study_role values:

"foundation"
"concept"
"derivation"
"example"
"problem_solving"
"jee_main"
"jee_advanced"
"pyq"
"revision"
"one_shot"
"short"

Rules:

1. relevant must be false if the video is not genuinely useful for IIT-JEE preparation.

2. subject must be exactly one of:
   Physics
   Chemistry
   Maths

3. Do not invent chapter or topic information.

4. Identify the most specific chapter and topic possible.

5. study_role must represent the educational purpose of the video.

6. If the video is primarily a YouTube Short:
   - set "is_short" to true
   - set "study_role" to "short"

7. A normal lecture teaching a new concept should normally use:
   "concept"

8. A video mainly solving questions should normally use:
   "problem_solving", "jee_main", "jee_advanced", or "pyq"
   depending on the actual content.

9. A complete chapter revision should normally use:
   "revision"

10. A complete chapter taught/revised in one video may use:
    "one_shot"

11. Do not use "one_shot" simply because the title contains the words
    "one shot". Determine what the video actually teaches.

12. Use "foundation" when the video teaches prerequisite/basic ideas.

13. Use "derivation" when deriving formulas or results is the main purpose.

14. Use "example" when the main purpose is demonstrating concepts through
    worked examples rather than a full problem-solving session.

15. Use "pyq" when the questions are specifically previous-year JEE questions.

16. Use "jee_main" when the main focus is JEE Main-level preparation.

17. Use "jee_advanced" when the main focus is JEE Advanced-level preparation.

18. relevance must be a number between 0 and 1.

19. Return JSON only.
`;

  const response = await ai.models.generateContent({
    model: "gemini-3.6-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
    },
  });

  const text = response.text?.trim();

  if (!text) {
    throw new Error("Gemini returned an empty response.");
  }

  let result;

  try {
    result = JSON.parse(text);
  } catch (error) {
    throw new Error(
      `Gemini returned invalid JSON: ${text}`
    );
  }

  return result;
}