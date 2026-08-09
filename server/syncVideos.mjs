import "dotenv/config";

import { DISCOVERY_CONFIG } from "./config.mjs";
import { searchVideos } from "./services/youtube.mjs";
import { injectVideo } from "./services/videoInjector.mjs";

async function syncVideos() {
  let discovered = 0;
  let inserted = 0;
  let rejected = 0;
  let skipped = 0;
  let errors = 0;

  console.log("\n=================================");
  console.log("       JEE-TUBE VIDEO SYNC");
  console.log("=================================\n");

  for (const query of DISCOVERY_CONFIG.searchQueries) {
    console.log(`Searching: ${query}`);

    try {
      const videos = await searchVideos(
        query,
        DISCOVERY_CONFIG.maxVideosPerQuery
      );

      discovered += videos.length;

      console.log(`Found ${videos.length} candidates.`);

      for (const video of videos) {
        try {
          const result = await injectVideo(video);

          if (result.action === "inserted") {
            inserted++;
            console.log(`  + INSERTED: ${video.title}`);
          } else if (result.action === "rejected") {
            rejected++;
            console.log(`  - REJECTED: ${video.title}`);
          } else if (result.action === "skipped") {
            skipped++;
            console.log(`  = SKIPPED: ${video.title}`);
          }
        } catch (error) {
          errors++;

          console.error(
            `  ! ERROR: ${video.title}`
          );

          console.error(`    ${error.message}`);
        }
      }
    } catch (error) {
      errors++;

      console.error(`Search failed: ${query}`);
      console.error(error.message);
    }
  }

  console.log("\n=================================");
  console.log("             SUMMARY");
  console.log("=================================");

  console.log(`Discovered : ${discovered}`);
  console.log(`Inserted   : ${inserted}`);
  console.log(`Rejected   : ${rejected}`);
  console.log(`Skipped    : ${skipped}`);
  console.log(`Errors     : ${errors}`);

  console.log("=================================\n");
}

syncVideos();