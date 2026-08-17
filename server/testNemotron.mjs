import "dotenv/config";
import { askNemotron } from "./services/nemotron.mjs";

const result = await askNemotron({
  system:
    "You are the recommendation intelligence for JEE-Tube. Answer briefly.",

  user:
    "A student watched Physics Kinematics and then Motion in a Straight Line. What should they probably study next?"
});

console.log("\n=== NEMOTRON RESPONSE ===\n");
console.log(result);