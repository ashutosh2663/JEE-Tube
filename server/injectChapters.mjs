import "dotenv/config";
import { saveVideoChapters } from "./services/chapters.mjs";

try {
  const result = await saveVideoChapters(
    "zOdUhsMydtM"
  );

  console.log(
    JSON.stringify(result, null, 2)
  );
} catch (error) {
  console.error(
    "Chapter injection failed:",
    error
  );

  process.exit(1);
}