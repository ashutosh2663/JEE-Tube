import "dotenv/config";

import { injectYoutubeUrl } from "./urlInjector.mjs";

const url = process.argv[2];

if (!url) {
  console.error(
    'Usage: node .\\server\\testUrlInjector.mjs "<youtube-url>"'
  );

  process.exit(1);
}

try {
  const result = await injectYoutubeUrl(url);

  console.log("\nFINAL RESULT:");
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  console.error("\nURL INJECTOR TEST FAILED:");
  console.error(error);
}