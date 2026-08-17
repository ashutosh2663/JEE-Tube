
import { createClient } from "@supabase/supabase-js";
import { classifyVideo } from "./gemini.mjs";
import { askNemotronJson } from "./nemotron.mjs";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);


// =========================================================
// CONSTANTS
// =========================================================

const ALLOWED_SUBJECTS = [
  "Physics",
  "Chemistry",
  "Maths",
];

const ALLOWED_STUDY_ROLES = [
  "foundation",
  "concept",
  "derivation",
  "example",
  "problem_solving",
  "jee_main",
  "jee_advanced",
  "pyq",
  "revision",
  "one_shot",
  "short",
];


// =========================================================
// NEMOTRON VERIFICATION
// =========================================================

async function verifyWithNemotron(
  video,
  geminiClassification
) {
  const system = `
You are JEE-Tube's second-stage educational classification verifier.

Gemini has already classified a YouTube video.

Your job is ONLY to verify the classification.

DO NOT:
- explain your reasoning
- write an analysis
- repeat the video description
- discuss possibilities
- ask questions
- produce multiple answers
- write anything outside the JSON object

Return ONLY one valid JSON object.

Keep the response concise.

You must:

1. Check whether the video is genuinely useful for IIT-JEE preparation.
2. Check the subject.
3. Check the chapter if one is identifiable.
4. Check the topic if one is identifiable.
5. Check the educational purpose.
6. Check exam level.
7. Check difficulty.
8. Check video type.
9. Check whether it is a YouTube Short.
10. Detect obvious unrelated, misleading, spam or purely promotional videos.

IMPORTANT:

A roadmap, study-plan, strategy, revision-plan or preparation video can be
useful for JEE preparation.

Do NOT reject a video merely because it is a strategy or roadmap video.

If chapter or topic cannot reasonably be determined from the available
information, keep them null.

Do not invent chapter or topic information.

Do not change a Gemini field unless there is a clear reason.

Allowed subjects:

Physics
Chemistry
Maths

Allowed study_role values:

foundation
concept
derivation
example
problem_solving
jee_main
jee_advanced
pyq
revision
one_shot
short

"strategy" is NOT a study_role.

For strategy/roadmap videos, use the closest valid study_role only when
appropriate. Do not invent new study_role values.

relevance must be a number from 0 to 1.

Required JSON structure:

{
  "approved": true,
  "relevance": 0.95,
  "corrections": false,
  "reason": "Classification is consistent.",
  "classification": {
    "relevant": true,
    "relevance": 0.95,
    "subject": "Physics",
    "category": "Strategy",
    "chapter": null,
    "topic": null,
    "series_name": null,
    "video_type": "Strategy",
    "study_role": "foundation",
    "exam": "JEE Main + Advanced",
    "difficulty": "Standard",
    "is_short": false
  }
}
`;

  const user = `
VIDEO

Title:
${video.title || ""}

Channel:
${video.channelName || ""}

Description:
${video.description || ""}

GEMINI CLASSIFICATION:

${JSON.stringify(
  geminiClassification,
  null,
  2
)}

Return ONLY the JSON object.
`;

  const result =
    await askNemotronJson({
      system,
      user,
      temperature: 0.05,
      maxTokens: 700,
    });

  if (
    !result ||
    typeof result !== "object"
  ) {
    throw new Error(
      "Nemotron returned an invalid verification object."
    );
  }

  if (
    typeof result.approved !== "boolean"
  ) {
    throw new Error(
      "Nemotron verification is missing 'approved'."
    );
  }

  if (
    !result.classification ||
    typeof result.classification !== "object"
  ) {
    throw new Error(
      "Nemotron response is missing classification."
    );
  }

  const classification =
    result.classification;

  if (
    classification.subject &&
    !ALLOWED_SUBJECTS.includes(
      classification.subject
    )
  ) {
    throw new Error(
      `Nemotron returned invalid subject: ${classification.subject}`
    );
  }

  if (
    classification.study_role &&
    !ALLOWED_STUDY_ROLES.includes(
      classification.study_role
    )
  ) {
    throw new Error(
      `Nemotron returned invalid study_role: ${classification.study_role}`
    );
  }

  return result;
}


// =========================================================
// SAFE NUMBER
// =========================================================

function safeRelevance(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return 0;
  }

  return Math.min(
    1,
    Math.max(0, number)
  );
}


// =========================================================
// BUILD DATABASE RECORD
// =========================================================

function buildVideoRecord({
  video,
  classification,
  geminiClassification,
  relevance,
  nemotronVerification,
}) {
  return {
    youtube_id:
      video.youtubeId,

    title:
      video.title,

    description:
      video.description || null,

    thumbnail:
      video.thumbnail || null,

    channel_name:
      video.channelName || null,

    channel_id:
      video.channelId || null,

    teacher:
      classification.teacher ||
      geminiClassification.teacher ||
      null,

    subject:
      classification.subject ||
      null,

    category:
      classification.category ||
      null,

    chapter:
      classification.chapter ||
      null,

    topic:
      classification.topic ||
      null,

    series_name:
      classification.series_name ||
      null,

    video_type:
      classification.video_type ||
      null,

    study_role:
      classification.study_role ||
      null,

    is_short:
      classification.is_short === true,

    exam:
      classification.exam ||
      null,

    difficulty:
      classification.difficulty ||
      null,

    sequence_order:
      Number.isInteger(
        classification.sequence_hint
      )
        ? classification.sequence_hint
        : null,

    ai_relevance:
      relevance,

    ai_classification: {
      gemini:
        geminiClassification,

      nemotron:
        nemotronVerification,
    },

    status:
      "active",

    published_at:
      video.publishedAt
        ? new Date(
            video.publishedAt
          ).toISOString()
        : null,

    updated_at:
      new Date().toISOString(),
  };
}


// =========================================================
// INSERT VIDEO
// =========================================================

async function insertVideo(record) {
  const {
    data,
    error,
  } = await supabase
    .from("videos")
    .insert(record)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}


// =========================================================
// VIDEO INJECTION
// =========================================================

export async function injectVideo(video) {

  // -------------------------------------------------------
  // 1. CHECK WHETHER VIDEO ALREADY EXISTS
  // -------------------------------------------------------

  const {
    data: existing,
    error: lookupError,
  } = await supabase
    .from("videos")
    .select("id, youtube_id")
    .eq(
      "youtube_id",
      video.youtubeId
    )
    .maybeSingle();

  if (lookupError) {
    throw lookupError;
  }

  if (existing) {
    return {
      action: "skipped",
      reason: "already_exists",
      id: existing.id,
    };
  }


  // -------------------------------------------------------
  // 2. FIRST CLASSIFICATION — GEMINI
  // -------------------------------------------------------

  let geminiClassification;

  try {
    geminiClassification =
      await classifyVideo(video);
  } catch (error) {
    console.error(
      "Gemini classification failed:",
      error
    );

    return {
      action: "rejected",
      reason: "gemini_classification_failed",
      error: error.message,
    };
  }

  const geminiRelevance =
    safeRelevance(
      geminiClassification.relevance
    );


  // -------------------------------------------------------
  // 3. GEMINI EARLY REJECTION
  // -------------------------------------------------------

  if (
    geminiClassification.relevant !== true ||
    geminiRelevance < 0.75
  ) {
    return {
      action: "rejected",
      reason: "gemini_low_relevance",
      relevance:
        geminiRelevance,
      classifier:
        "gemini",
    };
  }


  // -------------------------------------------------------
  // 4. SECOND STAGE — NEMOTRON
  // -------------------------------------------------------

  let verification = null;
  let classification =
    geminiClassification;

  let relevance =
    geminiRelevance;

  let verificationStatus =
    "pending";

  try {
    verification =
      await verifyWithNemotron(
        video,
        geminiClassification
      );

    verificationStatus =
      "verified";

    classification =
      verification.classification;

    relevance =
      safeRelevance(
        verification.relevance ??
        classification.relevance ??
        geminiRelevance
      );

  } catch (error) {

    // -----------------------------------------------------
    // IMPORTANT:
    //
    // Gemini already passed the relevance threshold.
    //
    // Nemotron failure should NOT automatically reject
    // the video.
    // -----------------------------------------------------

    console.warn(
      "Nemotron verification failed. Falling back to Gemini."
    );

    console.warn(
      error.message
    );

    verificationStatus =
      "gemini_fallback";

    classification =
      geminiClassification;

    relevance =
      geminiRelevance;

    verification = {
      status:
        "failed",

      error:
        error.message,

      fallback:
        "gemini",
    };
  }


  // -------------------------------------------------------
  // 5. FINAL RELEVANCE CHECK
  // -------------------------------------------------------

  if (
    verificationStatus ===
      "verified" &&
    (
      verification.approved !== true ||
      classification.relevant !== true ||
      relevance < 0.75
    )
  ) {
    return {
      action: "rejected",
      reason: "nemotron_rejected",
      relevance,
      gemini:
        geminiClassification,
      nemotron:
        verification,
    };
  }


  // -------------------------------------------------------
  // 6. BUILD DATABASE RECORD
  // -------------------------------------------------------

  const record =
    buildVideoRecord({
      video,

      classification,

      geminiClassification,

      relevance,

      nemotronVerification:
        verification,
    });


  // -------------------------------------------------------
  // 7. INSERT
  // -------------------------------------------------------

  let data;

  try {
    data =
      await insertVideo(
        record
      );
  } catch (error) {
    console.error(
      "Video insertion failed:",
      error
    );

    throw error;
  }


  // -------------------------------------------------------
  // 8. RETURN RESULT
  // -------------------------------------------------------

  return {
    action:
      "inserted",

    video:
      data,

    verification: {
      status:
        verificationStatus,

      geminiRelevance:
        geminiRelevance,

      nemotronRelevance:
        verificationStatus ===
        "verified"
          ? relevance
          : null,

      nemotronApproved:
        verificationStatus ===
        "verified"
          ? verification.approved
          : null,

      corrections:
        verificationStatus ===
        "verified"
          ? verification.corrections
          : false,

      reason:
        verificationStatus ===
        "verified"
          ? verification.reason
          : "Gemini classification accepted because Nemotron verification was unavailable.",

      fallback:
        verificationStatus ===
        "gemini_fallback",
    },
  };
}