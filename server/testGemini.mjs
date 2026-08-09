import "dotenv/config";
import { classifyVideo } from "./services/gemini.mjs";

const testVideo = {
  title: "Kinematics One Shot | JEE Main & Advanced Physics",
  channelName: "Test JEE Channel",
  description:
    "Complete Kinematics revision covering motion in a straight line, graphs and important JEE problems.",
  publishedAt: new Date().toISOString(),
};

try {
  const result = await classifyVideo(testVideo);

  console.log("\nGemini classification:\n");
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  console.error("Gemini test failed:", error.message);
}