const NVIDIA_API_URL =
  "https://integrate.api.nvidia.com/v1/chat/completions";

const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;

if (!NVIDIA_API_KEY) {
  throw new Error("NVIDIA_API_KEY is missing.");
}

const MODEL =
  "nvidia/llama-3.3-nemotron-super-49b-v1.5";


// =========================================================
// EXTRACT JSON FROM MODEL OUTPUT
// =========================================================

function extractJson(text) {
  if (!text || typeof text !== "string") {
    return null;
  }

  const cleaned = text
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  // Direct JSON
  try {
    return JSON.parse(cleaned);
  } catch {
    // Continue with extraction.
  }

  // Find the first JSON object.
  const start = cleaned.indexOf("{");

  if (start === -1) {
    return null;
  }

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < cleaned.length; i++) {
    const char = cleaned[i];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (char === "\\") {
      escaped = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      continue;
    }

    if (inString) {
      continue;
    }

    if (char === "{") {
      depth++;
    }

    if (char === "}") {
      depth--;

      if (depth === 0) {
        const candidate = cleaned.slice(start, i + 1);

        try {
          return JSON.parse(candidate);
        } catch {
          return null;
        }
      }
    }
  }

  return null;
}


// =========================================================
// GET USEFUL MODEL TEXT
// =========================================================

function getModelText(data) {
  const message =
    data?.choices?.[0]?.message;

  if (!message) {
    return null;
  }

  // Normal response.
  if (
    typeof message.content === "string" &&
    message.content.trim()
  ) {
    return message.content.trim();
  }

  // Some Nemotron responses put the useful output
  // into reasoning instead.
  if (
    typeof message.reasoning === "string" &&
    message.reasoning.trim()
  ) {
    return message.reasoning.trim();
  }

  if (
    typeof message.reasoning_content === "string" &&
    message.reasoning_content.trim()
  ) {
    return message.reasoning_content.trim();
  }

  return null;
}


// =========================================================
// NEMOTRON REQUEST
// =========================================================

export async function askNemotron({
  system,
  user,
  temperature = 0.1,
  maxTokens = 1200,
}) {
  const controller =
    new AbortController();

  const timeout = setTimeout(
    () => controller.abort(),
    45_000
  );

  try {
    const response = await fetch(
      NVIDIA_API_URL,
      {
        method: "POST",

        headers: {
          Authorization:
            `Bearer ${NVIDIA_API_KEY}`,

          "Content-Type":
            "application/json",

          Accept:
            "application/json",
        },

        body: JSON.stringify({
          model: MODEL,

          messages: [
            {
              role: "system",
              content: system,
            },
            {
              role: "user",
              content: user,
            },
          ],

          temperature,

          max_tokens:
            maxTokens,

          stream: false,
        }),

        signal:
          controller.signal,
      }
    );

    const rawText =
      await response.text();

    if (!response.ok) {
      throw new Error(
        `NVIDIA Nemotron API error (${response.status}): ${rawText}`
      );
    }

    let data;

    try {
      data =
        JSON.parse(rawText);
    } catch {
      throw new Error(
        `NVIDIA returned invalid API JSON: ${rawText}`
      );
    }

    const text =
      getModelText(data);

    if (!text) {
      throw new Error(
        `Nemotron returned no usable content. Raw response: ${rawText}`
      );
    }

    return text.trim();
  } catch (error) {
    if (
      error?.name ===
      "AbortError"
    ) {
      throw new Error(
        "Nemotron request timed out after 45 seconds."
      );
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}


// =========================================================
// JSON REQUEST
// =========================================================

export async function askNemotronJson({
  system,
  user,
  temperature = 0.1,
  maxTokens = 1600,
}) {
  const text =
    await askNemotron({
      system,
      user,
      temperature,
      maxTokens,
    });

  const result =
    extractJson(text);

  if (!result) {
    throw new Error(
      `Nemotron returned invalid JSON: ${text}`
    );
  }

  return result;
}