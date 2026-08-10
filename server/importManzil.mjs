import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import {
  searchVideos,
  getVideoDetails,
} from "./services/youtube.mjs";
import { extractChapters } from "./services/chapters.mjs";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ============================================================
// SEARCH QUERIES
// ============================================================

const SEARCHES = [
  "Manzil JEE Maths",
  "Manzil JEE Physics",
  "Manzil JEE Chemistry",

  "Manzil JEE Mathematics",
  "Manzil JEE Physics One Shot",
  "Manzil JEE Chemistry One Shot",
  "Manzil JEE Maths One Shot",

  "Manzil Comeback JEE",
  "Manzil 2026 JEE",
  "Manzil 2025 JEE",
];

// ============================================================
// SUBJECT KEYWORDS
// IMPORTANT: TITLE IS MORE IMPORTANT THAN DESCRIPTION
// ============================================================

const SUBJECT_KEYWORDS = {
  Physics: [
    // English
    "physics",
    "kinematics",
    "motion in a straight line",
    "motion in a plane",
    "laws of motion",
    "newton",
    "work energy power",
    "work, energy and power",
    "center of mass",
    "centre of mass",
    "rotational motion",
    "gravitation",
    "mechanical properties",
    "properties of solids",
    "properties of fluids",
    "thermodynamics",
    "kinetic theory",
    "ktg",
    "oscillation",
    "oscillations",
    "waves",
    "electrostatics",
    "electric charges",
    "electric charge",
    "electric field",
    "electric potential",
    "electric dipole",
    "gauss law",
    "capacitance",
    "current electricity",
    "magnetism",
    "moving charges",
    "magnetic effects",
    "electromagnetic induction",
    "emi",
    "alternating current",
    "ray optics",
    "wave optics",
    "modern physics",
    "dual nature",
    "atoms",
    "nuclei",
    "semiconductor",
    "semiconductors",
    "units and measurements",
    "unit and measurement",

    // Hindi
    "गति",
    "गति विज्ञान",
    "समतल में गति",
    "सरल रेखा में गति",
    "बल",
    "गति के नियम",
    "कार्य ऊर्जा शक्ति",
    "गुरुत्वाकर्षण",
    "घूर्णन",
    "घूर्णीय गति",
    "द्रव",
    "ठोस",
    "ऊष्मागतिकी",
    "ऊष्मीय",
    "दोलन",
    "तरंग",
    "स्थिर विद्युत",
    "विद्युत धारा",
    "विद्युत विभव",
    "संधारित्र",
    "चुंबकत्व",
    "विद्युत चुंबकीय",
    "प्रकाशिकी",
    "आधुनिक भौतिकी",
    "अर्धचालक",
    "इकाई तथा मापन",
  ],

  Chemistry: [
    // English
    "chemistry",
    "mole concept",
    "atomic structure",
    "structure of atom",
    "periodic table",
    "periodicity",
    "chemical bonding",
    "coordination compounds",
    "d and f block",
    "d & f block",
    "d-f block",
    "thermodynamics",
    "chemical equilibrium",
    "equilibrium",
    "ionic equilibrium",
    "solutions",
    "electrochemistry",
    "chemical kinetics",
    "redox",
    "redox reaction",
    "organic chemistry",
    "goc",
    "general organic chemistry",
    "iupac",
    "iupac nomenclature",
    "isomerism",
    "hydrocarbon",
    "hydrocarbons",
    "haloalkanes",
    "haloarenes",
    "haloalkanes & haloarenes",
    "alcohols",
    "phenols",
    "ethers",
    "aldehydes",
    "ketones",
    "carboxylic acids",
    "amines",
    "p block",
    "p-block",
    "salt analysis",

    // Hindi
    "रसायन विज्ञान",
    "मोल अवधारणा",
    "परमाणु की संरचना",
    "आवर्त सारणी",
    "रासायनिक बंधन",
    "उपसहसंयोजन यौगिक",
    "समन्वय यौगिक",
    "ऊष्मागतिकी",
    "रासायनिक साम्य",
    "साम्य",
    "आयनिक साम्य",
    "विलयन",
    "वैद्युत-रसायन",
    "वैद्युत रसायन",
    "रासायनिक बलगतिकी",
    "अपचयोपचय",
    "ऑक्सीकरण",
    "अपचयन",
    "कार्बनिक रसायन",
    "हाइड्रोकार्बन",
    "समावयवता",
    "उपसहसंयोजन",
  ],

  Maths: [
    // English
    "maths",
    "mathematics",
    "basic maths",
    "basic mathematics",
    "sets",
    "relations and functions",
    "relations & functions",
    "functions",
    "trigonometry",
    "trigonometric",
    "inverse trigonometric",
    "quadratic equations",
    "sequence and series",
    "sequence & series",
    "sequences",
    "series",
    "complex numbers",
    "complex number",
    "permutations and combinations",
    "permutation and combination",
    "binomial theorem",
    "matrices",
    "determinants",
    "straight lines",
    "circle",
    "circles",
    "conic sections",
    "parabola",
    "ellipse",
    "hyperbola",
    "vectors",
    "3d geometry",
    "three dimensional geometry",
    "limits",
    "continuity",
    "differentiability",
    "method of differentiation",
    "differentiation",
    "application of derivatives",
    "integration",
    "definite integration",
    "indefinite integration",
    "differential equations",
    "probability",
    "statistics",

    // Hindi
    "गणित",
    "गणितीय",
    "समुच्चय",
    "संबंध एवं फलन",
    "संबंध और फलन",
    "फलन",
    "त्रिकोणमिति",
    "त्रिकोणमितीय",
    "प्रतिलोम त्रिकोणमितीय",
    "द्विघात समीकरण",
    "अनुक्रम व श्रेणी",
    "अनुक्रम एवं श्रेणी",
    "समिश्र संख्याएँ",
    "सम्मिश्र संख्याएँ",
    "आव्यूह",
    "सारणिक",
    "सरल रेखाएँ",
    "वृत्त",
    "परवलय",
    "दीर्घवृत्त",
    "अतिपरवलय",
    "सदिश",
    "त्रिविमीय ज्यामिति",
    "अवकलन",
    "समाकलन",
    "प्रायिकता",
    "सांख्यिकी",
  ],
};

// ============================================================
// CHAPTER -> SUBJECT MAP
// This is much safer than random keyword matching.
// ============================================================

const CHAPTERS = {
  Physics: [
    "kinematics",
    "motion in a straight line",
    "motion in a plane",
    "laws of motion",
    "newton",
    "work energy power",
    "rotational motion",
    "center of mass",
    "gravitation",
    "mechanical properties",
    "thermodynamics",
    "kinetic theory",
    "ktg",
    "oscillations",
    "waves",
    "electrostatics",
    "electric charges",
    "electric field",
    "electric potential",
    "electric dipole",
    "gauss law",
    "capacitance",
    "current electricity",
    "magnetism",
    "moving charges",
    "electromagnetic induction",
    "alternating current",
    "ray optics",
    "wave optics",
    "modern physics",
    "dual nature",
    "atoms",
    "nuclei",
    "semiconductor",
    "units and measurements",

    "गति",
    "समतल में गति",
    "गति के नियम",
    "गुरुत्वाकर्षण",
    "ऊष्मागतिकी",
    "दोलन",
    "तरंग",
    "स्थिर विद्युत",
    "विद्युत धारा",
    "विद्युत विभव",
    "संधारित्र",
    "चुंबकत्व",
    "प्रकाशिकी",
    "आधुनिक भौतिकी",
    "अर्धचालक",
    "इकाई तथा मापन",
  ],

  Chemistry: [
    "mole concept",
    "atomic structure",
    "structure of atom",
    "periodic table",
    "chemical bonding",
    "coordination compounds",
    "d and f block",
    "d & f block",
    "thermodynamics",
    "chemical equilibrium",
    "ionic equilibrium",
    "solutions",
    "electrochemistry",
    "chemical kinetics",
    "redox",
    "goc",
    "general organic chemistry",
    "iupac",
    "iupac nomenclature",
    "isomerism",
    "hydrocarbon",
    "hydrocarbons",
    "haloalkanes",
    "haloarenes",
    "alcohols",
    "phenols",
    "ethers",
    "aldehydes",
    "ketones",
    "carboxylic acids",
    "amines",
    "p block",
    "salt analysis",

    "मोल अवधारणा",
    "परमाणु की संरचना",
    "आवर्त सारणी",
    "रासायनिक बंधन",
    "ऊष्मागतिकी",
    "रासायनिक साम्य",
    "आयनिक साम्य",
    "विलयन",
    "वैद्युत-रसायन",
    "रासायनिक बलगतिकी",
    "हाइड्रोकार्बन",
    "समावयवता",
  ],

  Maths: [
    "basic maths",
    "basic mathematics",
    "sets",
    "relations and functions",
    "functions",
    "trigonometry",
    "trigonometric",
    "inverse trigonometric",
    "quadratic equations",
    "sequence and series",
    "sequence & series",
    "sequences",
    "complex numbers",
    "permutations and combinations",
    "binomial theorem",
    "matrices",
    "determinants",
    "straight lines",
    "circle",
    "circles",
    "conic sections",
    "parabola",
    "ellipse",
    "hyperbola",
    "vectors",
    "3d geometry",
    "limits",
    "continuity",
    "differentiability",
    "method of differentiation",
    "differentiation",
    "application of derivatives",
    "integration",
    "definite integration",
    "indefinite integration",
    "differential equations",
    "probability",
    "statistics",

    "गणित",
    "समुच्चय",
    "संबंध एवं फलन",
    "फलन",
    "त्रिकोणमिति",
    "प्रतिलोम त्रिकोणमितीय",
    "द्विघात समीकरण",
    "अनुक्रम व श्रेणी",
    "समिश्र संख्याएँ",
    "सम्मिश्र संख्याएँ",
    "आव्यूह",
    "सारणिक",
    "सरल रेखाएँ",
    "वृत्त",
    "परवलय",
    "सदिश",
    "अवकलन",
    "समाकलन",
    "प्रायिकता",
    "सांख्यिकी",
  ],
};

// ============================================================
// WORD NORMALIZATION
// ============================================================

function normalize(text = "") {
  return text
    .toLowerCase()
    .replace(/[|•🔥🤯😱🤔✌️🎯🧪😈]/g, " ")
    .replace(/[–—]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

// ============================================================
// MANZIL CHECK
// ============================================================

function isManzil(video) {
  const text = normalize(
    `${video.title || ""} ${video.description || ""}`
  );

  return (
    text.includes("manzil") ||
    text.includes("manzil comeback")
  );
}

// ============================================================
// BAD / NON-LECTURE CONTENT
// ============================================================

const FILTER_KEYWORDS = [
  "is manzil enough",
  "is manzil 2025 enough",
  "is manzil 2026 enough",
  "manzil enough",
  "manzil review",
  "manzil reality",
  "manzil strategy",
  "manzil roadmap",
  "manzil planner",
  "day wise planner",
  "how to manage manzil",
  "manzil series se revision",
  "manzil series from pw enough",
  "manzil batch enough",
  "class 11th ke bachhe",
  "class 11th",
  "launching manzil",
  "launching manzil batch",
  "manzil is back",
  "manzil comeback for jee",
  "best resource",
  "searching best resource",
  "all the best",
  "mili iit",
  "air ",
  "journey",
  "safar",
  "2 months strategy",
  "60 days strategy",
  "45 days",
  "30 chapters",
  "99 percentile",
  "200+ marks",
  "most important chapters",
];

function isFilteredContent(title) {
  const text = normalize(title);

  return FILTER_KEYWORDS.some((keyword) =>
    text.includes(keyword)
  );
}

// ============================================================
// EXPLICIT SUBJECT DETECTION
// TITLE ONLY
// ============================================================

function detectExplicitSubject(title) {
  const text = normalize(title);

  const scores = {
    Physics: 0,
    Chemistry: 0,
    Maths: 0,
  };

  for (const [subject, keywords] of Object.entries(
    SUBJECT_KEYWORDS
  )) {
    for (const keyword of keywords) {
      const k = normalize(keyword);

      if (text.includes(k)) {
        // Long / specific keywords deserve more weight.
        scores[subject] += k.length >= 10 ? 5 : 3;
      }
    }
  }

  const sorted = Object.entries(scores).sort(
    (a, b) => b[1] - a[1]
  );

  if (sorted[0][1] === 0) {
    return null;
  }

  // Don't classify ambiguous titles.
  if (
    sorted[0][1] === sorted[1][1] &&
    sorted[0][1] < 8
  ) {
    return null;
  }

  return {
    subject: sorted[0][0],
    score: sorted[0][1],
    reason: "explicit subject/chapter keyword",
  };
}

// ============================================================
// CHAPTER DETECTION
// TITLE FIRST
// ============================================================

function detectChapter(title) {
  const text = normalize(title);

  const matches = [];

  for (const [subject, chapters] of Object.entries(
    CHAPTERS
  )) {
    for (const chapter of chapters) {
      const c = normalize(chapter);

      if (text.includes(c)) {
        matches.push({
          subject,
          chapter,
          score: c.length,
        });
      }
    }
  }

  if (matches.length === 0) {
    return null;
  }

  // Most specific chapter wins.
  matches.sort((a, b) => b.score - a.score);

  return matches[0];
}

// ============================================================
// SMART SUBJECT DETECTOR
// ============================================================

function detectSubject(title, description = "") {
  const normalizedTitle = normalize(title);

  // ----------------------------------------------------------
  // 1. Explicit subject keyword in TITLE
  // ----------------------------------------------------------

  const explicit = detectExplicitSubject(title);

  if (explicit) {
    return {
      subject: explicit.subject,
      reason: explicit.reason,
      confidence: 0.98,
    };
  }

  // ----------------------------------------------------------
  // 2. Chapter mapping from TITLE
  // ----------------------------------------------------------

  const chapter = detectChapter(title);

  if (chapter) {
    return {
      subject: chapter.subject,
      reason: `chapter: ${chapter.chapter}`,
      confidence: 0.96,
    };
  }

  // ----------------------------------------------------------
  // 3. Description fallback
  // VERY LOW PRIORITY
  // ----------------------------------------------------------

  const desc = normalize(description);

  const descScores = {
    Physics: 0,
    Chemistry: 0,
    Maths: 0,
  };

  for (const [subject, keywords] of Object.entries(
    SUBJECT_KEYWORDS
  )) {
    for (const keyword of keywords) {
      const k = normalize(keyword);

      if (desc.includes(k)) {
        descScores[subject] += 1;
      }
    }
  }

  const sorted = Object.entries(descScores).sort(
    (a, b) => b[1] - a[1]
  );

  if (
    sorted[0][1] >= 4 &&
    sorted[0][1] > sorted[1][1] * 1.5
  ) {
    return {
      subject: sorted[0][0],
      reason: "description fallback",
      confidence: 0.72,
    };
  }

  return null;
}

// ============================================================
// CATEGORY
// ============================================================

function detectCategory(title) {
  const text = normalize(title);

  if (
    text.includes("one shot") ||
    text.includes("1 shot") ||
    text.includes("one-shot")
  ) {
    return "One Shot";
  }

  if (
    text.includes("pyq") ||
    text.includes("pyq's") ||
    text.includes("practice series")
  ) {
    return "PYQ";
  }

  if (
    text.includes("revision") ||
    text.includes("revision series")
  ) {
    return "Revision";
  }

  return "Lecture";
}

// ============================================================
// VIDEO TYPE
// ============================================================

function detectVideoType(title) {
  const text = normalize(title);

  if (
    text.includes("pyq") ||
    text.includes("practice series")
  ) {
    return "PYQ";
  }

  if (
    text.includes("one shot") ||
    text.includes("1 shot")
  ) {
    return "One Shot";
  }

  if (text.includes("revision")) {
    return "Revision";
  }

  return "Lecture";
}

// ============================================================
// CHAPTER CLEANUP
// ============================================================

function getChapter(title, extractedChapters) {
  const detected = detectChapter(title);

  if (detected) {
    return detected.chapter;
  }

  if (extractedChapters?.length > 0) {
    return extractedChapters[0].title;
  }

  return null;
}

// ============================================================
// SERIES
// ============================================================

function detectSeries(title) {
  const text = normalize(title);

  if (text.includes("manzil comeback")) {
    return "Manzil Comeback";
  }

  if (text.includes("manzil 2026")) {
    return "Manzil 2026";
  }

  if (text.includes("manzil 2025")) {
    return "Manzil 2025";
  }

  if (text.includes("manzil 2024")) {
    return "Manzil 2024";
  }

  return "Manzil";
}

// ============================================================
// IMPORT
// ============================================================

async function importVideo(video, number) {
  const details = await getVideoDetails(
    video.youtubeId
  );

  const title = details.title || "";
  const description = details.description || "";

  // ----------------------------------------------------------
  // Filter irrelevant videos
  // ----------------------------------------------------------

  if (isFilteredContent(title)) {
    console.log(
      `[${number}] SKIP - filtered: ${title}`
    );

    return {
      action: "filtered",
    };
  }

  // ----------------------------------------------------------
  // Detect subject
  // ----------------------------------------------------------

  const classification = detectSubject(
    title,
    description
  );

  if (!classification) {
    console.log(
      `[${number}] SKIP - subject unknown: ${title}`
    );

    return {
      action: "unknown_subject",
    };
  }

  const subject = classification.subject;

  // ----------------------------------------------------------
  // Chapters
  // ----------------------------------------------------------

  const chapters = extractChapters(description);

  const chapter = getChapter(
    title,
    chapters
  );

  // ----------------------------------------------------------
  // Category
  // ----------------------------------------------------------

  const category = detectCategory(title);

  const videoType = detectVideoType(title);

  // ----------------------------------------------------------
  // Record
  // ----------------------------------------------------------

  const record = {
    youtube_id: details.youtubeId,

    title,

    description,

    thumbnail:
      details.thumbnail || null,

    subject,

    category,

    chapter,

    topic: chapter,

    series_name: detectSeries(title),

    video_type: videoType,

    study_role:
      category === "One Shot"
        ? "one_shot"
        : category === "PYQ"
          ? "pyq"
          : category === "Revision"
            ? "revision"
            : "lecture",

    exam: "JEE Main + Advanced",

    difficulty: "Standard",

    sequence_order: 0,

    ai_relevance: classification.confidence,

    ai_classification: {
      source: "rule_based_manzil_importer",
      subject,
      category,
      chapter,
      confidence: classification.confidence,
      reason: classification.reason,
      chapterCount: chapters.length,
    },

    chapters,

    status: "active",

    updated_at:
      new Date().toISOString(),
  };

  // ----------------------------------------------------------
  // UPSERT
  // ----------------------------------------------------------

  const { error } = await supabase
    .from("videos")
    .upsert(record, {
      onConflict: "youtube_id",
    });

  if (error) {
    console.error(
      `[${number}] FAILED: ${title}`
    );

    console.error(error.message);

    return {
      action: "failed",
    };
  }

  console.log(
    `[${number}] ✓ ${subject} | ${title}`
  );

  console.log(
    `      └─ ${classification.reason}`
  );

  if (chapter) {
    console.log(
      `      └─ chapter: ${chapter}`
    );
  }

  return {
    action: "inserted",
  };
}

// ============================================================
// DISCOVERY
// ============================================================

async function discoverVideos() {
  const unique = new Map();

  for (const query of SEARCHES) {
    console.log(`\nSearching: ${query}`);

    const videos = await searchVideos(
      query,
      50
    );

    for (const video of videos) {
      if (!isManzil(video)) {
        continue;
      }

      if (!unique.has(video.youtubeId)) {
        unique.set(
          video.youtubeId,
          video
        );
      }
    }
  }

  return [...unique.values()];
}

// ============================================================
// MAIN
// ============================================================

async function main() {
  console.log("");
  console.log("==============================================");
  console.log("       JEE-TUBE SMART MANZIL IMPORTER");
  console.log("==============================================");

  if (!process.env.YOUTUBE_API_KEY) {
    throw new Error(
      "YOUTUBE_API_KEY is missing from .env"
    );
  }

  if (!process.env.SUPABASE_URL) {
    throw new Error(
      "SUPABASE_URL is missing from .env"
    );
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is missing from .env"
    );
  }

  console.log(
    "\nClassification mode: RULE-BASED"
  );

  console.log(
    "Gemini: DISABLED"
  );

  console.log(
    "\nDiscovering Manzil videos..."
  );

  const videos =
    await discoverVideos();

  console.log(
    `\nDiscovered: ${videos.length}`
  );

  if (videos.length === 0) {
    console.log(
      "No Manzil videos found."
    );

    return;
  }

  console.log(
    "\nImporting into Supabase...\n"
  );

  let processed = 0;
  let inserted = 0;
  let filtered = 0;
  let unknown = 0;
  let failed = 0;

  for (const video of videos) {
    processed++;

    try {
      const result =
        await importVideo(
          video,
          processed
        );

      if (result.action === "inserted") {
        inserted++;
      }

      if (result.action === "filtered") {
        filtered++;
      }

      if (
        result.action ===
        "unknown_subject"
      ) {
        unknown++;
      }

      if (result.action === "failed") {
        failed++;
      }
    } catch (error) {
      failed++;

      console.error(
        `[${processed}] ERROR: ${error.message}`
      );
    }
  }

  console.log("");
  console.log(
    "=============================================="
  );
  console.log(
    "          MANZIL IMPORT COMPLETE"
  );
  console.log(
    "=============================================="
  );

  console.log(
    `Discovered : ${videos.length}`
  );

  console.log(
    `Processed  : ${processed}`
  );

  console.log(
    `Imported   : ${inserted}`
  );

  console.log(
    `Filtered   : ${filtered}`
  );

  console.log(
    `Unknown    : ${unknown}`
  );

  console.log(
    `Failed     : ${failed}`
  );

  console.log(
    "Gemini     : NOT USED"
  );

  console.log(
    "=============================================="
  );
}

main().catch((error) => {
  console.error(
    "\nIMPORT FAILED:"
  );

  console.error(error);

  process.exit(1);
});