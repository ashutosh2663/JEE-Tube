import express from "express";
import { getRecommendations }
from "../services/recommendations.mjs";

const router = express.Router();

router.get("/:userId", async (req, res) => {

  try {

    const videos =
      await getRecommendations(
        req.params.userId
      );

    res.json(videos);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: err.message
    });
  }
});

export default router;